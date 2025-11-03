import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
} else {
  try {
    const root = createRoot(rootElement)
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1a;
        color: #ffffff;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
      ">
        <h1 style="color: #FF6B35;">Failed to load application</h1>
        <p>${error.message}</p>
        <button onclick="window.location.reload()" style="
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #FF6B35, #F7931E);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        ">Reload Page</button>
      </div>
    `
  }
}
