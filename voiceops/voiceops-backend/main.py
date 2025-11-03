"""
SparkVoice Backend - FastAPI application for speech recognition and observability
"""
import os
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    logger.warning("OPENAI_API_KEY not set. Speech recognition will not work.")

# Initialize FastAPI app
app = FastAPI(
    title="SparkVoice API",
    description="DevOps-powered AI observability platform with speech recognition",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
speech_requests_total = Counter(
    'speech_requests_total',
    'Total number of speech recognition requests',
    ['status']
)

speech_processing_duration = Histogram(
    'speech_processing_duration_seconds',
    'Time spent processing speech recognition requests',
    ['status']
)

audio_size_bytes = Histogram(
    'audio_size_bytes',
    'Size of audio files uploaded',
    buckets=[1024, 10240, 102400, 1048576, 10485760]  # 1KB to 10MB
)


# Response models
class TranscriptionResponse(BaseModel):
    text: str
    model: str
    processing_time: float
    audio_size: int


class HealthResponse(BaseModel):
    status: str
    version: str
    openai_configured: bool


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "SparkVoice API - DevOps-powered AI observability platform",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "transcribe": "/api/v1/transcribe",
            "metrics": "/metrics"
        }
    }


@app.get("/health", tags=["Health"], response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        openai_configured=bool(openai.api_key)
    )


@app.post("/api/v1/transcribe", tags=["Speech Recognition"], response_model=TranscriptionResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio file using OpenAI Whisper API
    
    Accepts audio files (mp3, wav, m4a, webm, etc.)
    Returns transcribed text with observability metrics
    """
    import time
    start_time = time.time()
    
    try:
        # Validate file
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an audio file"
            )
        
        # Read audio file
        audio_data = await audio.read()
        audio_size = len(audio_data)
        
        # Record audio size metric
        audio_size_bytes.observe(audio_size)
        
        logger.info(f"Processing audio file: {audio.filename}, size: {audio_size} bytes")
        
        # Check OpenAI API key
        if not openai.api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key not configured"
            )
        
        # Create temporary file for OpenAI API
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[1]) as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name
        
        try:
            # Call OpenAI Whisper API
            with open(tmp_file_path, "rb") as audio_file:
                transcript = openai.Audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            processing_time = time.time() - start_time
            
            # Record success metrics
            speech_requests_total.labels(status='success').inc()
            speech_processing_duration.labels(status='success').observe(processing_time)
            
            logger.info(f"Transcription successful: {len(transcript)} characters, time: {processing_time:.2f}s")
            
            return TranscriptionResponse(
                text=transcript.strip(),
                model="whisper-1",
                processing_time=round(processing_time, 3),
                audio_size=audio_size
            )
        
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
    
    except openai.error.OpenAIError as e:
        processing_time = time.time() - start_time
        speech_requests_total.labels(status='error').inc()
        speech_processing_duration.labels(status='error').observe(processing_time)
        
        logger.error(f"OpenAI API error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(e)}"
        )
    
    except Exception as e:
        processing_time = time.time() - start_time
        speech_requests_total.labels(status='error').inc()
        speech_processing_duration.labels(status='error').observe(processing_time)
        
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/metrics", tags=["Observability"])
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

