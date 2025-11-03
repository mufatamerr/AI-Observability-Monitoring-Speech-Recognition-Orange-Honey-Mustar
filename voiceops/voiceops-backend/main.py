"""
reVoiced Backend - Simple FastAPI application
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time
import os
from pathlib import Path
from dotenv import load_dotenv
from api.TranscribeWhisper import transcribe_audio
from api.usage_tracker import get_tracker

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Prometheus Metrics
speech_requests_total = Counter(
    'speech_requests_total',
    'Total number of speech transcription requests',
    ['endpoint', 'status']
)

speech_processing_duration_seconds = Histogram(
    'speech_processing_duration_seconds',
    'Time spent processing speech transcription requests',
    ['endpoint'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0]
)

audio_size_bytes = Histogram(
    'audio_size_bytes',
    'Size of uploaded audio files',
    buckets=[1024, 10240, 102400, 1048576, 10485760]  # 1KB, 10KB, 100KB, 1MB, 10MB
)

speech_tokens_total = Counter(
    'speech_tokens_total',
    'Total tokens used for transcription',
    ['endpoint']
)

api_requests_total = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status_code']
)

api_request_duration_seconds = Histogram(
    'api_request_duration_seconds',
    'API request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0]
)

# Initialize FastAPI app
app = FastAPI(title="reVoiced API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Usage tracking middleware with Prometheus metrics
class UsageTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        path = request.url.path
        method = request.method
        
        # Track the request
        response = await call_next(request)
        
        # Calculate latency
        duration = time.time() - start_time
        latency_ms = duration * 1000
        status_code = response.status_code
        
        # Track all API endpoints in Prometheus
        if path.startswith("/api/"):
            # Prometheus metrics
            status = 'success' if status_code < 400 else 'error'
            api_requests_total.labels(method=method, endpoint=path, status_code=str(status_code)).inc()
            api_request_duration_seconds.labels(method=method, endpoint=path).observe(duration)
            
            # Internal usage tracker (for dashboard)
            if path != "/api/v1/transcribe":
                # Transcribe endpoint tracks itself with token counts
                tracker = get_tracker()
                success = status_code < 400
                tracker.record_request(path, latency_ms, success, 0)
        
        return response

app.add_middleware(UsageTrackingMiddleware)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "reVoiced API is running!"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/api/v1/save-audio")
async def save_audio(file: UploadFile = File(...)):
    """Save uploaded audio file as audio.mp3 or audio.wav in api folder"""
    try:
        api_folder = Path(__file__).resolve().parent / "api"
        # Use original filename extension or default to .mp3
        filename = file.filename or "audio.mp3"
        # Extract extension
        ext = Path(filename).suffix.lower()
        if ext in ['.wav', '.wave']:
            audio_path = api_folder / "audio.wav"
        elif ext in ['.webm']:
            audio_path = api_folder / "audio.webm"
        else:
            audio_path = api_folder / "audio.mp3"
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Track audio size in Prometheus
        audio_size_bytes.observe(file_size)
        
        # Remove stale audio files with other extensions to avoid picking old files
        try:
            for other_ext in [".mp3", ".wav", ".webm"]:
                candidate = api_folder / f"audio{other_ext}"
                if candidate != audio_path and candidate.exists():
                    candidate.unlink(missing_ok=True)
        except Exception:
            pass
        
        # Save to audio.mp3 or audio.wav based on file type
        with open(audio_path, "wb") as f:
            f.write(content)
        
        print(f"Saved audio file: {audio_path} ({file_size} bytes, extension: {ext})")
        
        return {"message": "Audio file saved successfully", "path": str(audio_path), "size": file_size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio: {str(e)}")


@app.post("/api/v1/transcribe")
async def transcribe():
    """Run TranscribeWhisper.py script to transcribe audio.mp3 or audio.wav"""
    start_time = time.time()
    tracker = get_tracker()
    endpoint = "/api/v1/transcribe"
    
    try:
        # Start Prometheus timer
        with speech_processing_duration_seconds.labels(endpoint=endpoint).time():
            text = transcribe_audio()
        
        # Estimate tokens: ~4 characters per token for transcription
        estimated_tokens = len(text) // 4
        duration = time.time() - start_time
        
        # Prometheus metrics
        speech_requests_total.labels(endpoint=endpoint, status='success').inc()
        speech_tokens_total.labels(endpoint=endpoint).inc(estimated_tokens)
        
        # Internal usage tracker
        latency_ms = duration * 1000
        tracker.record_request(endpoint, latency_ms, True, estimated_tokens)
        
        return {"text": text, "tokens": estimated_tokens}
    except FileNotFoundError as e:
        duration = time.time() - start_time
        latency_ms = duration * 1000
        speech_requests_total.labels(endpoint=endpoint, status='error').inc()
        tracker.record_request(endpoint, latency_ms, False, 0)
        raise HTTPException(status_code=404, detail=f"Audio file not found: {str(e)}")
    except ValueError as e:
        duration = time.time() - start_time
        latency_ms = duration * 1000
        speech_requests_total.labels(endpoint=endpoint, status='error').inc()
        tracker.record_request(endpoint, latency_ms, False, 0)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        duration = time.time() - start_time
        latency_ms = duration * 1000
        speech_requests_total.labels(endpoint=endpoint, status='error').inc()
        tracker.record_request(endpoint, latency_ms, False, 0)
        import traceback
        error_detail = f"Transcription failed: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@app.get("/api/v1/usage/stats")
async def get_usage_stats():
    """Get API usage statistics"""
    tracker = get_tracker()
    return tracker.get_stats(time_range_hours=24)


@app.get("/api/v1/usage/endpoints")
async def get_endpoint_stats():
    """Get per-endpoint statistics"""
    tracker = get_tracker()
    return {"endpoints": tracker.get_endpoint_stats()}


@app.get("/api/v1/usage/activity")
async def get_recent_activity():
    """Get recent API activity"""
    tracker = get_tracker()
    return {"activity": tracker.get_recent_activity(limit=10)}
