import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Validação de ambiente
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }

  console.log('🌱 Starting database seed...')

  // Configuração via variável de ambiente
  const totalEvents = parseInt(process.env.SEED_EVENTS_COUNT || '1000', 10)
  if (totalEvents <= 0 || totalEvents > 100000) {
    process.exit(1)
  }

  console.log(`📊 Gerando ${totalEvents} eventos...`)

  const sites = ['example.com', 'test.com', 'demo.com', 'sample.org']
  const emails = [
    'user1@example.com',
    'user2@example.com',
    'admin@test.com',
    'contact@demo.com',
    'support@sample.org',
    'info@example.com',
    'sales@test.com',
    'marketing@demo.com'
  ]
  const eventTypes = ['sent', 'open', 'click'] as const
  const campaigns = ['newsletter', 'promo', 'welcome', 'reminder', 'announcement']

  const events = []
  let eventCounter = 1

  for (let i = 0; i < totalEvents; i++) {
    const randomSite = sites[Math.floor(Math.random() * sites.length)]
    const randomEmail = emails[Math.floor(Math.random() * emails.length)]
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)]

    const daysAgo = Math.floor(Math.random() * 90)
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)
    
    const timestamp = new Date()
    timestamp.setDate(timestamp.getDate() - daysAgo)
    timestamp.setHours(timestamp.getHours() - hoursAgo)
    timestamp.setMinutes(timestamp.getMinutes() - minutesAgo)

    const metadata: Record<string, any> = {
      campaign: randomCampaign,
      source: Math.random() > 0.5 ? 'web' : 'mobile'
    }

    if (randomType === 'open') {
      metadata.userAgent = Math.random() > 0.5 ? 'Chrome/91.0' : 'Firefox/89.0'
      metadata.location = Math.random() > 0.5 ? 'US' : 'BR'
    }

    if (randomType === 'click') {
      metadata.linkUrl = `https://${randomSite}/page-${Math.floor(Math.random() * 10)}`
      metadata.position = Math.floor(Math.random() * 5) + 1
    }

    if (randomType === 'sent') {
      metadata.messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`
      metadata.subject = `Subject for ${randomCampaign} campaign`
    }

    events.push({
      id: `event-${eventCounter.toString().padStart(6, '0')}`,
      type: randomType,
      email: randomEmail,
      site: randomSite,
      timestamp,
      metadata
    })

    eventCounter++
  }

  console.log(`📝 Creating ${events.length} events...`)

  const batchSize = 100
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize)
    await prisma.event.createMany({
      data: batch,
    })
    console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`)
  }

  const totalCreated = await prisma.event.count()
  console.log(`🎉 Seed completed! Created ${totalCreated} events in total.`)

  const stats = await prisma.event.groupBy({
    by: ['type'],
    _count: {
      type: true
    }
  })

  console.log('\n📊 Event distribution:')
  stats.forEach(stat => {
    console.log(`  ${stat.type}: ${stat._count.type} events`)
  })

  const siteStats = await prisma.event.groupBy({
    by: ['site'],
    _count: {
      site: true
    }
  })

  console.log('\n🌐 Site distribution:')
  siteStats.forEach(stat => {
    console.log(`  ${stat.site}: ${stat._count.site} events`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })