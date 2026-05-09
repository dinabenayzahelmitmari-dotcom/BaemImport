@echo off
setlocal

REM Arranca BAEMIMPORT en segundo plano (sin ventana) usando Node.
REM La app quedara accesible en:
REM - http://localhost:8080
REM - http://<tu-ip-lan>:8080  (ej: http://192.168.0.21:8080)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process -FilePath node -ArgumentList @('backend\\server.js') -WorkingDirectory '%~dp0' -WindowStyle Hidden"

