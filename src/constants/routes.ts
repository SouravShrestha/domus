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
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES][keyof (typeof ROUTES)[keyof typeof ROUTES]];
