import { EventRepository } from '../app/repositories/event.repository'
import { EventRequest, EventResponse, EventData } from '../lib/types'
import { validateEvent } from '../lib/validators/event.validator'

export class EventService {
  constructor(private eventRepository: EventRepository) {}

  async processEvents(request: EventRequest): Promise<EventResponse> {
    const response: EventResponse = {
      processed: 0,
      duplicates: 0,
      errors: []
    }

    if (!request.events || !Array.isArray(request.events)) {
      throw new Error('Invalid request: events array is required')
    }

    for (const event of request.events) {
      try {
        const validationError = validateEvent(event)
        if (validationError) {
          response.errors.push(validationError)
          continue
        }

        const isDuplicate = await this.eventRepository.exists(event.id)
        if (isDuplicate) {
          response.duplicates++
          continue
        }

        await this.eventRepository.create(event)
        response.processed++
      } catch (error) {
        response.errors.push(`Error processing event ${event.id}: ${error}`)
      }
    }

    return response
  }
}