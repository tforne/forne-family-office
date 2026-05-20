param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

$projectPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$projectPathNormalized = $projectPath.ToLowerInvariant()

Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object {
    $commandLine = $_.CommandLine
    if ([string]::IsNullOrWhiteSpace($commandLine)) {
      return $false
    }

    $normalized = $commandLine.ToLowerInvariant()
    return $normalized.Contains($projectPathNormalized)
  } |
  ForEach-Object {
    try {
      Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
    } catch {
      Write-Warning "No se pudo detener el proceso $($_.ProcessId): $($_.Exception.Message)"
    }
  }

Start-Sleep -Seconds 2

$nextPath = Join-Path $projectPath ".next"
if (Test-Path $nextPath) {
  Remove-Item $nextPath -Recurse -Force
}

Write-Host "Arrancando Next.js limpio en el puerto $Port..."
& (Join-Path $PSScriptRoot "dev-user-env.ps1") -Port $Port
