import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/health`)
      const data = await response.json()
      setMessage(`Backend Status: ${data.status}`)
    } catch (error) {
      setMessage('Error: Backend not reachable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🎤 SparkVoice</h1>
        <p>Simple Voice Recognition App</p>
      </header>

      <main>
        <div className="card">
          <button onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking...' : 'Check Backend Health'}
          </button>
          {message && <p className="message">{message}</p>}
        </div>
      </main>
    </div>
  )
}

export default App
