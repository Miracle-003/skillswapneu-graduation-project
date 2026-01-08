# Matchmaking Workflow Documentation

## Overview
This document describes the updated matchmaking workflow implemented for the SkillSwap NEU platform.

## Key Concepts

### Match Suggestions vs Connections

**Match Suggestions (stored in `matches` table):**
- Automatically generated when a user's profile qualifies them as a potential match
- A match exists when any user's **interests** include a **course** offered by another user
- Displayed on the "Find Your Partner" page
- Status: `suggestion` (default for new matches)
- Can be unidirectional (User A is a match for User B, but B might not be a match for A)

**Connections (stored in `connections` table):**
- Only created when two users **mutually accept** a match
- Similar to Facebook's "friends" concept (mutual relationship)
- Status: `pending`, `accepted`, or `rejected`
- Represents actual study partnerships

## Matching Criteria

A user qualifies as a match suggestion when:
1. **One user's course matches another user's interest**, OR
2. **One user's interest matches another user's course**

### Example:
- User A: courses = ["CS101", "MATH201"], interests = ["PHYS101"]
- User B: courses = ["ENG101"], interests = ["CS101", "HIST101"]

User A and B are a match because:
- User A's course "CS101" matches User B's interest "CS101"
- User A can teach what User B wants to learn

## Technical Implementation

### Backend

#### 1. Matching Service (`backend/src/lib/matchingService.js`)
- `qualifiesAsMatch(user1, user2)`: Checks if two users meet the match criteria
- `calculateCompatibilityScore(user1, user2)`: Calculates a 0-100 score based on overlap
- `regenerateMatchesForUser(userId)`: Regenerates all matches for a specific user
- `regenerateAllMatches()`: Batch regeneration for all users

#### 2. Profile Updates (`backend/src/routes/profiles.js`)
- After a user updates their profile, match suggestions are automatically regenerated
- This ensures the matches table always reflects current suggestions

#### 3. Match API (`backend/src/routes/matches.js`)
- `GET /matches/user/:userId`: Returns all match suggestions for a user
- `POST /matches/regenerate`: Manually trigger match regeneration
- Matches are ordered by compatibility score (highest first)

#### 4. Connection API (`backend/src/routes/connections.js`)
- `POST /connections`: Create a connection when accepting a match
- Only creates entries when users mutually accept
- Updates the corresponding match status to `connected`

### Frontend

#### 1. Matching Algorithm (`frontend/lib/matching-algorithm.ts`)
- Enhanced to handle array/string serialization issues
- `ensureArray()` helper function converts strings to arrays safely
- Case-insensitive course/interest matching
- Calculates match scores and profile completeness

#### 2. Find Your Partner Page (`frontend/app/dashboard/matches/page.tsx`)
- Displays match suggestions in a swipe-style interface
- Shows mutual teaching/learning opportunities prominently
- Filters out already-connected users
- Handles array parsing from API responses correctly

## Workflow

### 1. User Creates/Updates Profile
```
User edits profile → Profile saved → Match regeneration triggered → 
Matches table updated with suggestions
```

### 2. User Browses Matches
```
User visits "Find Your Partner" → Fetch match suggestions from DB → 
Display suggestions sorted by score → User can connect or pass
```

### 3. User Accepts a Match
```
User clicks "Connect" → Create entry in connections table → 
Update match status to "connected" → Show success animation
```

### 4. Match Suggestions Refresh
```
Profile updated → Backend regenerates matches → 
Frontend refetches profiles → UI updates with new suggestions
```

## Database Schema

### matches table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user_id_1 UUID NOT NULL,
  user_id_2 UUID NOT NULL,
  compatibility_score FLOAT NOT NULL,
  status TEXT DEFAULT 'suggestion',  -- 'suggestion', 'connected', 'pending_connection'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX matches_user_id_1_status_idx ON matches(user_id_1, status);
CREATE INDEX matches_user_id_2_status_idx ON matches(user_id_2, status);
```

### connections table
```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY,
  user_id_1 UUID NOT NULL,
  user_id_2 UUID NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);
```

## Array Serialization Handling

Both backend and frontend handle potential array/string mismatches:

**Backend:**
```javascript
const courses = Array.isArray(profile.courses) ? profile.courses : []
```

**Frontend:**
```typescript
function ensureArray(value: string[] | string | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  // Handle string parsing...
}
```

## Testing

Run the test script to verify matching logic:
```bash
node /tmp/test-matching-algorithm.js
```

## Future Enhancements

1. Add notification system when new matches are found
2. Implement match recommendation ranking based on user preferences
3. Add ability to "bookmark" matches for later
4. Track match acceptance rate metrics
5. Add filtering options (by major, year, specific courses)

## Migration Guide

To apply the database changes:
```bash
cd backend
npx prisma migrate deploy
```

This will:
1. Add indexes for better query performance
2. Update default match status to 'suggestion'
3. Preserve existing data

## Support

For questions or issues, please refer to:
- Backend API: `backend/src/routes/matches.js`, `backend/src/routes/connections.js`
- Frontend UI: `frontend/app/dashboard/matches/page.tsx`
- Matching Logic: `frontend/lib/matching-algorithm.ts`, `backend/src/lib/matchingService.js`
