import os, pathlib
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from backend root .env (one level up from api/)
_env_loaded = load_dotenv(dotenv_path=pathlib.Path(__file__).resolve().parents[1] / '.env')
# Also try a local .env in this folder if not loaded
if not _env_loaded:
    load_dotenv(dotenv_path=pathlib.Path(__file__).resolve().parent / '.env')

def transcribe_audio():
    """Transcribe audio file (audio.mp3 or audio.wav) and return the text"""
    # Initialize client from OPENAI_API_KEY in env
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Try audio files in order: mp3, wav, webm
    script_dir = pathlib.Path(__file__).resolve().parent
    audio_path = None
    
    # Select the most recently modified available file to avoid stale picks
    candidates = []
    for ext in ['.mp3', '.wav', '.webm']:
        test_path = script_dir / f"audio{ext}"
        if os.path.exists(test_path):
            candidates.append(test_path)
    
    if not candidates:
        raise FileNotFoundError(f"Audio file not found in {script_dir}. Expected audio.mp3, audio.wav, or audio.webm")
    
    newest = max(candidates, key=lambda p: p.stat().st_mtime)
    audio_path = str(newest)
    
    # Check file size
    file_size = os.path.getsize(audio_path)
    if file_size == 0:
        raise ValueError("Audio file is empty")
    
    print(f"Transcribing: {audio_path} ({file_size} bytes)")
    
    # OpenAI SDK can accept the file path directly - simplest and most reliable
    # It will automatically detect the format from the file extension
    try:
        with open(audio_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",  # Use whisper-1 model
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"OpenAI API error: {e}")
        raise

# Allow running as script directly
if __name__ == "__main__":
    try:
        text = transcribe_audio()
        print("Transcribed text:")
        print(text)
    except Exception as e:
        print(f"Error: {e}")
