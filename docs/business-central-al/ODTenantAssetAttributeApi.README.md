# OD Tenant Asset Attribute API

## Objetivo

Publicar los atributos del activo inmobiliario para consumo desde el portal sin depender de buffers temporales ni de la procedure `LoadAttributes`.

## Archivos

- `97222.ODTenantAssetAttributeApi.Page.al`
- `97223.ODTenantAssetAttributePermissions.PermissionSet.al`

## Diseño recomendado

La API se basa en:

```al
SourceTable = "FRE Attribute Value Mapping"
SourceTableView = where("Table ID" = const(96000))
```

De esta forma OData puede consultar directamente los atributos asociados a cada inmueble.

## Campos expuestos

- `id`
- `fixedRealEstateNo`
- `attributeId`
- `attributeValueId`
- `attributeName`
- `value`
- `attributeType`
- `unitOfMeasure`
- `blocked`
- `comment`

## URL de prueba

Sustituir:

- `{tenantId}`
- `{companyId}`
- `{freNo}`

por los valores reales.

```text
https://api.businesscentral.dynamics.com/v2.0/{tenantId}/Production/api/onedata/tenantportal/v1.0/companies({companyId})/tenantAssetAttributes?$filter=fixedRealEstateNo eq '{freNo}'
```

## Ejemplo real

```text
https://api.businesscentral.dynamics.com/v2.0/92009205-bd53-4789-adec-e629157ac764/Production/api/onedata/tenantportal/v1.0/companies(e2e9cb10-a3f2-f011-8405-7c1e52fc0b55)/tenantAssetAttributes?$filter=fixedRealEstateNo eq 'AFI-19-00001'
```

## Validación esperada

La API debe devolver filas con este aspecto:

```json
{
  "id": "...",
  "fixedRealEstateNo": "AFI-19-00001",
  "attributeId": 123,
  "attributeValueId": 456,
  "attributeName": "Dormitorios",
  "value": "3",
  "attributeType": "Option",
  "unitOfMeasure": "",
  "blocked": false,
  "comment": ""
}
```

## Si no devuelve datos

Revisar:

1. que existen registros en `FRE Attribute Value Mapping` con:
   - `"Table ID" = 96000`
   - `"No." = '{freNo}'`
2. que la page `97222` está publicada en la extensión correcta
3. que el usuario o la app tienen asignado el permission set `97223`
4. que el `fixedRealEstateNo` del portal coincide exactamente con `"No."` del activo
