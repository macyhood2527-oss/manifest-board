import { useCallback, useEffect, useMemo, useState } from 'react'
import { mapAuthUser, supabase } from '../lib/supabase'
import { AuthContext } from './authContextObject'

function getAuthErrorMessage(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage
  }

  if (error.status === 0 || error.name === 'AuthRetryableFetchError' || error.message === 'Failed to fetch') {
    return 'Supabase is not reachable right now. Check your project URL, key, or network connection and try again.'
  }

  if (error.code === 'email_not_confirmed') {
    return 'Please confirm your email first, then sign in again.'
  }

  return error.message || fallbackMessage
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  const refreshAuth = useCallback(async () => {
    if (!supabase) {
      setUser(null)
      setIsLoadingAuth(false)
      return
    }

    try {
      const [{ data: sessionData }, { data: userData, error: userError }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ])

      if (userError) {
        throw userError
      }

      setUser(sessionData.session ? mapAuthUser(userData.user) : null)
    } catch {
      setUser(null)
    } finally {
      setIsLoadingAuth(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setIsLoadingAuth(false)
      return undefined
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapAuthUser(session?.user ?? null))
    })

    refreshAuth()

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [refreshAuth])

  const login = useCallback(async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        throw error
      }

      const nextUser = mapAuthUser(data.user)
      setUser(nextUser)
      return nextUser
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Unable to sign in right now.'))
    }
  }, [])

  const signup = useCallback(async ({ name, email, password }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      })

      if (error) {
        throw error
      }

      if (!data.session) {
        const signInResult = await supabase.auth.signInWithPassword({ email, password })

        if (signInResult.error) {
          throw signInResult.error
        }

        const nextUser = mapAuthUser(signInResult.data.user)
        setUser(nextUser)
        return nextUser
      }

      const nextUser = mapAuthUser(data.user)
      setUser(nextUser)
      return nextUser
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Unable to create your account right now.'))
    }
  }, [])

  const logout = useCallback(() => {
    if (!supabase) {
      setUser(null)
      return
    }

    supabase.auth.signOut()
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
