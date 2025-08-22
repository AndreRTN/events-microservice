import { prisma } from '../../lib/prisma'
import { DailyStats, GeneralStats } from '../../lib/types'

export class StatsRepository {
  async getDailyStats(site?: string, from?: string, to?: string): Promise<DailyStats[]> {
    const where: any = {}
    
    if (site) {
      where.site = site
    }
    if (from || to) {
      where.timestamp = {}
      if (from) {
        where.timestamp.gte = new Date(from)
      }
      if (to) {
        where.timestamp.lte = new Date(to + 'T23:59:59.999Z')
      }
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        site: true,
        type: true,
        timestamp: true
      }
    })

    const groupedStats = new Map<string, DailyStats>()

    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0]
      const key = `${date}-${event.site}`
      
      if (!groupedStats.has(key)) {
        groupedStats.set(key, {
          date,
          site: event.site,
          sent: 0,
          open: 0,
          click: 0
        })
      }

      const stat = groupedStats.get(key)!
      stat[event.type as keyof Pick<DailyStats, 'sent' | 'open' | 'click'>]++
    })

    return Array.from(groupedStats.values()).sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date) // DESC by date
      }
      return a.site.localeCompare(b.site) // ASC by site
    })
  }

  async getGeneralStats(site?: string, from?: string, to?: string): Promise<GeneralStats[]> {
    const where: any = {}
    
    if (site) {
      where.site = site
    }
    if (from || to) {
      where.timestamp = {}
      if (from) {
        where.timestamp.gte = new Date(from)
      }
      if (to) {
        where.timestamp.lte = new Date(to + 'T23:59:59.999Z')
      }
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        site: true,
        type: true
      }
    })

    const groupedStats = new Map<string, GeneralStats>()

    events.forEach(event => {
      if (!groupedStats.has(event.site)) {
        groupedStats.set(event.site, {
          site: event.site,
          sent: 0,
          open: 0,
          click: 0,
          openRate: 0,
          clickRate: 0
        })
      }

      const stat = groupedStats.get(event.site)!
      stat[event.type as keyof Pick<GeneralStats, 'sent' | 'open' | 'click'>]++
    })

    // Calculate rates
    groupedStats.forEach(stat => {
      stat.openRate = stat.sent > 0 ? Math.round((stat.open / stat.sent) * 100 * 100) / 100 : 0
      stat.clickRate = stat.sent > 0 ? Math.round((stat.click / stat.sent) * 100 * 100) / 100 : 0
    })

    return Array.from(groupedStats.values()).sort((a, b) => a.site.localeCompare(b.site))
  }
}