interface UserProfile {
  user_id: string
  courses: string[]
  interests: string[]
  major: string
  year?: string
  learning_style: string
  study_preference: string
}

interface MatchResult {
  user_id: string
  match_score: number
  common_courses: string[]
  common_interests: string[]
  reasons: string[]
  profile_completeness: number
}

// Constants
export const NOT_SPECIFIED = 'Not specified'

// Scoring constants for profile completeness
const PROFILE_COMPLETENESS_WEIGHTS = {
  courses: 25,
  interests: 25,
  major: 20,
  year: 10,
  learning_style: 10,
  study_preference: 10,
} as const

// Scoring constants for match calculation
const MATCH_SCORE_WEIGHTS = {
  interest: 40,           // Per shared interest
  course: 20,             // Per common course
  same_major: 10,
  has_major: 5,           // Base score for having a major
  same_year: 5,
  learning_style: 5,
  study_preference: 5,
  complete_profile: 10,   // Bonus for 80%+ complete
  partial_profile: 5,     // Bonus for 50%+ complete
} as const

// Calculate profile completeness score (0-100)
export function calculateProfileCompleteness(profile: UserProfile): number {
  let completeness = 0

  if (profile.courses && profile.courses.length > 0) completeness += PROFILE_COMPLETENESS_WEIGHTS.courses
  if (profile.interests && profile.interests.length > 0) completeness += PROFILE_COMPLETENESS_WEIGHTS.interests
  if (profile.major && profile.major !== NOT_SPECIFIED) completeness += PROFILE_COMPLETENESS_WEIGHTS.major
  if (profile.year && profile.year !== NOT_SPECIFIED) completeness += PROFILE_COMPLETENESS_WEIGHTS.year
  if (profile.learning_style && profile.learning_style !== NOT_SPECIFIED) completeness += PROFILE_COMPLETENESS_WEIGHTS.learning_style
  if (profile.study_preference && profile.study_preference !== NOT_SPECIFIED) completeness += PROFILE_COMPLETENESS_WEIGHTS.study_preference

  return completeness
}

export function calculateMatchScore(currentUser: UserProfile, otherUser: UserProfile): MatchResult {
  const commonCourses = otherUser.courses?.filter((course) => currentUser.courses?.includes(course)) || []
  const commonInterests = otherUser.interests?.filter((interest) => currentUser.interests?.includes(interest)) || []

  let score = 0
  const reasons: string[] = []

  // Interest overlap (PRIMARY FACTOR)
  if (commonInterests.length > 0) {
    const interestPoints = commonInterests.length * MATCH_SCORE_WEIGHTS.interest
    score += interestPoints
    reasons.push(`${commonInterests.length} shared interest${commonInterests.length > 1 ? "s" : ""}`)
  }

  // Course overlap
  if (commonCourses.length > 0) {
    const coursePoints = commonCourses.length * MATCH_SCORE_WEIGHTS.course
    score += coursePoints
    reasons.push(`${commonCourses.length} common course${commonCourses.length > 1 ? "s" : ""}`)
  }

  // Same major
  if (otherUser.major && currentUser.major && 
      otherUser.major !== NOT_SPECIFIED && currentUser.major !== NOT_SPECIFIED &&
      otherUser.major === currentUser.major) {
    score += MATCH_SCORE_WEIGHTS.same_major
    reasons.push("Same major")
  } else if (otherUser.major && otherUser.major !== NOT_SPECIFIED) {
    // Base score for having a major defined
    score += MATCH_SCORE_WEIGHTS.has_major
    reasons.push("Has profile info")
  }

  // Same year
  if (otherUser.year && currentUser.year && 
      otherUser.year !== NOT_SPECIFIED && currentUser.year !== NOT_SPECIFIED &&
      otherUser.year === currentUser.year) {
    score += MATCH_SCORE_WEIGHTS.same_year
    reasons.push("Same year")
  }

  // Compatible learning style
  if (otherUser.learning_style && currentUser.learning_style &&
      otherUser.learning_style !== NOT_SPECIFIED && currentUser.learning_style !== NOT_SPECIFIED &&
      otherUser.learning_style === currentUser.learning_style) {
    score += MATCH_SCORE_WEIGHTS.learning_style
    reasons.push("Compatible learning style")
  }

  // Compatible study time
  if (otherUser.study_preference && currentUser.study_preference &&
      otherUser.study_preference !== NOT_SPECIFIED && currentUser.study_preference !== NOT_SPECIFIED &&
      otherUser.study_preference === currentUser.study_preference) {
    score += MATCH_SCORE_WEIGHTS.study_preference
    reasons.push("Similar study schedule")
  }

  // Calculate profile completeness
  const profileCompleteness = calculateProfileCompleteness(otherUser)

  // Bonus points for profile completeness
  if (profileCompleteness >= 80) {
    score += MATCH_SCORE_WEIGHTS.complete_profile
    reasons.push("Complete profile")
  } else if (profileCompleteness >= 50) {
    score += MATCH_SCORE_WEIGHTS.partial_profile
  }

  // Cap at 100
  score = Math.min(score, 100)

  return {
    user_id: otherUser.user_id,
    match_score: score,
    common_courses: commonCourses,
    common_interests: commonInterests,
    reasons,
    profile_completeness: profileCompleteness,
  }
}

export function rankMatches(currentUser: UserProfile, potentialMatches: UserProfile[]): MatchResult[] {
  // Calculate scores for all matches, don't filter out zero scores
  const rankedMatches = potentialMatches
    .map((match) => calculateMatchScore(currentUser, match))
    .sort((a, b) => {
      // Sort by match score first (descending)
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score
      }
      // If same score, sort by profile completeness (descending)
      return b.profile_completeness - a.profile_completeness
    })

  console.log(`[Matching Algorithm] Ranked ${rankedMatches.length} matches`)
  console.log(`[Matching Algorithm] Top 3 scores:`, rankedMatches.slice(0, 3).map(m => ({
    score: m.match_score,
    completeness: m.profile_completeness,
    reasons: m.reasons
  })))

  return rankedMatches
}
