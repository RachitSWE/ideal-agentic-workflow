param(
    [switch]$Cached
)

$diffCmd = if ($Cached) { "git diff --cached --stat" } else { "git diff --stat HEAD" }

try {
    $rawOutput = Invoke-Expression $diffCmd 2>$null
} catch {
    $rawOutput = $null
}

if (-not $rawOutput) {
    Write-Host "[measure-diff] No changes detected or not a git repository." -ForegroundColor Yellow
    exit 0
}

Write-Host "=== Git Diff Summary ===" -ForegroundColor Cyan
$rawOutput | ForEach-Object { Write-Host $_ }

$insertions = 0
$deletions = 0

foreach ($line in $rawOutput) {
    if ($line -match '(\d+)\s+insertion') {
        $insertions += [int]$matches[1]
    }
    if ($line -match '(\d+)\s+deletion') {
        $deletions += [int]$matches[1]
    }
}

Write-Host "`nTotal Insertions: $insertions" -ForegroundColor Yellow
Write-Host "Total Deletions:  $deletions" -ForegroundColor Yellow

if ($insertions -gt 150) {
    Write-Host "`n[ALERT] Insertions exceed 150 lines ($insertions > 150)." -ForegroundColor Red
    Write-Host "STRICTLY COMPULSORY: Read skills/s10-git-commit/resources/commit-split-guide.md before committing." -ForegroundColor Red
    Write-Host "Either split into atomic per-file commits, or add the mandatory atomic justification to the commit body." -ForegroundColor Yellow
} else {
    Write-Host "`n[OK] Commit insertion budget within guideline (<= 150 insertions)." -ForegroundColor Green
}
