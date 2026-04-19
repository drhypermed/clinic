Add-Type -AssemblyName System.Drawing

# Makes near-white pixels transparent. Uses luminance threshold + soft falloff
# near the threshold so the edge doesn't look jagged. Touches logo variants
# that are supposed to be transparent; leaves apple-touch-icon (iOS prefers
# opaque) and the maskable icon (needs solid background) untouched.

$ErrorActionPreference = 'Stop'
$publicDir = Join-Path $PSScriptRoot '..\public'

# Pixels whose min(R,G,B) >= $hardWhite => fully transparent.
# Pixels whose min(R,G,B) between $softWhite and $hardWhite => gradient alpha.
# Pixels below $softWhite => untouched (full opacity).
$hardWhite = 248
$softWhite = 225

function Strip-White {
    param([string]$Path)
    if (-not (Test-Path $Path)) { Write-Warning "skip: $Path (not found)"; return }

    # Read bytes and load via MemoryStream so the file handle is not held
    # during Save (GDI+ refuses to overwrite a file it's still reading).
    $fileBytes = [System.IO.File]::ReadAllBytes($Path)
    $ms = New-Object System.IO.MemoryStream @(,$fileBytes)
    $src = [System.Drawing.Bitmap]::FromStream($ms)
    try {
        $w = $src.Width; $h = $src.Height
        $dst = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

        $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
        $srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $dstData = $dst.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

        $stride = $srcData.Stride
        $bytes  = $stride * $h
        $buf = New-Object byte[] $bytes
        [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $buf, 0, $bytes)

        $range = [double]($hardWhite - $softWhite)

        for ($y = 0; $y -lt $h; $y++) {
            $row = $y * $stride
            for ($x = 0; $x -lt $w; $x++) {
                $i = $row + $x * 4
                $b = $buf[$i]
                $g = $buf[$i + 1]
                $r = $buf[$i + 2]
                $a = $buf[$i + 3]

                $minChan = [Math]::Min([Math]::Min($r, $g), $b)

                if ($minChan -ge $hardWhite) {
                    $buf[$i + 3] = 0
                }
                elseif ($minChan -ge $softWhite) {
                    $t = ($minChan - $softWhite) / $range
                    $newA = [int]($a * (1.0 - $t))
                    if ($newA -lt 0) { $newA = 0 }
                    $buf[$i + 3] = [byte]$newA
                }
            }
        }

        [System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $dstData.Scan0, $bytes)
        $src.UnlockBits($srcData)
        $dst.UnlockBits($dstData)

        $dst.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
        $dst.Dispose()
        Write-Host "stripped white: $Path"
    } finally {
        $src.Dispose()
        $ms.Dispose()
    }
}

Strip-White -Path (Join-Path $publicDir 'logo.png')
Strip-White -Path (Join-Path $publicDir 'pwa-192x192.png')
Strip-White -Path (Join-Path $publicDir 'pwa-512x512.png')

Write-Host "Done."
