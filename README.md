# Forné Family Office - Proyecto final

Proyecto demo en Next.js + Tailwind con:
- Landing pública de **Forné Family Office**
- Zona privada de clientes / inquilinos
- Endpoints internos `/api/me/*` con mocks
- Login demo con cookie
- Middleware para proteger `/portal`

## Arranque

```bash
npm install
npm run dev
```

## Rutas

- `/` Landing pública
- `/alquileres`
- `/contacto`
- `/login`
- `/portal`
- `/portal/contracts`
- `/portal/invoices`
- `/portal/incidents`
- `/portal/documents`
- `/portal/profile`

## Login demo

Usa cualquier email y contraseña. El login actual crea una cookie local.

## Siguientes pasos recomendados

1. Sustituir auth demo por Entra External ID.
2. Cambiar `/api/me/*` para que llamen a Business Central.
3. Conectar descarga de documentos y PDFs reales.
