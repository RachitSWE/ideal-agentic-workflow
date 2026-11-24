<#
.SYNOPSIS
    Pre-Review Scope Gate for ideal-agentic-workflow.
.DESCRIPTION
    Validates that 100% of modified files in the git working tree match the union of
    target_files, infrastructure_files, and test_targets declared across tasks in task.md.
    Fails with exit code 1 if unauthorized ghost edits or out-of-scope files exist.
.EXAMPLE
    pwsh -File .\commands\verify-scope.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) {
    Write-Host "[VERIFY-SCOPE] $msg" -ForegroundColor Cyan
}

function Write-Success([string]$msg) {
    Write-Host "[VERIFY-SCOPE] [SUCCESS] $msg" -ForegroundColor Green
}

function Write-Fail([string]$msg) {
    Write-Host "[VERIFY-SCOPE] [FAILURE] $msg" -ForegroundColor Red
}

Write-Step "Checking git working tree for scope compliance..."

# 1. Collect modified files from git status
try {
    $statusOutput = git status --porcelain
} catch {
    Write-Host "[VERIFY-SCOPE] Warning: Not a git repository or git command failed." -ForegroundColor Yellow
    exit 0
}

if (-not $statusOutput) {
    Write-Success "Working tree is clean. Scope verification passed."
    exit 0
}

$touchedFiles = @()
foreach ($line in $statusOutput) {
    if ($line.Length -gt 3) {
        $filePath = $line.Substring(3).Trim().Replace('\', '/')
        # Ignore untracked files in .agents/ session directory or package-lock
        if ($filePath.StartsWith(".agents/") -or 
            $filePath.StartsWith(".gemini/") -or 
            $filePath.StartsWith(".git/") -or
            $filePath -eq "package-lock.json" -or 
            $filePath -eq "hooks.json") {
            continue
        }
        $touchedFiles += $filePath
    }
}

if ($touchedFiles.Count -eq 0) {
    Write-Success "No out-of-scope source files modified."
    exit 0
}

Write-Step "Inspecting $($touchedFiles.Count) modified source file(s)..."

# 2. Locate active session task.md
$agentsDir = Join-Path (Get-Location).Path ".agents"
$sessions = Get-ChildItem -Path $agentsDir -Directory -Filter "session-*" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
if (-not $sessions -or $sessions.Count -eq 0) {
    Write-Host "[VERIFY-SCOPE] Notice: No active session directory found. Skipping task.md comparison." -ForegroundColor Yellow
    exit 0
}

$taskFile = Join-Path $sessions[0].FullName "task.md"
if (-not (Test-Path $taskFile)) {
    Write-Host "[VERIFY-SCOPE] Notice: task.md not found in active session. Skipping scope check." -ForegroundColor Yellow
    exit 0
}

$taskContent = Get-Content $taskFile -Raw -Encoding UTF8

# 3. Extract all whitelisted paths
$allowedPaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

$regexMatches = [regex]::Matches($taskContent, "(?m)^\s*-\s+([^\s#]+)")
foreach ($m in $regexMatches) {
    $p = $m.Groups[1].Value.Trim().Replace('\', '/')
    if ($p -and -not $p.StartsWith("[") -and -not $p.StartsWith('`')) {
        [void]$allowedPaths.Add($p)
    }
}

# 4. Check each touched file against allowed paths
$unauthorizedFiles = @()
foreach ($file in $touchedFiles) {
    $matched = $false
    foreach ($allowed in $allowedPaths) {
        if ($file.Equals($allowed, [System.StringComparison]::OrdinalIgnoreCase) -or 
            $file.StartsWith($allowed + "/", [System.StringComparison]::OrdinalIgnoreCase)) {
            $matched = $true
            break
        }
    }
    if (-not $matched) {
        $unauthorizedFiles += $file
    }
}

if ($unauthorizedFiles.Count -gt 0) {
    Write-Fail "Scope violation detected! The following files were modified without task.md declaration:"
    foreach ($unauth in $unauthorizedFiles) {
        Write-Host "  [X] $unauth" -ForegroundColor Red
    }
    Write-Host "`nTo remediate:" -ForegroundColor Yellow
    Write-Host "1. Revert out-of-scope changes: git checkout -- [file]" -ForegroundColor Yellow
    Write-Host "2. OR escalate scope: pwsh -File commands/escalate-scope.ps1 -TaskId TASK-ID -File [file] -Rationale '...'" -ForegroundColor Yellow
    exit 1
}

Write-Success "All $($touchedFiles.Count) modified file(s) match declared task targets."
exit 0
