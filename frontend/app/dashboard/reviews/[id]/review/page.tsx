"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, Star, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Submission {
  id: string
  title: string
  description: string
  course: string
  file_url: string
  author_name: string
  author_id: string
}

export default function ReviewSubmissionPage() {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadSubmission()
  }, [])

  const loadSubmission = async () => {
    try {
      const { data } = await supabase
        .from("peer_review_submissions")
        .select("*, user_profiles!peer_review_submissions_user_id_fkey(full_name)")
        .eq("id", params.id)
        .single()

      if (data) {
        setSubmission({
          id: data.id,
          title: data.title,
          description: data.description,
          course: data.course,
          file_url: data.file_url,
          author_name: data.user_profiles.full_name,
          author_id: data.user_id,
        })
      }
    } catch (err) {
      console.error("[v0] Error loading submission:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setError("")
    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: reviewError } = await supabase.from("peer_reviews").insert({
        submission_id: params.id,
        reviewer_id: user.id,
        rating,
        feedback,
      })

      if (reviewError) throw reviewError

      router.push("/dashboard/reviews")
    } catch (err: any) {
      setError(err.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading submission...</p>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Submission not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/reviews"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reviews
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Review Submission</h1>
          <p className="text-muted-foreground">Provide constructive feedback to help your study partner improve</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#8B1538] text-white">
                    {getInitials(submission.author_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{submission.author_name}</p>
                  <p className="text-sm text-muted-foreground">{submission.course}</p>
                </div>
              </div>
              <CardTitle className="text-2xl">{submission.title}</CardTitle>
              <CardDescription>{submission.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Submission
                </a>
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
              <CardDescription>Rate the work and provide helpful feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, and constructive criticism..."
                  rows={6}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || rating === 0}
                  className="flex-1 bg-[#8B1538] hover:bg-[#A91D3A]"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
