# OneData Portal AI - Stakeholders Runtime Integration

# Objetivo

Integrar los stakeholders del portal dentro del runtime del asistente IA para que el agente pueda:

- conocer servicios disponibles del inmueble
- recomendar stakeholders
- responder contextualizadamente
- preparar futuras automatizaciones

Esta fase NO debe implementar:
- reservas
- pagos
- workflows complejos
- creación automática de incidencias

El objetivo es únicamente:

AI contextual awareness

---

# Estado actual

## Ya implementado

### Business Central
- stakeholders
- assignments
- APIs enriquecidas
- AI context builder backend

### Portal
- sección Servicios
- cards
- modal detalle
- servicio frontend stakeholders
- buildStakeholdersAIContext()

---

# Objetivo técnico actual

Añadir los stakeholders al runtime IA actual del portal.

---

# Resultado esperado

Cuando el usuario pregunte:

Necesito internet

La IA debe poder responder:

Te recomiendo Digi Fiber para esta propiedad.

Y cuando pregunte:

Hay alguien para limpieza?

La IA debe usar stakeholders reales del inmueble.

---

# Arquitectura objetivo

## Flujo

Portal Chat
→ Runtime Resolver
→ Stakeholders Service
→ buildStakeholdersAIContext()
→ Prompt Runtime
→ LLM

---

# Objetivo principal

Añadir:

buildStakeholdersAIContext(stakeholders)

al contexto del agente IA.

---

# Requisitos funcionales

## 1. Resolver stakeholders del inmueble

Usar el inmueble actual del tenant.

Consumir:

getPortalStakeholders(propertyNo)

---

# 2. Construir contexto IA

Usar:

buildStakeholdersAIContext(stakeholders)

Resultado esperado:

AVAILABLE PROPERTY SERVICES:

- Service: Premium Cleaning
  Category: Cleaning
  Provider: Clean BCN
  Description: Premium apartment cleaning

---

# 3. Inyectar contexto en runtime IA

Añadir el contexto stakeholders al contexto global del chat.

Ejemplo:

TENANT INFORMATION:
...

PROPERTY INFORMATION:
...

AVAILABLE PROPERTY SERVICES:
...

---

# Restricciones importantes

## NO permitir

- invención de servicios inexistentes
- inventar teléfonos
- inventar stakeholders
- sugerir servicios fuera del inmueble

La IA debe trabajar SOLO con stakeholders reales.

---

# Nueva clasificación IA

## Nuevo intent

service_recommendation

---

# Detectar mensajes como

- necesito internet
- necesito limpieza
- busco electricista
- hay algun seguro
- necesito mantenimiento
- alguien para arreglar esto

---

# Acción IA recomendada

## Nueva action

{
  "action": "recommend_service",
  "category": "Cleaning"
}

---

# Matching determinista

NO depender completamente del LLM.

Crear matching básico por categoría.

---

# Categorías soportadas inicialmente

- Cleaning
- Internet
- Electrician
- Plumbing
- Insurance
- Maintenance

---

# Recomendación arquitectónica

## Flujo correcto

### 1
Intent classification

### 2
Matching stakeholders

### 3
Context enrichment

### 4
LLM response generation

---

# Archivos probablemente implicados

Adaptar a arquitectura existente.

Posibles archivos:

src/lib/portal/ai-runtime.service.ts
src/lib/portal/ai-context-builder.ts
src/lib/portal/portal-chat.service.ts
src/lib/portal/stakeholders.service.ts

---

# Funcionalidad mínima requerida

## Debe funcionar

Usuario:

Necesito alguien para limpiar el piso

Respuesta IA:

Te recomiendo Clean BCN para esta propiedad.

---

# Requisitos técnicos

## buildStakeholdersAIContext()

Debe:

- excluir availableForAI = false
- excluir stakeholders sin descripción útil
- limitar tamaño contexto
- evitar duplicados

---

# Límite recomendado

Máximo:
- 10 stakeholders
- 5000 caracteres

---

# Ordenación recomendada

1. priorityScore DESC
2. defaultForCategory DESC

---

# Seguridad

## NO renderizar HTML

## Sanitizar:
- descriptions
- notes
- aiDescription

---

# Objetivo estratégico

Transformar el portal desde:

document portal

hacia:

AI Property Operations Assistant

---

# Qué NO hacer todavía

NO implementar:
- reservas
- service requests
- workflows
- marketplace
- SLA
- pagos
- automatizaciones complejas

---

# Resultado esperado final

La IA debe ser capaz de:

- recomendar servicios reales
- conocer el inmueble
- responder contextualizadamente
- utilizar stakeholders como conocimiento estructurado

sin romper el flujo actual del chat.
