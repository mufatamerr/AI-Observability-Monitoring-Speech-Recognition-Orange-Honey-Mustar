import { useState, useRef, useEffect } from "react";
import "../App.css";
import ASCIIText from "../components/ASCIIText";
import MagicBento from "../components/MagicBento";
import ErrorBoundary from "../components/ErrorBoundary";
import MagicButton from "../components/MagicButton";
import Hyperspeed from "../components/Hyperspeed";

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
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  const mediaRecorderRef = useRef(null);
  const downloadDropdownRef = useRef(null);
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

  const handlePlayUploadedAudio = () => uploadedAudioPlayerRef.current?.play();
  const handleClearUploaded = () => {
    if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl);
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setAudioBlob(null);
    setTranscription(null);
    setUploadError(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target)) {
        setShowDownloadDropdown(false);
      }
    };

    if (showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadDropdown]);

  const handleDownload = async (format) => {
    if (!audioBlob) return;
    
    setShowDownloadDropdown(false);
    
    let fileBlob = audioBlob;
    let filename = `recording-${Date.now()}`;
    
    if (format === 'wav') {
      filename += '.wav';
      fileBlob = audioBlob;
    } else if (format === 'mp3') {
      filename += '.mp3';
      // Note: The actual encoding is still WAV (since browser doesn't support MP3 encoding natively),
      // but the file will have .mp3 extension. For true MP3 encoding, a backend service would be needed.
      fileBlob = audioBlob;
    }
    
    try {
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDownloadUploaded = async (format) => {
    if (!uploadedFile) return;
    
    setShowDownloadDropdown(false);
    
    let fileBlob = uploadedFile;
    let filename = uploadedFile.name;
    
    // Remove existing extension
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    
    if (format === 'wav') {
      if (!filename.toLowerCase().endsWith('.wav')) {
        filename = `${nameWithoutExt}.wav`;
      }
    } else if (format === 'mp3') {
      if (!filename.toLowerCase().endsWith('.mp3')) {
        filename = `${nameWithoutExt}.mp3`;
      }
      // Note: The actual encoding is still the original format (since browser doesn't support MP3 encoding natively),
      // but the file will have .mp3 extension. For true MP3 conversion, a backend service would be needed.
    }
    
    try {
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading uploaded file:', error);
    }
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
            <MagicButton
              className={`voice-button ${isRecording ? "recording" : ""}`}
              onClick={handleVoiceButtonClick}
              disabled={!!uploadedFile}
              particleCount={8}
              enableTilt={false}
              enableMagnetism={false}
            >
              🎙️
            </MagicButton>
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
            <MagicButton
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording}
              particleCount={6}
            >
              ⬆️ Upload Audio File
            </MagicButton>
            {uploadError && (
              <p className="upload-error-message">{uploadError}</p>
            )}
          </div>
        </div>

        {/* Uploaded or Recorded Sections */}
        {uploadedFileUrl && (
          <div className="audio-recording-section">
            <h3 className="audio-title">📁 Uploaded Audio: {uploadedFile.name}</h3>
            <div className="audio-player-container">
              <audio
                ref={uploadedAudioPlayerRef}
                src={uploadedFileUrl}
                controls
                className="audio-player"
              />
            </div>
            <div className="audio-actions">
              <div className="download-dropdown-container" ref={downloadDropdownRef}>
                <MagicButton
                  className="download-audio-button"
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  particleCount={5}
                >
                  <span className="download-icon">⬇</span>
                  <span>Download</span>
                  <span className="dropdown-arrow">▼</span>
                </MagicButton>
                {showDownloadDropdown && (
                  <div className="download-dropdown-menu">
                    <MagicButton
                      className="download-dropdown-item"
                      onClick={() => handleDownloadUploaded('wav')}
                      particleCount={3}
                      enableTilt={false}
                    >
                      <span>WAV</span>
                      <span className="file-format-badge">.wav</span>
                    </MagicButton>
                    <MagicButton
                      className="download-dropdown-item"
                      onClick={() => handleDownloadUploaded('mp3')}
                      particleCount={3}
                      enableTilt={false}
                    >
                      <span>MP3</span>
                      <span className="file-format-badge">.mp3</span>
                    </MagicButton>
                  </div>
                )}
              </div>
              <MagicButton 
                className="clear-uploaded-button"
                onClick={handleClearUploaded}
                particleCount={5}
              >
                <span className="clear-icon">✕</span>
                <span>Clear</span>
              </MagicButton>
            </div>
          </div>
        )}

        {audioUrl && !uploadedFileUrl && (
          <div className="audio-recording-section">
            <h3 className="audio-title">📼 Your Recording</h3>
            <div className="audio-player-container">
              <audio ref={audioPlayerRef} src={audioUrl} controls className="audio-player" />
            </div>
            <div className="audio-actions">
              <div className="download-dropdown-container" ref={downloadDropdownRef}>
                <MagicButton
                  className="download-audio-button"
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  particleCount={5}
                >
                  <span className="download-icon">⬇</span>
                  <span>Download</span>
                  <span className="dropdown-arrow">▼</span>
                </MagicButton>
                {showDownloadDropdown && (
                  <div className="download-dropdown-menu">
                    <MagicButton
                      className="download-dropdown-item"
                      onClick={() => handleDownload('wav')}
                      particleCount={3}
                      enableTilt={false}
                    >
                      <span>WAV</span>
                      <span className="file-format-badge">.wav</span>
                    </MagicButton>
                    <MagicButton
                      className="download-dropdown-item"
                      onClick={() => handleDownload('mp3')}
                      particleCount={3}
                      enableTilt={false}
                    >
                      <span>MP3</span>
                      <span className="file-format-badge">.mp3</span>
                    </MagicButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(audioBlob || uploadedFileUrl) && (
          <div className="transcription-card">
            <Hyperspeed
              effectOptions={{
                distortion: 'turbulentDistortion',
                length: 400,
                roadWidth: 10,
                islandWidth: 2,
                lanesPerRoad: 4,
                fov: 90,
                fovSpeedUp: 150,
                speedUp: 2,
                carLightsFade: 0.4,
                totalSideLightSticks: 20,
                lightPairsPerRoadWay: 40,
                shoulderLinesWidthPercentage: 0.05,
                brokenLinesWidthPercentage: 0.1,
                brokenLinesLengthPercentage: 0.5,
                lightStickWidth: [0.12, 0.5],
                lightStickHeight: [1.3, 1.7],
                movingAwaySpeed: [60, 80],
                movingCloserSpeed: [-120, -160],
                carLightsLength: [400 * 0.03, 400 * 0.2],
                carLightsRadius: [0.05, 0.14],
                carWidthPercentage: [0.3, 0.5],
                carShiftX: [-0.8, 0.8],
                carFloorSeparation: [0, 5],
                colors: {
                  roadColor: 0x1a1a1a,
                  islandColor: 0x2d2d2d,
                  background: 0x000000,
                  shoulderLines: 0xFFC857,
                  brokenLines: 0xFFC857,
                  leftCars: [0xFF6B35, 0xF7931E, 0xFFC857],
                  rightCars: [0xF7931E, 0xFFC857, 0xFF6B35],
                  sticks: 0xFFC857
                }
              }}
              onHover={true}
            />
            <div className="transcription-content">
              {!transcription && !isTranscribing && (
                <MagicButton 
                  className="transcribe-button"
                  onClick={handleTranscribe}
                  particleCount={6}
                >
                  Transcribe with Whisper
                </MagicButton>
              )}
              {isTranscribing && <p>⏳ Transcribing...</p>}
              {transcription && (
                <p className="transcription-text">{transcription}</p>
              )}
            </div>
          </div>
        )}

        <MagicButton 
          className="api-usage-nav-button" 
          onClick={onNavigateToApiUsage}
          particleCount={8}
        >
          <span className="button-text">View API Usage →</span>
        </MagicButton>
      </div>
    </div>
  );
}

export default Welcome;
