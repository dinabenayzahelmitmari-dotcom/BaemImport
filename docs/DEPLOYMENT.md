# Despliegue

## Requisitos

- Node.js (recomendado 18+)
- MongoDB local o Atlas
- (Opcional) Gmail con App Password para SMTP

## Variables de entorno

Copia `backend/.env.example` a `backend/.env` y completa los valores.

`backend/.env` no debe versionarse ni incluirse en entregables.

Si quieres que los datos del profesor/tribunal se guarden en la BBDD del autor:

- Usa en `MONGO_URI` una URI remota de MongoDB Atlas.
- No uses `localhost` ni `127.0.0.1`.
- En Atlas, crea usuario de BBDD con permisos `readWrite` sobre `baemimport`.
- En Atlas, abre `Network Access` para la IP del profesor o temporalmente `0.0.0.0/0`.

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

## Android (APK)

- En emulador Android usa `http://10.0.2.2:8080`.
- En movil real usa `http://IP-DE-TU-PC:8080` (misma red Wi-Fi).
- El backend debe estar arrancado con `HOST=0.0.0.0` y `PORT=8080` en `backend/.env`.
- Si no conecta desde movil real, revisa firewall de Windows y permite Node.js en red privada.

## Entregable saneado (sin credenciales)

Para generar un ZIP de entrega que excluya `.env`, keystores y artefactos sensibles:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-deliverable.ps1
```

Salida:

- `C:\Users\<usuario>\Desktop\BAEMIMPORT-ENTREGABLE-SANITIZADO.zip`
