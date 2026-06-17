# Portal Media Experience — OneData Tenant Portal

Documento funcional y técnico para la nueva experiencia multimedia del portal del inquilino.

## Objetivo

Implementar una experiencia multimedia moderna utilizando las APIs multimedia existentes de Business Central.

## APIs existentes

### OD Portal Media Assets API
Responsable de catálogo y metadatos.

### OD Portal Media File API
Responsable del contenido multimedia en base64.

## Flujo recomendado

1. Obtener catálogo desde mediaAssets.
2. Renderizar galería.
3. Cargar imágenes bajo demanda.
4. Construir data URL con contentBase64.

## Arquitectura frontend

- src/lib/portal/media-assets.service.ts
- src/lib/portal/media-assets.types.ts
- src/app/api/portal/media/[id]/route.ts
- src/components/portal/media/MediaGallery.tsx
- src/components/portal/media/MediaCard.tsx
- src/components/portal/media/MediaViewer.tsx
- src/components/portal/media/MediaCategoryTabs.tsx
- src/app/portal/media/page.tsx

## Configuración necesaria

- `BC_MEDIA_ASSETS_ENDPOINT`
- `BC_MEDIA_FILES_ENDPOINT`

Ambos endpoints deben devolver únicamente contenido autorizable para el inquilino autenticado.

## UX requerida

- Galería responsive
- Categorías
- Modal fullscreen
- Lazy loading
- Estados vacío/error/loading

## Seguridad

- No exponer SharePoint
- Resolver inmueble desde sesión
- No permitir propertyNo manual

## Rendimiento

- No cargar todas las imágenes al inicio
- Cachear imágenes descargadas
- Cargar bajo demanda

## Resultado esperado

Nueva sección Multimedia integrada en el portal del inquilino con carga segura y moderna de imágenes.

## Estado de implementación

- catálogo multimedia filtrado por inmuebles del inquilino
- vista de galería responsive con categorías
- modal fullscreen para imágenes y PDF embebido cuando aplica
- carga segura bajo demanda a través de `/api/portal/media/[id]`
- navegación integrada en el portal
