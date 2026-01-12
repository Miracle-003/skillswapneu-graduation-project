import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function testConversations() {
  try {
    const testUserId = '6055fe91-de82-494f-b3f5-abd7afe9c6d0'; // test@skillswap.com
    
    console.log('Fetching connections...');
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId1: testUserId, status: "accepted" },
          { userId2: testUserId, status: "accepted" }
        ]
      },
      include: {
        user1: true,
        user2: true
      }
    });
    
    console.log(`✅ Found ${connections.length} connections`);
    
    for (const conn of connections) {
      console.log('\nConnection:', {
        id: conn.id,
        userId1: conn.userId1,
        userId2: conn.userId2,
        status: conn.status,
        user1Name: conn.user1?.fullName || 'Unknown',
        user2Name: conn.user2?.fullName || 'Unknown'
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConversations();
