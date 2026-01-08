"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

/* ============================
   TYPES
============================ */

const NOT_SPECIFIED = "Not specified"

interface UserProfile {
  user_id: string
  courses?: string[] | string
  interests?: string[] | string
  major?: string
  year?: string
  learning_style?: string
  study_preference?: string
}

interface MatchResult {
  user_id: string
  match_score: number
  mutual_teaching_opportunities: string[]
  mutual_learning_opportunities: string[]
  reasons: string[]
  profile_completeness: number
}

/* ============================
   HELPERS
============================ */

function ensureArray(value?: string[] | string): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : [value]
    } catch {
      return [value]
    }
  }
  return []
}

/* ============================
   SCORING
============================ */

const PROFILE_COMPLETENESS = {
  courses: 25,
  interests: 25,
  major: 20,
  year: 10,
  learning_style: 10,
  study_preference: 10,
}

const MATCH_POINTS = {
  mutual: 50,
  complete: 10,
  partial: 5,
}

/* ============================
   CORE MATCHING LOGIC
============================ */

function profileCompleteness(user: UserProfile): number {
  let score = 0

  if (ensureArray(user.courses).length) score += PROFILE_COMPLETENESS.courses
  if (ensureArray(user.interests).length) score += PROFILE_COMPLETENESS.interests
  if (user.major && user.major !== NOT_SPECIFIED) score += PROFILE_COMPLETENESS.major
  if (user.year && user.year !== NOT_SPECIFIED) score += PROFILE_COMPLETENESS.year
  if (user.learning_style && user.learning_style !== NOT_SPECIFIED)
    score += PROFILE_COMPLETENESS.learning_style
  if (user.study_preference && user.study_preference !== NOT_SPECIFIED)
    score += PROFILE_COMPLETENESS.study_preference

  return score
}

function calculateMatch(
  current: UserProfile,
  other: UserProfile
): MatchResult {
  const currentCourses = ensureArray(current.courses)
  const currentInterests = ensureArray(current.interests)
  const otherCourses = ensureArray(other.courses)
  const otherInterests = ensureArray(other.interests)

  const otherInterestsSet = new Set(otherInterests.map(i => i.toLowerCase()))
  const otherCoursesSet = new Set(otherCourses.map(c => c.toLowerCase()))

  const teaching = currentCourses.filter(c =>
    otherInterestsSet.has(c.toLowerCase())
  )

  const learning = currentInterests.filter(i =>
    otherCoursesSet.has(i.toLowerCase())
  )

  // 🚫 NO MUTUAL MATCH → NO MATCH (FIXES 0%)
  if (teaching.length === 0 && learning.length === 0) {
    return {
      user_id: other.user_id,
      match_score: 0,
      mutual_teaching_opportunities: [],
      mutual_learning_opportunities: [],
      reasons: [],
      profile_completeness: profileCompleteness(other),
    }
  }

  let score = (teaching.length + learning.length) * MATCH_POINTS.mutual
  const reasons: string[] = []

  if (teaching.length) reasons.push("You can teach them a course they want")
  if (learning.length) reasons.push("They can teach you a course you want")

  const completeness = profileCompleteness(other)

  if (completeness >= 80) score += MATCH_POINTS.complete
  else if (completeness >= 50) score += MATCH_POINTS.partial

  return {
    user_id: other.user_id,
    match_score: Math.min(score, 100),
    mutual_teaching_opportunities: teaching,
    mutual_learning_opportunities: learning,
    reasons,
    profile_completeness: completeness,
  }
}

/* ============================
   PAGE
============================ */

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔁 REPLACE with NeonDB fetch
    const currentUser: UserProfile = {
      user_id: "me",
      courses: ["CS101"],
      interests: ["MATH201"],
    }

    const users: UserProfile[] = [
      {
        user_id: "u1",
        courses: ["MATH201"],
        interests: ["CS101"],
        major: "CS",
      },
    ]

    const results = users
      .map(u => calculateMatch(currentUser, u))
      .filter(m => m.match_score > 0)

    setMatches(results)
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/dashboard">← Back</Link>

        <h1 className="text-2xl font-bold">Your Matches</h1>

        {loading && <p>Loading…</p>}

        {!loading && matches.length === 0 && (
          <p>No matches yet.</p>
        )}

        {!loading &&
          matches.map(m => (
            <div key={m.user_id} className="border p-4 rounded">
              <p className="font-semibold">
                Match Score: {m.match_score}%
              </p>
              <ul className="list-disc ml-5 text-sm">
                {m.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  )
}
