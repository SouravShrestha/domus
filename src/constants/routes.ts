export const ROUTES = {
  AUTH: {
    WELCOME: "/(auth)/welcome" as const,
    PHONE: "/(auth)/phone" as const,
    VERIFY: "/(auth)/verify" as const,
    REGISTER: "/(auth)/register" as const,
  },

  // Resident routes
  RESIDENT: {
    HOME: "/(resident)/(tabs)/home" as const,
    SERVICES: "/(resident)/(tabs)/services" as const,
    ACTIVITIES: "/(resident)/(tabs)/activities" as const,
    PROFILE: "/(resident)/(tabs)/profile" as const,
    SCREENS: {
      QR: {
        SCANNER: "/(resident)/screens/qr/qrScanner" as const,
        CONFIRMATION: "/(resident)/screens/qr/qrConfirmation" as const,
      },
      INVITE: {
        ENTER_CODE: "/(resident)/screens/invite/enterInviteCodeScreen" as const,
        SUCCESS: "/(resident)/screens/invite/inviteSuccessScreen" as const,
      },
      INFO: {
        WHY_CHOOSE_US: "/(resident)/screens/info/whyChooseUs" as const,
        ONBOARD_SOCIETY: "/(resident)/screens/info/onboardSociety" as const,
      },
      MEMBERSHIP: {
        STATUS: "/(resident)/screens/membership/membershipStatusScreen" as const,
        NO_MEMBERSHIP: "/(resident)/screens/membership/noMembership" as const,
      },
      PEOPLE: {
        MANAGE_FAMILY: "/(resident)/screens/people/manageFamilyScreen" as const,
        MANAGE_TENANTS: "/(resident)/screens/people/manageTenantsScreen" as const,
        MANAGE_STAFF: "/(resident)/screens/people/manageStaffScreen" as const,
        ADD_MEMBER: "/(resident)/screens/people/addMemberScreen" as const,
        ADD_FAMILY_MEMBER: "/(resident)/screens/people/addFamilyMemberScreen" as const,
        FAMILY_MEMBER_DETAILS: "/(resident)/screens/people/familyMemberDetailsScreen" as const,
        TENANT_DETAILS: "/(resident)/screens/people/tenantDetailsScreen" as const,
        STAFF_DETAILS: "/(resident)/screens/people/staffDetailsScreen" as const,
        INVITE_SENT_SUCCESS: "/(resident)/screens/people/inviteSentSuccessScreen" as const,
        EDIT_FAMILY_MEMBER_PERMISSIONS: "/(resident)/screens/people/editFamilyMemberPermissionsScreen" as const,
      },
      VISITORS: {
        INVITE_GUEST: "/(resident)/screens/visitors/inviteGuestScreen" as const,
        MANAGE_VISITORS: "/(resident)/screens/visitors/manageVisitorsScreen" as const,
        VISITOR_HISTORY: "/(resident)/screens/visitors/visitorHistoryScreen" as const,
        VISIT_TIME_PICKER: "/(resident)/screens/visitors/visitTimePickerScreen" as const,
      },
    },
  },

  // Guard routes
  GUARD: {
    HOME: "/(guard)/(tabs)/scanner" as const,
    SCANNER: "/(guard)/(tabs)/scanner" as const,
    VISITORS: "/(guard)/(tabs)/visitors" as const,
    LOGS: "/(guard)/(tabs)/logs" as const,
    PROFILE: "/(guard)/(tabs)/profile" as const,
  },

  // Manager routes
  MANAGER: {
    HOME: "/(manager)/(tabs)/dashboard" as const,
    DASHBOARD: "/(manager)/(tabs)/dashboard" as const,
    RESIDENTS: "/(manager)/(tabs)/residents" as const,
    GUARDS: "/(manager)/(tabs)/guards" as const,
    PROFILE: "/(manager)/(tabs)/profile" as const,
  },

  // Legacy routes for backward compatibility (maps to resident)
  TABS: {
    HOME: "/(resident)/(tabs)/home" as const,
  },

  SCREENS: {
    QR: {
      SCANNER: "/(resident)/screens/qr/qrScanner" as const,
      CONFIRMATION: "/(resident)/screens/qr/qrConfirmation" as const,
    },
    INVITE: {
      ENTER_CODE: "/(resident)/screens/invite/enterInviteCodeScreen" as const,
      SUCCESS: "/(resident)/screens/invite/inviteSuccessScreen" as const,
    },
    INFO: {
      WHY_CHOOSE_US: "/(resident)/screens/info/whyChooseUs" as const,
      ONBOARD_SOCIETY: "/(resident)/screens/info/onboardSociety" as const,
    },
    MEMBERSHIP: {
      STATUS: "/(resident)/screens/membership/membershipStatusScreen" as const,
      NO_MEMBERSHIP: "/(resident)/screens/membership/noMembership" as const,
    },
    PEOPLE: {
      MANAGE_FAMILY: "/(resident)/screens/people/manageFamilyScreen" as const,
      MANAGE_TENANTS: "/(resident)/screens/people/manageTenantsScreen" as const,
      MANAGE_STAFF: "/(resident)/screens/people/manageStaffScreen" as const,
      ADD_MEMBER: "/(resident)/screens/people/addMemberScreen" as const,
      ADD_FAMILY_MEMBER: "/(resident)/screens/people/addFamilyMemberScreen" as const,
      FAMILY_MEMBER_DETAILS: "/(resident)/screens/people/familyMemberDetailsScreen" as const,
      TENANT_DETAILS: "/(resident)/screens/people/tenantDetailsScreen" as const,
      STAFF_DETAILS: "/(resident)/screens/people/staffDetailsScreen" as const,
      INVITE_SENT_SUCCESS: "/(resident)/screens/people/inviteSentSuccessScreen" as const,
      EDIT_FAMILY_MEMBER_PERMISSIONS: "/(resident)/screens/people/editFamilyMemberPermissionsScreen" as const,
    },
    VISITORS: {
      INVITE_GUEST: "/(resident)/screens/visitors/inviteGuestScreen" as const,
      MANAGE_VISITORS: "/(resident)/screens/visitors/manageVisitorsScreen" as const,
      VISITOR_HISTORY: "/(resident)/screens/visitors/visitorHistoryScreen" as const,
      VISIT_TIME_PICKER: "/(resident)/screens/visitors/visitTimePickerScreen" as const,
    },
  },
} as const;

export type AppRoute = string;
