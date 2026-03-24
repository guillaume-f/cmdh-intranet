import { User } from "./user.model"

export type RegistrationStatus = 'confirmed' | 'cancelled' | 'waitlist'

export interface Registration {
  id: string
  activityId: string
  userId: string
  registeredAt: string
  status: RegistrationStatus
}

export interface RegistrationWithUser extends Registration {
  user?: User
}
