class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: {
    eventsProcessed: number
    eventsErrors: number
    eventsDuplicates: number
    apiRequests: number
    apiErrors: number
    lastDatabaseConnection: Date | null
    startTime: Date
  }

  private constructor() {
    this.metrics = {
      eventsProcessed: 0,
      eventsErrors: 0,
      eventsDuplicates: 0,
      apiRequests: 0,
      apiErrors: 0,
      lastDatabaseConnection: null,
      startTime: new Date()
    }
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  incrementEventsProcessed(count: number = 1): void {
    this.metrics.eventsProcessed += count
  }

  incrementEventsErrors(count: number = 1): void {
    this.metrics.eventsErrors += count
  }

  incrementEventsDuplicates(count: number = 1): void {
    this.metrics.eventsDuplicates += count
  }

  incrementApiRequests(): void {
    this.metrics.apiRequests++
  }

  incrementApiErrors(): void {
    this.metrics.apiErrors++
  }

  updateDatabaseConnection(): void {
    this.metrics.lastDatabaseConnection = new Date()
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime.getTime()
    
    return {
      events: {
        processed: this.metrics.eventsProcessed,
        errors: this.metrics.eventsErrors,
        duplicates: this.metrics.eventsDuplicates
      },
      api: {
        requests: this.metrics.apiRequests,
        errors: this.metrics.apiErrors
      },
      database: {
        lastConnection: this.metrics.lastDatabaseConnection?.toISOString() || null
      },
      system: {
        uptime: Math.round(uptime / 1000), // seconds
        startTime: this.metrics.startTime.toISOString()
      }
    }
  }

  reset(): void {
    this.metrics = {
      eventsProcessed: 0,
      eventsErrors: 0,
      eventsDuplicates: 0,
      apiRequests: 0,
      apiErrors: 0,
      lastDatabaseConnection: null,
      startTime: new Date()
    }
  }
}

export const metrics = MetricsCollector.getInstance()