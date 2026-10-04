param(
    [string]$ProjectRoot = (Get-Location).Path
)

# Generate 6-char SHA from timestamp
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$bytes = [System.Text.Encoding]::UTF8.GetBytes("$timestamp")
$hasher = [System.Security.Cryptography.SHA1]::Create()
$hashBytes = $hasher.ComputeHash($bytes)
$sha = ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
$shortSha = $sha.Substring(0, 6).ToLower()

$sessionDir = Join-Path $ProjectRoot ".agents/session-$shortSha"

# Create nested directories
$dirs = @(
    (Join-Path $sessionDir "audit/bin"),
    (Join-Path $sessionDir "code-review/submit"),
    (Join-Path $sessionDir "code-review/review")
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

# Create stub files
$stubs = @("plan.md", "task.md", "context.md", "mode.txt")
foreach ($stub in $stubs) {
    $filePath = Join-Path $sessionDir $stub
    if (-not (Test-Path $filePath)) {
        New-Item -ItemType File -Force -Path $filePath | Out-Null
    }
}

# Scaffold CHECKLIST.md from template
$checklistTmpl = Join-Path $PSScriptRoot "../resources/checklist-template.md"
$checklistDest = Join-Path $sessionDir "CHECKLIST.md"
if (Test-Path $checklistTmpl) {
    $content = Get-Content $checklistTmpl -Raw
    $content = $content.Replace("[SHA]", $shortSha)
    Set-Content -Path $checklistDest -Value $content -Encoding UTF8
} elseif (-not (Test-Path $checklistDest)) {
    New-Item -ItemType File -Force -Path $checklistDest | Out-Null
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " [ideal-agentic-workflow] Session Initialized" -ForegroundColor Green
Write-Host " SHA:         $shortSha" -ForegroundColor Yellow
Write-Host " Session Dir: $sessionDir" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

return $shortSha
