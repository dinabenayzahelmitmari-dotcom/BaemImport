# GUIA COMPLETA DE DEFENSA TFG (DAM) - BAEMIMPORT

## 1. Objetivo de este documento

Este documento concentra todo lo que debo enseñar en la defensa:

- Orden de presentación.
- Guion hablado.
- Demo técnica.
- Pruebas de calidad.
- Seguridad y despliegue.
- Plan de contingencia.

---

## 2. Material que voy a mostrar

1. Repositorio Git:
   `https://github.com/dinabenayzahelmitmari-dotcom/BaemImport`
2. Documentación técnica:
   - `docs/ARCHITECTURE.md`
   - `docs/ERD.md`
   - `docs/DEPLOYMENT.md`
   - `docs/DEFENSA-TRIBUNAL.md`
3. Ejecutable Windows:
   - `C:\Users\catag\Desktop\BAEMIMPORT\BAEMIMPORT.exe`
4. App Android:
   - `C:\Users\catag\Desktop\baemimport.apk`
5. Entregable saneado (sin secretos):
   - `C:\Users\catag\Desktop\BAEMIMPORT-ENTREGABLE-SANITIZADO.zip`

---

## 3. Guion de exposición (7-10 min)

## Minuto 0-1: problema y objetivo

Frase sugerida:
"Este proyecto digitaliza la gestión de importación y venta de vehículos, centralizando clientes, vehículos, pedidos, presupuestos, facturas, tareas y comunicación en una única plataforma."

Qué enseñar:
- Web de presentación (si aplica).
- Objetivos funcionales principales.

## Minuto 1-3: arquitectura técnica

Qué decir:
- Frontend React.
- Backend Node.js + Express.
- Base de datos MongoDB con Mongoose.
- Servicios desacoplados: email, PDF e IA.
- Autenticación JWT con middleware de rol.

Qué enseñar:
- `docs/ARCHITECTURE.md`
- Diagrama de flujo frontend -> backend -> DB.

## Minuto 3-4: modelo de datos

Qué decir:
- Entidades clave: User, Client, Vehicle, Order, Quote, Invoice, Payment, Expense.
- Relación entre ciclo comercial y ciclo documental.

Qué enseñar:
- `docs/ERD.md`

## Minuto 4-7: demo funcional (parte más importante)

Orden recomendado de demo:
1. Login.
2. Crear/editar cliente.
3. Crear/editar vehículo.
4. Crear pedido y avanzar estado/fase.
5. Generar presupuesto/factura PDF.
6. Mostrar notificaciones/tareas.
7. Mostrar asistente IA (consulta real).

Mensaje clave:
"La plataforma cubre flujo completo comercial y operativo, no solo CRUD aislado."

## Minuto 7-8: seguridad y calidad

Qué decir:
- Credenciales fuera del repositorio (`.env` no versionado).
- Entregable saneado sin secretos.
- Lint y tests pasando.
- Control de acceso por JWT/roles.

Qué enseñar:
- `.gitignore`
- `docs/DEPLOYMENT.md`
- Resultado de tests/lint (si tienes captura o terminal preparada).

## Minuto 8-9: despliegue y portabilidad

Qué decir:
- Build web producción.
- Ejecutable Windows funcional.
- APK Android generado.
- AAB release preparado para Play Store.

Qué enseñar:
- Ruta de `.exe`
- Ruta de `.apk`
- Carpeta `BAEMIMPORT-PLAYSTORE` (si la presentas)

## Minuto 9-10: cierre y mejoras

Qué decir:
- Mejoras futuras: observabilidad, E2E, hardening seguridad.
- Escalabilidad y mantenimiento por separación de capas.

---

## 4. Checklist previo (30 min antes)

1. Verificar que MongoDB está arrancado.
2. Ejecutar `.exe` y validar acceso web.
3. Verificar que el login funciona.
4. Tener abierto el repo y documentos en pestañas.
5. Tener plan B:
   - Capturas de demo.
   - Datos de prueba listos.
6. Desactivar notificaciones del PC.
7. Tener cargador y conexión estable.

---

## 5. Plan B (si algo falla en directo)

## Si falla internet

- Continuar demo local con `.exe`.
- Mostrar docs y arquitectura offline.

## Si falla backend

- Explicar incidencia.
- Mostrar pruebas previas superadas.
- Mostrar estructura y endpoints en código.

## Si falla una funcionalidad concreta

- Mostrar otra parte del flujo.
- Explicar causa técnica y solución prevista.

Regla:
No bloquearse en un error puntual; reconducir a valor del sistema.

---

## 6. Preguntas típicas del tribunal (y respuesta corta)

## "¿Dónde está la seguridad?"

Respuesta:
"En autenticación JWT, middleware por rol, separación de servicios y exclusión estricta de credenciales en repositorio/entregables."

## "¿La parte IA es real o simulada?"

Respuesta:
"Tiene integración real por API cuando hay clave configurada, y fallback local por ranking de intenciones para continuidad de servicio."

## "¿Por qué MongoDB?"

Respuesta:
"Por velocidad de desarrollo, flexibilidad del modelo documental y validación centralizada con Mongoose en este contexto de negocio."

## "¿Cómo despliegas?"

Respuesta:
"Frontend build + backend Express, ejecutable Windows para uso local y pipeline Android (APK/AAB) para distribución móvil."

---

## 7. Texto de apertura (30-40 segundos)

"Buenas, soy [TU NOMBRE] y voy a presentar BAEMIMPORT. Es una solución full-stack para gestionar de forma integral la importación y venta de vehículos: desde cliente y vehículo, hasta pedido, facturación, tareas y comunicación. A nivel técnico he trabajado con React, Node/Express y MongoDB, con autenticación JWT, generación de PDF y capa de asistencia IA. Voy a enseñar arquitectura, modelo de datos y una demo completa del flujo principal."

---

## 8. Texto de cierre (20-30 segundos)

"Como conclusión, el proyecto está funcional de extremo a extremo, documentado y preparado para despliegue en escritorio y móvil. Además, quedan identificadas mejoras futuras en observabilidad y pruebas E2E. Gracias, quedo disponible para preguntas técnicas."

