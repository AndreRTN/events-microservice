import { prisma } from '../../lib/prisma'
import { DailyStats, GeneralStats } from '../../lib/types'

export class StatsRepository {
  async getDailyStats(site?: string, from?: string, to?: string): Promise<DailyStats[]> {
    const conditions: any[] = []
    let whereClause = ''
    
    if (site || from || to) {
      const conditionStrings: string[] = []
      if (site) {
        conditions.push(site)
        conditionStrings.push('site = ?')
      }
      if (from) {
        conditions.push(new Date(from).getTime())
        conditionStrings.push('timestamp >= ?')
      }
      if (to) {
        conditions.push(new Date(to + ' 23:59:59').getTime())
        conditionStrings.push('timestamp <= ?')
      }
      whereClause = `WHERE ${conditionStrings.join(' AND ')}`
    }

    const query = `
      SELECT 
        date(timestamp / 1000, 'unixepoch') as date,
        site,
        type,
        COUNT(*) as count
      FROM "Event" 
      ${whereClause}
      GROUP BY date(timestamp / 1000, 'unixepoch'), site, type
      ORDER BY date DESC, site
    `

    const dailyStats = await prisma.$queryRawUnsafe<Array<{
      date: string
      site: string
      type: string
      count: bigint
    }>>(query, ...conditions)

    const groupedStats = new Map<string, DailyStats>()

    dailyStats.forEach(row => {
      const key = `${row.date}-${row.site}`
      
      if (!groupedStats.has(key)) {
        groupedStats.set(key, {
          date: row.date,
          site: row.site,
          sent: 0,
          open: 0,
          click: 0
        })
      }

      const stat = groupedStats.get(key)!
      stat[row.type as keyof Pick<DailyStats, 'sent' | 'open' | 'click'>] = Number(row.count)
    })

    return Array.from(groupedStats.values())
  }

  async getGeneralStats(site?: string, from?: string, to?: string): Promise<GeneralStats[]> {
    const conditions: any[] = []
    let whereClause = ''
    
    if (site || from || to) {
      const conditionStrings: string[] = []
      if (site) {
        conditions.push(site)
        conditionStrings.push('site = ?')
      }
      if (from) {
        conditions.push(new Date(from).getTime())
        conditionStrings.push('timestamp >= ?')
      }
      if (to) {
        conditions.push(new Date(to + ' 23:59:59').getTime())
        conditionStrings.push('timestamp <= ?')
      }
      whereClause = `WHERE ${conditionStrings.join(' AND ')}`
    }

    const query = `
      SELECT 
        site,
        type,
        COUNT(*) as count
      FROM "Event" 
      ${whereClause}
      GROUP BY site, type
      ORDER BY site
    `

    const stats = await prisma.$queryRawUnsafe<Array<{
      site: string
      type: string
      count: bigint
    }>>(query, ...conditions)

    const groupedStats = new Map<string, GeneralStats>()

    stats.forEach(row => {
      if (!groupedStats.has(row.site)) {
        groupedStats.set(row.site, {
          site: row.site,
          sent: 0,
          open: 0,
          click: 0,
          openRate: 0,
          clickRate: 0
        })
      }

      const stat = groupedStats.get(row.site)!
      stat[row.type as keyof Pick<GeneralStats, 'sent' | 'open' | 'click'>] = Number(row.count)
    })

    // Calculate rates
    groupedStats.forEach(stat => {
      stat.openRate = stat.sent > 0 ? Math.round((stat.open / stat.sent) * 100 * 100) / 100 : 0
      stat.clickRate = stat.sent > 0 ? Math.round((stat.click / stat.sent) * 100 * 100) / 100 : 0
    })

    return Array.from(groupedStats.values())
  }
}