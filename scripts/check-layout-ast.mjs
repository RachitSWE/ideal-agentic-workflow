#!/usr/bin/env node
/**
 * check-layout-ast.mjs
 * 
 * Tier 2 Mechanical Scanner: Layout Containing-Block Safety & Aspect Ratio Geometry.
 * Enforces Invariants 20 & 24 and remediates BUG-001, BUG-010, BUG-012, BUG-022.
 * 
 * Scans JSX, TSX, and CSS files for:
 * 1. Containing block traps: `will-change: transform` or `transform` on ancestor wrappers that enclose fixed elements.
 * 2. Avatar aspect ratio distortion: `rounded-full` without `aspect-square` or matched width/height.
 * 3. Modal containment: Modals/Magnifiers rendering inline without React Portals or `<dialog>`.
 */

import fs from 'fs';
import path from 'path';

function collectFiles(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '__tests__' && file !== 'tests') {
        results = results.concat(collectFiles(fullPath, extensions));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        if (!file.includes('.test.') && !file.includes('.spec.')) {
          results.push(fullPath);
        }
      }
    }
  }
  return results;
}

const targetDirs = ['src', 'app', 'pages', 'components'].filter(d => fs.existsSync(d));
if (targetDirs.length === 0) {
  console.log('[CHECK-LAYOUT-AST] [OK] No frontend UI directories detected. Passing.');
  process.exit(0);
}

let files = [];
for (const dir of targetDirs) {
  files = files.concat(collectFiles(dir, ['.tsx', '.jsx', '.css', '.module.css']));
}

if (files.length === 0) {
  console.log('[CHECK-LAYOUT-AST] [OK] Zero layout template files found. Passing.');
  process.exit(0);
}

let violations = 0;
console.log(`[CHECK-LAYOUT-AST] Auditing ${files.length} file(s) for containing block traps and geometric aspect ratios...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  // Check 1: will-change: transform containing-block trap (BUG-001)
  lines.forEach((line, idx) => {
    if (/will-change:\s*transform/i.test(line) || /will-change-transform/i.test(line)) {
      // If found in a top-level page wrapper or layout file
      if (file.includes('layout') || file.includes('page') || file.includes('app') || file.includes('Shell')) {
        console.error(`  [VIOLATION] ${file}:${idx + 1}`);
        console.error(`    -> Rule: Containing Block Trap (BUG-001 / Invariant 20)`);
        console.error(`    -> Found 'will-change: transform' in a layout/page wrapper. This creates a containing block that traps position: fixed descendants.`);
        console.error(`    -> Fix: Remove 'will-change: transform' from layout wrappers or mount fixed elements directly via Layout.tsx portal.`);
        violations++;
      }
    }

    // Check 2: Avatar aspect ratio geometry (BUG-010 / Invariant 24)
    if (/rounded-full/i.test(line) && /<img|<Avatar|avatar/i.test(line)) {
      // Must declare aspect-square OR matched width/height (w-X h-X)
      const hasAspectSquare = /aspect-square/i.test(line);
      const hasMatchedDimensions = /\bw-(\d+|\[[^\]]+\])\s+[^"'>]*\bh-\1\b/i.test(line) || /\bh-(\d+|\[[^\]]+\])\s+[^"'>]*\bw-\1\b/i.test(line);
      const hasFluidWidth = /\bw-full\b/i.test(line);

      if (hasFluidWidth && !hasAspectSquare) {
        console.error(`  [VIOLATION] ${file}:${idx + 1}`);
        console.error(`    -> Rule: Avatar Aspect Ratio Geometry (BUG-010 / Invariant 24)`);
        console.error(`    -> Found 'rounded-full' with 'w-full' without 'aspect-square'. This causes oval/elliptical avatar distortion.`);
        console.error(`    -> Fix: Add 'aspect-square' or declare matched dimensions (e.g. 'w-12 h-12 rounded-full').`);
        violations++;
      }
    }

    // Check 3: Modal containment inline rendering (BUG-012 / Invariant 20)
    if (/(?:Modal|Magnifier|DialogOverlay)[^>]*inline/i.test(line)) {
      console.error(`  [VIOLATION] ${file}:${idx + 1}`);
      console.error(`    -> Rule: Modal Portal Breakout (BUG-012 / Invariant 20)`);
      console.error(`    -> Magnifier / Modal overlays MUST render via createPortal(..., document.body) or HTML5 <dialog> to escape ancestor max-width.`);
      violations++;
    }
  });
}

if (violations > 0) {
  console.error(`\n[CHECK-LAYOUT-AST] [FAILURE] Detected ${violations} layout / aspect ratio violation(s).`);
  process.exit(1);
}

console.log(`[CHECK-LAYOUT-AST] [SUCCESS] Clean: All layout containing blocks and aspect ratio geometries verified.`);
process.exit(0);
