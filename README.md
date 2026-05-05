# BAEMIMPORT - Plataforma de Gestion de Importacion Automotriz

BAEMIMPORT es una solucion integral diseñada para optimizar y automatizar el flujo operativo de empresas de importacion de vehiculos (principalmente entre Alemania y España). La plataforma cubre todo el ciclo de vida, desde la captacion del lead hasta la entrega a domicilio.

## Caracteristicas Principales

### 1. Automatizacion de Ventas (Lead-to-Order)
*   **Buzon Inteligente (Inbox)**: Gestion centralizada de solicitudes de vehiculos.
*   **Conversion con 1-Clic**: Transforma una solicitud de cliente en un pedido activo y un vehiculo en inventario automaticamente.
*   **Creacion de Tareas Automatica**: Al iniciar un pedido, el sistema genera un checklist operativo (Documentacion, Transporte, Pagos).

### 2. Gestion Operativa por Fases
*   **Seguimiento Dual (Alemania/España)**: Control detallado de hitos en origen y destino.
*   **Transiciones Automaticas**: El sistema cambia de fase proactivamente al detectar hitos logisticos (ejemplo: transporte internacional).
*   **Gestion Documental Real**: Subida y descarga de archivos (COC, Fichas Tecnicas, Facturas) con almacenamiento seguro.

### 3. Comunicacion y Notificaciones
*   **Chat en Tiempo Real**: Mensajeria directa entre vendedor y cliente.
*   **Notificaciones Push/Email**: Avisos automaticos al cliente sobre cambios de estado o hitos alcanzados.
*   **Envio de Correo Manual**: Herramienta para enviar correos personalizados desde la cuenta oficial de la empresa (baemimport@gmail.com).

### 4. Gestion Financiera y Facturacion
*   **Registro de Pagos**: Historial detallado de transferencias, efectivo y financiacion.
*   **Calculo Automatico de Saldos**: Control en tiempo real del importe pagado y el resto pendiente.
*   **Generador de PDF Premium**: Creacion instantanea de facturas y presupuestos con branding corporativo y tablas detalladas.

### 5. Inteligencia de Mercado
*   **Calculadora de ROI**: Herramienta de analisis de viabilidad para cada importacion.
*   **Informes Descargables**: Generacion de informes de viabilidad en PDF para clientes o analisis interno.

---

## Stack Tecnologico

*   **Frontend**: React.js, Vanilla CSS (Premium Design System), Axios, jsPDF, jspdf-autotable.
*   **Backend**: Node.js, Express, MongoDB (Mongoose).
*   **Servicios**: Multer (Archivos), Nodemailer (Emails), JWT (Seguridad).

---

## Instalacion y Configuracion

### Requisitos Previos
*   Node.js v16+
*   MongoDB Atlas (o local)
*   Cuenta de Gmail (con Contraseña de Aplicacion para SMTP)

### Pasos
1. **Clonar el repositorio**:
   ```bash
   git clone [url-repo]
   ```
2. **Configurar Backend**:
   - Acceder a la carpeta backend
   - Crear archivo `.env` (puedes partir de `backend/.env.example`) con las siguientes variables:
     ```env
     PORT=5000
     MONGO_URI=tu_mongo_uri
     JWT_SECRET=tu_secreto_super_seguro
     MAIL_USER=baemimport@gmail.com
     MAIL_PASS=tu_app_password_de_google
     ```
   - Instalar dependencias y ejecutar:
     ```bash
     npm install
     npm start
     ```
3. **Configurar Frontend**:
   - Acceder a la carpeta frontend
   - Instalar dependencias y ejecutar:
     ```bash
     npm install
     npm start
     ```

## Datos de demostracion (seed)

Para cargar datos demo (vehiculos, pedido, tareas, mensajes, notificaciones) y crear un vendedor/cliente:

```bash
node backend/scripts/seed-demo.js
```

## Calidad (lint + tests)

Lint backend:

```bash
npm run lint
```

Tests backend (usa MongoDB local `baemimport_test`):

```bash
npm run test:backend
```

---

## Roles de Usuario

*   **Administrador/Vendedor**: Control total de inventario, pedidos, chat global, gestion financiera y documentacion.
*   **Cliente**: Acceso a su panel personal para ver el progreso de su coche, descargar documentos y comunicarse con el vendedor.

---

## Seguridad
*   Autenticacion mediante JWT.
*   Middleware de proteccion de rutas para prevenir accesos no autorizados.
*   Validacion de datos en el servidor.

---

BAEMIMPORT - Elevando el estandar de la importacion de vehiculos.
