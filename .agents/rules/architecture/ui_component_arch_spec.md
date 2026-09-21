# UI Component Architecture Specification

**Location**: `Frontend/src/app/`, `Frontend/src/components/`
**Status**: Spec
**Date**: 2026-09-21

## 1. Overview
The UI follows modern Next.js conventions, separating routing layouts from reusable UI components.

## 2. Core Architecture
* **App Router (`app/`)**: Handles the file-system based routing.
* **Client vs Server Components**: The frontend uses Next.js App Router. Components that require interactivity (hooks like `useState`, `useEffect`, or DOM events) explicitly declare `"use client";` at the top of the file.

## 3. Implicit Contracts & Constraints (Important for AI Agents)
* **"use client" Directives**: AI agents must be extremely careful not to put interactive hooks or Redux `useDispatch`/`useSelector` calls into Server Components. If a component needs state or Redux, it must have `"use client";` at the very top.
* **Component Granularity**: Do not build massive monolithic components for new Temporal GraphRAG visualizers. Break them down into smaller pieces in `src/components/` and compose them in the `app/` pages.
