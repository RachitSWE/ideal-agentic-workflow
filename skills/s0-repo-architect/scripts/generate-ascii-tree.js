#!/usr/bin/env node

/**
 * generate-ascii-tree.js
 * 
 * Deterministic ASCII Directory Tree Generator for Production Repositories.
 * Executes `git ls-files` to inspect tracked files, constructs a recursive hierarchy,
 * renders ASCII tree branches (`|-- `, `\-- `), and supports aligned one-line explainers.
 * 
 * Usage:
 *   node generate-ascii-tree.js [--cwd <repo-path>] [--output <file>] [--explainers <json-map>]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    cwd: process.cwd(),
    output: null,
    explainersFile: null,
    alignColumn: 42
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cwd' && args[i + 1]) {
      options.cwd = path.resolve(args[++i]);
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = path.resolve(args[++i]);
    } else if (args[i] === '--explainers' && args[i + 1]) {
      options.explainersFile = path.resolve(args[++i]);
    } else if (args[i] === '--align' && args[i + 1]) {
      options.alignColumn = parseInt(args[++i], 10) || 42;
    }
  }

  return options;
}

function getTrackedFiles(repoRoot) {
  try {
    const stdout = execSync('git ls-files', {
      encoding: 'utf-8',
      cwd: repoRoot,
      maxBuffer: 32 * 1024 * 1024
    });
    return stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(file => file.replace(/\\/g, '/')); // Normalize path separators to POSIX
  } catch (err) {
    console.error(`[ERROR] Failed to execute git ls-files in: ${repoRoot}`);
    console.error(err.message);
    process.exit(1);
  }
}

function buildTree(files) {
  const root = {};
  for (const file of files) {
    const segments = file.split('/');
    let current = root;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (i === segments.length - 1) {
        current[segment] = null; // Leaf file node
      } else {
        if (!current[segment] || current[segment] === null) {
          current[segment] = {};
        }
        current = current[segment];
      }
    }
  }
  return root;
}

function renderAsciiTree(node, prefix = '') {
  const entries = Object.keys(node).sort((a, b) => {
    const aIsDir = node[a] !== null;
    const bIsDir = node[b] !== null;
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  let lines = [];
  entries.forEach((entry, idx) => {
    const isLast = idx === entries.length - 1;
    const branch = isLast ? '\\-- ' : '|-- ';
    const isDir = node[entry] !== null;

    if (isDir) {
      lines.push({
        rawLine: `${prefix}${branch}${entry}/`,
        name: entry,
        isDir: true,
        depth: Math.floor(prefix.length / 4) + 1
      });
      const childPrefix = prefix + (isLast ? '    ' : '|   ');
      lines = lines.concat(renderAsciiTree(node[entry], childPrefix));
    } else {
      lines.push({
        rawLine: `${prefix}${branch}${entry}`,
        name: entry,
        isDir: false,
        depth: Math.floor(prefix.length / 4) + 1
      });
    }
  });

  return lines;
}

function applyExplainers(renderedLines, rootName, explainers, alignCol) {
  const currentStack = [];
  const annotatedLines = [];

  // Root directory line
  const rootExplainer = explainers['root'] || explainers[`${rootName}/`] || 'Root project repository';
  const rootPadding = ' '.repeat(Math.max(1, alignCol - `${rootName}/`.length));
  annotatedLines.push(`${rootName}/${rootPadding}← ${rootExplainer}`);

  for (const item of renderedLines) {
    const depth = item.depth;
    currentStack.length = depth - 1;
    currentStack.push(item.name);

    const relativePath = item.isDir ? `${currentStack.join('/')}/` : currentStack.join('/');
    const explainer = explainers[relativePath] || explainers[item.name] || 'Source file or module';

    const padding = ' '.repeat(Math.max(1, alignCol - item.rawLine.length));
    annotatedLines.push(`${item.rawLine}${padding}← ${explainer}`);
  }

  return annotatedLines;
}

function main() {
  const options = parseArgs();
  const repoName = path.basename(options.cwd);
  console.log(`[INFO] Scanning tracked files in: ${options.cwd}`);

  const trackedFiles = getTrackedFiles(options.cwd);
  console.log(`[INFO] Discovered ${trackedFiles.length} tracked files.`);

  const tree = buildTree(trackedFiles);
  const rawTreeLines = renderAsciiTree(tree, '  ');

  let outputText;
  if (options.explainersFile && fs.existsSync(options.explainersFile)) {
    console.log(`[INFO] Loading explainers from: ${options.explainersFile}`);
    const explainers = JSON.parse(fs.readFileSync(options.explainersFile, 'utf-8'));
    const annotated = applyExplainers(rawTreeLines, repoName, explainers, options.alignColumn);
    outputText = annotated.join('\n');
  } else {
    // Generate raw tree with placeholders
    const rootLine = `${repoName}/`;
    const bodyLines = rawTreeLines.map(l => l.rawLine);
    outputText = [rootLine, ...bodyLines].join('\n');
  }

  if (options.output) {
    fs.writeFileSync(options.output, outputText, 'utf-8');
    console.log(`[SUCCESS] Tree successfully written to: ${options.output}`);
  } else {
    console.log('\n--- GENERATED TREE ---');
    console.log(outputText);
    console.log('----------------------');
  }
}

if (require.main === module) {
  main();
}

module.exports = { getTrackedFiles, buildTree, renderAsciiTree, applyExplainers };
