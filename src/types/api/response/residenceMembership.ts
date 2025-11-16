import { ApprovedResidenceMembership } from "@models/residenceMembership";
import { ResidenceWithSociety } from "./residence";

export type ApprovedResidenceMembershipWithResidence = ApprovedResidenceMembership & {
  residence: ResidenceWithSociety | null;
};

