import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();
const prisma = new PrismaClient();

async function createDummyData() {
  try {
    console.log('🚀 Creating dummy data...\n');

    // Test user 1 (existing - test@skillswap.com)
    const testUser1Id = '6055fe91-de82-494f-b3f5-abd7afe9c6d0';
    
    // Create additional test users
    const password = await bcrypt.hash('Test123456', 10);
    
    // User 2 - Sarah Johnson
    const user2 = await prisma.appUser.upsert({
      where: { email: 'sarah.johnson@skillswap.com' },
      update: {},
      create: {
        email: 'sarah.johnson@skillswap.com',
        passwordHash: password,
        emailVerifiedAt: new Date(),
        role: 'user'
      }
    });
    
    const profile2 = await prisma.userProfile.upsert({
      where: { userId: user2.id },
      update: {},
      create: {
        userId: user2.id,
        fullName: 'Sarah Johnson',
        major: 'Software Engineering',
        year: 'Second Year',
        bio: 'Passionate about web development and machine learning. Looking for study partners to collaborate on projects.',
        learningStyle: 'Visual learner, hands-on practice',
        studyPreference: 'Group study, online collaboration',
        courses: ['CS 5002', 'CS 5004', 'CS 5008'],
        interests: ['Web Development', 'Machine Learning', 'UI/UX Design']
      }
    });

    // User 3 - Michael Chen
    const user3 = await prisma.appUser.upsert({
      where: { email: 'michael.chen@skillswap.com' },
      update: {},
      create: {
        email: 'michael.chen@skillswap.com',
        passwordHash: password,
        emailVerifiedAt: new Date(),
        role: 'user'
      }
    });
    
    const profile3 = await prisma.userProfile.upsert({
      where: { userId: user3.id },
      update: {},
      create: {
        userId: user3.id,
        fullName: 'Michael Chen',
        major: 'Computer Science',
        year: 'Third Year',
        bio: 'Algorithms enthusiast preparing for technical interviews. Love solving challenging problems.',
        learningStyle: 'Practice-oriented, code reviews',
        studyPreference: 'Pair programming, whiteboard sessions',
        courses: ['CS 5004', 'CS 5008', 'CS 5010'],
        interests: ['Algorithms', 'Data Structures', 'System Design']
      }
    });

    // User 4 - Emily Rodriguez
    const user4 = await prisma.appUser.upsert({
      where: { email: 'emily.rodriguez@skillswap.com' },
      update: {},
      create: {
        email: 'emily.rodriguez@skillswap.com',
        passwordHash: password,
        emailVerifiedAt: new Date(),
        role: 'user'
      }
    });
    
    const profile4 = await prisma.userProfile.upsert({
      where: { userId: user4.id },
      update: {},
      create: {
        userId: user4.id,
        fullName: 'Emily Rodriguez',
        major: 'Information Systems',
        year: 'Second Year',
        bio: 'Database and cloud computing enthusiast. Building expertise in backend technologies.',
        learningStyle: 'Hands-on projects, real-world applications',
        studyPreference: 'Study groups, collaborative projects',
        courses: ['CS 5002', 'CS 5200', 'CS 5004'],
        interests: ['Database Design', 'Cloud Computing', 'Cybersecurity']
      }
    });

    console.log('✅ Created users:');
    console.log(`   - test@skillswap.com (ID: ${testUser1Id})`);
    console.log(`   - sarah.johnson@skillswap.com (ID: ${user2.id})`);
    console.log(`   - michael.chen@skillswap.com (ID: ${user3.id})`);
    console.log(`   - emily.rodriguez@skillswap.com (ID: ${user4.id})\n`);

    // Create connections between test user and other users
    const connections = [];
    
    // Connection 1: test user <-> Sarah (accepted)
    const conn1 = await prisma.connection.upsert({
      where: {
        userId1_userId2: {
          userId1: testUser1Id,
          userId2: user2.id
        }
      },
      update: { status: 'accepted' },
      create: {
        userId1: testUser1Id,
        userId2: user2.id,
        status: 'accepted'
      }
    });
    connections.push(conn1);

    // Connection 2: test user <-> Michael (accepted)
    const conn2 = await prisma.connection.upsert({
      where: {
        userId1_userId2: {
          userId1: testUser1Id,
          userId2: user3.id
        }
      },
      update: { status: 'accepted' },
      create: {
        userId1: testUser1Id,
        userId2: user3.id,
        status: 'accepted'
      }
    });
    connections.push(conn2);

    // Connection 3: test user <-> Emily (accepted)
    const conn3 = await prisma.connection.upsert({
      where: {
        userId1_userId2: {
          userId1: testUser1Id,
          userId2: user4.id
        }
      },
      update: { status: 'accepted' },
      create: {
        userId1: testUser1Id,
        userId2: user4.id,
        status: 'accepted'
      }
    });
    connections.push(conn3);

    console.log('✅ Created connections:');
    connections.forEach((conn, i) => {
      console.log(`   ${i + 1}. ${conn.userId1.substring(0, 8)}... <-> ${conn.userId2.substring(0, 8)}... (${conn.status})`);
    });
    console.log('');

    // Create some sample messages
    const messages = [];

    // Messages with Sarah
    const msg1 = await prisma.message.create({
      data: {
        senderId: user2.id,
        receiverId: testUser1Id,
        content: "Hey! I saw we're both in CS 5004. Would you like to study together for the upcoming exam?"
      }
    });
    messages.push(msg1);

    const msg2 = await prisma.message.create({
      data: {
        senderId: testUser1Id,
        receiverId: user2.id,
        content: "That sounds great! I'm free this weekend. What topics do you want to focus on?"
      }
    });
    messages.push(msg2);

    const msg3 = await prisma.message.create({
      data: {
        senderId: user2.id,
        receiverId: testUser1Id,
        content: "I'm struggling with object-oriented design patterns. Could we go over that?"
      }
    });
    messages.push(msg3);

    // Messages with Michael
    const msg4 = await prisma.message.create({
      data: {
        senderId: user3.id,
        receiverId: testUser1Id,
        content: "Hi! I noticed you're interested in algorithms. Want to practice LeetCode problems together?"
      }
    });
    messages.push(msg4);

    const msg5 = await prisma.message.create({
      data: {
        senderId: testUser1Id,
        receiverId: user3.id,
        content: "Definitely! I'm working on dynamic programming problems right now."
      }
    });
    messages.push(msg5);

    // Messages with Emily
    const msg6 = await prisma.message.create({
      data: {
        senderId: user4.id,
        receiverId: testUser1Id,
        content: "Hey! Are you taking CS 5200? I could use some help with database normalization."
      }
    });
    messages.push(msg6);

    console.log('✅ Created messages:');
    console.log(`   - ${messages.length} sample messages between users\n`);

    console.log('🎉 Dummy data created successfully!\n');
    console.log('📝 Login credentials:');
    console.log('   Email: test@skillswap.com');
    console.log('   Password: Test123456\n');
    console.log('   Or use any of:');
    console.log('   - sarah.johnson@skillswap.com');
    console.log('   - michael.chen@skillswap.com');
    console.log('   - emily.rodriguez@skillswap.com');
    console.log('   (All passwords: Test123456)\n');

  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyData();
