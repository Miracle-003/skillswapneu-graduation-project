"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { authService } from "@/lib/api/services/auth.service"
import { profileService } from "@/lib/api/services/profile.service"
import { calculateProfileCompletion } from "@/lib/utils"

export default function MatchesPage() {
  const [loading, setLoading] = useState(true)
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await authService.me()
        const userId = me.user?.id || me.user?.sub || me.id

        if (!userId) {
          setCompletion(0)
          return
        }

        const profile = await profileService.getById(userId)
        const percent = calculateProfileCompletion(profile)

        setCompletion(percent)
      } catch (error) {
        console.error("Failed to load profile", error)
        setCompletion(0)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading matches...
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold">Find Your Study Partner</h1>

        {completion < 100 && (
          <Alert variant="destructive">
            <AlertDescription>
              Your profile is {completion}% complete.  
              Add more information to get better matches.
            </AlertDescription>
          </Alert>
        )}

        {completion >= 100 && (
          <Card className="mt-8">
            <CardContent c
