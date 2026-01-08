import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ---------------------------------------------
   PROFILE COMPLETION CALCULATOR
   --------------------------------------------- */

export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0

  const fields = [
    profile.fullName,
    profile.major,
    profile.year,
    profile.bio,
    profile.learningStyle,
    profile.studyPreference,
    Array.isArray(profile.interests) && profile.interests.length > 0,
    Array.isArray(profile.courses) && profile.courses.length > 0,
  ]

  const completed = fields.filter(Boolean).length
  const total = fields.length

  return Math.round((completed / total) * 100)
}
