export interface UserValidatedActivityDto {
  activityId: string;
  title: string;
  datetime: string;
  points: number;
}

export interface UserValidatedActivitiesSummaryDto {
  items: UserValidatedActivityDto[];
  totalPoints: number;
}