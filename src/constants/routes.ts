export const ROUTES = {
  AUTH: {
    WELCOME: "/(auth)/welcome" as const,
    PHONE: "/(auth)/phone" as const,
    VERIFY: "/(auth)/verify" as const,
    REGISTER: "/(auth)/register" as const,
  },

  TABS: {
    HOME: "/(tabs)/home" as const,
  },

  SCREENS: {
    ENTER_INVITE_CODE: "/screens/enterInviteCodeScreen" as const,
    INVITE_DETAILS: "/screens/inviteDetailsScreen" as const,
    INVITE_SUCCESS: "/screens/inviteSuccessScreen" as const,
    MEMBERSHIP_STATUS: "/screens/membershipStatusScreen" as const,
    WHY_CHOOSE_US: "/screens/whyChooseUs" as const,
    ONBOARD_SOCIETY: "/screens/onboardSociety" as const,
    QR_SCANNER: "/screens/qrScanner" as const,
    QR_CONFIRMATION: "/screens/qrConfirmation" as const,
  },
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES][keyof (typeof ROUTES)[keyof typeof ROUTES]];
