"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Match {
  user_id: string
  match_score: number
  reasons: string[]
}

export default function MatchesPage() {
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        // TEMP SAFE FETCH — replace later if needed
        const res = await fetch("/api/matches")

        if (!res.ok) {
          throw new Error("Failed to load matches")
        }

        const data = await res.json()
        setMatches(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [])

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

        <h1 className="text-2xl font-bold">Your Matches</h1>

        {loading && <p>Loading matches...</p>}

        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

        {!loading && !error && matches.length === 0 && (
          <p className="text-muted-foreground">
            No matches yet. Try completing your profile.
          </p>
        )}

        {!loading && matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.user_id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <p className="font-medium">
                  Match score: {match.match_score}%
                </p>

                {match.reasons?.length > 0 && (
                  <ul className="list-disc ml-5 text-sm text-muted-foreground">
                    {match.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}