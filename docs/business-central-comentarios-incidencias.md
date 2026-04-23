# Comentarios de incidencias en el portal

Para mostrar comentarios en la ficha de una incidencia, Business Central debe publicar una API read-only:

```text
tenantIncidentComments
```

## API Page propuesta

Objetos AL:

- `docs/business-central-al/50155.TenantIncidentCommentApi.Page.al`
- `docs/business-central-al/50156.TenantIncidentCommentsPermissions.PermissionSet.al`

La API está diseñada como solo lectura:

```al
InsertAllowed = false;
ModifyAllowed = false;
DeleteAllowed = false;
```

## Campos publicados

```text
id
entryNo
incidentId
incidentNo
commentDate
commentText
createdBy
source
isPublic
createdAt
```

## Filtro recomendado desde el portal

Mostrar solo comentarios públicos de la incidencia:

```text
incidentId eq '<incident.id>' and isPublic eq true
```

o si el vínculo real es por número:

```text
incidentNo eq '<incident.incidentId>' and isPublic eq true
```

## Ajustes necesarios

La plantilla usa:

```al
SourceTable = "OD Tenant Incident Comment";
```

Si vuestra tabla real tiene otro nombre o campos distintos, hay que adaptar:

- `SourceTable`
- `Rec."Incident Id"`
- `Rec."Incident No."`
- `Rec."Comment Date"`
- `Rec."Comment Text"`
- `Rec."Created By"`
- `Rec.Source`
- `Rec."Is Public"`
- `Rec."Created At"`

Cuando la API esté publicada en `$metadata`, el portal podrá añadir una sección **Comentarios** en la ficha de incidencias.
