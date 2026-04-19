Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$publicDir  = Join-Path $PSScriptRoot '..\public'
$sourcesDir = Join-Path $PSScriptRoot 'sources'
# Source lives in scripts/sources/ (outside public/ so it is not shipped with
# the build). Falls back to a few older filenames for backwards compatibility.
$sourceCandidates = @(
    (Join-Path $sourcesDir 'logo-source.png'),
    (Join-Path $sourcesDir 'logo-source.jpg'),
    (Join-Path $sourcesDir 'logo-source.jpeg'),
    (Join-Path $sourcesDir 'logo-source.webp'),
    (Join-Path $publicDir  'Gemini_Generated_Image_39my5f39my5f39my.png'),
    (Join-Path $publicDir  'logo-source.png'),
    (Join-Path $publicDir  'logo app.png')
)
$source = $sourceCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $source) { throw "No source logo found. Looked in: $($sourceCandidates -join '; ')" }
Write-Host "Using source: $source"

function Save-Png {
    param(
        [string]$Source,
        [string]$Dest,
        [int]$Size,
        [double]$Padding = 0.0,
        [System.Drawing.Color]$Background = [System.Drawing.Color]::Transparent
    )

    $img = [System.Drawing.Image]::FromFile($Source)
    try {
        $bmp = New-Object System.Drawing.Bitmap $Size, $Size
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $g.Clear($Background)

        $inner = [int]($Size * (1.0 - $Padding * 2))
        $offset = [int](($Size - $inner) / 2)

        # Fit source into inner square preserving aspect ratio
        $srcW = $img.Width; $srcH = $img.Height
        $ratio = [Math]::Min($inner / $srcW, $inner / $srcH)
        $drawW = [int]($srcW * $ratio)
        $drawH = [int]($srcH * $ratio)
        $dx = [int]($offset + ($inner - $drawW) / 2)
        $dy = [int]($offset + ($inner - $drawH) / 2)

        $g.DrawImage($img, $dx, $dy, $drawW, $drawH)
        $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)

        $g.Dispose(); $bmp.Dispose()
        Write-Host "Wrote $Dest ($Size x $Size)"
    } finally { $img.Dispose() }
}

# Transparent PWA icons
Save-Png -Source $source -Dest (Join-Path $publicDir 'pwa-192x192.png') -Size 192
Save-Png -Source $source -Dest (Join-Path $publicDir 'pwa-512x512.png') -Size 512

# Maskable icon: add ~12% safe-zone padding on white background so the icon
# is not cropped by Android adaptive-icon masks.
$white = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
Save-Png -Source $source -Dest (Join-Path $publicDir 'pwa-maskable-512x512.png') -Size 512 -Padding 0.12 -Background $white

# iOS home-screen icon (no alpha recommended)
Save-Png -Source $source -Dest (Join-Path $publicDir 'apple-touch-icon.png') -Size 180 -Background $white

# In-app logo: keep at 1024 so the landing page stays sharp on retina (up to ~1040 physical px).
Save-Png -Source $source -Dest (Join-Path $publicDir 'logo.png') -Size 1024

# Build favicon.ico (PNG-in-ICO, 48x48) — supported by all modern browsers
$iconPngPath = Join-Path $env:TEMP 'drhyper-favicon-48.png'
Save-Png -Source $source -Dest $iconPngPath -Size 48

$pngBytes = [System.IO.File]::ReadAllBytes($iconPngPath)
$pngLen = $pngBytes.Length

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms
# ICONDIR
$bw.Write([UInt16]0)      # reserved
$bw.Write([UInt16]1)      # type = icon
$bw.Write([UInt16]1)      # image count
# ICONDIRENTRY
$bw.Write([Byte]48)       # width
$bw.Write([Byte]48)       # height
$bw.Write([Byte]0)        # color palette (0 = none)
$bw.Write([Byte]0)        # reserved
$bw.Write([UInt16]1)      # color planes
$bw.Write([UInt16]32)     # bits per pixel
$bw.Write([UInt32]$pngLen) # size of image data
$bw.Write([UInt32]22)     # offset to image data
# PNG blob
$bw.Write($pngBytes)
$bw.Flush()

$icoPath = Join-Path $publicDir 'favicon.ico'
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Dispose(); $ms.Dispose()
Remove-Item $iconPngPath -ErrorAction SilentlyContinue
Write-Host "Wrote $icoPath (PNG-in-ICO 48x48)"

Write-Host "Done."
