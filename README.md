# BAEMIMPORT

Plataforma full-stack para gestion de importacion y venta de vehiculos.
Incluye clientes, vehiculos, pedidos, presupuestos, facturas, tareas, mensajeria y panel por rol.

## Stack

- Frontend: React
- Backend: Node.js + Express
- Base de datos: MongoDB (Mongoose)
- Auth: JWT
- Servicios: email (Nodemailer), PDF, subida de archivos

## Arranque rapido (profesor/tribunal)

### Requisitos

- Node.js 18 o superior
- MongoDB local o Atlas

### 1) Clonar e instalar dependencias

```bash
git clone https://github.com/dinabenayzahelmitmari-dotcom/BaemImport.git
cd BaemImport
npm run install:all
```

### 2) Configurar entorno

Crear `backend/.env` a partir de `backend/.env.example`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/baemimport
JWT_SECRET=change_me
PORT=8080

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=baemimport@gmail.com
MAIL_PASS=app_password_here

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Notas:
- Si no usas email/IA en la demo, puedes dejar esas claves sin valor.
- Para uso en movil dentro de la misma red, el backend debe aceptar conexiones LAN.

### 3) Ejecutar app

```bash
npm start
```

Abrir:
- App: `http://localhost:8080`

## Scripts utiles

- `npm start`: arranca backend (sirve frontend build en `:8080`)
- `npm run build:frontend`: genera build de frontend
- `npm run lint`: lint backend
- `npm run test:backend`: tests backend
- `npm run test:frontend`: tests frontend
- `npm run build:exe`: genera ejecutable Windows

## Roles y permisos

- `admin`:
  - ve todo
  - crea usuarios internos
  - asigna clientes a vendedores
- `vendedor` (empleado):
  - misma interfaz operativa
  - solo ve clientes/importaciones asignadas
- `cliente`:
  - acceso limitado a su informacion

En registro publico se puede elegir `cliente` o `vendedor` (nunca `admin`).

## Datos demo (opcional)

```bash
node backend/scripts/seed-demo.js
```

## Documentacion adicional

- `docs/ARCHITECTURE.md`
- `docs/ERD.md`
- `docs/DEPLOYMENT.md`
- `docs/DEFENSA-TRIBUNAL.md`

## Observacion operativa

MongoDB necesita espacio libre en disco para arrancar correctamente.
Si hay errores tipo `No space left on device` o `ECONNREFUSED 127.0.0.1:27017`, liberar espacio y reiniciar MongoDB.
