"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRequireAuth } from "@/lib/api/hooks/useRequireAuth"
import { profileService } from "@/lib/api/services/profile.service"
import { apiClient } from "@/lib/api/axios-client"
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
  common_interests: string[]
  is_connected: boolean
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [profileScroll, setProfileScroll] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const { user } = useRequireAuth()

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
      setError(null)
      if (!user) return
      const currentProfile = await profileService.getById(user.id)

      if (!currentProfile) {
        setLoading(false)
        return
      }

      // Get existing connections
      let connectedIds: string[] = []
      try {
        const { data: existing } = await apiClient.get(`/connections/user/${user.id}?status=accepted`)
        connectedIds = (existing?.connections || [])
          .map((c: any) => {
            const uid1 = c.userId1 || c.user_id_1
            const uid2 = c.userId2 || c.user_id_2
            return uid1 === user.id ? uid2 : uid1
          })
          .filter(Boolean) // Remove any undefined/null values
      } catch (connErr) {
        console.warn("Could not load connections, continuing without filtering:", connErr)
        // Continue without connection filtering - better to show all matches than none
      }

      const allProfiles = await profileService.getAll()

      const matchedProfiles = allProfiles
        .filter(profile => (profile.userId || profile.user_id) !== user.id) // Don't match with yourself
        .map((profile) => {
          // Calculate common courses properly
          const currentCourses = currentProfile.courses || []
          const profileCourses = profile.courses || []
          const commonCourses = profileCourses.filter((course: string) => 
            currentCourses.includes(course)
          )

          // Calculate common interests
          const currentInterests = currentProfile.interests || []
          const profileInterests = profile.interests || []
          const commonInterests = profileInterests.filter((interest: string) =>
            currentInterests.includes(interest)
          )

          // NEW SCORING: Interests are PRIMARY factor
          let score = 0
          
          // Interests: 40 points each (PRIMARY FACTOR)
          score += commonInterests.length * 40
          
          // Courses: 20 points each (secondary)
          score += commonCourses.length * 20
          
          // Major: 10 points (tertiary)
          if (profile.major && currentProfile.major && profile.major === currentProfile.major) {
            score += 10
          }
          
          // Learning style: 5 points (bonus)
          if (profile.learningStyle && currentProfile.learningStyle && 
              profile.learningStyle === currentProfile.learningStyle) {
            score += 5
          }
          
          // Study preference: 5 points (bonus)
          if (profile.studyPreference && currentProfile.studyPreference && 
              profile.studyPreference === currentProfile.studyPreference) {
            score += 5
          }

          return {
            user_id: profile.userId || profile.user_id,
            full_name: profile.fullName || profile.full_name || 'Unknown',
            major: profile.major || 'Not specified',
            year: profile.year || 'Not specified',
            bio: profile.bio || '',
            courses: profileCourses,
            interests: profileInterests,
            learning_style: profile.learningStyle || profile.learning_style || 'Not specified',
            study_preference: profile.studyPreference || profile.study_preference || 'Not specified',
            match_score: Math.min(score, 100),
            common_courses: commonCourses,
            common_interests: commonInterests,
            is_connected: connectedIds.includes(profile.userId || profile.user_id),
          }
        })
        // Show profiles with at least 1 common interest OR 10%+ match score
        .filter((profile) => {
          if (profile.is_connected) return false
          // Always show if there's at least 1 common interest
          if (profile.common_interests && profile.common_interests.length > 0) return true
          // Otherwise require at least 10% match
          return profile.match_score >= 10
        })
        .sort((a, b) => b.match_score - a.match_score)

      setMatches(matchedProfiles)
    } catch (err) {
      console.error("Error loading matches:", err)
      setError(err instanceof Error ? err.message : "Failed to load matches. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (currentIndex >= matches.length) return

    const match = matches[currentIndex]

    try {
      if (!user) throw new Error("Not authenticated")
      await apiClient.post("/connections", { userId1: user.id, userId2: match.user_id, status: "accepted" })

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
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Matches</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => loadMatches()} className="bg-[#8B1538] hover:bg-[#A91D3A]">
                Try Again
              </Button>
            </CardContent>
          </Card>
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

                      {/* Common Interests - Add this BEFORE All Courses section */}
                      {currentMatch.common_interests && currentMatch.common_interests.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#8B1538]" />
                            Common Interests ({currentMatch.common_interests.length})
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.common_interests.map((interest) => (
                              <Badge key={interest} className="bg-[#8B1538] hover:bg-[#A91D3A]">
                                {interest}
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
                            All Interests
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.interests.map((interest) => (
                              <Badge key={interest} variant="secondary">
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
