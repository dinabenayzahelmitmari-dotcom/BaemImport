@echo off
setlocal

REM Crea una tarea (por usuario) para iniciar BAEMIMPORT al iniciar sesion.
REM Usa el modo silencioso (sin consola).

set "TASK_NAME=BAEMIMPORT (Autoarranque)"
set "APP_DIR=%~dp0"
set "CMD_LINE=\"%APP_DIR%iniciar-produccion-silencioso.bat\""

schtasks /Create /F /SC ONLOGON /TN "%TASK_NAME%" /TR %CMD_LINE% /RL LIMITED >NUL 2>NUL
if errorlevel 1 (
  echo No se pudo crear la tarea. Prueba a ejecutar este .bat como Administrador.
  exit /b 1
)

echo Autoarranque instalado: %TASK_NAME%
echo Para quitarlo: ejecutar desinstalar-autoarranque.bat
pause

