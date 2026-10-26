# mihon

Read-only API for the Mihon/Keiyoushi extension. Cloudflare Worker (Hono) in the `readbagabondo` pnpm workspace, backed by D1 (`bagabondo-db`, binding `bagabondo_db`).

All routes are mounted under `/api/mihon` and trailing slashes are trimmed.

| Method | Path                                             | Notes                                      |
| ------ | ------------------------------------------------ | ------------------------------------------ |
| GET    | `/api/mihon/mangas`                              | `?q=` title filter, `?page=` (20 per page) |
| GET    | `/api/mihon/mangas/:mangaId`                     | 404 when the manga does not exist          |
| GET    | `/api/mihon/mangas/:mangaId/chapters`            | Newest first                               |
| GET    | `/api/mihon/mangas/:mangaId/chapters/:chapterId` | 404 when the chapter does not exist        |

## Commands

Run from `mihon/` (or with `pnpm --filter mihon <script>` from the repo root):

```bash
pnpm dev          # wrangler dev — local Worker with D1 emulation
pnpm build        # wrangler deploy --dry-run (validates the bundle)
pnpm deploy       # wrangler deploy --minify
pnpm cf-typegen   # regenerate CloudflareBindings types from wrangler.jsonc
```

Deploying needs a Cloudflare login (`pnpm wrangler login`). Configuration lives in `wrangler.jsonc`; the D1 binding is typed through `worker-configuration.d.ts`, which `cf-typegen` regenerates:

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

Database queries come from `@readbagabondo/db`; the Worker resolves the package's `#client` import condition to `client-workerd.ts`, so it talks to D1 instead of a local SQLite file.
