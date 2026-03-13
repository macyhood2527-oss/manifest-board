import { useCallback, useEffect, useMemo, useState } from 'react'
import { pb } from '../lib/pocketbase'
import { AuthContext } from './authContextObject'

function getStoredAuthUser() {
  if (!pb) {
    return null
  }

  return pb.authStore.model || null
}

function getAuthErrorMessage(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage
  }

  if (error.isAbort) {
    return 'The request was interrupted. Please try again.'
  }

  if (error.status === 0) {
    return 'PocketBase is not running right now. Start the server and try again.'
  }

  if (error.response?.message) {
    return error.response.message
  }

  if (error.response?.data) {
    const firstFieldError = Object.values(error.response.data)[0]
    if (firstFieldError?.message) {
      return firstFieldError.message
    }
  }

  return error.message || fallbackMessage
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuthUser())
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  const refreshAuth = useCallback(async () => {
    if (!pb) {
      setUser(null)
      setIsLoadingAuth(false)
      return
    }

    if (!pb.authStore.isValid) {
      setUser(pb.authStore.model || null)
      setIsLoadingAuth(false)
      return
    }

    try {
      await pb.collection('users').authRefresh()
      setUser(pb.authStore.model || null)
    } catch {
      pb.authStore.clear()
      setUser(null)
    } finally {
      setIsLoadingAuth(false)
    }
  }, [])

  useEffect(() => {
    if (!pb) {
      setIsLoadingAuth(false)
      return undefined
    }

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(model || null)
    })

    refreshAuth()

    return unsubscribe
  }, [refreshAuth])

  const login = useCallback(async ({ email, password }) => {
    if (!pb) {
      throw new Error('PocketBase is not configured. Add VITE_POCKETBASE_URL to your environment.')
    }

    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record || pb.authStore.model || null)
      return authData.record
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Unable to sign in right now.'))
    }
  }, [])

  const signup = useCallback(async ({ name, email, password }) => {
    if (!pb) {
      throw new Error('PocketBase is not configured. Add VITE_POCKETBASE_URL to your environment.')
    }

    try {
      await pb.collection('users').create({
        name: name || '',
        email,
        password,
        passwordConfirm: password,
      })

      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record || pb.authStore.model || null)
      return authData.record
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Unable to create your account right now.'))
    }
  }, [])

  const logout = useCallback(() => {
    if (!pb) {
      setUser(null)
      return
    }

    pb.authStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoadingAuth,
    login,
    signup,
    logout,
    refreshAuth,
  }), [user, isLoadingAuth, login, signup, logout, refreshAuth])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
