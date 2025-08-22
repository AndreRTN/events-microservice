import { NextRequest, NextResponse } from 'next/server'
import { EventRequest } from '@/lib/types'
import { EventService } from '../../../services/event.service'
import { EventRepository } from '@/app/repositories/event.repository'
import { validateApiKey } from '../../../lib/middleware/auth.middleware'
import { metrics } from '../../../lib/metrics'

const eventRepository = new EventRepository()
const eventService = new EventService(eventRepository)

export async function POST(request: NextRequest) {
  metrics.incrementApiRequests()

  const authError = validateApiKey(request)
  if (authError) {
    metrics.incrementApiErrors()
    return NextResponse.json({ error: authError }, { status: 401 })
  }

  try {
    const body: EventRequest = await request.json()
    const response = await eventService.processEvents(body)
    
    metrics.incrementEventsProcessed(response.processed)
    metrics.incrementEventsDuplicates(response.duplicates)
    metrics.incrementEventsErrors(response.errors.length)
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    metrics.incrementApiErrors()
    if (error instanceof Error && error.message.includes('Invalid request')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}