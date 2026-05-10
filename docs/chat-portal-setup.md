# Chat del Portal: Configuracion y Puesta en Marcha

Esta guia explica como activar, desactivar y preparar el chat del portal privado.

## Estado actual

El proyecto ya incluye una base funcional para el chat:

- Un interruptor tecnico por entorno mediante `CHAT_AVAILABLE`
- Un interruptor manual desde el portal de administracion
- Persistencia del estado visible/oculto en `src/data/chat-settings.json` o en el storage configurado
- Un asistente basico dentro del portal cuando el chat esta habilitado
- Escalado por correo cuando el asistente no resuelve una duda

Importante:

- Hoy el chat ya responde preguntas frecuentes del portal y orienta al usuario segun la seccion actual
- Si no entiende bien una consulta, puede enviarla por correo a `office@forne.family`
- Todavia no incluye una integracion con OpenAI o Azure OpenAI
- El sistema de encendido/apagado ya esta listo para reutilizarse cuando se conecte una version mas avanzada

## Como funciona el encendido y apagado

El chat solo se muestra si se cumplen las dos condiciones:

1. `CHAT_AVAILABLE=true` en el entorno
2. El administrador lo activa manualmente desde `Portal > Administracion > Chat`

Si `CHAT_AVAILABLE=false`, el chat queda bloqueado aunque en administracion figure como activo.

## Requisitos

- Node.js instalado
- Dependencias del proyecto instaladas con `npm install`
- Acceso a un usuario administrador del portal
- Variables de entorno configuradas

## Variables necesarias

La variable minima para controlar el chat es:

```env
CHAT_AVAILABLE=false
```

Valores posibles:

- `true`: permite que el chat pueda activarse manualmente
- `false`: bloquea el chat en ese entorno

Si vas a trabajar en local, puedes copiar la plantilla:

```powershell
Copy-Item .env.example .env.local
```

Despues ajusta al menos:

```env
USE_DEMO_LOGIN=true
USE_MOCK_API=true
CHAT_AVAILABLE=true
APP_BASE_URL=http://localhost:3000
```

## Puesta en marcha en local

1. Instala dependencias:

```powershell
npm install
```

2. Prepara `.env.local` con `CHAT_AVAILABLE=true`

3. Arranca el proyecto:

```powershell
npm run dev
```

4. Abre la aplicacion en:

```text
http://localhost:3000
```

5. Entra en el portal con un usuario que tenga permisos de administracion

6. Abre:

```text
/portal/admin/chat
```

7. Activa el interruptor `Mostrar chat` y guarda cambios

8. Vuelve a cualquier pantalla del portal y comprueba que aparece el boton `Chat portal`
9. Abre el chat y prueba preguntas como:

```text
Tengo facturas pendientes
Quiero abrir una incidencia
Tengo avisos sin leer
Resume mi situacion actual
```

10. Si el asistente no entiende una duda, usa el boton `Enviar duda por correo`

## Puesta en marcha en produccion

1. Configura `CHAT_AVAILABLE=true` en el hosting
2. Despliega la aplicacion
3. Accede al portal con un usuario administrador
4. Entra en `Portal > Administracion > Chat`
5. Activa el chat y guarda
6. Verifica que el launcher aparece en el portal privado

Si usas Vercel, Azure App Service o una plataforma serverless, es recomendable tener configurado un storage persistente para contenido editable. El estado del chat usa la misma capa de contenido que otras secciones administrables.

## Doble control recomendado

La configuracion actual esta pensada para operar con seguridad:

- Usa `CHAT_AVAILABLE=false` en entornos donde no quieras mostrar el chat
- Usa el interruptor manual para activarlo solo cuando negocio o soporte lo decidan

Ejemplos:

- Desarrollo: `CHAT_AVAILABLE=true`
- Preproduccion: `CHAT_AVAILABLE=true`
- Produccion: `CHAT_AVAILABLE=false` hasta el momento del lanzamiento

## Donde se guarda el estado

El estado del chat se gestiona desde:

- `src/lib/content/chat-settings.ts`
- `src/data/chat-settings.json`

El formato actual es:

```json
{
  "enabled": false,
  "updatedAt": ""
}
```

Cuando el administrador guarda cambios, la API actualiza ese estado.

## Rutas implicadas

- Pagina de administracion: `/portal/admin/chat`
- API de guardado: `/api/admin/chat-settings`
- API de respuestas del asistente: `/api/portal/chat`
- API de escalado por correo: `/api/portal/chat/escalate`
- Render del launcher: `src/app/portal/layout.tsx`

## Comportamiento esperado

Escenario 1:

- `CHAT_AVAILABLE=false`
- ajuste manual activado

Resultado:

- el chat no se muestra

Escenario 2:

- `CHAT_AVAILABLE=true`
- ajuste manual desactivado

Resultado:

- el chat no se muestra

Escenario 3:

- `CHAT_AVAILABLE=true`
- ajuste manual activado

Resultado:

- el chat se muestra en el portal
- si una duda no se resuelve, el usuario puede escalarla por correo desde el propio chat

## Resolucion de problemas

### No aparece el chat

Revisa:

- que `CHAT_AVAILABLE=true` este realmente cargado en el entorno
- que hayas guardado el interruptor desde `/portal/admin/chat`
- que el usuario sea administrador si quieres cambiar la configuracion
- que estes navegando dentro del portal privado y no en la parte publica

### El panel de chat no deja activar nada

Normalmente significa que el entorno lo esta bloqueando. Revisa `CHAT_AVAILABLE`.

### El cambio no persiste tras desplegar

En entornos serverless, confirma que la capa de contenido persistente esta bien configurada. Si no hay persistencia externa, el filesystem puede no conservar cambios entre ejecuciones.

## Siguiente paso recomendado

La base de control ya esta lista. El siguiente desarrollo natural seria enriquecer el asistente actual, por ejemplo:

- FAQ guiada por seccion
- chat contextual dentro del portal
- integracion con OpenAI API o Azure OpenAI
- derivacion a soporte humano

La recomendacion es mantener este mismo doble control:

- activacion tecnica por entorno
- activacion manual desde administracion
