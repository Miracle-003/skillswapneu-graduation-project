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
  const courses
