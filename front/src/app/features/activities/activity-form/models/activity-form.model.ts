import { TypedControlsOf } from "../../../../utilities/typed-controls";

export interface ActivityFormValue {
  titre: string;
  description: string;
  dateHeure: Date;
  adresse: string;
  points: number;
  requiresRegistration: boolean;
  requiresAttendanceValidation: boolean;
}

export type ActivityForm = TypedControlsOf<ActivityFormValue>;
