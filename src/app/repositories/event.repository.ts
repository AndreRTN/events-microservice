import { prisma } from '../../lib/prisma'
import { EventData } from '../../lib/types'

export class EventRepository {
  async exists(eventId: string): Promise<boolean> {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })
    return !!event
  }

  async create(event: EventData): Promise<void> {
    await prisma.event.create({
      data: {
        id: event.id,
        type: event.type,
        email: event.email,
        site: event.site,
        timestamp: new Date(event.timestamp),
        metadata: event.metadata || {}
      }
    })
  }
}