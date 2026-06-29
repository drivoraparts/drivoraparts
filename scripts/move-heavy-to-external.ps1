# Move heavy folders to an external drive and replace them with directory junctions
# so apps still use the original paths when the drive is connected.
#
# Default (safe): Downloads, npm cache, spare pics, .next build cache only.
# VST / Program Files paths are SKIPPED by default — they often lock and break DAWs.
#
# Usage:
#   .\scripts\move-heavy-to-external.ps1 -DriveLetter E
#   .\scripts\move-heavy-to-external.ps1 -DriveLetter E -WhatIf
#   .\scripts\move-heavy-to-external.ps1 -DriveLetter E -IncludeImageLine   # optional
#   .\scripts\move-heavy-to-external.ps1 -DriveLetter E -IncludeVst         # admin, risky
#
param(
    [Parameter(Mandatory = $true)]
    [string]$DriveLetter,

    [switch]$WhatIf,
    [switch]$IncludeImageLine,
    [switch]$IncludeVst
)

$ErrorActionPreference = "Stop"
$DriveRoot = "$($DriveLetter.TrimEnd(':')):\"
if (-not (Test-Path -LiteralPath $DriveRoot)) {
    throw "Drive $DriveRoot not found. Connect/format the external drive and assign a letter first."
}

$ArchiveRoot = Join-Path $DriveRoot "LaptopArchive"
$log = @()

function Write-Log($msg) {
    Write-Host $msg
    $script:log += $msg
}

function Test-IsJunction {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $false }
    $item = Get-Item -LiteralPath $Path -Force
    return [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
}

function Get-ChildCount {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return 0 }
    return (Get-ChildItem -LiteralPath $Path -Force -ErrorAction SilentlyContinue | Measure-Object).Count
}

function Invoke-FolderMove {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Dest
    )

    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
    & robocopy $Source $Dest /E /MOVE /R:2 /W:2 /NFL /NDL /NJH /NJS | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "Robocopy failed moving $Source -> $Dest (exit $LASTEXITCODE)"
    }

    if (Test-Path -LiteralPath $Source) {
        $remaining = Get-ChildCount -Path $Source
        if ($remaining -gt 0) {
            throw "Move incomplete for $Source ($remaining items left). Close FL Studio / DAWs and retry as Administrator."
        }
        Remove-Item -LiteralPath $Source -Force -ErrorAction Stop
    }
}

function New-SourceJunction {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Dest
    )

    $sourceParent = Split-Path $Source -Parent
    if (-not (Test-Path -LiteralPath $sourceParent)) {
        New-Item -ItemType Directory -Path $sourceParent -Force | Out-Null
    }

    cmd /c mklink /J "$Source" "$Dest" | Out-Null
    Write-Log "Linked: $Source -> $Dest"
}

function Move-WithJunction {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$DestRelative
    )

    if (-not (Test-Path -LiteralPath $Source)) {
        Write-Log "SKIP (missing): $Source"
        return
    }

    if (Test-IsJunction -Path $Source) {
        Write-Log "SKIP (already junction): $Source"
        return
    }

    $dest = Join-Path $ArchiveRoot $DestRelative
    $destParent = Split-Path $dest -Parent
    if (-not $WhatIf) { New-Item -ItemType Directory -Path $destParent -Force | Out-Null }

    if ($WhatIf) {
        Write-Log "WHATIF move: $Source -> $dest ; junction back to $Source"
        return
    }

    if (Test-Path -LiteralPath $dest) {
        if (Test-IsJunction -Path $dest) {
            throw "Destination is already a junction: $dest"
        }

        $destCount = Get-ChildCount -Path $dest
        if ($destCount -eq 0) {
            Write-Log "Removing empty partial destination: $dest"
            Remove-Item -LiteralPath $dest -Force
        }
    }

    Write-Log "Moving: $Source -> $dest"
    Invoke-FolderMove -Source $Source -Dest $dest
    New-SourceJunction -Source $Source -Dest $dest
}

Write-Log "Archive root: $ArchiveRoot"
if (-not $WhatIf) { New-Item -ItemType Directory -Path $ArchiveRoot -Force | Out-Null }

# --- Safe / high-impact user folders (no admin) ---
Move-WithJunction -Source "$env:USERPROFILE\Downloads" -DestRelative "Downloads"
Move-WithJunction -Source "$env:USERPROFILE\Desktop\drivoraparts\spare pic" -DestRelative "drivoraparts\spare-pic"
Move-WithJunction -Source "$env:LOCALAPPDATA\npm-cache" -DestRelative "npm-cache"

# Next.js build output (regenerates with npm run dev / build)
Move-WithJunction -Source "$env:USERPROFILE\Desktop\drivoraparts\.next" -DestRelative "drivoraparts\.next"

if ($IncludeImageLine) {
    Move-WithJunction -Source "$env:USERPROFILE\Documents\Image-Line" -DestRelative "Image-Line"
} else {
    if (Test-IsJunction -Path "$env:USERPROFILE\Documents\Image-Line") {
        Write-Log "SKIP (Image-Line already on external drive; use -IncludeImageLine to re-run)"
    } else {
        Write-Log "SKIP (Image-Line left on C: — pass -IncludeImageLine only if you want it on E:)"
    }
}

if ($IncludeVst) {
    Write-Log "VST move requested — close FL Studio / all DAWs first."
    Move-WithJunction -Source "C:\Program Files\Common Files\VST3" -DestRelative "VST3"
    Move-WithJunction -Source "C:\Program Files\VstPlugins" -DestRelative "VstPlugins"
    Move-WithJunction -Source "C:\Program Files (x86)\VstPlugins" -DestRelative "VstPlugins-x86"
} else {
    Write-Log "SKIP (VST plugins stay on C: — pass -IncludeVst only if you explicitly want them on E:)"
}

Write-Log ""
Write-Log "Done. Linked folders need drive $DriveRoot connected to work."
if (-not $IncludeVst) {
    Write-Log "FL Studio VST plugins were not moved; they remain on your internal drive."
}

$logPath = Join-Path $ArchiveRoot "move-log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
if (-not $WhatIf) {
    $log | Set-Content -Path $logPath -Encoding UTF8
    Write-Log "Log: $logPath"
}
