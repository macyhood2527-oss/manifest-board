import { useEffect, useMemo, useState } from 'react'
import {
  defaultThemeId,
  getThemeById,
  isThemeId,
  THEME_STORAGE_KEY,
  themes,
} from '../lib/themes'
import { ThemeContext } from './themeContextObject'

function setThemeColorMeta(content) {
  if (typeof document === 'undefined' || !content) {
    return
  }

  let themeMeta = document.querySelector('meta[name="theme-color"]')

  if (!themeMeta) {
    themeMeta = document.createElement('meta')
    themeMeta.setAttribute('name', 'theme-color')
    document.head.appendChild(themeMeta)
  }

  themeMeta.setAttribute('content', content)
}

function applyTheme(themeId) {
  if (typeof document === 'undefined') {
    return
  }

  const nextThemeId = isThemeId(themeId) ? themeId : defaultThemeId
  const nextTheme = getThemeById(nextThemeId)
  document.documentElement.setAttribute('data-theme', nextThemeId)
  document.documentElement.style.setProperty('--app-theme-color', nextTheme.colors.background)
  document.body.style.backgroundColor = nextTheme.colors.background
  setThemeColorMeta(nextTheme.colors.background)
}

function getInitialThemeId() {
  if (typeof window === 'undefined') {
    return defaultThemeId
  }

  const storedThemeId = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemeId(storedThemeId) ? storedThemeId : defaultThemeId
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const nextThemeId = getInitialThemeId()
    applyTheme(nextThemeId)
    return nextThemeId
  })

  useEffect(() => {
    applyTheme(themeId)
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId)
  }, [themeId])

  const value = useMemo(() => ({
    currentTheme: getThemeById(themeId),
    setTheme: setThemeId,
    themes,
  }), [themeId])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
