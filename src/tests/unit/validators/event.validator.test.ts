import { validateEvent } from '../../../lib/validators/event.validator'
import { EventData } from '../../../lib/types'

describe('validateEvent', () => {
  const validEvent: EventData = {
    id: 'event-123',
    type: 'sent',
    email: 'test@example.com',
    site: 'example.com',
    timestamp: new Date().toISOString(),
    metadata: { campaign: 'test' }
  }

  it('should return null for valid event', () => {
    const result = validateEvent(validEvent)
    expect(result).toBeNull()
  })

  it('should return error for missing id', () => {
    const event = { ...validEvent, id: '' }
    const result = validateEvent(event)
    expect(result).toContain('Event missing required fields')
    expect(result).toContain('id')
  })

  it('should return error for missing type', () => {
    const event = { ...validEvent }
    delete (event as Record<string, unknown>).type
    const result = validateEvent(event)
    expect(result).toContain('Event missing required fields')
  })

  it('should return error for missing email', () => {
    const event = { ...validEvent, email: '' }
    const result = validateEvent(event)
    expect(result).toContain('Event missing required fields')
  })

  it('should return error for missing site', () => {
    const event = { ...validEvent, site: '' }
    const result = validateEvent(event)
    expect(result).toContain('Event missing required fields')
  })

  it('should return error for missing timestamp', () => {
    const event = { ...validEvent }
    delete (event as Record<string, unknown>).timestamp
    const result = validateEvent(event)
    expect(result).toContain('Event missing required fields')
  })

  it('should return error for invalid event type', () => {
    const event = { ...validEvent, type: 'invalid' }
    const result = validateEvent(event)
    expect(result).toContain('Invalid event type: invalid')
  })

  it('should accept all valid event types', () => {
    const validTypes = ['sent', 'open', 'click']
    
    validTypes.forEach(type => {
      const event = { ...validEvent, type }
      const result = validateEvent(event)
      expect(result).toBeNull()
    })
  })

  it('should handle null event', () => {
    const result = validateEvent(null)
    expect(result).toContain('Event must be an object')
  })

  it('should handle undefined event', () => {
    const result = validateEvent(undefined)
    expect(result).toContain('Event must be an object')
  })

  it('should handle empty object', () => {
    const result = validateEvent({})
    expect(result).toContain('Event missing required fields')
  })

  it('should handle event with null values', () => {
    const event = {
      id: null,
      type: null,
      email: null,
      site: null,
      timestamp: null
    }
    const result = validateEvent(event)
    expect(result).toContain('Event missing required fields')
  })

  it('should validate event with metadata', () => {
    const event = {
      ...validEvent,
      metadata: { campaign: 'test', browser: 'chrome' }
    }
    const result = validateEvent(event)
    expect(result).toBeNull()
  })

  it('should validate event without metadata', () => {
    const event = { ...validEvent }
    delete (event as Record<string, unknown>).metadata
    const result = validateEvent(event)
    expect(result).toBeNull()
  })
})