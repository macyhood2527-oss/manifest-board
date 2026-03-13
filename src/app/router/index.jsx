import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from '../../components/AuthGate'
import { AchievedPage } from '../../pages/AchievedPage'
import { AddManifestPage } from '../../pages/AddManifestPage'
import { BoardPage } from '../../pages/BoardPage'
import { LoginPage } from '../../pages/LoginPage'
import { ManifestDetailPage } from '../../pages/ManifestDetailPage'
import { SettingsPage } from '../../pages/SettingsPage'
import { SignupPage } from '../../pages/SignupPage'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <BoardPage />,
      },
      {
        path: '/manifests/new',
        element: <AddManifestPage />,
      },
      {
        path: '/manifests/:manifestId',
        element: <ManifestDetailPage />,
      },
      {
        path: '/achieved',
        element: <AchievedPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
])
