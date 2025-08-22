import { NextRequest } from 'next/server'

export function validateApiKey(request: NextRequest): string | null {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!apiKey) {
    return 'API key is required'
  }

  const validApiKey = process.env.API_KEY
  if (!validApiKey) {
    return 'Server configuration error'
  }

  if (apiKey !== validApiKey) {
    return 'Invalid API key'
  }

  return null
}