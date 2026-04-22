<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-custom-rules -->

# Next Level Ops agent guide

## Goal

Build a production-shaped role-based operations dashboard for a fitness studio.

## Core stack

- Next.js App Router
- TypeScript
- Supabase
- Tailwind CSS
- React Hook Form + Zod
- Jest / RTL / Playwright

## Rules

- Prefer server-first rendering.
- Use client components only for interactivity or browser APIs.
- Keep route files thin.
- Do not put business logic directly into page.tsx.
- Do not use blind `as` assertions.
- Preserve typed contracts across entity -> form -> payload -> result.
- Keep changes small and reviewable.

## Review checklist

- No auth checks only in UI.
- No unnecessary "use client".
- No repeated hardcoded styling variants across many files.
- No hidden stale-data behavior after mutations.
