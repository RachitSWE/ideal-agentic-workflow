<#
.SYNOPSIS
    Authorizes and logs Scope Escalations for ideal-agentic-workflow.
.DESCRIPTION
    Enables agents to legally expand scope to ancestor layout shells (Layout.tsx, DashboardShell.tsx)
    or shared infrastructure when containing block traps (BUG-001) or state lineage requirements arise.
    Appends the target file to the active task's infrastructure_files in task.md and creates an audit entry.
.PARAMETER TaskId
    The identifier of the active task (e.g. 'TASK-1', 'TASK-3').
.PARAMETER File
    Relative path to the ancestor/infrastructure file to whitelist (e.g. 'src/layouts/Layout.tsx').
.PARAMETER Rationale
    Mandatory technical justification for why this file must be touched (e.g. 'Containing-block trap: hoist bar out of transformed container').
.EXAMPLE
    pwsh -File .\commands\escalate-scope.ps1 -TaskId "TASK-1" -File "src/layouts/Layout.tsx" -Rationale "Containing-block trap"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$TaskId,

    [Parameter(Mandatory=$true)]
    [string]$File,

    [Parameter(Mandatory=$true)]
    [string]$Rationale
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) {
    Write-Host "[ESCALATE-SCOPE] $msg" -ForegroundColor Cyan
}

function Write-Success([string]$msg) {
    Write-Host "[ESCALATE-SCOPE] [SUCCESS] $msg" -ForegroundColor Green
}

function Write-Fail([string]$msg) {
    Write-Host "[ESCALATE-SCOPE] [FAILURE] $msg" -ForegroundColor Red
}

$normalizedPath = $File.Trim().Replace('\', '/')

# 1. Assert target file physically exists
if (-not (Test-Path $normalizedPath)) {
    Write-Fail "Target file does not exist on disk: $normalizedPath"
    exit 1
}

# 2. Locate active session directory
$agentsDir = Join-Path (Get-Location).Path ".agents"
if (-not (Test-Path $agentsDir)) {
    Write-Fail "No .agents directory found. Must run inside an active session."
    exit 1
}

$sessions = Get-ChildItem -Path $agentsDir -Directory -Filter "session-*" | Sort-Object LastWriteTime -Descending
if (-not $sessions -or $sessions.Count -eq 0) {
    Write-Fail "No active session-[SHA] found under .agents."
    exit 1
}

$activeSessionDir = $sessions[0].FullName
$taskFile = Join-Path $activeSessionDir "task.md"

if (-not (Test-Path $taskFile)) {
    Write-Fail "task.md not found in active session: $activeSessionDir"
    exit 1
}

Write-Step "Active Session: $($sessions[0].Name)"
Write-Step "Target Task: $TaskId"
Write-Step "Escalating File: $normalizedPath"
Write-Step "Rationale: $Rationale"

# 3. Update task.md with infrastructure_files entry
$taskContent = Get-Content $taskFile -Raw -Encoding UTF8

$taskHeaderRegex = "(?m)^(- \[[ /x]\]\s+\*\*" + [regex]::Escape($TaskId) + "\*\*[\s\S]*?)(?=(?:^-\s+\[[ /x]\]|\Z))"
$taskMatch = [regex]::Match($taskContent, $taskHeaderRegex)

if (-not $taskMatch.Success) {
    Write-Fail "Could not locate task block for $TaskId in task.md."
    exit 1
}

$taskBlock = $taskMatch.Groups[1].Value

# Check if infrastructure_files exists under this task block
if ($taskBlock -match "(?m)^\s*infrastructure_files:\s*$") {
    # Check if already whitelisted
    if ($taskBlock -match [regex]::Escape($normalizedPath)) {
        Write-Step "File is already whitelisted under infrastructure_files."
    } else {
        $updatedBlock = $taskBlock -replace "(?m)(^\s*infrastructure_files:\s*$)", "`$1`n    - $normalizedPath"
        $taskContent = $taskContent.Substring(0, $taskMatch.Index) + $updatedBlock + $taskContent.Substring($taskMatch.Index + $taskMatch.Length)
        Set-Content -Path $taskFile -Value $taskContent -Encoding UTF8
        Write-Step "Appended $normalizedPath to infrastructure_files in task.md."
    }
} else {
    # Append infrastructure_files section
    $infraSection = "`n  infrastructure_files:`n    - $normalizedPath"
    $updatedBlock = $taskBlock + $infraSection
    $taskContent = $taskContent.Substring(0, $taskMatch.Index) + $updatedBlock + $taskContent.Substring($taskMatch.Index + $taskMatch.Length)
    Set-Content -Path $taskFile -Value $taskContent -Encoding UTF8
    Write-Step "Created infrastructure_files section and appended $normalizedPath in task.md."
}

# 4. Record escalation log entry
$logFile = Join-Path $activeSessionDir "scope-escalations.log"
$timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
$logEntry = "[$timestamp] Task: $TaskId | File: $normalizedPath | Rationale: $Rationale"
Add-Content -Path $logFile -Value $logEntry -Encoding UTF8

Write-Success "Scope escalation authorized. Scope Jail now permits mutations to $normalizedPath."
exit 0
