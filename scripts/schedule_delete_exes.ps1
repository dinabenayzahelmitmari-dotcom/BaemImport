<#
 Modulo del proyecto.
 Archivo: scripts\schedule_delete_exes.ps1
#>

param(
  [string]$Root = (Resolve-Path ".").Path,
  [string[]]$ExeNames = @("baemimport.exe", "baemimport-new.exe"),
  [string]$RunOnceValueName = "DeleteBAEMExe"
)

# Schedules deletion of locked .exe files at next logon using HKCU RunOnce.
# This is a pragmatic workaround when Windows keeps the files open and deletion fails.

$paths = @()
foreach ($n in $ExeNames) {
  $paths += (Join-Path $Root $n)
}

$existing = @($paths | Where-Object { Test-Path -LiteralPath $_ })
if ($existing.Count -eq 0) {
  Write-Host "No matching exe files found in: $Root"
  exit 0
}

$quoted = ($existing | ForEach-Object { '"' + $_ + '"' }) -join " "
$cmd = "cmd /c del /f /q $quoted"

reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce" /v $RunOnceValueName /t REG_SZ /d $cmd /f | Out-Null
Write-Host "Scheduled deletion at next logon:"
$existing | ForEach-Object { Write-Host " - $_" }

