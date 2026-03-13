import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ui } from '../lib/ui'

export function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth } = useAuth()
  const location = useLocation()

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-canvas p-6">
        <div className={`${ui.panelStrong} w-full max-w-md px-6 py-8 text-center`}>
          <p className="text-sm font-medium text-[var(--color-text-soft)]">Loading your Manifest Board...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoadingAuth } = useAuth()

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-canvas p-6">
        <div className={`${ui.panelStrong} w-full max-w-md px-6 py-8 text-center`}>
          <p className="text-sm font-medium text-[var(--color-text-soft)]">Preparing your cozy login...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
