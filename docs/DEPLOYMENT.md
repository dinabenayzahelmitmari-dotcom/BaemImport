# Despliegue

## Requisitos

- Node.js (recomendado 18+)
- MongoDB local o Atlas
- (Opcional) Gmail con App Password para SMTP

## Variables de entorno

Copia `backend/.env.example` a `backend/.env` y completa los valores.

`backend/.env` no debe versionarse ni incluirse en entregables.

## Desarrollo local

```bash
npm run install:all
npm start
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8080`

## Produccion local (frontend build servido por backend)

```bash
npm run build:frontend
node backend/server.js
```

Abre `http://localhost:8080`.

## Entregable saneado (sin credenciales)

Para generar un ZIP de entrega que excluya `.env`, keystores y artefactos sensibles:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-deliverable.ps1
```

Salida:

- `C:\Users\<usuario>\Desktop\BAEMIMPORT-ENTREGABLE-SANITIZADO.zip`
