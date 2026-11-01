/**
 * pre-tool-use.js
 * 
 * PreToolUse lifecycle hook for ideal-agentic-workflow plugin.
 * Reads JSON payload from stdin, enforces safety gates, and outputs JSON on stdout.
 */

const fs = require('fs');

let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch (e) {
  // If reading stdin fails, fallback to empty
}

let input = {};
try {
  if (raw && raw.trim()) {
    input = JSON.parse(raw);
  }
} catch (e) {
  // Failed to parse JSON
}

const toolCall = input.toolCall || {};
const name = toolCall.name || '';
const args = toolCall.args || {};

let decision = 'allow';
let reason = '';

// Safety Gate: Block blind bulk staging (AP-005)
// Mode A (Surgical): per-file staging (~50-150 LOC).
// Mode B (Scaffold): directory-scoped staging and -Scaffold / --scaffold flags are permitted for >= 15 cohesive files.
// Blind bulk staging (git add . or git add -A / git add --all without targeted directory path) is strictly prohibited.
if (name === 'run_command' && typeof args.CommandLine === 'string') {
  const cmd = args.CommandLine;
  const isBlindBulkAdd = /git\s+add\s+(\.|\-A|\-\-all)\s*$/i.test(cmd.trim()) ||
                         /git\s+add\s+(\.|\-A|\-\-all)\s+(&&|;|\|)/i.test(cmd);
  if (isBlindBulkAdd && !/(\-Scaffold|\-\-scaffold)/i.test(cmd)) {
    decision = 'deny';
    reason = '[SAFETY GATE] Blind bulk staging (`git add .` or `git add -A`) without targeted scope is strictly prohibited by AP-005. Use Mode A (surgical per-file) or Mode B (-Scaffold with targeted directory).';
  }
}

const response = { decision };
if (reason) {
  response.reason = reason;
}

process.stdout.write(JSON.stringify(response));
