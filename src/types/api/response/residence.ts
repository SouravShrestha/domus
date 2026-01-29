import { Residence } from "@models/residence";
import { Society } from "@models/society";

export type ResidenceWithSociety = Residence & {
  society: Society;
};

export type ResidenceWithOccupancy = ResidenceWithSociety & {
  is_occupied: boolean;
  approved_membership_count: number;
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

// Grouped residences by floor for manager view
export type ResidencesByFloor = {
  floor: number;
  residences: ResidenceWithSociety[];
};

// Member info for residence details
export type ResidenceMemberInfo = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  photoUrl: string | null;
  role: string;
  createdAt: string;
};

export type ResidenceDetails = {
  residence: ResidenceData;
  society: SocietyData;
  hasOwner: boolean;
  members: ResidenceMemberInfo[];
};
