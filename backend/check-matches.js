import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMatches() {
  try {
    console.log('Checking database for matches...\n');
    
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);
    
    const profileCount = await prisma.profile.count();
    console.log('Total profiles:', profileCount);
    
    const matchCount = await prisma.match.count();
    console.log('Total matches:', matchCount);
    
    console.log('\n--- Sample Profiles ---');
    const profiles = await prisma.profile.findMany({
      take: 5,
      select: {
        user_id: true,
        full_name: true,
        major: true,
        courses: true,
        interests: true
      }
    });
    
    profiles.forEach(p => {
      console.log(`\nUser ID: ${p.user_id}`);
      console.log(`Name: ${p.full_name}`);
      console.log(`Major: ${p.major}`);
      console.log(`Courses: ${JSON.stringify(p.courses)}`);
      console.log(`Interests: ${JSON.stringify(p.interests)}`);
    });
    
    console.log('\n--- Sample Matches ---');
    const matches = await prisma.match.findMany({
      take: 10,
      orderBy: { compatibilityScore: 'desc' }
    });
    
    if (matches.length === 0) {
      console.log('No matches found in database!');
      console.log('\nThis is the problem - matches need to be generated.');
    } else {
      matches.forEach(m => {
        console.log(`\nMatch ID: ${m.id}`);
        console.log(`User1: ${m.userId1}`);
        console.log(`User2: ${m.userId2}`);
        console.log(`Score: ${m.compatibilityScore}`);
        console.log(`Status: ${m.status}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMatches();
