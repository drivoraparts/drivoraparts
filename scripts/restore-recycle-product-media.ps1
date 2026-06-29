# Restore drivoraparts product-media files from Recycle Bin into slug folders.
$ErrorActionPreference = "Stop"
$mediaBase = "C:\Users\solution info\Desktop\drivoraparts\public\product-media"

$rules = @(
    @{ Pattern = "Fortune Auto 500 Coilovers"; Dest = "suspension\fortune-auto-500-coilovers" },
    @{ Pattern = "Transmission Cooler Kit"; Dest = "transmission\transmission-cooler-kit" },
    @{ Pattern = "Nissan CD009 6-Speed"; Dest = "transmission\nissan-cd009-6-speed" },
    @{ Pattern = "LED Side Marker Lights"; Dest = "lights\led-side-marker-lights" },
    @{ Pattern = "Haltech Elite ECU"; Dest = "electronics\haltech-elite-ecu" },
    @{ Pattern = "Digital Dash Display"; Dest = "electronics\digital-dash-display" },
    @{ Pattern = "AutoMeter Triple Gauge Pod"; Dest = "interior\subaru-wrx-sti" }
)

function Get-NextIndex {
    param([string]$Dir)
    if (-not (Test-Path -LiteralPath $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
    $nums = Get-ChildItem -LiteralPath $Dir -File -ErrorAction SilentlyContinue |
        Where-Object { $_.BaseName -match '^\d+$' } |
        ForEach-Object { [int]$_.BaseName }
    if ($nums) { return (($nums | Measure-Object -Maximum).Maximum + 1) }
    return 1
}

$shell = New-Object -ComObject Shell.Application
$bin = $shell.NameSpace(0x0a)
$restored = @()

foreach ($item in @($bin.Items())) {
    $orig = $bin.GetDetailsOf($item, 1)
    if ($orig -notmatch "drivoraparts" -or $orig -notmatch "product-media") { continue }

    $name = $item.Name
    if ($name -eq "New folder") { continue }

    $matched = $null
    foreach ($rule in $rules) {
        if ($orig -match [regex]::Escape($rule.Pattern)) {
            $matched = $rule
            break
        }
    }
    if (-not $matched) { continue }

    $src = $item.Path
    if (-not $src -or -not (Test-Path -LiteralPath $src)) { continue }

    $destDir = Join-Path $mediaBase $matched.Dest
    $idx = Get-NextIndex -Dir $destDir
    $ext = [System.IO.Path]::GetExtension($name)
    if (-not $ext) { $ext = ".jpg" }
    $destFile = Join-Path $destDir ("{0}{1}" -f $idx, $ext.ToLower())

    Copy-Item -LiteralPath $src -Destination $destFile -Force
    $restored += [PSCustomObject]@{
        Name = $name
        From = $orig
        To = $destFile.Replace("C:\Users\solution info\Desktop\drivoraparts", "")
    }

    try { $item.InvokeVerb("delete") } catch { }
}

$restored | Format-Table -AutoSize -Wrap
Write-Output "Restored $($restored.Count) file(s)."
