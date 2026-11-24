<#
.SYNOPSIS
    Automates 5-Tier Mechanical Verification (Type, AST Scanners, Test, Smoke Gates, Scope) for ideal-agentic-workflow.
.DESCRIPTION
    Executes the standardized verification suite for a detected or specified technology stack.
    Ensures S7 Automated Testing requirements are strictly validated with clear pass/fail exit codes:
    Tier 1: Static Type Check (tsc --noEmit)
    Tier 2: Mechanical AST & Regex Scanners (UI Slop, Layout AST, Gesture Parity, Route Integrity, Native Env)
    Tier 3A: Domain-Driven Targeted Tests (DTT)
    Tier 3B: Runtime Bootstrap & Process Health Gate
    Tier 3C: Temporal Lifecycle & Polling Gate
    Tier 3D: Headless Geometry, Buffer Entropy & Coordinate Parity Gate
    Gate 4: Mechanical Scope Gate (verify-scope.ps1)
.PARAMETER Stack
    The identifier of the technology stack pack (e.g. 'web-nextjs-turborepo', 'web-backend-java-spring', 'database-postgres-hibernate-flyway', 'web-backend-python-ai', 'web-backend-rust').
.PARAMETER Target
    Optional targeted test path or test class (e.g. 'src/services/order.test.ts').
.PARAMETER Smoke
    Optional switch to execute Tier 3B-3D Runtime Smoke Verification Gates.
.EXAMPLE
    pwsh -File .\commands\verify-stack.ps1 -Stack web-nextjs-turborepo
    pwsh -File .\commands\verify-stack.ps1 -Stack web-nextjs-turborepo -Smoke
#>

param (
    [string]$Stack,
    [string]$Target,
    [switch]$Smoke
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) {
    Write-Host "[VERIFY-STACK] $msg" -ForegroundColor Cyan
}

function Write-Success([string]$msg) {
    Write-Host "[VERIFY-STACK] [SUCCESS] $msg" -ForegroundColor Green
}

function Write-Fail([string]$msg) {
    Write-Host "[VERIFY-STACK] [FAILURE] $msg" -ForegroundColor Red
}

# Auto-detect stack if not explicitly provided
if (-not $Stack) {
    $activeSessions = Get-ChildItem -Path ".agents" -Directory -Filter "session-*" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($activeSessions -and $activeSessions.Count -gt 0) {
        $contextFile = Join-Path $activeSessions[0].FullName "context.md"
        if (Test-Path $contextFile) {
            $contextText = Get-Content -Path $contextFile -Raw
            if ($contextText -match "database-postgres-hibernate-flyway") { $Stack = "database-postgres-hibernate-flyway" }
            elseif ($contextText -match "web-nextjs-turborepo") { $Stack = "web-nextjs-turborepo" }
            elseif ($contextText -match "web-backend-java-spring") { $Stack = "web-backend-java-spring" }
            elseif ($contextText -match "web-backend-python-ai") { $Stack = "web-backend-python-ai" }
            elseif ($contextText -match "web-backend-rust") { $Stack = "web-backend-rust" }
            elseif ($contextText -match "database-postgres-prisma") { $Stack = "database-postgres-prisma" }
            elseif ($contextText -match "database-mongo-redis") { $Stack = "database-mongo-redis" }
            elseif ($contextText -match "mc-fabric") { $Stack = "mc-fabric" }
            elseif ($contextText -match "mc-neoforge") { $Stack = "mc-neoforge" }
        }
    }
}

if (-not $Stack) {
    Write-Host "Warning: No stack specified and could not auto-detect from .agents/session-*/context.md." -ForegroundColor Yellow
    Write-Host "Defaulting to generic node/npm verification." -ForegroundColor Yellow
    $Stack = "generic-node"
}

Write-Step "Active Stack Pack: $Stack"

$isWindows = $PSVersionTable.PSVersion.Major -ge 5 -and [System.Environment]::OSVersion.Platform -match "Win"

function Run-CommandSafely([string]$label, [string]$cmd) {
    Write-Step "Executing: $label -> $cmd"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-Expression $cmd
        $sw.Stop()
        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
            Write-Fail "$label failed with exit code $LASTEXITCODE in $($sw.ElapsedMilliseconds)ms"
            exit $LASTEXITCODE
        }
        Write-Success "$label passed in $($sw.ElapsedMilliseconds)ms"
    } catch {
        Write-Fail "$label encountered execution error: $_"
        exit 1
    }
}

# Resolve plugin script root
$pluginScriptsDir = Join-Path $PSScriptRoot "..\scripts"
$checkUiSlop = Join-Path $pluginScriptsDir "check-ui-slop.mjs"
$checkLayoutAst = Join-Path $pluginScriptsDir "check-layout-ast.mjs"
$checkGestureParity = Join-Path $pluginScriptsDir "check-gesture-parity.mjs"
$checkRouteIntegrity = Join-Path $pluginScriptsDir "check-route-integrity.mjs"
$verifyRuntimeEnv = Join-Path $pluginScriptsDir "verify-runtime-env.mjs"

# Execute Stack-Specific Verification Sequence
switch ($Stack) {
    "web-nextjs-turborepo" {
        Run-CommandSafely "Tier 1: TypeScript Check" "npx tsc --noEmit"
        
        # Tier 2: Mechanical AST & Regex Scanners
        if (Test-Path $checkUiSlop) { Run-CommandSafely "Tier 2A: UI Slop & Jargon Scanner" "node `"$checkUiSlop`"" }
        if (Test-Path $checkLayoutAst) { Run-CommandSafely "Tier 2B: Layout Containing-Block & Aspect AST Check" "node `"$checkLayoutAst`"" }
        if (Test-Path $checkGestureParity) { Run-CommandSafely "Tier 2C: Touch & Gesture Parity Check" "node `"$checkGestureParity`"" }
        if (Test-Path $checkRouteIntegrity) { Run-CommandSafely "Tier 2D: Route & Asset Sandbox Integrity" "node `"$checkRouteIntegrity`"" }
        if (Test-Path $verifyRuntimeEnv) { Run-CommandSafely "Tier 2E: Runtime Env & Loader Compatibility" "node `"$verifyRuntimeEnv`"" }

        Run-CommandSafely "Tier 2: Lint Check" "npm run lint"

        if ($Target) {
            Run-CommandSafely "Tier 3A: Targeted Test" "npx vitest run $Target"
        } else {
            Run-CommandSafely "Tier 3A: Test Suite" "npm test -- --run"
        }

        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Component Mount & Runtime Smoke Gate" "npx vitest run src/**/smoke.test.ts*"
            Run-CommandSafely "Tier 3C: Temporal Lifecycle & Polling Smoke Gate" "npx vitest run src/**/lifecycle.test.ts*"
            Run-CommandSafely "Tier 3D: Headless Geometry & Buffer Entropy Gate" "npx vitest run src/**/quality.test.ts*"
        }
    }
    "database-postgres-hibernate-flyway" {
        $gradleCmd = if ($isWindows) { ".\gradlew.bat" } else { "./gradlew" }
        if (Test-Path "pom.xml") {
            Run-CommandSafely "Tier 1: Flyway Info" "mvn flyway:info"
            Run-CommandSafely "Tier 2: Compile & Metamodel" "mvn test-compile"
            if ($Target) {
                Run-CommandSafely "Tier 3A: Targeted Test" "mvn test -Dtest=$Target"
            } else {
                Run-CommandSafely "Tier 3A: Test Suite" "mvn test"
            }
            if ($Smoke) {
                Run-CommandSafely "Tier 3B: Persistence Smoke Gate (Real DB Cycle)" "mvn test -Dtest=*PersistenceSmokeTest*,*SmokeTest*"
            }
        } else {
            Run-CommandSafely "Tier 1: Flyway Info" "$gradleCmd flywayInfo"
            Run-CommandSafely "Tier 2: Compile & Metamodel" "$gradleCmd compileJava"
            if ($Target) {
                Run-CommandSafely "Tier 3A: Targeted Test" "$gradleCmd test --tests `"*$Target*`""
            } else {
                Run-CommandSafely "Tier 3A: Test Suite" "$gradleCmd test"
            }
            if ($Smoke) {
                Run-CommandSafely "Tier 3B: Persistence Smoke Gate (Real DB Cycle)" "$gradleCmd test --tests `"*PersistenceSmokeTest*`" --tests `"*SmokeTest*`""
            }
        }
    }
    "web-backend-java-spring" {
        $gradleCmd = if ($isWindows) { ".\gradlew.bat" } else { "./gradlew" }
        if (Test-Path "pom.xml") {
            Run-CommandSafely "Tier 1: Compile" "mvn compile"
            Run-CommandSafely "Tier 2: Checkstyle" "mvn checkstyle:check"
            if ($Target) {
                Run-CommandSafely "Tier 3A: Targeted Test" "mvn test -Dtest=$Target"
            } else {
                Run-CommandSafely "Tier 3A: Test Suite" "mvn test"
            }
            if ($Smoke) {
                Run-CommandSafely "Tier 3B: Spring Context & DataSource Smoke Gate" "mvn test -Dtest=*SmokeTest*,*ApplicationSmokeTest*"
            }
        } else {
            Run-CommandSafely "Tier 1: Compile" "$gradleCmd compileJava"
            Run-CommandSafely "Tier 2: Checkstyle" "$gradleCmd check"
            if ($Target) {
                Run-CommandSafely "Tier 3A: Targeted Test" "$gradleCmd test --tests `"*$Target*`""
            } else {
                Run-CommandSafely "Tier 3A: Test Suite" "$gradleCmd test"
            }
            if ($Smoke) {
                Run-CommandSafely "Tier 3B: Spring Context & DataSource Smoke Gate" "$gradleCmd test --tests `"*SmokeTest*`" --tests `"*ApplicationSmokeTest*`""
            }
        }
    }
    "web-backend-python-ai" {
        Run-CommandSafely "Tier 1: Type Checking" "mypy src"
        Run-CommandSafely "Tier 2: Code Hygiene" "ruff check ."
        if ($Target) {
            Run-CommandSafely "Tier 3A: Targeted Test" "pytest $Target -v"
        } else {
            Run-CommandSafely "Tier 3A: Test Suite" "pytest -v"
        }
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Async Lifespan & Connection Pool Smoke Gate" "pytest tests/smoke/ -v"
        }
    }
    "web-backend-rust" {
        Run-CommandSafely "Tier 1: Cargo Check" "cargo check"
        Run-CommandSafely "Tier 2: Clippy" "cargo clippy -- -D warnings"
        if ($Target) {
            Run-CommandSafely "Tier 3A: Targeted Test" "cargo test $Target"
        } else {
            Run-CommandSafely "Tier 3A: Test Suite" "cargo test"
        }
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Tokio Runtime & Ephemeral Socket Smoke Gate" "cargo test --test smoke"
        }
    }
    "database-postgres-prisma" {
        Run-CommandSafely "Tier 1: Prisma Validation" "npx prisma validate"
        Run-CommandSafely "Tier 2: Lint Check" "npm run lint"
        Run-CommandSafely "Tier 3A: Integration Tests" "npm test -- --run"
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Prisma CRUD Persistence Smoke Gate" "npm test -- -t `"prisma.smoke`""
        }
    }
    "database-mongo-redis" {
        Run-CommandSafely "Tier 1: Schema Validation" "npx tsc --noEmit"
        Run-CommandSafely "Tier 2: Lint Check" "npm run lint"
        Run-CommandSafely "Tier 3A: Integration Tests" "npm test -- --run"
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: BSON Persistence & Cache TTL Smoke Gate" "npm test -- -t `"smoke`""
        }
    }
    "mc-fabric" {
        $gradleCmd = if ($isWindows) { ".\gradlew.bat" } else { "./gradlew" }
        Run-CommandSafely "Tier 1: Loom Build" "$gradleCmd build -x test"
        Run-CommandSafely "Tier 2: Check" "$gradleCmd check"
        if ($Target) {
            Run-CommandSafely "Tier 3A: Targeted Test" "$gradleCmd test --tests `"*$Target*`""
        } else {
            Run-CommandSafely "Tier 3A: Test Suite" "$gradleCmd test"
        }
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Mod Initializer Smoke Gate" "$gradleCmd test --tests `"*SmokeTest*`""
        }
    }
    "mc-neoforge" {
        $gradleCmd = if ($isWindows) { ".\gradlew.bat" } else { "./gradlew" }
        Run-CommandSafely "Tier 1: Compile" "$gradleCmd compileJava"
        Run-CommandSafely "Tier 2: Check" "$gradleCmd check"
        if ($Target) {
            Run-CommandSafely "Tier 3A: Targeted Test" "$gradleCmd test --tests `"*$Target*`""
        } else {
            Run-CommandSafely "Tier 3A: Test Suite" "$gradleCmd test"
        }
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Mod Bus & DeferredRegister Smoke Gate" "$gradleCmd test --tests `"*SmokeTest*`""
        }
    }
    default {
        Run-CommandSafely "Tier 1: TypeScript Check" "npx tsc --noEmit"
        
        # Run Tier 2 scanners if scripts exist
        if (Test-Path $checkUiSlop) { Run-CommandSafely "Tier 2A: UI Slop & Jargon Scanner" "node `"$checkUiSlop`"" }
        if (Test-Path $checkLayoutAst) { Run-CommandSafely "Tier 2B: Layout Containing-Block AST Check" "node `"$checkLayoutAst`"" }
        if (Test-Path $checkGestureParity) { Run-CommandSafely "Tier 2C: Touch & Gesture Parity Check" "node `"$checkGestureParity`"" }
        if (Test-Path $checkRouteIntegrity) { Run-CommandSafely "Tier 2D: Route & Asset Integrity Check" "node `"$checkRouteIntegrity`"" }
        if (Test-Path $verifyRuntimeEnv) { Run-CommandSafely "Tier 2E: Runtime Environment Compatibility" "node `"$verifyRuntimeEnv`"" }

        Run-CommandSafely "Tier 2: Lint Check" "npm run lint"
        Run-CommandSafely "Tier 3A: Test Suite" "npm test"
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Runtime Smoke Gate" "npm test -- -t `"smoke`""
        }
    }
}

# Gate 4: Pre-Review Mechanical Scope Gate
$verifyScopeScript = Join-Path $PSScriptRoot "verify-scope.ps1"
if (Test-Path $verifyScopeScript) {
    Run-CommandSafely "Gate 4: Mechanical Scope Compliance Check" "pwsh -File `"$verifyScopeScript`""
}

Write-Success "All verification tiers passed successfully for $Stack."
exit 0
