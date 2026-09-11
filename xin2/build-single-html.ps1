$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $projectDir 'index.html'
$outputPath = Join-Path $projectDir 'xdigate-demo-single.html'
$html = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

$html = [System.Text.RegularExpressions.Regex]::Replace(
  $html,
  '<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>',
  {
    param($match)
    $assetPath = Join-Path $projectDir ($match.Groups[1].Value -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    $css = [System.IO.File]::ReadAllText($assetPath, [System.Text.Encoding]::UTF8)
    "<style>`r`n$css`r`n</style>"
  }
)

$html = [System.Text.RegularExpressions.Regex]::Replace(
  $html,
  '<script\s+src="(js/[^"]+)"\s*></script>',
  {
    param($match)
    $assetPath = Join-Path $projectDir ($match.Groups[1].Value -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    $js = [System.IO.File]::ReadAllText($assetPath, [System.Text.Encoding]::UTF8)
    "<script>`r`n$js`r`n</script>"
  }
)

[System.IO.File]::WriteAllText($outputPath, $html, [System.Text.UTF8Encoding]::new($false))
Write-Output $outputPath
