Add-Type -AssemblyName System.Drawing

# Tight-crops logo.png to the bounding box of non-transparent pixels and
# re-renders it at a higher resolution (1024px) so it stays sharp when the
# landing page scales it up. Also updates the PWA icon variants.

$ErrorActionPreference = 'Stop'
$publicDir = Join-Path $PSScriptRoot '..\public'
$source    = Join-Path $publicDir 'logo.png'
$alphaMin  = 15   # ignore near-transparent edge noise
$margin    = 0.02 # 2% safety margin around the cropped art

if (-not (Test-Path $source)) { throw "Source not found: $source" }

function Find-Bounds {
    param([System.Drawing.Bitmap]$Bmp, [int]$AlphaMin)
    $w = $Bmp.Width; $h = $Bmp.Height
    $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $data = $Bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $stride = $data.Stride
    $bytes = $stride * $h
    $buf = New-Object byte[] $bytes
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $bytes)
    $Bmp.UnlockBits($data)

    $minX = $w; $minY = $h; $maxX = -1; $maxY = -1
    for ($y = 0; $y -lt $h; $y++) {
        $row = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $a = $buf[$row + $x * 4 + 3]
            if ($a -ge $AlphaMin) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    if ($maxX -lt 0) { return $null }
    return @{ X = $minX; Y = $minY; W = ($maxX - $minX + 1); H = ($maxY - $minY + 1) }
}

# Load source via memory stream so we can overwrite the same file later.
$bytes = [System.IO.File]::ReadAllBytes($source)
$ms = New-Object System.IO.MemoryStream @(,$bytes)
$src = [System.Drawing.Bitmap]::FromStream($ms)

try {
    $bounds = Find-Bounds -Bmp $src -AlphaMin $alphaMin
    if (-not $bounds) { throw "logo.png has no visible pixels" }

    # Make the crop square around the art so the image is not distorted.
    $side = [Math]::Max($bounds.W, $bounds.H)
    $pad  = [int]($side * $margin)
    $side = $side + $pad * 2
    $cx = $bounds.X + [int]($bounds.W / 2)
    $cy = $bounds.Y + [int]($bounds.H / 2)
    $sx = $cx - [int]($side / 2)
    $sy = $cy - [int]($side / 2)

    # Allow crop rect to extend outside the source — fill outside with transparent.
    $cropped = New-Object System.Drawing.Bitmap $side, $side, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gc = [System.Drawing.Graphics]::FromImage($cropped)
    $gc.Clear([System.Drawing.Color]::Transparent)
    $gc.InterpolationMode   = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gc.SmoothingMode       = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gc.PixelOffsetMode     = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gc.CompositingQuality  = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $srcRect = New-Object System.Drawing.Rectangle $sx, $sy, $side, $side
    $dstRect = New-Object System.Drawing.Rectangle 0, 0, $side, $side
    $gc.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $gc.Dispose()

    # Target 1024 — ample for all in-app usages (sidebar 36px, auth 192px,
    # login-selection 288px, notifications 192px). The landing hero uses the
    # SVG BrandLogo component and does not need the raster logo at all.
    $target = 1024
    $hi = New-Object System.Drawing.Bitmap $target, $target, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gh = [System.Drawing.Graphics]::FromImage($hi)
    $gh.Clear([System.Drawing.Color]::Transparent)
    $gh.InterpolationMode   = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gh.SmoothingMode       = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gh.PixelOffsetMode     = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gh.CompositingQuality  = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $gh.DrawImage($cropped, 0, 0, $target, $target)
    $gh.Dispose()

    $hi.Save($source, [System.Drawing.Imaging.ImageFormat]::Png)
    $hi.Dispose()
    $cropped.Dispose()
    Write-Host "cropped + upscaled: $source (${target}x${target})"
} finally {
    $src.Dispose()
    $ms.Dispose()
}
