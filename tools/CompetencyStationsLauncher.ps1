Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$port = 3000
$script:serverProcess = $null

function Get-LauncherRoot {
  $candidates = New-Object System.Collections.Generic.List[string]

  if ($PSScriptRoot) {
    $candidates.Add($PSScriptRoot)
    $parent = Split-Path -Parent $PSScriptRoot
    if ($parent) { $candidates.Add($parent) }
  }

  if ($MyInvocation.MyCommand.Path) {
    $pathRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    if ($pathRoot) { $candidates.Add($pathRoot) }
  }

  try {
    $processPath = [System.Diagnostics.Process]::GetCurrentProcess().MainModule.FileName
    $processRoot = Split-Path -Parent $processPath
    if ($processRoot) { $candidates.Add($processRoot) }
  } catch {
    # Ignore process path lookup failures.
  }

  foreach ($candidate in ($candidates | Select-Object -Unique)) {
    if ($candidate -and (Test-Path -LiteralPath (Join-Path $candidate "dist-server\server.js"))) {
      return (Resolve-Path -LiteralPath $candidate).Path
    }
  }

  if ($PSScriptRoot) { return (Resolve-Path -LiteralPath $PSScriptRoot).Path }
  return (Resolve-Path -LiteralPath ".").Path
}

$root = Get-LauncherRoot
$launcherLogPath = Join-Path $root "launcher.log"

function Write-LauncherLog($line) {
  try {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $launcherLogPath -Value "[$timestamp] $line" -Encoding UTF8
  } catch {
    # Keep the launcher alive if logging fails.
  }
}

function Get-LocalIPv4 {
  $addresses = [System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList |
    Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork } |
    ForEach-Object { $_.IPAddressToString } |
    Where-Object { $_ -ne "127.0.0.1" -and $_ -notlike "169.254.*" }

  $preferred = $addresses |
    Where-Object { $_ -like "192.168.*" -or $_ -like "10.*" -or $_ -match "^172\.(1[6-9]|2[0-9]|3[0-1])\." } |
    Select-Object -First 1

  if ($preferred) { return $preferred }
  return ($addresses | Select-Object -First 1)
}

function Get-NodePath {
  $portableNode = Join-Path $root "runtime\node\node.exe"
  if (Test-Path -LiteralPath $portableNode) { return $portableNode }

  $installedNode = Get-Command "node.exe" -ErrorAction SilentlyContinue
  if ($installedNode) { return $installedNode.Source }

  return $null
}

function Add-Log($line) {
  if ([string]::IsNullOrWhiteSpace($line)) { return }
  Write-LauncherLog $line
  if ($script:logBox) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $script:logBox.AppendText("[$timestamp] $line`r`n")
    $script:logBox.SelectionStart = $script:logBox.TextLength
    $script:logBox.ScrollToCaret()
  }
}

function Set-Status($text, $color) {
  $script:statusLabel.Text = $text
  $script:statusLabel.ForeColor = $color
}

function Show-LauncherError($message) {
  Write-LauncherLog "ERROR: $message"
  Add-Log "ERROR: $message"
  Set-Status "Needs attention" ([System.Drawing.Color]::FromArgb(255, 80, 104))
  $script:startButton.Enabled = $true
  $script:stopButton.Enabled = $false
  [System.Windows.Forms.MessageBox]::Show($message, "Competency Stations", "OK", "Error") | Out-Null
}

function Refresh-Urls {
  $ip = Get-LocalIPv4
  $hostUrl = "http://localhost:$port/host"
  $playerUrl = if ($ip) { "http://$ip`:$port/player" } else { "http://YOUR-HOST-IP:$port/player" }
  $script:hostUrlBox.Text = $hostUrl
  $script:playerUrlBox.Text = $playerUrl
}

function Open-Url($url) {
  if ([string]::IsNullOrWhiteSpace($url)) { throw "No URL was provided." }
  Start-Process $url
}

function Open-HostPage {
  Refresh-Urls
  Add-Log "Opening Host Mode..."
  Open-Url $script:hostUrlBox.Text
}

function Copy-PlayerUrl {
  Refresh-Urls
  [System.Windows.Forms.Clipboard]::SetText($script:playerUrlBox.Text)
  Add-Log "Copied player URL: $($script:playerUrlBox.Text)"
}

function Stop-ExistingServerOnPort {
  try {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    $processIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -and $_ -ne 0 })
    foreach ($processId in $processIds) {
      Add-Log "Stopping old server on port $port (PID $processId)..."
      & taskkill.exe /PID $processId /T /F | Out-Null
    }
    if ($processIds.Count -gt 0) { Start-Sleep -Milliseconds 900 }
  } catch {
    Add-Log "Could not check port $port`: $($_.Exception.Message)"
  }
}

function Wait-ForServerReady {
  param([int]$timeoutSeconds = 45)

  $deadline = (Get-Date).AddSeconds($timeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    [System.Windows.Forms.Application]::DoEvents()
    try {
      $response = Invoke-WebRequest -Uri "http://localhost:$port/host" -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return $true }
    } catch {
      Start-Sleep -Milliseconds 350
    }
  }

  throw "The local server did not start on port $port within $timeoutSeconds seconds."
}

function Start-GameServer {
  try {
    if ($script:serverProcess -and -not $script:serverProcess.HasExited) {
      Add-Log "Server is already running."
      Open-HostPage
      return
    }

    $serverPath = Join-Path $root "dist-server\server.js"
    $distPath = Join-Path $root "dist\index.html"
    $nodePath = Get-NodePath

    if (-not (Test-Path -LiteralPath $serverPath) -or -not (Test-Path -LiteralPath $distPath)) {
      Show-LauncherError "The packaged app files were not found. Rebuild the Windows package and keep the launcher in the same folder as dist and dist-server."
      return
    }

    if (-not $nodePath) {
      Show-LauncherError "Node was not found. This package should include runtime\node\node.exe. Rebuild the Windows package or install Node.js LTS."
      return
    }

    Refresh-Urls
    Set-Status "Starting..." ([System.Drawing.Color]::FromArgb(255, 176, 32))
    $script:startButton.Enabled = $false
    $script:stopButton.Enabled = $true
    Add-Log "App folder: $root"
    Add-Log "Host: $($script:hostUrlBox.Text)"
    Add-Log "Player: $($script:playerUrlBox.Text)"

    Stop-ExistingServerOnPort

    $serverLog = Join-Path $root "server.log"
    $serverErr = Join-Path $root "server.err.log"
    $commandFile = Join-Path $env:TEMP "competency-stations-server.cmd"
    $commandText = @"
@echo off
cd /d "$root"
set NODE_ENV=production
set PORT=$port
"$nodePath" "$serverPath" >> "$serverLog" 2>> "$serverErr"
"@
    Set-Content -LiteralPath $commandFile -Value $commandText -Encoding ASCII

    $script:serverProcess = Start-Process -FilePath $env:ComSpec -ArgumentList "/c", "`"$commandFile`"" -WorkingDirectory $root -WindowStyle Hidden -PassThru
    Add-Log "Waiting for local server..."
    Wait-ForServerReady 45
    Set-Status "Running" ([System.Drawing.Color]::FromArgb(34, 245, 199))
    Open-HostPage
  } catch {
    Show-LauncherError $_.Exception.Message
  }
}

function Stop-GameServer {
  try {
    if ($script:serverProcess -and -not $script:serverProcess.HasExited) {
      Add-Log "Stopping server..."
      & taskkill.exe /PID $script:serverProcess.Id /T /F | Out-Null
      $script:serverProcess.WaitForExit(2500) | Out-Null
    } else {
      Stop-ExistingServerOnPort
    }

    Set-Status "Stopped" ([System.Drawing.Color]::FromArgb(255, 80, 104))
    $script:startButton.Enabled = $true
    $script:stopButton.Enabled = $false
  } catch {
    Show-LauncherError "Could not stop cleanly: $($_.Exception.Message)"
  }
}

function Set-FormIcon {
  param([System.Windows.Forms.Form]$form)

  $iconPath = Join-Path $root "icon.png"
  if (-not (Test-Path -LiteralPath $iconPath)) { return }

  try {
    $bitmap = New-Object System.Drawing.Bitmap($iconPath)
    $form.Icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
  } catch {
    # Icon is cosmetic. Ignore failures.
  }
}

[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::SetUnhandledExceptionMode([System.Windows.Forms.UnhandledExceptionMode]::CatchException)
[System.Windows.Forms.Application]::add_ThreadException({
  param($sender, $eventArgs)
  Show-LauncherError "Unexpected launcher error: $($eventArgs.Exception.Message)"
})

$form = New-Object System.Windows.Forms.Form
$form.Text = "Competency Stations"
$form.StartPosition = "CenterScreen"
$form.Size = New-Object System.Drawing.Size(800, 570)
$form.MinimumSize = New-Object System.Drawing.Size(740, 540)
$form.BackColor = [System.Drawing.Color]::FromArgb(13, 18, 24)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)
Set-FormIcon $form

$title = New-Object System.Windows.Forms.Label
$title.Text = "Competency Stations"
$title.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 24)
$title.ForeColor = [System.Drawing.Color]::White
$title.Location = New-Object System.Drawing.Point(24, 20)
$title.Size = New-Object System.Drawing.Size(430, 44)
$form.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "One-click local simulation launcher"
$subtitle.ForeColor = [System.Drawing.Color]::FromArgb(132, 224, 218)
$subtitle.Location = New-Object System.Drawing.Point(28, 66)
$subtitle.Size = New-Object System.Drawing.Size(420, 24)
$form.Controls.Add($subtitle)

$script:statusLabel = New-Object System.Windows.Forms.Label
$script:statusLabel.Text = "Ready"
$script:statusLabel.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 12)
$script:statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(255, 176, 32)
$script:statusLabel.TextAlign = "MiddleRight"
$script:statusLabel.Location = New-Object System.Drawing.Point(510, 32)
$script:statusLabel.Size = New-Object System.Drawing.Size(240, 32)
$form.Controls.Add($script:statusLabel)

$instructions = New-Object System.Windows.Forms.Label
$instructions.Text = "Click Start Game on the host computer. Keep this window open. The player computer uses the Player URL shown below."
$instructions.ForeColor = [System.Drawing.Color]::FromArgb(198, 208, 216)
$instructions.Location = New-Object System.Drawing.Point(28, 105)
$instructions.Size = New-Object System.Drawing.Size(720, 42)
$form.Controls.Add($instructions)

$script:startButton = New-Object System.Windows.Forms.Button
$script:startButton.Text = "Start Game"
$script:startButton.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 15)
$script:startButton.BackColor = [System.Drawing.Color]::FromArgb(16, 178, 150)
$script:startButton.ForeColor = [System.Drawing.Color]::White
$script:startButton.FlatStyle = "Flat"
$script:startButton.Location = New-Object System.Drawing.Point(30, 160)
$script:startButton.Size = New-Object System.Drawing.Size(220, 58)
$script:startButton.Add_Click({ Start-GameServer })
$form.Controls.Add($script:startButton)

$openHostButton = New-Object System.Windows.Forms.Button
$openHostButton.Text = "Open Host"
$openHostButton.BackColor = [System.Drawing.Color]::FromArgb(28, 37, 48)
$openHostButton.ForeColor = [System.Drawing.Color]::White
$openHostButton.FlatStyle = "Flat"
$openHostButton.Location = New-Object System.Drawing.Point(265, 160)
$openHostButton.Size = New-Object System.Drawing.Size(150, 58)
$openHostButton.Add_Click({ Open-HostPage })
$form.Controls.Add($openHostButton)

$copyPlayerButton = New-Object System.Windows.Forms.Button
$copyPlayerButton.Text = "Copy Player URL"
$copyPlayerButton.BackColor = [System.Drawing.Color]::FromArgb(28, 37, 48)
$copyPlayerButton.ForeColor = [System.Drawing.Color]::White
$copyPlayerButton.FlatStyle = "Flat"
$copyPlayerButton.Location = New-Object System.Drawing.Point(430, 160)
$copyPlayerButton.Size = New-Object System.Drawing.Size(165, 58)
$copyPlayerButton.Add_Click({ Copy-PlayerUrl })
$form.Controls.Add($copyPlayerButton)

$script:stopButton = New-Object System.Windows.Forms.Button
$script:stopButton.Text = "Stop"
$script:stopButton.BackColor = [System.Drawing.Color]::FromArgb(104, 28, 42)
$script:stopButton.ForeColor = [System.Drawing.Color]::White
$script:stopButton.FlatStyle = "Flat"
$script:stopButton.Location = New-Object System.Drawing.Point(610, 160)
$script:stopButton.Size = New-Object System.Drawing.Size(140, 58)
$script:stopButton.Enabled = $false
$script:stopButton.Add_Click({ Stop-GameServer })
$form.Controls.Add($script:stopButton)

$hostLabel = New-Object System.Windows.Forms.Label
$hostLabel.Text = "Host computer"
$hostLabel.ForeColor = [System.Drawing.Color]::FromArgb(132, 224, 218)
$hostLabel.Location = New-Object System.Drawing.Point(30, 238)
$hostLabel.Size = New-Object System.Drawing.Size(180, 24)
$form.Controls.Add($hostLabel)

$script:hostUrlBox = New-Object System.Windows.Forms.TextBox
$script:hostUrlBox.ReadOnly = $true
$script:hostUrlBox.BackColor = [System.Drawing.Color]::FromArgb(8, 12, 18)
$script:hostUrlBox.ForeColor = [System.Drawing.Color]::White
$script:hostUrlBox.BorderStyle = "FixedSingle"
$script:hostUrlBox.Location = New-Object System.Drawing.Point(30, 264)
$script:hostUrlBox.Size = New-Object System.Drawing.Size(720, 30)
$form.Controls.Add($script:hostUrlBox)

$playerLabel = New-Object System.Windows.Forms.Label
$playerLabel.Text = "Player computer"
$playerLabel.ForeColor = [System.Drawing.Color]::FromArgb(132, 224, 218)
$playerLabel.Location = New-Object System.Drawing.Point(30, 312)
$playerLabel.Size = New-Object System.Drawing.Size(180, 24)
$form.Controls.Add($playerLabel)

$script:playerUrlBox = New-Object System.Windows.Forms.TextBox
$script:playerUrlBox.ReadOnly = $true
$script:playerUrlBox.BackColor = [System.Drawing.Color]::FromArgb(8, 12, 18)
$script:playerUrlBox.ForeColor = [System.Drawing.Color]::White
$script:playerUrlBox.BorderStyle = "FixedSingle"
$script:playerUrlBox.Location = New-Object System.Drawing.Point(30, 338)
$script:playerUrlBox.Size = New-Object System.Drawing.Size(720, 30)
$form.Controls.Add($script:playerUrlBox)

$script:logBox = New-Object System.Windows.Forms.TextBox
$script:logBox.Multiline = $true
$script:logBox.ReadOnly = $true
$script:logBox.ScrollBars = "Vertical"
$script:logBox.BackColor = [System.Drawing.Color]::FromArgb(4, 8, 12)
$script:logBox.ForeColor = [System.Drawing.Color]::FromArgb(214, 229, 232)
$script:logBox.BorderStyle = "FixedSingle"
$script:logBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$script:logBox.Location = New-Object System.Drawing.Point(30, 390)
$script:logBox.Size = New-Object System.Drawing.Size(720, 105)
$script:logBox.Anchor = "Left,Right,Top,Bottom"
$form.Controls.Add($script:logBox)

$form.Add_FormClosing({
  param($sender, $eventArgs)
  if ($script:serverProcess -and -not $script:serverProcess.HasExited) {
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
