import { useState } from 'react'
import '../App.css'

function Welcome({ onNavigateToApiUsage }) {
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceButtonClick = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording functionality
    console.log('Voice button clicked')
  }

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">VoiceOps</h1>
        <h2 className="welcome-subtitle">AI Operations Platform</h2>
        
        <div className="description-section">
          <p className="description-intro">
            A unified AI operations platform offering centralized monitoring, alerting, and 
            accessibility management for all GenAI assets.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>📊 Monitoring & Tracking</h3>
              <p>Track latency, token usage, and user satisfaction with real-time metrics collection</p>
            </div>
            <div className="feature-card">
              <h3>🛡️ Safety Detection</h3>
              <p>Detect hallucinations and toxic outputs using advanced classifiers</p>
            </div>
            <div className="feature-card">
              <h3>📈 Visualization</h3>
              <p>Visualize outputs and anomalies via integrated Grafana dashboards</p>
            </div>
            <div className="feature-card">
              <h3>🚨 Alerting</h3>
              <p>Generate alerts for performance degradation or safety violations</p>
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
            className={`voice-button ${isRecording ? 'recording' : ''}`}
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
              <path 
                d="M11 22H13V19H11V22Z" 
                fill="currentColor"
              />
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
            {isRecording ? 'Recording...' : 'Start Recording'}
          </p>
        </div>

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
  )
}

export default Welcome

