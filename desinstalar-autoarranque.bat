@echo off
setlocal

set "TASK_NAME=BAEMIMPORT (Autoarranque)"

schtasks /Delete /F /TN "%TASK_NAME%" >NUL 2>NUL
if errorlevel 1 (
  echo No se pudo borrar la tarea (quizas no existe).
  pause
  exit /b 1
)

echo Autoarranque eliminado: %TASK_NAME%
pause

