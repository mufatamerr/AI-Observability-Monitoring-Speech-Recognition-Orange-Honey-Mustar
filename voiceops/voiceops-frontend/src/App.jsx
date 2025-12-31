import { useState } from 'react'
import './App.css'
import Welcome from './pages/Welcome'
import ApiUsage from './pages/ApiUsage'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome')

  return (
    <ErrorBoundary>
      {currentPage === 'welcome' && (
        <Welcome onNavigateToApiUsage={() => setCurrentPage('api-usage')} />
      )}
      {currentPage === 'api-usage' && (
        <ApiUsage onNavigateToWelcome={() => setCurrentPage('welcome')} />
      )}
    </ErrorBoundary>
  )
}

export default App
