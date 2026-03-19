import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { applyTheme, getTheme } from './lib/theme.js'

// Apply saved theme immediately before first render (avoids flash)
applyTheme(getTheme())

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // vite-plugin-pwa handles SW registration automatically in prod
    // This is just a fallback log
    console.log('[devlog] PWA ready')
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
