interface UserProfile {
  user_id: string
  courses: string[]
  interests: string[]
  major: string
  learning_style: string
  study_preference: string
}

interface MatchResult {
  user_id: string
  match_score: number
  common_courses: string[]
  common_interests: string[]
  reasons: string[]
}

export function calculateMatchScore(currentUser: UserProfile, otherUser: UserProfile): MatchResult {
  const commonCourses = otherUser.courses.filter((course) => currentUser.courses.includes(course))
  const commonInterests = otherUser.interests.filter((interest) => currentUser.interests.includes(interest))

  let score = 0
  const reasons: string[] = []

  // Course overlap (highest weight)
  if (commonCourses.length > 0) {
    const coursePoints = commonCourses.length * 30
    score += coursePoints
    reasons.push(`${commonCourses.length} common course${commonCourses.length > 1 ? "s" : ""}`)
  }

  // Interest overlap
  if (commonInterests.length > 0) {
    const interestPoints = commonInterests.length * 15
    score += interestPoints
    reasons.push(`${commonInterests.length} shared interest${commonInterests.length > 1 ? "s" : ""}`)
  }

  // Same major
  if (otherUser.major === currentUser.major) {
    score += 20
    reasons.push("Same major")
  }

  // Compatible learning style
  if (otherUser.learning_style === currentUser.learning_style) {
    score += 15
    reasons.push("Compatible learning style")
  }

  // Compatible study time
  if (otherUser.study_preference === currentUser.study_preference) {
    score += 10
    reasons.push("Similar study schedule")
  }

  // Cap at 100
  score = Math.min(score, 100)

  return {
    user_id: otherUser.user_id,
    match_score: score,
    common_courses: commonCourses,
    common_interests: commonInterests,
    reasons,
  }
}

export function rankMatches(currentUser: UserProfile, potentialMatches: UserProfile[]): MatchResult[] {
  return potentialMatches
    .map((match) => calculateMatchScore(currentUser, match))
    .filter((result) => result.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
}
