export interface ActivityDto {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  points: number;
  location: string;
  category: string;
  status: string;
  createdBy: string;
  createdAt: Date;
}