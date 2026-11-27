import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '../..');

test('Task 3: hooks.json defines SessionStart only with zero PreToolUse blockers', () => {
  const hooksPath = path.join(pluginRoot, 'hooks.json');
  assert.ok(fs.existsSync(hooksPath), 'hooks.json must exist at plugin root');
  const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

  const entries = Object.entries(hooks);
  assert.ok(entries.length >= 1, 'hooks.json must define at least one hook entry');

  for (const [name, config] of entries) {
    assert.equal(config.PreToolUse, undefined, `${name} must NOT define PreToolUse`);
    assert.equal(config.PostToolUse, undefined, `${name} must NOT define PostToolUse`);
    assert.ok(Array.isArray(config.SessionStart) && config.SessionStart.length > 0, `${name} must use SessionStart`);
  }

  const rawText = JSON.stringify(hooks);
  assert.doesNotMatch(rawText, /\b(write_file|edit_file|write_to_file|replace_file_content|run_command)\b/);
});

test('Task 3: session-bootstrap-hook.mjs detects workspace GEMINI.md and matching stack-rules from pluginRoot cwd', () => {
  const hookScript = path.join(pluginRoot, 'scripts', 'session-bootstrap-hook.mjs');
  assert.ok(fs.existsSync(hookScript), 'scripts/session-bootstrap-hook.mjs must exist');

  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'iaw-hook-repo-'));
  try {
    fs.writeFileSync(path.join(tmpRepo, 'GEMINI.md'), '# Project\n\n## Stack\nNext.js 16 + Prisma + PostgreSQL\n');
    fs.writeFileSync(
      path.join(tmpRepo, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', '@prisma/client': '^6.0.0' } }),
    );
    fs.mkdirSync(path.join(tmpRepo, 'src', 'app'), { recursive: true });

    const payload = JSON.stringify({
      conversationId: 'test-conv',
      workspacePaths: [tmpRepo],
      cwd: tmpRepo,
      hookEventName: 'SessionStart',
    });

    const res = spawnSync(process.execPath, [hookScript], {
      cwd: pluginRoot,
      input: payload,
      encoding: 'utf8',
    });

    assert.equal(res.status, 0, `Hook must exit 0, got ${res.status}: ${res.stderr}`);
    const out = JSON.parse(res.stdout);
    assert.ok(Array.isArray(out.injectSteps) && out.injectSteps.length === 1);
    const msg = out.injectSteps[0]?.systemMessage?.systemMessage || '';

    assert.match(msg, /GEMINI\.md/);
    assert.match(msg, /skills\/s1-orchestrator\/SKILL\.md/);
    assert.match(msg, /resources\/stack-rules\/rules-frontend-nextjs\.md/);
    assert.match(msg, /resources\/stack-rules\/rules-database-postgresql\.md/);
    assert.doesNotMatch(msg, /rules-minecraft-fabric\.md/);
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
});

test('Task 3: session-bootstrap-hook.mjs fails open exit 0 with valid JSON on invalid stdin or missing workspace', () => {
  const hookScript = path.join(pluginRoot, 'scripts', 'session-bootstrap-hook.mjs');
  for (const input of ['', 'not-json', JSON.stringify({ workspacePaths: [path.join(os.tmpdir(), 'nonexistent-iaw-xyz')] })]) {
    const res = spawnSync(process.execPath, [hookScript], {
      cwd: pluginRoot,
      input,
      encoding: 'utf8',
    });
    assert.equal(res.status, 0, 'SessionStart hook must fail open exit 0');
    const out = JSON.parse(res.stdout);
    assert.ok(Array.isArray(out.injectSteps));
  }
});

test('Task 3: session-bootstrap-hook.mjs resolves WORKSPACE_PATHS env fallback when stdin is empty', () => {
  const hookScript = path.join(pluginRoot, 'scripts', 'session-bootstrap-hook.mjs');
  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'iaw-hook-env-'));
  try {
    fs.writeFileSync(path.join(tmpRepo, 'GEMINI.md'), '# Env Project\n\nPython + FastAPI + PostgreSQL\n');
    const res = spawnSync(process.execPath, [hookScript], {
      cwd: pluginRoot,
      env: { ...process.env, WORKSPACE_PATHS: tmpRepo },
      input: '',
      encoding: 'utf8',
    });
    assert.equal(res.status, 0, 'Env fallback must exit 0');
    const out = JSON.parse(res.stdout);
    assert.equal(out.injectSteps.length, 1);
    const msg = out.injectSteps[0]?.systemMessage?.systemMessage || '';
    assert.match(msg, /resources\/stack-rules\/rules-backend-python\.md/);
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
});
