import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { BoardsProvider } from './boards/BoardsProvider'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './toast/ToastProvider'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BoardsProvider>
          <ToastProvider position="bottom-center">
            <RouterProvider router={router} />
          </ToastProvider>
        </BoardsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
