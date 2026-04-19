# Auth Service — Documentación para Frontend

## Base URL

```
http://localhost:8080/api/auth
```

En desarrollo, todos los requests pasan por Nginx (puerto 8080) que rutea a `auth-service:3000`.

---

## Autenticación

El sistema usa **JWT** con dos tokens:

| Token | Tipo | Duración | Dónde guardarlo |
|---|---|---|---|
| **accessToken** | JWT (Bearer) | 15 minutos | SecureStore (React Native) |
| **refreshToken** | UUID opaco | 7 días | SecureStore (React Native) |

### Flujo de autenticación

```
1. POST /login → recibe accessToken + refreshToken
2. Todas las requests protegidas llevan header: Authorization: Bearer <accessToken>
3. Cuando el accessToken expira (401) → POST /refresh con el refreshToken
4. Si el refreshToken también expiró → redirigir a login
```

### Interceptor Axios recomendado

```typescript
// Adjuntar token a cada request
api.interceptors.request.use((config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh automático en 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) return Promise.reject(error);

      try {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        // Refresh falló — limpiar tokens y redirigir a login
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

**Nota importante:** El `/refresh` implementa **rotación de tokens** — cada vez que se usa un refreshToken, se genera uno nuevo y el anterior se invalida. Por eso el interceptor debe guardar el nuevo refreshToken que recibe.

---

## Roles

```typescript
enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
}
```

- **admin**: puede registrar usuarios, ver lista de miembros, renovar membresías
- **member**: solo puede ver su propio perfil

La navegación de la app debe cambiar según el rol (tabs diferentes para admin vs member).

---

## Endpoints

### POST /auth/login

Autentica un usuario. No requiere token.

**Request:**
```json
{
  "email": "admin@taurus.gym",
  "password": "Admin123!"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user": {
    "id": "b4b77b15-8c20-452d-a768-89cec9fc5a86",
    "email": "admin@taurus.gym",
    "role": "admin"
  }
}
```

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**Pantalla login:**
1. Enviar email + password
2. Si 200: guardar `accessToken` y `refreshToken` en SecureStore, guardar `user` en estado global
3. Si 401: mostrar error "Credenciales inválidas"
4. Redirigir según `user.role`: admin → lista de miembros, member → mi perfil

---

### POST /auth/register

Crea un nuevo usuario. **Solo admin.**

**Headers:** `Authorization: Bearer <accessToken>`

**Request:**
```json
{
  "email": "nuevo@taurus.gym",
  "password": "Password1",
  "role": "member"
}
```

**Response 201:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "nuevo@taurus.gym",
  "role": "member"
}
```

**Response 409:**
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

**Response 401:** No autenticado o no es admin.

**Validaciones del DTO (errores 400):**
- `email`: debe ser email válido
- `password`: string, mínimo 8 caracteres
- `role`: solo `"admin"` o `"member"`
- Campos extra en el body retornan 400 (forbidNonWhitelisted activo)

---

### POST /auth/refresh

Renueva el access token usando un refresh token válido. No requiere Bearer token.

**Request:**
```json
{
  "refreshToken": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-uuid-generated-here"
}
```

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

**Importante:**
- El refreshToken enviado se **elimina** de la BD (rotación)
- Se retorna un **nuevo** refreshToken que debe reemplazar al anterior en SecureStore
- Si se intenta usar un refreshToken ya rotado/revocado → 401

---

### GET /auth/me

Retorna el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200:**
```json
{
  "id": "b4b77b15-8c20-452d-a768-89cec9fc5a86",
  "email": "admin@taurus.gym",
  "role": "admin"
}
```

**Response 401:** Token ausente, inválido o expirado.

**Uso en la app:**
- Pantalla "Mi Perfil" del miembro: consume `/auth/me` + `/members/:id`
- Verificar sesión activa al abrir la app

---

### POST /auth/logout

Revoca un refresh token específico. No cierra otras sesiones del mismo usuario.

**Headers:** `Authorization: Bearer <accessToken>`

**Request:**
```json
{
  "refreshToken": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**Response 200:**
```json
{
  "message": "Logged out successfully"
}
```

**Response 401:** Token Bearer ausente o inválido.

**Flujo de logout en la app:**
1. Llamar `POST /auth/logout` con el refreshToken guardado
2. Limpiar SecureStore (accessToken + refreshToken)
3. Limpiar estado global del usuario
4. Redirigir a pantalla de login

---

### GET /auth/health

Verifica que el servicio está corriendo. No requiere autenticación.

**Response 200:**
```json
{
  "service": "auth-service",
  "status": "ok"
}
```

---

## JWT Payload

El accessToken decodificado contiene:

```json
{
  "sub": "b4b77b15-8c20-452d-a768-89cec9fc5a86",
  "email": "admin@taurus.gym",
  "role": "admin",
  "iat": 1712966400,
  "exp": 1712967300
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `sub` | UUID | ID del usuario |
| `email` | string | Email del usuario |
| `role` | `"admin"` \| `"member"` | Rol del usuario |
| `iat` | number | Timestamp de emisión |
| `exp` | number | Timestamp de expiración (iat + 15min) |

El frontend puede decodificar el JWT localmente (sin verificar firma) para obtener el rol y decidir qué tabs mostrar, sin necesidad de llamar a `/auth/me`.

---

## Errores comunes

| Código | Cuándo | Qué hacer en la app |
|---|---|---|
| **400** | Validación falló (campo faltante, email inválido, password corto, campo extra) | Mostrar errores del campo |
| **401** | Token expirado, inválido, o credenciales incorrectas | Intentar refresh, si falla → login |
| **409** | Email ya registrado (en /register) | Mostrar "Este email ya está en uso" |
| **500** | Error interno del servidor | Mostrar error genérico |

**Estructura de error 400 (validación):**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

`message` es un array de strings con cada error de validación.

---

## Usuario de prueba

| Campo | Valor |
|---|---|
| Email | `admin@taurus.gym` |
| Password | `Admin123!` |
| Rol | `admin` |

Este usuario se crea automáticamente con el seed de la base de datos.

---

## Swagger

Documentación interactiva disponible en:

```
http://localhost:8080/api/auth/docs
```

Permite probar todos los endpoints directamente desde el navegador.
