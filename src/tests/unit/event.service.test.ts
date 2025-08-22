import { EventService } from '../../services/event.service'
import { EventRepository } from '../../app/repositories/event.repository'
import { EventRequest, EventData } from '../../lib/types'

jest.mock('../../app/repositories/event.repository')

describe('EventService', () => {
  let eventService: EventService
  let mockEventRepository: jest.Mocked<EventRepository>

  beforeEach(() => {
    mockEventRepository = new EventRepository() as jest.Mocked<EventRepository>
    eventService = new EventService(mockEventRepository)
  })

  describe('processEvents', () => {
    it('should process valid events successfully', async () => {
      const request: EventRequest = {
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

      mockEventRepository.exists.mockResolvedValue(false)
      mockEventRepository.create.mockResolvedValue()

      const result = await eventService.processEvents(request)

      expect(result.processed).toBe(1)
      expect(result.duplicates).toBe(0)
      expect(result.errors).toHaveLength(0)
      expect(mockEventRepository.create).toHaveBeenCalledWith(request.events[0])
    })

    it('should handle duplicate events', async () => {
      const request: EventRequest = {
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

      mockEventRepository.exists.mockResolvedValue(true)

      const result = await eventService.processEvents(request)

      expect(result.processed).toBe(0)
      expect(result.duplicates).toBe(1)
      expect(result.errors).toHaveLength(0)
      expect(mockEventRepository.create).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const request: EventRequest = {
        events: [
          {
            id: '',
            type: 'invalid' as 'sent' | 'open' | 'click',
            email: 'invalid-email',
            site: '',
            timestamp: new Date().toISOString(),
            metadata: {}
          } as EventData
        ]
      }

      const result = await eventService.processEvents(request)

      expect(result.processed).toBe(0)
      expect(result.duplicates).toBe(0)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(mockEventRepository.create).not.toHaveBeenCalled()
    })

    it('should handle repository errors', async () => {
      const request: EventRequest = {
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

      mockEventRepository.exists.mockResolvedValue(false)
      mockEventRepository.create.mockRejectedValue(new Error('Database error'))

      const result = await eventService.processEvents(request)

      expect(result.processed).toBe(0)
      expect(result.duplicates).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Database error')
    })

    it('should throw error for invalid request format', async () => {
      const request = { events: null } as unknown as EventRequest

      await expect(eventService.processEvents(request)).rejects.toThrow(
        'Invalid request: events array is required'
      )
    })

    it('should process mixed valid and invalid events', async () => {
      const request: EventRequest = {
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
            id: '',
            type: 'invalid' as 'sent' | 'open' | 'click',
            email: 'invalid-email',
            site: '',
            timestamp: new Date().toISOString(),
            metadata: {}
          } as EventData,
          {
            id: 'event-3',
            type: 'open',
            email: 'test2@example.com',
            site: 'example.com',
            timestamp: new Date().toISOString(),
            metadata: { campaign: 'test' }
          }
        ]
      }

      mockEventRepository.exists.mockResolvedValue(false)
      mockEventRepository.create.mockResolvedValue()

      const result = await eventService.processEvents(request)

      expect(result.processed).toBe(2)
      expect(result.duplicates).toBe(0)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(mockEventRepository.create).toHaveBeenCalledTimes(2)
    })
  })
})