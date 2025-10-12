import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@rtim.ai' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@rtim.ai',
      name: 'Demo User',
      username: 'demo',
      credits: 1000, // Start with 1000 credits
      tier: 'PRO',
    },
  })

  console.log('✅ Created demo user:', demoUser.email)
  console.log('   User ID:', demoUser.id)
  console.log('   Credits:', demoUser.credits)

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Demo user credentials:')
  console.log('   Email: demo@rtim.ai')
  console.log('   User ID: demo-user')
  console.log('   Credits: 1000')
  console.log('   Tier: PRO')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
