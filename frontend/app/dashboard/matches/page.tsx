/**
 * Find Your Partner Page (Matches Page)
 * 
 * This page implements the updated matchmaking workflow:
 * 1. Match suggestions are displayed based on course/interest overlap
 * 2. Matches are automatically generated and stored in the database when users qualify
 * 3. Connections are only created when users mutually accept a match (similar to Facebook friends)
 * 4. The page properly handles array/string serialization from the database/API
 * 5. Match suggestions are refetched when a user updates their profile
 * 
 * Flow:
 * - Display all match suggestions that meet the criteria (one user's interest matches another's course)
 * - When user clicks "Connect" (Heart button), create a connection in the connections table
 * - Connected users are filtered out from future match suggestions
 * - Profile completeness is calculated and displayed to encourage users to complete their profiles
 */

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
import { ArrowLeft, Heart, X, ChevronDown, BookOpen, Users, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { calculateProfileCompleteness, calculateMatchScore, NOT_SPECIFIED } from "@/lib/matching-algorithm"
import { ensureArray } from "@/lib/utils/array-helpers"

// API profile format (handles both camelCase and snake_case)
interface ApiProfile {
  userId?: string
  user_id?: string
  fullName?: string
  full_name?: string
  courses?: string[]
  interests?: string[]
  major?: string
  year?: string
  bio?: string
  learningStyle?: string
  learning_style?: string
  studyPreference?: string
  study_preference?: string
}

// Connection format from backend (Prisma Client returns camelCase)
interface ApiConnection {
  userId1?: string
  user_id_1?: string
  userId2?: string
  user_id_2?: string
  status?: string
}

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
  mutual_teaching_opportunities: string[]
  mutual_learning_opportunities: string[]
  is_connected: boolean
  profile_completeness: number
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [profileScroll, setProfileScroll] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const [userProfileCompleteness, setUserProfileCompleteness] = useState<number>(0)
  const [hasShownMatchToast, setHasShownMatchToast] = useState(false)
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

  // Helper function to safely extract user ID from any profile object
  const extractUserId = (obj: ApiProfile | null | undefined): string | undefined => {
    if (!obj) return undefined
    // Prefer userId (camelCase from Prisma Client), fallback to user_id (snake_case)
    return obj.userId || obj.user_id
  }

  // Helper function to extract user ID from a connection object
  // Connections have userId1/userId2 (from Prisma Client camelCase conversion)
  const extractConnectionUserIds = (connection: ApiConnection | null | undefined, currentUserId: string): string | undefined => {
    if (!connection) return undefined
    
    // Prisma Client returns camelCase: userId1, userId2
    const id1 = connection.userId1 || connection.user_id_1
    const id2 = connection.userId2 || connection.user_id_2
    
    // Return the ID that's NOT the current user
    if (id1 === currentUserId) return id2
    if (id2 === currentUserId) return id1
    
    // If neither matches current user, something's wrong - log and skip
    console.warn('[Matches Page] Connection does not involve current user:', { connection, currentUserId })
    return undefined
  }

  /**
   * Helper function to convert API profile format to matching algorithm format
   * Ensures proper handling of arrays (courses/interests) which may be strings due to serialization
   */
  const formatProfileForMatching = (profile: ApiProfile) => ({
    user_id: extractUserId(profile) || '',
    courses: ensureArray(profile.courses),
    interests: ensureArray(profile.interests),
    major: profile.major || NOT_SPECIFIED,
    year: profile.year || NOT_SPECIFIED,
    learning_style: profile.learningStyle || profile.learning_style || NOT_SPECIFIED,
    study_preference: profile.studyPreference || profile.study_preference || NOT_SPECIFIED,
  })

  const loadMatches = async () => {
    try {
      setError(null)
      if (!user) return
      const currentProfile = await profileService.getById(user.id)

      if (!currentProfile) {
        setLoading(false)
        return
      }

      console.log("[Matches Page] Current user profile loaded:", {
        user_id: user.id,
        courses: currentProfile.courses?.length || 0,
        interests: currentProfile.interests?.length || 0,
        major: currentProfile.major
      })

      // Calculate profile completeness for current user
      const currentUserFormatted = formatProfileForMatching(currentProfile)
      const currentUserCompleteness = calculateProfileCompleteness(currentUserFormatted)
      setUserProfileCompleteness(currentUserCompleteness)
      console.log(`[Matches Page] Current user profile completeness: ${currentUserCompleteness}%`)

      // Get existing connections
      let connectedIds: string[] = []
      try {
        const { data: existing } = await apiClient.get(`/connections/user/${user.id}?status=accepted`)
        const connections = existing?.connections || []
        console.log(`[Matches Page] Raw connections response:`, connections.length > 0 ? connections[0] : 'no connections')
        
        connectedIds = connections
          .map((c: ApiConnection) => extractConnectionUserIds(c, user.id))
          .filter((id): id is string => {
            if (!id) {
              console.warn('[Matches Page] Skipping invalid connection entry')
              return false
            }
            return true
          })
        
        console.log(`[Matches Page] Found ${connectedIds.length} existing connections:`, connectedIds)
      } catch (connErr) {
        console.warn("[Matches Page] Could not load connections, continuing without filtering:", connErr)
        // Continue without connection filtering - better to show all matches than none
      }

      const allProfiles = await profileService.getAll()
      console.log(`[Matches Page] Retrieved ${allProfiles.length} total profiles`)

      // Filter and log each step
      const profilesWithValidIds = allProfiles.filter(profile => {
        const profileId = extractUserId(profile)
        if (!profileId) {
          console.warn('[Matches Page] Skipping profile with no user ID:', profile)
          return false
        }
        return true
      })
      console.log(`[Matches Page] Profiles with valid IDs: ${profilesWithValidIds.length}`)

      const profilesExcludingSelf = profilesWithValidIds.filter(profile => {
        const profileId = extractUserId(profile)
        const isSelf = profileId === user.id
        if (isSelf) {
          console.log(`[Matches Page] Filtering out self (${profileId})`)
        }
        return !isSelf
      })
      console.log(`[Matches Page] After removing self: ${profilesExcludingSelf.length}`)

      const profilesExcludingConnections = profilesExcludingSelf.filter(profile => {
        const profileId = extractUserId(profile)
        // profileId should always be defined at this point due to previous filtering
        const isConnected = profileId ? connectedIds.includes(profileId) : false
        if (isConnected) {
          console.log(`[Matches Page] Filtering out already connected user: ${profileId}`)
        }
        return !isConnected
      })
      console.log(`[Matches Page] After removing connected users: ${profilesExcludingConnections.length}`)

      const matchedProfiles = profilesExcludingConnections
        .map((profile) => {
          // Convert profile to matching algorithm format
          const otherUserFormatted = formatProfileForMatching(profile)

          // Use the matching algorithm to calculate score and completeness
          const matchResult = calculateMatchScore(currentUserFormatted, otherUserFormatted)

          return {
            user_id: otherUserFormatted.user_id,
            full_name: profile.fullName || profile.full_name || 'Unknown',
            major: otherUserFormatted.major,
            year: otherUserFormatted.year,
            bio: profile.bio || '',
            courses: otherUserFormatted.courses,
            interests: otherUserFormatted.interests,
            learning_style: otherUserFormatted.learning_style,
            study_preference: otherUserFormatted.study_preference,
            match_score: matchResult.match_score,
            common_courses: matchResult.common_courses,
            common_interests: matchResult.common_interests,
            mutual_teaching_opportunities: matchResult.mutual_teaching_opportunities,
            mutual_learning_opportunities: matchResult.mutual_learning_opportunities,
            is_connected: false, // Already filtered out above
            profile_completeness: matchResult.profile_completeness,
          }
        })
        // Sort by match score (highest first), then by profile completeness
        .sort((a, b) => {
          if (b.match_score !== a.match_score) {
            return b.match_score - a.match_score
          }
          return b.profile_completeness - a.profile_completeness
        })

      console.log(`[Matches Page] Found ${matchedProfiles.length} potential matches`)
      
      if (matchedProfiles.length > 0) {
        console.log(`[Matches Page] Top match:`, {
          name: matchedProfiles[0].full_name,
          score: matchedProfiles[0].match_score,
          completeness: matchedProfiles[0].profile_completeness,
          commonInterests: matchedProfiles[0].common_interests.length,
          commonCourses: matchedProfiles[0].common_courses.length,
          mutualTeaching: matchedProfiles[0].mutual_teaching_opportunities.length,
          mutualLearning: matchedProfiles[0].mutual_learning_opportunities.length
        })
        
        // Show success toast when matches are found (only once per session)
        if (!hasShownMatchToast) {
          toast.success('🎉 You have a study partner!', {
            description: `Found ${matchedProfiles.length} potential match${matchedProfiles.length > 1 ? 'es' : ''} for you!`
          })
          setHasShownMatchToast(true)
        }
      } else {
        // Enhanced logging for zero matches to help with debugging
        console.log(`[Matches Page] Zero matches found. Debugging info:`)
        console.log(`  - Current user profile completeness: ${currentUserCompleteness}%`)
        console.log(`  - Current user courses: ${currentProfile.courses?.length || 0}`)
        console.log(`  - Current user interests: ${currentProfile.interests?.length || 0}`)
        console.log(`  - Total profiles checked: ${profilesExcludingConnections.length}`)
        console.log(`  - Profiles filtered (self + connected): ${allProfiles.length - profilesExcludingConnections.length}`)
        
        if (currentUserCompleteness < 80) {
          console.log(`  - REASON: Your profile is only ${currentUserCompleteness}% complete. Add courses and interests for better matches.`)
        }
        if (!currentProfile.courses || currentProfile.courses.length === 0) {
          console.log(`  - REASON: You have no courses added. Add courses to find study partners.`)
        }
        if (!currentProfile.interests || currentProfile.interests.length === 0) {
          console.log(`  - REASON: You have no interests added. Add interests to find compatible study partners.`)
        }
        if (profilesExcludingConnections.length === 0) {
          console.log(`  - REASON: No other users available (all are already connected or it's only you).`)
        }
      }

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
      
      console.log(`[Matches Page] Creating connection:`, {
        from: user.id,
        to: match.user_id,
        matchScore: match.match_score,
        mutualTeaching: match.mutual_teaching_opportunities,
        mutualLearning: match.mutual_learning_opportunities
      })
      
      await apiClient.post("/connections", { userId1: user.id, userId2: match.user_id, status: "accepted" })

      console.log(`[Matches Page] Connection created successfully with ${match.full_name}`)
      
      setShowMatchAnimation(true)
      setTimeout(() => {
        setShowMatchAnimation(false)
        setCurrentIndex((prev) => prev + 1)
        setProfileScroll(0)
        toast.success(`Connected with ${match.full_name}!`)
      }, 2000)
    } catch (err: any) {
      console.error("[Matches Page] Error connecting:", err)
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
        {/* Profile Completeness Banner */}
        {!loading && userProfileCompleteness < 80 && (
          <Card className="mb-6 border-[#8B1538]/20 bg-[#8B1538]/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#8B1538] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#8B1538] mb-1">
                    Complete your profile for better matches!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your profile is {userProfileCompleteness}% complete. Add more information to help us find your perfect study partner.
                  </p>
                  <Button asChild size="sm" className="bg-[#8B1538] hover:bg-[#A91D3A]">
                    <Link href="/dashboard/profile">Complete Profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                        <div
                          className={`w-3 h-3 rounded-full ${currentMatch.match_score >= 70 ? "bg-green-500" : currentMatch.match_score >= 40 ? "bg-yellow-500" : "bg-gray-400"}`}
                        />
                        <span className={`text-sm font-bold ${getMatchColor(currentMatch.match_score)}`}>
                          {currentMatch.match_score}% Match
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                        <CheckCircle className={`w-3 h-3 ${currentMatch.profile_completeness >= 80 ? "text-green-500" : currentMatch.profile_completeness >= 50 ? "text-yellow-500" : "text-gray-400"}`} />
                        <span className="text-xs text-muted-foreground">
                          {currentMatch.profile_completeness}% Profile
                        </span>
                      </div>
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

                      {/* Low Score / Incomplete Profile Hint */}
                      {(currentMatch.match_score < 20 || currentMatch.profile_completeness < 50) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800">
                              {currentMatch.match_score < 20 && currentMatch.profile_completeness < 50
                                ? "Both profiles are incomplete. Complete your profile to see better compatibility scores!"
                                : currentMatch.match_score < 20
                                ? "Low match score. Complete your profile or try connecting to discover shared interests!"
                                : "This user's profile is incomplete. They might still be a great study partner!"}
                            </p>
                          </div>
                        </div>
                      )}

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

                      {/* Mutual Teaching Opportunities - You can teach them */}
                      {currentMatch.mutual_teaching_opportunities && currentMatch.mutual_teaching_opportunities.length > 0 && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-800">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            🎓 You Can Teach ({currentMatch.mutual_teaching_opportunities.length})
                          </h3>
                          <p className="text-sm text-green-700 mb-2">
                            These are courses you're taking that they want to learn!
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.mutual_teaching_opportunities.map((course) => (
                              <Badge key={course} className="bg-green-600 hover:bg-green-700 text-white">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mutual Learning Opportunities - They can teach you */}
                      {currentMatch.mutual_learning_opportunities && currentMatch.mutual_learning_opportunities.length > 0 && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            📚 They Can Teach You ({currentMatch.mutual_learning_opportunities.length})
                          </h3>
                          <p className="text-sm text-blue-700 mb-2">
                            These are courses they're taking that you want to learn!
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.mutual_learning_opportunities.map((course) => (
                              <Badge key={course} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {course}
                              </Badge>
                            ))}
                          </div>
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
