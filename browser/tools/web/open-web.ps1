param([switch]$NoBrowser)
$ErrorActionPreference='Stop'
$browserRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$url='http://localhost:5173'
$identity=$null
try { $identity=Invoke-RestMethod -Uri "$url/__preacherman_preview" -TimeoutSec 2 } catch {}
if ($identity -and ($identity.app -ne 'preacherman-browser' -or $identity.root -ne $browserRoot)) { throw 'Port 5173 is occupied by another project.' }
if (-not $identity) {
  if (-not (Test-Path -LiteralPath "$browserRoot/web-dist/index.html")) { throw 'Run npm run build in the browser project first.' }
  $node=(Get-Command node -ErrorAction SilentlyContinue).Source
  if (-not $node -and (Test-Path -LiteralPath 'E:/node24/node.exe')) { $node='E:/node24/node.exe' }
  if (-not $node) { throw 'Node.js 22.12 or newer is required for local preview.' }
  $runtime=Join-Path $browserRoot '.runtime-tmp'
  New-Item -ItemType Directory -Path $runtime -Force | Out-Null
  $child=Start-Process -FilePath $node -ArgumentList ('"'+$browserRoot+'/apps/preacherman-demo-host/scripts/preview-web.mjs"') -WorkingDirectory $browserRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput "$runtime/web-preview.log" -RedirectStandardError "$runtime/web-preview-error.log"
  $child.Id | Set-Content -LiteralPath "$runtime/web-preview.pid"
  for ($attempt=0; $attempt -lt 60; $attempt++) {
    Start-Sleep -Milliseconds 500
    try { $identity=Invoke-RestMethod -Uri "$url/__preacherman_preview" -TimeoutSec 1 } catch {}
    if ($identity -and $identity.app -eq 'preacherman-browser' -and $identity.root -eq $browserRoot) { break }
    $child.Refresh(); if ($child.HasExited) { throw 'Web preview failed. See .runtime-tmp/web-preview-error.log.' }
  }
  if (-not $identity) { throw 'Web preview did not become ready within 30 seconds.' }
}
if (-not $NoBrowser) { Start-Process $url }
