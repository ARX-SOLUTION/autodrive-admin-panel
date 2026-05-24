# Auto Drive CRM — Admin Panel CLAUDE Guide

This repository is the administrative frontend for **Auto Drive CRM**. It is built with **React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui** and uses **Zustand** for auth state and **TanStack Query** for server state.

## Core goal

Keep changes minimal, aligned with existing patterns, and safe for the shared Auto Drive workspace. This file describes the conventions that should guide every edit in this repo.

## Project scope

- `autodrive-admin-panel/` is the admin web UI.
- `autodrive-backend/` is the NestJS API backend.
- `autodrive-frontend/` is the public-facing website app.

This file applies only to `autodrive-admin-panel`.

## Stack summary

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui components
- Zustand for auth/global session state
- TanStack Query for data fetching and caching
- React Hook Form + Zod for forms where used
- Axios via `src/api/axiosInstance.ts` for API communication
- Vitest for frontend tests

## Repo conventions

- `src/pages/` contains route-level pages.
- `src/components/` contains reusable UI components and layout primitives.
- `src/services/` contains API call wrappers and query/mutation hooks.
- `src/store/` contains global state; auth is the only global app state.
- `src/lib/` contains generic helpers, formatters, and utility functions.
- `src/types/` contains shared frontend types.

## Coding rules

- Do not introduce new global state stores outside `authStore` unless there is a very strong reason.
- Do not create new custom fetch hooks when `TanStack Query` is available and already in use.
- Keep components small and focused. Prefer organizing business logic in services/hooks.
- Avoid drive-by refactors. If the task does not require it, do not rename or restructure unrelated code.
- No `console.log` or temporary debugging artifacts in committed code.
- Prefer explicit typing rather than `any`.
- Use `cn()` for conditional Tailwind class composition when available.
- Keep layout and styling consistent with the repository's existing design system.

## API patterns

- Use `src/api/axiosInstance.ts` for all requests. It handles auth and request behavior.
- Do not hardcode API base URLs in components; use relative paths.
- Keep API query keys explicit and stable, e.g. `['branches', { companyId }]`.
- In mutations, disable submit buttons while pending and invalidate affected queries on success.
- Do not store server response data in Zustand unless it is truly global auth/session state.
- If you change a backend contract, update the frontend type and service code together.

## Auth / session rules

- `src/store/authStore.ts` is the single source of truth for auth state.
- Do not duplicate token or user identity data in separate stores.
- `useAuthStore` should be the only place that tracks auth state and logout.
- Do not read auth cookies or `localStorage` directly in components.

## UX and accessibility

- Provide clear feedback on loading, success, and error states.
- Use accessible labels for all form fields and actions.
- Keep buttons and inputs keyboard-accessible.
- For destructive actions, prompt the user clearly before committing.
- Keep mobile and narrow viewport usability in mind for admin pages.

## Testing and verification

- Prefer adding a small focused test for any bug fix or behavior change.
- `npm run test` should run without unrelated failures for changed files.
- `npm run lint` should pass for modified files.

## Commands

```bash
cd autodrive-admin-panel
npm install
npm run dev
npm run build
npm run lint
npm run test
```

## When in doubt

- Read the existing `src/pages/*` and `src/services/*` patterns before introducing a new page or service.
- Match existing UI and API patterns rather than inventing a new approach.
- If the task touches backend contract assumptions, verify against `autodrive-backend`.
- Keep changes minimal and directly tied to the requested scope.
