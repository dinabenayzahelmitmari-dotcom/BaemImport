param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$OutputDir = "$([Environment]::GetFolderPath('Desktop'))"
)

$ErrorActionPreference = "Stop"

$staging = Join-Path $env:TEMP ("BAEMIMPORT_DELIVERABLE_" + [Guid]::NewGuid().ToString("N"))
$deliverableDir = Join-Path $staging "BAEMIMPORT"
$zipPath = Join-Path $OutputDir "BAEMIMPORT-ENTREGABLE-SANITIZADO.zip"

New-Item -ItemType Directory -Path $deliverableDir -Force | Out-Null

$files = Get-ChildItem -Path $ProjectRoot -Recurse -File -Force | Where-Object {
  $relative = $_.FullName.Substring($ProjectRoot.Length).TrimStart('\')
  $r = $relative.Replace('\', '/').ToLowerInvariant()

  if ($r -like '.git/*') { return $false }
  if ($r -like '.idea/*') { return $false }
  if ($r -like '*/node_modules/*') { return $false }
  if ($r -like '*/build/*') { return $false }
  if ($r -like 'frontend/android/keystore/*') { return $false }
  if ($r -eq 'frontend/android/keystore.properties') { return $false }
  if ($r -like '*.env' -or $r -like '*.env.*') { return $false }
  if ($r -like '*.log') { return $false }
  if ($r -like '*baemimport-android-keys.txt') { return $false }
  if ($r -like '*.exe' -or $r -like '*.apk' -or $r -like '*.aab' -or $r -like '*.zip') { return $false }
  return $true
}

foreach ($file in $files) {
  $relative = $file.FullName.Substring($ProjectRoot.Length).TrimStart('\')
  $target = Join-Path $deliverableDir $relative
  $targetDir = Split-Path $target -Parent
  if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
  Copy-Item -LiteralPath $file.FullName -Destination $target -Force
}

if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path (Join-Path $deliverableDir "*") -DestinationPath $zipPath -CompressionLevel Optimal

Remove-Item -LiteralPath $staging -Recurse -Force

Write-Host "Entregable generado:" $zipPath
