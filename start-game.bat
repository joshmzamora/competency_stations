@echo off
setlocal
cd /d "%~dp0"
set "GAME_DIR=%~dp0"
set "GAME_BAT=%~f0"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$content = Get-Content -Raw -LiteralPath $env:GAME_BAT; $marker = '# POWERSHELL-LAUNCHER'; $index = $content.LastIndexOf($marker); if ($index -lt 0) { throw 'Launcher script marker was not found.' }; $script = $content.Substring($index + $marker.Length); Invoke-Expression $script"
exit /b

# POWERSHELL-LAUNCHER
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = (Resolve-Path -LiteralPath $env:GAME_DIR).Path
$port = 3000
$launcherLogPath = Join-Path $root "launcher.log"
$serverProcess = $null
$script:lastHealthCheck = Get-Date

function Write-LauncherLog($line) {
  try {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $launcherLogPath -Value "[$timestamp] $line" -Encoding UTF8
  } catch {
    # Keep the GUI alive even if the log file cannot be written.
  }
}

function Get-LocalIPv4 {
  $addresses = Get-LocalIPv4Addresses
  return ($addresses | Select-Object -First 1)
}

function Get-LocalIPv4Addresses {
  $addresses = [System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList |
    Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork } |
    ForEach-Object { $_.IPAddressToString } |
    Where-Object { $_ -ne "127.0.0.1" -and $_ -notlike "169.254.*" }

  $private = @($addresses | Where-Object { $_ -like "192.168.*" -or $_ -like "10.*" -or $_ -match "^172\.(1[6-9]|2[0-9]|3[0-1])\." })
  $other = @($addresses | Where-Object { $private -notcontains $_ })
  return @($private + $other | Select-Object -Unique)
}

function Test-CommandAvailable($name) {
  return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Add-Log($line) {
  if ([string]::IsNullOrWhiteSpace($line)) { return }
  Write-LauncherLog $line
  $timestamp = Get-Date -Format "HH:mm:ss"
  $logBox.AppendText("[$timestamp] $line`r`n")
  $logBox.SelectionStart = $logBox.TextLength
  $logBox.ScrollToCaret()
}

function Show-LauncherError($message) {
  Write-LauncherLog "ERROR: $message"
  Add-Log "ERROR: $message"
  Set-Status "Needs attention" ([System.Drawing.Color]::FromArgb(255, 80, 104))
  if (-not ($serverProcess -and -not $serverProcess.HasExited)) {
    $startButton.Enabled = $true
    $stopButton.Enabled = $false
  }
  [System.Windows.Forms.MessageBox]::Show($message, "Launcher Error", "OK", "Error") | Out-Null
}

function Open-Url($url) {
  if ([string]::IsNullOrWhiteSpace($url)) {
    throw "No URL was provided."
  }
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "start", '""', $url -WindowStyle Hidden
}

function Set-Status($text, $color) {
  $statusLabel.Text = $text
  $statusLabel.ForeColor = $color
}

function Refresh-Urls {
  $ips = @(Get-LocalIPv4Addresses)
  $hostUrl = "http://localhost:$port/host"
  $playerUrl = if ($ips.Count -gt 0) {
    ($ips | ForEach-Object { "http://$_`:$port/player" }) -join "`r`n"
  } else {
    "http://YOUR-HOST-IP:$port/player"
  }
  $hostUrlBox.Text = $hostUrl
  $playerUrlBox.Text = $playerUrl
}

function Test-ServerHealthy {
  try {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) { return $false }
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/player" -UseBasicParsing -TimeoutSec 2
    return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
  } catch {
    return $false
  }
}

function Update-ServerHealth {
  param([switch]$LogResult)

  Refresh-Urls
  $healthy = Test-ServerHealthy
  if ($healthy) {
    $healthLabel.Text = "Server check: ONLINE - learner computer should use one of the URLs below."
    $healthLabel.ForeColor = [System.Drawing.Color]::FromArgb(34, 245, 199)
    if ($stopButton.Enabled) {
      Set-Status "Running - verified" ([System.Drawing.Color]::FromArgb(34, 245, 199))
    }
    if ($LogResult) {
      Add-Log "Server health check passed. Learner URLs:`r`n$($playerUrlBox.Text)"
    }
  } else {
    $healthLabel.Text = "Server check: OFFLINE - click Start Game and keep the server window open."
    $healthLabel.ForeColor = [System.Drawing.Color]::FromArgb(255, 176, 32)
    if ($LogResult) {
      Add-Log "Server health check failed. Nothing answered at http://127.0.0.1:$port/player"
    }
  }
  return $healthy
}

function Open-HostPage {
  try {
    Refresh-Urls
    Add-Log "Opening Host Mode..."
    Open-Url $hostUrlBox.Text
  } catch {
    Show-LauncherError "Could not open Host Mode automatically. Open this URL manually in your browser:`n`n$($hostUrlBox.Text)`n`nDetails: $($_.Exception.Message)"
  }
}

function Copy-PlayerUrl {
  try {
    Refresh-Urls
    [System.Windows.Forms.Clipboard]::SetText($playerUrlBox.Text)
    Add-Log "Copied player URL: $($playerUrlBox.Text)"
  } catch {
    Show-LauncherError "Could not copy the player URL. Details: $($_.Exception.Message)"
  }
}

function Stop-ExistingServerOnPort {
  try {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    $processIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -and $_ -ne 0 })
    foreach ($processId in $processIds) {
      Add-Log "Stopping old server on port $port (PID $processId)..."
      & taskkill.exe /PID $processId /T /F | Out-Null
    }
    if ($processIds.Count -gt 0) {
      Start-Sleep -Milliseconds 900
    }
  } catch {
    Add-Log "Could not check port $port`: $($_.Exception.Message)"
  }
}

function Wait-ForServerReady {
  param([int]$timeoutSeconds = 60)

  $deadline = (Get-Date).AddSeconds($timeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    [System.Windows.Forms.Application]::DoEvents()
    if (Test-ServerHealthy) {
      return $true
    }
    Start-Sleep -Milliseconds 350
  }

  throw "The server did not start listening on port $port within $timeoutSeconds seconds."
}

function Start-GameServer {
  try {
    if ($serverProcess -and -not $serverProcess.HasExited) {
      Add-Log "Server is already running."
      Open-HostPage
      return
    }

    if (-not (Test-Path -LiteralPath (Join-Path $root "package.json"))) {
      Show-LauncherError "package.json was not found. Keep start-game.bat in the main Competency Stations folder."
      return
    }

    if (-not (Test-CommandAvailable "node") -or -not (Test-CommandAvailable "npm")) {
      [System.Windows.Forms.MessageBox]::Show("Node.js is not installed on this computer.`n`nInstall the LTS version from https://nodejs.org/ and then double-click start-game.bat again.", "Node.js Required", "OK", "Warning") | Out-Null
      Open-Url "https://nodejs.org/"
      return
    }

    Refresh-Urls
    Set-Status "Starting..." ([System.Drawing.Color]::FromArgb(255, 176, 32))
    $startButton.Enabled = $false
    $stopButton.Enabled = $true
    Add-Log "Project folder: $root"
    Add-Log "Host: $($hostUrlBox.Text)"
    Add-Log "Player: $($playerUrlBox.Text)"

    Stop-ExistingServerOnPort

    $commandFile = Join-Path $env:TEMP "competency-stations-start.cmd"
    $playerEchoLines = (($playerUrlBox.Text -split "`r?`n") | ForEach-Object { "echo $_" }) -join "`r`n"
    $commandText = @"
@echo off
title Competency Stations Server
cd /d "$root"
echo =====================================================
echo        COMPETENCY STATIONS LOCAL SERVER
echo =====================================================
echo.
echo Keep this window open while using the game.
echo Host:   http://localhost:$port/host
echo.
echo Player URLs:
$playerEchoLines
echo.
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency install failed. Read the message above.
    pause
    exit /b 1
  )
) else (
  echo Dependencies ready.
)
echo.
echo Starting local server...
call npm run dev
echo.
echo Server stopped. Read any message above.
pause
"@
    Set-Content -LiteralPath $commandFile -Value $commandText -Encoding ASCII

    Add-Log "Opening server command window..."
    $script:serverProcess = Start-Process -FilePath $env:ComSpec -ArgumentList "/k", "`"$commandFile`"" -WorkingDirectory $root -PassThru

    Add-Log "Waiting for local server on port $port..."
    Wait-ForServerReady 90
    Update-ServerHealth -LogResult | Out-Null
    Open-HostPage
  } catch {
    Show-LauncherError $_.Exception.Message
  }
}

function Stop-GameServer {
  try {
    if ($serverProcess -and -not $serverProcess.HasExited) {
      Add-Log "Stopping server..."
      & taskkill.exe /PID $serverProcess.Id /T /F | Out-Null
      $serverProcess.WaitForExit(2500) | Out-Null
    }
    Set-Status "Stopped" ([System.Drawing.Color]::FromArgb(255, 80, 104))
    $startButton.Enabled = $true
    $stopButton.Enabled = $false
  } catch {
    Show-LauncherError "Could not stop cleanly: $($_.Exception.Message)"
  }
}

[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::SetUnhandledExceptionMode([System.Windows.Forms.UnhandledExceptionMode]::CatchException)
[System.Windows.Forms.Application]::add_ThreadException({
  param($sender, $eventArgs)
  Show-LauncherError "Unexpected launcher error: $($eventArgs.Exception.Message)"
})
[AppDomain]::CurrentDomain.add_UnhandledException({
  param($sender, $eventArgs)
  $exception = $eventArgs.ExceptionObject
  $message = if ($exception -is [Exception]) { $exception.Message } else { [string]$exception }
  Write-LauncherLog "FATAL: $message"
})
Write-LauncherLog "Launcher opened from $root"

$form = New-Object System.Windows.Forms.Form
$form.Text = "Competency Stations Launcher"
$form.StartPosition = "CenterScreen"
$form.Size = New-Object System.Drawing.Size(780, 600)
$form.MinimumSize = New-Object System.Drawing.Size(720, 560)
$form.BackColor = [System.Drawing.Color]::FromArgb(13, 18, 24)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

$title = New-Object System.Windows.Forms.Label
$title.Text = "Competency Stations"
$title.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 24)
$title.ForeColor = [System.Drawing.Color]::White
$title.Location = New-Object System.Drawing.Point(24, 20)
$title.Size = New-Object System.Drawing.Size(420, 44)
$form.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Local Wi-Fi simulation launcher"
$subtitle.ForeColor = [System.Drawing.Color]::FromArgb(132, 224, 218)
$subtitle.Location = New-Object System.Drawing.Point(28, 66)
$subtitle.Size = New-Object System.Drawing.Size(360, 24)
$form.Controls.Add($subtitle)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Ready"
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 12)
$statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(255, 176, 32)
$statusLabel.TextAlign = "MiddleRight"
$statusLabel.Location = New-Object System.Drawing.Point(500, 32)
$statusLabel.Size = New-Object System.Drawing.Size(230, 32)
$form.Controls.Add($statusLabel)

$instructions = New-Object System.Windows.Forms.Label
$instructions.Text = "Click Start Game on the host computer. Keep this window open while learners connect from another computer on the same Wi-Fi."
$instructions.ForeColor = [System.Drawing.Color]::FromArgb(198, 208, 216)
$instructions.Location = New-Object System.Drawing.Point(28, 105)
$instructions.Size = New-Object System.Drawing.Size(700, 42)
$form.Controls.Add($instructions)

$startButton = New-Object System.Windows.Forms.Button
$startButton.Text = "Start Game"
$startButton.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 15)
$startButton.BackColor = [System.Drawing.Color]::FromArgb(16, 178, 150)
$startButton.ForeColor = [System.Drawing.Color]::White
$startButton.FlatStyle = "Flat"
$startButton.Location = New-Object System.Drawing.Point(30, 160)
$startButton.Size = New-Object System.Drawing.Size(210, 56)
$startButton.Add_Click({
  try { Start-GameServer } catch { Show-LauncherError $_.Exception.Message }
})
$form.Controls.Add($startButton)

$openHostButton = New-Object System.Windows.Forms.Button
$openHostButton.Text = "Open Host"
$openHostButton.BackColor = [System.Drawing.Color]::FromArgb(28, 37, 48)
$openHostButton.ForeColor = [System.Drawing.Color]::White
$openHostButton.FlatStyle = "Flat"
$openHostButton.Location = New-Object System.Drawing.Point(255, 160)
$openHostButton.Size = New-Object System.Drawing.Size(145, 56)
$openHostButton.Add_Click({
  try { Open-HostPage } catch { Show-LauncherError $_.Exception.Message }
})
$form.Controls.Add($openHostButton)

$copyPlayerButton = New-Object System.Windows.Forms.Button
$copyPlayerButton.Text = "Copy Player URL"
$copyPlayerButton.BackColor = [System.Drawing.Color]::FromArgb(28, 37, 48)
$copyPlayerButton.ForeColor = [System.Drawing.Color]::White
$copyPlayerButton.FlatStyle = "Flat"
$copyPlayerButton.Location = New-Object System.Drawing.Point(415, 160)
$copyPlayerButton.Size = New-Object System.Drawing.Size(155, 56)
$copyPlayerButton.Add_Click({
  try { Copy-PlayerUrl } catch { Show-LauncherError $_.Exception.Message }
})
$form.Controls.Add($copyPlayerButton)

$stopButton = New-Object System.Windows.Forms.Button
$stopButton.Text = "Stop"
$stopButton.BackColor = [System.Drawing.Color]::FromArgb(104, 28, 42)
$stopButton.ForeColor = [System.Drawing.Color]::White
$stopButton.FlatStyle = "Flat"
$stopButton.Location = New-Object System.Drawing.Point(585, 160)
$stopButton.Size = New-Object System.Drawing.Size(145, 56)
$stopButton.Enabled = $false
$stopButton.Add_Click({
  try { Stop-GameServer } catch { Show-LauncherError $_.Exception.Message }
})
$form.Controls.Add($stopButton)

$hostLabel = New-Object System.Windows.Forms.Label
$hostLabel.Text = "Host computer"
$hostLabel.ForeColor = [System.Drawing.Color]::FromArgb(132, 224, 218)
$hostLabel.Location = New-Object System.Drawing.Point(30, 238)
$hostLabel.Size = New-Object System.Drawing.Size(160, 24)
$form.Controls.Add($hostLabel)

$hostUrlBox = New-Object System.Windows.Forms.TextBox
$hostUrlBox.ReadOnly = $true
$hostUrlBox.BackColor = [System.Drawing.Color]::FromArgb(8, 12, 18)
$hostUrlBox.ForeColor = [System.Drawing.Color]::White
$hostUrlBox.BorderStyle = "FixedSingle"
$hostUrlBox.Location = New-Object System.Drawing.Point(30, 264)
$hostUrlBox.Size = New-Object System.Drawing.Size(700, 30)
$form.Controls.Add($hostUrlBox)

$playerLabel = New-Object System.Windows.Forms.Label
$playerLabel.Text = "Learner/player computer"
$playerLabel.ForeColor = [System.Drawing.Color]::FromArgb(132, 224, 218)
$playerLabel.Location = New-Object System.Drawing.Point(30, 312)
$playerLabel.Size = New-Object System.Drawing.Size(220, 24)
$form.Controls.Add($playerLabel)

$playerUrlBox = New-Object System.Windows.Forms.TextBox
$playerUrlBox.ReadOnly = $true
$playerUrlBox.Multiline = $true
$playerUrlBox.BackColor = [System.Drawing.Color]::FromArgb(8, 12, 18)
$playerUrlBox.ForeColor = [System.Drawing.Color]::White
$playerUrlBox.BorderStyle = "FixedSingle"
$playerUrlBox.Location = New-Object System.Drawing.Point(30, 338)
$playerUrlBox.Size = New-Object System.Drawing.Size(700, 52)
$form.Controls.Add($playerUrlBox)

$healthLabel = New-Object System.Windows.Forms.Label
$healthLabel.Text = "Server check: not started"
$healthLabel.ForeColor = [System.Drawing.Color]::FromArgb(255, 176, 32)
$healthLabel.Location = New-Object System.Drawing.Point(30, 400)
$healthLabel.Size = New-Object System.Drawing.Size(520, 28)
$form.Controls.Add($healthLabel)

$checkServerButton = New-Object System.Windows.Forms.Button
$checkServerButton.Text = "Check Server"
$checkServerButton.BackColor = [System.Drawing.Color]::FromArgb(28, 37, 48)
$checkServerButton.ForeColor = [System.Drawing.Color]::White
$checkServerButton.FlatStyle = "Flat"
$checkServerButton.Location = New-Object System.Drawing.Point(575, 395)
$checkServerButton.Size = New-Object System.Drawing.Size(155, 34)
$checkServerButton.Add_Click({
  try { Update-ServerHealth -LogResult | Out-Null } catch { Show-LauncherError $_.Exception.Message }
})
$form.Controls.Add($checkServerButton)

$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline = $true
$logBox.ReadOnly = $true
$logBox.ScrollBars = "Vertical"
$logBox.BackColor = [System.Drawing.Color]::FromArgb(4, 8, 12)
$logBox.ForeColor = [System.Drawing.Color]::FromArgb(214, 229, 232)
$logBox.BorderStyle = "FixedSingle"
$logBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$logBox.Location = New-Object System.Drawing.Point(30, 440)
$logBox.Size = New-Object System.Drawing.Size(700, 85)
$logBox.Anchor = "Left,Right,Top,Bottom"
$form.Controls.Add($logBox)

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 250
$timer.Add_Tick({
  if ($serverProcess -and $serverProcess.HasExited -and $stopButton.Enabled) {
    Set-Status "Stopped" ([System.Drawing.Color]::FromArgb(255, 80, 104))
    $startButton.Enabled = $true
    $stopButton.Enabled = $false
  }
  if (((Get-Date) - $script:lastHealthCheck).TotalSeconds -ge 2) {
    $script:lastHealthCheck = Get-Date
    Update-ServerHealth | Out-Null
  }
})
$timer.Start()

$form.Add_FormClosing({
  param($sender, $eventArgs)
  if ($serverProcess -and -not $serverProcess.HasExited) {
    $choice = [System.Windows.Forms.MessageBox]::Show("Stop the local game server and close the launcher?", "Close Launcher", "YesNo", "Question")
    if ($choice -ne [System.Windows.Forms.DialogResult]::Yes) {
      $eventArgs.Cancel = $true
      return
    }
    Stop-GameServer
  }
})

Refresh-Urls
Add-Log "Ready. Click Start Game."
[void]$form.ShowDialog()
