import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '../..');
const autoCommitScript = path.join(pluginRoot, 'scripts', 'auto-commit.mjs');
const autoCommitUrl = pathToFileURL(autoCommitScript).href;

function initTempGitRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iaw-autocommit-'));
  execFileSync('git', ['init', '-b', 'main'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test Engineer'], { cwd: dir });
  fs.writeFileSync(path.join(dir, 'README.md'), '# Test Repo\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'tracked-delete.ts'), 'export const oldVal = 1;\n', 'utf8');
  fs.writeFileSync(path.join(dir, 'old-name.ts'), 'export const renamed = true;\nexport const line2 = 2;\n', 'utf8');
  execFileSync('git', ['add', '--', 'README.md', 'tracked-delete.ts', 'old-name.ts'], { cwd: dir });
  execFileSync('git', ['commit', '-m', 'chore: initial baseline'], { cwd: dir });
  return dir;
}

async function runAutoCommitAsync(args, options) {
  const child = spawn(process.execPath, [autoCommitScript, ...args], {
    ...options,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => (stdout += chunk));
  child.stderr.on('data', (chunk) => (stderr += chunk));
  const [status] = await once(child, 'close');
  return { status, stdout, stderr };
}

async function withMockGeminiServer(handler, fn) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}

function sendGeminiJson(res, subject, body) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ subject, body }) }] } }],
    }),
  );
}

test('Task 11 (1): batchFiles clusters by domain/directory and keeps source+test paired', async () => {
  const { batchFiles } = await import(autoCommitUrl);
  const files = [
    { path: 'src/auth/login.ts', insertions: 40, deletions: 0, status: 'M' },
    { path: 'src/billing/invoice.ts', insertions: 40, deletions: 0, status: 'M' },
    { path: 'src/auth/login.test.ts', insertions: 40, deletions: 0, status: 'M' },
  ];
  const batches = batchFiles(files, { maxLoc: 150 });
  assert.equal(batches.length, 2, 'Expected separate auth and billing batches rather than scrambling across clusters');
  const authBatch = batches.find((b) => b.some((f) => f.path.includes('auth')));
  const billingBatch = batches.find((b) => b.some((f) => f.path.includes('billing')));
  assert.ok(authBatch && authBatch.length === 2, 'login.ts and login.test.ts should batch together');
  assert.ok(billingBatch && billingBatch.length === 1, 'invoice.ts should isolate into billing batch');
});

test('Task 11 (2): discoverChanges handles spaces, deletions, renames, untracked, and >150 LOC atomic files', async () => {
  const { discoverChanges, batchFiles } = await import(autoCommitUrl);
  const dir = initTempGitRepo();
  try {
    fs.writeFileSync(path.join(dir, 'my file.ts'), 'export const spaced = 1;\n', 'utf8');
    fs.unlinkSync(path.join(dir, 'tracked-delete.ts'));
    fs.renameSync(path.join(dir, 'old-name.ts'), path.join(dir, 'new-name.ts'));
    execFileSync('git', ['add', '-A'], { cwd: dir });
    fs.writeFileSync(
      path.join(dir, 'big-atomic.ts'),
      Array.from({ length: 165 }, (_, i) => `export const item${i} = ${i};`).join('\n') + '\n',
      'utf8',
    );

    const discovered = discoverChanges(dir);
    const byPath = new Map(discovered.map((f) => [f.path, f]));

    assert.ok(byPath.has('my file.ts'), 'Should discover file path containing spaces');
    assert.ok(byPath.has('tracked-delete.ts'), 'Should discover deleted tracked file');
    assert.equal(byPath.get('tracked-delete.ts').status, 'D');
    assert.ok(byPath.has('new-name.ts'), 'Should discover renamed destination');
    assert.equal(byPath.get('new-name.ts').status, 'R');
    assert.ok(byPath.has('big-atomic.ts'), 'Should discover untracked big file');
    assert.equal(byPath.get('big-atomic.ts').status, '??');

    const batches = batchFiles(discovered, { maxLoc: 150 });
    const atomicBatches = batches.filter((b) => b.isAtomic);
    assert.ok(atomicBatches.some((b) => b.length === 1 && b[0].path === 'big-atomic.ts'), 'Single >150 LOC file must be marked atomic');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Task 11 (3): normalizeCommit lowercases type(scope) while preserving PascalCase/camelCase identifiers and enforcing caps', async () => {
  const { normalizeCommit } = await import(autoCommitUrl);
  const batch = [{ path: 'src/auth/RoleVerifyExecutor.ts', insertions: 170, deletions: 0, status: 'M' }];
  const res = normalizeCommit(
    {
      subject: 'Feat(Auth): add RoleVerifyExecutor handler.',
      body: 'Implement RoleVerifyExecutor with TokenCache validation.',
    },
    batch,
    true,
  );
  assert.equal(res.subject, 'feat(auth): add RoleVerifyExecutor handler');
  assert.ok(res.body.startsWith('atomic: '), 'Atomic single-file commit must begin with atomic:');
  assert.match(res.body, /RoleVerifyExecutor/);
  assert.match(res.body, /TokenCache/);
  assert.ok(res.subject.length <= 100);
  assert.ok(res.body.length <= 180);
});

test('Task 11 (4): missing API keys fails closed exit 1 without fallback committing', () => {
  const dir = initTempGitRepo();
  try {
    fs.writeFileSync(path.join(dir, 'feature.ts'), 'export function runCheck() { return true; }\n', 'utf8');
    const env = { ...process.env };
    delete env.GEMINI_API_KEY;
    delete env.AI_COMMIT_API_KEY;

    const proc = spawnSync(process.execPath, [autoCommitScript], {
      cwd: dir,
      env,
      encoding: 'utf8',
    });
    assert.equal(proc.status, 1, 'Expected non-zero exit when API keys are missing');
    assert.match(proc.stderr, /Missing GEMINI_API_KEY/i);
    const statusAfter = execFileSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });
    assert.ok(statusAfter.includes('feature.ts'), 'Must leave files uncommitted on failure');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Task 11 (5): HTTP 429 fails closed citing rate limit and live 200 API commits batches cleanly without pushing', async () => {
  const dir = initTempGitRepo();
  try {
    fs.mkdirSync(path.join(dir, 'src', 'auth'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'auth', 'spaced auth.ts'), 'export const AuthGuard = true;\n', 'utf8');
    fs.unlinkSync(path.join(dir, 'tracked-delete.ts'));
    fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'notes.md'), '# Notes\nUpdated docs.\n', 'utf8');

    // First verify fail-closed on HTTP 429 rate limit
    await withMockGeminiServer(
      (_req, res) => {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end('{"error":{"code":429,"message":"Too Many Requests"}}');
      },
      async (baseUrl) => {
        const proc = await runAutoCommitAsync([], {
          cwd: dir,
          env: { ...process.env, GEMINI_API_KEY: 'test-key-429', GEMINI_API_BASE_URL: baseUrl },
        });
        assert.equal(proc.status, 1, 'HTTP 429 must fail closed exit 1');
        assert.match(proc.stderr, /rate limit/i, 'Stderr must report rate limit explicitly');
      },
    );

    // Then verify full clean commit when API returns 200
    let count = 0;
    await withMockGeminiServer(
      (_req, res) => {
        count++;
        sendGeminiJson(res, `feat(core): apply mock commit batch ${count}`, 'Commit verified batch changes.');
      },
      async (baseUrl) => {
        const proc = await runAutoCommitAsync([], {
          cwd: dir,
          env: { ...process.env, GEMINI_API_KEY: 'test-key-200', GEMINI_API_BASE_URL: baseUrl },
        });
        assert.equal(proc.status, 0, `Live auto-commit failed: ${proc.stderr}\n${proc.stdout}`);
      },
    );

    const cleanStatus = execFileSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' }).trim();
    assert.equal(cleanStatus, '', `Expected clean working tree after auto-commit, got:\n${cleanStatus}`);
    const logOut = execFileSync('git', ['log', '-n', '3', '--format=%s%n%b---'], { cwd: dir, encoding: 'utf8' });
    assert.match(logOut, /^feat\(core\): apply mock commit batch/m);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Task 11 (6): auto-commit.mjs contains zero hardcoded API keys', () => {
  assert.ok(fs.existsSync(autoCommitScript), 'scripts/auto-commit.mjs must exist');
  const raw = fs.readFileSync(autoCommitScript, 'utf8');
  assert.doesNotMatch(raw, /AQ\.[A-Za-z0-9_-]{10,}|AIza[0-9A-Za-z_-]{20,}/, 'Must not contain hardcoded Google/Gemini API keys');
});

test('Task 11 (7): commits pre-staged files across multiple clusters sequentially without committing everything on Batch 1', async () => {
  const dir = initTempGitRepo();
  try {
    fs.mkdirSync(path.join(dir, 'src', 'auth'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'src', 'billing'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'auth', 'guard.ts'), 'export const Guard = 1;\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'src', 'billing', 'ledger.ts'), 'export const Ledger = 2;\n', 'utf8');
    execFileSync('git', ['add', '--', 'src/auth/guard.ts', 'src/billing/ledger.ts'], { cwd: dir });

    let n = 0;
    await withMockGeminiServer(
      (_req, res) => {
        n++;
        sendGeminiJson(res, `feat(cluster${n}): commit pre-staged cluster ${n}`, 'Commit isolated cluster changes.');
      },
      async (baseUrl) => {
        const proc = await runAutoCommitAsync([], {
          cwd: dir,
          env: { ...process.env, GEMINI_API_KEY: 'test-key-prestaged', GEMINI_API_BASE_URL: baseUrl },
        });
        assert.equal(proc.status, 0, `Multi-batch pre-staged commit failed: ${proc.stderr}\n${proc.stdout}`);
      },
    );

    const cleanStatus = execFileSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' }).trim();
    assert.equal(cleanStatus, '', `Expected clean tree after pre-staged batches, got:\n${cleanStatus}`);
    const subjects = execFileSync('git', ['log', '-n', '2', '--format=%s'], { cwd: dir, encoding: 'utf8' })
      .trim()
      .split(/\r?\n/);
    assert.equal(subjects.length, 2, 'Expected 2 separate commits for auth and billing clusters');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Task 11 (8): --staged-only across multiple batches never stages unstaged MM edits', async () => {
  const dir = initTempGitRepo();
  try {
    fs.mkdirSync(path.join(dir, 'src', 'auth'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'src', 'billing'), { recursive: true });
    const authFile = path.join(dir, 'src', 'auth', 'token.ts');
    const billingFile = path.join(dir, 'src', 'billing', 'tax.ts');
    fs.writeFileSync(authFile, 'export const v = 1;\n', 'utf8');
    fs.writeFileSync(billingFile, 'export const tax = 1;\n', 'utf8');
    execFileSync('git', ['add', '--', 'src/auth/token.ts', 'src/billing/tax.ts'], { cwd: dir });
    execFileSync('git', ['commit', '-m', 'chore: base auth and billing'], { cwd: dir });

    fs.writeFileSync(authFile, 'export const v = 2;\n', 'utf8');
    fs.writeFileSync(billingFile, 'export const tax = 2;\n', 'utf8');
    execFileSync('git', ['add', '--', 'src/auth/token.ts', 'src/billing/tax.ts'], { cwd: dir });
    fs.writeFileSync(authFile, 'export const v = 3;\n', 'utf8');

    let n = 0;
    await withMockGeminiServer(
      (_req, res) => {
        n++;
        sendGeminiJson(res, `fix(staged${n}): commit staged batch ${n}`, 'Commit staged index state only.');
      },
      async (baseUrl) => {
        const proc = await runAutoCommitAsync(['--staged-only'], {
          cwd: dir,
          env: { ...process.env, GEMINI_API_KEY: 'test-key-staged', GEMINI_API_BASE_URL: baseUrl },
        });
        assert.equal(proc.status, 0, `--staged-only multi-batch failed: ${proc.stderr}\n${proc.stdout}`);
      },
    );

    const committedContent = execFileSync('git', ['show', 'HEAD~1:src/auth/token.ts'], { cwd: dir, encoding: 'utf8' });
    const latestAuth = execFileSync('git', ['show', 'HEAD:src/auth/token.ts'], { cwd: dir, encoding: 'utf8' });
    assert.ok(
      committedContent.includes('v = 2') || latestAuth.includes('v = 2'),
      'Committed auth snapshot must contain staged v = 2, not unstaged v = 3',
    );
    assert.ok(!latestAuth.includes('v = 3'), 'Unstaged v = 3 MUST NOT be committed under --staged-only');

    const dirtyStatus = execFileSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });
    assert.match(dirtyStatus, /^\sM\s+src\/auth\/token\.ts/m, 'Unstaged v3 edit must remain unstaged on disk');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
