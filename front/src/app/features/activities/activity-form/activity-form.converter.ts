import { ActivityDtoRequest } from '../../../repositories/activities/activity.model';
import { ActivityFormValue } from './models/activity-form.model';

export function toActivityDtoRequest(
  formValue: ActivityFormValue,
): ActivityDtoRequest {
  return {
    title: formValue.titre.trim(),
    description: formValue.description.trim(),
    datetime: formValue.dateHeure,
    points: formValue.points,
    location: formValue.adresse.trim(),
  };
}