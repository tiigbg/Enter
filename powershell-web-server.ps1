param(
    [int]$Port = 8080
);
$routes = @{
    "/ola" = { return '<html><body>Hello world!</body></html>' }
}

$url = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "Listening at $url..."

function Get-MimeType() {
    param($extension);
    switch($extension) {
        ".doc" {"application/msword"}
        ".dot" {"application/msword"}

        ".docx" {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
        ".dotx" {"application/vnd.openxmlformats-officedocument.wordprocessingml.template"}
        ".docm" {"application/vnd.ms-word.document.macroEnabled.12"}
        ".dotm" {"application/vnd.ms-word.template.macroEnabled.12"}

        ".xls" {"application/vnd.ms-excel"}
        ".xlt" {"application/vnd.ms-excel"}
        ".xla" {"application/vnd.ms-excel"}

        ".xlsx" {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
        ".xltx" {"application/vnd.openxmlformats-officedocument.spreadsheetml.template"}
        ".xlsm" {"application/vnd.ms-excel.sheet.macroEnabled.12"}
        ".xltm" {"application/vnd.ms-excel.template.macroEnabled.12"}
        ".xlam" {"application/vnd.ms-excel.addin.macroEnabled.12"}
        ".xlsb" {"application/vnd.ms-excel.sheet.binary.macroEnabled.12"}

        ".ppt" {"application/vnd.ms-powerpoint"}
        ".pot" {"application/vnd.ms-powerpoint"}
        ".pps" {"application/vnd.ms-powerpoint"}
        ".ppa" {"application/vnd.ms-powerpoint"}

        ".pptx" {"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
        ".potx" {"application/vnd.openxmlformats-officedocument.presentationml.template"}
        ".ppsx" {"application/vnd.openxmlformats-officedocument.presentationml.slideshow"}
        ".ppam" {"application/vnd.ms-powerpoint.addin.macroEnabled.12"}
        ".pptm" {"application/vnd.ms-powerpoint.presentation.macroEnabled.12"}
        ".potm" {"application/vnd.ms-powerpoint.template.macroEnabled.12"}
        ".ppsm" {"application/vnd.ms-powerpoint.slideshow.macroEnabled.12"}

        ".gif" {"image/gif"}
        ".png" {"image/png"}
        {$_ -in ".jpg",".jpeg"} {"image/jpeg"}

        {$_ -in ".htm",".html"} {"text/html"}
        ".js" {"application/x-javascript"}
        ".css" {"text/css"}

        ".mp3" {"audio/mpeg"}
        ".avi" {"video/x-msvideo"}

        ".pdf" {"application/pdf"}
        ".zip" {"application/zip"}
        ".txt" {"text/plain"}
        default {"application/octet-stream"}
    }
}

while ($listener.IsListening)
{
    $context = $listener.GetContext()
    $requestUrl = $context.Request.Url
    $response = $context.Response

    Write-Host ''
    Write-Host "> $requestUrl"

    $localPath = $requestUrl.LocalPath
    if ($localPath -eq "/kill") {
        $response.StatusCode = 200;
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("Server stopped")
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close();
        $listener.Close();
        return
    }
    
    $route = $routes.Get_Item($localPath)

    if ($route -eq $null)
    {
        $path = Join-Path (pwd) $localPath
        Write-Host $path
        if ([System.IO.Directory]::Exists($path)) {
            $path = $path + "index.html"
        }
        if ([System.IO.File]::Exists($path)) {
            $ext = [System.IO.Path]::GetExtension($path)
            Write-Host $ext
            $content = [System.IO.File]::ReadAllBytes($path)
            $response.ContentLength64 = $content.Count
            $response.ContentType = Get-MimeType $ext
            $response.OutputStream.Write($content, 0, $content.Length);
        } else {
            $response.StatusCode = 404
        }
    }
    else
    {
        $content = & $route
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    
    $response.Close()

    $responseStatus = $response.StatusCode
    Write-Host "< $responseStatus"
}