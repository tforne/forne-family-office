# Alta directa de incidencias en Business Central

El portal crea incidencias mediante `POST` contra la API custom configurada en:

```env
BC_CREATE_INCIDENTS_ENDPOINT=tenantIncidentRequests
```

Si esta variable no está definida, el portal usa `tenantIncidents`. Ese endpoint puede servir para listar incidencias, pero Business Central devolverá `405 BadRequest_MethodNotAllowed` si la API Page tiene `InsertAllowed = false`, si la entidad es de solo lectura, o si la tabla/origen no admite inserción.

## Recomendación

Mantener `tenantIncidents` como API de lectura y publicar una API Page separada para altas desde el portal, por ejemplo `tenantIncidentRequests`.

La API de alta debe:

- Ser `PageType = API`.
- Tener `EntitySetName = 'tenantIncidentRequests'`.
- Tener `InsertAllowed = true`.
- Tener `DelayedInsert = true`.
- Ejecutar la lógica AL necesaria en `OnInsertRecord`, `OnValidate` o triggers de tabla para crear la incidencia real.
- Exponer solo los campos que el portal necesita enviar.

## Payload enviado por el portal

```json
{
  "incidentDate": "2026-04-22",
  "title": "Fuga de agua en cocina",
  "description": "Descripción introducida por el usuario",
  "caseType": "Problem",
  "priority": "Normal",
  "contractNo": "CONT-0001",
  "fixedRealEstateNo": "RE-001",
  "refDescription": "Vivienda Barcelona",
  "contactName": "Cliente Demo",
  "contactPhoneNo": "600000000",
  "contactEmail": "cliente@example.com"
}
```

Los nombres de campo deben coincidir exactamente con los nombres publicados por la API Page de Business Central. Si en AL se usan otros nombres, ajustar el payload en `src/lib/portal/incident-create.service.ts`.

## Objetos AL propuestos

He dejado una propuesta separada por objetos en `docs/business-central-al/`:

- `50150.TenantIncidentRequest.Table.al`
- `50151.TenantIncidentRequestStatus.Enum.al`
- `50152.TenantIncidentRequestApi.Page.al`
- `50153.TenantIncidentReqProcessor.Codeunit.al`
- `50154.TenantIncidentReqPermissions.PermissionSet.al`

La propuesta usa una tabla staging `Tenant Incident Request`: el portal inserta ahí la solicitud y Business Central puede disparar un workflow sobre el nuevo registro para enviar el correo al inquilino. La codeunit `Tenant Incident Req. Processor` queda como pieza opcional futura para conectar la solicitud con la tabla/codeunit real de incidencias.

## Flujo provisional con workflow

1. El portal hace `POST` en `tenantIncidentRequests`.
2. Business Central inserta un registro en `Tenant Incident Request` con estado `New`.
3. Un workflow de Business Central se dispara al insertar el registro.
4. El workflow envía un correo al inquilino usando `Contact Email` o `Portal User Email`.
5. Más adelante, una codeunit subscriber podrá crear la incidencia real y actualizar `Created Incident No.`.

## Ejemplo AL orientativo

```al
page 50150 TenantIncidentRequestApi
{
    PageType = API;
    Caption = 'Tenant Incident Request API';
    APIPublisher = 'onedata';
    APIGroup = 'tenantportal';
    APIVersion = 'v1.0';
    EntityName = 'tenantIncidentRequest';
    EntitySetName = 'tenantIncidentRequests';
    SourceTable = "Tenant Incident";
    DelayedInsert = true;
    InsertAllowed = true;
    ModifyAllowed = false;
    DeleteAllowed = false;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId) { Caption = 'Id'; }
                field(incidentDate; Rec."Incident Date") { Caption = 'Incident Date'; }
                field(title; Rec.Title) { Caption = 'Title'; }
                field(description; Rec.Description) { Caption = 'Description'; }
                field(caseType; Rec."Case Type") { Caption = 'Case Type'; }
                field(priority; Rec.Priority) { Caption = 'Priority'; }
                field(contractNo; Rec."Contract No.") { Caption = 'Contract No.'; }
                field(fixedRealEstateNo; Rec."Fixed Real Estate No.") { Caption = 'Fixed Real Estate No.'; }
                field(refDescription; Rec."Ref. Description") { Caption = 'Ref. Description'; }
                field(contactName; Rec."Contact Name") { Caption = 'Contact Name'; }
                field(contactPhoneNo; Rec."Contact Phone No.") { Caption = 'Contact Phone No.'; }
                field(contactEmail; Rec."Contact Email") { Caption = 'Contact Email'; }
            }
        }
    }
}
```

El objeto anterior es una plantilla: deben sustituirse `SourceTable` y campos por los nombres reales de la extensión de Business Central.

## Checklist de implantación

1. Publicar la API Page writable en la extensión de Business Central.
2. Asignar permisos de inserción al usuario/aplicación Entra usada por el portal.
3. Confirmar en `$metadata` que aparece `tenantIncidentRequests`.
4. Configurar `.env.local` con `BC_CREATE_INCIDENTS_ENDPOINT=tenantIncidentRequests`.
5. Reiniciar el servidor Next.js.
6. Probar un alta desde el portal.
