export enum SocietyContactType {
  Authority = 'authority',
  Emergency = 'emergency',
  Maintenance = 'maintenance',
}

export type SocietyContact = {
  id: string;
  society_id: string;
  name: string;
  phone: string;
  type: SocietyContactType;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const SocietyContactTypeLabels: Record<SocietyContactType, string> = {
  [SocietyContactType.Authority]: 'Authority',
  [SocietyContactType.Emergency]: 'Emergency',
  [SocietyContactType.Maintenance]: 'Maintenance',
};

export const SocietyContactTypeColors: Record<SocietyContactType, string> = {
  [SocietyContactType.Authority]: '#6366f1', // Indigo
  [SocietyContactType.Emergency]: '#ef4444', // Red
  [SocietyContactType.Maintenance]: '#f59e0b', // Amber
};

export const SocietyContactTypeFolders: Record<SocietyContactType, string> = {
  [SocietyContactType.Authority]: 'authority',
  [SocietyContactType.Emergency]: 'emergency',
  [SocietyContactType.Maintenance]: 'maintenance',
};

