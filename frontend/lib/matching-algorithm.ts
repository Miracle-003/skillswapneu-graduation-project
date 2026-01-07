interface UserProfile {
  user_id: string
  courses?: string[]
  interests?: string[]
  major?: string
  year?: string
  learning_style?: string
  study_preference?: string
}

interface MatchResult {
  user_id: string
  match_score: number
  common_courses: string[]
  common_interests: string[]
  mutual_teaching_opportunities: string[]  // Current user can teach (courses) → other wants to learn (interests)
  mutual_learning_opportunities: string[]  // Current user wants to learn (interests) → other can teach (courses)
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
  mutual_match: 50,       // Per mutual teaching/learning opportunity (HIGH PRIORITY)
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
  // Create lowercase Sets for case-insensitive comparison with O(1) lookup performance
  // This ensures 'BNS101', 'bns101', and 'BnS101' are treated as the same course/interest
  const currentUserCoursesLower = new Set((currentUser.courses || []).map(c => c.toLowerCase()))
  const currentUserInterestsLower = new Set((currentUser.interests || []).map(i => i.toLowerCase()))
  const otherUserCoursesLower = new Set((otherUser.courses || []).map(c => c.toLowerCase()))
  const otherUserInterestsLower = new Set((otherUser.interests || []).map(i => i.toLowerCase()))

  // Find common courses using case-insensitive comparison, but preserve original casing for display
  const commonCourses = (otherUser.courses || []).filter((course) => 
    currentUserCoursesLower.has(course.toLowerCase())
  )
  
  // Find common interests using case-insensitive comparison, but preserve original casing for display
  const commonInterests = (otherUser.interests || []).filter((interest) => 
    currentUserInterestsLower.has(interest.toLowerCase())
  )

  // MUTUAL MATCHING: Check if one user's interests match another user's courses
  // Current user can TEACH (their courses) what other user wants to LEARN (their interests)
  // Use case-insensitive comparison to match course names regardless of capitalization
  const mutualTeachingOpportunities = (currentUser.courses || []).filter((course) => 
    otherUserInterestsLower.has(course.toLowerCase())
  )
  
  // Current user wants to LEARN (their interests) what other user can TEACH (their courses)
  // Use case-insensitive comparison to match course names regardless of capitalization
  const mutualLearningOpportunities = (currentUser.interests || []).filter((interest) => 
    otherUserCoursesLower.has(interest.toLowerCase())
  )

  let score = 0
  const reasons: string[] = []

  // Log mutual matching for debugging
  console.log(`[Matching Algorithm] Calculating score for ${currentUser.user_id} → ${otherUser.user_id}`)
  console.log(`  - Current user courses: [${(currentUser.courses || []).join(', ')}]`)
  console.log(`  - Current user interests: [${(currentUser.interests || []).join(', ')}]`)
  console.log(`  - Other user courses: [${(otherUser.courses || []).join(', ')}]`)
  console.log(`  - Other user interests: [${(otherUser.interests || []).join(', ')}]`)
  console.log(`  - Mutual teaching opportunities: [${mutualTeachingOpportunities.join(', ')}]`)
  console.log(`  - Mutual learning opportunities: [${mutualLearningOpportunities.join(', ')}]`)

  // MUTUAL TEACHING/LEARNING (HIGHEST PRIORITY)
  if (mutualTeachingOpportunities.length > 0) {
    const mutualTeachingPoints = mutualTeachingOpportunities.length * MATCH_SCORE_WEIGHTS.mutual_match
    score += mutualTeachingPoints
    reasons.push(`You can teach ${mutualTeachingOpportunities.length} course${mutualTeachingOpportunities.length > 1 ? "s" : ""} they want to learn`)
    console.log(`  → Added ${mutualTeachingPoints} points for teaching opportunities`)
  }

  if (mutualLearningOpportunities.length > 0) {
    const mutualLearningPoints = mutualLearningOpportunities.length * MATCH_SCORE_WEIGHTS.mutual_match
    score += mutualLearningPoints
    reasons.push(`They can teach ${mutualLearningOpportunities.length} course${mutualLearningOpportunities.length > 1 ? "s" : ""} you want to learn`)
    console.log(`  → Added ${mutualLearningPoints} points for learning opportunities`)
  }

  // Interest overlap (shared interests)
  if (commonInterests.length > 0) {
    const interestPoints = commonInterests.length * MATCH_SCORE_WEIGHTS.interest
    score += interestPoints
    reasons.push(`${commonInterests.length} shared interest${commonInterests.length > 1 ? "s" : ""}`)
    console.log(`  → Added ${interestPoints} points for shared interests`)
  }

  // Course overlap (studying same courses)
  if (commonCourses.length > 0) {
    const coursePoints = commonCourses.length * MATCH_SCORE_WEIGHTS.course
    score += coursePoints
    reasons.push(`${commonCourses.length} common course${commonCourses.length > 1 ? "s" : ""}`)
    console.log(`  → Added ${coursePoints} points for common courses`)
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
    reasons.push("Major specified")
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

  console.log(`  → Final score: ${score}`)
  console.log(`  → Reasons: ${reasons.join(', ')}`)

  return {
    user_id: otherUser.user_id,
    match_score: score,
    common_courses: commonCourses,
    common_interests: commonInterests,
    mutual_teaching_opportunities: mutualTeachingOpportunities,
    mutual_learning_opportunities: mutualLearningOpportunities,
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
