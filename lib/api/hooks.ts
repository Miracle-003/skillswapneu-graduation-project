"use client"

// React hooks for API calls with loading states
// This makes it super easy to use in your components!

import { useState, useEffect } from "react"

export function useApi<T>(apiFunction: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunction()
        if (!cancelled) {
          setData(result)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "An error occurred")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, dependencies)

  return { data, loading, error }
}

// Example usage in a component:
// const { data: users, loading, error } = useApi(() => api.users.getAll())
