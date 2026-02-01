import { supabase_client } from '@/api/client';
import { SocietyContactType, SocietyContactTypeFolders } from '@/types';

const CATEGORY_IMAGES_BUCKET = 'category-images';

export interface CategoryImage {
  id: string;
  url: string;
  name: string;
}

export function getCategoryFolder(type: SocietyContactType): string {
  const folder = SocietyContactTypeFolders[type];
  if (folder) {
    return folder;
  }
  const typeAsString = type as string;
  if (Object.values(SocietyContactType).includes(typeAsString as SocietyContactType)) {
    return typeAsString;
  }
  return 'maintenance';
}

export function getDefaultCategoryImageUrl(type: SocietyContactType): string {
  const folder = getCategoryFolder(type);
  const { data } = supabase_client.storage
    .from(CATEGORY_IMAGES_BUCKET)
    .getPublicUrl(`${folder}/default.png`);
  return data.publicUrl;
}

export async function getCategoryImages(
  type: SocietyContactType
): Promise<CategoryImage[]> {
  const folder = getCategoryFolder(type);

  const { data: files, error } = await supabase_client.storage
    .from(CATEGORY_IMAGES_BUCKET)
    .list(folder, {
      limit: 50,
      sortBy: { column: 'name', order: 'asc' },
    });
  
  console.log("Fetched files:", files, "Error:", error);

  if (error || !files) {
    console.error('Error fetching category images:', error);
    return [];
  }

  return files
    .filter((file) => file.name && !file.name.endsWith('/'))
    .map((file) => {
      const { data } = supabase_client.storage
        .from(CATEGORY_IMAGES_BUCKET)
        .getPublicUrl(`${folder}/${file.name}`);

      return {
        id: file.id || file.name,
        url: data.publicUrl,
        name: file.name.replace(/\.[^/.]+$/, ''),
      };
    });
}
