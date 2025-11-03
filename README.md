# 🎤 SparkVoice

**SparkVoice** is a DevOps-powered AI observability platform that integrates speech recognition and accessibility features to assist users (including those with Parkinson's) in monitoring and interacting with AI systems through voice.

Built during the **Canada DevOps Gen AI Hackathon 2025**, SparkVoice demonstrates how DevOps + GenAI can converge for inclusivity, transparency, and automation.

## 🧩 Features

✅ **Real-time voice recognition** using OpenAI Whisper API  
✅ **FastAPI backend** for processing & logging audio  
✅ **React 19.2 frontend** with live transcription + metrics view  
✅ **Integrated Prometheus + Grafana dashboards** for observability  
✅ **Dockerized deployment** with CI/CD via GitHub Actions  
✅ **Accessible UX** designed for Parkinson's use case  

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API Key (for speech recognition)
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Observability-Monitoring-Speech-Recognition-Orange-Honey-Mustar
   ```

2. **Set up environment variables**
   ```bash
   cp voiceops/voiceops-backend/.env.example voiceops/voiceops-backend/.env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Start all services**
   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)

### Local Development

#### Backend

```bash
cd voiceops/voiceops-backend
pip install -r requirements.txt
python main.py
```

#### Frontend

```bash
cd voiceops/voiceops-frontend
npm install
npm run dev
```

## 📁 Project Structure

```
.
├── voiceops/
│   ├── voiceops-backend/      # FastAPI backend
│   │   ├── main.py            # Main application
│   │   ├── requirements.txt   # Python dependencies
│   │   └── Dockerfile         # Backend container
│   └── voiceops-frontend/     # React frontend
│       ├── src/               # Source code
│       ├── package.json       # Node dependencies
│       └── Dockerfile         # Frontend container
├── monitoring/
│   ├── prometheus/            # Prometheus configuration
│   └── grafana/               # Grafana dashboards
├── docker-compose.yml         # Service orchestration
└── .github/workflows/         # CI/CD pipelines
```

## 🔌 API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/v1/transcribe` - Transcribe audio file
- `GET /metrics` - Prometheus metrics

See full API documentation at `/docs` when the backend is running.

## 📊 Observability

### Prometheus Metrics

- `speech_requests_total` - Total requests by status (success/error)
- `speech_processing_duration_seconds` - Processing time histogram
- `audio_size_bytes` - Audio file size distribution

### Grafana Dashboards

Access the pre-configured SparkVoice dashboard at:
- Grafana URL: http://localhost:3001
- Login: admin/admin
- Dashboard: SparkVoice - AI Observability Dashboard

## 🧪 Testing

### Run Tests Locally

```bash
# Backend tests
cd voiceops/voiceops-backend
pytest

# Frontend linting
cd voiceops/voiceops-frontend
npm run lint
```

### CI/CD

The project includes GitHub Actions workflows for:
- Linting (Python and JavaScript)
- Building Docker images
- Running tests
- Docker Compose integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project was created for the Canada DevOps Gen AI Hackathon 2025.

## 👥 Team

**Team Orange Honey Mustard**

- **Team Leads**: Hassan Nabil, Zain Rajpar
- **Team Members**: Hadi Khan, Mustafa Tamer, Ahmad Ayoub
- **Mentor**: Gurtej Pal Singh

## 🙏 Acknowledgments

Built with accessibility in mind for users with Parkinson's disease and other motor impairments. Special focus on:
- Large, easy-to-click buttons
- Clear visual feedback
- Voice-first interaction
- Comprehensive observability

---

**Built for Canada DevOps Gen AI Hackathon 2025** 🚀
