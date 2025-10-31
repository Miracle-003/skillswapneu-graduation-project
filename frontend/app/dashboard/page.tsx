"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Users, MessageSquare, BookOpen, FileText, Trophy, Sparkles, Bell, MapPin } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [email, setEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth/login")
        return
      }
      setEmail(user.email)

      const { data: prof } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      setProfile(prof ?? null)

      await loadNotificationCount(user.id)

      setLoading(false)
    }

    void init()
  }, [])

  const loadNotificationCount = async (userId: string) => {
    try {
      const { count: pendingConnections } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .eq("user_id_2", userId)
        .eq("status", "pending")

      const { count: unreadMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      setNotificationCount((pendingConnections || 0) + (unreadMessages || 0))
    } catch (err) {
      console.error("[v0] Error loading notification count:", err)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#8B1538] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">skill swap</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end min-w-0 max-w-full">
            <Button asChild variant="ghost" size="sm" className="relative px-2 sm:px-3">
              <Link href="/dashboard/notifications" className="inline-flex items-center">
                <Bell className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Notifications</span>
                {notificationCount > 0 && (
                  <Badge className="ml-1 sm:ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-0 h-5 min-w-5">
                    {notificationCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
              <Link href="/dashboard/achievements" className="inline-flex items-center">
                <Trophy className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Achievements</span>
              </Link>
            </Button>
            <span className="hidden sm:inline-block max-w-[160px] truncate text-sm text-muted-foreground">{email}</span>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="px-2 sm:px-3">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground">Start connecting with study partners and achieve your academic goals</p>
        </div>

        {!profile && (
          <Card className="mb-6 border-[#8B1538] bg-gradient-to-r from-[#8B1538]/5 to-[#C73659]/5">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Get Started with AI Onboarding</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with our AI assistant to learn how to make the most of skill swap
                  </p>
                </div>
                <Button asChild className="bg-[#8B1538] hover:bg-[#A91D3A]">
                  <Link href="/dashboard/onboarding">Start Onboarding</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{profile ? "Edit Your Profile" : "Complete Your Profile"}</CardTitle>
              <CardDescription>Add your courses, interests, and learning preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#8B1538] hover:bg-[#A91D3A]">
                <Link href="/dashboard/profile">{profile ? "Edit Profile" : "Setup Profile"}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Find Study Partners</CardTitle>
              <CardDescription>Get matched with compatible peers in your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/dashboard/matches">Browse Matches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Start Chatting</CardTitle>
              <CardDescription>Connect with your study buddies in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/dashboard/chat">Open Messages</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-[#8B1538] rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Peer Reviews</CardTitle>
              <CardDescription>Get feedback and help others improve</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/dashboard/reviews">View Reviews</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Study Locations</CardTitle>
              <CardDescription>Find the best places to study on campus</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/dashboard/study-locations">View Map</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
