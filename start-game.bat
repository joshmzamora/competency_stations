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
$serverProcess = $null
$outputQueue = New-Object System.Collections.Concurrent.ConcurrentQueue[string]

function Get-LocalIPv4 {
  $addresses = [System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList |
    Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork } |
    ForEach-Object { $_.IPAddressToString } |
    Where-Object { $_ -ne "127.0.0.1" -and $_ -notlike "169.254.*" }

  $preferred = $addresses | Where-Object { $_ -like "192.168.*" -or $_ -like "10.*" -or $_ -match "^172\.(1[6-9]|2[0-9]|3[0-1])\." } | Select-Object -First 1
  if ($preferred) { return $preferred }
  return ($addresses | Select-Object -First 1)
}

function Test-CommandAvailable($name) {
  return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Add-Log($line) {
  if ([string]::IsNullOrWhiteSpace($line)) { return }
  $timestamp = Get-Date -Format "HH:mm:ss"
  $logBox.AppendText("[$timestamp] $line`r`n")
  $logBox.SelectionStart = $logBox.TextLength
  $logBox.ScrollToCaret()
}

function Show-LauncherError($message) {
  Add-Log "ERROR: $message"
  Set-Status "Needs attention" ([System.Drawing.Color]::FromArgb(255, 80, 104))
  $startButton.Enabled = $true
  $stopButton.Enabled = $false
  [System.Windows.Forms.MessageBox]::Show($message, "Launcher Error", "OK", "Error") | Out-Null
}

function Set-Status($text, $color) {
  $statusLabel.Text = $text
  $statusLabel.ForeColor = $color
}

function Refresh-Urls {
  $ip = Get-LocalIPv4
  $hostUrl = "http://localhost:$port/host"
  $playerUrl = if ($ip) { "http://$ip`:$port/player" } else { "http://YOUR-HOST-IP:$port/player" }
  $hostUrlBox.Text = $hostUrl
  $playerUrlBox.Text = $playerUrl
}

function Start-GameServer {
  try {
    if ($serverProcess -and -not $serverProcess.HasExited) {
      Add-Log "Server is already running."
      Start-Process $hostUrlBox.Text
      return
    }

    if (-not (Test-Path -LiteralPath (Join-Path $root "package.json"))) {
      Show-LauncherError "package.json was not found. Keep start-game.bat in the main Competency Stations folder."
      return
    }

    if (-not (Test-CommandAvailable "node") -or -not (Test-CommandAvailable "npm")) {
      [System.Windows.Forms.MessageBox]::Show("Node.js is not installed on this computer.`n`nInstall the LTS version from https://nodejs.org/ and then double-click start-game.bat again.", "Node.js Required", "OK", "Warning") | Out-Null
      Start-Process "https://nodejs.org/"
      return
    }

    Refresh-Urls
    Set-Status "Starting..." ([System.Drawing.Color]::FromArgb(255, 176, 32))
    $startButton.Enabled = $false
    $stopButton.Enabled = $true
    Add-Log "Project folder: $root"
    Add-Log "Host: $($hostUrlBox.Text)"
    Add-Log "Player: $($playerUrlBox.Text)"

    $commandFile = Join-Path $env:TEMP "competency-stations-start.cmd"
    $commandText = @"
@echo off
cd /d "$root"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
) else (
  echo Dependencies ready.
)
echo Starting local server...
call npm run dev
"@
    Set-Content -LiteralPath $commandFile -Value $commandText -Encoding ASCII

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $env:ComSpec
    $psi.Arguments = "/d /s /c `"$commandFile`""
    $psi.WorkingDirectory = $root
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true

    $script:serverProcess = New-Object System.Diagnostics.Process
    $script:serverProcess.StartInfo = $psi
    $script:serverProcess.EnableRaisingEvents = $true
    $script:serverProcess.add_OutputDataReceived({ param($sender, $eventArgs) if ($eventArgs.Data) { $outputQueue.Enqueue($eventArgs.Data) } })
    $script:serverProcess.add_ErrorDataReceived({ param($sender, $eventArgs) if ($eventArgs.Data) { $outputQueue.Enqueue($eventArgs.Data) } })
    $script:serverProcess.add_Exited({ $outputQueue.Enqueue("Server process stopped.") })

    [void]$script:serverProcess.Start()
    $script:serverProcess.BeginOutputReadLine()
    $script:serverProcess.BeginErrorReadLine()

    Start-Sleep -Milliseconds 600
    Set-Status "Running on localhost:3000" ([System.Drawing.Color]::FromArgb(34, 245, 199))
    Add-Log "Opening Host Mode in your browser..."
    Start-Process $hostUrlBox.Text
  } catch {
    Show-LauncherError $_.Exception.Message
  }
}

function Stop-GameServer {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Add-Log "Stopping server..."
    try {
      & taskkill.exe /PID $serverProcess.Id /T /F | Out-Null
      $serverProcess.WaitForExit(2500) | Out-Null
    } catch {
      Add-Log "Could not stop cleanly: $($_.Exception.Message)"
    }
  }
  Set-Status "Stopped" ([System.Drawing.Color]::FromArgb(255, 80, 104))
  $startButton.Enabled = $true
  $stopButton.Enabled = $false
}

[System.Windows.Forms.Application]::EnableVisualStyles()

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
$startButton.Add_Click({ Start-GameServer })
$form.Controls.Add($startButton)

$openHostButton = New-Object System.Windows.Forms.Button
$openHostButton.Text = "Open Host"
$openHostButton.BackColor = [System.Drawing.Color]::FromArgb(28, 37, 48)
$openHostButton.ForeColor = [System.Drawing.Color]::White
$openHostButton.FlatStyle = "Flat"
$openHostButton.Location = New-Object System.Drawing.Point(255, 160)
$openHostButton.Size = New-Object System.Drawing.Size(145, 56)
$openHostButton.Add_Click({ Refresh-Urls; Start-Process $hostUrlBox.Text })
$form.Controls.Add($openHostButton)

$copyPlayerButton = New-Object System.Windows.Forms.Button
$copyPlayerButton.Text = "Copy Player URL"
$copyPlayerButton.BackColor = [System.Drawing.Color]::FromArgb(28, 37, 48)
$copyPlayerButton.ForeColor = [System.Drawing.Color]::White
$copyPlayerButton.FlatStyle = "Flat"
$copyPlayerButton.Location = New-Object System.Drawing.Point(415, 160)
$copyPlayerButton.Size = New-Object System.Drawing.Size(155, 56)
$copyPlayerButton.Add_Click({ Refresh-Urls; [System.Windows.Forms.Clipboard]::SetText($playerUrlBox.Text); Add-Log "Copied player URL." })
$form.Controls.Add($copyPlayerButton)

$stopButton = New-Object System.Windows.Forms.Button
$stopButton.Text = "Stop"
$stopButton.BackColor = [System.Drawing.Color]::FromArgb(104, 28, 42)
$stopButton.ForeColor = [System.Drawing.Color]::White
$stopButton.FlatStyle = "Flat"
$stopButton.Location = New-Object System.Drawing.Point(585, 160)
$stopButton.Size = New-Object System.Drawing.Size(145, 56)
$stopButton.Enabled = $false
$stopButton.Add_Click({ Stop-GameServer })
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
$playerUrlBox.BackColor = [System.Drawing.Color]::FromArgb(8, 12, 18)
$playerUrlBox.ForeColor = [System.Drawing.Color]::White
$playerUrlBox.BorderStyle = "FixedSingle"
$playerUrlBox.Location = New-Object System.Drawing.Point(30, 338)
$playerUrlBox.Size = New-Object System.Drawing.Size(700, 30)
$form.Controls.Add($playerUrlBox)

$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline = $true
$logBox.ReadOnly = $true
$logBox.ScrollBars = "Vertical"
$logBox.BackColor = [System.Drawing.Color]::FromArgb(4, 8, 12)
$logBox.ForeColor = [System.Drawing.Color]::FromArgb(214, 229, 232)
$logBox.BorderStyle = "FixedSingle"
$logBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$logBox.Location = New-Object System.Drawing.Point(30, 390)
$logBox.Size = New-Object System.Drawing.Size(700, 135)
$logBox.Anchor = "Left,Right,Top,Bottom"
$form.Controls.Add($logBox)

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 250
$timer.Add_Tick({
  $line = $null
  while ($outputQueue.TryDequeue([ref]$line)) {
    Add-Log $line
  }
  if ($serverProcess -and $serverProcess.HasExited -and $stopButton.Enabled) {
    Set-Status "Stopped" ([System.Drawing.Color]::FromArgb(255, 80, 104))
    $startButton.Enabled = $true
    $stopButton.Enabled = $false
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
