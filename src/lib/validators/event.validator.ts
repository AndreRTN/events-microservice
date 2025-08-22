import { EventData } from '../types'

const VALID_EVENT_TYPES = ['sent', 'open', 'click']

export function validateEvent(event: unknown): string | null {
  if (!event || typeof event !== 'object') {
    return `Event must be an object: ${JSON.stringify(event)}`
  }

  const eventObj = event as Record<string, unknown>
  
  if (!eventObj.id || !eventObj.type || !eventObj.email || !eventObj.site || !eventObj.timestamp) {
    return `Event missing required fields: ${JSON.stringify(event)}`
  }

  if (!VALID_EVENT_TYPES.includes(eventObj.type as string)) {
    return `Invalid event type: ${eventObj.type}`
  }

  return null
}