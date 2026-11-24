#!/usr/bin/env node
/**
 * check-ui-slop.mjs
 * 
 * Tier 2 Mechanical Scanner: UI Slop, Developer Jargon & Mock Button Purge.
 * Enforces Invariant 19 and remediates BUG-009, BUG-021.
 * 
 * Scans production frontend templates for:
 * 1. Developer test buttons and labels ('Test Discord', 'Test Shader', 'Dump State', 'Mock Render').
 * 2. Raw diagnostic leaks in user layouts ('localhost:\d+', '127.0.0.1', 'Node v\d+', 'x64', 'arm64').
 * 3. Superfluous mock expand buttons simulating text overflow instead of CSS line clamping.
 */

import fs from 'fs';
import path from 'path';

const FORBIDDEN_JARGON_PATTERNS = [
  { pattern: /\b(test\s*render|dump\s*state|debug\s*mode|temp\s*button|dev\s*only|mock\s*button|test\s*discord|test\s*shader)\b/i, name: 'Developer Test Button / Jargon' },
  { pattern: /\b(localhost:\d+|127\.0\.0\.1|Node\s+v\d+|\bx64\b|\barm64\b|TypeError:\s*|Unhandled\s+Promise)\b/i, name: 'Raw Diagnostic / Environment Leak' },
  { pattern: /<button[^>]*>\s*(?:Show\s*More|Expand\s*Text|Read\s*Full)\s*<\/button>/i, name: 'Dummy Text Expand Button (Use CSS line-clamp-2 / truncate instead)' }
];

function collectFiles(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '__tests__' && file !== 'tests' && file !== 'smoke') {
        results = results.concat(collectFiles(fullPath, extensions));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        // Exclude test spec files
        if (!file.includes('.test.') && !file.includes('.spec.') && !file.includes('smoke')) {
          results.push(fullPath);
        }
      }
    }
  }
  return results;
}

const targetDirs = ['src', 'app', 'pages', 'components'].filter(d => fs.existsSync(d));
if (targetDirs.length === 0) {
  console.log('[CHECK-UI-SLOP] [OK] No frontend UI directories detected (src/app/pages). Passing.');
  process.exit(0);
}

let files = [];
for (const dir of targetDirs) {
  files = files.concat(collectFiles(dir, ['.tsx', '.jsx', '.html', '.vue', '.svelte']));
}

if (files.length === 0) {
  console.log('[CHECK-UI-SLOP] [OK] Zero UI template files found in frontend directories. Passing.');
  process.exit(0);
}

let violations = 0;
console.log(`[CHECK-UI-SLOP] Scanning ${files.length} UI file(s) for developer jargon, debug buttons, and diagnostic leaks...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Ignore comment lines
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    for (const { pattern, name } of FORBIDDEN_JARGON_PATTERNS) {
      if (pattern.test(line)) {
        console.error(`  [VIOLATION] ${file}:${idx + 1}`);
        console.error(`    -> Rule: ${name}`);
        console.error(`    -> Text: "${trimmed.substring(0, 100)}"`);
        violations++;
      }
    }
  });
}

if (violations > 0) {
  console.error(`\n[CHECK-UI-SLOP] [FAILURE] Detected ${violations} UI jargon / debug violation(s).`);
  console.error('All developer buttons and debug strings MUST be removed from production layouts.');
  process.exit(1);
}

console.log(`[CHECK-UI-SLOP] [SUCCESS] Clean: Zero developer jargon or diagnostic leaks detected.`);
process.exit(0);
