<#
.SYNOPSIS
    Cleans and archives session directories in .agents/ for ideal-agentic-workflow.
.DESCRIPTION
    Safely archives completed sessions into .agents/archive/ and prunes stale artifacts.
    Prevents deletion of active in-progress sessions unless -Force is specified.
.PARAMETER Sha
    Specific 6-character session SHA to clean/archive.
.PARAMETER ArchiveAllCompleted
    Finds and archives all sessions where all tasks in task.md are [x].
.PARAMETER Force
    Overrides safety checks on incomplete tasks.
.EXAMPLE
    pwsh -File .\commands\clean-session.ps1 -Sha a1b2c3
    pwsh -File .\commands\clean-session.ps1 -ArchiveAllCompleted
#>

param (
    [string]$Sha,
    [switch]$ArchiveAllCompleted,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$agentsDir = ".agents"
$archiveDir = Join-Path $agentsDir "archive"

if (-not (Test-Path $agentsDir)) {
    Write-Host "[CLEAN-SESSION] No .agents directory found. Nothing to clean." -ForegroundColor Yellow
    exit 0
}

if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

function Archive-SessionDirectory([System.IO.DirectoryInfo]$sessionDir) {
    $shaName = $sessionDir.Name
    $taskFile = Join-Path $sessionDir.FullName "task.md"
    
    $isComplete = $false
    if (Test-Path $taskFile) {
        $taskContent = Get-Content -Path $taskFile -Raw
        if ($taskContent -and -not ($taskContent -match "\[ \]")) {
            $isComplete = $true
        }
    }

    if (-not $isComplete -and -not $Force) {
        Write-Host "[CLEAN-SESSION] Skipped $($shaName): Contains incomplete tasks. Use -Force to override." -ForegroundColor Yellow
        return
    }

    $destPath = Join-Path $archiveDir $shaName
    if (Test-Path $destPath) {
        Remove-Item -Path $destPath -Recurse -Force
    }

    Move-Item -Path $sessionDir.FullName -Destination $destPath -Force
    Write-Host "[CLEAN-SESSION] [ARCHIVED] $shaName moved to $destPath" -ForegroundColor Green
}

if ($Sha) {
    $targetName = "session-$Sha"
    $targetPath = Join-Path $agentsDir $targetName
    if (-not (Test-Path $targetPath)) {
        Write-Host "[CLEAN-SESSION] [ERROR] Target session directory not found: $targetPath" -ForegroundColor Red
        exit 1
    }
    Archive-SessionDirectory (Get-Item $targetPath)
} elseif ($ArchiveAllCompleted) {
    $sessions = Get-ChildItem -Path $agentsDir -Directory -Filter "session-*"
    if ($sessions.Count -eq 0) {
        Write-Host "[CLEAN-SESSION] No active sessions found in .agents/." -ForegroundColor Cyan
        exit 0
    }
    foreach ($s in $sessions) {
        Archive-SessionDirectory $s
    }
} else {
    Write-Host "[CLEAN-SESSION] Specify either -Sha <SHA> or -ArchiveAllCompleted." -ForegroundColor Yellow
}
