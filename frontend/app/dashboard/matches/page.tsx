"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, Users, BookOpen, Clock, MessageSquare, Check } from "lucide-react"
import Link from "next/link"

interface Match {
  user_id: string
  full_name: string
  major: string
  year: string
  bio: string
  courses: string[]
  interests: string[]
  learning_style: string
  study_preference: string
  match_score: number
  common_courses: string[]
  is_connected: boolean
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get current user's profile
      const { data: currentProfile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (!currentProfile) {
        setLoading(false)
        return
      }

      // Get existing connections
      const { data: existingConnections } = await supabase
        .from("connections")
        .select("user_id_2")
        .eq("user_id_1", user.id)

      const connectedIds = existingConnections?.map((c) => c.user_id_2) || []

      // Get all other profiles
      const { data: allProfiles } = await supabase.from("user_profiles").select("*").neq("user_id", user.id).limit(20)

      if (!allProfiles) {
        setLoading(false)
        return
      }

      // Calculate match scores
      const matchedProfiles = allProfiles
        .map((profile) => {
          const commonCourses = profile.courses.filter((course: string) => currentProfile.courses.includes(course))
          const commonInterests = profile.interests.filter((interest: string) =>
            currentProfile.interests.includes(interest),
          )

          let score = 0
          score += commonCourses.length * 30
          score += commonInterests.length * 15
          score += profile.major === currentProfile.major ? 20 : 0
          score += profile.learning_style === currentProfile.learning_style ? 15 : 0
          score += profile.study_preference === currentProfile.study_preference ? 10 : 0

          return {
            ...profile,
            match_score: Math.min(score, 100),
            common_courses: commonCourses,
            is_connected: connectedIds.includes(profile.user_id),
          }
        })
        .filter((profile) => profile.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score)

      setMatches(matchedProfiles)
    } catch (err) {
      console.error("[v0] Error loading matches:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (matchUserId: string) => {
    setConnectingId(matchUserId)
    setSuccessMessage("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create connection
      const { error } = await supabase.from("connections").insert({
        user_id_1: user.id,
        user_id_2: matchUserId,
        status: "accepted",
      })

      if (error) throw error

      // Update local state
      setMatches((prev) => prev.map((m) => (m.user_id === matchUserId ? { ...m, is_connected: true } : m)))

      setSuccessMessage("Connection successful! You can now chat with this study partner.")
    } catch (err: any) {
      console.error("[v0] Error connecting:", err)
    } finally {
      setConnectingId(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMatchColor = (score: number) => {
    if (score >= 70) return "bg-green-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-gray-400"
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Study Matches</h1>
          <p className="text-muted-foreground">Connect with students who share your courses and interests</p>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Finding your perfect study partners...</p>
          </div>
        ) : matches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">
                Complete your profile with courses and interests to find study partners
              </p>
              <Button asChild className="bg-[#8B1538] hover:bg-[#A91D3A]">
                <Link href="/dashboard/profile">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card key={match.user_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-[#8B1538] text-white text-lg">
                        {getInitials(match.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getMatchColor(match.match_score)}`} />
                      <span className="text-sm font-semibold">{match.match_score}%</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{match.full_name}</CardTitle>
                  <CardDescription>
                    {match.major} • {match.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{match.bio}</p>

                  {match.common_courses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-[#8B1538]" />
                        <span className="text-sm font-medium">Common Courses</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {match.common_courses.slice(0, 3).map((course) => (
                          <Badge key={course} variant="secondary" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                        {match.common_courses.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{match.common_courses.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {match.learning_style}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {match.study_preference}
                    </div>
                  </div>

                  {match.is_connected ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                      <Check className="w-4 h-4 mr-2" />
                      Connected
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleConnect(match.user_id)}
                      disabled={connectingId === match.user_id}
                      className="w-full bg-[#8B1538] hover:bg-[#A91D3A]"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {connectingId === match.user_id ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
