# Taurus — Comandos de desarrollo

## 1) Levantar todo desde cero

```powershell
# 1. Backend (PostgreSQL, Mongo, Redis, Mosquitto, NestJS services, Nginx, pgweb)
cd C:\Users\Harsue\Desktop\CODIGOS\GymTaurus
docker compose up -d

# 2. Metro bundler (frontend RN)
cd C:\Users\Harsue\trs
npx expo start --dev-client
```

> El proyecto está accesible vía el junction `C:\Users\Harsue\trs` (ruta corta para evitar el límite de 260 chars de Windows en CMake/Ninja).

## 2) Atajos dentro de Metro (cuando ya está corriendo)

Al iniciar Metro deja una terminal interactiva. Con foco en esa terminal:

| Tecla | Acción |
|-------|--------|
| `r` | **Reload** — recarga el bundle JS en el dispositivo |
| `j` | Abre el debugger en Chrome |
| `m` | Toggle menú de desarrollo |
| `?` | Ver todos los atajos |
| `Ctrl+C` | Detener Metro |

> Si en la terminal **`r` no funciona**: la consola perdió el foco (suele pasar tras `Tee-Object` o pipes). Solución: cierra Metro (`Ctrl+C`) y arranca de nuevo, o agita el teléfono → menú dev → **Reload**, o:
> ```powershell
> & $adb shell input keyevent 82   # abre menú dev sin agitar
> ```

## 3) Variables útiles

Pega esto al inicio de cada sesión PowerShell:

```powershell
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"
```

## 4) Conectar teléfono (USB)

```powershell
# Verifica que el teléfono esté detectado
& $adb devices

# Forward de puertos sobre USB (necesario al reconectar o reiniciar Metro)
& $adb reverse tcp:8081 tcp:8081   # Metro
& $adb reverse tcp:8080 tcp:8080   # Backend (Nginx gateway)
& $adb reverse --list              # Ver forwards activos

# Cerrar la app y relanzarla
& $adb shell am force-stop com.devharsue.taurusmobile
& $adb shell monkey -p com.devharsue.taurusmobile -c android.intent.category.LAUNCHER 1

# Forzar reload desde adb (si Metro no responde a `r`)
& $adb shell input keyevent 82     # abre menú dev
```

## 5) Reiniciar Metro con cache limpio

Hazlo cuando agregues paquetes nuevos, cambies `.env`, o veas errores raros:

```powershell
cd C:\Users\Harsue\trs
npx expo start --dev-client --clear
```

## 6) Backend Docker

```powershell
cd C:\Users\Harsue\Desktop\CODIGOS\GymTaurus

docker compose up -d                      # Levantar todo
docker compose ps                         # Estado de contenedores
docker compose logs -f members-service    # Logs en vivo de un servicio
docker compose logs --tail 50 auth-service
docker compose restart nginx              # Reiniciar uno
docker compose down                       # Parar todo

# Tras editar código del backend (libs o apps)
docker compose build auth-service members-service
docker compose up -d auth-service members-service

# Tras editar docker-compose.yml
docker compose up -d --build
```

## 7) Acceso a herramientas web

| URL | Para qué |
|-----|----------|
| `http://localhost:8080/api/members/docs` | Swagger del members-service |
| `http://localhost:8080/pg/` | pgweb (admin de Postgres) — user/pass: `admin`/`admin` |
| `http://localhost:8080/redis/` | Redis Commander — user/pass: `admin`/`admin` |
| `http://localhost:8080/api/auth` | Endpoints auth |
| `http://localhost:8080/api/plans` | Endpoints planes |
| `http://localhost:8080/api/members` | Endpoints miembros |

## 8) Build e instalación de APK

### Build debug (necesita Metro corriendo para ver la app)

```powershell
cd C:\Users\Harsue\trs\android
.\gradlew.bat assembleDebug
```

APK queda en:
```
C:\Users\Harsue\Desktop\CODIGOS\Taurus-frontend\taurus-mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

### Build release (APK independiente, JS embebido)

```powershell
cd C:\Users\Harsue\trs\android
.\gradlew.bat assembleRelease
```

APK queda en:
```
C:\Users\Harsue\Desktop\CODIGOS\Taurus-frontend\taurus-mobile\android\app\build\outputs\apk\release\app-release.apk
```

### Instalar en el teléfono

```powershell
& $adb install -r "C:\Users\Harsue\Desktop\CODIGOS\Taurus-frontend\taurus-mobile\android\app\build\outputs\apk\debug\app-debug.apk"
```

> El flag `-r` reinstala manteniendo datos. Si cambia el certificado de firma o falla por ello, agrega `-d` (downgrade) o desinstala primero: `& $adb uninstall com.devharsue.taurusmobile`.

## 9) Limpieza si algo se atasca

```powershell
# Limpiar build de Android
cd C:\Users\Harsue\trs\android
.\gradlew.bat clean

# Limpiar caché de Metro/Expo
cd C:\Users\Harsue\trs
npx expo start --dev-client --clear

# Recrear junction si lo borraste
cmd /c 'mklink /J C:\Users\Harsue\trs "C:\Users\Harsue\Desktop\CODIGOS\Taurus-frontend\taurus-mobile"'

# Liberar puerto 8081 si Metro quedó zombie
Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## 10) Variables de entorno del frontend

Archivo: `taurus-mobile/.env`

```env
EXPO_PUBLIC_API_HOST=http://localhost
EXPO_PUBLIC_API_PORT=8080
```

> Cualquier cambio en `.env` requiere reiniciar Metro con `--clear`.

## 11) Reglas de validación (alineadas backend ↔ frontend)

| Campo | Regla |
|-------|-------|
| **Cedula** | 7 a 8 dígitos numéricos. Ej: `12345678` |
| **Telefono** | `58` + prefijo (`412`, `414`, `416`, `424`, `426`) + 7 dígitos. Ej: `584141771490` |
| **Email** | Formato email válido, máx 254 chars |
| **Password** | Mínimo 8 chars, ≥2 números, ≥1 mayúscula, ≥1 minúscula, ≥1 carácter especial |

Decoradores backend (en `@libs/common`): `@IsTaurusCedula()`, `@IsTaurusPhone()`, `@IsTaurusEmail()`, `@IsTaurusPassword()`.
Schemas frontend (en `@utils/validators`): `cedulaSchema`, `phoneSchema`, `emailSchema`, `passwordSchema`.
