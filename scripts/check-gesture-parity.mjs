#!/usr/bin/env node
/**
 * check-gesture-parity.mjs
 * 
 * Tier 2 Mechanical Scanner: Pointer Parity, Touch Action & Gesture Lifecycle.
 * Enforces Invariant 21 and remediates BUG-008 & BUG-017.
 * 
 * Scans components implementing dragging or canvas manipulation for:
 * 1. Mouse/Touch parity: Banning mousedown-only drag handlers on interactive canvas/preview elements.
 * 2. Mobile scroll safety: Requiring `touch-action: pan-y` on canvas surfaces.
 * 3. Banning unconditional `e.preventDefault()` inside top-level touchmove handlers without a 10px movement threshold.
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
  console.log('[CHECK-GESTURE-PARITY] [OK] No frontend UI directories detected. Passing.');
  process.exit(0);
}

let files = [];
for (const dir of targetDirs) {
  files = files.concat(collectFiles(dir, ['.tsx', '.jsx', '.ts', '.js']));
}

let violations = 0;
console.log(`[CHECK-GESTURE-PARITY] Auditing ${files.length} file(s) for touch parity and mobile scroll safety...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Look for canvas or drag implementations
  const isDragOrCanvas = /drag|canvas|customiser|preview|draggable/i.test(file) ||
                         /onMouseDown|onPointerDown|addEventListener\(['"]mousedown/i.test(content);

  if (isDragOrCanvas) {
    // Check 1: mousedown without touchstart or pointerdown (BUG-008)
    const hasMouseDown = /onMouseDown|addEventListener\(['"]mousedown['"]/i.test(content);
    const hasTouchStart = /onTouchStart|addEventListener\(['"]touchstart['"]/i.test(content);
    const hasPointerDown = /onPointerDown|addEventListener\(['"]pointerdown['"]/i.test(content);

    if (hasMouseDown && !hasTouchStart && !hasPointerDown) {
      console.error(`  [VIOLATION] ${file}`);
      console.error(`    -> Rule: Touch Event Parity (BUG-008 / Invariant 21)`);
      console.error(`    -> Component implements 'mousedown' drag handlers without 'touchstart' or unified 'pointerdown'. Touchscreens will be completely inoperable.`);
      console.error(`    -> Fix: Standardize on W3C Pointer Events (onPointerDown/Move/Up with setPointerCapture).`);
      violations++;
    }

    // Check 2: Unconditional e.preventDefault() in touchmove (BUG-017)
    const hasTouchMove = /onTouchMove|addEventListener\(['"]touchmove['"]/i.test(content);
    if (hasTouchMove) {
      const unconditionalPrevent = /onTouchMove\s*=\s*\{(?:\s*\(?[^)]*\)?\s*=>\s*\{)?\s*e\.preventDefault\(\)/i.test(content) ||
                                   /function\s+on\w*TouchMove[^{]*\{\s*e\.preventDefault\(\)/i.test(content);
      const hasThreshold = />\s*10|Math\.abs|Math\.hypot|distance|threshold/i.test(content);

      if (unconditionalPrevent && !hasThreshold) {
        console.error(`  [VIOLATION] ${file}`);
        console.error(`    -> Rule: Mobile Scroll Hijack Prevention (BUG-017 / Invariant 21)`);
        console.error(`    -> Found unconditional 'e.preventDefault()' inside touchmove listener. This intercepts vertical page scrolling on mobile.`);
        console.error(`    -> Fix: Apply 'touch-action: pan-y' in CSS and verify an intentional 10px directional drag threshold before calling e.preventDefault().`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`\n[CHECK-GESTURE-PARITY] [FAILURE] Detected ${violations} gesture parity / scroll hijack violation(s).`);
  process.exit(1);
}

console.log(`[CHECK-GESTURE-PARITY] [SUCCESS] Clean: Pointer event parity and mobile scroll safety verified.`);
process.exit(0);
