import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { metrics } from '../../../lib/metrics'

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    metrics.updateDatabaseConnection()
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      database: 'connected'
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(healthData, { status: 503 })
  }
}