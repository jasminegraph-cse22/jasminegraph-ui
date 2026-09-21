# UI API & Services Specification

**Location**: `Frontend/src/services/`
**Status**: Spec
**Date**: 2026-09-21

## 1. Overview
The Services layer acts as the single point of entry for all network requests going from the Next.js frontend to the Node.js backend. 

## 2. Core Architecture
The frontend uses **Axios** (`axios.tsx`) for API requests.
* **Interceptors**: Two main axios instances exist (`authApi` and `api`). They heavily utilize request and response interceptors.
* **Automatic Refresh**: The `api` interceptor contains complex logic to catch `401 Unauthorized` responses and automatically hit the `/backend/auth/refresh-token` endpoint, pausing other requests using a shared `refreshTokenPromise`.

## 3. Implicit Contracts & Constraints (Important for AI Agents)
* **Never use raw `fetch`**: AI agents MUST NEVER write native `fetch()` calls or raw `axios.get()` calls inside React components. All network calls must be wrapped in a service function (e.g., inside `graph-service.tsx`) and use the pre-configured Axios instances.
* **Cluster-ID Header**: The `authApi` automatically injects the `Cluster-ID` header from local storage. Agents must use `authApi` for any endpoints that require cluster context so the backend routes correctly.
* **Token Refresh Collision**: Do not attempt to write custom token refresh logic in new services, as the centralized interceptor in `axios.tsx` already handles this safely against race conditions.
