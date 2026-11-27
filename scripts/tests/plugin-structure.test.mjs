import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '../..');

test('Task 1: rules/ contains only consolidated AGENTS.md and stack rules live in resources/stack-rules/', () => {
  const rulesDir = path.join(pluginRoot, 'rules');
  const rulesEntries = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md'));
  assert.deepEqual(rulesEntries, ['AGENTS.md'], `Expected only AGENTS.md in rules/, got: ${rulesEntries.join(', ')}`);

  const stackRulesDir = path.join(pluginRoot, 'resources', 'stack-rules');
  assert.ok(fs.existsSync(stackRulesDir), 'resources/stack-rules/ directory must exist');
  const movedRules = fs.readdirSync(stackRulesDir).filter((f) => f.startsWith('rules-') && f.endsWith('.md'));
  assert.ok(movedRules.length >= 14, `Expected >= 14 stack rules in resources/stack-rules/, found ${movedRules.length}`);
  assert.ok(movedRules.includes('rules-frontend-nextjs.md'));
  assert.ok(movedRules.includes('rules-backend-java.md'));
});

test('Task 1: scripts and stack docs point to resources/stack-rules/ and verify-stack.ps1 avoids hardcoded bare pwsh', () => {
  for (const rel of [
    'skills/s6-coding/SKILL.md',
    'skills/s6-coding/resources/stack-detector.md',
    'scripts/start-session.ps1',
  ]) {
    const content = fs.readFileSync(path.join(pluginRoot, rel), 'utf8');
    assert.doesNotMatch(content, /(?<!stack-)rules\/rules-/, `${rel} still references rules/rules-*`);
  }

  const verifyStack = fs.readFileSync(path.join(pluginRoot, 'commands', 'verify-stack.ps1'), 'utf8');
  assert.doesNotMatch(verifyStack, /Run-CommandSafely\s+"[^"]+"\s+"pwsh\s+-File/, 'verify-stack.ps1 must resolve pwsh vs powershell dynamically');
  assert.match(verifyStack, /Get-Command\s+pwsh/i, 'verify-stack.ps1 should probe for pwsh and fall back to powershell');
});

test('Task 3: consolidated rules/AGENTS.md is lean (<14KB), dispatches S1 + stack-rules, indexes EP-01..EP-12, preserves OOP/JSX rules, and removes Discord leakage', () => {
  const rulesAgentsPath = path.join(pluginRoot, 'rules', 'AGENTS.md');
  const rootAgentsPath = path.join(pluginRoot, 'AGENTS.md');
  const principlesPath = path.join(pluginRoot, 'resources', 'engineering-principles.md');

  assert.ok(fs.existsSync(principlesPath), 'resources/engineering-principles.md must exist');
  const principles = fs.readFileSync(principlesPath, 'utf8');
  for (let i = 1; i <= 12; i++) {
    const code = `EP-${String(i).padStart(2, '0')}`;
    assert.match(principles, new RegExp(`\\b${code}\\b`), `${principlesPath} missing ${code}`);
  }

  const rulesSize = fs.statSync(rulesAgentsPath).size;
  assert.ok(rulesSize < 14000, `rules/AGENTS.md must stay under 14000 bytes (got ${rulesSize})`);

  const rulesText = fs.readFileSync(rulesAgentsPath, 'utf8');
  const rootText = fs.readFileSync(rootAgentsPath, 'utf8');

  for (const [label, text] of [
    ['rules/AGENTS.md', rulesText],
    ['AGENTS.md', rootText],
  ]) {
    assert.match(text, /skills\/s1-orchestrator\/SKILL\.md/, `${label} must cite skills/s1-orchestrator/SKILL.md`);
    assert.match(text, /resources\/stack-rules\//, `${label} must cite resources/stack-rules/`);
    assert.match(text, /EP-01/, `${label} must index EP-01..EP-12`);
    assert.match(text, /EP-12/, `${label} must index EP-01..EP-12`);
    assert.match(text, /AP-001/, `${label} must keep AP-001`);
    assert.match(text, /AP-010/, `${label} must keep AP-010`);
    assert.match(text, /1 Type Per File|Strictly 1/i, `${label} must preserve 1 OOP type per file`);
    assert.match(text, /2 inline JSX/i, `${label} must preserve <= 2 inline JSX children`);
    assert.doesNotMatch(text, /\/api\/welcomer\/asset|opentype\.js|\/plugins|#E92738|3,000ms|deferReply/i, `${label} must not leak Discord/Welcomer specifics`);
  }

  const s3Skill = fs.readFileSync(path.join(pluginRoot, 'skills', 's3-planning', 'SKILL.md'), 'utf8');
  assert.doesNotMatch(s3Skill, /Scope Jail PreToolUse hook physically blocks/i, 's3-planning must accurately cite verify-scope.ps1 instead of nonexistent PreToolUse hook');
});

test('Task 4: s1-orchestrator defines all 7 empirical tracks with required sections and Option A routing', () => {
  const tracksDir = path.join(pluginRoot, 'skills', 's1-orchestrator', 'resources', 'tracks');
  assert.ok(fs.existsSync(tracksDir), 'skills/s1-orchestrator/resources/tracks must exist');

  const expectedTracks = [
    'bugfix-mode.md',
    'perf-hillclimb-mode.md',
    'prototype-mode.md',
    'investigation-mode.md',
    'refactor-mode.md',
    'autonomous-mode.md',
    'visual-parity.md',
  ];

  for (const trackFile of expectedTracks) {
    const trackPath = path.join(tracksDir, trackFile);
    assert.ok(fs.existsSync(trackPath), `Missing track file: ${trackFile}`);
    const content = fs.readFileSync(trackPath, 'utf8');
    for (const heading of ['Entry Criteria', 'Phase Overrides', 'Verification Standard', 'Handoff']) {
      assert.match(content, new RegExp(`##\\s+${heading}\\b`, 'i'), `${trackFile} must define section "## ${heading}"`);
    }
  }

  const s1Text = fs.readFileSync(path.join(pluginRoot, 'skills', 's1-orchestrator', 'SKILL.md'), 'utf8');
  for (const trackName of expectedTracks) {
    assert.match(s1Text, new RegExp(trackName.replace('.', '\\.')), `s1-orchestrator/SKILL.md must route to ${trackName}`);
  }

  const s3Text = fs.readFileSync(path.join(pluginRoot, 'skills', 's3-planning', 'SKILL.md'), 'utf8');
  assert.match(s3Text, /Empirical Track Bypass|Empirical Fast-Tracks/i, 's3-planning/SKILL.md must document empirical track rules alongside Option A');
});

test('Task 5: every skills/*/SKILL.md has valid YAML name and trigger description, and workflow-guide exists', () => {
  const workflowGuide = path.join(pluginRoot, 'skills', 'workflow-guide', 'SKILL.md');
  assert.ok(fs.existsSync(workflowGuide), 'skills/workflow-guide/SKILL.md must exist');

  const skillsDir = path.join(pluginRoot, 'skills');
  const dirs = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  assert.ok(dirs.length >= 14, `Expected >= 14 skill directories, found ${dirs.length}`);

  for (const dir of dirs) {
    const skillPath = path.join(skillsDir, dir.name, 'SKILL.md');
    assert.ok(fs.existsSync(skillPath), `Missing SKILL.md in skills/${dir.name}`);
    const raw = fs.readFileSync(skillPath, 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(match, `skills/${dir.name}/SKILL.md must begin with YAML frontmatter`);
    const fm = match[1];
    assert.match(fm, /^name:\s*\S+/m, `skills/${dir.name}/SKILL.md frontmatter must have non-empty name`);
    const descMatch = fm.match(/^description:\s*["']?(.+?)["']?\s*$/m);
    assert.ok(descMatch && descMatch[1].trim().length >= 30, `skills/${dir.name}/SKILL.md frontmatter must have meaningful trigger description`);
    if (dir.name === 's1-orchestrator' || dir.name === 's0-repo-architect') {
      assert.match(descMatch[1], /\bUse when\b|\bUse proactively\b|\bTrigger/i, `skills/${dir.name}/SKILL.md description should state user-intent trigger criteria`);
    }
  }
});

test('Task 14: reflection/UX skills exist and active plugin directories contain zero stale Cursor references', () => {
  const expectedSkills = [
    'session-reflect',
    'workflow-eval',
    'session-catchup',
    'plain-summary',
    'prose-polish',
    'prompt-sharpen',
    'context-recall',
  ];
  for (const name of expectedSkills) {
    const p = path.join(pluginRoot, 'skills', name, 'SKILL.md');
    assert.ok(fs.existsSync(p), `Missing Task 14 skill: skills/${name}/SKILL.md`);
  }

  const forbidden = new RegExp(
    [
      ['poteto', 'mode'].join('-'),
      ['poteto', 'agent'].join('-'),
      ['comment', 'sicko'].join('-'),
      ['cursor', 'team', 'kit'].join('-'),
      ['~', '.cursor', ''].join('/'),
    ]
      .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
    'i',
  );

  const scanDirs = ['agents', 'rules', 'skills', 'resources', 'commands', 'scripts'];
  const walk = (dirPath) => {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(full);
      } else if (/\.(md|mjs|js|ts|ps1|json)$/i.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8');
        const hit = text.match(forbidden);
        assert.equal(hit, null, `Found stale Cursor reference "${hit?.[0]}" in ${path.relative(pluginRoot, full)}`);
      }
    }
  };

  for (const dir of scanDirs) {
    const abs = path.join(pluginRoot, dir);
    if (fs.existsSync(abs)) walk(abs);
  }
});
