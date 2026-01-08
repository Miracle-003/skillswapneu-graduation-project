import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ----------------------------------------
   PROFILE COMPLETENESS (DISPLAY ONLY)
---------------------------------------- */
export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0

  const fields = [
    profile.fullName,
    profile.major,
    profile.year,
    profile.bio,
    profile.learningStyle,
    profile.studyPreference,
    profile.interests?.length > 0,
    profile.courses?.length > 0,
  ]

  return Math.round(
    (fields.filter(Boolean).length / fields.length) * 100
  )
}
