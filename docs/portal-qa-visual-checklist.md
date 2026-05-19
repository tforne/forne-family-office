# Portal QA Visual Checklist

Fecha de revisión: 2026-05-19

## Alcance

Revisión visual y de consistencia del portal privado y paneles de administración a nivel de código.

## Checklist general

- [x] Shell del portal coherente entre desktop y móvil.
- [x] Jerarquía visual consistente entre home, listados y detalle.
- [x] Estados `loading`, `error` y `empty` homogéneos.
- [x] Tablas con hint de scroll en móvil cuando aplica.
- [x] Formularios con inputs y botones consistentes.
- [x] Chat flotante adaptado a viewport estrecho.
- [x] Acceso `/login` alineado con el lenguaje visual del portal.
- [x] Paneles de administración alineados con el resto del producto.

## Páginas revisadas

### Portal

- [x] `/portal`
- [x] `/portal/notices`
- [x] `/portal/invoices`
- [x] `/portal/invoices/[id]`
- [x] `/portal/incidents`
- [x] `/portal/incidents/[id]`
- [x] `/portal/incident-requests`
- [x] `/portal/documents`
- [x] `/portal/contracts`
- [x] `/portal/profile`
- [x] `/portal/loading`
- [x] `/portal/error`

### Administración

- [x] `/portal/admin/users`
- [x] `/portal/admin/news`
- [x] `/portal/admin/chat`
- [x] `/portal/admin/featured-assets`

### Acceso

- [x] `/login`

## Observaciones finales

- El sistema visual del portal ya está bastante cohesionado entre home, listados, detalle y administración.
- La principal validación pendiente ya no es de código sino de navegador real: comprobar densidad, scroll horizontal de tablas y percepción visual en móvil estrecho.
- Persisten mensajes de build por `Dynamic server usage` en rutas que usan `cookies`, pero no forman parte de la QA visual.

## Siguiente validación recomendada

1. Revisar en navegador real `375px`, `768px`, `1280px` y `1536px`.
2. Comprobar estados con datos largos: emails, descripciones y mensajes de error.
3. Validar foco visible y navegación por teclado en chat, diálogos y formularios.
