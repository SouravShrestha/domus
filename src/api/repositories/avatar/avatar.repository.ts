import { supabase_client } from "../../client";
import { IAvatarRepository } from "@interfaces/avatar.interface";
import { AvatarDto } from "@/types/api/response/avatar";

const AVATARS_BUCKET = "avatars";

export class SupabaseAvatarRepository implements IAvatarRepository {
  async listByGender(gender: string): Promise<AvatarDto[]> {
    const folderPath = gender.toLowerCase();
    const { data: files, error } = await supabase_client.storage
      .from(AVATARS_BUCKET)
      .list(folderPath, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });

    if (error || !files || files.length === 0) {
      if (error) console.error("Error fetching avatars:", error);
      return [];
    }

    return files
      .filter((file) => file.name && !file.name.endsWith("/"))
      .map((file) => {
        const { data: urlData } = supabase_client.storage
          .from(AVATARS_BUCKET)
          .getPublicUrl(`${folderPath}/${file.name}`);

        return {
          id: file.id || file.name,
          url: urlData.publicUrl,
          gender,
          category: folderPath,
          created_at: file.created_at,
        };
      });
  }
}

export const avatarRepository = new SupabaseAvatarRepository();
