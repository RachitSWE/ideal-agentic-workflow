#!/usr/bin/env node
/**
 * session-bootstrap-hook.mjs
 *
 * Non-blocking Antigravity SessionStart hook for ideal-agentic-workflow.
 * Reads workspace metadata from stdin JSON, detects GEMINI.md and matching
 * stack rules in resources/stack-rules/, and injects a concise startup briefing.
 * Strictly fail-open: always exits 0 with valid JSON so normal tools are never barred.
 */

import fs from 'node:fs';
import path from 'node:path';

function failOpen(injectSteps = []) {
  try {
    process.stdout.write(JSON.stringify({ injectSteps }));
  } catch {
    process.stdout.write('{"injectSteps":[]}');
  }
  process.exit(0);
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readTextSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function detectWorkspaceProfile(rootDir) {
  const stackRules = new Set();
  const stackPacks = new Set();
  const labels = [];

  const geminiPath = path.join(rootDir, 'GEMINI.md');
  const hasGemini = fs.existsSync(geminiPath);
  const geminiText = hasGemini ? readTextSafe(geminiPath).toLowerCase() : '';

  const pomPath = path.join(rootDir, 'pom.xml');
  const gradleGroovy = path.join(rootDir, 'build.gradle');
  const gradleKts = path.join(rootDir, 'build.gradle.kts');
  const jvmText = [pomPath, gradleGroovy, gradleKts].map(readTextSafe).join('\n');

  if (jvmText.trim()) {
    if (/fabric-loom/i.test(jvmText)) {
      labels.push('Minecraft Fabric');
      stackPacks.add('resources/stacks/minecraft/mc-fabric.md');
      stackRules.add('resources/stack-rules/rules-minecraft-fabric.md');
    } else if (/net\.neoforged|minecraftforge/i.test(jvmText)) {
      labels.push('Minecraft NeoForge/Forge');
      stackPacks.add('resources/stacks/minecraft/mc-forge.md');
      stackRules.add('resources/stack-rules/rules-minecraft-forge.md');
    } else {
      labels.push('Java / Spring Boot');
      stackPacks.add('resources/stacks/backend/backend-java.md');
      stackPacks.add('resources/stacks/backend/java-databases.md');
      stackRules.add('resources/stack-rules/rules-backend-java.md');
      stackRules.add('resources/stack-rules/rules-backend-java-databases.md');
      if (/postgresql|flyway|hibernate/i.test(jvmText)) {
        stackPacks.add('resources/stacks/database/postgresql.md');
        stackRules.add('resources/stack-rules/rules-database-postgresql.md');
      }
      if (/mongodb/i.test(jvmText)) {
        stackPacks.add('resources/stacks/database/mongodb.md');
        stackRules.add('resources/stack-rules/rules-database-mongodb.md');
      }
      if (/redis/i.test(jvmText)) {
        stackPacks.add('resources/stacks/database/redis.md');
        stackRules.add('resources/stack-rules/rules-database-redis.md');
      }
    }
  }

  const pkg = readJsonSafe(path.join(rootDir, 'package.json'));
  const frontendPkg = readJsonSafe(path.join(rootDir, 'frontend', 'package.json'));
  const combinedDeps = {
    ...(pkg?.dependencies || {}),
    ...(pkg?.devDependencies || {}),
    ...(frontendPkg?.dependencies || {}),
    ...(frontendPkg?.devDependencies || {}),
  };
  const depNames = new Set(Object.keys(combinedDeps));

  if (depNames.has('next')) {
    const hasApp =
      fs.existsSync(path.join(rootDir, 'src', 'app')) ||
      fs.existsSync(path.join(rootDir, 'app')) ||
      fs.existsSync(path.join(rootDir, 'frontend', 'src', 'app'));
    if (hasApp) {
      labels.push('Next.js App Router');
      stackPacks.add('resources/stacks/frontend/nextjs.md');
      stackRules.add('resources/stack-rules/rules-frontend-nextjs.md');
    } else {
      labels.push('Next.js Pages Router');
      stackPacks.add('resources/stacks/frontend/nextjs-pages.md');
      stackRules.add('resources/stack-rules/rules-frontend-nextjs-pages.md');
    }
  } else if (depNames.has('@angular/core')) {
    labels.push('Angular');
    stackPacks.add('resources/stacks/frontend/angular.md');
    stackRules.add('resources/stack-rules/rules-frontend-angular.md');
  }

  if (depNames.has('prisma') || depNames.has('@prisma/client') || depNames.has('pg')) {
    labels.push('PostgreSQL');
    stackPacks.add('resources/stacks/database/postgresql.md');
    stackRules.add('resources/stack-rules/rules-database-postgresql.md');
  }
  if (depNames.has('mongodb') || depNames.has('mongoose')) {
    labels.push('MongoDB');
    stackPacks.add('resources/stacks/database/mongodb.md');
    stackRules.add('resources/stack-rules/rules-database-mongodb.md');
  }
  if (depNames.has('redis') || depNames.has('ioredis') || depNames.has('@upstash/redis')) {
    labels.push('Redis');
    stackPacks.add('resources/stacks/database/redis.md');
    stackRules.add('resources/stack-rules/rules-database-redis.md');
  }
  if (
    depNames.has('discord.js') ||
    depNames.has('opentype.js') ||
    /discord\.js|welcomer|opentype\.js/i.test(geminiText)
  ) {
    labels.push('Discord Bot / Canvas Customizer');
    stackPacks.add('resources/stacks/discord-bot-customizer.md');
    stackRules.add('resources/stack-rules/rules-discord-bot-customizer.md');
  }

  if (
    fs.existsSync(path.join(rootDir, 'pyproject.toml')) ||
    fs.existsSync(path.join(rootDir, 'requirements.txt'))
  ) {
    labels.push('Python');
    stackPacks.add('resources/stacks/backend/backend-python.md');
    stackPacks.add('resources/stacks/backend/python-databases.md');
    stackRules.add('resources/stack-rules/rules-backend-python.md');
    stackRules.add('resources/stack-rules/rules-backend-python-databases.md');
  }

  if (fs.existsSync(path.join(rootDir, 'Cargo.toml'))) {
    labels.push('Rust');
    stackPacks.add('resources/stacks/backend/backend-rust.md');
    stackPacks.add('resources/stacks/backend/rust-databases.md');
    stackRules.add('resources/stack-rules/rules-backend-rust.md');
    stackRules.add('resources/stack-rules/rules-backend-rust-databases.md');
  }

  // Fallback keyword hints from GEMINI.md if manifests are nested
  if (geminiText) {
    if (/next\.js|app router/i.test(geminiText) && !stackRules.has('resources/stack-rules/rules-frontend-nextjs.md')) {
      stackRules.add('resources/stack-rules/rules-frontend-nextjs.md');
    }
    if (/spring boot/i.test(geminiText) && !stackRules.has('resources/stack-rules/rules-backend-java.md')) {
      stackRules.add('resources/stack-rules/rules-backend-java.md');
    }
    if (/postgres|postgresql|flyway|prisma/i.test(geminiText)) {
      stackRules.add('resources/stack-rules/rules-database-postgresql.md');
    }
    if (/fastapi|python/i.test(geminiText) && !stackRules.has('resources/stack-rules/rules-backend-python.md')) {
      stackRules.add('resources/stack-rules/rules-backend-python.md');
    }
  }

  let activeSession = null;
  const agentsDir = path.join(rootDir, '.agents');
  if (fs.existsSync(agentsDir)) {
    const sessions = fs
      .readdirSync(agentsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('session-'))
      .map((d) => d.name)
      .sort()
      .reverse();
    if (sessions.length > 0) activeSession = sessions[0];
  }

  return {
    hasGemini,
    labels,
    stackRules: [...stackRules],
    stackPacks: [...stackPacks],
    activeSession,
  };
}

try {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    failOpen();
  }

  let input = {};
  if (raw && raw.trim()) {
    try {
      input = JSON.parse(raw);
    } catch {
      failOpen();
    }
  }

  const envFallback =
    (process.env.WORKSPACE_PATHS && process.env.WORKSPACE_PATHS.split(path.delimiter)[0]) ||
    process.env.GEMINI_WORKSPACE_PATH ||
    '';

  const workspaceRoot =
    (Array.isArray(input.workspacePaths) && input.workspacePaths[0]) || input.cwd || envFallback;
  if (!workspaceRoot || !fs.existsSync(workspaceRoot)) {
    failOpen();
  }

  const profile = detectWorkspaceProfile(workspaceRoot);
  const stackLine =
    profile.stackRules.length > 0
      ? `Detected Stack Rules (load via view_file before coding): ${profile.stackRules.join(', ')}`
      : 'Detected Stack Rules: none matched from root manifests; match via resources/stacks/_stack-composer.md after reading GEMINI.md.';

  const message = [
    '[ideal-agentic-workflow v2.0 Session Bootstrap]',
    `Workspace Root: ${workspaceRoot}`,
    `Project Truth (GEMINI.md): ${profile.hasGemini ? 'PRESENT (read GEMINI.md before editing source files)' : 'NOT FOUND (consider skills/s0-repo-architect/SKILL.md to establish GEMINI.md)'}`,
    `Detected Stacks: ${profile.labels.length > 0 ? profile.labels.join(', ') : 'Generic / Unknown'}`,
    stackLine,
    profile.activeSession
      ? `Existing Session Folder Detected: .agents/${profile.activeSession}/ (check task.md for unfinished work)`
      : 'Active Session Folder: none yet',
    'Mandatory Orchestrator Router: skills/s1-orchestrator/SKILL.md (routes Standard S0-S11, Spec SP1-SP6, plus Bugfix, Perf-Hillclimb, Prototype, Investigation, Refactor, and Autonomous tracks).',
    'Core Rules Active: rules/AGENTS.md (AP-001..AP-010, EP-01..EP-12, strict 1 OOP type/file & <=2 inline JSX children).',
  ].join('\n');

  failOpen([
    {
      systemMessage: {
        systemMessage: message,
      },
    },
  ]);
} catch {
  failOpen();
}
