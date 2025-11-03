import { useState, useRef, useEffect, useCallback } from "react";
import "../App.css";

function Welcome({ onNavigateToApiUsage }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      startRecording();
    } else if (
      !isRecording &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      stopRecording();
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Reset media recorder ref for next recording
        mediaRecorderRef.current = null;

        // Convert to WAV format for Whisper compatibility
        convertToWAV(audioBlob);
      };

      mediaRecorder.start();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check your permissions.");
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const convertToWAV = async (blob) => {
    try {
      // For browser, we'll create a WAV file from the recorded audio
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create WAV file
      const wavBlob = audioBufferToWAV(audioBuffer);

      // Also create downloadable versions
      const wavUrl = URL.createObjectURL(
        new Blob([wavBlob], { type: "audio/wav" })
      );

      // Store for potential Whisper processing
      setAudioBlob(new Blob([wavBlob], { type: "audio/wav" }));
    } catch (error) {
      console.error("Error converting to WAV:", error);
    }
  };

  const audioBufferToWAV = (buffer) => {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i])
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    // Note: Whisper CLI would be: whisper audio.flac audio.mp3 audio.wav --model turbo
    // Since we can't run Whisper in browser, this is a placeholder
    // In production, this would send the audio to a backend API

    // Simulate transcription (replace with actual API call when backend is ready)
    setTimeout(() => {
      setTranscription(
        "Transcription will appear here once backend Whisper integration is complete. The audio file is ready for processing."
      );
      setIsTranscribing(false);
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVoiceButtonClick = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      // Clear previous recording
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioBlob(null);
      setTranscription(null);
      setIsRecording(true);
    }
  };

  const handlePlayAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play();
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">SparkVoice</h1>
        <h2 className="welcome-subtitle">AI Operations Platform</h2>

        <div className="description-section">
          <p className="description-intro">
            A unified AI operations platform offering centralized monitoring,
            alerting, and accessibility management for all GenAI assets.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>📊 Monitoring & Tracking</h3>
              <p>
                Track latency, token usage, and user satisfaction with real-time
                metrics collection
              </p>
            </div>
            <div className="feature-card">
              <h3>🛡️ Safety Detection</h3>
              <p>
                Detect hallucinations and toxic outputs using advanced
                classifiers
              </p>
            </div>
            <div className="feature-card">
              <h3>📈 Visualization</h3>
              <p>
                Visualize outputs and anomalies via integrated Grafana
                dashboards
              </p>
            </div>
            <div className="feature-card">
              <h3>🚨 Alerting</h3>
              <p>
                Generate alerts for performance degradation or safety violations
              </p>
            </div>
          </div>

          <div className="tools-section">
            <p className="tools-label">Powered by:</p>
            <div className="tools-badges">
              <span className="tool-badge">Prometheus</span>
              <span className="tool-badge">Grafana</span>
              <span className="tool-badge">OpenTelemetry</span>
              <span className="tool-badge">FastAPI</span>
              <span className="tool-badge">Langfuse</span>
              <span className="tool-badge">Arize AI</span>
            </div>
          </div>
        </div>

        <div className="voice-button-container">
          <button
            className={`voice-button ${isRecording ? "recording" : ""}`}
            onClick={handleVoiceButtonClick}
            aria-label="Start voice recording"
          >
            <svg
              className="voice-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                fill="currentColor"
              />
              <path
                d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z"
                fill="currentColor"
              />
              <path d="M11 22H13V19H11V22Z" fill="currentColor" />
            </svg>
            {isRecording && (
              <div className="recording-pulse">
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
                <div className="pulse-ring"></div>
              </div>
            )}
          </button>
          <p className="voice-button-label">
            {isRecording
              ? `Recording... ${formatTime(recordingTime)}`
              : "Start Recording"}
          </p>
        </div>

        {/* Audio Player Section */}
        {audioUrl && (
          <div className="audio-recording-section">
            <div className="audio-card">
              <h3 className="audio-title">📼 Your Recording</h3>
              <div className="audio-player-container">
                <audio
                  ref={audioPlayerRef}
                  src={audioUrl}
                  controls
                  className="audio-player"
                />
              </div>
              <div className="audio-actions">
                <button
                  className="play-audio-button"
                  onClick={handlePlayAudio}
                  aria-label="Play audio"
                >
                  <svg
                    className="play-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                  <span>Play Recording</span>
                </button>
                <a
                  href={audioUrl}
                  download={`recording-${Date.now()}.wav`}
                  className="download-audio-button"
                >
                  <svg
                    className="download-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 15V3M12 15L8 11M12 15L16 11M2 17L2 19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21L20 21C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Download WAV</span>
                </a>
              </div>
            </div>

            {/* Transcription Section */}
            <div className="transcription-card">
              <h3 className="transcription-title">
                📝 Transcription (Whisper Turbo)
              </h3>
              {!transcription && !isTranscribing && (
                <button
                  className="transcribe-button"
                  onClick={handleTranscribe}
                  aria-label="Transcribe audio with Whisper"
                >
                  <svg
                    className="transcribe-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Transcribe with Whisper (turbo model)</span>
                </button>
              )}
              {isTranscribing && (
                <div className="transcribing-indicator">
                  <div className="loading-spinner"></div>
                  <p>Transcribing with Whisper turbo model...</p>
                </div>
              )}
              {transcription && (
                <div className="transcription-result">
                  <p className="transcription-text">{transcription}</p>
                  <p className="transcription-note">
                    Note: Full Whisper integration requires backend API. Audio
                    file format: WAV (ready for: whisper audio.wav --model
                    turbo)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          className="api-usage-nav-button"
          onClick={onNavigateToApiUsage}
          aria-label="View API usage dashboard"
        >
          <span className="button-text">View API Usage</span>
          <svg
            className="button-arrow"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Welcome;
