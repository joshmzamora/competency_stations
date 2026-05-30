param(
  [string]$OutputRoot,
  [string]$NodeVersion = ""
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
if (-not $OutputRoot) {
  $OutputRoot = Join-Path $root "release"
}

$packageName = "Competency-Stations"
$packageDir = Join-Path $OutputRoot $packageName
$cacheDir = Join-Path $root ".package-cache"
$nodeCacheDir = Join-Path $cacheDir "node"
$iconPng = Join-Path $root "icon.png"
$iconIco = Join-Path $cacheDir "icon.ico"
$launcherSource = Join-Path $root "tools\CompetencyStationsLauncher.ps1"

function Write-Step($message) {
  Write-Host ""
  Write-Host "== $message" -ForegroundColor Cyan
}

function Invoke-RepoCommand($command, $arguments) {
  $process = Start-Process -FilePath $command -ArgumentList $arguments -WorkingDirectory $root -NoNewWindow -Wait -PassThru
  if ($process.ExitCode -ne 0) {
    throw "$command $arguments failed with exit code $($process.ExitCode)."
  }
}

function Convert-PngToIco($pngPath, $icoPath) {
  if (-not (Test-Path -LiteralPath $pngPath)) { return $false }

  Add-Type -AssemblyName System.Drawing
  $source = New-Object System.Drawing.Bitmap($pngPath)
  try {
    $size = 256
    $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $scale = [Math]::Min($size / $source.Width, $size / $source.Height)
        $width = [int]($source.Width * $scale)
        $height = [int]($source.Height * $scale)
        $x = [int](($size - $width) / 2)
        $y = [int](($size - $height) / 2)
        $graphics.DrawImage($source, $x, $y, $width, $height)
      } finally {
        $graphics.Dispose()
      }

      $pngStream = New-Object System.IO.MemoryStream
      try {
        $bitmap.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngBytes = $pngStream.ToArray()

        $fileStream = [System.IO.File]::Create($icoPath)
        $writer = New-Object System.IO.BinaryWriter($fileStream)
        try {
          $writer.Write([UInt16]0)
          $writer.Write([UInt16]1)
          $writer.Write([UInt16]1)
          $writer.Write([Byte]0)
          $writer.Write([Byte]0)
          $writer.Write([Byte]0)
          $writer.Write([Byte]0)
          $writer.Write([UInt16]1)
          $writer.Write([UInt16]32)
          $writer.Write([UInt32]$pngBytes.Length)
          $writer.Write([UInt32]22)
          $writer.Write($pngBytes)
        } finally {
          $writer.Dispose()
          $fileStream.Dispose()
        }
      } finally {
        $pngStream.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $source.Dispose()
  }
  return $true
}

function Get-LatestLtsNodeVersion {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $index = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json"
  $latest = $index | Where-Object { $_.lts } | Select-Object -First 1
  if (-not $latest) { throw "Could not determine the latest Node.js LTS version." }
  return $latest.version
}

function Ensure-PortableNode($destinationDir) {
  if (-not $NodeVersion) {
    Write-Step "Finding latest Node.js LTS"
    $script:NodeVersion = Get-LatestLtsNodeVersion
  }

  Write-Step "Preparing portable Node.js $NodeVersion"
  New-Item -ItemType Directory -Force -Path $nodeCacheDir | Out-Null
  $nodeFolderName = "node-$NodeVersion-win-x64"
  $zipPath = Join-Path $nodeCacheDir "$nodeFolderName.zip"
  $expandedDir = Join-Path $nodeCacheDir $nodeFolderName

  if (-not (Test-Path -LiteralPath $zipPath)) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $url = "https://nodejs.org/dist/$NodeVersion/$nodeFolderName.zip"
    Invoke-WebRequest -Uri $url -OutFile $zipPath
  }

  if (-not (Test-Path -LiteralPath $expandedDir)) {
    Expand-Archive -LiteralPath $zipPath -DestinationPath $nodeCacheDir -Force
  }

  $runtimeDir = Join-Path $destinationDir "runtime\node"
  New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
  Copy-Item -Path (Join-Path $expandedDir "*") -Destination $runtimeDir -Recurse -Force
}

function Build-LauncherExe($destinationDir) {
  Write-Step "Building launcher EXE"
  New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
  $iconReady = Convert-PngToIco $iconPng $iconIco
  $exePath = Join-Path $destinationDir "Start Competency Stations.exe"

  try {
    $command = Get-Command Invoke-ps2exe -ErrorAction SilentlyContinue
    if (-not $command) {
      Write-Host "Installing PS2EXE for the current Windows user..." -ForegroundColor Yellow
      [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
      if (-not (Get-PackageProvider -Name NuGet -ListAvailable -ErrorAction SilentlyContinue)) {
        Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Scope CurrentUser -Force -Confirm:$false | Out-Null
      }
      try {
        Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -ErrorAction SilentlyContinue
      } catch {
        # Continue even if the repository policy cannot be changed.
      }
      try {
        Install-Module ps2exe -Scope CurrentUser -Force -AllowClobber -Confirm:$false -AcceptLicense
      } catch {
        Install-Module ps2exe -Scope CurrentUser -Force -AllowClobber -Confirm:$false
      }
      Import-Module ps2exe -Force
      $command = Get-Command Invoke-ps2exe -ErrorAction Stop
    }

    $parameters = @{
      inputFile = $launcherSource
      outputFile = $exePath
      noConsole = $true
      title = "Competency Stations"
      product = "Competency Stations"
      description = "Local nursing competency simulation launcher"
    }
    if ($iconReady) {
      $parameters.iconFile = $iconIco
    }
    Invoke-ps2exe @parameters
  } catch {
    Write-Host "Could not build the EXE launcher: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "The package will still include Start Competency Stations.ps1 as a fallback." -ForegroundColor Yellow
  }
}

function Write-PackageReadme($destinationDir) {
  $readmePath = Join-Path $destinationDir "README-FIRST.txt"
  $content = @"
Competency Stations - One Click Windows Package

1. Keep this entire folder together.
2. Double-click "Start Competency Stations.exe".
3. Click "Start Game".
4. The host screen opens automatically.
5. On the player computer, open the Player URL shown in the launcher.

If Windows asks about firewall access, choose Allow on private networks.

If the EXE is blocked by Windows SmartScreen:
- Right-click the EXE.
- Click Properties.
- Check Unblock if it appears.
- Click OK.
- Open it again.

If the EXE is missing, right-click "Start Competency Stations.ps1" and choose
"Run with PowerShell".

This package includes its own portable Node.js runtime. The host computer does
not need Node.js installed.
"@
  Set-Content -LiteralPath $readmePath -Value $content -Encoding ASCII
}

Write-Step "Installing dependencies"
Invoke-RepoCommand "npm.cmd" "install"

Write-Step "Building app"
Invoke-RepoCommand "npm.cmd" "run build"

Write-Step "Creating release folder"
if (Test-Path -LiteralPath $packageDir) {
  Remove-Item -LiteralPath $packageDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $packageDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $packageDir "data") | Out-Null

Copy-Item -LiteralPath (Join-Path $root "dist") -Destination (Join-Path $packageDir "dist") -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "dist-server") -Destination (Join-Path $packageDir "dist-server") -Recurse -Force
Copy-Item -LiteralPath $launcherSource -Destination (Join-Path $packageDir "Start Competency Stations.ps1") -Force
if (Test-Path -LiteralPath $iconPng) {
  Copy-Item -LiteralPath $iconPng -Destination (Join-Path $packageDir "icon.png") -Force
}
Set-Content -LiteralPath (Join-Path $packageDir "data\results.json") -Value "[]" -Encoding ASCII

Ensure-PortableNode $packageDir
Build-LauncherExe $packageDir
Write-PackageReadme $packageDir

Write-Step "Done"
Write-Host "Package folder:" -ForegroundColor Green
Write-Host $packageDir
Write-Host ""
Write-Host "Zip that folder and give it to the host computer user." -ForegroundColor Green
