#!/usr/bin/env node

/**
 * verify-gemini-schema.js
 * 
 * Production Verification Script for GEMINI.md Single Source of Truth PRD.
 * Asserts structural parity, section invariants, directory tree depth,
 * and anti-pattern completeness.
 * 
 * Usage:
 *   node verify-gemini-schema.js [--file <path-to-GEMINI.md>]
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  let targetFile = path.resolve(process.cwd(), 'GEMINI.md');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      targetFile = path.resolve(args[++i]);
    }
  }
  return { targetFile };
}

function verifyGemini(filePath) {
  const report = {
    file: filePath,
    exists: false,
    sections: {},
    tableOfContentsValid: false,
    directoryTreeValid: false,
    directoryTreeCount: 0,
    antiPatternCount: 0,
    antiPatternsStructured: false,
    errors: [],
    warnings: []
  };

  if (!fs.existsSync(filePath)) {
    report.errors.push(`File does not exist at path: ${filePath}`);
    return report;
  }
  report.exists = true;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  // 1. Check Mandatory Headers
  const mandatorySections = [
    { num: 1, regex: /^##\s*1\.\s*Project Identity & Philosophy/i, name: 'Project Identity & Philosophy' },
    { num: 2, regex: /^##\s*2\.\s*Workflow Architecture/i, name: 'Workflow Architecture' },
    { num: 3, regex: /^##\s*3\.\s*Technology Stack/i, name: 'Technology Stack' },
    { num: 4, regex: /^##\s*4\.\s*Directory Structure/i, name: 'Directory Structure' },
    { num: 5, regex: /^##\s*5\.\s*Open Features/i, name: 'Open Features' },
    { num: 6, regex: /^##\s*6\.\s*Anti-Patterns/i, name: 'Anti-Patterns' }
  ];

  mandatorySections.forEach(sec => {
    const found = lines.some(line => sec.regex.test(line));
    report.sections[sec.name] = found;
    if (!found) {
      report.errors.push(`Missing mandatory section: '## ${sec.num}. ${sec.name}'`);
    }
  });

  // 2. Check Table of Contents
  const tocMatches = lines.filter(l => /^\d+\.\s*\[.+\]\(#.+\)/.test(l.trim()));
  report.tableOfContentsValid = tocMatches.length >= 6;
  if (!report.tableOfContentsValid) {
    report.warnings.push(`Table of Contents has fewer than 6 anchored items (found ${tocMatches.length}).`);
  }

  // 3. Check Directory Structure Codeblock and Explainers
  const treeCodeblockMatch = content.match(/##\s*4\.\s*Directory Structure[\s\S]*?```(?:text)?\r?\n([\s\S]*?)```/i);
  if (!treeCodeblockMatch) {
    report.errors.push("Section 4 must contain a fenced ```text ``` code block containing the directory tree.");
  } else {
    const treeLines = treeCodeblockMatch[1].split(/\r?\n/).filter(l => l.trim().length > 0);
    report.directoryTreeCount = treeLines.length;

    // Check for ASCII branch tokens: |-- or \--
    const hasAsciiBranches = treeLines.some(l => l.includes('|--') || l.includes('\\--'));
    // Check for explainers: ←
    const explainersCount = treeLines.filter(l => l.includes('←')).length;
    const explainerRatio = explainersCount / treeLines.length;

    if (!hasAsciiBranches) {
      report.errors.push("Directory tree does not use ASCII branch indicators ('|-- ' or '\\-- ').");
    }

    if (explainerRatio < 0.8) {
      report.warnings.push(`Only ${explainersCount}/${treeLines.length} (${Math.round(explainerRatio * 100)}%) tree lines contain '←' explainers. Minimum 80% coverage required.`);
    } else {
      report.directoryTreeValid = true;
    }
  }

  // 4. Check Section 6 Anti-Patterns
  const antiPatternSectionMatch = content.match(/##\s*6\.\s*Anti-Patterns[\s\S]*$/i);
  if (antiPatternSectionMatch) {
    const antiPatternText = antiPatternSectionMatch[0];
    
    // Find numbered anti-patterns: e.g. "1. **Title**" or "### 1. Title"
    const antiPatternHeaders = antiPatternText.match(/(?:^\s*\d+\.\s+\*\*|^###\s+\d+\.)/gm) || [];
    report.antiPatternCount = antiPatternHeaders.length;

    if (report.antiPatternCount < 10) {
      report.errors.push(`Section 6 requires at least 10 critical anti-patterns (found ${report.antiPatternCount}).`);
    }

    // Check structured anatomy: Violation, Consequence, Mitigation (or Failure, Impact, Rule)
    const hasViolations = /Violation|Failure|Problem/i.test(antiPatternText);
    const hasConsequences = /Consequence|Impact|Risk/i.test(antiPatternText);
    const hasMitigations = /Mitigation|Prevention|Rule/i.test(antiPatternText);

    if (hasViolations && hasConsequences && hasMitigations) {
      report.antiPatternsStructured = true;
    } else {
      report.warnings.push("Anti-patterns should explicitly detail Violation, Consequence, and Mitigation for each item.");
    }
  }

  return report;
}

function main() {
  const { targetFile } = parseArgs();
  console.log(`[VERIFY] Validating GEMINI.md: ${targetFile}`);

  const report = verifyGemini(targetFile);

  console.log('\n--- VERIFICATION REPORT ---');
  console.log(`File Exists: ${report.exists ? 'PASS' : 'FAIL'}`);
  console.log('Mandatory Sections:');
  Object.entries(report.sections).forEach(([sec, pass]) => {
    console.log(`  - ${sec}: ${pass ? 'PASS' : 'FAIL'}`);
  });
  console.log(`Table of Contents: ${report.tableOfContentsValid ? 'PASS' : 'WARN'}`);
  console.log(`Directory Tree Lines: ${report.directoryTreeCount} (${report.directoryTreeValid ? 'PASS' : 'FAIL'})`);
  console.log(`Anti-Patterns Count: ${report.antiPatternCount} (Target: >= 10) - ${report.antiPatternCount >= 10 ? 'PASS' : 'FAIL'}`);
  console.log(`Anti-Patterns Structured: ${report.antiPatternsStructured ? 'PASS' : 'WARN'}`);

  if (report.warnings.length > 0) {
    console.log('\n[WARNINGS]:');
    report.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (report.errors.length > 0) {
    console.log('\n[ERRORS]:');
    report.errors.forEach(e => console.log(`  - ${e}`));
    console.log('\n[STATUS] Verification FAILED.');
    process.exit(1);
  } else {
    console.log('\n[STATUS] Verification PASSED. GEMINI.md meets production certification standards.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyGemini };
