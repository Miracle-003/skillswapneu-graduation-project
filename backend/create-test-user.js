import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

const prisma = new PrismaClient()

async function createTestUser() {
  const email = 'test@skillswap.com'
  const password = 'Test123456'
  
  console.log('\n🔧 Creating test user...')
  console.log('Email:', email)
  console.log('Password:', password)
  
  try {
    // Check if user already exists
    const existing = await prisma.appUser.findUnique({
      where: { email }
    })
    
    if (existing) {
      console.log('\n⚠️  User already exists. Deleting old user...')
      await prisma.appUser.delete({
        where: { email }
      })
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Create the user with verified email
    const user = await prisma.appUser.create({
      data: {
        email,
        passwordHash,
        emailVerifiedAt: new Date(), // Mark as verified
        avatarUrl: null
      }
    })
    
    console.log('\n✅ Test user created successfully!')
    console.log('\n==============================================')
    console.log('📧 TEST USER CREDENTIALS')
    console.log('==============================================')
    console.log('Email:    ', email)
    console.log('Password: ', password)
    console.log('User ID:  ', user.id)
    console.log('Verified: ', user.emailVerifiedAt ? 'Yes ✅' : 'No ❌')
    console.log('==============================================\n')
    console.log('You can now login at: http://localhost:3000/auth/login\n')
    
  } catch (error) {
    console.error('\n❌ Error creating test user:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
