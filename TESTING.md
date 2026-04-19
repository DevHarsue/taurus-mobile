# Testing Guide - Members Service Integration

Usuario de prueba: `admin@taurus.gym` / `Admin123!`
Planes seed: Mensual (30d, $20), Trimestral (90d, $50), Semestral (180d, $90), Anual (365d, $150)

---

## 1. Login (Admin)

**Ruta:** Pantalla inicial despues del splash

- Ingresar email y password del admin seed
- Debe redirigir a Dashboard (tabs de admin)
- Verificar en localStorage (web) o SecureStore que `taurus.access_token` y `taurus.refresh_token` existen
- El JWT decodificado debe tener `role: "admin"`

**Errores esperados:**
- Email invalido o password incorrecto: banner rojo "No se pudo iniciar sesion", se queda en login
- Campos vacios: validacion inline debajo de cada input

---

## 2. Dashboard (Admin)

**Ruta:** Tab "DASHBOARD"

- Muestra stats hardcodeadas (42 entradas, 256 miembros, etc.)
- Lista de accesos recientes: llama a `GET /api/access-service/log?limit=50&offset=0`
- Si el access-service no esta levantado, muestra error pero no crashea
- Los accesos muestran nombre, motivo y hora

---

## 3. Listar Miembros

**Ruta:** Tab "MEMBERS"

- Carga miembros paginados: `GET /api/members?page=1&limit=20`
- Verificar en DB que los miembros listados coinciden con la tabla `members`
- Cada card muestra: nombre, cedula, badge de estado (ACTIVO verde / VENCIDO rojo)

**Filtros:**
- "Activos": `GET /api/members?status=active&page=1&limit=20` -- solo miembros con suscripcion vigente
- "Vencidos": `GET /api/members?status=expired` -- solo miembros sin suscripcion o expirada
- "Todos": sin filtro de status

**Busqueda:**
- Escribir nombre o cedula: `GET /api/members?search=texto&page=1&limit=20`
- Tiene debounce de 300ms -- no dispara en cada tecla
- Se puede combinar con filtro de status

**Estado vacio:** Si no hay miembros, muestra "Sin miembros"

---

## 4. Crear Miembro

**Ruta:** FAB (+) en Members list > Formulario "Registrar Miembro"

- Campos: nombre (requerido), cedula (requerido), telefono, email
- Al enviar: `POST /api/members` con body `{ userId, name, cedula, phone?, email?, fingerprintId? }`
- `userId` se inyecta automaticamente del admin logueado -- no es campo del formulario
- Respuesta esperada: `{ id, name, cedula, status: "expired" }` -- siempre nace como expired
- Verificar en DB: nuevo registro en tabla `members` con los datos ingresados
- Si exito: navega atras a la lista. El nuevo miembro debe aparecer con badge VENCIDO

**Errores esperados:**
- Cedula duplicada: backend retorna 409. Banner "No se pudo registrar el miembro"
- FingerprintId duplicado: idem 409
- Campos invalidos (nombre < 2 chars, email mal formado): 400 del backend

---

## 5. Detalle de Miembro

**Ruta:** Tap en un miembro de la lista

- Llama: `GET /api/members/:id`
- Muestra: nombre, cedula, estado, dias restantes, plan actual, fechas
- Circulo de progreso: `daysLeft / 30` (si tiene 15 dias, muestra 50%)
- Si no tiene suscripcion activa: daysLeft = 0, badge VENCIDO

**Historial de renovaciones:** Actualmente hardcodeado (3 items mock). No viene del API.

---

## 6. Renovar Membresia

**Ruta:** Detalle de miembro > Boton "Renovar membresia"

- Carga planes: `GET /api/plans` -- muestra todos los planes activos
- Seleccionar un plan (tap en la card, borde rojo = seleccionado)
- Al confirmar: `POST /api/members/:id/renew` con body `{ planId }`
- Si exito: navega atras al detalle

**Comportamiento del backend:**
- Si el miembro NO tiene suscripcion activa: nueva suscripcion inicia HOY
- Si el miembro SI tiene suscripcion activa: la nueva inicia desde la fecha de expiracion de la anterior. La anterior se marca como `expired`
- Verificar en DB: tabla `subscriptions` tiene nuevo registro con status `active`, `startsAt` y `expiresAt` correctos
- Verificar en DB: si habia suscripcion anterior, su status cambia a `expired`

**Errores esperados:**
- Plan inactivo (isActive=false): 400 "El plan seleccionado no esta activo"
- Miembro no existe: 404
- Plan no existe: 404

---

## 7. Planes (Admin)

**Ruta:** Tab "PLANS"

- Carga: `GET /api/plans` -- lista todos los planes
- Muestra cards con: nombre del plan, precio, duracion
- Los campos `tier`, `benefits`, `isHighlighted` son de display frontend -- el backend no los devuelve, asi que se muestran con valores por defecto
- Botones "EDIT PLAN" y FAB (+) estan en la UI pero NO son funcionales aun (los hooks `useCreatePlan`, `useUpdatePlan`, `useDeletePlan` existen pero no estan conectados a la UI)

**Estado vacio:** "Sin planes" si la tabla plans esta vacia

---

## 8. Perfil (Member)

**Ruta:** Login como member > Tab "PERFIL"

- Para testear: crear un usuario member via `POST /api/auth/register` (desde Swagger o Postman) y loguearse con el
- La pantalla muestra datos hardcodeados (plan, streak, calendario)
- Solo el nombre/email viene del auth context
- `useMyProfile()` existe pero esta deshabilitado -- no llama al API

---

## 9. QR Pass (Member)

**Ruta:** Tab "QR"

- Genera un QR con el `user.id` del usuario logueado
- Muestra el email del usuario debajo del QR
- No hace llamadas API (solo usa auth context)
- Verificar que el valor del QR coincide con el UUID del usuario en la DB

---

## 10. Historial de Renovaciones (Member)

**Ruta:** Tab "HISTORIAL"

- Muestra datos hardcodeados (4 items mock)
- `useRenewalHistory()` existe pero esta deshabilitado
- No se puede verificar contra DB porque no llama al API

---

## 11. QR Scanner (Admin)

**Ruta:** Tab "QR"

- Pantalla placeholder -- no tiene camara ni funcionalidad real
- Solo muestra el visor y texto instructivo
- No hace llamadas API

---

## Flujo completo de prueba sugerido

1. **Login** como admin@taurus.gym
2. **Verificar Dashboard** carga (aunque los stats son mock)
3. **Ir a Members** > verificar lista vacia o con datos del seed
4. **Crear miembro** con datos validos > confirmar en DB
5. **Intentar crear otro** con misma cedula > confirmar error 409
6. **Buscar** el miembro creado por nombre y por cedula
7. **Filtrar** por "Vencidos" > el miembro nuevo debe aparecer (nace expired)
8. **Entrar al detalle** > verificar datos correctos, daysLeft = 0
9. **Renovar** con Plan Mensual > confirmar en DB: subscription activa, 30 dias
10. **Volver a la lista** > filtrar por "Activos" > el miembro debe aparecer ahora
11. **Entrar al detalle** otra vez > daysLeft = 30, badge ACTIVO
12. **Renovar de nuevo** (estando activo) > verificar en DB: suscripcion anterior marcada `expired`, nueva suscripcion inicia desde la fecha de expiracion de la anterior
13. **Ir a Plans** > verificar que los 4 planes seed aparecen
14. **Logout** > verificar que vuelve a login y tokens se borran
15. **Login como member** > verificar que ve tabs de member (Perfil, QR, Historial), NO tabs de admin

---

## Endpoints NO conectados a UI (solo servicio + hook)

Estos endpoints tienen service y hook listos pero ninguna pantalla los usa todavia:

| Endpoint | Service | Hook | Nota |
|----------|---------|------|------|
| `DELETE /api/members/:id` | `membersService.remove()` | `useDeleteMember` | Falta boton en MemberDetail |
| `PUT /api/members/:id` | `membersService.update()` | `useUpdateMember` | Falta pantalla de edicion |
| `GET /api/members/:id/status` | `membersService.getStatus()` | `useMemberStatus` | Alternativa ligera al getById |
| `POST /api/plans` | `plansService.create()` | `useCreatePlan` | FAB en PlansScreen no funcional |
| `PUT /api/plans/:id` | `plansService.update()` | `useUpdatePlan` | Boton EDIT PLAN no funcional |
| `DELETE /api/plans/:id` | `plansService.remove()` | `useDeletePlan` | No hay UI |
| `CRUD /api/subscriptions` | `subscriptionsService.*` | -- | Sin hooks ni UI. Usar `/members/:id/renew` |

Para testear estos, usar Swagger (`localhost:8080/api/members-service/docs`) o llamar directamente desde la consola del browser con los services importados.
