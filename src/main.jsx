import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { applyTheme, getTheme } from './lib/theme.js'

// Apply saved theme immediately before first render (avoids flash)
applyTheme(getTheme())

// Ask for notification permission once on first visit
function askNotificationPermission() {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') return
  if (Notification.permission === 'denied') return
  if (localStorage.getItem('devlog-notif-asked')) return

  setTimeout(() => {
    Notification.requestPermission().then(result => {
      localStorage.setItem('devlog-notif-asked', 'true')
      if (result === 'granted') {
        new Notification('devlog', {
          body: "You're all set! Daily reminders are ready to configure.",
          icon: '/icon-192.png',
        })
      }
    })
  }, 2000)
}

askNotificationPermission()

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('[devlog] PWA ready')
  })
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Hide the inline loading screen once React has mounted
if (window.__hideLoader) window.__hideLoader()