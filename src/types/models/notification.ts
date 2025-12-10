export interface Notification {
  id: string;
  user_id: string;
  type: 'walk_in_request' | 'delivery' | 'general' | 'emergency';
  title: string;
  body: string;
  data: NotificationData;
  is_read: boolean;
  created_at: string;
}

export interface NotificationData {
  log_id: string;
  visitor_name: string;
  purpose: string;
}
