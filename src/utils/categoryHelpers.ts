import basicColors from "@/themes/colors";
import { StaffCategory } from "@/types/models/staff";
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
} from "@/components/icons";

export type IconComponent = React.FC<{ width?: number; height?: number; color?: string }>;

export const CATEGORY_ICON_MAP: Record<string, { icon: IconComponent; color: string }> = {
  pending: { icon: HourglassEndIcon, color: basicColors.gray },
  owner: { icon: HoldingHandKeyIcon, color: basicColors.gold },
  adult: { icon: EmployeeManAltIcon, color: basicColors.blue },
  kid: { icon: SmilingBoyIcon, color: basicColors.lightPink },
  approved: { icon: BadgeCheckIcon, color: basicColors.green },
  verified: { icon: ShieldCheckIcon, color: basicColors.green },
  locked: { icon: LockIcon, color: basicColors.red },
  success: { icon: CheckCircleIcon, color: basicColors.green },
  error: { icon: CrossCircleIcon, color: basicColors.red },
  warning: { icon: TriangleWarningIcon, color: basicColors.gold },
  time: { icon: ClockIcon, color: basicColors.blue },
  calendar: { icon: CalendarIcon, color: basicColors.blue },
  notification: { icon: BellIcon, color: basicColors.gold },
  starred: { icon: StarIcon, color: basicColors.gold },
  favorite: { icon: HeartIcon, color: basicColors.lightPink },
  info: { icon: InfoIcon, color: basicColors.blue },
  driver: { icon: DriverIcon, color: basicColors.navyBlue },
  maid: { icon: MaidIcon, color: basicColors.orange },
  cook: { icon: CookIcon, color: basicColors.gold },
  support: { icon: SupportIcon, color: basicColors.green },
  nanny: { icon: NannyIcon, color: basicColors.pink },
  male: { icon: MaleManIcon, color: basicColors.skyBlue },
  female: { icon: FemaleGirlIcon, color: basicColors.lightPink },
};

export const getCategoryColor = (category: StaffCategory | string): string => {
  const iconConfig = CATEGORY_ICON_MAP[category];
  if (iconConfig) {
    return iconConfig.color;
  }
  
  const colors: Record<string, string> = {
    gardener: basicColors.green,
    security: basicColors.gold,
    plumber: basicColors.blue,
    electrician: basicColors.orange,
    other: basicColors.gray,
  };
  return colors[category] || basicColors.gray;
};

export const getCategoryIcon = (category: string): IconComponent | undefined => {
  return CATEGORY_ICON_MAP[category]?.icon;
};
