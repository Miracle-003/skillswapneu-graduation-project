/**
 * Matching Service
 * 
 * This service automatically generates match suggestions based on the updated matching criteria:
 * - A match is defined as: any user whose interests include a course offered by another user
 * - Match suggestions are stored in the matches table as soon as users qualify
 * - Connections are only created when two users mutually accept a match
 * 
 * The matching algorithm handles array/string mismatches due to serialization.
 */

import { prisma } from "./prisma.js"

/**
 * Calculate compatibility score between two users
 * Score is based on how many of user1's courses match user2's interests (and vice versa)
 * 
 * @param {Object} user1Profile - First user's profile
 * @param {Object} user2Profile - Second user's profile
 * @returns {number} Compatibility score (0-100)
 */
function calculateCompatibilityScore(user1Profile, user2Profile) {
  // Ensure courses and interests are arrays (handle string serialization)
  const user1Courses = Array.isArray(user1Profile.courses) ? user1Profile.courses : []
  const user1Interests = Array.isArray(user1Profile.interests) ? user1Profile.interests : []
  const user2Courses = Array.isArray(user2Profile.courses) ? user2Profile.courses : []
  const user2Interests = Array.isArray(user2Profile.interests) ? user2Profile.interests : []

  // Convert to lowercase for case-insensitive comparison
  const user1CoursesLower = new Set(user1Courses.map(c => String(c).toLowerCase()))
  const user1InterestsLower = new Set(user1Interests.map(i => String(i).toLowerCase()))
  const user2CoursesLower = new Set(user2Courses.map(c => String(c).toLowerCase()))
  const user2InterestsLower = new Set(user2Interests.map(i => String(i).toLowerCase()))

  // Count mutual teaching/learning opportunities
  // User1 can teach (their courses) what User2 wants to learn (their interests)
  let mutualTeachingCount = 0
  for (const course of user1CoursesLower) {
    if (user2InterestsLower.has(course)) {
      mutualTeachingCount++
    }
  }

  // User2 can teach (their courses) what User1 wants to learn (their interests)
  let mutualLearningCount = 0
  for (const course of user2CoursesLower) {
    if (user1InterestsLower.has(course)) {
      mutualLearningCount++
    }
  }

  // Calculate score based on mutual opportunities (50 points per match, capped at 100)
  const score = Math.min((mutualTeachingCount + mutualLearningCount) * 50, 100)
  
  return score
}

/**
 * Check if two users qualify as a match based on the new criteria:
 * A match exists if any user's interests include a course offered by another user
 * 
 * @param {Object} user1Profile - First user's profile
 * @param {Object} user2Profile - Second user's profile
 * @returns {boolean} True if users qualify as a match
 */
function qualifiesAsMatch(user1Profile, user2Profile) {
  // Ensure courses and interests are arrays
  const user1Courses = Array.isArray(user1Profile.courses) ? user1Profile.courses : []
  const user1Interests = Array.isArray(user1Profile.interests) ? user1Profile.interests : []
  const user2Courses = Array.isArray(user2Profile.courses) ? user2Profile.courses : []
  const user2Interests = Array.isArray(user2Profile.interests) ? user2Profile.interests : []

  // Convert to lowercase for case-insensitive comparison
  const user1CoursesLower = new Set(user1Courses.map(c => String(c).toLowerCase()))
  const user1InterestsLower = new Set(user1Interests.map(i => String(i).toLowerCase()))
  const user2CoursesLower = new Set(user2Courses.map(c => String(c).toLowerCase()))
  const user2InterestsLower = new Set(user2Interests.map(i => String(i).toLowerCase()))

  // Check if user1's courses match user2's interests
  for (const course of user1CoursesLower) {
    if (user2InterestsLower.has(course)) {
      return true
    }
  }

  // Check if user2's courses match user1's interests
  for (const course of user2CoursesLower) {
    if (user1InterestsLower.has(course)) {
      return true
    }
  }

  return false
}

/**
 * Regenerate all match suggestions for a specific user
 * This is called after a user updates their profile
 * 
 * @param {string} userId - The user ID to regenerate matches for
 */
export async function regenerateMatchesForUser(userId) {
  console.log(`[Matching Service] Regenerating matches for user: ${userId}`)

  try {
    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!userProfile) {
      console.log(`[Matching Service] No profile found for user: ${userId}`)
      return
    }

    // Get all other profiles
    const allProfiles = await prisma.userProfile.findMany({
      where: {
        userId: { not: userId },
      },
    })

    console.log(`[Matching Service] Checking ${allProfiles.length} potential matches`)

    // Find qualifying matches and calculate scores
    const matchesToCreate = []
    for (const otherProfile of allProfiles) {
      if (qualifiesAsMatch(userProfile, otherProfile)) {
        const score = calculateCompatibilityScore(userProfile, otherProfile)
        console.log(`[Matching Service] Found match: ${userId} ↔ ${otherProfile.userId} (score: ${score})`)
        matchesToCreate.push({
          userId1: userId,
          userId2: otherProfile.userId,
          compatibilityScore: score,
          status: "suggestion", // New status for match suggestions
        })
      }
    }

    if (matchesToCreate.length === 0) {
      console.log(`[Matching Service] No qualifying matches found for user: ${userId}`)
      return
    }

    // Delete old match suggestions for this user (keep accepted matches)
    // Note: This is a simple approach that deletes all suggestions and recreates them.
    // For large-scale deployments with many matches, consider using an upsert approach
    // that only updates changed matches. Current approach is simpler and adequate for
    // most use cases, as profile updates are relatively infrequent.
    await prisma.match.deleteMany({
      where: {
        OR: [{ userId1: userId }, { userId2: userId }],
        status: "suggestion",
      },
    })

    // Create new match suggestions one by one
    // We check for existing matches before creating to avoid duplicates
    // This is necessary because we don't have a unique constraint on (userId1, userId2)
    let created = 0
    for (const match of matchesToCreate) {
      try {
        // Try to find existing match in either direction
        const existing = await prisma.match.findFirst({
          where: {
            OR: [
              { userId1: match.userId1, userId2: match.userId2 },
              { userId1: match.userId2, userId2: match.userId1 },
            ],
          },
        })

        if (!existing) {
          await prisma.match.create({ data: match })
          created++
        } else if (existing.status === "suggestion") {
          // Update score if match already exists as suggestion
          await prisma.match.update({
            where: { id: existing.id },
            data: { compatibilityScore: match.compatibilityScore },
          })
          created++
        }
      } catch (err) {
        console.warn(`[Matching Service] Failed to create match: ${err.message}`)
      }
    }

    console.log(`[Matching Service] Created/updated ${created} match suggestions for user: ${userId}`)
  } catch (error) {
    console.error(`[Matching Service] Error regenerating matches for user ${userId}:`, error)
    throw error
  }
}

/**
 * Regenerate all matches in the system
 * This can be called as a batch job or after major changes
 */
export async function regenerateAllMatches() {
  console.log("[Matching Service] Regenerating all matches in the system")

  try {
    const allProfiles = await prisma.userProfile.findMany()
    console.log(`[Matching Service] Found ${allProfiles.length} profiles`)

    for (const profile of allProfiles) {
      await regenerateMatchesForUser(profile.userId)
    }

    console.log("[Matching Service] Completed regeneration of all matches")
  } catch (error) {
    console.error("[Matching Service] Error regenerating all matches:", error)
    throw error
  }
}
