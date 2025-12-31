# Vercel Deployment Guide

## Prerequisites

1. **Backend Deployment**: Your FastAPI backend must be deployed separately (Vercel doesn't support long-running Python processes). Options:
   - **Railway**: https://railway.app (Recommended for Python/FastAPI)
   - **Render**: https://render.com
   - **Fly.io**: https://fly.io
   - **Heroku**: https://heroku.com
   - **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform

2. **Vercel Account**: Sign up at https://vercel.com

## Deployment Steps

### 1. Deploy Backend First

Deploy your FastAPI backend to one of the platforms above and note the URL (e.g., `https://your-backend.railway.app`).

### 2. Configure Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your deployed backend URL (e.g., `https://your-backend.railway.app`)
   - **Environment**: Production, Preview, and Development

### 3. Deploy Frontend to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd voiceops/voiceops-frontend

# Deploy
vercel

# Follow the prompts to link your project
```

#### Option B: Using GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `voiceops/voiceops-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add the `VITE_API_URL` environment variable in the project settings
6. Click **Deploy**

### 4. Verify Deployment

After deployment, your frontend will be available at `https://your-project.vercel.app`

## Troubleshooting

### 404 Errors

If you're getting 404 errors:

1. **Check `vercel.json`**: Ensure the `vercel.json` file is in the `voiceops/voiceops-frontend` directory
2. **Check Environment Variables**: Verify `VITE_API_URL` is set correctly in Vercel
3. **Check Build Output**: Ensure the build is successful and `dist` folder contains `index.html`
4. **Check Backend CORS**: Ensure your backend allows requests from your Vercel domain

### CORS Issues

If you encounter CORS errors, update your backend `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-project.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app"  # Or allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables Not Working

- Vite requires environment variables to be prefixed with `VITE_`
- After adding environment variables in Vercel, you may need to redeploy
- Check the build logs to ensure variables are being injected

## Local Development

For local development, create a `.env` file in `voiceops/voiceops-frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

## Notes

- The `vercel.json` file configures SPA routing (all routes redirect to `index.html`)
- The frontend uses environment variables that are injected at build time
- Make sure your backend is publicly accessible and not behind authentication

