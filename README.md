# BAEMIMPORT

Aplicacion full-stack para la gestion de importacion y venta de vehiculos entre Alemania y Espana. Incluye autenticacion por roles, clientes, vehiculos, pedidos, presupuestos, facturas, tareas, mensajeria y documentos.

## Stack

- Frontend: React
- Backend: Node.js + Express
- Base de datos: MongoDB + Mongoose
- Autenticacion: JWT
- Servicios: SMTP, PDF, subida de archivos

## Requisitos

- Node.js 18 o superior
- npm
- MongoDB local o una `MONGO_URI` remota de MongoDB Atlas

Notas practicas:

- la aplicacion se ha probado correctamente con Node.js 18, 20 y 22
- en este entorno, `npm start` dio problemas con Node.js `v24.15.0` en Windows por un error `spawn EINVAL`
- si aparece ese problema, usar el arranque de contingencia descrito mas abajo

## Arranque rapido

Esta es la forma mas sencilla de levantar la aplicacion.

### 1. Clonar e instalar

```bash
git clone https://github.com/dinabenayzahelmitmari-dotcom/BaemImport.git
cd BaemImport
npm run install:all
```

### 2. Crear `backend/.env`

Usa [backend/.env.example](backend/.env.example) como plantilla.

Ejemplo minimo:

```env
MONGO_URI=mongodb://127.0.0.1:27017/baemimport
JWT_SECRET=change_me
PORT=8080
DISABLE_EMAIL=1
```

Si el autor facilita una base remota de MongoDB Atlas, sustituir `MONGO_URI` por esa cadena. Esa es la opcion correcta si se quiere ver la misma base de datos del autor.

Ejemplo Atlas:

```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/baemimport?retryWrites=true&w=majority
JWT_SECRET=change_me
PORT=8080
DISABLE_EMAIL=1
```

### 3. Arrancar la app

```bash
npm start
```

Abrir en el navegador:

- `http://localhost:8080`

`npm start` construye el frontend si hace falta y arranca el backend sirviendo toda la aplicacion desde `:8080`.

## Diferencia entre `npm start` y `npm run dev`

- `npm start`: modo simple para ejecutar la app completa en `http://localhost:8080`
- `npm run dev`: modo desarrollo con frontend y backend por separado

En desarrollo:

- frontend en `http://localhost:3000`
- backend API en `http://localhost:8080`

## Desarrollo local

Para trabajar con frontend y backend a la vez:

```bash
npm run dev
```

Esto deja:

- frontend en `http://localhost:3000`
- backend API en `http://localhost:8080`

## Arranque de contingencia

Si `npm start` falla por compatibilidad de entorno, se puede levantar la aplicacion manualmente.

### 1. Levantar MongoDB manualmente

Si se usa MongoDB local y el servicio no arranca solo, iniciar `mongod` manualmente.

Ejemplo habitual en Windows:

```powershell
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
```

Si `C:\data\db` no existe, crearlo antes.

### 2. Construir el frontend

```bash
cd frontend
npm run build
cd ..
```

### 3. Arrancar el backend directamente

```bash
node backend/server.js
```

### 4. Abrir la app

- `http://localhost:8080`

Esta ruta de contingencia fue valida en esta maquina cuando `npm start` no funciono correctamente con Node.js `v24.15.0` en Windows.

## Base de datos

Hay dos escenarios validos:

### Opcion A. MongoDB local

Usar una URI como:

```env
MONGO_URI=mongodb://127.0.0.1:27017/baemimport
```

En este caso cada maquina trabaja con su propia base local.

### Opcion B. MongoDB Atlas

Usar una URI remota facilitada por el autor:

```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/baemimport?retryWrites=true&w=majority
```

En este caso profesor y alumno ven la misma base de datos.

Importante:

- la `MONGO_URI` no debe subirse a git
- `backend/.env` no se versiona
- git guarda el codigo, no el contenido de MongoDB

## Scripts utiles

- `npm start`: arranque simple para evaluacion
- `npm run dev`: frontend + backend en desarrollo
- `npm run build:frontend`: genera `frontend/build`
- `npm run start:backend`: arranca solo backend
- `npm run install:all`: instala dependencias de raiz, backend y frontend
- `npm run lint`: lint del backend
- `npm run test:backend`: tests de backend
- `npm run test:frontend`: tests de frontend
- `npm run build:exe`: genera ejecutable Windows

## Email y demo

Si no se quiere enviar correo real durante la demo:

```env
DISABLE_EMAIL=1
```

Si se quiere activar SMTP:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo
MAIL_PASS=tu_app_password
```

## Datos demo

Si se necesita poblar una base vacia con datos de prueba:

```bash
node backend/scripts/seed-demo.js
```

Nota: esto crea datos demo. No restaura una base real anterior.

## Roles

- `admin`: acceso global y gestion interna
- `vendedor`: acceso operativo limitado a sus asignaciones
- `cliente`: acceso restringido a su informacion

## Estructura del proyecto

- `frontend/`: interfaz React
- `backend/`: API, modelos, rutas y servicios
- `backend/uploads/`: adjuntos y documentos subidos
- `docs/`: documentacion tecnica y defensa
- `scripts/`: ayudas de arranque y build

## Documentacion adicional

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/ERD.md](docs/ERD.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/DEMO.md](docs/DEMO.md)
- [docs/DEFENSA-TRIBUNAL.md](docs/DEFENSA-TRIBUNAL.md)
- [docs/GUIA-DEFENSA-TFG.md](docs/GUIA-DEFENSA-TFG.md)

## Problemas frecuentes

### `npm run dev` o `npm start` no levantan

- comprobar que Node.js este instalado
- ejecutar `npm run install:all`
- revisar que exista `backend/.env`

### Error de MongoDB

- comprobar que `MONGO_URI` sea valida
- si es local, confirmar que MongoDB este arrancado en `127.0.0.1:27017`
- si es Atlas, confirmar usuario, password y acceso de red
- si el servicio de MongoDB no arranca, probar `mongod.exe` manualmente con `--dbpath`
- si falta la carpeta de datos local, crear `C:\data\db`

### La app abre pero no salen los mismos datos

Eso ocurre cuando se usa una base local distinta. Para ver los mismos datos que el autor, hay que usar la `MONGO_URI` remota que el autor facilite aparte.
