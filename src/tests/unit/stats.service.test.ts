import { StatsService } from '../../services/stats.service'
import { StatsRepository } from '../../app/repositories/stats.repository'
import { DailyStats } from '../../lib/types'

jest.mock('../../app/repositories/stats.repository')

describe('StatsService', () => {
  let statsService: StatsService
  let mockStatsRepository: jest.Mocked<StatsRepository>

  beforeEach(() => {
    mockStatsRepository = new StatsRepository() as jest.Mocked<StatsRepository>
    statsService = new StatsService(mockStatsRepository)
  })

  describe('getDailyStats', () => {
    it('should return daily stats successfully', async () => {
      const mockStats: DailyStats[] = [
        {
          date: '2024-01-01',
          site: 'example.com',
          sent: 100,
          open: 50,
          click: 10
        },
        {
          date: '2024-01-01',
          site: 'test.com',
          sent: 200,
          open: 80,
          click: 15
        }
      ]

      mockStatsRepository.getDailyStats.mockResolvedValue(mockStats)

      const result = await statsService.getDailyStats()

      expect(result).toEqual({ stats: mockStats })
      expect(mockStatsRepository.getDailyStats).toHaveBeenCalledWith()
    })

    it('should return empty stats when no data available', async () => {
      mockStatsRepository.getDailyStats.mockResolvedValue([])

      const result = await statsService.getDailyStats()

      expect(result).toEqual({ stats: [] })
      expect(mockStatsRepository.getDailyStats).toHaveBeenCalledWith()
    })

    it('should handle repository errors', async () => {
      mockStatsRepository.getDailyStats.mockRejectedValue(new Error('Database error'))

      await expect(statsService.getDailyStats()).rejects.toThrow('Database error')
      expect(mockStatsRepository.getDailyStats).toHaveBeenCalledWith()
    })
  })
})