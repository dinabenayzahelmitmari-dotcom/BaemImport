# Guion de Defensa Tecnica (resumen)

## 1) Arquitectura y decisiones

- Frontend SPA en React para operativa diaria y rapidez de iteracion.
- Backend Node/Express con API REST separada para aislar reglas de negocio.
- MongoDB + Mongoose para acelerar desarrollo y mantener validaciones de dominio.
- Servicios desacoplados (`email`, `pdf`, `aiService`) para evitar logica mezclada en rutas.

## 2) Seguridad y manejo de credenciales

- Las credenciales van por variables de entorno (`backend/.env`) y no se versionan.
- Existe plantilla publica segura: `backend/.env.example`.
- Se genero un empaquetado de entrega saneado que excluye secretos y artefactos:
  `scripts/create-deliverable.ps1`.
- JWT para autenticacion y middleware por rol en endpoints protegidos.

## 3) Modelo de datos

- Entidades nucleares: `User`, `Client`, `Vehicle`, `Order`, `Quote`, `Invoice`, `Payment`, `Expense`.
- Relacionamiento documentado en `docs/ERD.md`.
- Indices unicos/sparse donde aplica (`email`, `dni`, `vin`) para integridad.

## 4) IA: enfoque realista y defendible

- `aiService` soporta dos modos:
  - Integracion real por API (si existe `OPENAI_API_KEY`).
  - Fallback local por ranking de intenciones para continuidad operativa.
- El fallback no bloquea la operacion y evita dependencia total de terceros.
- Se puede auditar el comportamiento porque la capa local es deterministicamente trazable.

## 5) Riesgos conocidos y mitigacion

- Dependencia de backend accesible para app movil: mitigado con `REACT_APP_API_BASE_URL`.
- Publicacion Play Store requiere checklist legal y testing cerrado en cuentas nuevas.
- Codificacion de caracteres heredada en algunos textos: no bloqueante, recomendada normalizacion UTF-8 integral en una fase posterior.

## 6) Roadmap inmediato post-presentacion

- Refuerzo de observabilidad (logs estructurados + trazas por request).
- Pruebas E2E de flujos principales (pedido completo, facturacion, email).
- Hardening de politicas CSP y rate limiting en endpoints sensibles.
