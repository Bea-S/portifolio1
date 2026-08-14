$file = Join-Path -Path $PSScriptRoot -ChildPath "reports\issue-BUG-001-clipboard.txt"
if (-Not (Test-Path $file)) {
  Write-Error "Arquivo não encontrado: $file"
  exit 1
}
Get-Content -Path $file -Raw | Set-Clipboard
Write-Output "Conteúdo do issue copiado para a área de transferência."