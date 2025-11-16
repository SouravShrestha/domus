import { Residence } from "@models/residence";
import { Society } from "@models/society";

export type ResidenceWithSociety = Residence & {
  society: Society;
};
