@echo off
setlocal enabledelayedexpansion
set FILE=%~dp0reports\issue-BUG-001-clipboard.txt
if not exist "%FILE%" (
  echo Arquivo nao encontrado: %FILE%
  exit /b 1
)
type "%FILE%" | clip
echo Conteudo copiado para a area de transferencia.
endlocal
