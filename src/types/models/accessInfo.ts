export type SocietyAccess = {
  societyId: string;
  societyName: string;
  isResident: boolean;
  isManager: boolean;
  hasActiveGuardDuty: boolean;
};

export type UserAccessInfo = {
  userId: string;
  roles: ('resident' | 'manager' | 'guard')[];
  societies: SocietyAccess[];
};
