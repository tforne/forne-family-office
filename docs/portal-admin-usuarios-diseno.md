# Diseno del portal de administracion de usuarios

## Objetivo

Crear una primera version de administracion de usuarios del portal sin base de datos propia del portal. Business Central sera el contenedor central de la relacion entre cliente e identidad externa mediante la tabla `OD Tenant Portal User`.

El portal actuara como interfaz operativa y orquestador:

1. El administrador accede al portal con una cuenta interna autorizada.
2. Busca el cliente/inquilino de Business Central.
3. Crea o invita al usuario en Microsoft Entra, Azure AD B2C o el proveedor de identidad definido.
4. Guarda o actualiza la relacion en Business Central.
5. El inquilino accede al portal y el portal valida el acceso contra Business Central.

## Principios de diseno

- Business Central sera el sistema maestro de cliente, contrato, inmueble y vinculo con usuario externo.
- El portal no guardara usuarios, invitaciones ni auditoria en base de datos propia durante la primera fase.
- La identidad, autenticacion, contrasenas, invitaciones y restablecimiento de contrasena no se implementaran en Business Central.
- El campo `External User Id` guardara el identificador del proveedor de identidad, por ejemplo `oid`, `sub` o id de usuario externo.
- El portal solo permitira acceso a usuarios con `Portal Enabled = true` y `Blocked = false`.
- El acceso administrativo se controlara por rol/grupo de Microsoft Entra o por una configuracion equivalente del proveedor de identidad.

## Alcance de la fase 1

Incluido:

- Pantalla privada de administracion de usuarios en el portal.
- Busqueda de clientes de Business Central.
- Alta manual/asistida de usuario de portal.
- Registro en `OD Tenant Portal User`.
- Activacion/desactivacion de acceso.
- Bloqueo/desbloqueo.
- Consulta de ultimo login.
- Estado basico de invitacion.
- Registro de errores de invitacion o sincronizacion en Business Central.

No incluido:

- Base de datos propia del portal.
- Auditoria avanzada historica.
- Cola de reintentos.
- Multiples usuarios por cliente.
- Multiples clientes para un mismo email.
- Gestion de contrasenas propia.

## Acceso al portal de administracion

Ruta propuesta:

```text
/portal/admin/users
```

El menu `Administracion` solo debe mostrarse a usuarios internos con permisos administrativos.

Roles recomendados:

- `PortalAdmin`: puede crear, activar, bloquear, reenviar invitaciones y corregir errores.
- `PortalSupport`: puede consultar usuarios, reenviar invitaciones y desbloquear accesos.
- `PortalTenant`: rol o contexto del inquilino, sin acceso a administracion.

Para la primera fase, la opcion recomendada es validar el rol administrativo con grupos de Microsoft Entra y claims del token. Si el token actual no trae grupos/roles, se puede empezar con una variable de entorno temporal con emails autorizados y sustituirla despues por grupos.

## Flujo principal de alta

```text
Contrato cerrado en Business Central
Cliente/inquilino existente en Business Central
Administrador entra en /portal/admin/users
Busca cliente por numero, nombre o email
Selecciona cliente
Pulsa "Crear acceso portal"
Portal crea o invita usuario en el proveedor de identidad
Proveedor devuelve External User Id
Portal crea registro en OD Tenant Portal User
Portal Enabled = true
Blocked = false
Invitation Status = Sent
Inquilino acepta invitacion
En primer login, el portal actualiza Last Login Date Time e Invitation Status = Accepted
```

## Flujo de acceso del inquilino

1. El usuario inicia sesion en el portal.
2. El portal obtiene `email` y `externalUserId` de la sesion.
3. El portal consulta Business Central en `tenantPortalUsers`.
4. Primero intenta resolver por `externalUserId`.
5. Si no hay coincidencia, intenta resolver por `email`.
6. Si encuentra registro y esta habilitado, resuelve el `Customer No.`.
7. El portal carga contratos, facturas, documentos e incidencias del cliente.

Reglas de rechazo:

- Sin registro en `OD Tenant Portal User`: no autorizado.
- `Portal Enabled = false`: acceso deshabilitado.
- `Blocked = true`: acceso bloqueado.
- Registro sin `Customer No.`: configuracion incompleta.
- Email duplicado o cliente duplicado: error funcional, debe resolverse en Business Central.

## Datos en Business Central

Tabla existente:

```text
table 97200 "OD Tenant Portal User"
```

Campos actuales utiles:

```text
Entry No.
External User Id
Email
Customer No.
Portal Enabled
Blocked
Last Login Date Time
Language Code
Created At
BC Company Name
```

Campos recomendados para centralizar la primera fase:

```text
Invitation Status
Invitation Sent At
Invitation Accepted At
Invitation Expires At
Last Invitation Error
Last Sync Status
Last Sync Error
Updated At
Updated By
```

Estados de invitacion:

```text
None
Pending
Sent
Accepted
Expired
Failed
Revoked
```

Estados de sincronizacion:

```text
Ok
Pending
Failed
```

## APIs de Business Central necesarias

Publicar una API Page sobre `OD Tenant Portal User`:

```text
EntityName: tenantPortalUser
EntitySetName: tenantPortalUsers
InsertAllowed: true
ModifyAllowed: true
DeleteAllowed: false
ODataKeyFields: SystemId
```

Operaciones que usara el portal:

- `GET tenantPortalUsers?$filter=email eq '...'`
- `GET tenantPortalUsers?$filter=externalUserId eq '...'`
- `GET tenantPortalUsers?$filter=customerNo eq '...'`
- `POST tenantPortalUsers`
- `PATCH tenantPortalUsers({id})`

Tambien se necesita una API de clientes o perfiles de inquilino para busqueda administrativa. Si `tenantProfiles` ya expone clientes, se puede reutilizar. Si no permite busqueda suficiente, publicar una API especifica de clientes con campos minimos:

```text
customerNo
name
email
phoneNo
blocked
```

## Payload de alta propuesto

```json
{
  "externalUserId": "00000000-0000-0000-0000-000000000000",
  "email": "inquilino@example.com",
  "customerNo": "C000123",
  "portalEnabled": true,
  "blocked": false,
  "languageCode": "ESP",
  "bcCompanyName": "My Company",
  "invitationStatus": "Sent",
  "invitationSentAt": "2026-04-22T10:00:00Z",
  "lastSyncStatus": "Ok"
}
```

## Pantalla de administracion

Ruta:

```text
/portal/admin/users
```

Vista principal:

- Buscador por cliente, nombre o email.
- Tabla con email, cliente, empresa BC, estado, invitacion, ultimo login y acciones.
- Filtros por estado: activos, bloqueados, invitacion pendiente, error.

Acciones por usuario:

- Crear acceso.
- Reenviar invitacion.
- Activar/desactivar portal.
- Bloquear/desbloquear.
- Actualizar email si no hay conflicto.
- Ver detalle tecnico.

Detalle de usuario:

- Email.
- `External User Id`.
- `Customer No.`.
- `BC Company Name`.
- `Portal Enabled`.
- `Blocked`.
- `Invitation Status`.
- `Invitation Sent At`.
- `Invitation Accepted At`.
- `Last Login Date Time`.
- `Last Invitation Error`.
- `Last Sync Status`.
- `Last Sync Error`.

## Integracion con identidad

La decision exacta depende del modelo definitivo:

- Microsoft Entra ID B2B: usuarios externos invitados al tenant.
- Azure AD B2C / Entra External ID: recomendado si los inquilinos son usuarios externos/clientes.
- Proveedor propio del portal: solo si se decide no depender de Microsoft para inquilinos.

Para la primera fase, el portal debe encapsular esta parte en un servicio interno:

```text
invitePortalUser(email, displayName, languageCode)
resendPortalInvitation(externalUserId)
disablePortalUser(externalUserId)
```

Asi el resto del portal no depende directamente del proveedor elegido.

## Cambios en el portal Next.js

Servicios nuevos:

```text
src/lib/portal/admin-users.service.ts
src/lib/identity/portal-users.ts
```

Rutas API nuevas:

```text
src/app/api/admin/portal-users/route.ts
src/app/api/admin/portal-users/[id]/route.ts
src/app/api/admin/portal-users/invite/route.ts
```

Paginas nuevas:

```text
src/app/portal/admin/users/page.tsx
src/app/portal/admin/users/[id]/page.tsx
```

Middleware/autorizacion:

- Mantener `/portal` protegido por sesion.
- Anadir validacion de rol administrativo para `/portal/admin`.
- No mostrar enlaces admin a usuarios sin rol.

## Variables de entorno previstas

```env
PORTAL_ADMIN_EMAILS=
PORTAL_ADMIN_GROUP_ID=
BC_TENANT_PORTAL_USERS_ENDPOINT=tenantPortalUsers
```

`PORTAL_ADMIN_EMAILS` puede usarse solo como puente temporal en desarrollo. En produccion deberia sustituirse por grupos o roles de Entra.

## Fases de entrega

Fase 1: Business Central como unico contenedor

- Ampliar/publicar API `tenantPortalUsers`.
- Pantalla admin basica.
- Alta manual/asistida.
- Bloqueo y activacion.
- Resolucion de login por `externalUserId` y `email`.

Fase 2: Integracion completa con proveedor de identidad

- Invitacion real.
- Reenvio de invitacion.
- Reset password si el proveedor lo permite.
- Estado de aceptacion.

Fase 3: Base de datos propia del portal si hace falta

- Auditoria historica.
- Reintentos.
- Eventos.
- Configuracion por sociedad.
- Informes operativos.

## Riesgos y decisiones pendientes

- Confirmar si los inquilinos usaran Entra B2B, Entra External ID/Azure AD B2C u otro proveedor.
- Confirmar si `External User Id` sera `oid`, `sub` u otro identificador estable.
- Confirmar si un cliente puede necesitar mas de un usuario. La tabla actual lo impide por clave unica en `Customer No.`.
- Confirmar si un email puede acceder a mas de un cliente. La tabla actual lo impide por clave unica en `Email`.
- Confirmar si `BC Company Name` debe rellenarse siempre o puede inferirse de la compania configurada por la API.
- Confirmar si `tenantProfiles` basta para busqueda administrativa de clientes.
