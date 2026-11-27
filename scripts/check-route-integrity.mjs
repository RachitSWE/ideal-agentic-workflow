#!/usr/bin/env node
/**
 * check-route-integrity.mjs
 *
 * Tier 2 Mechanical Scanner: Route Integrity & Asset Sandboxing.
 *
 * Scans production frontend/API files for:
 * 1. Un-sandboxed host/device filesystem paths ('/storage/emulated/0/...', 'file:///', 'C:\Users\...') in client/web sources.
 * 2. Optional domain profile checks (--profile discord-bot-customizer): Customiser navigation loops to '/plugins'.
 */

import fs from 'fs';
import path from 'path';

const profileArgIdx = process.argv.indexOf('--profile');
const domainProfile =
  (profileArgIdx !== -1 ? process.argv[profileArgIdx + 1] : '') ||
  process.env.IAW_DOMAIN_PROFILE ||
  '';
const isDiscordCustomizerProfile = domainProfile === 'discord-bot-customizer';

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
  console.log('[CHECK-ROUTE-INTEGRITY] [OK] No frontend UI directories detected. Passing.');
  process.exit(0);
}

let files = [];
for (const dir of targetDirs) {
  files = files.concat(collectFiles(dir, ['.tsx', '.jsx', '.ts', '.js']));
}

let violations = 0;
console.log(`[CHECK-ROUTE-INTEGRITY] Auditing ${files.length} file(s) for route integrity and asset sandboxing...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check 1: Un-sandboxed host/device paths (universal web asset sandboxing)
    if (/(?:\/storage\/emulated\/0|\/sdcard\/|file:\/\/\/|C:\\Users)/i.test(line)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        console.error(`  [VIOLATION] ${file}:${idx + 1}`);
        console.error(`    -> Rule: Web Asset Sandboxing`);
        console.error(`    -> Found raw host device path '${trimmed}'. Browser security blocks local filesystem paths.`);
        console.error(
          isDiscordCustomizerProfile
            ? `    -> Fix: Serve web assets via '/api/welcomer/asset?name=...' or bundled public web paths.`
            : `    -> Fix: Serve assets via canonical public routes or storage URLs, never raw device paths.`
        );
        violations++;
      }
    }

    // Check 2 (opt-in domain profile): Customiser buttons looping back to /plugins
    if (
      isDiscordCustomizerProfile &&
      /btn-customis|btn-customize|Customise|Customize/i.test(line) &&
      /href=["']\/plugins["']/i.test(line)
    ) {
      console.error(`  [VIOLATION] ${file}:${idx + 1}`);
      console.error(`    -> Rule: Navigation Deep-Link Integrity (discord-bot-customizer profile)`);
      console.error(`    -> Customiser button points to '/plugins', looping back to the catalog root.`);
      console.error(`    -> Fix: Deep-link directly to dedicated modal or route (e.g. '/customiser/[plugin]').`);
      violations++;
    }
  });
}

if (violations > 0) {
  console.error(`\n[CHECK-ROUTE-INTEGRITY] [FAILURE] Detected ${violations} route integrity / asset sandboxing violation(s).`);
  process.exit(1);
}

console.log(`[CHECK-ROUTE-INTEGRITY] [SUCCESS] Clean: Route integrity, deep-links, and asset sandboxing verified.`);
process.exit(0);
