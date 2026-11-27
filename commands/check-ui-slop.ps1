<#
.SYNOPSIS
    Tier 2 UI Hygiene & Developer Jargon Scanner for ideal-agentic-workflow.
.DESCRIPTION
    Runs scripts/check-ui-slop.mjs to audit frontend templates for developer test buttons,
    raw diagnostic leaks (localhost, x64, Node v), and dummy expand buttons.
.EXAMPLE
    pwsh -File .\commands\check-ui-slop.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "../scripts/check-ui-slop.mjs"
if (-not (Test-Path $scriptPath)) {
    Write-Host "[CHECK-UI-SLOP] [ERROR] Could not find scripts/check-ui-slop.mjs" -ForegroundColor Red
    exit 1
}

node $scriptPath
exit $LASTEXITCODE
