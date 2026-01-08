/**
 * Matching Algorithm for SkillSwap NEU
 *
 * Updated to meet new requirements:
 * 1. A match is defined as: any user whose interests include a course offered by another user
 * 2. Match suggestions are automatically generated and stored in the matches table
 * 3. Connections are only created when two users mutually accept a match
 * 4. The algorithm handles array/string mismatches due to serialization
 *
 * This algorithm is used on the "Find Your Partner" page to calculate match scores
 * and display match suggestions to users.
 */

import { ensureArray } from "./utils/array-helpers"

interface UserProfile {
  user_id: string
  courses?: string[] | string
  interests?: string[] | string
  major?: string
  year?: string
  learning_style?: string
  study_preference?: string

  // Allow camelCase input from frontend / DB
  learningStyle?: string
  studyPreference?: string
}

interface MatchResult {
  user_id: string
  match_score: number
  common_courses: string[]
  common_interests: string[]
  mutual_teaching_opportunities: string[]
  mutual_learning_opportunities: string[]
  reasons: string[]
  profile_completeness: number
}

export const NOT_SPECIFIED = "Not specified"

/* ----------------------------------------
   COMPLETENESS WEIGHTS
---------------------------------------- */
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

/* ----------------------------------------
   NORMALIZATION FIX (IMPORTANT)
---------------------------------------- */
function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    learning_style:
      profile.learning_style ?? profile.learningStyle ?? NOT_SPECIFIED,
    study_preference:
      profile.study_preference ?? profile.studyPreference ?? NOT_SPECIFIED,
  }
}

/* ----------------------------------------
   PROFILE COMPLETENESS
---------------------------------------- */
export function calculateProfileCompleteness(profile: UserProfile): number {
  const normalized = normalizeProfile(profile)

  let completeness = 0
  const courses = ensureArray(normalized.courses)
  const interests = ensureArray(normalized.interests)

  if (courses.length > 0) completeness += PROFILE_COMPLETENESS_WEIGHTS.courses
  if (interests.length > 0) completeness += PROFILE_COMPLETENESS_WEIGHTS.interests
  if (normalized.major && normalized.major !== NOT_SPECIFIED)
    completeness += PROFILE_COMPLETENESS_WEIGHTS.major
  if (normalized.year && normalized.year !== NOT_SPECIFIED)
    completeness += PROFILE_COMPLETENESS_WEIGHTS.year
  if (
    normalized.learning_style &&
    normalized.learning_style !== NOT_SPECIFIED
  )
    completeness += PROFILE_COMPLETENESS_WEIGHTS.learning_style
  if (
    normalized.study_preference &&
    normalized.study_preference !== NOT_SPECIFIED
  )
    completeness += PROFILE_COMPLETENESS_WEIGHTS.study_preference

  return completeness
}

/* ----------------------------------------
   MATCH SCORING
---------------------------------------- */
export function calculateMatchScore(
  currentUser: UserProfile,
  otherUser: UserProfile
): MatchResult {
  const current = normalizeProfile(currentUser)
  const other = normalizeProfile(otherUser)

  const currentCourses = ensureArray(current.courses)
  const currentInterests = ensureArray(current.interests)
  const otherCourses = ensureArray(other.courses)
  const otherInterests = ensureArray(other.interests)

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

  if (mutualTeachingOpportunities.length > 0) {
    score +=
      mutualTeachingOpportunities.length *
      MATCH_SCORE_WEIGHTS.mutual_match
    reasons.push(
      `You can teach ${mutualTeachingOpportunities.length} course(s)`
    )
  }

  if (mutualLearningOpportunities.length > 0) {
    score +=
      mutualLearningOpportunities.length *
      MATCH_SCORE_WEIGHTS.mutual_match
    reasons.push(
      `They can teach ${mutualLearningOpportunities.length} course(s)`
    )
  }

  if (commonInterests.length > 0) {
    score += commonInterests.length * MATCH_SCORE_WEIGHTS.interest
    reasons.push(`${commonInterests.length} shared interest(s)`)
  }

  if (commonCourses.length > 0) {
    score += commonCourses.length * MATCH_SCORE_WEIGHTS.course
    reasons.push(`${commonCourses.length} common course(s)`)
  }

  if (
    current.major &&
    other.major &&
    current.major === other.major &&
    current.major !== NOT_SPECIFIED
  ) {
    score += MATCH_SCORE_WEIGHTS.same_major
    reasons.push("Same major")
  } else if (other.major && other.major !== NOT_SPECIFIED) {
    score += MATCH_SCORE_WEIGHTS.has_major
    reasons.push("Major specified")
  }

  if (
    current.year &&
    other.year &&
    current.year === other.year &&
    current.year !== NOT_SPECIFIED
  ) {
    score += MATCH_SCORE_WEIGHTS.same_year
    reasons.push("Same year")
  }

  if (
    current.learning_style === other.learning_style &&
    current.learning_style !== NOT_SPECIFIED
  ) {
    score += MATCH_SCORE_WEIGHTS.learning_style
    reasons.push("Compatible learning style")
  }

  if (
    current.study_preference === other.study_preference &&
    current.study_preference !== NOT_SPECIFIED
  ) {
    score += MATCH_SCORE_WEIGHTS.study_preference
    reasons.push("Similar study schedule")
  }

  const profileCompleteness = calculateProfileCompleteness(other)

  if (profileCompleteness >= 80) {
    score += MATCH_SCORE_WEIGHTS.complete_profile
    reasons.push("Complete profile")
  } else if (profileCompleteness >= 50) {
    score += MATCH_SCORE_WEIGHTS.partial_profile
  }

  score = Math.min(score, 100)

  return {
    user_id: other.user_id,
    match_score: score,
    common_courses: commonCourses,
    common_interests: commonInterests,
    mutual_teaching_opportunities: mutualTeachingOpportunities,
    mutual_learning_opportunities: mutualLearningOpportunities,
    reasons,
    profile_completeness: profileCompleteness,
  }
}

/* ----------------------------------------
   RANK MATCHES
---------------------------------------- */
export function rankMatches(
  currentUser: UserProfile,
  potentialMatches: UserProfile[]
): MatchResult[] {
  return potentialMatches
    .map(match => calculateMatchScore(currentUser, match))
    .sort((a, b) =>
      b.match_score !== a.match_score
        ? b.match_score - a.match_score
        : b.profile_completeness - a.profile_completeness
    )
}
