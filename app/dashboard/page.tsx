import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Users, MessageSquare, BookOpen, FileText, Trophy, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B1538] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Study Buddy</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/achievements">
                <Trophy className="w-4 h-4 mr-2" />
                Achievements
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                    Chat with our AI assistant to learn how to make the most of Study Buddy
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
        </div>
      </main>
    </div>
  )
}
