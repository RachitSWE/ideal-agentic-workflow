#!/usr/bin/env node
/**
 * S10 Hardened Repo-Agnostic Auto-Committer (ideal-agentic-workflow v2.0)
 *
 * Features:
 * - Safe NUL-delimited (-z) git status & numstat parsing (handles spaces, deletions, renames, untracked, staged)
 * - Feature/directory + test-pair clustering prior to <=150 LOC batching; single >150 LOC files flagged atomic
 * - Gemini API commit message synthesis via env GEMINI_API_KEY / AI_COMMIT_API_KEY (zero hardcoded keys, zero fallback)
 * - Fail-closed on missing API key or HTTP 429 rate limits so re-invoking resumes from the next uncommitted batch
 * - Preserves PascalCase/camelCase identifiers & lowercase type(scope):
 * - Explicit file staging only (NEVER git add ., NEVER git push)
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_MAX_LOC = 150;
const MAX_SUBJECT_LENGTH = 100;
const MAX_BODY_LENGTH = 180;
const PERMITTED_TYPES = new Set([
  'feat',
  'fix',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'docs',
  'chore',
  'style',
]);
const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

const COMMIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    subject: {
      type: 'STRING',
      description:
        'Conventional commit subject: <type>(<scope>): <imperative message>, max 100 chars. Lowercase type and scope. Keep exact PascalCase/camelCase code identifiers.',
    },
    body: {
      type: 'STRING',
      description:
        'Commit body: 1-2 concise sentences, max 180 chars explaining technical mechanism and rationale. Preserve exact PascalCase/camelCase code identifiers.',
    },
  },
  required: ['subject', 'body'],
};

function runGit(cwd, args, { trim = true } = {}) {
  const res = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  return {
    code: res.status ?? 1,
    stdout: trim ? stdout.trim() : stdout,
    stderr: trim ? stderr.trim() : stderr,
  };
}

function parseNumstatZ(raw) {
  const map = new Map();
  if (!raw) return map;
  const tokens = raw.split('\0');
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    const firstTab = token.indexOf('\t');
    const secondTab = token.indexOf('\t', firstTab + 1);
    if (firstTab === -1 || secondTab === -1) continue;

    const insRaw = token.slice(0, firstTab);
    const delRaw = token.slice(firstTab + 1, secondTab);
    const rest = token.slice(secondTab + 1);
    const binary = insRaw === '-' || delRaw === '-';
    const insertions = binary ? 1 : Number.parseInt(insRaw, 10) || 0;
    const deletions = binary ? 0 : Number.parseInt(delRaw, 10) || 0;

    let filePath = rest;
    if (rest === '') {
      // Rename/copy entry in --numstat -z: empty after 2nd tab, next two NUL tokens are oldPath, newPath
      const oldPath = tokens[i + 1] || '';
      const newPath = tokens[i + 2] || '';
      i += 2;
      filePath = newPath || oldPath;
    }
    if (!filePath) continue;
    const prev = map.get(filePath) || { insertions: 0, deletions: 0, binary: false };
    map.set(filePath, {
      insertions: prev.insertions + insertions,
      deletions: prev.deletions + deletions,
      binary: prev.binary || binary,
    });
  }
  return map;
}

function normalizeGitStatusCode(x, y) {
  if (x === '?' && y === '?') return '??';
  if (x === 'R' || y === 'R') return 'R';
  if (x === 'D' || y === 'D') return 'D';
  if (x === 'A') return 'A';
  return 'M';
}

export function discoverChanges(cwd, { stagedOnly = false } = {}) {
  const statusRes = runGit(cwd, ['status', '--porcelain=v1', '-z', '-uall'], { trim: false });
  if (statusRes.code !== 0) {
    throw new Error(`git status failed: ${statusRes.stderr}`);
  }
  const workNumstat = parseNumstatZ(runGit(cwd, ['diff', '--numstat', '-z'], { trim: false }).stdout);
  const cachedNumstat = parseNumstatZ(runGit(cwd, ['diff', '--cached', '--numstat', '-z'], { trim: false }).stdout);

  const rawTokens = statusRes.stdout.split('\0');
  const changes = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const rec = rawTokens[i];
    if (!rec || rec.length < 4) continue;
    const x = rec[0];
    const y = rec[1];
    const filePath = rec.slice(3);
    if (!filePath) continue;

    let oldPath;
    if (x === 'R' || x === 'C' || y === 'R' || y === 'C') {
      oldPath = rawTokens[i + 1] || undefined;
      i += 1;
    }

    const isStaged = x !== ' ' && x !== '?';
    if (stagedOnly && !isStaged) continue;

    const status = normalizeGitStatusCode(x, y);
    const stat = {
      insertions: (workNumstat.get(filePath)?.insertions || 0) + (cachedNumstat.get(filePath)?.insertions || 0),
      deletions: (workNumstat.get(filePath)?.deletions || 0) + (cachedNumstat.get(filePath)?.deletions || 0),
      binary: Boolean(workNumstat.get(filePath)?.binary || cachedNumstat.get(filePath)?.binary),
    };

    if (status === '??') {
      try {
        const abs = path.join(cwd, filePath);
        const buf = fs.readFileSync(abs);
        if (buf.includes(0)) {
          stat.binary = true;
          stat.insertions = 1;
        } else {
          const text = buf.toString('utf8');
          const lines = text === '' ? 0 : text.split(/\r?\n/).length;
          stat.insertions = Math.max(1, lines);
        }
      } catch {
        stat.insertions = 1;
      }
    } else if (status === 'D' && stat.deletions === 0) {
      stat.deletions = 1;
    }

    changes.push({
      path: filePath,
      ...(oldPath ? { oldPath } : {}),
      insertions: stat.insertions,
      deletions: stat.deletions,
      status,
      binary: stat.binary,
    });
  }

  return changes;
}

function getClusterKey(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  const base = path.posix.basename(norm).toLowerCase();
  if (
    base === 'package-lock.json' ||
    base === 'pnpm-lock.yaml' ||
    base === 'yarn.lock' ||
    base === 'cargo.lock'
  ) {
    return '__lockfiles__';
  }
  if (norm.endsWith('.md') || norm.startsWith('docs/')) {
    const dir = path.posix.dirname(norm);
    return dir === '.' ? '__docs__' : `docs:${dir.split('/').slice(0, 2).join('/')}`;
  }
  const parts = path.posix.dirname(norm).split('/').filter((p) => p && p !== '.');
  if (parts.length === 0) return '__root__';
  if (parts.length === 1) return parts[0];
  return `${parts[0]}/${parts[1]}`;
}

export function batchFiles(files, { maxLoc = DEFAULT_MAX_LOC } = {}) {
  const clusters = new Map();
  for (const file of files) {
    const key = getClusterKey(file.path);
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(file);
  }

  const batches = [];
  for (const clusterFiles of clusters.values()) {
    let current = [];
    let currentLoc = 0;

    for (const file of clusterFiles) {
      const weight = Math.max(1, file.insertions || 0);
      if (file.insertions > maxLoc) {
        if (current.length > 0) {
          batches.push(Object.assign(current, { isAtomic: false }));
          current = [];
          currentLoc = 0;
        }
        batches.push(Object.assign([file], { isAtomic: true }));
        continue;
      }

      if (current.length > 0 && currentLoc + weight > maxLoc) {
        batches.push(Object.assign(current, { isAtomic: false }));
        current = [file];
        currentLoc = weight;
      } else {
        current.push(file);
        currentLoc += weight;
      }
    }

    if (current.length > 0) {
      batches.push(Object.assign(current, { isAtomic: false }));
    }
  }

  return batches;
}

function inferTypeAndScope(batch) {
  const paths = batch.map((f) => f.path.replace(/\\/g, '/'));
  const lower = paths.map((p) => p.toLowerCase());

  let type = 'feat';
  if (lower.every((p) => p.endsWith('.md') || p.startsWith('docs/'))) type = 'docs';
  else if (lower.every((p) => p.includes('.test.') || p.includes('.spec.') || p.includes('test/'))) type = 'test';
  else if (lower.every((p) => p.startsWith('.github/') || p.includes('workflow'))) type = 'ci';
  else if (lower.every((p) => fBaseConfig(p))) type = 'chore';
  else if (batch.every((f) => f.status === 'D')) type = 'refactor';

  const parts = paths[0].split('/').filter(Boolean);
  let scope = 'core';
  if (parts.length > 1) {
    const candidate = parts[0] === 'src' || parts[0] === 'skills' ? parts[1] : parts[0];
    scope = candidate.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'core';
  } else {
    scope = path.posix.basename(paths[0], path.posix.extname(paths[0])).replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'core';
  }

  return { type, scope };
}

function fBaseConfig(lowerPath) {
  return (
    lowerPath.endsWith('package-lock.json') ||
    lowerPath.endsWith('pnpm-lock.yaml') ||
    lowerPath.endsWith('yarn.lock') ||
    lowerPath.endsWith('.gitignore') ||
    lowerPath.endsWith('plugin.json')
  );
}

function truncateCleanly(text, maxLen, { sentenceAware = false } = {}) {
  if (text.length <= maxLen) return text;
  const sliced = text.slice(0, maxLen);
  if (sentenceAware) {
    const periodIdx = sliced.lastIndexOf('.');
    if (periodIdx > Math.floor(maxLen * 0.45)) {
      return sliced.slice(0, periodIdx + 1).trim();
    }
  }
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = (lastSpace > Math.floor(maxLen * 0.5) ? sliced.slice(0, lastSpace) : sliced).trim();
  return sentenceAware && !/[.!?]$/.test(trimmed) && trimmed.length + 1 <= maxLen ? `${trimmed}.` : trimmed;
}

export function normalizeCommit({ subject, body }, batch, isAtomic) {
  let cleanSub = (subject || '').trim().replace(/\r?\n/g, ' ');
  let cleanBody = (body || '').trim().replace(/\r?\n/g, ' ');

  const match = cleanSub.match(/^([a-zA-Z]+)(\([a-zA-Z0-9_.\-\/]+\))?:\s*(.+)$/);
  if (match && PERMITTED_TYPES.has(match[1].toLowerCase())) {
    const type = match[1].toLowerCase();
    const scope = match[2] ? match[2].toLowerCase() : '';
    const msg = match[3].trim();
    cleanSub = `${type}${scope}: ${msg}`;
  } else {
    const { type, scope } = inferTypeAndScope(batch);
    cleanSub = `${type}(${scope}): ${cleanSub || 'update scoped changes'}`;
  }

  cleanSub = cleanSub.replace(/\.+$/, '');
  cleanSub = truncateCleanly(cleanSub, MAX_SUBJECT_LENGTH).replace(/\.+$/, '');

  if (isAtomic && !/^atomic:\s*/i.test(cleanBody)) {
    cleanBody = `atomic: ${cleanBody}`;
  } else if (/^atomic:\s*/i.test(cleanBody)) {
    cleanBody = `atomic: ${cleanBody.replace(/^atomic:\s*/i, '')}`;
  }

  if (!cleanBody) {
    cleanBody = `${isAtomic ? 'atomic: ' : ''}apply cohesive update across ${batch.length} file(s).`;
  }
  cleanBody = truncateCleanly(cleanBody, MAX_BODY_LENGTH, { sentenceAware: true });

  return { subject: cleanSub, body: cleanBody };
}

function loadRepoContext(cwd) {
  const notes = [];
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) notes.push(`Project: ${pkg.name}${pkg.description ? ` - ${pkg.description}` : ''}`);
    } catch {
      // ignore invalid package.json
    }
  }
  const geminiPath = path.join(cwd, 'GEMINI.md');
  if (fs.existsSync(geminiPath)) {
    try {
      const lines = fs
        .readFileSync(geminiPath, 'utf8')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#') && !l.startsWith('---'))
        .slice(0, 4);
      notes.push(...lines);
    } catch {
      // ignore unreadable GEMINI.md
    }
  }
  return notes.slice(0, 5).join('\n') || 'Software repository';
}

function buildCompactDiffSummary(cwd, file) {
  if (file.status === 'D') return `Deleted file: ${file.path} (-${file.deletions})`;
  if (file.status === 'R') return `Renamed file: ${file.oldPath || '?'} -> ${file.path}`;
  if (file.status === '??') {
    try {
      const lines = fs
        .readFileSync(path.join(cwd, file.path), 'utf8')
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .slice(0, 30)
        .join('\n');
      return `New file: ${file.path}\n${lines}`;
    } catch {
      return `New file: ${file.path}`;
    }
  }
  const diffRes = runGit(cwd, ['diff', '-U1', 'HEAD', '--', file.path]);
  return `Modified file (${file.status}): ${file.path}\n${diffRes.stdout.slice(0, 1200)}`;
}

async function generateWithGemini(apiKey, prompt) {
  const apiBase = (process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
  let lastErr = null;
  let sawRateLimit = false;
  for (const model of GEMINI_MODELS) {
    try {
      const url = `${apiBase}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: COMMIT_SCHEMA,
            temperature: 0.1,
          },
        }),
      });
      if (!res.ok) {
        if (res.status === 429) sawRateLimit = true;
        const err = new Error(`Gemini HTTP ${res.status}`);
        err.status = res.status;
        lastErr = err;
        continue;
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
    } catch (err) {
      lastErr = err;
    }
  }
  if (sawRateLimit) {
    const rlErr = new Error('Gemini HTTP 429 (rate limit)');
    rlErr.status = 429;
    throw rlErr;
  }
  throw lastErr || new Error('Gemini API call failed');
}

function commitStagedBatchIsolated(cwd, batchPaths, commitMsg) {
  const tmpIndex = path.join(os.tmpdir(), `iaw-index-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const idxEnv = { ...process.env, GIT_INDEX_FILE: tmpIndex };
  try {
    const hasHead = runGit(cwd, ['rev-parse', '--verify', 'HEAD']).code === 0;
    const seedRes = spawnSync('git', ['read-tree', hasHead ? 'HEAD' : '--empty'], { cwd, env: idxEnv, encoding: 'utf8' });
    if (seedRes.status !== 0) {
      throw new Error(`git read-tree failed: ${seedRes.stderr}`);
    }

    for (const filePath of batchPaths) {
      const lsRes = runGit(cwd, ['ls-files', '-s', '--', filePath], { trim: false });
      if (lsRes.code !== 0) throw new Error(`git ls-files failed for ${filePath}: ${lsRes.stderr}`);
      if (lsRes.stdout.trim()) {
        const upd = spawnSync('git', ['update-index', '--index-info'], {
          cwd,
          env: idxEnv,
          input: lsRes.stdout,
          encoding: 'utf8',
        });
        if (upd.status !== 0) throw new Error(`git update-index failed for ${filePath}: ${upd.stderr}`);
      } else {
        const rm = spawnSync('git', ['update-index', '--force-remove', '--', filePath], {
          cwd,
          env: idxEnv,
          encoding: 'utf8',
        });
        if (rm.status !== 0) throw new Error(`git update-index remove failed for ${filePath}: ${rm.stderr}`);
      }
    }

    const writeRes = spawnSync('git', ['write-tree'], { cwd, env: idxEnv, encoding: 'utf8' });
    if (writeRes.status !== 0) throw new Error(`git write-tree failed: ${writeRes.stderr}`);
    const treeSha = writeRes.stdout.trim();

    const commitTreeArgs = ['commit-tree', treeSha];
    if (hasHead) commitTreeArgs.push('-p', 'HEAD');
    commitTreeArgs.push('-m', commitMsg.subject, '-m', commitMsg.body);
    const commitRes = runGit(cwd, commitTreeArgs);
    if (commitRes.code !== 0) throw new Error(`git commit-tree failed: ${commitRes.stderr}`);
    const newSha = commitRes.stdout.trim();

    const refRes = runGit(cwd, ['update-ref', '-m', `commit: ${commitMsg.subject}`, 'HEAD', newSha]);
    if (refRes.code !== 0) throw new Error(`git update-ref failed: ${refRes.stderr}`);
  } finally {
    fs.rmSync(tmpIndex, { force: true });
  }
}

function parseCliArgs(argv) {
  let dryRun = false;
  let stagedOnly = false;
  let maxLoc = DEFAULT_MAX_LOC;
  let batchLimit = Infinity;
  let cwd = process.cwd();

  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg === '--staged-only') stagedOnly = true;
    else if (arg.startsWith('--max-loc=')) maxLoc = Math.max(20, Number.parseInt(arg.split('=')[1], 10) || DEFAULT_MAX_LOC);
    else if (arg.startsWith('--batch-limit=')) batchLimit = Math.max(1, Number.parseInt(arg.split('=')[1], 10) || Infinity);
    else if (arg.startsWith('--cwd=')) cwd = path.resolve(arg.slice('--cwd='.length));
  }

  return { dryRun, stagedOnly, maxLoc, batchLimit, cwd };
}

export async function runAutoCommit(options = {}) {
  const {
    cwd = process.cwd(),
    dryRun = false,
    stagedOnly = false,
    maxLoc = DEFAULT_MAX_LOC,
    batchLimit = Infinity,
  } = options;

  const files = discoverChanges(cwd, { stagedOnly });
  if (files.length === 0) {
    console.log('[AUTO-COMMIT] Clean working tree. Nothing to commit.');
    return [];
  }

  const allBatches = batchFiles(files, { maxLoc });
  const targetBatches = Number.isFinite(batchLimit) ? allBatches.slice(0, batchLimit) : allBatches;
  const apiKeys = [...new Set([process.env.GEMINI_API_KEY, process.env.AI_COMMIT_API_KEY].map((k) => (k || '').trim()).filter(Boolean))];
  if (apiKeys.length === 0) {
    throw new Error('Missing GEMINI_API_KEY or AI_COMMIT_API_KEY; fallback commit generation is disabled.');
  }
  const repoContext = loadRepoContext(cwd);
  const results = [];

  for (let i = 0; i < targetBatches.length; i++) {
    const batch = targetBatches[i];
    const isAtomic = Boolean(batch.isAtomic);
    const prompt = [
      'You are a Principal Engineer generating one S10 Conventional Commit.',
      `Repository Context:\n${repoContext}`,
      'Rules:',
      '- Subject: <type>(<scope>): <imperative message>, lowercase type/scope & starting verb, <= 100 chars, no trailing period.',
      '- Body: strictly 1 concise complete sentence (<= 160 chars) explaining mechanism & rationale.',
      '- Preserve exact PascalCase/camelCase code identifiers in both subject message and body.',
      isAtomic ? "- Single file > max LOC: prefix body with 'atomic: <reason>'." : '',
      'Files:',
      ...batch.map((f) => `- ${f.status} ${f.path} (+${f.insertions}/-${f.deletions})`),
      'Diffs:',
      batch.map((f) => buildCompactDiffSummary(cwd, f)).join('\n\n'),
    ]
      .filter(Boolean)
      .join('\n\n');

    let commitMsg = null;
    let lastApiErr = null;
    let sawRateLimit = false;
    for (const key of apiKeys) {
      try {
        const raw = await generateWithGemini(key, prompt);
        commitMsg = normalizeCommit(raw, batch, isAtomic);
        break;
      } catch (err) {
        if (err?.status === 429) sawRateLimit = true;
        lastApiErr = err;
      }
    }
    if (!commitMsg) {
      if (sawRateLimit) {
        throw new Error(`Batch ${i + 1}/${targetBatches.length} commit failed due to rate limit (HTTP 429). Wait and re-invoke auto-commit to continue.`);
      }
      throw new Error(`Batch ${i + 1}/${targetBatches.length} commit failed: ${lastApiErr?.message || 'Gemini API request failed'}`);
    }

    const flag = isAtomic ? ' [ATOMIC]' : '';
    console.log(`[Batch ${i + 1}/${targetBatches.length}]${flag} ${commitMsg.subject}`);
    console.log(`  Body: ${commitMsg.body}`);

    if (!dryRun) {
      const batchPaths = [
        ...new Set(batch.flatMap((f) => (f.status === 'R' && f.oldPath ? [f.oldPath, f.path] : [f.path]))),
      ];
      if (stagedOnly) {
        if (targetBatches.length === 1) {
          const commitRes = runGit(cwd, ['commit', '-m', commitMsg.subject, '-m', commitMsg.body]);
          if (commitRes.code !== 0) {
            throw new Error(`git commit failed for batch ${i + 1}: ${commitRes.stderr}`);
          }
        } else {
          commitStagedBatchIsolated(cwd, batchPaths, commitMsg);
        }
      } else {
        for (const f of batch) {
          if (f.status === 'R' && f.oldPath) {
            const rmOld = runGit(cwd, ['add', '--', f.oldPath]);
            if (rmOld.code !== 0) {
              throw new Error(`Failed staging rename source ${f.oldPath}: ${rmOld.stderr}`);
            }
          }
          const addRes = runGit(cwd, ['add', '--', f.path]);
          if (addRes.code !== 0) {
            throw new Error(`Failed staging ${f.path}: ${addRes.stderr}`);
          }
        }
        const commitRes = runGit(cwd, ['commit', '-m', commitMsg.subject, '-m', commitMsg.body, '--', ...batchPaths]);
        if (commitRes.code !== 0) {
          throw new Error(`git commit failed for batch ${i + 1}: ${commitRes.stderr}`);
        }
      }
    }

    results.push({ ...commitMsg, files: batch.map((f) => f.path), isAtomic });
  }

  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  runAutoCommit(parseCliArgs(process.argv.slice(2))).catch((err) => {
    console.error('[AUTO-COMMIT] Fatal error:', err.message);
    process.exit(1);
  });
}
