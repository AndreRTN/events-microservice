import { EventRepository } from '../../app/repositories/event.repository'
import { EventData } from '../../lib/types'
import { prisma } from '../setup'

describe('EventRepository', () => {
  let eventRepository: EventRepository

  beforeEach(() => {
    eventRepository = new EventRepository()
  })

  describe('exists', () => {
    it('should return true when event exists', async () => {
      const eventData: EventData = {
        id: 'test-event-1',
        type: 'sent',
        email: 'test@example.com',
        site: 'example.com',
        timestamp: new Date().toISOString(),
        metadata: { campaign: 'test' }
      }

      await prisma.event.create({
        data: {
          id: eventData.id,
          type: eventData.type,
          email: eventData.email,
          site: eventData.site,
          timestamp: eventData.timestamp,
          metadata: eventData.metadata as any
        }
      })

      const exists = await eventRepository.exists('test-event-1')
      expect(exists).toBe(true)
    })

    it('should return false when event does not exist', async () => {
      const exists = await eventRepository.exists('non-existent-event')
      expect(exists).toBe(false)
    })
  })

  describe('create', () => {
    it('should create event successfully', async () => {
      const eventData: EventData = {
        id: 'test-event-2',
        type: 'open',
        email: 'test@example.com',
        site: 'example.com',
        timestamp: new Date('2024-01-01T12:00:00Z').toISOString(),
        metadata: { campaign: 'test', browser: 'chrome' }
      }

      await eventRepository.create(eventData)

      const createdEvent = await prisma.event.findUnique({
        where: { id: 'test-event-2' }
      })

      expect(createdEvent).toBeTruthy()
      expect(createdEvent?.id).toBe(eventData.id)
      expect(createdEvent?.type).toBe(eventData.type)
      expect(createdEvent?.email).toBe(eventData.email)
      expect(createdEvent?.site).toBe(eventData.site)
      expect(createdEvent?.timestamp).toEqual(new Date(eventData.timestamp))
      expect(createdEvent?.metadata).toEqual(eventData.metadata)
    })

    it('should create event with empty metadata', async () => {
      const eventData: EventData = {
        id: 'test-event-3',
        type: 'click',
        email: 'test@example.com',
        site: 'example.com',
        timestamp: new Date().toISOString(),
        metadata: undefined as unknown as Record<string, unknown>
      }

      await eventRepository.create(eventData)

      const createdEvent = await prisma.event.findUnique({
        where: { id: 'test-event-3' }
      })

      expect(createdEvent).toBeTruthy()
      expect(createdEvent?.metadata).toEqual({})
    })

    it('should handle timestamp as string', async () => {
      const eventData: EventData = {
        id: 'test-event-4',
        type: 'sent',
        email: 'test@example.com',
        site: 'example.com',
        timestamp: '2024-01-01T12:00:00Z',
        metadata: { campaign: 'test' }
      }

      await eventRepository.create(eventData)

      const createdEvent = await prisma.event.findUnique({
        where: { id: 'test-event-4' }
      })

      expect(createdEvent).toBeTruthy()
      expect(createdEvent?.timestamp).toEqual(new Date('2024-01-01T12:00:00Z'))
    })

    it('should throw error for duplicate id', async () => {
      const eventData: EventData = {
        id: 'duplicate-event',
        type: 'sent',
        email: 'test@example.com',
        site: 'example.com',
        timestamp: new Date().toISOString(),
        metadata: { campaign: 'test' }
      }

      await eventRepository.create(eventData)

      await expect(eventRepository.create(eventData)).rejects.toThrow()
    })
  })
})