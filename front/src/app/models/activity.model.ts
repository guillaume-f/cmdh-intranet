
export type ActivityCategory = 'reunion' | 'formation' | 'evenement' | 'autre'
export type ActivityStatus = 'draft' | 'published' | 'cancelled'

export interface Activity {
  id: string
  title: string
  description: string
  date: string        // ISO date YYYY-MM-DD
  time: string        // HH:mm
  points: number
  location: string
  maxParticipants: number
  category: ActivityCategory
  status: ActivityStatus
  createdBy: string   // userId
  createdAt: string   // ISO datetime
}

export interface ActivityFormData {
  title: string
  description: string
  date: string
  time: string
  points: number
  location: string
  maxParticipants: number
  category: ActivityCategory
  status: ActivityStatus
}