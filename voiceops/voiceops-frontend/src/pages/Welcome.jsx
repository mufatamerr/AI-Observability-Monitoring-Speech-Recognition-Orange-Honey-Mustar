import { useState, useRef, useEffect } from "react";
import "../App.css";
import ASCIIText from "../components/ASCIIText";
import MagicBento from "../components/MagicBento";
import ErrorBoundary from "../components/ErrorBoundary";

function Welcome({ onNavigateToApiUsage }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const uploadedAudioPlayerRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Manage recording lifecycle
  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) startRecording();
    else if (!isRecording && mediaRecorderRef.current?.state !== "inactive")
      stopRecording();
  }, [isRecording]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error('Error stopping media recorder:', error);
        }
      }
      if (streamRef.current) {
        try {
          const tracks = streamRef.current.getTracks();
          if (tracks && tracks.length > 0) {
            tracks.forEach((t) => {
              if (t && typeof t.stop === 'function') {
                t.stop();
              }
            });
          }
          streamRef.current = null;
        } catch (error) {
          console.error('Error stopping stream tracks:', error);
        }
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl);
    };
  }, [audioUrl, uploadedFileUrl]);

  // --- File Upload Validation ---
  const validateAudioFile = (file) => {
    const allowedExtensions = [".flac", ".mp3", ".wav"];
    const allowedMimeTypes = [
      "audio/flac",
      "audio/x-flac",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
    ];

    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));
    const hasValidExtension = allowedExtensions.includes(fileExtension);
    const hasValidMimeType = allowedMimeTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
      return {
        valid: false,
        error: `Invalid file type. Only ${allowedExtensions.join(
          ", "
        )} supported.`,
      };
    }

    if (file.size > 50 * 1024 * 1024) {
      return { valid: false, error: "File exceeds 50MB limit." };
    }

    return { valid: true };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);
      setTranscription(null);
    }

    const fileUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedFileUrl(fileUrl);
    setAudioBlob(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Recording Handlers ---
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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          setAudioBlob(audioBlob);
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          if (stream) {
            try {
              stream.getTracks().forEach((t) => {
                if (t && typeof t.stop === 'function') {
                  t.stop();
                }
              });
            } catch (error) {
              console.error('Error stopping stream tracks:', error);
            }
          }
          streamRef.current = null;
          mediaRecorderRef.current = null;
          convertToWAV(audioBlob);
        } catch (error) {
          console.error('Error in mediaRecorder.onstop:', error);
        }
      };

      mediaRecorder.start();
      timerRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000
      );
    } catch (error) {
      console.error("Mic access error:", error);
      alert("Error accessing microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
    clearInterval(timerRef.current);
  };

  // --- Convert recorded audio to WAV ---
  const convertToWAV = async (blob) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const wavBlob = new Blob([audioBufferToWAV(audioBuffer)], {
        type: "audio/wav",
      });
      setAudioBlob(wavBlob);
    } catch (err) {
      console.error("Error converting to WAV:", err);
    }
  };

  const audioBufferToWAV = (buffer) => {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const numChannels = buffer.numberOfChannels;
    const bufferSize = 44 + length * numChannels * 2;
    const view = new DataView(new ArrayBuffer(bufferSize));

    const writeString = (offset, str) =>
      [...str].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * numChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return view.buffer;
  };

  // --- Transcription Simulation ---
  const handleTranscribe = () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setTimeout(() => {
      setTranscription(
        "Simulated transcription. Actual Whisper turbo integration requires backend API."
      );
      setIsTranscribing(false);
    }, 2000);
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleVoiceButtonClick = () => {
    if (isRecording) setIsRecording(false);
    else {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (uploadedFileUrl) {
        URL.revokeObjectURL(uploadedFileUrl);
        setUploadedFile(null);
        setUploadedFileUrl(null);
      }
      setAudioBlob(null);
      setTranscription(null);
      setUploadError(null);
      setIsRecording(true);
    }
  };

  const handlePlayAudio = () => audioPlayerRef.current?.play();
  const handlePlayUploadedAudio = () => uploadedAudioPlayerRef.current?.play();
  const handleClearUploaded = () => {
    if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl);
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setAudioBlob(null);
    setTranscription(null);
    setUploadError(null);
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-title-wrapper">
          <ErrorBoundary>
            <ASCIIText
              text="VoiceOps"
              enableWaves
              asciiFontSize={8}
              textFontSize={240}
              textColor="#FF6B35"
              planeBaseHeight={12}
            />
          </ErrorBoundary>
        </div>
        <h2 className="welcome-subtitle">AI Operations Platform</h2>

        <div className="description-section">
          <p className="description-intro">
            A unified AI operations platform offering centralized monitoring,
            alerting, and accessibility for all GenAI assets.
          </p>
          <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
            <ErrorBoundary>
              <MagicBento
                enableStars
                enableSpotlight
                enableBorderGlow
                enableTilt
                enableMagnetism
                clickEffect
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* AUDIO CONTROLS */}
        <div className="audio-input-section">
          <div className="voice-button-container">
            <button
              className={`voice-button ${isRecording ? "recording" : ""}`}
              onClick={handleVoiceButtonClick}
              disabled={!!uploadedFile}
            >
              🎙️
            </button>
            <p className="voice-button-label">
              {isRecording
                ? `Recording... ${formatTime(recordingTime)}`
                : "Start Recording"}
            </p>
          </div>

          <div className="upload-divider">
            <span>OR</span>
          </div>

          <div className="upload-button-container">
            <input
              ref={fileInputRef}
              type="file"
              accept=".flac,.mp3,.wav,audio/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording}
            >
              ⬆️ Upload Audio File
            </button>
            {uploadError && (
              <p className="upload-error-message">{uploadError}</p>
            )}
          </div>
        </div>

        {/* Uploaded or Recorded Sections */}
        {uploadedFileUrl && (
          <div className="audio-recording-section">
            <h3>📁 Uploaded Audio: {uploadedFile.name}</h3>
            <audio
              ref={uploadedAudioPlayerRef}
              src={uploadedFileUrl}
              controls
            />
            <button onClick={handlePlayUploadedAudio}>▶️ Play</button>
            <button onClick={handleClearUploaded}>❌ Clear</button>
          </div>
        )}

        {audioUrl && !uploadedFileUrl && (
          <div className="audio-recording-section">
            <h3>📼 Your Recording</h3>
            <audio ref={audioPlayerRef} src={audioUrl} controls />
            <button onClick={handlePlayAudio}>▶️ Play</button>
            <a href={audioUrl} download={`recording-${Date.now()}.wav`}>
              💾 Download WAV
            </a>
          </div>
        )}

        {(audioBlob || uploadedFileUrl) && (
          <div className="transcription-card">
            <h3>📝 Transcription (Whisper Turbo)</h3>
            {!transcription && !isTranscribing && (
              <button onClick={handleTranscribe}>
                Transcribe with Whisper
              </button>
            )}
            {isTranscribing && <p>⏳ Transcribing...</p>}
            {transcription && (
              <p className="transcription-text">{transcription}</p>
            )}
          </div>
        )}

        <button className="api-usage-nav-button" onClick={onNavigateToApiUsage}>
          View API Usage →
        </button>
      </div>
    </div>
  );
}

export default Welcome;
