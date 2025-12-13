export interface MaintenanceUpdate {
  id: string;
  society_id: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  status?: string;
  created_at: string;
}
