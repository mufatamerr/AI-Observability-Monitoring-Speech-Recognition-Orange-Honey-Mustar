"""
reVoiced Backend - Simple FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "reVoiced API is running!"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
