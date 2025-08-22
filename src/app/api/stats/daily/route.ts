import { NextRequest, NextResponse } from 'next/server'
import { StatsService } from '../../../../services/stats.service'
import { StatsRepository } from '../../../repositories/stats.repository'
import { validateApiKey } from '../../../../lib/middleware/auth.middleware'
import { metrics } from '../../../../lib/metrics'

const statsRepository = new StatsRepository()
const statsService = new StatsService(statsRepository)

export async function GET(request: NextRequest) {
  metrics.incrementApiRequests()

  const authError = validateApiKey(request)
  if (authError) {
    metrics.incrementApiErrors()
    return NextResponse.json({ error: authError }, { status: 401 })
  }

  try {
    const response = await statsService.getDailyStats()
    return NextResponse.json(response, { status: 200 })
  } catch {
    metrics.incrementApiErrors()
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}