# Azure Deployment Guide — EduManage Portal

This guide walks you through deploying the EduManage monorepo to Azure:

| App | Tech | Azure service |
|-----|------|---------------|
| `modern/` (frontend) | Vue 3 + Vite SPA | Azure Static Web Apps |
| `netbackend/` (backend) | ASP.NET Core | Azure App Service (Linux) |

Estimated cost on the cheapest paid tiers: **~$15–20 / month** (App Service Basic B1 + Static Web Apps Free).

---

## Prerequisites

Install these tools locally before starting:

```bash
# Azure CLI
winget install Microsoft.AzureCLI

# Verify
az --version
dotnet --version   # needs 9.0+
node --version     # needs 18+
```

Log in to Azure:

```bash
az login
```

---

## Step 1 — Code changes before deploying

### 1a. Make CORS origins configurable

`Program.cs` currently hardcodes `localhost` origins. Change it to read from configuration so you can inject the production URL without rebuilding.

Open `netbackend/src/EduManage.Api/Program.cs` and replace:

```csharp
string[] allowedOrigins = ["http://localhost:5173", "http://localhost:5091"];
```

with:

```csharp
var allowedOriginsRaw = builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:5173";
string[] allowedOrigins = allowedOriginsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
```

### 1b. Point the SQLite database to a persistent path

On Azure App Service the `/home` directory persists across restarts; everything else is ephemeral. Update `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=/home/site/data/edumanage.db"
}
```

> **Local dev**: override this in `appsettings.local.json` (already gitignored) with `Data Source=edumanage.db` to keep using the local file.

### 1c. Commit both changes

```bash
git add netbackend/src/EduManage.Api/Program.cs
git add netbackend/src/EduManage.Api/appsettings.json
git commit -m "configure CORS and SQLite path for Azure deployment"
git push
```

---

## Step 2 — Create Azure resources

Run these commands in order. Replace the placeholder values with your own.

```bash
# Variables — edit these
RESOURCE_GROUP="edumanage-rg"
LOCATION="westeurope"
APP_SERVICE_PLAN="edumanage-plan"
BACKEND_APP_NAME="edumanage-api"          # must be globally unique → becomes edumanage-api.azurewebsites.net
STATIC_APP_NAME="edumanage-frontend"      # must be globally unique

# 1. Resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. App Service plan (Linux, Basic B1 — cheapest plan that supports always-on)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# 3. Web App for the backend (.NET 9)
az webapp create \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "DOTNETCORE:9.0"

# 4. Enable persistent storage for SQLite
az webapp config appsettings set \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings WEBSITES_ENABLE_APP_SERVICE_STORAGE=true

# 5. Create the data directory
az webapp ssh --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP
# Inside the SSH session run:
#   mkdir -p /home/site/data
#   exit
```

> **Note**: The Static Web App is created in Step 5 via the Azure Portal because it needs to link to your GitHub repo interactively.

---

## Step 3 — Configure backend environment variables

Set all secrets as App Settings (these become environment variables at runtime and override `appsettings.json`):

```bash
BACKEND_APP_NAME="edumanage-api"
RESOURCE_GROUP="edumanage-rg"

az webapp config appsettings set \
  --name edumanage-api \
  --resource-group edumanage-rg \
  --settings \
    "Authentication__Auth0__Domain=dev-kg2va7y3.eu.auth0.com" \
    "Authentication__Auth0__Audience=edu-manage" \
    "Cors__AllowedOrigins=https://edumanage.azurestaticapps.net"
```

Replace:
- `YOUR_AUTH0_DOMAIN` → your Auth0 tenant domain, e.g. `dev-abc123.eu.auth0.com`
- `YOUR_AUTH0_AUDIENCE` → the API identifier in Auth0, e.g. `https://edumanage-api`
- `YOUR_STATIC_APP_NAME` → the name you'll choose in Step 5 for the Static Web App

> You can also set these in **Azure Portal → App Service → Configuration → Application settings**.

---

## Step 4 — Deploy the backend via GitHub Actions

### 4a. Get the publish profile

```bash
az webapp deployment list-publishing-profiles \
  --name edumanage-api \
  --resource-group edumanage-rg \
  --xml > publish-profile.xml
```

### 4b. Add it as a GitHub secret

1. Open your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
2. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
3. Value: paste the entire content of `publish-profile.xml`
4. Click **Add secret**

Delete the local file afterwards:
```bash
rm publish-profile.xml
```

### 4c. Create the GitHub Actions workflow

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy backend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'netbackend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Restore
        run: dotnet restore netbackend/src/EduManage.Api/EduManage.Api.csproj

      - name: Build
        run: dotnet build netbackend/src/EduManage.Api/EduManage.Api.csproj --configuration Release --no-restore

      - name: Publish
        run: dotnet publish netbackend/src/EduManage.Api/EduManage.Api.csproj --configuration Release --output ./publish --no-build

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'edumanage-api'          # ← your BACKEND_APP_NAME
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish
```

Commit and push:

```bash
git add .github/workflows/deploy-backend.yml
git commit -m "add backend Azure deployment workflow"
git push
```

The workflow runs automatically. Watch it under **GitHub → Actions**.

---

## Step 5 — Deploy the frontend via Azure Static Web Apps

Azure Static Web Apps sets up the GitHub Actions workflow for you automatically.

1. Open [portal.azure.com](https://portal.azure.com)
2. Search **Static Web Apps** → **Create**
3. Fill in:
   - **Subscription**: your subscription
   - **Resource group**: `edumanage-rg`
   - **Name**: `edumanage-frontend` (or your chosen name)
   - **Plan**: Free
   - **Region**: West Europe (or nearest)
   - **Source**: GitHub → sign in and authorise
   - **Organisation / Repository / Branch**: your repo and `main`
   - **Build presets**: Vue.js
   - **App location**: `/modern`
   - **Output location**: `dist`
4. Click **Review + create** → **Create**

Azure will automatically commit a workflow file (`.github/workflows/azure-static-web-apps-*.yml`) to your repo and trigger the first deployment. **Do not edit this file.**

After the resource is created, copy the URL shown in the overview — it looks like `https://lively-sand-0abc1234.azurestaticapps.net`.

---

## Step 6 — Set frontend environment variables

Static Web Apps environment variables are set in the portal, not in `.env` files (those are for local dev only).

1. Portal → your Static Web App → **Configuration**
2. Add these **Application settings**:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://edumanage-api.azurewebsites.net` |
| `VITE_AUTH0_DOMAIN` | your Auth0 domain |
| `VITE_AUTH0_CLIENT_ID` | your Auth0 SPA client ID |
| `VITE_RAPIDAPI_KEY` | your RapidAPI key (optional) |


3. Click **Save**
4. Re-trigger the frontend deployment so the build picks up the new variables:
   - Push any commit to `main`, **or**
   - Portal → Static Web App → **GitHub Actions runs** → re-run the latest workflow

---

## Step 7 — Update Auth0 settings

Your Auth0 application needs to know about the new production URLs.

1. Open [manage.auth0.com](https://manage.auth0.com) → your application
2. Under **Allowed Callback URLs**, add:
   ```
   https://lively-sand-0abc1234.azurestaticapps.net/callback
   ```
3. Under **Allowed Logout URLs**, add:
   ```
   https://lively-sand-0abc1234.azurestaticapps.net
   ```
4. Under **Allowed Web Origins**, add:
   ```
   https://lively-sand-0abc1234.azurestaticapps.net
   ```
5. **Save changes**

If you have an Auth0 API defined (for the backend audience), no changes are needed there.

---

## Step 8 — Update backend CORS with the real frontend URL

Now that you have the Static Web App URL, update the backend setting:

```bash
az webapp config appsettings set \
  --name edumanage-api \
  --resource-group edumanage-rg \
  --settings \
    "Cors__AllowedOrigins=https://lively-sand-0abc1234.azurestaticapps.net"
```

The App Service restarts automatically and picks up the new value.

---

## Step 9 — Verify

1. Visit your Static Web App URL in a browser — the Vue app should load.
2. Log in with Auth0.
3. Open browser DevTools → Network and confirm API calls go to `azurewebsites.net` and return 200s.
4. Check the backend logs if anything fails:
   ```bash
   az webapp log tail --name edumanage-api --resource-group edumanage-rg
   ```

---

## Ongoing deployments

After the initial setup, deployments are fully automatic:

| What changed | How it deploys |
|---|---|
| `netbackend/**` pushed to `main` | GitHub Actions `deploy-backend.yml` builds and publishes to App Service |
| `modern/**` pushed to `main` | Azure Static Web Apps workflow builds and deploys the Vite SPA |
| Any other path | Neither workflow triggers |

---

## Optional: Custom domain

### Frontend
Portal → Static Web App → **Custom domains** → **Add** → follow the CNAME/TXT validation steps.

### Backend
Portal → App Service → **Custom domains** → **Add custom domain** → add a CNAME record pointing to `edumanage-api.azurewebsites.net`.

After adding a custom domain to the backend, update `Cors__AllowedOrigins` and Auth0's Allowed Web Origins to match.

---

## Cost summary

| Resource | Tier | Approx monthly cost |
|---|---|---|
| App Service Plan (B1) | Basic | ~$13 |
| Azure Static Web Apps | Free | $0 |
| Storage (SQLite in /home) | Included with App Service | $0 |
| **Total** | | **~$13 / month** |

To reduce cost further, use **Free (F1)** App Service — but note F1 has no custom domain, no always-on, and the app sleeps after 20 minutes of inactivity (cold start on first request).
