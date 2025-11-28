export type NotificationPreferences = {
  id: string;
  user_id: string;
  enable_push_notifications: boolean;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NotificationPreferencesUpdate = {
  enable_push_notifications?: boolean;
  enable_email_notifications?: boolean;
  enable_sms_notifications?: boolean;
};
