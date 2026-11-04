<#
.SYNOPSIS
    Automated Quickstart S0/S1 Bootstrapper for ideal-agentic-workflow v1.3.3.
.DESCRIPTION
    Scans the target repository, auto-detects active tech stacks, generates a unique
    session SHA, scaffolds the canonical .agents/session-[SHA]/ directory tree,
    pre-populates context.md with matching stack packs and reviewer assignments,
    and initializes CHECKLIST.md.
.PARAMETER TargetDir
    The root path of the project to bootstrap. Defaults to the current working directory.
.PARAMETER Mode
    Operating mode: standard (default), fast, trivial, or duolithic.
#>

param(
    [string]$TargetDir = (Get-Location).Path,
    [ValidateSet("standard", "fast", "trivial", "duolithic")]
    [string]$Mode = "standard"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   IDEAL-AGENTIC-WORKFLOW v1.3.3: SESSION BOOTSTRAPPER   " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# Verify Target Directory
if (-not (Test-Path $TargetDir)) {
    Write-Error "Target directory does not exist: $TargetDir"
}

# Resolve canonical script roots
$pluginRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$initSessionScript = Join-Path $pluginRoot "commands/init-session.ps1"

if (-not (Test-Path $initSessionScript)) {
    Write-Error "Could not locate commands/init-session.ps1 at $initSessionScript"
}

# 1. Initialize session using core command
$sessionSha = & $initSessionScript -ProjectRoot $TargetDir
$sessionDir = Join-Path $TargetDir ".agents/session-$sessionSha"

# 2. Record operating mode
$modeFile = Join-Path $sessionDir "mode.txt"
Set-Content -Path $modeFile -Value $Mode -Encoding UTF8

# 3. Detect Tech Stack Markers
$detectedStacks = @()
$stackPacks = @()
$ruleFiles = @()
$reviewers = @("agents/fullstack-implementation-reviewer.md")

# Java / Spring Boot / Minecraft
if (Test-Path (Join-Path $TargetDir "pom.xml")) {
    $pomContent = Get-Content (Join-Path $TargetDir "pom.xml") -Raw -ErrorAction SilentlyContinue
    if ($pomContent -match "fabric-loom") {
        $detectedStacks += "Minecraft Fabric (Maven)"
        $stackPacks += "resources/stacks/minecraft/mc-fabric.md"
        $ruleFiles += "rules/rules-minecraft-fabric.md"
        $reviewers += "agents/mc-fabric-reviewer.md"
    } else {
        $detectedStacks += "Java / Spring Boot (Maven)"
        $stackPacks += "resources/stacks/backend/backend-java.md"
        $stackPacks += "resources/stacks/backend/java-databases.md"
        $ruleFiles += "rules/rules-backend-java.md"
        $ruleFiles += "rules/rules-backend-java-databases.md"
        $reviewers += "agents/spring-boot-reviewer.md"
    }
} elseif ((Test-Path (Join-Path $TargetDir "build.gradle")) -or (Test-Path (Join-Path $TargetDir "build.gradle.kts"))) {
    $gradleContent = ""
    if (Test-Path (Join-Path $TargetDir "build.gradle")) { $gradleContent += Get-Content (Join-Path $TargetDir "build.gradle") -Raw -ErrorAction SilentlyContinue }
    if (Test-Path (Join-Path $TargetDir "build.gradle.kts")) { $gradleContent += Get-Content (Join-Path $TargetDir "build.gradle.kts") -Raw -ErrorAction SilentlyContinue }

    if ($gradleContent -match "fabric-loom") {
        $detectedStacks += "Minecraft Fabric (Gradle)"
        $stackPacks += "resources/stacks/minecraft/mc-fabric.md"
        $ruleFiles += "rules/rules-minecraft-fabric.md"
        $reviewers += "agents/mc-fabric-reviewer.md"
    } elseif ($gradleContent -match "net.neoforged") {
        $detectedStacks += "Minecraft NeoForge (Gradle)"
        $stackPacks += "resources/stacks/minecraft/mc-forge.md"
        $ruleFiles += "rules/rules-minecraft-forge.md"
        $reviewers += "agents/mc-neoforge-reviewer.md"
    } else {
        $detectedStacks += "Java / Spring Boot (Gradle)"
        $stackPacks += "resources/stacks/backend/backend-java.md"
        $stackPacks += "resources/stacks/backend/java-databases.md"
        $ruleFiles += "rules/rules-backend-java.md"
        $ruleFiles += "rules/rules-backend-java-databases.md"
        $reviewers += "agents/spring-boot-reviewer.md"
    }
}

# Node.js / Next.js / Angular
if (Test-Path (Join-Path $TargetDir "package.json")) {
    $pkgJson = Get-Content (Join-Path $TargetDir "package.json") -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    $allDeps = @()
    if ($pkgJson.dependencies) { $allDeps += $pkgJson.dependencies.PSObject.Properties.Name }
    if ($pkgJson.devDependencies) { $allDeps += $pkgJson.devDependencies.PSObject.Properties.Name }

    if ($allDeps -contains "next") {
        $hasAppRouter = (Test-Path (Join-Path $TargetDir "src/app")) -or (Test-Path (Join-Path $TargetDir "app"))
        if ($hasAppRouter) {
            $detectedStacks += "Next.js 16+ App Router / React 19"
            $stackPacks += "resources/stacks/frontend/nextjs.md"
            $ruleFiles += "rules/rules-frontend-nextjs.md"
            $reviewers += "agents/nextjs-turborepo-reviewer.md"
        } else {
            $detectedStacks += "Next.js Pages Router / React 19"
            $stackPacks += "resources/stacks/frontend/nextjs-pages.md"
            $ruleFiles += "rules/rules-frontend-nextjs-pages.md"
            $reviewers += "agents/nextjs-turborepo-reviewer.md"
        }
    } elseif ($allDeps -contains "@angular/core") {
        $detectedStacks += "Angular 21+ LTS (Signals / Zoneless)"
        $stackPacks += "resources/stacks/frontend/angular.md"
        $ruleFiles += "rules/rules-frontend-angular.md"
        $reviewers += "agents/angular-signals-reviewer.md"
    }

    if ($allDeps -contains "prisma" -or $allDeps -contains "@prisma/client") {
        $detectedStacks += "PostgreSQL + Prisma ORM"
        $stackPacks += "resources/stacks/database/postgresql.md"
        $ruleFiles += "rules/rules-database-postgresql.md"
        $reviewers += "agents/postgres-prisma-reviewer.md"
    }
    if ($allDeps -contains "mongodb" -or $allDeps -contains "mongoose") {
        $detectedStacks += "MongoDB"
        $stackPacks += "resources/stacks/database/mongodb.md"
        $ruleFiles += "rules/rules-database-mongodb.md"
        $reviewers += "agents/mongo-redis-reviewer.md"
    }
    if ($allDeps -contains "redis" -or $allDeps -contains "ioredis" -or $allDeps -contains "@upstash/redis") {
        $detectedStacks += "Redis Cache"
        $stackPacks += "resources/stacks/database/redis.md"
        $ruleFiles += "rules/rules-database-redis.md"
    }
}

# Python
if ((Test-Path (Join-Path $TargetDir "pyproject.toml")) -or (Test-Path (Join-Path $TargetDir "requirements.txt"))) {
    $detectedStacks += "Python 3.12+ (FastAPI / AI)"
    $stackPacks += "resources/stacks/backend/backend-python.md"
    $stackPacks += "resources/stacks/backend/python-databases.md"
    $ruleFiles += "rules/rules-backend-python.md"
    $ruleFiles += "rules/rules-backend-python-databases.md"
    $reviewers += "agents/python-ai-reviewer.md"
}

# Rust
if (Test-Path (Join-Path $TargetDir "Cargo.toml")) {
    $detectedStacks += "Rust 1.82+ (Axum / Tokio)"
    $stackPacks += "resources/stacks/backend/backend-rust.md"
    $stackPacks += "resources/stacks/backend/rust-databases.md"
    $ruleFiles += "rules/rules-backend-rust.md"
    $ruleFiles += "rules/rules-backend-rust-databases.md"
    $reviewers += "agents/rust-systems-reviewer.md"
}

# Fallback if unmapped
if ($detectedStacks.Count -eq 0) {
    $detectedStacks += "Generic Polyglot / Web Stack"
}

# 4. Populate context.md
$contextContent = @"
# Session Context: session-$sessionSha

## 1. Operating Parameters
- **Session SHA**: $sessionSha
- **Operating Mode**: $Mode
- **Project Directory**: $TargetDir
- **Timestamp**: $([DateTime]::UtcNow.ToString("o"))

## 2. Detected Tech Stacks
$($detectedStacks | ForEach-Object { "- $_" } | Out-String)
## 3. Active Canonical Stack Packs
$($stackPacks | ForEach-Object { "- [`$_`](../../$_)" } | Out-String)
## 4. Active Enforceable Rule Charters
$($ruleFiles | ForEach-Object { "- [`$_`](../../$_)" } | Out-String)
## 5. Assigned S8 Peer Reviewers
$($reviewers | Select-Object -Unique | ForEach-Object { "- [`$_`](../../$_)" } | Out-String)
"@

$contextFile = Join-Path $sessionDir "context.md"
Set-Content -Path $contextFile -Value $contextContent -Encoding UTF8

# Summary Banner
Write-Host " [SUCCESS] Session initialized successfully!" -ForegroundColor Green
Write-Host "   SHA:          $sessionSha" -ForegroundColor Yellow
Write-Host "   Mode:         $Mode" -ForegroundColor White
Write-Host "   Directory:    $sessionDir" -ForegroundColor Gray
Write-Host "   Detected:     $($detectedStacks -join ', ')" -ForegroundColor Cyan
Write-Host "`nTo begin the agent session, invoke:" -ForegroundColor Magenta
Write-Host "   /invoke-workflow" -ForegroundColor Yellow -NoNewline
Write-Host " or prompt Antigravity to proceed with S1 Orchestrator for session-$sessionSha.`n"
