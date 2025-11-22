import { ApprovedResidenceMembership } from "@models/residenceMembership";
import { ResidenceWithSociety } from "./residence";

export type ApprovedResidenceMembershipWithResidence = ApprovedResidenceMembership & {
  residence: ResidenceWithSociety | null;
};

export interface PendingMembershipData {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  residence: {
    id: string;
    short_name: string;
    flat_number: string;
    block: string | null;
    floor_number: number | null;
    society_id: string;
    is_occupied: boolean;
    created_at: string;
  };
  society: {
    society: {
      id: string;
      name: string;
      code: string;
      address: {
        street: string;
        city: string;
        state: string;
        zip_code?: string;
        zipCode?: string;
      };
      latitude: number;
      longitude: number;
      image_url: string | null;
      created_at: string;
    };
  };
  status_history: Array<{
    status: string;
    created_at: string;
  }>;
}


