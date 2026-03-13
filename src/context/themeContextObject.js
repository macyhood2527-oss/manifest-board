import { createContext } from 'react'
import { defaultThemeId, getThemeById, themes } from '../lib/themes'

export const ThemeContext = createContext({
  currentTheme: getThemeById(defaultThemeId),
  setTheme: () => {},
  themes,
})
