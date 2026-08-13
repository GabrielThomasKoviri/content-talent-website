# Vercel Deployment Guide

This repository contains the **Content & Talent Website Admin Dashboard** (a React + Vite TypeScript application located in `admin/website`).

Follow the steps below to host this application on Vercel.

---

## Method 1: Deploying via Vercel Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   Ensure all changes including `package.json` and `vercel.json` are committed and pushed to your repository.

2. **Log into Vercel**:
   Go to [vercel.com](https://vercel.com) and sign in.

3. **Import Project**:
   - Click **Add New...** -> **Project**.
   - Select your repository (`content-talent-website`).

4. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `admin/website` *(Recommended: Edit this field to point directly to `admin/website`)*
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)

5. **Environment Variables**:
   Under **Environment Variables**, expand the section and add the following keys if your app connects to a backend API:
   - `VITE_API_BASE_URL`: `https://your-backend-api.com` (Your production backend API URL)
   - `VITE_API_TOKEN`: `your_production_secret_token` (If applicable)
   - `VITE_AUTH0_DOMAIN`: `your-auth0-domain` (If using Auth0)
   - `VITE_AUTH0_CLIENT_ID`: `your-auth0-client-id` (If using Auth0)

6. **Deploy**:
   Click **Deploy**. Vercel will build and publish your site with a `.vercel.app` URL.

---

## Method 2: Deploying via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from Root Directory**:
   Run the following command from the root of the project:
   ```bash
   vercel
   ```
   Follow the interactive prompts:
   - Set up and deploy? **`y`**
   - Which scope? Select your account.
   - Link to existing project? **`n`**
   - Project name? `content-talent-website` (or preferred name)
   - In which directory is your code located? `./`

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## Technical Notes

- **Client-Side Routing (SPA)**: `vercel.json` contains a rewrite rule (`"source": "/(.*)", "destination": "/index.html"`) to prevent 404 errors when reloading sub-routes such as `/community` or `/content`.
- **Directory Structure**:
  - App root: `admin/website`
  - Build output: `admin/website/dist`
