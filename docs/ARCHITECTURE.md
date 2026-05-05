# Arquitectura

BAEMIMPORT es una aplicacion full-stack con:

- Frontend: React (CRA) + Axios
- Backend: Node.js + Express
- BBDD: MongoDB (Mongoose)
- Servicios: Nodemailer (email), PDFKit (PDF)

## Diagrama (alto nivel)

```mermaid
flowchart LR
  U[Usuario (Admin/Vendedor/Cliente)] -->|HTTP| FE[Frontend React]
  FE -->|/api/*| BE[Backend Express]
  BE --> M[(MongoDB)]
  BE --> SMTP[SMTP Gmail]
  BE --> FS[(uploads/)]
```

## Componentes Backend

- `backend/app.js`: construye el `express()` con middleware, rutas y static.
- `backend/server.js`: runtime entrypoint. Carga `.env`, conecta Mongo y hace `listen()`.
- `backend/routes/*`: endpoints REST.
- `backend/models/*`: modelos Mongoose.
- `backend/services/*`: email y PDFs.

## Flujo de autenticacion

1. Login (`/api/auth/login`) devuelve JWT.
2. El frontend guarda el token y lo envia como `Authorization: Bearer <token>`.
3. `authMiddleware` valida el token y adjunta `req.user`.

