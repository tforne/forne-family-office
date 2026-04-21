# Forné Family Office - Phase 3 Lite

Base realista para pasar a integración real.

## Qué incluye
- Landing pública
- Portal privado
- Login demo y login con Entra preparado
- Middleware de protección
- `/api/me`, `/api/me/contracts`, `/api/me/invoices`, `/api/me/incidents`, `/api/me/documents`
- Cliente OAuth para Business Central
- Fallback a mocks

## Modo demo
1. Define las variables de entorno en `.env.local`, variables de usuario de Windows o en el hosting.
2. Deja:
   - `USE_DEMO_LOGIN=true`
   - `USE_MOCK_API=true`

## Modo real
1. `USE_DEMO_LOGIN=false`
2. `USE_MOCK_API=false`
3. Completa variables `ENTRA_*`
4. Completa variables `BC_*`

## Variables de entorno

No subas `.env.local` a GitHub. Ese archivo contiene secretos locales y está ignorado por Git.

La aplicación lee siempre desde variables de entorno (`process.env`). Puedes usar cualquiera de estas opciones:

- Variables de usuario de Windows para desarrollo local.
- Variables del hosting en producción.
- `.env.local` solo como alternativa local si te resulta cómodo.

### Variables de usuario de Windows

Para guardar la configuración real en tu usuario de Windows, ejecuta:

```powershell
.\scripts\set-user-env.ps1 -AppBaseUrl "http://localhost:3000"
```

El script pedirá los valores de Entra y Business Central. Para `ENTRA_CLIENT_SECRET`, pega el **Value** del secret de Azure, no el **Secret ID**.

Después cierra y vuelve a abrir PowerShell para que los nuevos procesos reciban las variables. Puedes comprobar el estado sin mostrar secretos con:

```powershell
.\scripts\check-user-env.ps1
```

Si tu terminal ya estaba abierta antes de configurar las variables, puedes arrancar Next cargando explicitamente las variables de usuario:

```powershell
.\scripts\dev-user-env.ps1 -Port 3000
```

Usa `.env.example` como plantilla:

```powershell
Copy-Item .env.example .env.local
```

En local, rellena `.env.local`. En producción, configura las mismas variables en el panel del hosting:

- Vercel: Project Settings > Environment Variables
- Azure App Service: Configuration > Application settings
- GitHub Actions: Settings > Secrets and variables

Variables principales:

```env
USE_DEMO_LOGIN=false
USE_MOCK_API=false
APP_BASE_URL=https://tu-dominio.com

ENTRA_TENANT_ID=
ENTRA_CLIENT_ID=
ENTRA_CLIENT_SECRET=
ENTRA_AUTHORITY=https://login.microsoftonline.com/<tenant-id>
ENTRA_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
ENTRA_REDIRECT_URI=https://tu-dominio.com/api/auth/callback

BC_BASE_URL=https://api.businesscentral.dynamics.com/v2.0
BC_TENANT_ID=
BC_ENVIRONMENT=Production
BC_COMPANY_ID=
BC_SCOPE=https://api.businesscentral.dynamics.com/.default
BC_API_PUBLISHER=onedata
BC_API_GROUP=tenantportal
BC_API_VERSION=v1.0
BC_PROFILE_USERS_ENDPOINT=tenantPortalUsers
BC_PROFILE_USER_EMAIL_FIELD=email
BC_PROFILE_USER_CUSTOMER_NO_FIELD=customerNo
```

En Azure App Registration, añade todos los redirect URIs que uses:

```text
http://localhost:3000/api/auth/callback
https://tu-dominio.com/api/auth/callback
```

Si un secret real se sube accidentalmente a GitHub, revócalo en Azure y crea uno nuevo.

## Qué falta para producción
- Sustituir el login demo por autenticación definitiva si no se usará Microsoft Entra.
- Mejorar mensajes de error para usuario final y dejar detalle técnico solo en desarrollo.
- Revisar permisos mínimos de la Microsoft Entra Application en Business Central.
