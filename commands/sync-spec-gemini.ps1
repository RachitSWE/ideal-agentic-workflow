<#
.SYNOPSIS
    Registers the certified spec from .agents/specs/session-[SHA]/ into GEMINI.md §5 Open Features.
.DESCRIPTION
    Non-destructively updates GEMINI.md with direct reference to the session spec file.
    Does NOT copy to docs/superpowers/specs/ - keeps the spec strictly in its session directory.
.PARAMETER Sha
    6-character session SHA in .agents/specs/session-[SHA]/.
.PARAMETER Title
    User-facing title of the feature.
.PARAMETER Summary
    Brief one-sentence summary of the feature.
.EXAMPLE
    pwsh -File .\commands\sync-spec-gemini.ps1 -Sha a1b2c3 -Title "Transaction History" -Summary "Paginated transaction audit log with filter support"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$Sha,

    [Parameter(Mandatory=$true)]
    [string]$Title,

    [Parameter(Mandatory=$true)]
    [string]$Summary
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) {
    Write-Host "[SYNC-SPEC] $msg" -ForegroundColor Cyan
}

function Write-Success([string]$msg) {
    Write-Host "[SYNC-SPEC] [SUCCESS] $msg" -ForegroundColor Green
}

function Write-Fail([string]$msg) {
    Write-Host "[SYNC-SPEC] [ERROR] $msg" -ForegroundColor Red
}

$sessionDir = ".agents\specs\session-$Sha"
if (-not (Test-Path $sessionDir)) {
    Write-Fail "Session directory not found: $sessionDir"
    exit 1
}

# Locate the spec file in .agents/specs/session-[SHA]/
$specFiles = Get-ChildItem -Path $sessionDir -Filter "*_SPEC.md"
if ($specFiles.Count -eq 0) {
    Write-Fail "No *_SPEC.md file found in $sessionDir."
    exit 1
}

$sourceSpec = $specFiles[0]
$specRelPath = ".agents/specs/session-$Sha/$($sourceSpec.Name)"
Write-Step "Located certified spec: $specRelPath"

# Non-destructively update GEMINI.md §5 Open Features
$geminiPath = "GEMINI.md"
if (Test-Path $geminiPath) {
    Write-Step "Updating GEMINI.md §5 Open Features..."
    $geminiContent = Get-Content -Path $geminiPath -Raw
    
    $newFeatureEntry = "- [ ] **$Title**: $Summary (Spec: [$($sourceSpec.Name)]($specRelPath))"

    # Avoid duplicate entry
    if ($geminiContent.Contains($specRelPath)) {
        Write-Step "Spec link already exists in GEMINI.md. Skipping duplicate append."
    } else {
        if ($geminiContent -match "(?ms)(## 5\. (?:Features|Open Features).*?)(\r?\n## 6|\Z)") {
            $sectionHeader = $matches[1].TrimEnd()
            $afterSection = $matches[2]
            $updatedSection = "$sectionHeader`n$newFeatureEntry`n"
            $geminiContent = $geminiContent.Replace($matches[1], $updatedSection)
            Set-Content -Path $geminiPath -Value $geminiContent -Encoding UTF8
            Write-Success "Appended new open feature to GEMINI.md §5."
        } else {
            $geminiContent = $geminiContent.TrimEnd() + "`n`n## 5. Open Features`n$newFeatureEntry`n"
            Set-Content -Path $geminiPath -Value $geminiContent -Encoding UTF8
            Write-Success "Created and appended to GEMINI.md §5 Open Features."
        }
    }
} else {
    Write-Host "[SYNC-SPEC] Warning: GEMINI.md not found in project root. Skipped PRD sync." -ForegroundColor Yellow
}

Write-Success "Spec certified and registered into GEMINI.md successfully!"
Write-Host "Canonical Spec Location: $specRelPath" -ForegroundColor Green
