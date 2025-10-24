import { z } from 'zod'

export const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  major: z.string().max(120).optional(),
  year: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  learning_style: z.string().max(50).optional(),
  study_preference: z.string().max(50).optional(),
  courses: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
