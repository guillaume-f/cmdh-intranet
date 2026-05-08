import { TypedControlsOf } from "../../../../utilities/typed-controls";

export interface ActivityFormValue {
  titre: string;
  description: string;
  date: Date | null;
  heure: string;
  adresse: string;
}

export type ActivityForm = TypedControlsOf<ActivityFormValue>;
