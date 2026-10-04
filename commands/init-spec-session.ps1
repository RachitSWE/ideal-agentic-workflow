<#
.SYNOPSIS
    Initializes a new Spec Architecture Pipeline session in .agents/specs/session-[SHA]/.
.DESCRIPTION
    Scaffolds the directory tree, review folders, grill logs, and CHECKLIST.md for spec generation.
.PARAMETER Sha
    6-character session SHA. If omitted, generates from timestamp.
.PARAMETER Name
    Kebab-case name of the feature to specify (e.g. 'transaction-history').
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\commands\init-spec-session.ps1 -Name transaction-history
#>

param (
    [string]$Sha,
    [Parameter(Mandatory=$true)]
    [string]$Name
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $Sha) {
    $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $Sha = ($now.ToString("X").Substring(2, 6)).ToLowerInvariant()
}

$date = (Get-Date).ToString("yyyy-MM-dd")
$sessionDir = Join-Path ".agents\specs" "session-$Sha"
$grillDir = Join-Path $sessionDir "grill"
$submitDir = Join-Path $sessionDir "code-review\submit"
$reviewDir = Join-Path $sessionDir "code-review\review"

Write-Host "[INIT-SPEC] Initializing Spec Session [$Sha] for feature '$Name'..." -ForegroundColor Cyan

# Create directory tree
$null = New-Item -ItemType Directory -Path $grillDir -Force
$null = New-Item -ItemType Directory -Path $submitDir -Force
$null = New-Item -ItemType Directory -Path $reviewDir -Force

# Create CHECKLIST.md
$checklistPath = Join-Path $sessionDir "CHECKLIST.md"
$checklistLines = @(
    "# Spec Session [$Sha] Checklist: $Name",
    "",
    "- [ ] **SP1**: Ingest context and baseline GEMINI.md",
    "- [ ] **SP2**: Complete 10-12 System Design Grilling questions (grill-log.md)",
    "- [ ] **SP3**: Author formal specification (${date}_${Name}_SPEC.md)",
    "- [ ] **SP4**: Multi-agent spec review (Consensus LGTM)",
    "  - [ ] System Architect Reviewer",
    "  - [ ] Security and Edge-Case Reviewer",
    "  - [ ] Testability and Scale Reviewer",
    "- [ ] **SP5**: Address reviewer feedback (if CHANGES_REQUESTED)",
    "- [ ] **SP6**: Certify spec and link into GEMINI.md Section 5 Open Features"
)
Set-Content -Path $checklistPath -Value $checklistLines -Encoding UTF8

# Create grill-log stub
$grillPath = Join-Path $grillDir "grill-log.md"
$grillLines = @(
    "# Grilling QA Decisions for: $Name",
    "",
    "Date: $date",
    "Session: $Sha",
    ""
)
Set-Content -Path $grillPath -Value $grillLines -Encoding UTF8

# Create draft spec stub
$specFileName = "${date}_${Name}_SPEC.md"
$specPath = Join-Path $sessionDir $specFileName
$specLines = @(
    "# $Name Feature Specification (Draft)",
    "",
    "Date: $date",
    "Status: IN_PROGRESS",
    ""
)
Set-Content -Path $specPath -Value $specLines -Encoding UTF8

Write-Host "[INIT-SPEC] [SUCCESS] Session initialized at $sessionDir" -ForegroundColor Green
Write-Host "[INIT-SPEC] Active spec file: $specFileName" -ForegroundColor Green
Write-Output $Sha
