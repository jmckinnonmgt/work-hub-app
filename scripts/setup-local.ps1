# Work Hub - one-time local setup for a Windows machine (no admin required).
# Usage (from the repo folder):
#   powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1
# It installs a portable Node, installs dependencies, and creates a "Work Hub"
# launcher + Desktop shortcut. Then double-click the shortcut and paste your token.

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent          # scripts\ -> repo root
$parent   = Split-Path $repoRoot -Parent
$nodeVer  = "v22.14.0"
$nodeHome = Join-Path $parent "node-portable"
$nodeDir  = Join-Path $nodeHome "node-$nodeVer-win-x64"
$npm      = Join-Path $nodeDir "npm.cmd"

Write-Host "Work Hub local setup"
Write-Host "  Repo: $repoRoot"

# 1. Portable Node (no admin)
if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
  Write-Host "Downloading portable Node $nodeVer (about 30 MB)..."
  New-Item -ItemType Directory -Force -Path $nodeHome | Out-Null
  $zip = Join-Path $nodeHome "node.zip"
  Invoke-WebRequest -Uri "https://nodejs.org/dist/$nodeVer/node-$nodeVer-win-x64.zip" -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath $nodeHome -Force
  Remove-Item $zip
} else {
  Write-Host "Portable Node already present."
}

# 2. Add Node to the user PATH (persistent, no admin) so future terminals see node/npm
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$nodeDir*") {
  $newPath = if ([string]::IsNullOrEmpty($userPath)) { $nodeDir } else { "$userPath;$nodeDir" }
  [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
  Write-Host "Added Node to your user PATH."
}

# 3. Install dependencies
Write-Host "Installing dependencies (this can take a couple of minutes)..."
Push-Location $repoRoot
& $npm ci
Pop-Location

# 4. Launcher script
$launcher = Join-Path $parent "Start Work Hub.cmd"
$launcherBody = @"
@echo off
title Work Hub  -  keep this window open; close it to stop
cd /d "$repoRoot"
set "PATH=$nodeDir;%PATH%"
echo.
echo   Starting Work Hub... a browser tab opens in about 10 seconds at:
echo       http://localhost:3000/work-hub-app/
echo.
echo   Keep THIS window open while you use it. Close it to stop the app.
echo.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 10; Start-Process 'http://localhost:3000/work-hub-app/'"
"$npm" run dev
"@
Set-Content -Path $launcher -Encoding ascii -Value $launcherBody
Write-Host "Created launcher: $launcher"

# 5. Desktop shortcut
$desktop = [Environment]::GetFolderPath("Desktop")
$lnk = Join-Path $desktop "Work Hub.lnk"
$wshell = New-Object -ComObject WScript.Shell
$sc = $wshell.CreateShortcut($lnk)
$sc.TargetPath = "$env:WINDIR\System32\cmd.exe"
$sc.Arguments = "/c `"$launcher`""
$sc.WorkingDirectory = $parent
$sc.IconLocation = "$env:WINDIR\System32\cmd.exe,0"
$sc.Description = "Launch Work Hub (local)"
$sc.Save()
Write-Host "Created Desktop shortcut: Work Hub"

Write-Host ""
Write-Host "Done. Next:"
Write-Host "  1. Double-click the 'Work Hub' shortcut on your Desktop."
Write-Host "  2. First time only, paste a GitHub personal access token (classic; scopes: repo + project)."
Write-Host "     GitHub > Settings > Developer settings > Tokens (classic) > Generate new token."
