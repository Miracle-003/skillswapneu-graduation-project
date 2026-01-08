import { ensureArray } from "./utils/array-helpers"

export const NOT_SPECIFIED = "Not specified"

interface UserProfile {
  user_id: string
  courses?: string[] | string
  interests?: string[] | string
  major?: string
  year?: string
  learning_style?: string
  study_preference?: string
}

export interface MatchResult {
  user_id: string
  match_score: number
  common_courses: string[]
  common_interests: string[]
  mutual_teaching_opportunities: string[]
  mutual_learning_opportunities: string[]
  reasons: string[]
  profile_completeness: number
}

const PROFILE_COMPLETENESS_WEIGHTS = {
  courses: 25,
  interests: 25,
  major: 20,
  year: 10,
  learning_style: 10,
  study_preference: 10,
} as const

const MATCH_SCORE_WEIGHTS = {
  interest: 40,
  course: 20,
  mutual_match: 50,
  same_major: 10,
  has_major: 5,
  same_year: 5,
  learning_style: 5,
  study_preference: 5,
  complete_profile: 10,
  partial_profile: 5,
} as const

export function calculateProfileCompleteness(profile: UserProfile): number {
  let score = 0

  if (ensureArray(profile.courses).length > 0) score += PROFILE_COMPLETENESS_WEIGHTS.courses
  if (ensureArray(profile.interests).length > 0) score += PROFILE_COMPLETENESS_WEIGHTS.interests
  if (profile.major && profile.major !== NOT_SPECIFIED) score += PROFILE_COMPLETENESS_WEIGHTS.major
  if (profile.year && profile.year !== NOT_SPECIFIED) score += PROFILE_COMPLETENESS_WEIGHTS.year
  if (profile.learning_style && profile.learning_style !== NOT_SPECIFIED)
    score += PROFILE_COMPLETENESS_WEIGHTS.learning_style
  if (profile.study_preference && profile.study_preference !== NOT_SPECIFIED)
    score += PROFILE_COMPLETENESS_WEIGHTS.study_preference

  return score
}

export function calculateMatchScore(
  currentUser: UserProfile,
  otherUser: UserProfile
): MatchResult {
  const currentCourses = ensureArray(currentUser.courses)
  const currentInterests = ensureArray(currentUser.interests)
  const otherCourses = ensureArray(otherUser.courses)
  const otherInterests = ensureArray(otherUser.interests)

  const currentCoursesLower = new Set(currentCourses.map(c => c.toLowerCase()))
  const currentInterestsLower = new Set(currentInterests.map(i => i.toLowerCase()))
  const otherCoursesLower = new Set(otherCourses.map(c => c.toLowerCase()))
  const otherInterestsLower = new Set(otherInterests.map(i => i.toLowerCase()))

  const commonCourses = otherCourses.filter(c =>
    currentCoursesLower.has(c.toLowerCase())
  )

  const commonInterests = otherInterests.filter(i =>
    currentInterestsLower.has(i.toLowerCase())
  )

  const mutualTeachingOpportunities = currentCourses.filter(c =>
    otherInterestsLower.has(c.toLowerCase())
  )

  const mutualLearningOpportunities = currentInterests.filter(i =>
    otherCoursesLower.has(i.toLowerCase())
  )

  let score = 0
  const reasons: string[] = []

  if (
    mutualTeachingOpportunities.length === 0 &&
    mutualLearningOpportunities.length === 0
  ) {
    // ❗ REQUIRED MATCH DEFINITION
    return {
      user_id: otherUser.user_id,
      match_score: 0,
      common_courses: [],
      common_interests: [],
      mutual_teaching_opportunities: [],
      mutual_learning_opportunities: [],
      reasons: [],
      profile_completeness: calculateProfileCompleteness(otherUser),
    }
  }

  score += mutualTeachingOpportunities.length * MATCH_SCORE_WEIGHTS.mutual_match
  score += mutualLearningOpportunities.length * MATCH_SCORE_WEIGHTS.mutual_match

  if (mutualTeachingOpportunities.length > 0)
    reasons.push("You can teach them a course they want")

  if (mutualLearningOpportunities.length > 0)
    reasons.push("They can teach you a course you want")

  score += commonInterests.length * MATCH_SCORE_WEIGHTS.interest
  score += commonCourses.length * MATCH_SCORE_WEIGHTS.course

  if (commonInterests.length > 0) reasons.push("Shared interests")
  if (commonCourses.length > 0) reasons.push("Common courses")

  if (
    currentUser.major &&
    otherUser.major &&
    currentUser.major === otherUser.major &&
    currentUser.major !== NOT_SPECIFIED
  ) {
    score += MATCH_SCORE_WEIGHTS.same_major
    reasons.push("Same major")
  }

  const completeness = calculateProfileCompleteness(otherUser)

  if (completeness >= 80) score += MATCH_SCORE_WEIGHTS.complete_profile
  else if (completeness >= 50) score += MATCH_SCORE_WEIGHTS.partial_profile

  return {
    user_id: otherUser.user_id,
    match_score: Math.min(score, 100),
    common_courses: commonCourses,
    common_interests: commonInterests,
    mutual_teaching_opportunities: mutualTeachingOpportunities,
    mutual_learning_opportunities: mutualLearningOpportunities,
    reasons,
    profile_completeness: completeness,
  }
}

export function rankMatches(
  currentUser: UserProfile,
  potentialMatches: UserProfile[]
): MatchResult[] {
  return potentialMatches
    .map(user => calculateMatchScore(currentUser, user))
    .filter(match => match.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
}
