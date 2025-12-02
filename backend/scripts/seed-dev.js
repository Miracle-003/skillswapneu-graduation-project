#!/usr/bin/env node
/**
 * Development Database Seeder
 * 
 * This script populates the database with sample data for development and testing.
 * It creates test users, profiles, connections, messages, and reviews.
 * 
 * Usage:
 *   node scripts/seed-dev.js
 * 
 * Environment Variables:
 *   SKIP_SEED - Set to 'true' to skip seeding (useful for CI)
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Check if we should skip seeding
if (process.env.SKIP_SEED === 'true') {
  console.log('⏭️  Skipping database seeding (SKIP_SEED=true)');
  process.exit(0);
}

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Sample user data for seeding
 */
const SAMPLE_USERS = [
  {
    email: 'alice@university.edu',
    password: 'Password123!',
    fullName: 'Alice Johnson',
    major: 'Computer Science',
    year: '3',
    bio: 'Passionate about algorithms and competitive programming. Love helping others learn!',
    learningStyle: 'visual',
    studyPreference: 'group',
    interests: ['Algorithms', 'Data Structures', 'Machine Learning', 'Web Development']
  },
  {
    email: 'bob@university.edu',
    password: 'Password123!',
    fullName: 'Bob Smith',
    major: 'Software Engineering',
    year: '4',
    bio: 'Senior developer with experience in full-stack development. Enjoy teaching and mentoring.',
    learningStyle: 'hands-on',
    studyPreference: 'one-on-one',
    interests: ['React', 'Node.js', 'Database Design', 'System Architecture']
  },
  {
    email: 'carol@university.edu',
    password: 'Password123!',
    fullName: 'Carol Davis',
    major: 'Computer Science',
    year: '2',
    bio: 'Exploring cybersecurity and network programming. Always eager to learn new technologies.',
    learningStyle: 'reading',
    studyPreference: 'flexible',
    interests: ['Cybersecurity', 'Network Programming', 'Python', 'Linux']
  },
  {
    email: 'david@university.edu',
    password: 'Password123!',
    fullName: 'David Wilson',
    major: 'Data Science',
    year: '3',
    bio: 'Data enthusiast interested in ML and AI. Love working on real-world projects.',
    learningStyle: 'practical',
    studyPreference: 'group',
    interests: ['Machine Learning', 'Python', 'Statistics', 'Data Visualization']
  },
  {
    email: 'emma@university.edu',
    password: 'Password123!',
    fullName: 'Emma Brown',
    major: 'Information Technology',
    year: '2',
    bio: 'Creative problem solver with interest in UI/UX and frontend development.',
    learningStyle: 'visual',
    studyPreference: 'small-group',
    interests: ['UI/UX Design', 'JavaScript', 'React', 'CSS']
  }
];

/**
 * Create or update a user with profile
 */
async function createUser(userData) {
  try {
    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .ilike('full_name', userData.fullName)
      .maybeSingle();

    if (existingProfile) {
      console.log(`  ℹ️  User "${userData.fullName}" already exists, skipping...`);
      return existingProfile.user_id;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName
      }
    });

    if (authError) {
      console.error(`  ❌ Failed to create auth user: ${authError.message}`);
      return null;
    }

    const userId = authData.user.id;

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        full_name: userData.fullName,
        major: userData.major,
        year: userData.year,
        bio: userData.bio,
        learning_style: userData.learningStyle,
        study_preference: userData.studyPreference,
        interests: userData.interests
      });

    if (profileError) {
      console.error(`  ❌ Failed to create profile: ${profileError.message}`);
      return null;
    }

    console.log(`  ✅ Created user: ${userData.fullName} (${userData.email})`);
    return userId;

  } catch (error) {
    console.error(`  ❌ Error creating user: ${error.message}`);
    return null;
  }
}

/**
 * Create sample connections between users
 */
async function createConnections(userIds) {
  console.log('\n📱 Creating connections...');

  const connections = [
    { userId1: userIds[0], userId2: userIds[1], status: 'accepted' },
    { userId1: userIds[0], userId2: userIds[2], status: 'accepted' },
    { userId1: userIds[1], userId2: userIds[3], status: 'accepted' },
    { userId1: userIds[2], userId2: userIds[4], status: 'pending' },
    { userId1: userIds[3], userId2: userIds[4], status: 'accepted' },
  ];

  for (const conn of connections) {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id_1: conn.userId1,
          user_id_2: conn.userId2,
          status: conn.status
        });

      if (error && !error.message.includes('duplicate')) {
        console.error(`  ❌ Failed to create connection: ${error.message}`);
      } else if (!error) {
        console.log(`  ✅ Created ${conn.status} connection`);
      }
    } catch (error) {
      console.error(`  ❌ Error creating connection: ${error.message}`);
    }
  }
}

/**
 * Create sample messages
 */
async function createMessages(userIds) {
  console.log('\n💬 Creating messages...');

  const messages = [
    {
      sender_id: userIds[0],
      receiver_id: userIds[1],
      content: 'Hey! Want to study algorithms together this week?'
    },
    {
      sender_id: userIds[1],
      receiver_id: userIds[0],
      content: 'Sure! I\'m free on Tuesday and Thursday afternoons.'
    },
    {
      sender_id: userIds[0],
      receiver_id: userIds[1],
      content: 'Perfect! Let\'s meet at the library at 2 PM on Tuesday?'
    },
    {
      sender_id: userIds[2],
      receiver_id: userIds[0],
      content: 'Thanks for the help with network programming yesterday!'
    },
    {
      sender_id: userIds[3],
      receiver_id: userIds[4],
      content: 'I found a great dataset for our ML project. Want to check it out?'
    }
  ];

  for (const msg of messages) {
    try {
      const { error } = await supabase
        .from('messages')
        .insert(msg);

      if (error) {
        console.error(`  ❌ Failed to create message: ${error.message}`);
      } else {
        console.log(`  ✅ Created message`);
      }
    } catch (error) {
      console.error(`  ❌ Error creating message: ${error.message}`);
    }
  }
}

/**
 * Create sample achievements (if table exists)
 */
async function createAchievements() {
  console.log('\n🏆 Creating achievements...');

  const achievements = [
    {
      name: 'First Connection',
      description: 'Made your first study buddy connection',
      icon: '🤝',
      points: 50
    },
    {
      name: 'Study Streak',
      description: 'Completed 7 consecutive days of studying',
      icon: '🔥',
      points: 100
    },
    {
      name: 'Helpful Mentor',
      description: 'Received 5 positive reviews',
      icon: '⭐',
      points: 150
    },
    {
      name: 'Knowledge Sharer',
      description: 'Helped 10 different students',
      icon: '📚',
      points: 200
    }
  ];

  for (const achievement of achievements) {
    try {
      // Check if achievements table exists
      const { error } = await supabase
        .from('achievements')
        .insert(achievement);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log('  ℹ️  Achievements table not found, skipping...');
          break;
        }
        console.error(`  ❌ Failed to create achievement: ${error.message}`);
      } else {
        console.log(`  ✅ Created achievement: ${achievement.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Error creating achievement: ${error.message}`);
    }
  }
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting development database seeding...\n');

  // Create users
  console.log('👥 Creating users...');
  const userIds = [];
  
  for (const userData of SAMPLE_USERS) {
    const userId = await createUser(userData);
    if (userId) {
      userIds.push(userId);
    }
  }

  if (userIds.length === 0) {
    console.log('\n⚠️  No users created, skipping additional data seeding');
    return;
  }

  // Create connections
  await createConnections(userIds);

  // Create messages
  await createMessages(userIds);

  // Create achievements
  await createAchievements();

  console.log('\n✨ Database seeding completed!\n');
  console.log('📝 Test credentials:');
  console.log('   Email: alice@university.edu');
  console.log('   Password: Password123!\n');
  console.log('   (You can use any of the seeded users with the same password)\n');
}

// Run the seeder
main()
  .then(() => {
    console.log('✅ Seeding successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
