"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, Trophy, Award, Star, Users, MessageSquare, FileText, Target } from "lucide-react"
import Link from "next/link"

interface UserStats {
  connections: number
  messages_sent: number
  reviews_given: number
  reviews_received: number
  total_points: number
  level: number
}

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earned_at?: string
}

interface LeaderboardEntry {
  user_id: string
  full_name: string
  total_points: number
  rank: number
}

const BADGES: BadgeData[] = [
  {
    id: "first-connection",
    name: "First Connection",
    description: "Made your first study buddy connection",
    icon: "users",
    earned: false,
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Connected with 5 study partners",
    icon: "users",
    earned: false,
  },
  {
    id: "chatterbox",
    name: "Chatterbox",
    description: "Sent 50 messages",
    icon: "message",
    earned: false,
  },
  {
    id: "helpful-reviewer",
    name: "Helpful Reviewer",
    description: "Provided 10 peer reviews",
    icon: "star",
    earned: false,
  },
  {
    id: "feedback-seeker",
    name: "Feedback Seeker",
    description: "Received 5 peer reviews",
    icon: "file",
    earned: false,
  },
  {
    id: "top-contributor",
    name: "Top Contributor",
    description: "Reached 1000 points",
    icon: "trophy",
    earned: false,
  },
]

export default function AchievementsPage() {
  const [stats, setStats] = useState<UserStats>({
    connections: 0,
    messages_sent: 0,
    reviews_given: 0,
    reviews_received: 0,
    total_points: 0,
    level: 1,
  })
  const [badges, setBadges] = useState<BadgeData[]>(BADGES)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load user stats
      const { data: connections } = await supabase.from("connections").select("*").eq("user_id_1", user.id)

      const { data: messages } = await supabase.from("messages").select("*").eq("sender_id", user.id)

      const { data: reviewsGiven } = await supabase.from("peer_reviews").select("*").eq("reviewer_id", user.id)

      const { data: submissions } = await supabase.from("peer_review_submissions").select("*").eq("user_id", user.id)

      const reviewsReceived = submissions?.length || 0

      const connectionsCount = connections?.length || 0
      const messagesCount = messages?.length || 0
      const reviewsGivenCount = reviewsGiven?.length || 0

      // Calculate points
      const totalPoints = connectionsCount * 50 + messagesCount * 2 + reviewsGivenCount * 25 + reviewsReceived * 10

      const level = Math.floor(totalPoints / 100) + 1

      setStats({
        connections: connectionsCount,
        messages_sent: messagesCount,
        reviews_given: reviewsGivenCount,
        reviews_received: reviewsReceived,
        total_points: totalPoints,
        level,
      })

      // Update badges
      const updatedBadges = BADGES.map((badge) => {
        let earned = false
        if (badge.id === "first-connection" && connectionsCount >= 1) earned = true
        if (badge.id === "social-butterfly" && connectionsCount >= 5) earned = true
        if (badge.id === "chatterbox" && messagesCount >= 50) earned = true
        if (badge.id === "helpful-reviewer" && reviewsGivenCount >= 10) earned = true
        if (badge.id === "feedback-seeker" && reviewsReceived >= 5) earned = true
        if (badge.id === "top-contributor" && totalPoints >= 1000) earned = true
        return { ...badge, earned }
      })
      setBadges(updatedBadges)

      // Load leaderboard
      const { data: allProfiles } = await supabase.from("user_profiles").select("user_id, full_name").limit(100)

      if (allProfiles) {
        const leaderboardData = await Promise.all(
          allProfiles.map(async (profile) => {
            const { data: userConnections } = await supabase
              .from("connections")
              .select("*")
              .eq("user_id_1", profile.user_id)
            const { data: userMessages } = await supabase.from("messages").select("*").eq("sender_id", profile.user_id)
            const { data: userReviews } = await supabase
              .from("peer_reviews")
              .select("*")
              .eq("reviewer_id", profile.user_id)

            const points =
              (userConnections?.length || 0) * 50 + (userMessages?.length || 0) * 2 + (userReviews?.length || 0) * 25

            return {
              user_id: profile.user_id,
              full_name: profile.full_name,
              total_points: points,
              rank: 0,
            }
          }),
        )

        const sortedLeaderboard = leaderboardData
          .sort((a, b) => b.total_points - a.total_points)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))
          .slice(0, 10)

        setLeaderboard(sortedLeaderboard)
      }
    } catch (err) {
      console.error("[v0] Error loading achievements:", err)
    } finally {
      setLoading(false)
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

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "users":
        return <Users className="w-6 h-6" />
      case "message":
        return <MessageSquare className="w-6 h-6" />
      case "star":
        return <Star className="w-6 h-6" />
      case "file":
        return <FileText className="w-6 h-6" />
      case "trophy":
        return <Trophy className="w-6 h-6" />
      default:
        return <Award className="w-6 h-6" />
    }
  }

  const nextLevelPoints = stats.level * 100
  const currentLevelProgress = (stats.total_points % 100) / 100

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
          <h1 className="text-3xl font-bold mb-2">Achievements</h1>
          <p className="text-muted-foreground">Track your progress and compete with other students</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#8B1538]" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-[#8B1538]">Level {stats.level}</p>
                    <p className="text-sm text-muted-foreground">{stats.total_points} total points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next level</p>
                    <p className="text-sm font-semibold">{nextLevelPoints} points</p>
                  </div>
                </div>
                <Progress value={currentLevelProgress * 100} className="h-2" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stats.connections}</p>
                    <p className="text-xs text-muted-foreground">Connections</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stats.messages_sent}</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stats.reviews_given}</p>
                    <p className="text-xs text-muted-foreground">Reviews Given</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stats.reviews_received}</p>
                    <p className="text-xs text-muted-foreground">Reviews Received</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="badges" className="space-y-6">
              <TabsList>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              <TabsContent value="badges">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <Card key={badge.id} className={badge.earned ? "border-[#8B1538]" : "opacity-60"}>
                      <CardHeader>
                        <div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                            badge.earned ? "bg-[#8B1538] text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getBadgeIcon(badge.icon)}
                        </div>
                        <CardTitle className="text-center text-lg">{badge.name}</CardTitle>
                        <CardDescription className="text-center">{badge.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        {badge.earned ? (
                          <Badge className="bg-green-100 text-green-800">Earned</Badge>
                        ) : (
                          <Badge variant="secondary">Locked</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#8B1538]" />
                      Top Contributors
                    </CardTitle>
                    <CardDescription>See how you rank against other students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.map((entry) => (
                        <div key={entry.user_id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted">
                          <div className="text-2xl font-bold text-muted-foreground w-8">{entry.rank}</div>
                          <Avatar>
                            <AvatarFallback className="bg-[#8B1538] text-white">
                              {getInitials(entry.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{entry.full_name}</p>
                            <p className="text-sm text-muted-foreground">{entry.total_points} points</p>
                          </div>
                          {entry.rank <= 3 && (
                            <Trophy
                              className={`w-6 h-6 ${
                                entry.rank === 1
                                  ? "text-yellow-500"
                                  : entry.rank === 2
                                    ? "text-gray-400"
                                    : "text-amber-600"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
