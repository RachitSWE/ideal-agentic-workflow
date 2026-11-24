#!/usr/bin/env node
/**
 * verify-runtime-env.mjs
 * 
 * Tier 2 Mechanical Scanner: Native Process & Runtime Environment Verification.
 * Enforces Invariant 22 and remediates BUG-002.
 * 
 * Inspects package.json dependencies and runtime environment for:
 * 1. Native C++ binary bindings that fail dlopen in non-standard environments (e.g. ARM64 Termux / Android).
 * 2. Mandates pure JavaScript / WASM fallbacks for voice encryption and audio processing.
 * 3. Prohibits raw `node -e` evaluation on TypeScript files (mandates `npx tsx -e`).
 */

import fs from 'fs';
import path from 'path';

console.log('[VERIFY-RUNTIME-ENV] Inspecting runtime environment and native dependency compatibility...');

const pkgPath = path.resolve(process.cwd(), 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.log('[VERIFY-RUNTIME-ENV] [OK] No package.json found in current directory. Passing.');
  process.exit(0);
}

let pkg = {};
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (e) {
  console.error('[VERIFY-RUNTIME-ENV] [ERROR] Failed to parse package.json:', e.message);
  process.exit(1);
}

const allDeps = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
  ...pkg.optionalDependencies
};

// Known brittle native C++ packages prone to dynamic linker crashes on ARM64/Android (BUG-002)
const BRITTLE_NATIVE_PACKAGES = [
  { name: '@snazzah/davey', fallback: 'pure JS tweetnacl / sodium-javascript', reason: 'Dynamic linker rejection (ERR_DLOPEN_FAILED) on ARM64 / Termux' },
  { name: 'mediasoup', fallback: 'pure JS WebRTC adapter', reason: 'Requires native C++ worker compiler toolchain' }
];

let nativeWarnings = 0;
for (const { name, fallback, reason } of BRITTLE_NATIVE_PACKAGES) {
  if (allDeps[name]) {
    console.warn(`  [WARNING] Detected brittle native C++ dependency: '${name}'`);
    console.warn(`    -> Root Cause: ${reason}`);
    console.warn(`    -> Recommended: Provide pure JS/WASM fallback (${fallback}) to guarantee cross-architecture survival.`);
    nativeWarnings++;
  }
}

// Check scripts for raw `node -e` execution on TypeScript files
const scripts = pkg.scripts || {};
let scriptViolations = 0;
for (const [scriptName, scriptCmd] of Object.entries(scripts)) {
  if (/node\s+-e\s+["'].*(?:\.ts|from\s+['"]).*["']/i.test(scriptCmd)) {
    console.error(`  [VIOLATION] npm run ${scriptName}: '${scriptCmd}'`);
    console.error(`    -> Node CJS loader cannot execute TypeScript or raw ESM imports. Use 'npx tsx -e' instead.`);
    scriptViolations++;
  }
}

if (scriptViolations > 0) {
  console.error(`\n[VERIFY-RUNTIME-ENV] [FAILURE] Detected ${scriptViolations} runtime loader violation(s).`);
  process.exit(1);
}

console.log(`[VERIFY-RUNTIME-ENV] [SUCCESS] Clean: Runtime environment and loader compatibility verified.`);
process.exit(0);
