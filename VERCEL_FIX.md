# Quick Fix for 404 Error on Vercel

## The Problem
Vercel is deploying from the repository root, but your frontend code is in `voiceops/voiceops-frontend/`. This causes Vercel to not find the built files.

## Solution: Configure Root Directory in Vercel

### Step 1: Update Vercel Project Settings

1. Go to your Vercel dashboard: https://vercel.com/mufatamerrs-projects/sparkvoice
2. Click on **Settings** (in the top navigation)
3. Scroll down to **General** section
4. Find **Root Directory**
5. Click **Edit**
6. Enter: `voiceops/voiceops-frontend`
7. Click **Save**

### Step 2: Verify Build Settings

While in Settings → General, verify:
- **Framework Preset**: Should be "Vite" or "Other"
- **Build Command**: Should be `npm run build` (or empty if using vercel.json)
- **Output Directory**: Should be `dist` (or empty if using vercel.json)
- **Install Command**: Should be `npm install` (or empty)

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **three dots (⋯)** next to it
4. Click **Redeploy**
5. Wait for the build to complete

### Step 4: Verify

After redeployment, visit your site. The 404 should be gone!

## Alternative: If Root Directory Setting Doesn't Work

If the root directory setting doesn't work, you can also:

1. **Move vercel.json to root** (already done - there's now a `vercel.json` in the root)
2. **Push the changes** to GitHub
3. **Vercel will auto-deploy** with the new configuration

The root `vercel.json` file now includes:
- Build command that navigates to the frontend directory
- Output directory pointing to `voiceops/voiceops-frontend/dist`
- SPA routing configuration

## Still Having Issues?

Check the build logs:
1. Go to **Deployments** tab
2. Click on a deployment
3. Click **Build Logs**
4. Look for errors related to:
   - Missing `package.json`
   - Build failures
   - Output directory not found

If you see errors about not finding files, the root directory setting is likely not applied correctly.

