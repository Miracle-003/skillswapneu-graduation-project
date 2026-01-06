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

// Calculate profile completeness score (0-100)
function calculateProfileCompleteness(profile: UserProfile): number {
  let completeness = 0
  const weights = {
    courses: 25,
    interests: 25,
    major: 20,
    year: 10,
    learning_style: 10,
    study_preference: 10,
  }

  if (profile.courses && profile.courses.length > 0) completeness += weights.courses
  if (profile.interests && profile.interests.length > 0) completeness += weights.interests
  if (profile.major && profile.major !== 'Not specified') completeness += weights.major
  if (profile.year && profile.year !== 'Not specified') completeness += weights.year
  if (profile.learning_style && profile.learning_style !== 'Not specified') completeness += weights.learning_style
  if (profile.study_preference && profile.study_preference !== 'Not specified') completeness += weights.study_preference

  return completeness
}

export function calculateMatchScore(currentUser: UserProfile, otherUser: UserProfile): MatchResult {
  const commonCourses = otherUser.courses?.filter((course) => currentUser.courses?.includes(course)) || []
  const commonInterests = otherUser.interests?.filter((interest) => currentUser.interests?.includes(interest)) || []

  let score = 0
  const reasons: string[] = []

  // Interest overlap (PRIMARY FACTOR - 40 points each)
  if (commonInterests.length > 0) {
    const interestPoints = commonInterests.length * 40
    score += interestPoints
    reasons.push(`${commonInterests.length} shared interest${commonInterests.length > 1 ? "s" : ""}`)
  }

  // Course overlap (20 points each)
  if (commonCourses.length > 0) {
    const coursePoints = commonCourses.length * 20
    score += coursePoints
    reasons.push(`${commonCourses.length} common course${commonCourses.length > 1 ? "s" : ""}`)
  }

  // Same major (10 points base score)
  if (otherUser.major && currentUser.major && 
      otherUser.major !== 'Not specified' && currentUser.major !== 'Not specified' &&
      otherUser.major === currentUser.major) {
    score += 10
    reasons.push("Same major")
  } else if (otherUser.major && otherUser.major !== 'Not specified') {
    // Small base score for having a major (5 points)
    score += 5
    reasons.push("Has profile info")
  }

  // Same year (5 points base score)
  if (otherUser.year && currentUser.year && 
      otherUser.year !== 'Not specified' && currentUser.year !== 'Not specified' &&
      otherUser.year === currentUser.year) {
    score += 5
    reasons.push("Same year")
  }

  // Compatible learning style (5 points)
  if (otherUser.learning_style && currentUser.learning_style &&
      otherUser.learning_style !== 'Not specified' && currentUser.learning_style !== 'Not specified' &&
      otherUser.learning_style === currentUser.learning_style) {
    score += 5
    reasons.push("Compatible learning style")
  }

  // Compatible study time (5 points)
  if (otherUser.study_preference && currentUser.study_preference &&
      otherUser.study_preference !== 'Not specified' && currentUser.study_preference !== 'Not specified' &&
      otherUser.study_preference === currentUser.study_preference) {
    score += 5
    reasons.push("Similar study schedule")
  }

  // Calculate profile completeness
  const profileCompleteness = calculateProfileCompleteness(otherUser)

  // Bonus points for profile completeness (up to 10 points)
  if (profileCompleteness >= 80) {
    score += 10
    reasons.push("Complete profile")
  } else if (profileCompleteness >= 50) {
    score += 5
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
