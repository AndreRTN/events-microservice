import { NextRequest } from 'next/server'
import { prisma } from '../../setup'

// Mock the production prisma to use our test instance
jest.mock('../../../lib/prisma', () => ({
  prisma: require('../../setup').prisma
}))

import { GET } from '../../../app/api/stats/daily/route'

describe('/api/stats/daily', () => {
  beforeEach(async () => {
    await prisma.event.deleteMany()
  })

  describe('GET', () => {
    it('should return daily stats with valid API key', async () => {
      const events = [
        {
          id: 'event-1',
          type: 'sent',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          metadata: { campaign: 'test' }
        },
        {
          id: 'event-2',
          type: 'open',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date('2024-01-01T11:00:00Z'),
          metadata: { campaign: 'test' }
        },
        {
          id: 'event-3',
          type: 'click',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date('2024-01-01T12:00:00Z'),
          metadata: { campaign: 'test' }
        },
        {
          id: 'event-4',
          type: 'sent',
          email: 'test2@example.com',
          site: 'test.com',
          timestamp: new Date('2024-01-01T13:00:00Z'),
          metadata: { campaign: 'test2' }
        }
      ]

      for (const event of events) {
        await prisma.event.create({ data: event })
      }

      const request = new NextRequest('http://localhost:3000/api/stats/daily', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-api-key'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('stats')
      expect(Array.isArray(data.stats)).toBe(true)
      
      if (data.stats.length > 0) {
        const stat = data.stats[0]
        expect(stat).toHaveProperty('date')
        expect(stat).toHaveProperty('site')
        expect(stat).toHaveProperty('sent')
        expect(stat).toHaveProperty('open')
        expect(stat).toHaveProperty('click')
      }
    })

    it('should return 401 for missing API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats/daily', {
        method: 'GET',
        headers: {}
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('API key is required')
    })

    it('should return 401 for invalid API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats/daily', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-key'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid API key')
    })

    it('should return empty stats when no events exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats/daily', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-api-key'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('stats')
      expect(data.stats).toEqual([])
    })

    it('should group stats by date and site correctly', async () => {
      const today = new Date()
      const events = [
        {
          id: 'event-1',
          type: 'sent',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date(today.getTime() - 3600000), // 1 hour ago
          metadata: {}
        },
        {
          id: 'event-2',
          type: 'sent',
          email: 'test2@example.com',
          site: 'example.com',
          timestamp: new Date(today.getTime() - 7200000), // 2 hours ago
          metadata: {}
        },
        {
          id: 'event-3',
          type: 'open',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date(today.getTime() - 10800000), // 3 hours ago
          metadata: {}
        },
        {
          id: 'event-4',
          type: 'sent',
          email: 'test@example.com',
          site: 'test.com',
          timestamp: new Date(today.getTime() - 14400000), // 4 hours ago
          metadata: {}
        }
      ]

      for (const event of events) {
        await prisma.event.create({ data: event })
      }

      const request = new NextRequest('http://localhost:3000/api/stats/daily', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-api-key'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats).toHaveLength(2)

      const exampleComStat = data.stats.find((s: any) => s.site === 'example.com')
      const testComStat = data.stats.find((s: any) => s.site === 'test.com')

      expect(exampleComStat).toBeTruthy()
      expect(exampleComStat.sent).toBe(2)
      expect(exampleComStat.open).toBe(1)
      expect(exampleComStat.click).toBe(0)

      expect(testComStat).toBeTruthy()
      expect(testComStat.sent).toBe(1)
      expect(testComStat.open).toBe(0)
      expect(testComStat.click).toBe(0)
    })

    it('should handle different event types correctly', async () => {
      const today = new Date()
      const events = [
        {
          id: 'event-1',
          type: 'sent',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date(today.getTime() - 3600000), // 1 hour ago
          metadata: {}
        },
        {
          id: 'event-2',
          type: 'open',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date(today.getTime() - 3600000), // 1 hour ago
          metadata: {}
        },
        {
          id: 'event-3',
          type: 'click',
          email: 'test@example.com',
          site: 'example.com',
          timestamp: new Date(today.getTime() - 3600000), // 1 hour ago
          metadata: {}
        }
      ]

      for (const event of events) {
        await prisma.event.create({ data: event })
      }

      const request = new NextRequest('http://localhost:3000/api/stats/daily', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-api-key'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats).toHaveLength(1)

      const stat = data.stats[0]
      expect(stat.sent).toBe(1)
      expect(stat.open).toBe(1)
      expect(stat.click).toBe(1)
    })
  })
})