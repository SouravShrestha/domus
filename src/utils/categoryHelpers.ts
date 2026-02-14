import { ImageSourcePropType } from "react-native";
import { ThemeMode } from "@/types/common";
import { StaffCategory } from "@/types/models/staff";
import uberImage from "@assets/images/uber.png";
import uberDarkImage from "@assets/images/uber-dark.png";
import olaImage from "@assets/images/ola.png";
import rapidoImage from "@assets/images/rapido.png";
import otherCabImage from "@assets/images/taxi.png";
import deliveryPlaceholderImage from "@assets/images/0.png";
import {
  InfoIcon,
  HourglassEndIcon,
  HoldingHandKeyIcon,
  EmployeeManAltIcon,
  SmilingBoyIcon,
  BadgeCheckIcon,
  ShieldCheckIcon,
  LockIcon,
  CheckCircleIcon,
  CrossCircleIcon,
  ClockIcon,
  CalendarIcon,
  BellIcon,
  StarIcon,
  HeartIcon,
  TriangleWarningIcon,
  MaidIcon,
  DriverIcon,
  CookIcon,
  SupportIcon,
  NannyIcon,
  MaleManIcon,
  FemaleGirlIcon,
  MaintenanceFilledIcon,
  AdminFilledIcon,
  GuardIcon,
  UsersFilledIcon,
  ExclamationFilledIcon,
  PartyHornIcon,
  AdminAltFilledIcon,
} from "@/components/icons";
import EmergencyFilledIcon from "@/components/icons/EmergencyFilledIcon";

export type IconComponent = React.FC<{ width?: number; height?: number; color?: string }>;

type CategoryIconConfig = Record<string, { icon: IconComponent; color: string }>;

const LIGHT_COLORS = {
  white: "#000000",
  gray: "#757D75",
  gold: "#E2B13C",
  blue: "#4D8FAC",
  lightPink: "#F47983",
  green: "#8DB255",
  red: "#C91F37",
  navyBlue: "#0058da",
  orange: "#F9690E",
  pink: "#F62459",
  skyBlue: "#22A7F0",
  brightGreen: "#26C281",
};

const DARK_COLORS = {
  white: "#ffffff",
  gray: "#9CA3AF",
  gold: "#F5D76E",
  blue: "#5DADE2",
  lightPink: "#F8A5B6",
  green: "#A3D977",
  red: "#E74C3C",
  navyBlue: "#5B9BD5",
  orange: "#FFA07A",
  pink: "#FF6B81",
  skyBlue: "#48C9B0",
  brightGreen: "#2ECC71",
};

const THEME_COLORS = { light: LIGHT_COLORS, dark: DARK_COLORS };

export const createCategoryIconMap = (theme: ThemeMode): CategoryIconConfig => {
  const c = THEME_COLORS[theme];
  return {
    pending: { icon: HourglassEndIcon, color: c.gray },
    owner: { icon: HoldingHandKeyIcon, color: c.gold },
    adult: { icon: EmployeeManAltIcon, color: c.blue },
    kid: { icon: SmilingBoyIcon, color: c.lightPink },
    approved: { icon: BadgeCheckIcon, color: c.green },
    verified: { icon: ShieldCheckIcon, color: c.green },
    locked: { icon: LockIcon, color: c.red },
    success: { icon: CheckCircleIcon, color: c.green },
    error: { icon: CrossCircleIcon, color: c.red },
    warning: { icon: TriangleWarningIcon, color: c.gold },
    time: { icon: ClockIcon, color: c.blue },
    calendar: { icon: CalendarIcon, color: c.blue },
    notification: { icon: BellIcon, color: c.gold },
    starred: { icon: StarIcon, color: c.gold },
    favorite: { icon: HeartIcon, color: c.lightPink },
    info: { icon: InfoIcon, color: c.blue },
    driver: { icon: DriverIcon, color: c.navyBlue },
    maid: { icon: MaidIcon, color: c.orange },
    cook: { icon: CookIcon, color: c.gold },
    support: { icon: SupportIcon, color: c.green },
    nanny: { icon: NannyIcon, color: c.pink },
    male: { icon: MaleManIcon, color: c.skyBlue },
    female: { icon: FemaleGirlIcon, color: c.lightPink },
    maintenance: { icon: MaintenanceFilledIcon, color: c.gold },
    emergency: { icon: EmergencyFilledIcon, color: c.red },
    authority: { icon: AdminFilledIcon, color: c.blue },
    general: { icon: InfoIcon, color: c.brightGreen },
    event: { icon: PartyHornIcon, color: c.orange },
    administrative: { icon: AdminAltFilledIcon, color: c.navyBlue },
    normal: { icon: InfoIcon, color: c.brightGreen },
    important: { icon: ExclamationFilledIcon, color: c.gold },
    urgent: { icon: EmergencyFilledIcon, color: c.red },
    all: { icon: UsersFilledIcon, color: c.brightGreen },
    owners_only: { icon: HoldingHandKeyIcon, color: c.gold },
    security_guards: { icon: GuardIcon, color: c.navyBlue },
  };
};

export const getCategoryColor = (category: StaffCategory | string, theme: ThemeMode): string => {
  const iconMap = createCategoryIconMap(theme);
  const iconConfig = iconMap[category];
  if (iconConfig) return iconConfig.color;

  const c = THEME_COLORS[theme];
  const colors: Record<string, string> = {
    gardener: c.green,
    security: c.gold,
    plumber: c.blue,
    electrician: c.orange,
    uber: c.white,
    ola: c.gold,
    rapido: c.gold,
    other: c.blue,
  };
  return colors[category] || c.gray;
};

export const getCategoryIcon = (category: string, theme: ThemeMode): IconComponent | undefined => {
  return createCategoryIconMap(theme)[category]?.icon;
};

export type CategoryImageConfig = {
  source: ImageSourcePropType;
  imageSize?: number;
};

export const createCategoryImageMap = (theme: ThemeMode): Record<string, CategoryImageConfig> => ({
  uber: { source: theme === "dark" ? uberDarkImage : uberImage, imageSize: theme === "dark" ? 12 : 14 },
  ola: { source: olaImage },
  rapido: { source: rapidoImage, imageSize: theme === "dark" ? 13 : 14 },
  other: { source: otherCabImage },
  swiggy: { source: deliveryPlaceholderImage },
  zomato: { source: deliveryPlaceholderImage },
  amazon: { source: deliveryPlaceholderImage },
  flipkart: { source: deliveryPlaceholderImage },
  bigbasket: { source: deliveryPlaceholderImage },
  blinkit: { source: deliveryPlaceholderImage },
  other_delivery: { source: deliveryPlaceholderImage },
});

export const getCategoryImage = (key: string, theme: ThemeMode): CategoryImageConfig | undefined => {
  return createCategoryImageMap(theme)[key];
};
