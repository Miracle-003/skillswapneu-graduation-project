"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/axios-client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AdminUser {
  id: string
  email: string
  role: string
  createdAt?: string
  emailVerifiedAt?: string | null
}

export default function AdminHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])

  const fetchUsers = async () => {
    setError(null)
    try {
      const res = await apiClient.get("/admin/users")
      setUsers(res.data?.users ?? [])
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to load users")
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        // Ensure user is authenticated and an admin
        const me = await apiClient.get("/auth/me")
        const role = me.data?.user?.role
        if (role !== "admin") {
          router.replace("/dashboard")
          return
        }
        await fetchUsers()
      } catch (err: any) {
        // If unauthorized, axios interceptor will redirect to /auth/login automatically
        setError(err.response?.data?.error || err.message || "Failed to load admin dashboard")
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>User Dashboard</Button>
            <Button onClick={() => fetchUsers()}>Refresh</Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b">
                    <tr>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Verified</th>
                      <th className="py-2 pr-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-b-0">
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4 uppercase tracking-wide">{u.role}</td>
                        <td className="py-2 pr-4">{u.emailVerifiedAt ? "Yes" : "No"}</td>
                        <td className="py-2 pr-4">{u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}