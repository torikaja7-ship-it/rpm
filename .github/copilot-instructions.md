<!-- Project-specific Copilot instructions for AI coding agents -->
# Copilot instructions — rpm (concise)

Purpose: help AI agents be immediately productive in this repo by surfacing architecture, workflows, conventions, and integration points.

1) Big picture
- App: Next.js App Router under [src/app](src/app#L1) (server + client components).
- UI: `shadcn/ui` components live in [src/components/ui](src/components/ui#L1).
- Backend: small API handlers live in [src/app/api](src/app/api#L1) (use `route.ts` files).
- DB: Prisma (SQLite by default) with client helper [src/lib/db.ts](src/lib/db.ts#L1) and schema [prisma/schema.prisma](prisma/schema.prisma#L1).
- LLM / AI: uses `z-ai-web-dev-sdk` from backend code only (see skills and API handlers).

2) Key files & examples (use these as authoritative patterns)
- API pattern: [src/app/api/generate-material/route.ts](src/app/api/generate-material/route.ts#L1) — build prompt server-side, call `ZAI.create()` and return JSON.
- DB pattern: [src/lib/db.ts](src/lib/db.ts#L1) — reuse a singleton `PrismaClient` in dev to avoid multiple connections.
- Frontend example: [src/app/page.tsx](src/app/page.tsx#L1) — client component calling `/api/*` endpoints and rendering results.
- Skills: the `skills/` folder contains domain SDK examples and guidance (e.g., `skills/TTS/SKILL.md`).

3) Developer workflows (explicit commands)
- Install:
  - Preferred (README): `bun install` (project uses Bun in docs), but `npm install` / `pnpm install` also work because `package.json` has scripts.
- Dev server: `npm run dev` (runs `next dev -p 3000`) or `bun run dev` per README.
- Build: `npm run build` or `bun run build`.
- Prisma:
  - `npm run db:generate` (prisma generate)
  - `npm run db:migrate` (create dev migration)
  - `npm run db:push` (push schema to DB)
- Lint: `npm run lint`.

4) Environment & secrets
- `z-ai-web-dev-sdk` loads config from `.z-ai-config` (project root) or home `/etc` — do not commit API keys. See `.gitignore` which excludes `.z-ai-config`.
- Example envs are in `.env.local` (contains `ZAI_API_KEY` and `ZAI_BASE_URL` in this workspace). Prefer adding keys to `.z-ai-config` for SDK usage, and use `DATABASE_URL` for Prisma.

5) Project-specific conventions & gotchas
- NEVER import `z-ai-web-dev-sdk` in client-side code. Use it only in server components / API routes (see `skills/TTS/SKILL.md` and `src/app/api/*`).
- API routes return JSON with `{ success, ... }` and the frontend expects `{ success: true, content }` (see [src/app/page.tsx](src/app/page.tsx#L60)).
- `next.config.ts` sets `output: "standalone"`, `typescript.ignoreBuildErrors: true`, and `eslint.ignoreDuringBuilds: true` — builds tolerate type/lint issues.
- Use `src/components/ui` for shared UI primitives (follow existing component props and className usage).

6) When you change or add features
- Add API handlers under `src/app/api/<name>/route.ts` following `generate-material` example.
- For server-only SDKs, prefer lazy `import()` inside the handler to avoid bundling into client bundles.
- Update `prisma/schema.prisma` and run the `db:*` scripts to keep DB in sync.

7) Where to look for more context
- Root README: [README.md](README.md#L1) — project goals and recommended commands.
- Skills docs: `skills/*/SKILL.md` for SDK usage examples (search `z-ai-web-dev-sdk`).

If any section is unclear or you want more examples (API patterns, Prisma migrations, or `.z-ai-config` template), tell me which part to expand. I'll iterate.
