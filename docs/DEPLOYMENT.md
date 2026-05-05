# Despliegue

## Requisitos

- Node.js (recomendado 18+)
- MongoDB local o Atlas
- (Opcional) Gmail con App Password para SMTP

## Variables de entorno

Copia `backend/.env.example` a `backend/.env` y completa los valores.

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

