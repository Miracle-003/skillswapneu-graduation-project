import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function cleanMessages() {
  try {
    // Delete all messages to start fresh
    const deleted = await prisma.message.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} messages`);
    
    console.log('✅ Message table cleaned successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanMessages();
