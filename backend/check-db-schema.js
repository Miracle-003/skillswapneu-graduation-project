import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Check messages table structure
    const messagesInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `;
    
    console.log('Messages table columns:');
    console.log(messagesInfo);
    
    // Try to select one message if any
    const sampleMessage = await prisma.$queryRaw`SELECT * FROM messages LIMIT 1`;
    console.log('\nSample message:');
    console.log(sampleMessage);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
