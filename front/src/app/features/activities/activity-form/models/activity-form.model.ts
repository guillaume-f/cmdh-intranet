import { TypedControlsOf } from "../../../../utilities/typed-controls";

export interface ActivityFormValue {
  titre: string;
  description: string;
  dateHeure: Date;
  adresse: string;
}

export type ActivityForm = TypedControlsOf<ActivityFormValue>;
