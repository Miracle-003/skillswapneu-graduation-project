"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "../services/auth.service"

export function useRequireAuth() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const me = await authService.me()
        setUser(me.user)
      } catch (err: any) {
        // Clear any stale token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
        }
        setError(err?.message || "Unauthorized")
        router.replace("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [router])

  return { user, loading, error }
}