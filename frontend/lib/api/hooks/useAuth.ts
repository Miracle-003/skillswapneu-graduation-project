"use client"

import { useState, useEffect } from "react"
import { authService } from "../services/auth.service"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await authService.me()
      setUser(userData.user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authService.login({ email, password })

      // Save token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
      }

      setUser(response.user)
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return { user, loading, error, login, logout, checkAuth }
}
