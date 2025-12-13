import { supabase_client } from "@/api/client";
import { MaintenanceUpdate } from "@/api/interfaces/maintenance.interface";

export class MaintenanceRepository {
  private readonly tableName = "maintenance_updates";

  async findBySocietyId(societyId: string): Promise<{ data: MaintenanceUpdate[] | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("society_id", societyId)
      .order("created_at", { ascending: false });

    return { data, error };
  }
}

export const maintenanceRepository = new MaintenanceRepository();
