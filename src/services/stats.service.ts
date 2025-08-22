import { StatsRepository } from '../app/repositories/stats.repository'
import { DailyStatsResponse } from '../lib/types'

export class StatsService {
  constructor(private statsRepository: StatsRepository) {}

  async getDailyStats(): Promise<DailyStatsResponse> {
    const stats = await this.statsRepository.getDailyStats()
    return { stats }
  }
}