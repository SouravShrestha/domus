export interface AvatarDto {
  id: string;
  url: string;
  gender: string;
  category?: string;
  created_at?: string;
}

export interface AvatarsResponse {
  avatars: AvatarDto[];
}
