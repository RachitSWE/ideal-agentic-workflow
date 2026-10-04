<#
.SYNOPSIS
    Automates and enforces strict S10 Conventional Commits and atomic staging.
.DESCRIPTION
    Enforces per-file staging (rejects '.' and bulk adds), checks Conventional Commit formatting,
    monitors insertion sizing (~50-150 insertions), and commits atomically.
.PARAMETER Files
    Array of explicit relative file paths to stage. Cannot be '.' or '*'.
.PARAMETER Type
    Conventional commit type: feat, fix, refactor, perf, test, build, ci, docs, chore.
.PARAMETER Scope
    Optional scope in parentheses, e.g. 'auth', 'database', 'api'.
.PARAMETER Subject
    Subject line: max 72 chars, lowercase, imperative mood, no period at end.
.PARAMETER Body
    Mandatory commit body: max 150 chars, lowercase, explaining why and atomic justification if > 150 insertions.
.EXAMPLE
    pwsh -File .\commands\stage-commit.ps1 -Files @("src/order.ts", "tests/order.test.ts") -Type feat -Scope order -Subject "implement order cancellation logic" -Body "adds cancellation state transition and emits event"
#>

param (
    [Parameter(Mandatory=$true)]
    [string[]]$Files,

    [Parameter(Mandatory=$true)]
    [ValidateSet("feat", "fix", "refactor", "perf", "test", "build", "ci", "docs", "chore")]
    [string]$Type,

    [string]$Scope = "",

    [Parameter(Mandatory=$true)]
    [string]$Subject,

    [Parameter(Mandatory=$true)]
    [string]$Body
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) {
    Write-Host "[STAGE-COMMIT] $msg" -ForegroundColor Cyan
}

function Write-Fail([string]$msg) {
    Write-Host "[STAGE-COMMIT] [ERROR] $msg" -ForegroundColor Red
}

function Write-Success([string]$msg) {
    Write-Host "[STAGE-COMMIT] [SUCCESS] $msg" -ForegroundColor Green
}

# 1. Validation: Prevent bulk staging (AP-005)
foreach ($f in $Files) {
    $trimmed = $f.Trim()
    if ($trimmed -eq "." -or $trimmed -eq "*" -or $trimmed -eq "-A" -or $trimmed -eq "--all") {
        Write-Fail "AP-005 VIOLATION: Bulk staging ('$trimmed') is strictly prohibited. Provide explicit file paths."
        exit 1
    }
    if (-not (Test-Path $trimmed)) {
        Write-Fail "Target file not found: '$trimmed'"
        exit 1
    }
}

# 2. Validation: Subject line formatting
$formattedSubject = if ($Scope) { "$Type($Scope): $Subject" } else { "$Type`: $Subject" }

if ($formattedSubject.Length -gt 72) {
    Write-Fail "Commit subject line exceeds 72 characters ($($formattedSubject.Length) chars): '$formattedSubject'"
    exit 1
}

if ($formattedSubject.EndsWith(".")) {
    Write-Fail "Commit subject line must NOT end with a period: '$formattedSubject'"
    exit 1
}

# 3. Validation: Body formatting
if ([string]::IsNullOrWhiteSpace($Body)) {
    Write-Fail "Commit body is mandatory under S10 Conventional Commit invariants."
    exit 1
}

if ($Body.Length -gt 150) {
    Write-Fail "Commit body exceeds 150 characters ($($Body.Length) chars). Keep body concise."
    exit 1
}

# 4. Stage each file individually
Write-Step "Staging $($Files.Count) explicit file(s)..."
foreach ($f in $Files) {
    Write-Step "  -> git add `"$f`""
    git add $f
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Failed to stage file: $f"
        exit 1
    }
}

# 5. Measure Staged Diff & Check Atomic Sizing
$shortstat = git diff --cached --shortstat
Write-Step "Staged diff metrics: $shortstat"

$insertions = 0
if ($shortstat -match '(\d+)\s+insertion') {
    $insertions = [int]$matches[1]
}

if ($insertions -gt 150) {
    Write-Host "[STAGE-COMMIT] [WARNING] Staged diff has $insertions insertions (> 150 guideline)." -ForegroundColor Yellow
    Write-Host "[STAGE-COMMIT] [WARNING] Ensure commit body explicitly justifies why this is one atomic unit." -ForegroundColor Yellow
}

# 6. Execute Git Commit
Write-Step "Executing commit with Conventional Commit schema..."
$commitArgs = @("commit", "-m", $formattedSubject, "-m", $Body.ToLowerInvariant())
git @commitArgs

if ($LASTEXITCODE -eq 0) {
    $commitSha = git rev-parse --short HEAD
    Write-Success "Committed successfully as $($commitSha): '$formattedSubject'"
} else {
    Write-Fail "git commit command failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
}
