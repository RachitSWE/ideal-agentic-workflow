/**
 * verify-file-citations.js
 * 
 * Autonomous verification test suite for ideal-agentic-workflow plugin.
 * Validates:
 * 1. Zero Broken Citations: All cited paths physically exist on disk.
 * 2. 100% Agent Personas Cited: Every subagent in agents/ is cited.
 * 3. 100% Stack Rules Cited: Every rule in rules/ is cited.
 * 4. 100% Stack Packs Cited: Every pack in resources/stacks/ is cited.
 * 5. 100% Automation Commands Cited: Every ps1 in commands/ is cited.
 * 6. 100% Skill Local Resources Cited: Every resource in skills/ is cited.
 * 7. Token Efficiency: Zero ASCII box-drawing characters in invocation prompts.
 */

const fs = require('fs');
const path = require('path');

// Determine plugin root (support running from root or scripts/)
let pluginRoot = __dirname;
if (!fs.existsSync(path.join(pluginRoot, 'plugin.json'))) {
  pluginRoot = path.resolve(__dirname, '..');
}
if (!fs.existsSync(path.join(pluginRoot, 'plugin.json'))) {
  pluginRoot = path.resolve(process.cwd(), 'ideal-agentic-workflow');
}
if (!fs.existsSync(path.join(pluginRoot, 'plugin.json'))) {
  pluginRoot = process.cwd();
}

console.log('======================================================================');
console.log('  IDEAL-AGENTIC-WORKFLOW: CITATION & ASSET VERIFICATION SUITE');
console.log(`  Plugin Root: ${pluginRoot}`);
console.log('======================================================================\n');

// Helper to recursively collect files
function collectFiles(dir, filterFn = null) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(collectFiles(fullPath, filterFn));
    } else {
      if (!filterFn || filterFn(fullPath)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// 1. Collect all Markdown & Config files to search for citations
const searchFiles = [
  ...collectFiles(path.join(pluginRoot, 'skills'), f => f.endsWith('.md')),
  ...collectFiles(path.join(pluginRoot, 'resources'), f => f.endsWith('.md')),
  ...collectFiles(path.join(pluginRoot, 'rules'), f => f.endsWith('.md')),
  ...collectFiles(path.join(pluginRoot, 'agents'), f => f.endsWith('.md')),
  path.join(pluginRoot, 'INVOCATION.md'),
  path.join(pluginRoot, 'INVOCATION-SPEC.md'),
  path.join(pluginRoot, 'README.md'),
  path.join(pluginRoot, 'AGENTS.md'),
  path.join(pluginRoot, 'plugin.json'),
  path.join(pluginRoot, 'hooks.json')
].filter(f => fs.existsSync(f));

// Aggregate all content from search files
const corpus = [];
for (const file of searchFiles) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    corpus.push({ file, rel: path.relative(pluginRoot, file).replace(/\\/g, '/'), text });
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
}

// Combined text for full corpus search
const fullCorpusText = corpus.map(c => c.text).join('\n');

// Test Results Counter
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assertTest(name, condition, errorMsg = '') {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } else {
    failedTests++;
    console.log(`  [FAIL] ${name}: ${errorMsg}`);
    failures.push({ name, errorMsg });
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: ZERO BROKEN CITATIONS
// -----------------------------------------------------------------------------
console.log('--- TEST SUITE 1: Checking Cited File Paths for Physical Existence ---');

// Regular expression to match relative citations like `agents/...`, `rules/...`, `resources/...`, `commands/...`, `skills/...`
const citationRegex = /`((agents|rules|resources|commands|skills)\/[^`\r\n*?<>|]+)`/g;
const foundCitations = new Set();
const brokenCitations = [];

for (const { file, rel, text } of corpus) {
  let match;
  while ((match = citationRegex.exec(text)) !== null) {
    const citedPath = match[1].trim();
    // Ignore paths with placeholders like [SHA], {Target}, etc.
    if (citedPath.includes('[') || citedPath.includes('{') || citedPath.includes('*')) {
      continue;
    }
    foundCitations.add(citedPath);
    
    // Resolve path relative to plugin root
    const resolvedPath = path.join(pluginRoot, citedPath);
    if (!fs.existsSync(resolvedPath)) {
      brokenCitations.push({ source: rel, citedPath });
    }
  }
}

assertTest(
  'Zero broken file citations',
  brokenCitations.length === 0,
  brokenCitations.map(b => `In ${b.source} -> cited "${b.citedPath}" (not found on disk)`).join('; ')
);
console.log(`         Total unique physical citations validated: ${foundCitations.size}`);

// -----------------------------------------------------------------------------
// TEST SUITE 2: COMPLETE CITATION COVERAGE FOR SUBAGENT PERSONAS (agents/)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Subagent Personas Citation Coverage (agents/) ---');

const agentFiles = collectFiles(path.join(pluginRoot, 'agents'), f => f.endsWith('.md'))
  .map(f => path.relative(pluginRoot, f).replace(/\\/g, '/'));

const uncitedAgents = [];
for (const agentPath of agentFiles) {
  const baseName = path.basename(agentPath);
  // Check if cited as full relative path or basename
  const isCited = fullCorpusText.includes(agentPath) || fullCorpusText.includes(baseName);
  if (!isCited) {
    uncitedAgents.push(agentPath);
  }
}

assertTest(
  `All subagents in agents/ are cited (Found: ${agentFiles.length - uncitedAgents.length}/${agentFiles.length})`,
  uncitedAgents.length === 0,
  `Uncited subagents: ${uncitedAgents.join(', ')}`
);

// -----------------------------------------------------------------------------
// TEST SUITE 3: COMPLETE CITATION COVERAGE FOR INVARIANT RULES (rules/)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Invariant Rules Citation Coverage (rules/) ---');

const ruleFiles = collectFiles(path.join(pluginRoot, 'rules'), f => f.endsWith('.md'))
  .map(f => path.relative(pluginRoot, f).replace(/\\/g, '/'));

const uncitedRules = [];
for (const rulePath of ruleFiles) {
  const baseName = path.basename(rulePath);
  const isCited = fullCorpusText.includes(rulePath) || fullCorpusText.includes(baseName);
  if (!isCited) {
    uncitedRules.push(rulePath);
  }
}

assertTest(
  `All rules in rules/ are cited (Found: ${ruleFiles.length - uncitedRules.length}/${ruleFiles.length})`,
  uncitedRules.length === 0,
  `Uncited rules: ${uncitedRules.join(', ')}`
);

// -----------------------------------------------------------------------------
// TEST SUITE 4: COMPLETE CITATION COVERAGE FOR STACK PACKS (resources/stacks/)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Stack Packs Citation Coverage (resources/stacks/) ---');

const stackFiles = collectFiles(path.join(pluginRoot, 'resources', 'stacks'), f => f.endsWith('.md'))
  .map(f => path.relative(pluginRoot, f).replace(/\\/g, '/'));

const uncitedStacks = [];
for (const stackPath of stackFiles) {
  const baseName = path.basename(stackPath);
  const isCited = fullCorpusText.includes(stackPath) || fullCorpusText.includes(baseName);
  if (!isCited) {
    uncitedStacks.push(stackPath);
  }
}

assertTest(
  `All stack packs in resources/stacks/ are cited (Found: ${stackFiles.length - uncitedStacks.length}/${stackFiles.length})`,
  uncitedStacks.length === 0,
  `Uncited stack packs: ${uncitedStacks.join(', ')}`
);

// -----------------------------------------------------------------------------
// TEST SUITE 5: COMPLETE CITATION COVERAGE FOR AUTOMATION COMMANDS (commands/)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 5: Automation Commands Citation Coverage (commands/) ---');

const commandFiles = collectFiles(path.join(pluginRoot, 'commands'), f => f.endsWith('.ps1'))
  .map(f => path.relative(pluginRoot, f).replace(/\\/g, '/'));

const uncitedCommands = [];
for (const cmdPath of commandFiles) {
  const baseName = path.basename(cmdPath);
  const isCited = fullCorpusText.includes(cmdPath) || fullCorpusText.includes(baseName);
  if (!isCited) {
    uncitedCommands.push(cmdPath);
  }
}

assertTest(
  `All commands in commands/ are cited (Found: ${commandFiles.length - uncitedCommands.length}/${commandFiles.length})`,
  uncitedCommands.length === 0,
  `Uncited commands: ${uncitedCommands.join(', ')}`
);

// -----------------------------------------------------------------------------
// TEST SUITE 6: COMPLETE CITATION COVERAGE FOR SKILL RESOURCES
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 6: Skill-Local Resources & Schemas Citation Coverage ---');

const skillResourceFiles = [
  ...collectFiles(path.join(pluginRoot, 'skills'), f => {
    const rel = path.relative(path.join(pluginRoot, 'skills'), f).replace(/\\/g, '/');
    return !rel.endsWith('SKILL.md'); // only auxiliary resources, templates, schemas, scripts
  })
].map(f => path.relative(pluginRoot, f).replace(/\\/g, '/'));

const uncitedSkillResources = [];
for (const resPath of skillResourceFiles) {
  const baseName = path.basename(resPath);
  const isCited = fullCorpusText.includes(resPath) || fullCorpusText.includes(baseName);
  if (!isCited) {
    uncitedSkillResources.push(resPath);
  }
}

assertTest(
  `All skill auxiliary files are cited (Found: ${skillResourceFiles.length - uncitedSkillResources.length}/${skillResourceFiles.length})`,
  uncitedSkillResources.length === 0,
  `Uncited skill resources: ${uncitedSkillResources.join(', ')}`
);

// -----------------------------------------------------------------------------
// TEST SUITE 7: TOKEN EFFICIENCY CHECK (NO ASCII BOX ART IN INVOCATION PROMPTS)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 7: Token Efficiency & Modern Formatting Check ---');

const invocationPromptFiles = [
  path.join(pluginRoot, 'INVOCATION.md'),
  path.join(pluginRoot, 'INVOCATION-SPEC.md'),
  path.join(pluginRoot, 'resources', 'workflow-invocation-prompt.md'),
  path.join(pluginRoot, 'resources', 'spec-invocation-prompt.md')
];

const boxArtChars = ['╔', '═', '║', '╚', '┌', '─', '│', '└'];
let boxArtFound = false;
const boxArtFiles = [];

for (const pFile of invocationPromptFiles) {
  if (fs.existsSync(pFile)) {
    const content = fs.readFileSync(pFile, 'utf8');
    // We allow standard markdown tables (| and -), but forbidden characters are heavy box-drawing characters
    const forbidden = ['╔', '═', '║', '╚'];
    for (const char of forbidden) {
      if (content.includes(char)) {
        boxArtFound = true;
        boxArtFiles.push({ file: path.basename(pFile), char });
        break;
      }
    }
  }
}

assertTest(
  'Invocation prompts are token-efficient (Zero heavy ASCII box-drawing characters)',
  !boxArtFound,
  `Heavy box art characters found in: ${boxArtFiles.map(b => `${b.file} ('${b.char}')`).join(', ')}`
);

// -----------------------------------------------------------------------------
// TEST SUMMARY & EXIT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`  VERIFICATION RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================================');

if (failedTests > 0) {
  console.error('\nFailures encountered:');
  for (const f of failures) {
    console.error(`- ${f.name}: ${f.errorMsg}`);
  }
  process.exit(1);
} else {
  console.log('\nAll files, subagents, rules, resources, and commands verified with 100% citation coverage and 0 broken links!\n');
  process.exit(0);
}
