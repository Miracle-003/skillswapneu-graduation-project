import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  let score = 0;
  const weights = {
    fullName: 15,
    major: 15,
    year: 10,
    bio: 20,
    learningStyle: 10,
    studyPreference: 10,
    interests: 10,
    courses: 10,
  };

  // Check each field
  if (profile.fullName && profile.fullName.trim()) score += weights.fullName;
  if (profile.major && profile.major.trim()) score += weights.major;
  if (profile.year && profile.year.trim()) score += weights.year;
  if (profile.bio && profile.bio.trim()) score += weights.bio;
  if (profile.learningStyle && profile.learningStyle.trim())
    score += weights.learningStyle;
  if (profile.studyPreference && profile.studyPreference.trim())
    score += weights.studyPreference;

  // Check array fields
  if (Array.isArray(profile.interests) && profile.interests.length > 0) {
    score += weights.interests;
  }
  if (Array.isArray(profile.courses) && profile.courses.length > 0) {
    score += weights.courses;
  }

  return Math.min(score, 100);
}
