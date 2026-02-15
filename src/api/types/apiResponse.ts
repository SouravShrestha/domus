import type { PostgrestError } from "@supabase/supabase-js";

export type ApiError = PostgrestError | Error;

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  count: number;
  hasMore: boolean;
}>;
