# reVoiced Backend

FastAPI backend for reVoiced - AI observability platform with speech recognition.

## Features

- Real-time speech recognition using OpenAI Whisper API
- Prometheus metrics for observability
- RESTful API with health checks
- CORS enabled for frontend integration

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Run the server:

```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/v1/transcribe` - Transcribe audio file
- `GET /metrics` - Prometheus metrics

## Observability

Metrics are exposed at `/metrics` endpoint:

- `speech_requests_total` - Total requests by status
- `speech_processing_duration_seconds` - Processing time
- `audio_size_bytes` - Audio file sizes
