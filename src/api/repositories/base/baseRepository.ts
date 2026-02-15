import { supabase_client } from '@/api/client';
import { ApiResponse } from '@/api/types/apiResponse';

export abstract class BaseRepository<T extends { id: string }> {
  constructor(protected readonly tableName: string) {}

  async findById(id: string): Promise<ApiResponse<T>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
  }

  async create(
    data: Omit<T, 'id' | 'created_at'>
  ): Promise<ApiResponse<T>> {
    return supabase_client
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single();
  }

  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'created_at'>>
  ): Promise<ApiResponse<T>> {
    return supabase_client
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    return { data: null, error };
  }
}
