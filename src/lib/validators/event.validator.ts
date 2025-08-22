import { EventData } from '../types'

const VALID_EVENT_TYPES = ['sent', 'open', 'click']

export function validateEvent(event: any): string | null {
  if (!event || !event.id || !event.type || !event.email || !event.site || !event.timestamp) {
    return `Event missing required fields: ${JSON.stringify(event)}`
  }

  if (!VALID_EVENT_TYPES.includes(event.type)) {
    return `Invalid event type: ${event.type}`
  }

  return null
}