"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Mail } from "lucide-react"
import { authService } from "@/lib/api/services/auth.service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNeedsVerification(false)
    setResendSuccess(false)
    setLoading(true)

    console.log("[fe] Attempting backend login with email:", email)

    try {
      const response = await authService.login({ email, password })

      // Save JWT for axios to use on subsequent requests
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.token)
      }

      // Redirect by role
      const dest = response.user?.role === "admin" ? "/admin" : "/dashboard"
      console.log("[fe] Login successful, redirecting to:", dest)
      router.push(dest)
      router.refresh()
    } catch (err: any) {
      console.error("[fe] Login failed:", err)
      const errorMsg = err.response?.data?.error || err.message || "Failed to sign in"

      if (errorMsg.toLowerCase().includes("not verified")) {
        setNeedsVerification(true)
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    try {
      // Re-register triggers a new verification email
      await authService.register({ email, password })
      setResendSuccess(true)
    } catch (err: any) {
      // If user already exists and is verified, that's fine
      const errorMsg = err.response?.data?.error || ""
      if (!errorMsg.toLowerCase().includes("already verified")) {
        setError(err.response?.data?.error || "Failed to resend verification email")
      } else {
        setResendSuccess(true)
      }
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8B1538] to-[#C73659] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your SkillSwap account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {needsVerification && (
              <Alert className="bg-amber-50 text-amber-900 border-amber-200">
                <Mail className="w-4 h-4" />
                <AlertDescription className="ml-2">
                  <p className="mb-2">Your email is not verified yet. Check your inbox for the verification link.</p>
                  {resendSuccess ? (
                    <p className="text-green-700 font-medium">Verification email sent! Check your inbox.</p>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="mt-1 bg-transparent"
                    >
                      {resendLoading ? "Sending..." : "Resend Verification Email"}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-[#8B1538] hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-[#8B1538] hover:bg-[#A91D3A]" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-[#8B1538] hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
