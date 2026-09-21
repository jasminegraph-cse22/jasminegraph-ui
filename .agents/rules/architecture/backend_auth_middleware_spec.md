# Backend Auth & Middleware Specification

**Location**: `Backend/src/middleware/` & `Keycloak/`
**Status**: Spec
**Date**: 2026-09-21

## 1. Overview
Security is handled at the gateway level in the Node.js backend using Keycloak as the Identity Provider (IdP).

## 2. Core Architecture
* **Keycloak Middleware (`keycloak.middleware.ts`)**: Uses `express-jwt` and `jwks-rsa` to validate JWT Access Tokens.
* **Validation**: It fetches the public JSON Web Key Set (JWKS) directly from the Keycloak server (`http://keycloak:8080/...`) to cryptographically verify signatures, ensuring the token wasn't tampered with.

## 3. Implicit Contracts & Constraints (Important for AI Agents)
* **Route Protection**: When an AI agent creates a new route in `Backend/src/routes/` for Temporal GraphRAG data, it MUST attach the `keycloakAuthMiddleware` to the route definition.
* **Silent Failures**: If the Keycloak server goes down, the middleware will fail to fetch the JWKS cache and reject all requests. Agents debugging "401 Unauthorized" issues should first verify the Keycloak container health before assuming the frontend token logic is broken.
