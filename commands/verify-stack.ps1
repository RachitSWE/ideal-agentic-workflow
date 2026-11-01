<#
.SYNOPSIS
    Automates Tier 1 (Type/Compile), Tier 2 (Lint), and Tier 3 (Test) verification for ideal-agentic-workflow.
.DESCRIPTION
    Executes the standardized verification suite for a detected or specified technology stack.
    Ensures S7 Automated Testing requirements are strictly validated with clear pass/fail exit codes.
.PARAMETER Stack
    The identifier of the technology stack pack (e.g. 'web-nextjs-turborepo', 'web-backend-java-spring', 'database-postgres-hibernate-flyway', 'web-backend-python-ai', 'web-backend-rust').
.PARAMETER Target
    Optional targeted test path or test class (e.g. 'src/services/order.test.ts').
.PARAMETER Smoke
    Optional switch to execute Tier 3B Runtime Smoke Verification Gate (Spring Boot context load, persistence cycle, cache round-trip).
.EXAMPLE
    pwsh -File .\commands\verify-stack.ps1 -Stack web-nextjs-turborepo
    pwsh -File .\commands\verify-stack.ps1 -Stack database-postgres-hibernate-flyway -Smoke
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
    Write-Step "Executing Tier: $label -> $cmd"
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

switch ($Stack) {
    "web-nextjs-turborepo" {
        Run-CommandSafely "Tier 1: TypeScript Check" "npx tsc --noEmit"
        Run-CommandSafely "Tier 2: Lint Check" "npm run lint"
        if ($Target) {
            Run-CommandSafely "Tier 3A: Targeted Test" "npx vitest run $Target"
        } else {
            Run-CommandSafely "Tier 3A: Test Suite" "npm test -- --run"
        }
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Component Mount & Smoke Gate" "npx vitest run src/**/smoke.test.ts*"
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
                Run-CommandSafely "Tier 3B: Runtime Smoke Gate (Context Load)" "mvn test -Dtest=*SmokeTest*"
            }
        } else {
            Run-CommandSafely "Tier 1: Compile" "$gradleCmd compileJava"
            Run-CommandSafely "Tier 2: Checkstyle" "$gradleCmd checkstyleMain"
            if ($Target) {
                Run-CommandSafely "Tier 3A: Targeted Test" "$gradleCmd test --tests `"*$Target*`""
            } else {
                Run-CommandSafely "Tier 3A: Test Suite" "$gradleCmd test"
            }
            if ($Smoke) {
                Run-CommandSafely "Tier 3B: Runtime Smoke Gate (Context Load)" "$gradleCmd test --tests `"*SmokeTest*`""
            }
        }
    }
    "web-backend-python-ai" {
        Run-CommandSafely "Tier 1: Type Check (mypy)" "python -m mypy ."
        Run-CommandSafely "Tier 2: Linter (ruff)" "ruff check ."
        if ($Target) {
            Run-CommandSafely "Tier 3A: Targeted Test" "pytest $Target"
        } else {
            Run-CommandSafely "Tier 3A: Test Suite" "pytest"
        }
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Lifespan & Persistence Smoke Gate" "pytest tests/smoke/ -v"
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
            Run-CommandSafely "Tier 3B: Tokio Boot & Router Smoke Gate" "cargo test --test smoke"
        }
    }
    "database-postgres-prisma" {
        Run-CommandSafely "Tier 1: Prisma Validate" "npx prisma validate"
        Run-CommandSafely "Tier 2: Prisma Format Check" "npx prisma format --check"
        Run-CommandSafely "Tier 3A: Prisma Generate" "npx prisma generate"
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Prisma CRUD Smoke Gate" "npm test -- -t `"prisma.smoke`""
        }
    }
    "database-mongo-redis" {
        Run-CommandSafely "Tier 1: TypeScript Check" "npx tsc --noEmit"
        Run-CommandSafely "Tier 2: Lint Check" "npm run lint"
        Run-CommandSafely "Tier 3A: Integration Tests" "npm test -- --run"
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Persistence & Cache Smoke Gate" "npm test -- -t `"smoke`""
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
        Run-CommandSafely "Tier 2: Lint Check" "npm run lint"
        Run-CommandSafely "Tier 3A: Test Suite" "npm test"
        if ($Smoke) {
            Run-CommandSafely "Tier 3B: Runtime Smoke Gate" "npm test -- -t `"smoke`""
        }
    }
}

Write-Success "All verification tiers passed successfully for $Stack."
exit 0
