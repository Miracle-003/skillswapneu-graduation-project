import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function testAllMessages() {
  try {
    console.log('Fetching ALL messages...');
    const messages = await prisma.message.findMany({
      take: 10
    });
    
    console.log(`✅ Found ${messages.length} messages total`);
    messages.forEach((msg, i) => {
      console.log(`Message ${i + 1}:`, {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content?.substring(0, 50)
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllMessages();
