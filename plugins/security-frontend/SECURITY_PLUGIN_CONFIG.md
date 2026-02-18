# Security plugin – config and env vars

## Required for all environments

- **`backend.baseUrl`** – Standard Backstage config. For local dev this is already set in `app-config.yaml` (e.g. `http://localhost:7007`). The frontend and backend both use it to call the security backend and the proxy.

No extra env vars are required for the plugin to load; the Security tab will render. Grype and Qontract data will only appear when the options below are configured.

---

## Grype (main branch & deployed image scan data)

Grype data is loaded from **GitHub Actions artifacts** for repos under the `RedHatInsights` org. The backend calls the GitHub API via the Backstage proxy.

### 1. Proxy endpoint for GitHub API

In `app-config.yaml`, under `proxy.endpoints`, add (or uncomment):

```yaml
proxy:
  endpoints:
    actions:
      target: https://api.github.com
      headers:
        Authorization: Bearer ${GITHUB_TOKEN}
        Accept: application/vnd.github+json
        X-GitHub-Api-Version: "2022-11-28"
```

### 2. Environment variable

- **`GITHUB_TOKEN`** – GitHub Personal Access Token (PAT) with:
  - `repo` (for repository metadata)
  - `actions:read` or `workflow` (to list and download Actions artifacts)

Create a PAT at: GitHub → Settings → Developer settings → Personal access tokens.

### 3. How it’s used

- **Main branch**: backend calls  
  `GET /api/proxy/actions/repos/RedHatInsights/<service>/actions/artifacts`,  
  finds the latest main/master workflow run, downloads the artifact ZIP, and returns the Grype JSON.
- **Deployed**: same flow, but the artifact is chosen by matching the deployed commit SHA (from Qontract, if configured).

Catalog entities must have a repo in the `RedHatInsights` org and that repo must produce Grype scan artifacts in GitHub Actions.

---

## Qontract (optional – “current production” deployment hash)

Used to show which commit is deployed to production and to load Grype data for that deployed image.

### 1. Proxy endpoint for Qontract GraphQL

In `app-config.yaml`:

```yaml
proxy:
  endpoints:
    qontract:
      target: https://your-qontract-graphql-url/graphql
      changeOrigin: true
      # If your endpoint requires auth:
      # headers:
      #   Authorization: Bearer ${QONTRACT_TOKEN}
```

### 2. Environment variable (if auth required)

- **`QONTRACT_TOKEN`** – Only if your Qontract/App-Interface GraphQL API requires a bearer token.

### 3. Entity labels

The plugin derives the Qontract path from entity labels:

- `platform` and `service` (e.g. `metadata.labels.platform`, `metadata.labels.service`)  
  → path like `/services/<platform>/<service>/deploy.yml`

If you don’t use Qontract, the “Current production deployment” section simply won’t have data; the rest of the Security tab (e.g. main-branch Grype) can still work.

---

## Snyk (optional)

Snyk is used in the frontend (e.g. `getSnykdata.ts`). It also uses `backend.baseUrl` to call the backend. Any Snyk-specific env or proxy config would live in the same `app-config` and env vars you use for other backend calls (no extra plugin-specific Snyk config was found in the repo).

---

## Local run checklist

1. **Minimal (Security tab visible, no data)**  
   - Nothing else required; `backend.baseUrl` is already set.

2. **Grype data**  
   - Add/uncomment the `actions` proxy endpoint in `app-config.yaml`.  
   - Export `GITHUB_TOKEN` with `repo` + `actions:read`.  
   - Use components that point to `RedHatInsights/<repo>` and produce Grype artifacts in Actions.

3. **Deployed hash / Qontract**  
   - Add/uncomment the `qontract` proxy endpoint and, if needed, `QONTRACT_TOKEN`.  
   - Ensure catalog entities have the expected `platform` and `service` labels for the Qontract path.
