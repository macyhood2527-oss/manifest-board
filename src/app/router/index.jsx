import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from '../../components/AuthGate'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        lazy: async () => {
          const module = await import('../../pages/LoginPage')
          return { Component: module.LoginPage }
        },
      },
      {
        path: '/signup',
        lazy: async () => {
          const module = await import('../../pages/SignupPage')
          return { Component: module.SignupPage }
        },
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        lazy: async () => {
          const module = await import('../../pages/BoardPage')
          return { Component: module.BoardPage }
        },
      },
      {
        path: '/manifests/new',
        lazy: async () => {
          const module = await import('../../pages/AddManifestPage')
          return { Component: module.AddManifestPage }
        },
      },
      {
        path: '/manifests/:manifestId',
        lazy: async () => {
          const module = await import('../../pages/ManifestDetailPage')
          return { Component: module.ManifestDetailPage }
        },
      },
      {
        path: '/achieved',
        lazy: async () => {
          const module = await import('../../pages/AchievedPage')
          return { Component: module.AchievedPage }
        },
      },
      {
        path: '/settings',
        lazy: async () => {
          const module = await import('../../pages/SettingsPage')
          return { Component: module.SettingsPage }
        },
      },
    ],
  },
])
