
import os
from openai import OpenAI

# Initialize client with placeholder; replace with your team key locally
client = OpenAI(api_key="YOUR_API_KEY")

# Path to your audio file (e.g., .mp3, .wav, .m4a)
audio_path = "audio.mp3"

# Open the file in binary mode
with open(audio_path, "rb") as audio_file:
    # Send to Whisper model
    transcript = client.audio.transcriptions.create(
        model="gpt-4o-mini-transcribe",  # Whisper model
        file=audio_file
    )

# Print the transcribed text
print("Transcribed text:")
print(transcript.text)
