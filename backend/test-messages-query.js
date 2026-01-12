import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function testMessagesQuery() {
  try {
    const testUserId = '6055fe91-de82-494f-b3f5-abd7afe9c6d0';
    const participantId = '33819a49-3a16-41d3-b1ae-a5aa823ec87a';
    
    console.log('Fetching last message...');
    const lastMessage = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: testUserId, receiverId: participantId },
          { senderId: participantId, receiverId: testUserId }
        ]
      },
      orderBy: { createdAt: "desc" }
    });
    
    console.log('Last message:', lastMessage);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMessagesQuery();
