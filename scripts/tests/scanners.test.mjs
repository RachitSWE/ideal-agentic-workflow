import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '../..');

function withTempWorkspace(files, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iaw-scanner-test-'));
  try {
    for (const [rel, content] of Object.entries(files)) {
      const full = path.join(dir, rel);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content, 'utf8');
    }
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('Task 2: check-route-integrity.mjs passes generic apps linking Customise -> /plugins and flags only under discord-bot-customizer profile', () => {
  const script = path.join(pluginRoot, 'scripts', 'check-route-integrity.mjs');
  withTempWorkspace(
    {
      'src/app/page.tsx': `export default function Page() { return <a className="btn-customize" href="/plugins">Plugins</a>; }\n`,
    },
    (dir) => {
      const genericRun = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' });
      assert.equal(
        genericRun.status,
        0,
        `Expected generic app to pass check-route-integrity.mjs, got status ${genericRun.status}: ${genericRun.stderr}`,
      );

      const profileRun = spawnSync(process.execPath, [script, '--profile', 'discord-bot-customizer'], {
        cwd: dir,
        encoding: 'utf8',
      });
      assert.equal(
        profileRun.status,
        1,
        'Expected --profile discord-bot-customizer to flag /plugins customizer loop',
      );
    },
  );
});

test('Task 2: check-route-integrity.mjs still flags raw device/host filesystem paths in all repos', () => {
  const script = path.join(pluginRoot, 'scripts', 'check-route-integrity.mjs');
  withTempWorkspace(
    {
      'src/components/Avatar.tsx': `export function Avatar() { return <img src="file:///C:/Users/demo/pic.png" />; }\n`,
    },
    (dir) => {
      const res = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' });
      assert.equal(res.status, 1, 'Raw device/file paths must still fail globally');
    },
  );
});

test('Task 2: check-ui-slop.mjs flags generic debug buttons without hardcoding Discord/shader strings globally', () => {
  const script = path.join(pluginRoot, 'scripts', 'check-ui-slop.mjs');
  withTempWorkspace(
    {
      'src/components/Panel.tsx': `export function Panel() { return <button>Dump State</button>; }\n`,
    },
    (dir) => {
      const res = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' });
      assert.equal(res.status, 1);
    },
  );
  const scannerSrc = fs.readFileSync(script, 'utf8');
  assert.doesNotMatch(scannerSrc, /test\\s\*discord/i, 'Core check-ui-slop.mjs should not hardcode Discord jargon');
});

test('Task 13: commands/log-decision.ps1 writes clean 7-column TSV with formula-injection neutralization and tab stripping', () => {
  const script = path.join(pluginRoot, 'commands', 'log-decision.ps1');
  assert.ok(fs.existsSync(script), 'commands/log-decision.ps1 must exist');

  const psCmd = spawnSync('pwsh', ['-Version'], { encoding: 'utf8' }).status === 0 ? 'pwsh' : 'powershell';
  withTempWorkspace({}, (dir) => {
    const res = spawnSync(
      psCmd,
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        script,
        '-SessionDir',
        dir,
        '-Phase',
        'S6',
        '-Decision',
        "use lock\tmigrate",
        '-Why',
        '+10% speed',
        '-Action',
        'keep',
        '-Evidence',
        "=CMD|'/C calc'!A0",
        '-Result',
        '@pass',
      ],
      { encoding: 'utf8' },
    );
    assert.equal(res.status, 0, `log-decision.ps1 failed: ${res.stderr}`);
    const tsvPath = path.join(dir, 'decision.tsv');
    assert.ok(fs.existsSync(tsvPath), 'decision.tsv must be created inside SessionDir');
    const lines = fs.readFileSync(tsvPath, 'utf8').trim().split(/\r?\n/);
    assert.equal(lines.length, 2, 'Expected header row plus 1 entry row');
    assert.equal(lines[0], 'ts\tphase\tdecision\twhy\taction\tevidence\tresult');
    const cols = lines[1].split('\t');
    assert.equal(cols.length, 7, `Expected 7 TSV columns even with tab in Decision, got ${cols.length}`);
    assert.equal(cols[2], 'use lock migrate', 'Embedded tab should be neutralized to space');
    assert.equal(cols[3], "'+10% speed", 'Leading + should be formula-prefixed');
    assert.equal(cols[5], "'=CMD|'/C calc'!A0", 'Leading = should be formula-prefixed');
    assert.equal(cols[6], "'@pass", 'Leading @ should be formula-prefixed');
  });
});
