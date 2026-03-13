import { useEffect, useMemo, useState } from 'react'
import {
  defaultThemeId,
  getThemeById,
  isThemeId,
  THEME_STORAGE_KEY,
  themes,
} from '../lib/themes'
import { ThemeContext } from './themeContextObject'

function applyTheme(themeId) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('data-theme', isThemeId(themeId) ? themeId : defaultThemeId)
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
