# Running the web app for the Preview tab

The workspace already contains the full monorepo and installed dependencies
(`node_modules` at the repo root; Next.js dev server in `apps/web`).

## Reproduce the uncommitted artifacts

1. **Env file** — `apps/web/.env.local` must exist. It is already in the
   worktree; if it is ever missing, copy it from the main checkout
   (`apps/web/.env.local`) and adapt values as needed.
2. **API URL for live data** — the storefront fetches product/branch data
   from `NEXT_PUBLIC_API_URL` (baked at server start). There is no local API
   on this machine, so for a live-data preview point it at the production
   API:

   ```
   NEXT_PUBLIC_API_URL=https://dreamgadgets.in/api/v1
   ```

   (For pure UI dev with a local API, use `http://localhost:3000/api/v1` and
   run the API from `apps/api`.)
3. No other artifacts or installs are required (`npm install` already done
   at the repo root; `npx next dev` resolves from the root `node_modules`).

## Run the web dev server (port 3001)

From `apps/web`:

```
npm run dev
```

Detached (Windows, PowerShell — used by the preview agent):

```powershell
Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' `
  -WorkingDirectory 'C:\Users\Administrator\Desktop\Dream Gadgets\apps\web' `
  -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' `
  -WindowStyle Hidden -PassThru
```

- Default port **3001** (`next dev -p 3001`). If 3001 is busy, free it or
  change the `-p` flag in `apps/web/package.json` / the dev script.
- Health check: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001`
  should return `200` once compiled.
- The preview is registered at `http://localhost:3001/`.
