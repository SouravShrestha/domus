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
        STATUS:
          "/(resident)/screens/membership/membershipStatusScreen" as const,
        NO_MEMBERSHIP: "/(resident)/screens/membership/noMembership" as const,
      },
      PEOPLE: {
        MANAGE_FAMILY: "/(resident)/screens/people/manageFamilyScreen" as const,
        MANAGE_TENANTS:
          "/(resident)/screens/people/manageTenantsScreen" as const,
        MANAGE_STAFF: "/(resident)/screens/people/manageStaffScreen" as const,
        ADD_MEMBER: "/(resident)/screens/people/addMemberScreen" as const,
        ADD_FAMILY_MEMBER:
          "/(resident)/screens/people/addFamilyMemberScreen" as const,
        FAMILY_MEMBER_DETAILS:
          "/(resident)/screens/people/familyMemberDetailsScreen" as const,
        TENANT_DETAILS:
          "/(resident)/screens/people/tenantDetailsScreen" as const,
        INVITE_SENT_SUCCESS:
          "/(resident)/screens/people/inviteSentSuccessScreen" as const,
        EDIT_FAMILY_MEMBER_PERMISSIONS:
          "/(resident)/screens/people/editFamilyMemberPermissionsScreen" as const,
      },
      STAFFS:{
        INDEX: "/(resident)/screens/services/staffs" as const,
        EDIT_STAFF: "/(resident)/screens/services/staffs/edit" as const,
        CREATE_STAFF: "/(resident)/screens/services/staffs/create" as const,
      },
      NOTICE_BOARD: {
        INDEX: "/(resident)/screens/services/noticeBoard" as const,
      },
      VISITORS: {
        INVITE_GUEST: "/(resident)/screens/visitors/inviteGuestScreen" as const,
        MANAGE_VISITORS:
          "/(resident)/screens/visitors/manageVisitorsScreen" as const,
        VISITOR_HISTORY:
          "/(resident)/screens/visitors/visitorHistoryScreen" as const,
        VISIT_TIME_PICKER:
          "/(resident)/screens/visitors/visitTimePickerScreen" as const,
        APPROVAL_REQUEST:
          "/(resident)/screens/visitors/approvalRequestScreen" as const,
      },
      COMMUNITY: {
        RAISE_COMPLAINT: "/(resident)/screens/community/raiseComplaint" as const,
        CREATE_COMPLAINT: "/(resident)/screens/community/createComplaint" as const,
        MAINTENANCE_UPDATES: "/(resident)/screens/community/maintenanceUpdates" as const,
        SOCIETY_EVENTS: "/(resident)/screens/community/societyEvents" as const,
        BOOK_PARKING: "/(resident)/screens/community/bookParking" as const,
        BOOK_AMENITY: "/(resident)/screens/community/bookAmenity" as const,
        MY_BOOKINGS: "/(resident)/screens/community/myBookings" as const,
        RULES_AND_GUIDELINES: "/(resident)/screens/community/rulesAndGuidelines" as const,
      },
      HELP_SECURITY: {
        SERVICE_REQUESTS: "/(resident)/screens/helpSecurity/serviceRequests" as const,
        SOCIETY_CONTACTS: "/(resident)/screens/services/societyContacts" as const,
      },
      APPROVALS:{
        WALK_IN: "/(resident)/screens/visitors/approvalRequestScreen" as const,
      }
    },
  },

  // Manager routes
  MANAGER: {
    HOME: "/(manager)/(tabs)/dashboard" as const,
    DASHBOARD: "/(manager)/(tabs)/dashboard" as const,
    RESIDENTS: "/(manager)/(tabs)/residents" as const,
    SERVICES: "/(manager)/(tabs)/services" as const,
    SETTINGS: "/(manager)/(tabs)/settings" as const,
    SCREENS: {
      PROFILE: "/(manager)/screens/profile/profileScreen" as const,
      NOTIFICATIONS: "/(manager)/screens/notifications" as const,
      SERVICES: {
        NOTICE_BOARD: "/(manager)/screens/services/noticeBoard" as const,
        MAINTENANCE_UPDATES: "/(manager)/screens/services/maintenanceUpdates" as const,
        SOCIETY_EVENTS: "/(manager)/screens/services/societyEvents" as const,
        RULES_AND_GUIDELINES: "/(manager)/screens/services/rulesAndGuidelines" as const,
        MANAGE_PARKING: "/(manager)/screens/services/manageParking" as const,
        MANAGE_AMENITY: "/(manager)/screens/services/manageAmenity" as const,
        SERVICE_REQUESTS: "/(manager)/screens/services/serviceRequests" as const,
        SOCIETY_CONTACTS: {
          INDEX: "/(manager)/screens/services/societyContacts" as const,
          EDIT_CONTACT: "/(manager)/screens/services/societyContacts/editContactScreen" as const,
        },
        GUARDS: {
          INDEX: "/(manager)/screens/services/guards" as const,
          INVITE_GUARD: "/(manager)/screens/services/guards/inviteGuardScreen" as const,
          GUARD_DETAILS: "/(manager)/screens/services/guards/guardDetailsScreen" as const,
          INVITE_SUCCESS: "/(manager)/screens/services/guards/inviteSuccessScreen" as const,
          MANAGE_TIMINGS: "/(manager)/screens/services/guards/manageTimingsScreen" as const,
          EDIT_SHIFT: "/(manager)/screens/services/guards/editShiftScreen" as const,
          ASSIGN_DUTY: "/(manager)/screens/services/guards/assignDutyScreen" as const,
          EDIT_DUTY: "/(manager)/screens/services/guards/editDutyScreen" as const,
        },
      },
      RESIDENCES: {
        ADD_OWNER: "/(manager)/screens/residences/addOwnerScreen" as const,
        OWNER_DETAILS: "/(manager)/screens/residences/ownerDetailsScreen" as const,
        INVITE_SUCCESS: "/(manager)/screens/residences/inviteSuccessScreen" as const,
        MANAGE_OWNERS: "/(manager)/screens/residences/manageOwnersScreen" as const,
      },
    },
  },

  // Guard routes
  GUARD: {
    HOME: "/(guard)/(tabs)/home" as const,
    SCREENS: {
      PROFILE: "/(guard)/screens/profile/profileScreen" as const,
    },
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
      ADD_FAMILY_MEMBER:
        "/(resident)/screens/people/addFamilyMemberScreen" as const,
      FAMILY_MEMBER_DETAILS:
        "/(resident)/screens/people/familyMemberDetailsScreen" as const,
      TENANT_DETAILS: "/(resident)/screens/people/tenantDetailsScreen" as const,
      STAFF_DETAILS: "/(resident)/screens/people/staffDetailsScreen" as const,
      INVITE_SENT_SUCCESS:
        "/(resident)/screens/people/inviteSentSuccessScreen" as const,
      EDIT_FAMILY_MEMBER_PERMISSIONS:
        "/(resident)/screens/people/editFamilyMemberPermissionsScreen" as const,
    },
    VISITORS: {
      INVITE_GUEST: "/(resident)/screens/visitors/inviteGuestScreen" as const,
      MANAGE_VISITORS:
        "/(resident)/screens/visitors/manageVisitorsScreen" as const,
      VISITOR_HISTORY:
        "/(resident)/screens/visitors/visitorHistoryScreen" as const,
      VISIT_TIME_PICKER:
        "/(resident)/screens/visitors/visitTimePickerScreen" as const,
    },
    COMMUNITY: {
      RAISE_COMPLAINT: "/(resident)/screens/community/raiseComplaint" as const,
      CREATE_COMPLAINT: "/(resident)/screens/community/createComplaint" as const,
      NOTICE_BOARD: "/(resident)/screens/services/noticeBoard" as const,
      MAINTENANCE_UPDATES: "/(resident)/screens/community/maintenanceUpdates" as const,
      SOCIETY_EVENTS: "/(resident)/screens/community/societyEvents" as const,
      BOOK_PARKING: "/(resident)/screens/community/bookParking" as const,
      BOOK_AMENITY: "/(resident)/screens/community/bookAmenity" as const,
      MY_BOOKINGS: "/(resident)/screens/community/myBookings" as const,
      RULES_AND_GUIDELINES: "/(resident)/screens/community/rulesAndGuidelines" as const,
    },
    HELP_SECURITY: {
      SERVICE_REQUESTS: "/(resident)/screens/helpSecurity/serviceRequests" as const,
      SOCIETY_CONTACTS: "/(resident)/screens/services/societyContacts" as const,
    },
  },
} as const;

export type AppRoute = string;
