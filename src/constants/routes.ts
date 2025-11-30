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
    QR: {
      SCANNER: "/screens/qr/qrScanner" as const,
      CONFIRMATION: "/screens/qr/qrConfirmation" as const,
    },
    INVITE: {
      ENTER_CODE: "/screens/invite/enterInviteCodeScreen" as const,
      SUCCESS: "/screens/invite/inviteSuccessScreen" as const,
    },
    INFO: {
      WHY_CHOOSE_US: "/screens/info/whyChooseUs" as const,
      ONBOARD_SOCIETY: "/screens/info/onboardSociety" as const,
    },
    MEMBERSHIP: {
      STATUS: "/screens/membership/membershipStatusScreen" as const,
      NO_MEMBERSHIP: "/screens/membership/noMembership" as const,
    },
  },
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES][keyof (typeof ROUTES)[keyof typeof ROUTES]];
