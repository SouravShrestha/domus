import { supabase_client } from "../client";
import { AvatarDto, AvatarsResponse } from "@/types/api/response/avatar";
import { IAvatarService } from "@interfaces/avatar.interface";

const AVATARS_BUCKET = "avatars";

export class AvatarService implements IAvatarService {
  async getAvatarsByGender(gender: string): Promise<AvatarsResponse> {
    try {
      const folderPath = gender.toLowerCase();
      const { data: files, error } = await supabase_client.storage
        .from(AVATARS_BUCKET)
        .list(folderPath, {
          limit: 100,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Error fetching avatars:", error);
        return { avatars: [] };
      }

      if (!files || files.length === 0) {
        return { avatars: [] };
      }

      const avatars: AvatarDto[] = files
        .filter((file) => file.name && !file.name.endsWith("/"))
        .map((file) => {
          const { data: urlData } = supabase_client.storage
            .from(AVATARS_BUCKET)
            .getPublicUrl(`${folderPath}/${file.name}`);

          return {
            id: file.id || file.name,
            url: urlData.publicUrl,
            gender: gender,
            category: folderPath,
            created_at: file.created_at,
          };
        });

      return { avatars };
    } catch (error) {
      console.error("Error in getAvatarsByGender:", error);
      return { avatars: [] };
    }
  }

  async getAllAvatars(): Promise<AvatarsResponse> {
    try {
      const genders = ["male", "female"];
      const allAvatars: AvatarDto[] = [];

      for (const gender of genders) {
        const response = await this.getAvatarsByGender(gender);
        allAvatars.push(...response.avatars);
      }

      return { avatars: allAvatars };
    } catch (error) {
      console.error("Error in getAllAvatars:", error);
      return { avatars: [] };
    }
  }
}

export const avatarService = new AvatarService();
