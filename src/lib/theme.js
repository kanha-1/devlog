// Theme management — persists to localStorage, syncs with <html> class
export function getTheme() {
  return localStorage.getItem('devlog-theme') || 'dark'
}

export function setTheme(theme) {
  localStorage.setItem('devlog-theme', theme)
  applyTheme(theme)
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
    root.classList.remove('dark')
  } else {
    root.classList.remove('light')
    root.classList.add('dark')
  }
}

export function toggleTheme() {
  const current = getTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
