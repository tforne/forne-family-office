# Resumen Implementación Portal AI 2.0b

## Qué se ha hecho

Se ha integrado una capa de resolución dinámica del runtime AI para el portal, manteniendo la misma experiencia visible para el usuario.

El portal sigue funcionando como un único asistente:

```text
OneData Assistant
```

Pero internamente ahora puede decidir de forma dinámica qué runtime o agente usar antes de llamar a OneData AI Layer.

## Cambio principal

Antes, la integración AI usaba un agente fijo.

Ahora, el backend resuelve el runtime en este orden:

```text
Intent detectado
-> contexto del portal
-> reglas de gobernanza
-> configuración en Business Central si existe
-> fallback local seguro si BC no responde o no publica runtime útil
```

## Qué se mantiene

La implementación conserva el comportamiento existente:

- no cambia la UI del chat
- no cambia la sensación de “un único asistente”
- se mantiene el fallback determinista actual
- no se crean operaciones autónomas
- Business Central sigue siendo la fuente preferida de gobierno y configuración
- si el runtime gobernado no está disponible, el portal sigue respondiendo de forma segura

## Archivos creados

- `src/lib/portal/ai-agent-runtime.service.ts`
- `src/lib/portal/__tests__/ai-agent-runtime.service.test.ts`
- `docs/portal-ai-2.0b-dynamic-portal-runtime-integration.md`
- `docs/portal-ai-2.0b-resumen-implementacion.md`
- `src/test/server-only-shim.ts`

## Archivos modificados

- `src/lib/portal/ai-layer.service.ts`
- `src/app/api/portal/chat/route.ts`
- `vitest.config.ts`

## Qué hace el nuevo servicio

El nuevo servicio:

- resuelve el agente AI adecuado en tiempo de ejecución
- intenta usar configuración de Business Central primero
- aplica fallback local seguro si BC no devuelve una configuración utilizable
- protege casos inseguros o sensibles con routing hacia gobernanza

## Mapeo local de fallback

Si Business Central no publica un runtime válido, se usa este mapeo local:

- `maintenance_incident` y `urgent_incident` -> `OD-OPERATIONS`
- `invoice_question` y `payment_question` -> `OD-ACCOUNTING`
- `contract_question` y `document_request` -> `OD-CONTRACT`
- `support_request` y `general_chat` -> `OD-TENANT`
- solicitudes inseguras -> `OD-GOVERNANCE`

## Casos de gobernanza cubiertos

Se han añadido reglas para detectar y encaminar de forma segura:

- intentos de bypass de permisos
- peticiones de borrado sensible
- intentos de acceso a datos de otros tenants
- solicitudes claramente inseguras

## Integración en el flujo actual

La ruta del chat sigue siendo la misma:

```text
/api/portal/chat
```

Lo que cambia es que, antes de enviar la petición AI:

- se detecta el intent
- se construye el contexto del portal
- se resuelve el runtime dinámico
- se llama a OneData AI Layer con el `agentCode` resuelto

Si esta llamada falla, se mantiene el fallback determinista existente.

## Tests y validación

Se ha validado lo siguiente:

- compilación TypeScript correcta
- tests unitarios del runtime dinámico
- suite completa de tests del proyecto

Resultados:

- `npx tsc --noEmit` OK
- `npm test` OK
- `55/55` tests pasando

## Limitaciones actuales

- la API de configuración de Business Central existente no garantiza todavía campos específicos de runtime AI
- por eso, la resolución BC-first soporta esos campos si están disponibles, pero sigue dependiendo de fallback local cuando no aparecen
- `promptCode` y `deploymentCode` quedan preparados como metadatos de runtime, pero no se fuerzan en el contrato actual del payload para no romper compatibilidad

## Resultado final

El portal sigue sintiéndose como un único asistente, pero internamente ya funciona con:

```text
runtime dinámico
+ routing multi-agente gobernado
+ Business Central como fuente preferida
+ fallback seguro y retrocompatible
```

## Siguiente paso recomendado

Publicar en Business Central una configuración explícita de runtime AI con campos estables como:

- `agentCode`
- `promptCode`
- `deploymentCode`
- `operation`
- `routeKey`
- `enabled`
- `isDefault`

Eso permitiría que toda la gobernanza del runtime quede plenamente centralizada en BC sin depender de descubrimiento flexible de campos.
