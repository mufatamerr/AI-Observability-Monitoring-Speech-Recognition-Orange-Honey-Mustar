# 🎤 SparkVoice

A DevOps-powered AI observability platform for speech recognition with real-time monitoring and accessibility features.

Built for **Canada DevOps Gen AI Hackathon 2025** by Team Orange Honey Mustard.

## 📋 Prerequisites

### Required
- **Python 3.11+** - Backend runtime
- **Node.js 20+** - Frontend build tool
- **OpenAI API Key** - For speech-to-text transcription

### Optional (for Docker)
- **Docker Desktop** - For containerized deployment
- **Docker Compose** - Included with Docker Desktop

## 🚀 Running the Project

### Method 1: Local Development (Recommended)

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd voiceops/voiceops-backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   Or with Python 3.11 specifically:
   ```bash
   py -3.11 -m pip install -r requirements.txt
   ```

3. **Create environment file**
   ```bash
   # Create .env file in voiceops/voiceops-backend/
   OPENAI_API_KEY=your-api-key-here
   ```

4. **Start the backend server**
   ```bash
   py -3.11 -m uvicorn main:app --reload --port 8000
   ```
   
   Backend will be available at: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Metrics: http://localhost:8000/metrics
   - Health: http://localhost:8000/health

#### Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd voiceops/voiceops-frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev -- --port 3001
   ```
   
   Frontend will be available at: http://localhost:3001

### Method 2: Docker Compose

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Start Docker Desktop

2. **Set up environment file**
   - Ensure `voiceops/voiceops-backend/.env` exists with:
     ```
     OPENAI_API_KEY=your-api-key-here
     ```

3. **Run Docker Compose**
   ```bash
   docker compose up -d
   ```

4. **Access the services**
   - Frontend: http://localhost:3002
   - Backend: http://localhost:8000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)

5. **Stop services**
   ```bash
   docker compose down
   ```

## 📦 Dependencies

### Backend Dependencies (`voiceops/voiceops-backend/requirements.txt`)

- `fastapi==0.115.0` - Web framework
- `uvicorn[standard]==0.32.0` - ASGI server
- `pydantic>=2.0.0` - Data validation
- `prometheus-client>=0.20.0` - Prometheus metrics
- `python-multipart>=0.0.6` - File uploads
- `openai>=1.12.0` - OpenAI API client
- `python-dotenv>=1.0.0` - Environment variables

### Frontend Dependencies (`voiceops/voiceops-frontend/package.json`)

Managed by npm, run `npm install` in the frontend directory to install all dependencies.

## 🔌 API Endpoints

- `POST /api/v1/save-audio` - Save uploaded audio file
- `POST /api/v1/transcribe` - Transcribe audio to text
- `GET /api/v1/usage/stats` - Get usage statistics
- `GET /api/v1/usage/endpoints` - Get endpoint statistics
- `GET /api/v1/usage/activity` - Get recent activity
- `GET /metrics` - Prometheus metrics
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## 📊 Project Structure

```
.
├── voiceops/
│   ├── voiceops-backend/          # FastAPI backend
│   │   ├── main.py                # Main application
│   │   ├── requirements.txt      # Python dependencies
│   │   ├── .env                   # Environment variables (create this)
│   │   └── api/
│   │       ├── TranscribeWhisper.py  # Whisper integration
│   │       └── usage_tracker.py      # Usage tracking
│   └── voiceops-frontend/        # React frontend
│       ├── package.json           # Node dependencies
│       └── src/
│           ├── pages/             # Main pages
│           └── components/       # React components
├── monitoring/
│   ├── prometheus/               # Prometheus configuration
│   └── grafana/                  # Grafana dashboards
├── docker-compose.yml            # Docker orchestration
└── README.md                     # This file
```

## 🛠️ Troubleshooting

### Backend Issues

**Port already in use:**
- Change port: `uvicorn main:app --reload --port 8001`
- Or kill process using port 8000

**Missing dependencies:**
- Reinstall: `pip install -r requirements.txt`

**API key not working:**
- Verify `.env` file exists in `voiceops/voiceops-backend/`
- Check API key is correct and has no extra spaces

### Frontend Issues

**Port already in use:**
- Change port: `npm run dev -- --port 3002`

**Dependencies not installing:**
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Docker Issues

**Docker not starting:**
- Ensure Docker Desktop is running
- Check Docker service status

**Containers not building:**
- Rebuild: `docker compose up -d --build`

**View logs:**
- `docker compose logs -f` - All services
- `docker compose logs backend` - Backend only
- `docker compose logs frontend` - Frontend only

## 👥 Team

**Team Orange Honey Mustard**

- **Team Leads**: Hassan Nabil, Zain Rajpar
- **Team Members**: Hadi Khan, Mustafa Tamer, Ahmad Ayoub
- **Mentor**: Gurtej Pal Singh

---

**Built for Canada DevOps Gen AI Hackathon 2025** 🚀
