import { NextResponse } from 'next/server'
import { metrics } from '../../../lib/metrics'

export async function GET() {
  try {
    const metricsData = metrics.getMetrics()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...metricsData
    }, { status: 200 })
  } catch {
    return NextResponse.json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}