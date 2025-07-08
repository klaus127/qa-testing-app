**Especificación Funcional y Técnica de la Aplicación Web para Gestión de Planes de Prueba QA**

---

## 1. Propósito del Sistema
Desarrollar una aplicación web empresarial para la gestión integral de planes de prueba en proyectos de tecnología de la información, permitiendo una ejecución controlada de pruebas, captura de evidencias, trazabilidad completa y generación de reportes ejecutivos. El sistema está diseñado para funcionar completamente desde el navegador, sin requerir instalación de software local, y aprovechará la API de captura de pantalla integrada del navegador para generar evidencias visuales de manera automática y autorizada por el usuario.

---

## 2. Arquitectura General

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Estilos**: Tailwind CSS + Shadcn/ui
- **Formularios**: React Hook Form
- **Dashboards**: Recharts para visualización interactiva

### Backend
- **Servidor**: Node.js + Express + TypeScript
- **ORM**: Prisma ORM
- **Base de Datos**: PostgreSQL
- **Tiempo Real**: Socket.io (para actualizaciones en vivo, chat QA, cambios de estado)
- **Manejo de Archivos**: Multer (procesamiento de archivos antes de ser derivados a Drive/OneDrive)

### Servicios y DevOps
- **Autenticación + Storage + Base de Datos**: Supabase (incluye validación de roles y sesiones)
- **Emailing**: Resend (envío de notificaciones, confirmaciones, alertas)
- **Deployment**: Vercel (para frontend y funciones serverless)

### Adicionales Sugeridos
- **Zod** para validación de esquemas
- **Day.js o Date-fns** para manejo avanzado de fechas
- **i18n** (internacionalización)
- **Sentry** para monitoreo de errores en frontend/backend
- **Clerk o Auth.js (si se desea reemplazar Supabase Auth en el futuro)**

---

## 3. Roles y Permisos
- **Líder QA**: Acceso total (crear planes, asignar casos, configurar sistema, dashboard completo).
- **Tester QA**: Acceso a casos asignados, ejecución de pruebas, carga de evidencias.
- **Consultor Técnico**: Re-ejecutar casos fallidos, resolver incidentes.
- **Ejecutivo**: Acceso solo lectura a dashboards y reportes.

---

## 4. Autenticación y Autorización
- Integración OAuth2 con Google Workspace y Microsoft 365 (SSO).
- Redirección por rol tras login.
- Lógica de roles gestionada mediante RBAC + ACL por proyecto.
- Supabase Auth como proveedor base de autenticación + OAuth externo + JWT + persistencia segura.

---

## 5. Modelo de Datos (simplificado)
- **Proyecto**: id, nombre, cliente, responsable, activo
- **Version**: id, proyecto_id, nombre, fecha_inicio, fecha_fin
- **Plan**: id, version_id, nombre, criticidad, descripcion, responsable
- **CasoPrueba**: id, plan_id, titulo, pasos, resultado_esperado, prioridad, estimado, asignado_a
- **Ejecucion**: id, caso_id, usuario_id, fecha, estado, tiempo_real, observaciones
- **Incidente**: id, ejecucion_id, titulo, severidad, reproducir, esperado, actual, asignado_a, estado
- **Evidencia**: id, ejecucion_id, url, descripcion
- **Bitacora**: id, usuario_id, entidad, accion, fecha, ip, detalle

---

## 6. Flujos Funcionales

### 6.1 Creación y Gestión de Planes
**Actor**: Líder QA o Tester
1. Selecciona proyecto y versión
2. Crea nuevo plan con metadatos
3. Agrega casos de prueba manualmente o importa desde Excel
4. Asigna casos a testers

### 6.2 Ejecución de Casos de Prueba
**Actor**: Tester QA o Consultor Técnico
1. Inicia prueba asignada
2. Visualiza pasos a ejecutar
3. Marca paso como éxito/fallo/info
4. Adjunta capturas (directas o por URL Drive/OneDrive)
5. Finaliza ejecución con estado global, tiempo real y observaciones
6. Si fallo: crea incidente asociado

### 6.3 Gestión de Incidentes
**Actor**: Consultor Técnico
1. Visualiza incidentes asignados
2. Accede a detalle: captura, pasos, comentarios
3. Cambia estado (En progreso, Resuelto)
4. Re-ejecuta prueba asociada
5. Genera nueva evidencia
6. Sistema compara estado anterior y actual

### 6.4 Visualización Ejecutiva
**Actor**: Ejecutivo
1. Accede a dashboard de calidad
2. Filtros por proyecto, fecha, responsable
3. Gráficos de cobertura, éxito, criticidad, incidentes
4. Exportación a PDF/Excel

---

## 7. Casuísticas y Reglas de Negocio
- Un caso puede ejecutarse múltiples veces. Cada ejecución se registra.
- Si una ejecución falla, se debe registrar un incidente obligatorio.
- Una ejecución nueva no reemplaza la anterior, pero puede marcarse como “última válida”.
- Las evidencias siempre deben estar enlazadas (no embebidas).
- El sistema debe validar que los usuarios sólo vean proyectos donde tienen acceso.

---

## 8. Integraciones con Nubes (Drive / OneDrive)
- Configurable por proyecto.
- Cada empresa puede vincular su cuenta de Google Drive o OneDrive.
- Se solicita token vía OAuth para subir archivos.
- El sistema crea carpetas automáticamente con nombre del proyecto + versión.
- Los archivos se suben y se guarda sólo la URL pública o privada de visualización.

---

## 9. Exportaciones y Reportes
- Filtros por proyecto, usuario, fecha, estado, criticidad.
- Reportes: Ejecuciones, Cobertura, Incidentes, Evidencias.
- Formatos: Excel (editable), PDF (formato tabla), CSV/JSON (técnico).
- Opcional: Programación semanal de reportes automáticos por correo.

---

## 10. Seguridad y Auditoría
- Logs de actividad por usuario (bitácora).
- Validaciones de permisos a nivel de API y frontend.
- Control de acceso a carpetas y archivos por token OAuth.
- Hashing de sesiones y tokens JWT.
- Backups automáticos configurables.
- Monitoreo de errores con Sentry.

---

## 11. Estado de Casos
- Pendiente
- En Ejecución
- Pasó
- Falló
- Bloqueado
- No Aplica
- Incidente Creado
- Re-testeado
- Cerrado

---

## 12. Futuras Integraciones (Diseño Ready)
- Integración con JIRA / DevOps via Webhook
- Ingesta de resultados automáticos (Selenium, Cypress)
- IA para sugerir causas comunes de fallo
- API externa para exportar reportes a Power BI

---

## 13. Requerimientos Técnicos Generales
- Compatible con navegadores modernos (Chrome, Edge, Firefox)
- Frontend responsivo y accesible (WCAG AA)
- Autenticación federada (OAuth2)
- Backend con API REST modular
- Soporte multilenguaje (ES, EN)
- Sin necesidad de instalaciones locales. Toda la funcionalidad (incluida la captura de evidencias) se ejecuta directamente en el navegador con autorización del usuario.
- Stack recomendado:
  - Frontend: Next.js 14, Tailwind, Recharts, Shadcn/ui, React Hook Form
  - Backend: Node.js, Express, Prisma, PostgreSQL, Socket.io, Multer
  - Servicios: Supabase, Vercel, Resend

---

Este documento puede evolucionar hacia una especificación técnica completa (con diagramas ERD, BPMN, secuencia, etc.) si decides avanzar con la implementación.

