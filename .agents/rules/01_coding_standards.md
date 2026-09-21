# JasmineGraph UI Coding Standards
These rules must be strictly followed by all developers and AI agents when modifying the TypeScript codebase (Frontend & Backend).

## 1. Frontend (Next.js & React)
*   **State Management**: NEVER use local state (`useState`) or Context for data that needs to be shared across pages (e.g., Graph Data, Cluster ID). Always use Redux Toolkit slices.
*   **Network Calls**: NEVER use raw `fetch()` or raw `axios.get()`. You must use the pre-configured `authApi` (from `services/axios.tsx`) to ensure Keycloak tokens and Cluster-ID headers are injected.
*   **App Router**: Respect Next.js Server Components. If a component uses hooks (`useState`, `useDispatch`), it MUST have `'use client';` at the top of the file.

## 2. Backend (Node.js & Express)
*   **Architecture**: Strict 3-tier pattern. NEVER write SQL queries in Controllers. All database access must be inside the `repository/` directory.
*   **Database**: ALWAYS use parameterized queries with the `pg` pool to prevent SQL injection.
*   **Security**: Top-level API routes (like `/clusters`) must be protected using `keycloakAuthMiddleware`. However, routes dealing with specific graph or query operations (like `/graph` and `/query`) use `clusterMiddleware` instead. Follow the existing middleware patterns in `index.ts`.

## 3. General
*   **TypeScript**: Use strict typing. Avoid `any` types; define proper interfaces for all data structures.
