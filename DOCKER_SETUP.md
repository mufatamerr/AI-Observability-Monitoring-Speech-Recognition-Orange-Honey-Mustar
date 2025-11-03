# Docker Setup Guide

## Quick Start

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Set your OpenAI API Key**

   **Option A: Environment Variable (Recommended)**
   ```powershell
   $env:OPENAI_API_KEY="your-api-key-here"
   ```

   **Option B: Create .env file in project root**
   ```bash
   # Create .env file in the root directory
   OPENAI_API_KEY=your-api-key-here
   ```
   Then update docker-compose.yml to use:
   ```yaml
   env_file:
     - .env
   ```

3. **Run Docker Compose**
   ```powershell
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)

## Troubleshooting

**Check if services are running:**
```powershell
docker compose ps
```

**View logs:**
```powershell
docker compose logs -f
```

**Stop services:**
```powershell
docker compose down
```

**Rebuild containers:**
```powershell
docker compose up -d --build
```

