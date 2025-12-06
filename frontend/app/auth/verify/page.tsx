"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api/axios-client"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const id = searchParams.get("id")
      const secret = searchParams.get("secret")

      if (!id || !secret) {
        setStatus("error")
        setMessage("Invalid verification link. Missing token parameters.")
        return
      }

      try {
        // Call backend verify endpoint
        const response = await apiClient.get(`/auth/verify?id=${id}&secret=${secret}`)
        setStatus("success")
        setMessage(response.data.message || "Email verified successfully!")

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } catch (err: any) {
        setStatus("error")
        setMessage(err.response?.data?.error || "Verification failed. The link may have expired.")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8B1538] to-[#C73659] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-[#8B1538] animate-spin" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <XCircle className="w-16 h-16 text-red-500" />
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-2 w-full">
                <Button asChild className="w-full bg-[#8B1538] hover:bg-[#A91D3A]">
                  <Link href="/auth/signup">Try Signing Up Again</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
