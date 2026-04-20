# Forné Family Office - Phase 3 Lite

Base realista para pasar a integración real.

## Qué incluye
- Landing pública
- Portal privado
- Login demo y login con Entra preparado
- Middleware de protección
- `/api/me`, `/api/me/contracts`, `/api/me/invoices`, `/api/me/incidents`, `/api/me/documents`
- Cliente OAuth para Business Central
- Fallback a mocks

## Modo demo
1. Copia `.env.example` a `.env.local`
2. Deja:
   - `USE_DEMO_LOGIN=true`
   - `USE_MOCK_API=true`

## Modo real
1. `USE_DEMO_LOGIN=false`
2. `USE_MOCK_API=false`
3. Completa variables `ENTRA_*`
4. Completa variables `BC_*`

## Qué falta para producción
- Resolver el mapping usuario -> Customer No. desde BC o backend
- Implementar pantalla bonita de tablas si quieres sustituir los `pre`
- Afinar logout/sesión y errores
