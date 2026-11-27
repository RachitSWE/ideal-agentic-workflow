<#
.SYNOPSIS
    Appends an atomic TSV decision record to <SessionDir>\decision.tsv with spreadsheet formula neutralization.
.DESCRIPTION
    Creates or appends a 7-column TSV row (ts, phase, decision, why, action, evidence, result) inside
    the active workflow session directory. Strips tabs/newlines and prefixes leading '=', '+', '-', or '@'
    characters with a single quote (') to prevent CSV/TSV formula execution.
.PARAMETER SessionDir
    Path to the session directory (e.g. .agents\session-abc123).
.PARAMETER Phase
    Optional workflow phase or iteration identifier (defaults to 'S6').
.PARAMETER Decision
    Action or choice made in this unit/iteration.
.PARAMETER Why
    Hypothesis or architectural reason motivating the decision.
.PARAMETER Action
    Verdict for the change: keep, revert, edit, or note.
.PARAMETER Evidence
    Exact command run, measured metric, or verified observation.
.PARAMETER Result
    Outcome string (e.g. pass, fail, improved -18%).
.EXAMPLE
    powershell -File commands\log-decision.ps1 -SessionDir .agents\session-abc123 -Phase perf-1 -Decision "cache token lookup" -Action keep -Evidence "p50 42ms -> 19ms" -Result pass
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SessionDir,
    [string]$Phase = "S6",
    [Parameter(Mandatory = $true)]
    [string]$Decision,
    [string]$Why = "-",
    [Parameter(Mandatory = $true)]
    [ValidateSet("keep", "revert", "edit", "note")]
    [string]$Action,
    [Parameter(Mandatory = $true)]
    [string]$Evidence,
    [string]$Result = "-"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SessionDir)) {
    New-Item -ItemType Directory -Path $SessionDir -Force | Out-Null
}

function Format-SafeTsvCell([string]$Raw) {
    if ($null -eq $Raw) { return "-" }
    $clean = ($Raw -replace '[\t\r\n]+', ' ').Trim()
    if ($clean -match '^[=+\-@]') {
        return "'" + $clean
    }
    if ([string]::IsNullOrEmpty($clean)) { return "-" }
    return $clean
}

$logPath = Join-Path $SessionDir "decision.tsv"
$needsHeader = (-not (Test-Path -LiteralPath $logPath)) -or ((Get-Item -LiteralPath $logPath).Length -eq 0)
if ($needsHeader) {
    Add-Content -LiteralPath $logPath -Value "ts`tphase`tdecision`twhy`taction`tevidence`tresult" -Encoding UTF8
}

$ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$row = @(
    $ts,
    (Format-SafeTsvCell $Phase),
    (Format-SafeTsvCell $Decision),
    (Format-SafeTsvCell $Why),
    (Format-SafeTsvCell $Action),
    (Format-SafeTsvCell $Evidence),
    (Format-SafeTsvCell $Result)
) -join "`t"

Add-Content -LiteralPath $logPath -Value $row -Encoding UTF8
Write-Host "[DECISION-LOG] Appended $Action row to $logPath"
