-- Drop constraints first
ALTER TABLE guest_logs DROP CONSTRAINT visitor_logs_exit_method_check;
ALTER TABLE walk_in_visitor_logs DROP CONSTRAINT walk_in_visitor_logs_exit_method_check;

-- Update existing data
UPDATE guest_logs SET exit_method = 'marked_by_resident' WHERE exit_method = 'marked_by_guard';
UPDATE walk_in_visitor_logs SET exit_method = 'marked_by_resident' WHERE exit_method = 'marked_by_guard';

-- Recreate constraints with new value
ALTER TABLE guest_logs ADD CONSTRAINT visitor_logs_exit_method_check 
  CHECK (exit_method = ANY (ARRAY['qr_scan'::text, 'manual_code'::text, 'auto_timeout'::text, 'marked_by_resident'::text]));

ALTER TABLE walk_in_visitor_logs ADD CONSTRAINT walk_in_visitor_logs_exit_method_check 
  CHECK (exit_method = ANY (ARRAY['manual_code'::text, 'marked_by_resident'::text]));
