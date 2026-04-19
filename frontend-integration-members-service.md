# Frontend Integration - Members Service

Documento de referencia para integrar el frontend (React Native) con el microservicio **members-service**.

**Base URL:** `/api/members-service` (a traves de nginx)
**Puerto directo:** `3001`

---

## Tabla de Contenidos

1. [Types, Enums e Interfaces](#types-enums-e-interfaces)
2. [Endpoints - Members](#endpoints---members)
3. [Endpoints - Plans](#endpoints---plans)
4. [Endpoints - Subscriptions](#endpoints---subscriptions)
5. [Autenticacion y Roles](#autenticacion-y-roles)
6. [Manejo de Errores](#manejo-de-errores)
7. [Datos Iniciales (Seeds)](#datos-iniciales-seeds)

---

## Types, Enums e Interfaces

### Enums

```typescript
enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
}

enum MemberStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}
```

### Interfaces de Dominio

```typescript
interface Member {
  id: string;               // UUID
  userId: string;           // UUID - referencia a auth.users
  name: string;
  cedula: string;
  phone?: string;
  email?: string;
  fingerprintId?: number;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

interface Plan {
  id: string;               // UUID
  name: string;
  durationDays: number;
  referencePrice: number;
  isActive: boolean;
}

interface Subscription {
  id: string;               // UUID
  memberId: string;         // UUID
  planId: string;           // UUID
  status: SubscriptionStatus;
  startsAt: string;         // ISO 8601
  expiresAt: string;        // ISO 8601
}
```

### Interfaces de Respuesta

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface MemberDetail {
  id: string;
  name: string;
  cedula: string;
  phone?: string;
  email?: string;
  status: MemberStatus;
  daysLeft: number;
  fingerprintId?: number;
}

interface MemberStatus {
  name: string;
  active: boolean;
  daysLeft: number;
  fingerprintId?: number;
}

interface MemberCreated {
  id: string;
  name: string;
  cedula: string;
  status: 'expired';       // siempre 'expired' al crear
}

interface FingerprintLookup {
  id: string;
  name: string;
  active: boolean;
  daysLeft: number;
}

interface HealthCheck {
  service: string;
  status: string;
}
```

### DTOs de Request

```typescript
interface CreateMemberRequest {
  userId: string;           // UUID, requerido
  name: string;             // min 2 caracteres, requerido
  cedula: string;           // unico, requerido
  phone?: string;           // opcional
  email?: string;           // formato email valido, opcional
  fingerprintId?: number;   // entero, unico, opcional
}

interface UpdateMemberRequest {
  name?: string;            // min 2 caracteres
  phone?: string;
  email?: string;           // formato email valido
  // NOTA: userId, cedula y fingerprintId NO se pueden modificar
}

interface CreatePlanRequest {
  name: string;             // min 2 caracteres, unico, requerido
  durationDays: number;     // entero positivo, requerido
  referencePrice?: number;  // default: 0
  isActive?: boolean;       // default: true
}

interface UpdatePlanRequest {
  name?: string;            // min 2 caracteres
  durationDays?: number;    // entero positivo
  referencePrice?: number;
  isActive?: boolean;
}

interface RenewSubscriptionRequest {
  planId: string;           // UUID del plan a comprar, requerido
}

interface CreateSubscriptionRequest {
  memberId: string;         // UUID, requerido
  planId: string;           // UUID, requerido
  startsAt: string;         // ISO 8601, requerido
  expiresAt: string;        // ISO 8601, requerido
  status?: string;          // default: 'expired'
}
```

### Query Parameters

```typescript
interface ListMembersQuery {
  status?: 'active' | 'expired';
  search?: string;          // busca por nombre o cedula
  page?: string;            // default: '1'
  limit?: string;           // default: '20'
}
```

---

## Endpoints - Members

### `GET /members/health`

Health check del servicio.

| Propiedad | Valor |
|-----------|-------|
| Auth | No requiere |
| Response | `HealthCheck` |
| Status | `200` |

---

### `POST /members`

Crear un nuevo miembro.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Body | `CreateMemberRequest` |
| Response | `MemberCreated` |
| Status | `201` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `400` | Datos invalidos (validacion de campos) |
| `409` | `cedula` ya registrada |
| `409` | `fingerprintId` ya registrado |

---

### `GET /members`

Listar miembros con paginacion y filtros.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT (cualquier rol) |
| Query | `ListMembersQuery` |
| Response | `PaginatedResponse<Member>` |
| Status | `200` |

---

### `GET /members/by-fingerprint/:fpId`

Buscar miembro por huella digital. Usado por dispositivos IoT.

| Propiedad | Valor |
|-----------|-------|
| Auth | No requiere |
| Params | `fpId: number` |
| Response | `FingerprintLookup` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | No existe miembro con ese `fingerprintId` |

---

### `GET /members/:id/status`

Obtener estado de suscripcion de un miembro.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT (cualquier rol) |
| Params | `id: string` (UUID) |
| Response | `MemberStatus` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Miembro no encontrado |

---

### `GET /members/:id`

Obtener detalle completo de un miembro.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT (cualquier rol) |
| Params | `id: string` (UUID) |
| Response | `MemberDetail` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Miembro no encontrado |

---

### `PUT /members/:id`

Actualizar datos de un miembro.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Body | `UpdateMemberRequest` |
| Response | `Member` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `400` | Datos invalidos |
| `404` | Miembro no encontrado |

---

### `DELETE /members/:id`

Eliminar un miembro.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Response | `void` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Miembro no encontrado |

---

### `POST /members/:id/renew`

Renovar o comprar suscripcion para un miembro.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID del miembro) |
| Body | `RenewSubscriptionRequest` |
| Response | `Subscription` |
| Status | `201` |

**Comportamiento:**
- Si el miembro **no tiene** suscripcion activa: inicia hoy.
- Si el miembro **tiene** suscripcion activa: la nueva inicia desde la fecha de expiracion de la anterior. La anterior se marca como `expired`.

**Errores:**

| Codigo | Causa |
|--------|-------|
| `400` | El plan seleccionado no esta activo |
| `404` | Miembro no encontrado |
| `404` | Plan no encontrado |

---

## Endpoints - Plans

### `GET /plans`

Listar todos los planes.

| Propiedad | Valor |
|-----------|-------|
| Auth | No requiere |
| Response | `Plan[]` |
| Status | `200` |

---

### `GET /plans/:id`

Obtener detalle de un plan.

| Propiedad | Valor |
|-----------|-------|
| Auth | No requiere |
| Params | `id: string` (UUID) |
| Response | `Plan` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Plan no encontrado |

---

### `POST /plans`

Crear un nuevo plan.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Body | `CreatePlanRequest` |
| Response | `Plan` |
| Status | `201` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `400` | Datos invalidos |

---

### `PUT /plans/:id`

Actualizar un plan (reemplazo completo de campos enviados).

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Body | `UpdatePlanRequest` |
| Response | `Plan` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Plan no encontrado |

---

### `PATCH /plans/:id`

Actualizar parcialmente un plan. Funcionalmente identico a PUT.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Body | `UpdatePlanRequest` |
| Response | `Plan` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Plan no encontrado |

---

### `DELETE /plans/:id`

Eliminar (desactivar) un plan.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Response | `void` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Plan no encontrado |

---

## Endpoints - Subscriptions

> Todos los endpoints de subscriptions requieren **JWT + ADMIN**.

### `POST /subscriptions`

Crear una suscripcion directamente.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Body | `CreateSubscriptionRequest` |
| Response | `Subscription` |
| Status | `201` |

> **Nota:** Preferir usar `POST /members/:id/renew` en lugar de este endpoint.

---

### `GET /subscriptions`

Listar todas las suscripciones.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Response | `Subscription[]` |
| Status | `200` |

---

### `GET /subscriptions/:id`

Obtener detalle de una suscripcion.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Response | `Subscription` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Suscripcion no encontrada |

---

### `PUT /subscriptions/:id`

Actualizar una suscripcion.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Body | `Partial<Subscription>` (sin `id`) |
| Response | `Subscription` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Suscripcion no encontrada |

---

### `DELETE /subscriptions/:id`

Eliminar una suscripcion.

| Propiedad | Valor |
|-----------|-------|
| Auth | JWT + ADMIN |
| Params | `id: string` (UUID) |
| Response | `void` |
| Status | `200` |

**Errores:**

| Codigo | Causa |
|--------|-------|
| `404` | Suscripcion no encontrada |

---

## Autenticacion y Roles

### Header de Autenticacion

```
Authorization: Bearer <jwt_token>
```

### JWT Payload

```typescript
interface JwtPayload {
  sub: string;    // userId (UUID)
  email: string;
  role: Role;     // 'admin' | 'member'
}
```

### Clasificacion de Endpoints por Acceso

**Publicos (sin token):**
- `GET /members/health`
- `GET /members/by-fingerprint/:fpId`
- `GET /plans`
- `GET /plans/:id`

**Autenticados (cualquier rol):**
- `GET /members`
- `GET /members/:id`
- `GET /members/:id/status`

**Solo ADMIN:**
- `POST /members`
- `PUT /members/:id`
- `DELETE /members/:id`
- `POST /members/:id/renew`
- `POST /plans`, `PUT /plans/:id`, `PATCH /plans/:id`, `DELETE /plans/:id`
- Todos los `/subscriptions`

---

## Manejo de Errores

### Formato de Error Estandar (NestJS)

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

### Codigos de Error

| Codigo | Tipo | Cuando ocurre |
|--------|------|---------------|
| `400` | Bad Request | Validacion de campos fallo, plan inactivo, formato UUID invalido |
| `401` | Unauthorized | Token JWT ausente o invalido |
| `403` | Forbidden | Rol insuficiente (ej: MEMBER intentando crear un miembro) |
| `404` | Not Found | Recurso no existe (miembro, plan, suscripcion) |
| `409` | Conflict | Valor duplicado (`cedula`, `fingerprintId`) |

### Validaciones Globales

El servicio tiene habilitado:
- **`whitelist: true`** - Elimina propiedades desconocidas del body
- **`forbidNonWhitelisted: true`** - Retorna error `400` si se envian propiedades no definidas en el DTO
- **`transform: true`** - Transforma automaticamente los tipos

Ejemplo de error de validacion:
```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 2 characters",
    "cedula must be a string"
  ],
  "error": "Bad Request"
}
```

Ejemplo de error de conflicto:
```json
{
  "statusCode": 409,
  "message": "Ya existe un miembro con esa cedula",
  "error": "Conflict"
}
```

---

## Datos Iniciales (Seeds)

### Planes por Defecto

| Nombre | Duracion | Precio |
|--------|----------|--------|
| Mensual | 30 dias | $20.00 |
| Trimestral | 90 dias | $50.00 |
| Semestral | 180 dias | $90.00 |
| Anual | 365 dias | $150.00 |

---

## Ejemplo de Uso Completo

### Flujo: Registrar miembro y asignar suscripcion

```typescript
// 1. Obtener planes disponibles
const plans = await fetch('/api/plans');
// Response: Plan[]

// 2. Crear miembro (requiere token ADMIN)
const member = await fetch('/api/members', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    userId: 'uuid-del-usuario',
    name: 'Juan Perez',
    cedula: 'V-12345678',
    phone: '04141234567',
    email: 'juan@email.com',
  }),
});
// Response: { id, name, cedula, status: 'expired' }

// 3. Renovar suscripcion con un plan
const subscription = await fetch(`/api/members/${member.id}/renew`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    planId: 'uuid-del-plan-mensual',
  }),
});
// Response: { id, memberId, planId, status: 'active', startsAt, expiresAt }

// 4. Consultar estado del miembro
const status = await fetch(`/api/members/${member.id}/status`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
// Response: { name: 'Juan Perez', active: true, daysLeft: 30 }
```
