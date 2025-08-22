import { prisma } from '../../lib/prisma'
import { DailyStats } from '../../lib/types'

export class StatsRepository {
  async getDailyStats(): Promise<DailyStats[]> {
    const dailyStats = await prisma.$queryRaw<Array<{
      date: string
      site: string
      type: string
      count: bigint
    }>>`
      SELECT 
        strftime('%Y-%m-%d', timestamp) as date,
        site,
        type,
        COUNT(*) as count
      FROM "Event" 
      GROUP BY strftime('%Y-%m-%d', timestamp), site, type
      ORDER BY date DESC, site
    `

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
}