"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, FileText, Plus, Star } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Submission {
  id: string
  title: string
  description: string
  course: string
  file_url: string
  status: string
  created_at: string
  author_name: string
  author_id: string
  review_count: number
  avg_rating: number
}

export default function ReviewsPage() {
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
  const [availableReviews, setAvailableReviews] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load user's submissions
      const { data: submissions } = await supabase
        .from("peer_review_submissions")
        .select("*, user_profiles!peer_review_submissions_user_id_fkey(full_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (submissions) {
        const formattedSubmissions = await Promise.all(
          submissions.map(async (sub) => {
            const { data: reviews } = await supabase.from("peer_reviews").select("rating").eq("submission_id", sub.id)

            const reviewCount = reviews?.length || 0
            const avgRating = reviewCount > 0 ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0

            return {
              id: sub.id,
              title: sub.title,
              description: sub.description,
              course: sub.course,
              file_url: sub.file_url,
              status: sub.status,
              created_at: sub.created_at,
              author_name: sub.user_profiles.full_name,
              author_id: sub.user_id,
              review_count: reviewCount,
              avg_rating: avgRating,
            }
          }),
        )
        setMySubmissions(formattedSubmissions)
      }

      // Load available submissions to review (from connections)
      const { data: connections } = await supabase
        .from("connections")
        .select("user_id_2")
        .eq("user_id_1", user.id)
        .eq("status", "accepted")

      const connectedIds = connections?.map((c) => c.user_id_2) || []

      if (connectedIds.length > 0) {
        const { data: availableSubs } = await supabase
          .from("peer_review_submissions")
          .select("*, user_profiles!peer_review_submissions_user_id_fkey(full_name)")
          .in("user_id", connectedIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10)

        if (availableSubs) {
          const formattedAvailable = await Promise.all(
            availableSubs.map(async (sub) => {
              const { data: reviews } = await supabase.from("peer_reviews").select("rating").eq("submission_id", sub.id)

              const reviewCount = reviews?.length || 0
              const avgRating = reviewCount > 0 ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0

              return {
                id: sub.id,
                title: sub.title,
                description: sub.description,
                course: sub.course,
                file_url: sub.file_url,
                status: sub.status,
                created_at: sub.created_at,
                author_name: sub.user_profiles.full_name,
                author_id: sub.user_id,
                review_count: reviewCount,
                avg_rating: avgRating,
              }
            }),
          )
          setAvailableReviews(formattedAvailable)
        }
      }
    } catch (err) {
      console.error("[v0] Error loading reviews:", err)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <Button asChild className="bg-[#8B1538] hover:bg-[#A91D3A]">
            <Link href="/dashboard/reviews/submit">
              <Plus className="w-4 h-4 mr-2" />
              Submit Work
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Peer Reviews</h1>
          <p className="text-muted-foreground">Submit your work for feedback and help others improve</p>
        </div>

        <Tabs defaultValue="my-submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
            <TabsTrigger value="review-others">Review Others</TabsTrigger>
          </TabsList>

          <TabsContent value="my-submissions" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading your submissions...</p>
              </div>
            ) : mySubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground mb-4">Submit your work to get feedback from study partners</p>
                  <Button asChild className="bg-[#8B1538] hover:bg-[#A91D3A]">
                    <Link href="/dashboard/reviews/submit">Submit Work</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {mySubmissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{submission.title}</CardTitle>
                      <CardDescription>{submission.course}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{submission.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-[#8B1538]" />
                            <span>{submission.review_count} reviews</span>
                          </div>
                          {submission.avg_rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{submission.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/reviews/${submission.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review-others" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading available reviews...</p>
              </div>
            ) : availableReviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No submissions available</h3>
                  <p className="text-muted-foreground">Connect with more study partners to see their submissions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {availableReviews.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarFallback className="bg-[#8B1538] text-white">
                            {getInitials(submission.author_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{submission.author_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{submission.title}</CardTitle>
                      <CardDescription>{submission.course}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{submission.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{submission.review_count} reviews</span>
                        </div>
                        <Button asChild className="bg-[#8B1538] hover:bg-[#A91D3A]">
                          <Link href={`/dashboard/reviews/${submission.id}/review`}>Review</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
