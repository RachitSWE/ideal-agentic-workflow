<#
.SYNOPSIS
    Runs the skills/statechart TLA+ model checker and Mermaid statechart generator on Windows or Unix.
.DESCRIPTION
    Validates Node.js >= 22.18 (for native TypeScript type-stripping execution) and forwards -SpecPath,
    -Config, -View, and -OutDir cleanly to skills/statechart/scripts/statechart.ts.
.PARAMETER SpecPath
    Path to the TLA+ specification (.tla) file.
.PARAMETER Config
    Optional path to the TLC configuration (.cfg) file.
.PARAMETER View
    Optional path to the ES module exporting state(vars), step(action, from, to), group(vars), colors, title.
.PARAMETER OutDir
    Optional output directory for chart.mmd, report.md, and tlc*.out artifacts.
.EXAMPLE
    powershell -File commands\invoke-statechart.ps1 -SpecPath .agents\session-abc123\statechart\Retry.tla -OutDir .agents\session-abc123\statechart\out
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$SpecPath,
    [string]$Config,
    [string]$View,
    [string]$OutDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Error "[STATECHART] Node.js is required (>= 22.18.0) and was not found on PATH."
    exit 1
}

$rawVersion = (& node -p "process.versions.node").Trim()
$parts = $rawVersion.Split('.')
$major = [int]$parts[0]
$minor = [int]$parts[1]
if ($major -lt 22 -or ($major -eq 22 -and $minor -lt 18)) {
    Write-Error "[STATECHART] Node.js >= 22.18.0 required to execute statechart.ts directly (found v$rawVersion)."
    exit 1
}

if (-not (Test-Path -LiteralPath $SpecPath)) {
    Write-Error "[STATECHART] Spec file not found: $SpecPath"
    exit 1
}

$pluginRoot = Split-Path -Parent $PSScriptRoot
$entryScript = Join-Path $pluginRoot "skills/statechart/scripts/statechart.ts"
if (-not (Test-Path -LiteralPath $entryScript)) {
    Write-Error "[STATECHART] Missing entrypoint: $entryScript"
    exit 1
}

$cliArgs = @("--disable-warning=ExperimentalWarning", $entryScript, $SpecPath)
if ($Config) { $cliArgs += @("--config", $Config) }
if ($View)   { $cliArgs += @("--view", $View) }
if ($OutDir) { $cliArgs += @("--out", $OutDir) }

& node @cliArgs
exit $LASTEXITCODE
