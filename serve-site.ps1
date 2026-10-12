$ErrorActionPreference = "Stop"
$root = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') + '\'
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:8090/")

try {
  $listener.Start()
  Write-Host "Rovex sayti işləyir: http://127.0.0.1:8090/app.htm"
  Write-Host "Dayandırmaq üçün bu pəncərədə Ctrl+C basın."
  Start-Process "http://127.0.0.1:8090/app.htm"

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    try {
      if ($context.Request.HttpMethod -notin @("GET", "HEAD")) {
        $response.StatusCode = 405
        $response.Headers.Add("Allow", "GET, HEAD")
        continue
      }

      $relativePath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "app.htm"
      }
      $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
      if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
        $response.StatusCode = 404
        continue
      }

      $contentTypes = @{
        ".htm" = "text/html; charset=utf-8"
        ".html" = "text/html; charset=utf-8"
        ".css" = "text/css; charset=utf-8"
        ".js" = "text/javascript; charset=utf-8"
        ".svg" = "image/svg+xml"
        ".png" = "image/png"
        ".jpg" = "image/jpeg"
        ".jpeg" = "image/jpeg"
        ".jpe" = "image/jpeg"
      }
      $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      if ($contentTypes.ContainsKey($extension)) {
        $response.ContentType = $contentTypes[$extension]
      } else {
        $response.ContentType = "application/octet-stream"
      }

      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentLength64 = $bytes.Length
      if ($context.Request.HttpMethod -eq "GET") {
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } catch {
      Write-Host "Sorğu emal olunmadı: $($_.Exception.Message)"
      $response.StatusCode = 500
      $errorBytes = [System.Text.Encoding]::UTF8.GetBytes("Sorğu emal olunmadı.")
      $response.ContentType = "text/plain; charset=utf-8"
      $response.ContentLength64 = $errorBytes.Length
      $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
    } finally {
      $response.Close()
    }
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
