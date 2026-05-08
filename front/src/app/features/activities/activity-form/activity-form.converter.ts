import { ActivityDtoRequest } from '../../../repositories/activities/activity.model';
import { ActivityFormValue } from './models/activity-form.model';

const DEFAULT_ACTIVITY_POINTS = 0;

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toActivityDtoRequest(
  formValue: ActivityFormValue,
): ActivityDtoRequest {
  return {
    title: formValue.titre.trim(),
    description: formValue.description.trim(),
    date: formatDateForApi(formValue.date as Date),
    time: formValue.heure,
    points: DEFAULT_ACTIVITY_POINTS,
    location: formValue.adresse.trim(),
  };
}