import { ActivityDtoRequest } from '../../../repositories/activities/activity.model';
import { ActivityFormValue } from './models/activity-form.model';

const DEFAULT_ACTIVITY_POINTS = 0;

export function toActivityDtoRequest(
  formValue: ActivityFormValue,
): ActivityDtoRequest {
  return {
    title: formValue.titre.trim(),
    description: formValue.description.trim(),
    datetime: formValue.dateHeure,
    points: DEFAULT_ACTIVITY_POINTS,
    location: formValue.adresse.trim(),
  };
}