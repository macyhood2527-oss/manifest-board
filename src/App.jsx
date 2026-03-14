import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { BoardsProvider } from './boards/BoardsProvider'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ui } from './lib/ui'
import { ToastProvider } from './toast/ToastProvider'

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-canvas p-6">
      <div className={`${ui.panelStrong} w-full max-w-md px-6 py-8 text-center`}>
        <p className="text-sm font-medium text-[var(--color-text-soft)]">Opening your next page...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BoardsProvider>
          <ToastProvider position="bottom-center">
            <RouterProvider router={router} fallbackElement={<RouteFallback />} />
          </ToastProvider>
        </BoardsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
