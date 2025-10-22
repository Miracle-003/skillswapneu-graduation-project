// Prisma Schema for Study Buddy Platform
// This file contains the complete database schema definition

export const prismaSchema = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================
// USER AUTHENTICATION & PROFILES
// ============================================

model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String    @map("password_hash")
  role                String    @default("student")
  emailVerified       Boolean   @default(false) @map("email_verified")
  verificationToken   String?   @map("verification_token")
  resetToken          String?   @map("reset_token")
  resetTokenExpires   DateTime? @map("reset_token_expires")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  lastLogin           DateTime? @map("last_login")

  // Relations
  profile             Profile?
  userSubjects        UserSubject[]
  matchesRequested    Match[]   @relation("MatchRequester")
  matchesReceived     Match[]   @relation("MatchRecipient")
  messagesSent        Message[]
  reviewsGiven        Review[]  @relation("ReviewGiver")
  reviewsReceived     Review[]  @relation("ReviewReceiver")
  userAchievements    UserAchievement[]
  pointsHistory       PointsHistory[]

  @@index([email])
  @@index([verificationToken])
  @@index([resetToken])
  @@map("users")
}

model Profile {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")
  firstName         String   @map("first_name")
  lastName          String   @map("last_name")
  profilePicture    String?  @map("profile_picture")
  bio               String?
  university        String
  major             String
  year              Int
  gpa               Decimal? @db.Decimal(3, 2)
  studyPreference   String   @default("hybrid") @map("study_preference")
  location          String?
  timezone          String   @default("UTC")
  availability      Json     @default("{}")
  learningGoals     String?  @map("learning_goals")
  reputationScore   Decimal  @default(0.0) @db.Decimal(3, 2) @map("reputation_score")
  totalReviews      Int      @default(0) @map("total_reviews")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([university])
  @@index([major])
  @@map("profiles")
}

// ============================================
// SUBJECTS & USER EXPERTISE
// ============================================

model Subject {
  id          String   @id @default(uuid())
  name        String   @unique
  category    String
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  userSubjects UserSubject[]

  @@index([name])
  @@index([category])
  @@map("subjects")
}

model UserSubject {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  subjectId   String   @map("subject_id")
  skillLevel  String   @map("skill_level")
  isTeaching  Boolean  @default(false) @map("is_teaching")
  isLearning  Boolean  @default(false) @map("is_learning")
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([userId, subjectId])
  @@index([userId])
  @@index([subjectId])
  @@index([skillLevel])
  @@map("user_subjects")
}

// ============================================
// MATCHING SYSTEM
// ============================================

model Match {
  id                  String    @id @default(uuid())
  requesterId         String    @map("requester_id")
  recipientId         String    @map("recipient_id")
  status              String    @default("pending")
  compatibilityScore  Decimal?  @db.Decimal(5, 2) @map("compatibility_score")
  matchedSubjects     Json      @default("[]") @map("matched_subjects")
  message             String?
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  acceptedAt          DateTime? @map("accepted_at")

  // Relations
  requester           User      @relation("MatchRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  recipient           User      @relation("MatchRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  conversation        Conversation?
  reviews             Review[]

  @@unique([requesterId, recipientId])
  @@index([requesterId])
  @@index([recipientId])
  @@index([status])
  @@index([compatibilityScore])
  @@map("matches")
}

// ============================================
// CHAT SYSTEM
// ============================================

model Conversation {
  id              String    @id @default(uuid())
  matchId         String    @unique @map("match_id")
  isGroup         Boolean   @default(false) @map("is_group")
  name            String?
  createdAt       DateTime  @default(now()) @map("created_at")
  lastMessageAt   DateTime  @default(now()) @map("last_message_at")

  // Relations
  match           Match     @relation(fields: [matchId], references: [id], onDelete: Cascade)
  messages        Message[]

  @@index([matchId])
  @@index([lastMessageAt])
  @@map("conversations")
}

model Message {
  id              String    @id @default(uuid())
  conversationId  String    @map("conversation_id")
  senderId        String    @map("sender_id")
  content         String
  messageType     String    @default("text") @map("message_type")
  fileUrl         String?   @map("file_url")
  fileName        String?   @map("file_name")
  fileSize        Int?      @map("file_size")
  isRead          Boolean   @default(false) @map("is_read")
  createdAt       DateTime  @default(now()) @map("created_at")
  editedAt        DateTime? @map("edited_at")
  deletedAt       DateTime? @map("deleted_at")

  // Relations
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender          User         @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
  @@map("messages")
}

// ============================================
// REVIEW SYSTEM
// ============================================

model Review {
  id          String   @id @default(uuid())
  reviewerId  String   @map("reviewer_id")
  revieweeId  String   @map("reviewee_id")
  matchId     String   @map("match_id")
  rating      Int
  comment     String?
  isFlagged   Boolean  @default(false) @map("is_flagged")
  flagReason  String?  @map("flag_reason")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  reviewer    User     @relation("ReviewGiver", fields: [reviewerId], references: [id], onDelete: Cascade)
  reviewee    User     @relation("ReviewReceiver", fields: [revieweeId], references: [id], onDelete: Cascade)
  match       Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)

  @@unique([reviewerId, revieweeId, matchId])
  @@index([reviewerId])
  @@index([revieweeId])
  @@index([rating])
  @@index([isFlagged])
  @@map("reviews")
}

// ============================================
// GAMIFICATION SYSTEM
// ============================================

model Achievement {
  id          String   @id @default(uuid())
  name        String   @unique
  description String
  icon        String?
  category    String
  points      Int      @default(0)
  requirement Json
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  userAchievements UserAchievement[]

  @@index([category])
  @@map("achievements")
}

model UserAchievement {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  achievementId String   @map("achievement_id")
  unlockedAt    DateTime @default(now()) @map("unlocked_at")
  progress      Json     @default("{}")

  // Relations
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@index([userId])
  @@index([achievementId])
  @@map("user_achievements")
}

model PointsHistory {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  points        Int
  reason        String
  referenceType String?  @map("reference_type")
  referenceId   String?  @map("reference_id")
  createdAt     DateTime @default(now()) @map("created_at")

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("points_history")
}
`
