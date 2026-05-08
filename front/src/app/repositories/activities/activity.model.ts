export interface ActivityDto {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  points: number;
  location: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  isRegistered: boolean;
  registeredAt?: Date;
}

export interface ActivityDtoRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  points: number;
  location: string;
}