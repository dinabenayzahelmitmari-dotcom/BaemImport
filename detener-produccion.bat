@echo off
setlocal

echo Deteniendo BAEMIMPORT (puerto 8080)...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
  echo Matando PID %%a
  taskkill /PID %%a /F >NUL 2>NUL
)

echo Listo.
pause

