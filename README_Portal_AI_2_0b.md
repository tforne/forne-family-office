# Portal AI 2.0b — Dynamic Portal Runtime Integration

## Overview

Portal AI 2.0b connects the OneData Tenant Portal to the new Business Central multi-agent runtime implemented inside OneData AI Layer.

The portal must continue to feel like a single assistant:

```text
OneData Assistant
```

But internally it must now support:

```text
Intent Detection
↓
Dynamic Agent Routing
↓
Governance Validation
↓
Dynamic Prompt Resolution
↓
Dynamic Deployment Resolution
↓
Safe Fallback
```

This sprint introduces the first true runtime integration between:

- Portal AI
- OneData AI Layer
- Business Central AI Governance
- Dynamic Multi-Agent Routing

---

# Goals

## Main Goal

Replace the current fixed-agent AI runtime with:

```text
dynamic multi-agent runtime resolution
```

based on:

- detected intent
- portal action
- governance rules
- Business Central configuration

---

# Required New Services

Create:

```text
src/lib/portal/ai-agent-runtime.service.ts
```

Purpose:

- resolve the correct AI runtime dynamically
- load runtime config
- support BC-first resolution
- support safe local fallback

---

# Local Fallback Mapping

## Operations

```text
maintenance_incident
urgent_incident
```

→ `OD-OPERATIONS`

## Accounting

```text
invoice_question
payment_question
```

→ `OD-ACCOUNTING`

## Contract

```text
contract_question
document_request
```

→ `OD-CONTRACT`

## Tenant

```text
support_request
general_chat
```

→ `OD-TENANT`

## Governance

Unsafe requests:

```text
unsafe_request
delete_data
bypass_permissions
other_tenant_data
```

→ `OD-GOVERNANCE`

---

# Final Goal

The portal must continue to feel like:

```text
OneData Assistant
```

But internally it must now operate as:

```text
single visible assistant
+
dynamic internal agent routing
+
Business Central runtime governance
+
safe operational filtering
+
fallback-safe AI runtime
```
