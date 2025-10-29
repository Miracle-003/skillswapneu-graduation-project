"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, Heart, X, ChevronDown, BookOpen, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [profileScroll, setProfileScroll] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (matches.length === 0) return

      switch (e.key) {
        case "ArrowLeft":
          handleReject()
          break
        case "ArrowRight":
          handleConnect()
          break
        case "ArrowUp":
          setProfileScroll((prev) => Math.max(0, prev - 100))
          break
        case "ArrowDown":
          setProfileScroll((prev) => prev + 100)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [matches, currentIndex])

  const loadMatches = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: currentProfile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (!currentProfile) {
        setLoading(false)
        return
      }

      const { data: existingConnections } = await supabase
        .from("connections")
        .select("user_id_2")
        .eq("user_id_1", user.id)

      const connectedIds = existingConnections?.map((c) => c.user_id_2) || []

      const { data: allProfiles } = await supabase.from("user_profiles").select("*").neq("user_id", user.id).limit(50)

      if (!allProfiles) {
        setLoading(false)
        return
      }

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
        .filter((profile) => profile.match_score > 0 && !profile.is_connected)
        .sort((a, b) => b.match_score - a.match_score)

      setMatches(matchedProfiles)
    } catch (err) {
      console.error("[v0] Error loading matches:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (currentIndex >= matches.length) return

    const match = matches[currentIndex]

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("connections").insert({
        user_id_1: user.id,
        user_id_2: match.user_id,
        status: "accepted",
      })

      if (error) throw error

      setShowMatchAnimation(true)
      setTimeout(() => {
        setShowMatchAnimation(false)
        setCurrentIndex((prev) => prev + 1)
        setProfileScroll(0)
        toast.success(`Connected with ${match.full_name}!`)
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Error connecting:", err)
      toast.error("Failed to connect. Please try again.")
    }
  }

  const handleReject = () => {
    setCurrentIndex((prev) => prev + 1)
    setProfileScroll(0)
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
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-gray-400"
  }

  const currentMatch = matches[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="text-sm text-muted-foreground">
            {matches.length > 0 && `${currentIndex + 1} / ${matches.length}`}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Find Your Study Partner</h1>
          <p className="text-muted-foreground">Use arrow keys or buttons to browse matches</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded">←</kbd>
              <span>Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded">→</kbd>
              <span>Connect</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded">↑↓</kbd>
              <span>Scroll Profile</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Finding your perfect study partners...</p>
          </div>
        ) : matches.length === 0 || currentIndex >= matches.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No more matches</h3>
              <p className="text-muted-foreground mb-4">Check back later for new study partners</p>
              <Button asChild className="bg-[#8B1538] hover:bg-[#A91D3A]">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <AnimatePresence>
              {showMatchAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    className="bg-white rounded-2xl p-12 text-center shadow-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <Sparkles className="w-24 h-24 mx-auto mb-4 text-[#8B1538]" />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-2">It's a Match!</h2>
                    <p className="text-muted-foreground">You can now chat with {currentMatch?.full_name}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="overflow-hidden border-2 shadow-xl">
                  {/* Profile Header */}
                  <div className="relative h-48 bg-gradient-to-br from-[#8B1538] to-[#C73659] flex items-center justify-center">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarFallback className="bg-white text-[#8B1538] text-4xl font-bold">
                        {getInitials(currentMatch.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                      <div
                        className={`w-3 h-3 rounded-full ${currentMatch.match_score >= 70 ? "bg-green-500" : currentMatch.match_score >= 40 ? "bg-yellow-500" : "bg-gray-400"}`}
                      />
                      <span className={`text-sm font-bold ${getMatchColor(currentMatch.match_score)}`}>
                        {currentMatch.match_score}% Match
                      </span>
                    </div>
                  </div>

                  <ScrollArea className="h-[400px]" style={{ scrollBehavior: "smooth" }}>
                    <CardContent className="p-6 space-y-6">
                      {/* Basic Info */}
                      <div className="text-center">
                        <h2 className="text-3xl font-bold mb-1">{currentMatch.full_name}</h2>
                        <p className="text-muted-foreground">
                          {currentMatch.major} • {currentMatch.year}
                        </p>
                      </div>

                      {/* Bio */}
                      {currentMatch.bio && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#8B1538]" />
                            About
                          </h3>
                          <p className="text-muted-foreground">{currentMatch.bio}</p>
                        </div>
                      )}

                      {/* Common Courses */}
                      {currentMatch.common_courses.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#8B1538]" />
                            Common Courses ({currentMatch.common_courses.length})
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.common_courses.map((course) => (
                              <Badge key={course} className="bg-[#8B1538] hover:bg-[#A91D3A]">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Courses */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#8B1538]" />
                          All Courses
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {currentMatch.courses.map((course) => (
                            <Badge key={course} variant="secondary">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Interests */}
                      {currentMatch.interests.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#8B1538]" />
                            Interests
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.interests.map((interest) => (
                              <Badge key={interest} variant="outline">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Study Preferences */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Learning Style</p>
                          <p className="font-semibold">{currentMatch.learning_style}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Study Time</p>
                          <p className="font-semibold">{currentMatch.study_preference}</p>
                        </div>
                      </div>

                      {/* Scroll Hint */}
                      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                        <ChevronDown className="w-4 h-4 mx-auto mb-1 animate-bounce" />
                        Use ↑↓ arrows to scroll
                      </div>
                    </CardContent>
                  </ScrollArea>

                  <div className="p-6 border-t bg-muted/30 flex items-center justify-center gap-6">
                    <Button
                      onClick={handleReject}
                      size="lg"
                      variant="outline"
                      className="w-16 h-16 rounded-full border-2 hover:border-red-500 hover:bg-red-50 bg-transparent"
                    >
                      <X className="w-8 h-8 text-red-500" />
                    </Button>
                    <Button
                      onClick={handleConnect}
                      size="lg"
                      className="w-20 h-20 rounded-full bg-[#8B1538] hover:bg-[#A91D3A] shadow-lg"
                    >
                      <Heart className="w-10 h-10" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
