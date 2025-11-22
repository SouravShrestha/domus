import { Residence } from "@models/residence";
import { Society } from "@models/society";

export type ResidenceWithSociety = Residence & {
  society: Society;
};

export type MembershipStatusHistory = {
  status: string;
  statusSetAt: string;
};

// Extended residence type with camelCase properties for frontend use
export type ResidenceData = {
  id: string;
  societyId: string;
  flatNumber: string;
  block: string | null;
  floorNumber: number | null;
  shortName: string;
  isOccupied: boolean;
  createdAt: string;
};

// Extended society type with camelCase properties for frontend use
export type SocietyData = {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  logoUrl: string;
  createdAt: string;
};

export type ResidenceWithMembershipStatus = {
  membershipId?: string; // ID of the pending membership record
  residence: ResidenceData;
  society: SocietyData;
  membershipStatus: string;
  membershipStatusHistory?: MembershipStatusHistory[];
};

export type ResidenceResponse = ResidenceWithMembershipStatus[];
