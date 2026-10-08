# Azure Deployment Guide — EduManage Portal

This guide walks you through deploying the EduManage monorepo to Azure:

| App | Tech | Azure service |
|-----|------|---------------|
| `modern/` (frontend) | Vue 3 + Vite SPA | Azure Static Web Apps |
| `netbackend/EduManage.Api` | ASP.NET Core .NET 10 | Azure App Service (Linux) — `edumanage-api` |
| `netbackend/EduManage.Mcp` | ASP.NET Core .NET 10 MCP server | Azure App Service (Linux) — `edumanage-mcp` |
| Database | EF Core + SQL Server | Azure SQL Database (Serverless) |

Estimated cost for sporadic/demo use: **~$28–35 / month** (two App Service Basic B1 + Static Web Apps Free + Azure SQL Serverless minimum).

> **MCP architecture:** The main API (`EduManage.Api`) exposes a limited MCP endpoint at `/mcp` (exercise tools, anonymous). The standalone `EduManage.Mcp` project is a separate app with more tools (plans, workouts, clients, routines) protected by API key auth (`X-Api-Key` header).

---

## Prerequisites

```bash
winget install Microsoft.AzureCLI
az login
az --version
dotnet --version   # needs 10.0+
node --version     # needs 20+
```

---

## Step 1 — Create Azure resources

```bash
# Edit these variables
RESOURCE_GROUP="edumanage-rg"
LOCATION="westeurope"
APP_SERVICE_PLAN="edumanage-plan"
BACKEND_APP_NAME="edumanage-api"       # becomes edumanage-api.azurewebsites.net
MCP_APP_NAME="edumanage-mcp"           # becomes edumanage-mcp.azurewebsites.net
SQL_SERVER_NAME="edumanage-db"        # becomes edumanage-sql.database.windows.net
SQL_DB_NAME="edumanage"
SQL_ADMIN_USER="sqladmin"
SQL_ADMIN_PASSWORD="Dragon1234!"

# 1. Resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. App Service plan (Linux, Basic B1)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# 3. Web App for the backend (.NET 10)
az webapp create \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "DOTNETCORE:10.0"

# 3b. Web App for the MCP server (.NET 10)
az webapp create --name edumanage-mcp --resource-group edumanage-rg --plan edumanage-plan --runtime "DOTNETCORE:10.0"

# 4. Azure SQL logical server
az sql server create \
  --name $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $SQL_ADMIN_USER \
  --admin-password $SQL_ADMIN_PASSWORD

# 5. Allow Azure services to access the SQL server
az sql server firewall-rule create \
  --server $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 6. Create the Serverless database (auto-pauses after 60 min idle)
az sql db create \
  --server $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --name $SQL_DB_NAME \
  --edition GeneralPurpose \
  --family Gen5 \
  --capacity 1 \
  --compute-model Serverless \
  --auto-pause-delay 60 \
  --min-capacity 0.5

# 7. Get the ADO.NET connection string (save this — you'll need it for secrets)
az sql db show-connection-string \
  --server $SQL_SERVER_NAME \
  --name $SQL_DB_NAME \
  --client ado.net
# Replace {your_username} and {your_password} with $SQL_ADMIN_USER and $SQL_ADMIN_PASSWORD
```

> The Serverless database auto-pauses after 60 minutes of inactivity. The first request after a pause takes ~15–30 seconds to wake it. Perfect for sporadic/demo usage.

---

## Step 2 — Configure backend environment variables

Set these as App Service Application settings (they override `appsettings.json` at runtime):

```bash
az webapp config appsettings set \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "Authentication__Auth0__Domain=dev-kg2va7y3.eu.auth0.com" \
    "Authentication__Auth0__Audience=edu-manage" \
    "Cors__AllowedOrigins=https://<your-static-app>.azurestaticapps.net" \
    "ConnectionStrings__DefaultConnection=<your-ado-net-connection-string>"
```

Replace:
- `Cors__AllowedOrigins` → the URL of your Static Web App (set this after Step 5)
- `ConnectionStrings__DefaultConnection` → the full ADO.NET connection string from Step 1

> You can also set these in **Portal → App Service → Configuration → Application settings**.

### MCP server environment variables

The `EduManage.Mcp` app only needs the database connection string (it has no CORS or Auth0 config):

```bash
az webapp config appsettings set \
  --name $MCP_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "ConnectionStrings__DefaultConnection=<your-ado-net-connection-string>"
```

---

## Step 3 — Set up GitHub secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions** and add:

| Secret name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | Output of the service principal command below |
| `AZURE_SQL_CONNECTION_STRING` | Full ADO.NET connection string from Step 1 |
| `VITE_AUTH0_DOMAIN` | `dev-kg2va7y3.eu.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Your Auth0 SPA client ID |
| `VITE_AUTH0_AUDIENCE` | `edu-manage` |
| `VITE_API_BASE_URL` | `https://edumanage-api.azurewebsites.net` |
| `VITE_RAPIDAPI_KEY` | Your RapidAPI key (optional) |
| `AZURE_CLIENT_ID` | Client ID from the service principal JSON |
| `AZURE_TENANT_ID` | Tenant ID from the service principal JSON |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID |

**Create the service principal** (for backend deployment — basic auth is disabled):

```bash
az ad sp create-for-rbac \
  --name "edumanage-github" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/$RESOURCE_GROUP \
  --json-auth
```

Copy the entire JSON output and save it as the `AZURE_CREDENTIALS` secret.

---

## Step 4 — Deploy the backend

The workflow (`.github/workflows/deploy-backend.yml`) is already in the repo. It:
- Triggers on push to `main` when files under `netbackend/**` change
- Supports manual trigger via **GitHub → Actions → Run workflow**
- Builds with .NET 10, publishes, authenticates with service principal, deploys to App Service

The connection string is injected at runtime via the App Service setting set in Step 2 — the app runs `MigrateAsync()` on first boot which creates all tables automatically.

---

## Step 5 — Deploy the MCP server

The `EduManage.Mcp` project is a separate ASP.NET Core app. Create `.github/workflows/deploy-mcp.yml` in the repo:

```yaml
name: Build and deploy MCP server to Azure Web App - edumanage-mcp

on:
  push:
    branches:
      - main
    paths:
      - 'netbackend/**'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Set up .NET Core
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.x'

      - name: Cache NuGet packages
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: nuget-${{ runner.os }}-${{ hashFiles('**/packages.lock.json', '**/*.csproj') }}
          restore-keys: nuget-${{ runner.os }}-

      - name: Restore dependencies
        run: dotnet restore netbackend/EduManage.NetBackend.sln

      - name: Build with dotnet
        run: dotnet build netbackend/src/EduManage.Mcp/EduManage.Mcp.csproj --configuration Release --no-restore

      - name: dotnet publish
        run: dotnet publish netbackend/src/EduManage.Mcp/EduManage.Mcp.csproj --configuration Release --output ./publish-mcp --no-build

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: .net-mcp
          path: ./publish-mcp

  deploy:
    runs-on: ubuntu-latest
    needs: build
    permissions:
      id-token: write
      contents: read

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: .net-mcp
          path: ./publish-mcp

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'edumanage-mcp'
          slot-name: 'Production'
          package: ./publish-mcp

      - name: Restart Azure Web App
        run: az webapp restart --name edumanage-mcp --resource-group edumanage-rg
```

> The `EduManage.Mcp` app targets `net10.0`. Ensure App Service is set to the same runtime (`DOTNETCORE:10.0`) as created in Step 1.

---

## Step 6 — Update .mcp.json for production

After both apps are deployed, update `.mcp.json` (the Claude Code MCP config at the repo root) to point to production:

```json
{
  "mcpServers": {
    "edumanage-api": {
      "type": "http",
      "url": "https://edumanage-api.azurewebsites.net/mcp",
      "headers": {
        "Authorization": "Bearer <your-jwt-token>"
      }
    },
    "edumanage-mcp": {
      "type": "http",
      "url": "https://edumanage-mcp.azurewebsites.net/mcp",
      "headers": {
        "X-Api-Key": "<your-mcp-api-key>"
      }
    }
  }
}
```

**Getting an MCP API key:**
1. Log in to the frontend (`edumanage-api.azurewebsites.net`)
2. Navigate to **Settings → API Keys** (calls `POST /api/mcp-keys`)
3. Copy the key returned and paste it as the `X-Api-Key` value above

> Keep `.mcp.json` out of version control if it contains personal API keys — add it to `.gitignore`. The file in the repo uses `localhost` URLs suitable for local dev.

---

## Step 7 — Deploy the frontend via Azure Static Web Apps

1. Open [portal.azure.com](https://portal.azure.com) → **Static Web Apps** → **Create**
2. Fill in:
   - **Resource group**: `edumanage-rg`
   - **Plan**: Free
   - **Source**: GitHub → authorise → select your repo and `main` branch
   - **Build presets**: Vue.js
   - **App location**: `/modern`
   - **Output location**: `dist`
3. Click **Review + create** → **Create**

Azure commits a workflow file (`.github/workflows/azure-static-web-apps-*.yml`) to your repo automatically. The existing workflow in the repo pre-builds the frontend with Node and skips Oryx — this is the one that's actually used.

After creation, copy the URL (e.g. `https://nice-ground-040b55303.azurestaticapps.net`) and go back to Step 2 to set `Cors__AllowedOrigins`.

---

## Step 8 — Frontend environment variables

Vite bakes `VITE_*` values into the bundle **at build time**. Set them as GitHub Actions secrets (Step 3) — the workflow injects them during `npm run build:ci`.

> **Important:** Azure Static Web Apps Application settings (set in the portal) are server-side runtime variables and do NOT affect the Vite bundle. Only GitHub secrets injected during the build step matter.

---

## Step 9 — Update Auth0 settings

1. Open [manage.auth0.com](https://manage.auth0.com) → your application
2. Add your Static Web App URL to:
   - **Allowed Callback URLs**: `https://<your-app>.azurestaticapps.net/auth/callback`
   - **Allowed Logout URLs**: `https://<your-app>.azurestaticapps.net`
   - **Allowed Web Origins**: `https://<your-app>.azurestaticapps.net`
3. **Save changes**

---

## Step 10 — Verify

1. Visit your Static Web App URL — the Vue app should load.
2. Log in with Auth0.
3. Open browser DevTools → Network and confirm API calls go to `azurewebsites.net` and return 200s.
4. Check the backend health probe: `https://edumanage-api.azurewebsites.net/health`
5. Test the MCP endpoint (returns SSE stream on a valid request):
   ```bash
   curl -H "X-Api-Key: <your-key>" https://edumanage-mcp.azurewebsites.net/mcp
   ```
6. Check backend or MCP logs if anything fails:
   ```bash
   az webapp log tail --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP
   az webapp log tail --name $MCP_APP_NAME --resource-group $RESOURCE_GROUP
   ```

---

## Ongoing deployments

| What changed | How it deploys |
|---|---|
| `netbackend/**` pushed to `main` | `main_edumanage-api.yml` deploys API; `deploy-mcp.yml` deploys MCP server |
| `modern/**` pushed to `main` | Azure Static Web Apps workflow pre-builds and deploys the SPA |
| Any other path | No workflow triggers |
| Manual trigger | All workflows support **Run workflow** in GitHub Actions |

---

## Local development after switching to Azure SQL

To continue developing locally you can either:

**Option A — Keep using a local SQL Server** (Docker):
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Dev@12345!" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```
Set in `appsettings.local.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=edumanage;User Id=sa;Password=Dev@12345!;TrustServerCertificate=True;"
  }
}
```

**Option B — Connect directly to Azure SQL** (add your IP to the SQL server firewall):
```bash
az sql server firewall-rule create \
  --server $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --name MyDevMachine \
  --start-ip-address <your-ip> \
  --end-ip-address <your-ip>
```

---

## Cost summary

| Resource | Tier | Approx monthly cost |
|---|---|---|
| App Service Plan (B1) | Basic | ~$13 |
| `edumanage-api` Web App | (on shared plan above) | $0 extra |
| `edumanage-mcp` Web App | (on shared plan above) | $0 extra |
| Azure Static Web Apps | Free | $0 |
| Azure SQL Database | Serverless 1 vCore (auto-pause 60 min) | ~$5 min (near $0 when idle) |
| **Total** | | **~$18 / month** (both apps share the same B1 plan) |

> Both `edumanage-api` and `edumanage-mcp` can run on the same B1 App Service Plan at no extra cost — each is a separate Web App but shares the plan's compute.
