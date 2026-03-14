import { createContext } from 'react'

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshAuth: async () => {},
  updateProfile: async () => {},
  updateEmail: async () => {},
  updatePassword: async () => {},
})
