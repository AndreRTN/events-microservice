import { NextRequest } from 'next/server'
import { POST } from '../../../app/api/events/route'
import { prisma } from '../../setup'

describe('/api/events', () => {
  beforeEach(async () => {
    await prisma.event.deleteMany()
  })

  describe('POST', () => {
    it('should create events successfully with valid API key', async () => {
      const requestBody = {
        events: [
          {
            id: 'event-1',
            type: 'sent',
            email: 'test@example.com',
            site: 'example.com',
            timestamp: new Date().toISOString(),
            metadata: { campaign: 'test' }
          },
          {
            id: 'event-2',
            type: 'open',
            email: 'test2@example.com',
            site: 'example.com',
            timestamp: new Date().toISOString(),
            metadata: { campaign: 'test' }
          }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.processed).toBe(2)
      expect(data.duplicates).toBe(0)
      expect(data.errors).toHaveLength(0)

      const eventsInDb = await prisma.event.findMany()
      expect(eventsInDb).toHaveLength(2)
    })

    it('should return 401 for missing API key', async () => {
      const requestBody = {
        events: [
          {
            id: 'event-1',
            type: 'sent',
            email: 'test@example.com',
            site: 'example.com',
            timestamp: new Date().toISOString(),
            metadata: { campaign: 'test' }
          }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('API key is required')
    })

    it('should return 401 for invalid API key', async () => {
      const requestBody = {
        events: [
          {
            id: 'event-1',
            type: 'sent',
            email: 'test@example.com',
            site: 'example.com',
            timestamp: new Date().toISOString(),
            metadata: { campaign: 'test' }
          }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-key'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid API key')
    })

    it('should handle duplicate events', async () => {
      const eventData = {
        id: 'duplicate-event',
        type: 'sent',
        email: 'test@example.com',
        site: 'example.com',
        timestamp: new Date().toISOString(),
        metadata: { campaign: 'test' }
      }

      await prisma.event.create({
        data: {
          ...eventData,
          timestamp: new Date(eventData.timestamp)
        }
      })

      const requestBody = {
        events: [eventData]
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.processed).toBe(0)
      expect(data.duplicates).toBe(1)
      expect(data.errors).toHaveLength(0)

      const eventsInDb = await prisma.event.findMany()
      expect(eventsInDb).toHaveLength(1)
    })

    it('should handle validation errors', async () => {
      const requestBody = {
        events: [
          {
            id: '',
            type: 'invalid',
            email: 'invalid-email',
            site: '',
            timestamp: new Date().toISOString(),
            metadata: {}
          }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.processed).toBe(0)
      expect(data.duplicates).toBe(0)
      expect(data.errors.length).toBeGreaterThan(0)

      const eventsInDb = await prisma.event.findMany()
      expect(eventsInDb).toHaveLength(0)
    })

    it('should return 400 for invalid request format', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify({ events: null })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid request')
    })

    it('should return 500 for malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should process mixed valid and invalid events', async () => {
      const requestBody = {
        events: [
          {
            id: 'valid-event-1',
            type: 'sent',
            email: 'test@example.com',
            site: 'example.com',
            timestamp: new Date().toISOString(),
            metadata: { campaign: 'test' }
          },
          {
            id: '',
            type: 'invalid',
            email: 'invalid',
            site: '',
            timestamp: new Date().toISOString(),
            metadata: {}
          },
          {
            id: 'valid-event-2',
            type: 'open',
            email: 'test2@example.com',
            site: 'example.com',
            timestamp: new Date().toISOString(),
            metadata: { campaign: 'test' }
          }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.processed).toBe(2)
      expect(data.duplicates).toBe(0)
      expect(data.errors.length).toBeGreaterThan(0)

      const eventsInDb = await prisma.event.findMany()
      expect(eventsInDb).toHaveLength(2)
    })
  })
})