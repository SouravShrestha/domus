export interface PushToken {
  id: string;
  user_id: string;
  expo_push_token: string;
  device_id: string | null;
  platform: "ios" | "android" | "web" | null;
  created_at: string;
  updated_at: string;
}

export interface PushTokenCreate {
  user_id: string;
  expo_push_token: string;
  device_id?: string;
  platform?: "ios" | "android" | "web";
}
