$ErrorActionPreference='Stop'
$browserRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$pidFile=Join-Path $browserRoot '.runtime-tmp/web-preview.pid'
if (-not (Test-Path -LiteralPath $pidFile)) { exit 0 }
$previewId=[int](Get-Content -LiteralPath $pidFile)
$preview=Get-CimInstance Win32_Process -Filter "ProcessId=$previewId"
if ($preview) {
  $expected=(Join-Path $browserRoot 'apps/preacherman-demo-host/scripts/preview-web.mjs').Replace('\','/')
  if ($preview.Name -ne 'node.exe' -or -not $preview.CommandLine.Replace('\','/').Contains($expected)) { throw 'Process ownership mismatch; nothing stopped.' }
  Stop-Process -Id $previewId
}
Remove-Item -LiteralPath $pidFile
