import { useState } from 'react'
import './App.css'
import Welcome from './pages/Welcome'
import ApiUsage from './pages/ApiUsage'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome')

  return (
    <>
      {currentPage === 'welcome' && (
        <Welcome onNavigateToApiUsage={() => setCurrentPage('api-usage')} />
      )}
      {currentPage === 'api-usage' && (
        <ApiUsage onNavigateToWelcome={() => setCurrentPage('welcome')} />
      )}
    </>
  )
}

export default App
