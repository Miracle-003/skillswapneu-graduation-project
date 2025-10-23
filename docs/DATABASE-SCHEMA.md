# Database Schema Document
## skill swap Matching Platform

**Version:** 1.0  
**Date:** January 2025

---

## 1. Overview

This document defines the complete database schema for the skill swap Matching Platform using PostgreSQL.

---

## 2. Entity Relationship Diagram (ERD)

\`\`\`
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │────────▶│   profiles   │◀────────│  subjects   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                         │
      │                        │                         │
      │                        └────────┬────────────────┘
      │                                 │
      │                          ┌──────────────┐
      │                          │user_subjects │
      │                          └──────────────┘
      │
      ├────────────────┬─────────────────┬──────────────────┐
      │                │                 │                  │
      ▼                ▼                 ▼                  ▼
┌──────────┐    ┌─────────────┐  ┌───────────┐    ┌──────────────┐
│ matches  │    │conversations│  │  reviews  │    │achievements  │
└──────────┘    └─────────────┘  └───────────┘    └──────────────┘
                       │                                   │
                       │                                   │
                       ▼                                   ▼
                ┌──────────┐                    ┌──────────────────┐
                │ messages │                    │user_achievements │
                └──────────┘                    └──────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ points_history  │
                                                └─────────────────┘
\`\`\`

---

## 3. Table Definitions

### 3.1 users
**Description:** Core user authentication and account information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(20) | DEFAULT 'student' | User role (student, admin) |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| verification_token | VARCHAR(255) | NULLABLE | Email verification token |
| reset_token | VARCHAR(255) | NULLABLE | Password reset token |
| reset_token_expires | TIMESTAMP | NULLABLE | Reset token expiration |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| last_login | TIMESTAMP | NULLABLE | Last login timestamp |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_verification_token` on `verification_token`
- `idx_users_reset_token` on `reset_token`

---

### 3.2 profiles
**Description:** Extended user profile information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Profile identifier |
| user_id | UUID | FOREIGN KEY → users(id), UNIQUE, NOT NULL | Reference to user |
| first_name | VARCHAR(100) | NOT NULL | User first name |
| last_name | VARCHAR(100) | NOT NULL | User last name |
| profile_picture | TEXT | NULLABLE | Profile image URL |
| bio | TEXT | NULLABLE | User biography (max 500 chars) |
| university | VARCHAR(200) | NOT NULL | University name |
| major | VARCHAR(200) | NOT NULL | Academic major |
| year | INTEGER | CHECK (year >= 1 AND year <= 6) | Academic year |
| gpa | DECIMAL(3,2) | CHECK (gpa >= 0 AND gpa <= 4.0) | Grade point average |
| study_preference | VARCHAR(50) | DEFAULT 'hybrid' | Preference: online, in-person, hybrid |
| location | VARCHAR(200) | NULLABLE | Study location preference |
| timezone | VARCHAR(50) | DEFAULT 'UTC' | User timezone |
| availability | JSONB | DEFAULT '{}' | Weekly availability schedule |
| learning_goals | TEXT | NULLABLE | User learning objectives |
| reputation_score | DECIMAL(3,2) | DEFAULT 0.0 | Aggregate review score |
| total_reviews | INTEGER | DEFAULT 0 | Number of reviews received |
| created_at | TIMESTAMP | DEFAULT NOW() | Profile creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_profiles_user_id` on `user_id`
- `idx_profiles_university` on `university`
- `idx_profiles_major` on `major`

**Availability JSONB Structure:**
\`\`\`json
{
  "monday": ["09:00-12:00", "14:00-17:00"],
  "tuesday": ["10:00-13:00"],
  "wednesday": ["09:00-12:00", "14:00-17:00"],
  "thursday": ["10:00-13:00"],
  "friday": ["09:00-12:00"],
  "saturday": [],
  "sunday": []
}
\`\`\`

---

### 3.3 subjects
**Description:** Academic subjects catalog

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Subject identifier |
| name | VARCHAR(200) | UNIQUE, NOT NULL | Subject name |
| category | VARCHAR(100) | NOT NULL | Subject category (STEM, Humanities, etc.) |
| description | TEXT | NULLABLE | Subject description |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_subjects_name` on `name`
- `idx_subjects_category` on `category`

---

### 3.4 user_subjects
**Description:** Many-to-many relationship between users and subjects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Record identifier |
| user_id | UUID | FOREIGN KEY → users(id), NOT NULL | Reference to user |
| subject_id | UUID | FOREIGN KEY → subjects(id), NOT NULL | Reference to subject |
| skill_level | VARCHAR(20) | NOT NULL | Skill level: beginner, intermediate, advanced, expert |
| is_teaching | BOOLEAN | DEFAULT false | Willing to teach this subject |
| is_learning | BOOLEAN | DEFAULT false | Seeking to learn this subject |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Constraints:**
- UNIQUE constraint on `(user_id, subject_id)`
- CHECK constraint: `is_teaching OR is_learning` must be true

**Indexes:**
- `idx_user_subjects_user_id` on `user_id`
- `idx_user_subjects_subject_id` on `subject_id`
- `idx_user_subjects_skill_level` on `skill_level`

---

### 3.5 matches
**Description:** Study partner connections and match history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Match identifier |
| requester_id | UUID | FOREIGN KEY → users(id), NOT NULL | User who initiated match |
| recipient_id | UUID | FOREIGN KEY → users(id), NOT NULL | User who received request |
| status | VARCHAR(20) | DEFAULT 'pending' | Status: pending, accepted, rejected, blocked |
| compatibility_score | DECIMAL(5,2) | CHECK (score >= 0 AND score <= 100) | Calculated compatibility |
| matched_subjects | JSONB | DEFAULT '[]' | Array of common subject IDs |
| message | TEXT | NULLABLE | Optional message with request |
| created_at | TIMESTAMP | DEFAULT NOW() | Request creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last status update |
| accepted_at | TIMESTAMP | NULLABLE | Acceptance timestamp |

**Constraints:**
- UNIQUE constraint on `(requester_id, recipient_id)`
- CHECK constraint: `requester_id != recipient_id`

**Indexes:**
- `idx_matches_requester_id` on `requester_id`
- `idx_matches_recipient_id` on `recipient_id`
- `idx_matches_status` on `status`
- `idx_matches_compatibility_score` on `compatibility_score DESC`

---

### 3.6 conversations
**Description:** Chat conversation threads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Conversation identifier |
| match_id | UUID | FOREIGN KEY → matches(id), UNIQUE, NOT NULL | Associated match |
| is_group | BOOLEAN | DEFAULT false | Group chat flag |
| name | VARCHAR(200) | NULLABLE | Group chat name |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| last_message_at | TIMESTAMP | DEFAULT NOW() | Last message timestamp |

**Indexes:**
- `idx_conversations_match_id` on `match_id`
- `idx_conversations_last_message_at` on `last_message_at DESC`

---

### 3.7 messages
**Description:** Chat messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Message identifier |
| conversation_id | UUID | FOREIGN KEY → conversations(id), NOT NULL | Parent conversation |
| sender_id | UUID | FOREIGN KEY → users(id), NOT NULL | Message sender |
| content | TEXT | NOT NULL | Message text content |
| message_type | VARCHAR(20) | DEFAULT 'text' | Type: text, file, system |
| file_url | TEXT | NULLABLE | Attached file URL |
| file_name | VARCHAR(255) | NULLABLE | Original file name |
| file_size | INTEGER | NULLABLE | File size in bytes |
| is_read | BOOLEAN | DEFAULT false | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Message timestamp |
| edited_at | TIMESTAMP | NULLABLE | Last edit timestamp |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete timestamp |

**Indexes:**
- `idx_messages_conversation_id` on `conversation_id`
- `idx_messages_sender_id` on `sender_id`
- `idx_messages_created_at` on `created_at DESC`

---

### 3.8 reviews
**Description:** Peer reviews and ratings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Review identifier |
| reviewer_id | UUID | FOREIGN KEY → users(id), NOT NULL | User giving review |
| reviewee_id | UUID | FOREIGN KEY → users(id), NOT NULL | User being reviewed |
| match_id | UUID | FOREIGN KEY → matches(id), NOT NULL | Associated match |
| rating | INTEGER | CHECK (rating >= 1 AND rating <= 5), NOT NULL | Star rating |
| comment | TEXT | NULLABLE | Review text (max 500 chars) |
| is_flagged | BOOLEAN | DEFAULT false | Moderation flag |
| flag_reason | TEXT | NULLABLE | Reason for flagging |
| created_at | TIMESTAMP | DEFAULT NOW() | Review timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- UNIQUE constraint on `(reviewer_id, reviewee_id, match_id)`
- CHECK constraint: `reviewer_id != reviewee_id`

**Indexes:**
- `idx_reviews_reviewer_id` on `reviewer_id`
- `idx_reviews_reviewee_id` on `reviewee_id`
- `idx_reviews_rating` on `rating`
- `idx_reviews_is_flagged` on `is_flagged`

---

### 3.9 achievements
**Description:** Gamification badges and achievements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Achievement identifier |
| name | VARCHAR(200) | UNIQUE, NOT NULL | Achievement name |
| description | TEXT | NOT NULL | Achievement description |
| icon | TEXT | NULLABLE | Icon URL or identifier |
| category | VARCHAR(50) | NOT NULL | Category: social, academic, streak, milestone |
| points | INTEGER | DEFAULT 0 | Points awarded |
| requirement | JSONB | NOT NULL | Unlock requirements |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Requirement JSONB Examples:**
\`\`\`json
// First Match
{"type": "match_count", "value": 1}

// Study Streak
{"type": "streak_days", "value": 7}

// Review Giver
{"type": "reviews_given", "value": 10}

// High Reputation
{"type": "reputation_score", "value": 4.5}
\`\`\`

**Indexes:**
- `idx_achievements_category` on `category`

---

### 3.10 user_achievements
**Description:** User achievement tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Record identifier |
| user_id | UUID | FOREIGN KEY → users(id), NOT NULL | User reference |
| achievement_id | UUID | FOREIGN KEY → achievements(id), NOT NULL | Achievement reference |
| unlocked_at | TIMESTAMP | DEFAULT NOW() | Unlock timestamp |
| progress | JSONB | DEFAULT '{}' | Progress tracking |

**Constraints:**
- UNIQUE constraint on `(user_id, achievement_id)`

**Indexes:**
- `idx_user_achievements_user_id` on `user_id`
- `idx_user_achievements_achievement_id` on `achievement_id`

---

### 3.11 points_history
**Description:** Points transaction log

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Transaction identifier |
| user_id | UUID | FOREIGN KEY → users(id), NOT NULL | User reference |
| points | INTEGER | NOT NULL | Points amount (positive or negative) |
| reason | VARCHAR(200) | NOT NULL | Transaction reason |
| reference_type | VARCHAR(50) | NULLABLE | Related entity type (match, review, etc.) |
| reference_id | UUID | NULLABLE | Related entity ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Transaction timestamp |

**Indexes:**
- `idx_points_history_user_id` on `user_id`
- `idx_points_history_created_at` on `created_at DESC`

---

## 4. Database Functions and Triggers

### 4.1 Update Timestamp Trigger
\`\`\`sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

### 4.2 Update Reputation Score Function
\`\`\`sql
CREATE OR REPLACE FUNCTION update_reputation_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        reputation_score = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        )
    WHERE user_id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reputation_after_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_reputation_score();
\`\`\`

### 4.3 Update Last Message Timestamp
\`\`\`sql
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
\`\`\`

---

## 5. Sample Queries

### 5.1 Find Potential Matches
\`\`\`sql
-- Find users with matching subjects and availability
SELECT 
    u.id,
    p.first_name,
    p.last_name,
    p.university,
    p.major,
    p.reputation_score,
    COUNT(DISTINCT us1.subject_id) as common_subjects
FROM users u
JOIN profiles p ON u.id = p.user_id
JOIN user_subjects us1 ON u.id = us1.user_id
WHERE u.id != $1  -- Exclude current user
AND EXISTS (
    -- Has at least one common subject
    SELECT 1 FROM user_subjects us2
    WHERE us2.user_id = $1
    AND us2.subject_id = us1.subject_id
)
AND NOT EXISTS (
    -- Not already matched
    SELECT 1 FROM matches m
    WHERE (m.requester_id = $1 AND m.recipient_id = u.id)
    OR (m.requester_id = u.id AND m.recipient_id = $1)
)
GROUP BY u.id, p.first_name, p.last_name, p.university, p.major, p.reputation_score
HAVING COUNT(DISTINCT us1.subject_id) > 0
ORDER BY common_subjects DESC, p.reputation_score DESC
LIMIT 10;
\`\`\`

### 5.2 Get User Dashboard Data
\`\`\`sql
-- Comprehensive dashboard query
SELECT 
    u.id,
    u.email,
    p.*,
    (SELECT COUNT(*) FROM matches WHERE (requester_id = u.id OR recipient_id = u.id) AND status = 'accepted') as total_matches,
    (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id) as total_reviews,
    (SELECT COALESCE(SUM(points), 0) FROM points_history WHERE user_id = u.id) as total_points,
    (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE u.id = $1;
\`\`\`

### 5.3 Get Conversation with Messages
\`\`\`sql
-- Fetch conversation with recent messages
SELECT 
    c.id as conversation_id,
    c.name,
    c.is_group,
    json_agg(
        json_build_object(
            'id', m.id,
            'content', m.content,
            'sender_id', m.sender_id,
            'sender_name', p.first_name || ' ' || p.last_name,
            'created_at', m.created_at,
            'is_read', m.is_read
        ) ORDER BY m.created_at DESC
    ) as messages
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id AND m.deleted_at IS NULL
LEFT JOIN profiles p ON m.sender_id = p.user_id
WHERE c.id = $1
GROUP BY c.id, c.name, c.is_group
LIMIT 50;
\`\`\`

---

## 6. Data Migration Strategy

### 6.1 Initial Setup
1. Create database and enable UUID extension
2. Run schema creation scripts
3. Create indexes
4. Set up triggers and functions
5. Seed initial data (subjects, achievements)

### 6.2 Version Control
- Use Prisma migrations for schema changes
- Maintain migration history
- Test migrations on staging before production

---

## 7. Backup and Recovery

### 7.1 Backup Schedule
- **Full Backup**: Daily at 2:00 AM UTC
- **Incremental Backup**: Every 6 hours
- **Retention**: 30 days

### 7.2 Recovery Procedures
1. Identify backup point
2. Stop application
3. Restore database from backup
4. Verify data integrity
5. Restart application
6. Monitor for issues

---

## Appendix: Sample Data

### Sample Subjects
\`\`\`sql
INSERT INTO subjects (name, category, description) VALUES
('Calculus I', 'STEM', 'Differential and integral calculus'),
('Data Structures', 'STEM', 'Computer science fundamentals'),
('World History', 'Humanities', 'Global historical events'),
('Organic Chemistry', 'STEM', 'Carbon-based chemistry'),
('English Literature', 'Humanities', 'Literary analysis and criticism');
\`\`\`

### Sample Achievements
\`\`\`sql
INSERT INTO achievements (name, description, category, points, requirement) VALUES
('First Match', 'Connected with your first skill swap', 'social', 10, '{"type": "match_count", "value": 1}'),
('Week Warrior', 'Maintained a 7-day study streak', 'streak', 50, '{"type": "streak_days", "value": 7}'),
('Helpful Peer', 'Gave 10 helpful reviews', 'social', 25, '{"type": "reviews_given", "value": 10}'),
('Top Rated', 'Achieved 4.5+ reputation score', 'milestone', 100, '{"type": "reputation_score", "value": 4.5}');
