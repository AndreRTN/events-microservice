export interface EventRequest {
  events: EventData[]
}

export interface EventData {
  id: string
  type: 'sent' | 'open' | 'click'
  email: string
  site: string
  timestamp: string
  metadata: Record<string, any>
}

export interface EventResponse {
  processed: number
  duplicates: number
  errors: string[]
}

export interface DailyStats {
  date: string
  site: string
  sent: number
  open: number
  click: number
}

export interface DailyStatsResponse {
  stats: DailyStats[]
}