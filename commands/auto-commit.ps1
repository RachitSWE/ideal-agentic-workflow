<#
.SYNOPSIS
    Automates S10 clustered batch commits via scripts/auto-commit.mjs (no git add ., no git push).
.DESCRIPTION
    Discovers pending repository changes, groups them by domain/directory cluster up to MaxLoc lines,
    generates Conventional Commit messages (via GEMINI_API_KEY / AI_COMMIT_API_KEY or deterministic offline
    fallback preserving exact PascalCase/camelCase identifiers), and stages each batch explicitly per file.
.PARAMETER DryRun
    Preview computed batches and generated Conventional Commit messages without staging or committing.
.PARAMETER BatchLimit
    Optional maximum number of batches to process in this invocation.
.PARAMETER MaxLoc
    Maximum insertions threshold before starting a new batch or marking single files atomic (default: 150).
.PARAMETER StagedOnly
    Only commit files already staged in the Git index.
.EXAMPLE
    powershell -File commands\auto-commit.ps1 -DryRun
    powershell -File commands\auto-commit.ps1 -MaxLoc 150 -BatchLimit 5
#>

param(
    [switch]$DryRun,
    [int]$BatchLimit = 0,
    [int]$MaxLoc = 150,
    [switch]$StagedOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Error "[AUTO-COMMIT] Node.js is required and was not found on PATH."
    exit 1
}

$pluginRoot = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $pluginRoot "scripts/auto-commit.mjs"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    Write-Error "[AUTO-COMMIT] Script missing: $scriptPath"
    exit 1
}

# Hydrate Windows User/Machine API keys if current host session missed WM_SETTINGCHANGE refresh
foreach ($varName in @("GEMINI_API_KEY", "AI_COMMIT_API_KEY")) {
    $currentVal = [Environment]::GetEnvironmentVariable($varName, "Process")
    if ([string]::IsNullOrWhiteSpace($currentVal)) {
        $persisted = [Environment]::GetEnvironmentVariable($varName, "User")
        if ([string]::IsNullOrWhiteSpace($persisted)) {
            $persisted = [Environment]::GetEnvironmentVariable($varName, "Machine")
        }
        if (-not [string]::IsNullOrWhiteSpace($persisted)) {
            [Environment]::SetEnvironmentVariable($varName, $persisted.Trim(), "Process")
        }
    }
}

$nodeArgs = @($scriptPath, "--max-loc=$MaxLoc")
if ($DryRun) { $nodeArgs += "--dry-run" }
if ($StagedOnly) { $nodeArgs += "--staged-only" }
if ($BatchLimit -gt 0) { $nodeArgs += "--batch-limit=$BatchLimit" }

& node @nodeArgs
exit $LASTEXITCODE
