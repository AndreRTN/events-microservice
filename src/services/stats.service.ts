import { StatsRepository } from '../app/repositories/stats.repository'
import { DailyStatsResponse, GeneralStatsResponse } from '../lib/types'

export class StatsService {
  constructor(private statsRepository: StatsRepository) {}

  async getDailyStats(site?: string, from?: string, to?: string): Promise<DailyStatsResponse> {
    const stats = await this.statsRepository.getDailyStats(
      site || undefined, 
      from || undefined, 
      to || undefined
    )
    return { stats }
  }

  async getGeneralStats(site?: string, from?: string, to?: string): Promise<GeneralStatsResponse> {
    const stats = await this.statsRepository.getGeneralStats(
      site || undefined, 
      from || undefined, 
      to || undefined
    )
    return { stats }
  }
}