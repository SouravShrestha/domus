


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_guard_assignment_conflict"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if guard already has an active assignment for same shift and any overlapping day
  IF EXISTS (
    SELECT 1 
    FROM guard_gate_assignments gga
    WHERE gga.guard_id = NEW.guard_id
    AND gga.shift_id = NEW.shift_id
    AND gga.is_active = true
    AND gga.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (gga.effective_until IS NULL OR gga.effective_until >= CURRENT_DATE)
    AND (NEW.effective_until IS NULL OR NEW.effective_until >= CURRENT_DATE)
    AND gga.days_of_week && NEW.days_of_week  -- Array overlap operator
  ) THEN
    RAISE EXCEPTION 'Guard already has an assignment for this shift on one or more of these days';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_guard_assignment_conflict"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_phone_not_in_other_invite_table"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_TABLE_NAME = 'society_guard_invites' THEN
    IF EXISTS (SELECT 1 FROM society_manager_invites WHERE phone = NEW.phone AND status = 'pending') THEN
      RAISE EXCEPTION 'Phone number already exists in manager invites';
    END IF;
  ELSIF TG_TABLE_NAME = 'society_manager_invites' THEN
    IF EXISTS (SELECT 1 FROM society_guard_invites WHERE phone = NEW.phone AND status = 'pending') THEN
      RAISE EXCEPTION 'Phone number already exists in guard invites';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_phone_not_in_other_invite_table"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_member_permissions"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    default_invite_visitors BOOLEAN;
    default_approve_delivery BOOLEAN;
    default_exit_society BOOLEAN;
    default_manage_staff BOOLEAN;
BEGIN
    -- Set defaults based on role
    IF NEW.role = 'owner' THEN
        default_invite_visitors := true;
        default_approve_delivery := true;
        default_exit_society := true;
        default_manage_staff := true;
    ELSIF NEW.role = 'adult' THEN
        default_invite_visitors := true;
        default_approve_delivery := true;
        default_exit_society := true;
        default_manage_staff := false;
    ELSIF NEW.role = 'child' THEN
        default_invite_visitors := false;
        default_approve_delivery := false;
        default_exit_society := false;
        default_manage_staff := false;
    ELSE
        -- Default for other roles (tenant, staff, etc.)
        default_invite_visitors := true;
        default_approve_delivery := true;
        default_exit_society := true;
        default_manage_staff := false;
    END IF;

    INSERT INTO member_permissions (
        membership_id,
        residence_id,
        user_id,
        can_invite_visitors,
        can_approve_delivery,
        can_exit_society,
        can_manage_staff
    ) VALUES (
        NEW.id,
        NEW.residence_id,
        NEW.user_id,
        default_invite_visitors,
        default_approve_delivery,
        default_exit_society,
        default_manage_staff
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_member_permissions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_notification_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_notification_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_default_permissions_for_role"("role_name" "text") RETURNS TABLE("can_invite_visitors" boolean, "can_approve_delivery" boolean, "can_exit_society" boolean, "can_view_activity_log" boolean, "can_manage_staff" boolean, "can_book_amenities" boolean, "can_raise_complaints" boolean, "can_view_notices" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF role_name = 'owner' THEN
        RETURN QUERY SELECT true, true, true, true, true, true, true, true;
    ELSIF role_name = 'adult' THEN
        RETURN QUERY SELECT true, true, true, true, false, true, true, true;
    ELSIF role_name = 'child' THEN
        RETURN QUERY SELECT false, false, false, false, false, true, false, true;
    ELSE
        RETURN QUERY SELECT true, true, true, true, false, true, true, true;
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_default_permissions_for_role"("role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_domus_admins_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_domus_admins_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_guard_gate_assignments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_guard_gate_assignments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notices_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notices_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_notices_updated_at"() IS 'Automatically updates the updated_at timestamp when a notice is modified';



CREATE OR REPLACE FUNCTION "public"."update_notification_preferences_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notification_preferences_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_staff_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_staff_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_push_tokens_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_push_tokens_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "residence_id" "uuid",
    "actor_user_id" "uuid",
    "action_type" "text" NOT NULL,
    "target_identifier" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complaint_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "complaint_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vote_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "complaint_votes_vote_type_check" CHECK (("vote_type" = ANY (ARRAY['upvote'::"text", 'downvote'::"text"])))
);


ALTER TABLE "public"."complaint_votes" OWNER TO "postgres";


COMMENT ON TABLE "public"."complaint_votes" IS 'Stores upvotes and downvotes for complaints';



CREATE TABLE IF NOT EXISTS "public"."complaints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "society_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "level" "text" DEFAULT 'resident'::"text" NOT NULL,
    "residence_id" "uuid",
    "raised_by_name" "text",
    CONSTRAINT "complaints_level_check" CHECK (("level" = ANY (ARRAY['resident'::"text", 'society'::"text"]))),
    CONSTRAINT "complaints_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."complaints" OWNER TO "postgres";


COMMENT ON COLUMN "public"."complaints"."level" IS 'Complaint visibility level: resident (private) or society (public to all society members)';



CREATE TABLE IF NOT EXISTS "public"."domus_admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "username" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "email" "text",
    "name" "text",
    "role" "text" DEFAULT 'admin'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "domus_admins_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'superadmin'::"text"]))),
    CONSTRAINT "domus_admins_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."domus_admins" OWNER TO "postgres";


COMMENT ON TABLE "public"."domus_admins" IS 'Platform superadmins who manage the entire Domus application';



COMMENT ON COLUMN "public"."domus_admins"."password_hash" IS 'Hashed password using bcrypt or similar - never store plain text';



CREATE TABLE IF NOT EXISTS "public"."gates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guard_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "shift_start" time without time zone NOT NULL,
    "shift_end" time without time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "guard_profile_id" "uuid" NOT NULL,
    "gate_ids" "uuid"[] NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "allow_anytime_access" boolean DEFAULT false NOT NULL,
    "shift_id" "uuid",
    CONSTRAINT "guard_assignments_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."guard_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guard_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "phone" "text" NOT NULL,
    "name" "text",
    "role" "text",
    "added_by" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "invite_code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "accepted_user_id" "uuid",
    "accepted_at" timestamp with time zone,
    CONSTRAINT "guard_invites_role_check" CHECK (("role" = ANY (ARRAY['gate'::"text", 'patrol'::"text", 'supervisor'::"text"]))),
    CONSTRAINT "guard_invites_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."guard_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guard_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "society_id" "uuid" NOT NULL,
    "invite_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role" "text" DEFAULT 'gate'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    CONSTRAINT "guard_profiles_role_check" CHECK (("role" = ANY (ARRAY['gate'::"text", 'patrol'::"text", 'supervisor'::"text"]))),
    CONSTRAINT "guard_profiles_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'disabled'::"text"])))
);


ALTER TABLE "public"."guard_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guest_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "invited_by_user_id" "uuid" NOT NULL,
    "visitor_name" "text" NOT NULL,
    "visitor_phone" "text" NOT NULL,
    "purpose" "text",
    "pass_code" "text" NOT NULL,
    "valid_from" timestamp with time zone NOT NULL,
    "valid_until" timestamp with time zone NOT NULL,
    "visits_allowed" integer DEFAULT 1 NOT NULL,
    "visits_used" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "vehicle_number" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_date_range" CHECK (("valid_until" > "valid_from")),
    CONSTRAINT "visitor_invitations_pass_code_check" CHECK (("char_length"("pass_code") = 8)),
    CONSTRAINT "visitor_invitations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'used'::"text", 'expired'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "visitor_invitations_visits_allowed_check" CHECK (("visits_allowed" >= 1)),
    CONSTRAINT "visitor_invitations_visits_used_check" CHECK (("visits_used" >= 0)),
    CONSTRAINT "visits_not_exceeded" CHECK (("visits_used" <= "visits_allowed"))
);


ALTER TABLE "public"."guest_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guest_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guest_invitation_id" "uuid" NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "entry_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "exit_time" timestamp with time zone,
    "entry_method" "text" DEFAULT 'qr_scan'::"text" NOT NULL,
    "exit_method" "text",
    "guard_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "entry_gate" "uuid",
    "exit_gate" "uuid",
    CONSTRAINT "visitor_logs_entry_method_check" CHECK (("entry_method" = ANY (ARRAY['qr_scan'::"text", 'manual_code'::"text", 'approved_by_guard'::"text"]))),
    CONSTRAINT "visitor_logs_exit_method_check" CHECK (("exit_method" = ANY (ARRAY['qr_scan'::"text", 'manual_code'::"text", 'auto_timeout'::"text", 'marked_by_guard'::"text"])))
);


ALTER TABLE "public"."guest_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "scheduled_date" timestamp with time zone,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."maintenance_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."manager_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "society_id" "uuid" NOT NULL,
    "invite_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."manager_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "membership_id" "uuid" NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "can_invite_visitors" boolean DEFAULT true NOT NULL,
    "can_approve_delivery" boolean DEFAULT true NOT NULL,
    "can_exit_society" boolean DEFAULT true NOT NULL,
    "can_manage_staff" boolean DEFAULT false NOT NULL,
    "can_book_amenities" boolean DEFAULT true NOT NULL,
    "can_raise_complaints" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."member_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."membership_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pending_membership_id" "uuid",
    "status" "text" NOT NULL,
    "changed_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "residence_id" "uuid",
    CONSTRAINT "pending_membership_status_history_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."membership_status_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."membership_status_history" IS 'Tracks the history of status changes for pending residence memberships';



CREATE TABLE IF NOT EXISTS "public"."notices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category" "text" DEFAULT 'general'::"text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "audience" "jsonb" DEFAULT '{"visibility": "all"}'::"jsonb",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notices_category_check" CHECK (("category" = ANY (ARRAY['general'::"text", 'maintenance'::"text", 'event'::"text", 'emergency'::"text", 'administrative'::"text"]))),
    CONSTRAINT "notices_priority_check" CHECK (("priority" = ANY (ARRAY['normal'::"text", 'important'::"text", 'urgent'::"text"]))),
    CONSTRAINT "notices_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."notices" OWNER TO "postgres";


COMMENT ON COLUMN "public"."notices"."audience" IS 'JSONB field containing visibility settings, e.g., {"visibility": "all"} or {"visibility": "owners_only"}';



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['walk_in_request'::"text", 'delivery'::"text", 'general'::"text", 'emergency'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_residence_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "invitation_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    CONSTRAINT "pending_residence_memberships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."pending_residence_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rejected_residence_membership_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "invitation_id" "uuid",
    "rejected_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_phone_number" "text" NOT NULL
);


ALTER TABLE "public"."rejected_residence_membership_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."residence_membership_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'invited'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "auto_approve" boolean DEFAULT false NOT NULL,
    "invite_code" "text" NOT NULL,
    "user_phone_number" "text" NOT NULL,
    "invited_by_user" "uuid",
    "invitee_name" "text",
    CONSTRAINT "residence_membership_invitations_invite_code_length" CHECK (("char_length"("invite_code") = 6)),
    CONSTRAINT "residence_membership_invitations_status_check" CHECK (("status" = ANY (ARRAY['invited'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."residence_membership_invitations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."residence_membership_invitations"."invited_by_user" IS 'User ID of the person who created this invitation';



CREATE TABLE IF NOT EXISTS "public"."residences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "flat_number" "text" NOT NULL,
    "block" "text",
    "floor_number" integer,
    "short_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."residences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resident_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "society_id" "uuid" NOT NULL
);


ALTER TABLE "public"."resident_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."societies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "address" "jsonb" NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."societies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."society_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "phone" character varying(20) NOT NULL,
    "type" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    CONSTRAINT "society_contacts_type_check" CHECK (("type" = ANY (ARRAY['authority'::"text", 'emergency'::"text", 'maintenance'::"text"])))
);


ALTER TABLE "public"."society_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."society_gates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."society_gates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."society_manager_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "phone" "text" NOT NULL,
    "name" "text",
    "role" "text" DEFAULT 'manager'::"text",
    "added_by" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "society_manager_invites_role_check" CHECK (("role" = ANY (ARRAY['manager'::"text", 'admin'::"text"]))),
    CONSTRAINT "society_manager_invites_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text"])))
);


ALTER TABLE "public"."society_manager_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."society_shifts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "society_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."society_shifts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "category" "text" NOT NULL,
    "photo_url" "text",
    "vehicle_number" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gender" character varying(10) NOT NULL,
    "helper_code" character varying(6) NOT NULL,
    "residence_id" "uuid",
    "is_access_disabled" boolean DEFAULT false,
    CONSTRAINT "staff_category_check" CHECK (("category" = ANY (ARRAY['maid'::"text", 'cook'::"text", 'driver'::"text", 'nanny'::"text", 'support'::"text"]))),
    CONSTRAINT "staff_gender_check" CHECK ((("gender")::"text" = ANY ((ARRAY['male'::character varying, 'female'::character varying])::"text"[])))
);


ALTER TABLE "public"."staff" OWNER TO "postgres";


COMMENT ON COLUMN "public"."staff"."category" IS 'Staff category: maid, cook, driver, nanny, or support (other)';



COMMENT ON COLUMN "public"."staff"."gender" IS 'Gender of the staff member (male or female)';



CREATE TABLE IF NOT EXISTS "public"."staff_assignment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "staff_id" "uuid" NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "assigned_by" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "staff_assignment_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'removed'::"text"])))
);


ALTER TABLE "public"."staff_assignment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff_schedule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "staff_assignment_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "staff_schedule_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."staff_schedule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "enable_push_notifications" boolean DEFAULT true NOT NULL,
    "enable_email_notifications" boolean DEFAULT true NOT NULL,
    "enable_sms_notifications" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_notification_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_notification_preferences" IS 'Stores user notification preferences for push, email, and SMS notifications';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "public"."citext",
    "gender" "text",
    "onboarded_basic" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "phone" "text" NOT NULL,
    "photo_url" "text",
    CONSTRAINT "user_profiles_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_push_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "expo_push_token" "text" NOT NULL,
    "device_id" "text",
    "platform" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_push_tokens_platform_check" CHECK (("platform" = ANY (ARRAY['ios'::"text", 'android'::"text", 'web'::"text"])))
);


ALTER TABLE "public"."user_push_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."walk_in_visitor_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "residence_id" "uuid" NOT NULL,
    "visitor_name" "text" NOT NULL,
    "visitor_phone" "text",
    "purpose" "text",
    "vehicle_number" "text",
    "entry_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "exit_time" timestamp with time zone,
    "entry_method" "text" DEFAULT 'approved_by_guard'::"text" NOT NULL,
    "exit_method" "text",
    "entry_gate" "uuid",
    "exit_gate" "uuid",
    "recorded_by_guard_id" "uuid" NOT NULL,
    "approval_status" "text" DEFAULT 'not_required'::"text" NOT NULL,
    "approved_by_resident_user_id" "uuid",
    "guard_notes" "text",
    "temp_pass_code" "text",
    "temp_pass_valid_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "walk_in_visitor_logs_approval_status_check" CHECK (("approval_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'not_required'::"text"]))),
    CONSTRAINT "walk_in_visitor_logs_entry_method_check" CHECK ((("entry_method" IS NULL) OR ("entry_method" = ANY (ARRAY['approved_by_guard'::"text", 'approved_by_owner'::"text"])))),
    CONSTRAINT "walk_in_visitor_logs_exit_method_check" CHECK (("exit_method" = ANY (ARRAY['manual_code'::"text", 'marked_by_guard'::"text"]))),
    CONSTRAINT "walk_in_visitor_logs_temp_pass_code_check" CHECK (("char_length"("temp_pass_code") = 8))
);


ALTER TABLE "public"."walk_in_visitor_logs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resident_profiles"
    ADD CONSTRAINT "approved_residence_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resident_profiles"
    ADD CONSTRAINT "approved_residence_memberships_user_id_residence_id_key" UNIQUE ("user_id", "residence_id");



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_complaint_id_user_id_key" UNIQUE ("complaint_id", "user_id");



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."domus_admins"
    ADD CONSTRAINT "domus_admins_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."domus_admins"
    ADD CONSTRAINT "domus_admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."domus_admins"
    ADD CONSTRAINT "domus_admins_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."gates"
    ADD CONSTRAINT "gates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guard_assignments"
    ADD CONSTRAINT "guard_assignments_guard_profile_gate_unique" UNIQUE ("guard_profile_id", "society_id", "gate_ids");



ALTER TABLE ONLY "public"."guard_assignments"
    ADD CONSTRAINT "guard_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guard_invites"
    ADD CONSTRAINT "guard_invites_invite_code_key" UNIQUE ("invite_code");



ALTER TABLE ONLY "public"."guard_invites"
    ADD CONSTRAINT "guard_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guard_profiles"
    ADD CONSTRAINT "guard_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guard_profiles"
    ADD CONSTRAINT "guard_profiles_user_id_society_id_key" UNIQUE ("user_id", "society_id");



ALTER TABLE ONLY "public"."maintenance_updates"
    ADD CONSTRAINT "maintenance_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "member_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."membership_status_history"
    ADD CONSTRAINT "pending_membership_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_residence_memberships"
    ADD CONSTRAINT "pending_residence_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_residence_memberships"
    ADD CONSTRAINT "pending_residence_memberships_user_id_residence_id_key" UNIQUE ("user_id", "residence_id");



ALTER TABLE ONLY "public"."rejected_residence_membership_invitations"
    ADD CONSTRAINT "rejected_residence_membership_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."residence_membership_invitations"
    ADD CONSTRAINT "residence_membership_invitations_invite_code_unique" UNIQUE ("invite_code");



ALTER TABLE ONLY "public"."residence_membership_invitations"
    ADD CONSTRAINT "residence_membership_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."residences"
    ADD CONSTRAINT "residences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."residences"
    ADD CONSTRAINT "residences_society_id_flat_number_block_key" UNIQUE ("society_id", "flat_number", "block");



ALTER TABLE ONLY "public"."societies"
    ADD CONSTRAINT "societies_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."societies"
    ADD CONSTRAINT "societies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."society_contacts"
    ADD CONSTRAINT "society_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."society_gates"
    ADD CONSTRAINT "society_gates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."society_manager_invites"
    ADD CONSTRAINT "society_manager_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."manager_profiles"
    ADD CONSTRAINT "society_managers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."society_shifts"
    ADD CONSTRAINT "society_shifts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_assignment"
    ADD CONSTRAINT "staff_assignment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_assignment"
    ADD CONSTRAINT "staff_assignment_staff_id_residence_id_key" UNIQUE ("staff_id", "residence_id");



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "staff_helper_code_key" UNIQUE ("helper_code");



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "staff_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_schedule"
    ADD CONSTRAINT "staff_schedule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_schedule"
    ADD CONSTRAINT "staff_schedule_staff_assignment_id_day_of_week_key" UNIQUE ("staff_assignment_id", "day_of_week");



ALTER TABLE ONLY "public"."manager_profiles"
    ADD CONSTRAINT "unique_manager_assignment" UNIQUE ("user_id", "society_id");



ALTER TABLE ONLY "public"."society_manager_invites"
    ADD CONSTRAINT "unique_manager_invite_phone" UNIQUE ("phone");



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "unique_membership_permissions" UNIQUE ("membership_id");



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_push_tokens"
    ADD CONSTRAINT "user_push_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_push_tokens"
    ADD CONSTRAINT "user_push_tokens_user_id_expo_push_token_key" UNIQUE ("user_id", "expo_push_token");



ALTER TABLE ONLY "public"."guest_invitations"
    ADD CONSTRAINT "visitor_invitations_pass_code_key" UNIQUE ("pass_code");



ALTER TABLE ONLY "public"."guest_invitations"
    ADD CONSTRAINT "visitor_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guest_logs"
    ADD CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walk_in_visitor_logs"
    ADD CONSTRAINT "walk_in_visitor_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."walk_in_visitor_logs"
    ADD CONSTRAINT "walk_in_visitor_logs_temp_pass_code_key" UNIQUE ("temp_pass_code");



CREATE INDEX "idx_approved_residence_memberships_residence_id" ON "public"."resident_profiles" USING "btree" ("residence_id");



CREATE INDEX "idx_approved_residence_memberships_user_id" ON "public"."resident_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_complaint_votes_complaint_id" ON "public"."complaint_votes" USING "btree" ("complaint_id");



CREATE INDEX "idx_complaint_votes_user_id" ON "public"."complaint_votes" USING "btree" ("user_id");



CREATE INDEX "idx_domus_admins_username" ON "public"."domus_admins" USING "btree" ("username");



CREATE INDEX "idx_guard_assignments_society" ON "public"."guard_assignments" USING "btree" ("society_id");



CREATE INDEX "idx_guard_invites_invite_code" ON "public"."guard_invites" USING "btree" ("invite_code");



CREATE INDEX "idx_guard_invites_phone" ON "public"."guard_invites" USING "btree" ("phone");



CREATE INDEX "idx_guard_invites_society" ON "public"."guard_invites" USING "btree" ("society_id");



CREATE INDEX "idx_guard_invites_status" ON "public"."guard_invites" USING "btree" ("status");



CREATE INDEX "idx_guard_profiles_society" ON "public"."guard_profiles" USING "btree" ("society_id");



CREATE INDEX "idx_guard_profiles_user" ON "public"."guard_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_guest_invitations_invited_by" ON "public"."guest_invitations" USING "btree" ("invited_by_user_id");



CREATE INDEX "idx_guest_invitations_pass_code" ON "public"."guest_invitations" USING "btree" ("pass_code");



CREATE INDEX "idx_guest_invitations_residence" ON "public"."guest_invitations" USING "btree" ("residence_id");



CREATE INDEX "idx_guest_invitations_status" ON "public"."guest_invitations" USING "btree" ("status");



CREATE INDEX "idx_guest_invitations_valid_until" ON "public"."guest_invitations" USING "btree" ("valid_until");



CREATE INDEX "idx_guest_logs_entry_gate" ON "public"."guest_logs" USING "btree" ("entry_gate");



CREATE INDEX "idx_guest_logs_entry_time" ON "public"."guest_logs" USING "btree" ("entry_time");



CREATE INDEX "idx_guest_logs_exit_gate" ON "public"."guest_logs" USING "btree" ("exit_gate");



CREATE INDEX "idx_guest_logs_invitation" ON "public"."guest_logs" USING "btree" ("guest_invitation_id");



CREATE INDEX "idx_guest_logs_residence" ON "public"."guest_logs" USING "btree" ("residence_id");



CREATE INDEX "idx_manager_invites_phone" ON "public"."society_manager_invites" USING "btree" ("phone");



CREATE INDEX "idx_manager_invites_society" ON "public"."society_manager_invites" USING "btree" ("society_id");



CREATE INDEX "idx_member_permissions_membership" ON "public"."member_permissions" USING "btree" ("membership_id");



CREATE INDEX "idx_member_permissions_user_residence" ON "public"."member_permissions" USING "btree" ("user_id", "residence_id");



CREATE INDEX "idx_notices_category" ON "public"."notices" USING "btree" ("category");



CREATE INDEX "idx_notices_created_at" ON "public"."notices" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notices_society_id" ON "public"."notices" USING "btree" ("society_id");



CREATE INDEX "idx_notices_status" ON "public"."notices" USING "btree" ("status");



CREATE INDEX "idx_pending_membership_status_history_created_at" ON "public"."membership_status_history" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_pending_membership_status_history_membership_id" ON "public"."membership_status_history" USING "btree" ("pending_membership_id");



CREATE INDEX "idx_pending_residence_memberships_invitation_id" ON "public"."pending_residence_memberships" USING "btree" ("invitation_id");



CREATE INDEX "idx_pending_residence_memberships_residence_id" ON "public"."pending_residence_memberships" USING "btree" ("residence_id");



CREATE INDEX "idx_pending_residence_memberships_status" ON "public"."pending_residence_memberships" USING "btree" ("status");



CREATE INDEX "idx_pending_residence_memberships_user_id" ON "public"."pending_residence_memberships" USING "btree" ("user_id");



CREATE INDEX "idx_rejected_invitations_invitation_id" ON "public"."rejected_residence_membership_invitations" USING "btree" ("invitation_id");



CREATE INDEX "idx_rejected_invitations_residence_id" ON "public"."rejected_residence_membership_invitations" USING "btree" ("residence_id");



CREATE INDEX "idx_residence_membership_invitations_invited_by_user" ON "public"."residence_membership_invitations" USING "btree" ("invited_by_user");



CREATE INDEX "idx_residence_membership_invitations_residence_id" ON "public"."residence_membership_invitations" USING "btree" ("residence_id");



CREATE INDEX "idx_residence_membership_invitations_status" ON "public"."residence_membership_invitations" USING "btree" ("status");



CREATE INDEX "idx_residences_short_name" ON "public"."residences" USING "btree" ("short_name");



CREATE INDEX "idx_residences_society_id" ON "public"."residences" USING "btree" ("society_id");



CREATE INDEX "idx_societies_code" ON "public"."societies" USING "btree" ("code");



CREATE INDEX "idx_society_contacts_society_id" ON "public"."society_contacts" USING "btree" ("society_id");



CREATE INDEX "idx_society_contacts_type" ON "public"."society_contacts" USING "btree" ("type");



CREATE INDEX "idx_society_gates_society_id" ON "public"."society_gates" USING "btree" ("society_id");



CREATE INDEX "idx_society_managers_society" ON "public"."manager_profiles" USING "btree" ("society_id");



CREATE INDEX "idx_society_managers_user" ON "public"."manager_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_society_shifts_society_id" ON "public"."society_shifts" USING "btree" ("society_id");



CREATE INDEX "idx_staff_assignment_residence_id" ON "public"."staff_assignment" USING "btree" ("residence_id");



CREATE INDEX "idx_staff_assignment_staff_id" ON "public"."staff_assignment" USING "btree" ("staff_id");



CREATE INDEX "idx_staff_assignment_status" ON "public"."staff_assignment" USING "btree" ("status");



CREATE INDEX "idx_staff_created_by" ON "public"."staff" USING "btree" ("created_by");



CREATE INDEX "idx_staff_helper_code" ON "public"."staff" USING "btree" ("helper_code");



CREATE INDEX "idx_staff_phone" ON "public"."staff" USING "btree" ("phone");



CREATE INDEX "idx_staff_residence_id" ON "public"."staff" USING "btree" ("residence_id");



CREATE INDEX "idx_staff_schedule_assignment_id" ON "public"."staff_schedule" USING "btree" ("staff_assignment_id");



CREATE INDEX "idx_staff_schedule_day" ON "public"."staff_schedule" USING "btree" ("day_of_week");



CREATE INDEX "idx_user_notification_preferences_user_id" ON "public"."user_notification_preferences" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_user_profiles_email_unique" ON "public"."user_profiles" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "idx_user_push_tokens_user_id" ON "public"."user_push_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_walk_in_logs_approval_status" ON "public"."walk_in_visitor_logs" USING "btree" ("approval_status");



CREATE INDEX "idx_walk_in_logs_entry_time" ON "public"."walk_in_visitor_logs" USING "btree" ("entry_time");



CREATE INDEX "idx_walk_in_logs_recorded_by_guard" ON "public"."walk_in_visitor_logs" USING "btree" ("recorded_by_guard_id");



CREATE INDEX "idx_walk_in_logs_residence_id" ON "public"."walk_in_visitor_logs" USING "btree" ("residence_id");



CREATE INDEX "idx_walk_in_logs_temp_pass_code" ON "public"."walk_in_visitor_logs" USING "btree" ("temp_pass_code");



CREATE OR REPLACE TRIGGER "prevent_guard_manager_conflict_on_manager" BEFORE INSERT ON "public"."society_manager_invites" FOR EACH ROW EXECUTE FUNCTION "public"."check_phone_not_in_other_invite_table"();



-- NOTE: This trigger is environment-specific and must be set up separately per environment
-- It requires Edge Functions to be deployed first (creates supabase_functions schema)
-- CREATE OR REPLACE TRIGGER "push-notification-on-insert" AFTER INSERT ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://<PROJECT_REF>.supabase.co/functions/v1/send-push-notification', 'POST', '{"Content-type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "staff_assignment_updated_at" BEFORE UPDATE ON "public"."staff_assignment" FOR EACH ROW EXECUTE FUNCTION "public"."update_staff_updated_at"();



CREATE OR REPLACE TRIGGER "staff_schedule_updated_at" BEFORE UPDATE ON "public"."staff_schedule" FOR EACH ROW EXECUTE FUNCTION "public"."update_staff_updated_at"();



CREATE OR REPLACE TRIGGER "staff_updated_at" BEFORE UPDATE ON "public"."staff" FOR EACH ROW EXECUTE FUNCTION "public"."update_staff_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_create_default_notification_preferences" AFTER INSERT ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_notification_preferences"();



CREATE OR REPLACE TRIGGER "trigger_create_member_permissions" AFTER INSERT ON "public"."resident_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_member_permissions"();



CREATE OR REPLACE TRIGGER "trigger_domus_admins_updated_at" BEFORE UPDATE ON "public"."domus_admins" FOR EACH ROW EXECUTE FUNCTION "public"."update_domus_admins_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_notices_updated_at" BEFORE UPDATE ON "public"."notices" FOR EACH ROW EXECUTE FUNCTION "public"."update_notices_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."user_notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_notification_preferences_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_user_push_tokens_updated_at" BEFORE UPDATE ON "public"."user_push_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_push_tokens_updated_at"();



CREATE OR REPLACE TRIGGER "update_pending_residence_memberships_updated_at" BEFORE UPDATE ON "public"."pending_residence_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_rejected_invitations_updated_at" BEFORE UPDATE ON "public"."rejected_residence_membership_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_residence_membership_invitations_updated_at" BEFORE UPDATE ON "public"."residence_membership_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resident_profiles"
    ADD CONSTRAINT "approved_residence_memberships_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resident_profiles"
    ADD CONSTRAINT "approved_residence_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."gates"
    ADD CONSTRAINT "gates_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id");



ALTER TABLE ONLY "public"."guard_assignments"
    ADD CONSTRAINT "guard_assignments_guard_profile_id_fkey" FOREIGN KEY ("guard_profile_id") REFERENCES "public"."guard_profiles"("id");



ALTER TABLE ONLY "public"."guard_assignments"
    ADD CONSTRAINT "guard_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."society_shifts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."guard_assignments"
    ADD CONSTRAINT "guard_assignments_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guard_invites"
    ADD CONSTRAINT "guard_invites_accepted_user_id_fkey" FOREIGN KEY ("accepted_user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."guard_invites"
    ADD CONSTRAINT "guard_invites_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."guard_invites"
    ADD CONSTRAINT "guard_invites_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guard_profiles"
    ADD CONSTRAINT "guard_profiles_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."guard_invites"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."guard_profiles"
    ADD CONSTRAINT "guard_profiles_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guard_profiles"
    ADD CONSTRAINT "guard_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_updates"
    ADD CONSTRAINT "maintenance_updates_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id");



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "member_permissions_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "public"."resident_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "member_permissions_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "member_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."membership_status_history"
    ADD CONSTRAINT "membership_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."membership_status_history"
    ADD CONSTRAINT "membership_status_history_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id");



ALTER TABLE ONLY "public"."membership_status_history"
    ADD CONSTRAINT "membership_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."membership_status_history"
    ADD CONSTRAINT "pending_membership_status_history_pending_membership_id_fkey" FOREIGN KEY ("pending_membership_id") REFERENCES "public"."pending_residence_memberships"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pending_residence_memberships"
    ADD CONSTRAINT "pending_residence_memberships_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "public"."residence_membership_invitations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pending_residence_memberships"
    ADD CONSTRAINT "pending_residence_memberships_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_residence_memberships"
    ADD CONSTRAINT "pending_residence_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rejected_residence_membership_invitations"
    ADD CONSTRAINT "rejected_residence_membership_invitations_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "public"."residence_membership_invitations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."rejected_residence_membership_invitations"
    ADD CONSTRAINT "rejected_residence_membership_invitations_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."residence_membership_invitations"
    ADD CONSTRAINT "residence_membership_invitations_invited_by_user_fkey" FOREIGN KEY ("invited_by_user") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."residence_membership_invitations"
    ADD CONSTRAINT "residence_membership_invitations_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."residences"
    ADD CONSTRAINT "residences_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resident_profiles"
    ADD CONSTRAINT "resident_profiles_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id");



ALTER TABLE ONLY "public"."society_contacts"
    ADD CONSTRAINT "society_contacts_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."society_gates"
    ADD CONSTRAINT "society_gates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."society_gates"
    ADD CONSTRAINT "society_gates_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."society_manager_invites"
    ADD CONSTRAINT "society_manager_invites_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."manager_profiles"
    ADD CONSTRAINT "society_managers_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."society_manager_invites"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."manager_profiles"
    ADD CONSTRAINT "society_managers_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."manager_profiles"
    ADD CONSTRAINT "society_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."society_shifts"
    ADD CONSTRAINT "society_shifts_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_assignment"
    ADD CONSTRAINT "staff_assignment_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."staff_assignment"
    ADD CONSTRAINT "staff_assignment_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_assignment"
    ADD CONSTRAINT "staff_assignment_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "staff_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "staff_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id");



ALTER TABLE ONLY "public"."staff_schedule"
    ADD CONSTRAINT "staff_schedule_staff_assignment_id_fkey" FOREIGN KEY ("staff_assignment_id") REFERENCES "public"."staff_assignment"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_push_tokens"
    ADD CONSTRAINT "user_push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guest_invitations"
    ADD CONSTRAINT "visitor_invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guest_invitations"
    ADD CONSTRAINT "visitor_invitations_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guest_logs"
    ADD CONSTRAINT "visitor_logs_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guest_logs"
    ADD CONSTRAINT "visitor_logs_visitor_invitation_id_fkey" FOREIGN KEY ("guest_invitation_id") REFERENCES "public"."guest_invitations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."walk_in_visitor_logs"
    ADD CONSTRAINT "walk_in_visitor_logs_approved_by_resident_user_id_fkey" FOREIGN KEY ("approved_by_resident_user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."walk_in_visitor_logs"
    ADD CONSTRAINT "walk_in_visitor_logs_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id");



CREATE POLICY "Authenticated users can insert logs" ON "public"."activity_logs" FOR INSERT TO "authenticated" WITH CHECK (("actor_user_id" = "auth"."uid"()));



CREATE POLICY "Authenticated users can view activity logs" ON "public"."activity_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Creator can delete their staff" ON "public"."staff" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Enable all for authenticated users based on society_id" ON "public"."complaints" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable read for maintenance" ON "public"."maintenance_updates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read for notices" ON "public"."notices" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Managers can delete gates" ON "public"."society_gates" FOR DELETE USING (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can delete shifts" ON "public"."society_shifts" FOR DELETE USING (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can delete society contacts" ON "public"."society_contacts" FOR DELETE TO "authenticated" USING (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can insert gates" ON "public"."society_gates" FOR INSERT WITH CHECK (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can insert shifts" ON "public"."society_shifts" FOR INSERT WITH CHECK (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can insert society contacts" ON "public"."society_contacts" FOR INSERT TO "authenticated" WITH CHECK (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can read their own record" ON "public"."manager_profiles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Managers can update gates" ON "public"."society_gates" FOR UPDATE USING (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can update shifts" ON "public"."society_shifts" FOR UPDATE USING (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Managers can update society contacts" ON "public"."society_contacts" FOR UPDATE TO "authenticated" USING (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"())))) WITH CHECK (("society_id" IN ( SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Members can view society contacts" ON "public"."society_contacts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "rp"
  WHERE (("rp"."society_id" = "society_contacts"."society_id") AND ("rp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Owners can insert member permissions" ON "public"."member_permissions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "arm"
  WHERE (("arm"."residence_id" = "member_permissions"."residence_id") AND ("arm"."user_id" = "auth"."uid"()) AND ("arm"."role" = 'owner'::"text")))));



CREATE POLICY "Owners can update member permissions" ON "public"."member_permissions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "arm"
  WHERE (("arm"."residence_id" = "member_permissions"."residence_id") AND ("arm"."user_id" = "auth"."uid"()) AND ("arm"."role" = 'owner'::"text")))));



CREATE POLICY "Owners can update residence memberships" ON "public"."resident_profiles" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "arm"
  WHERE (("arm"."residence_id" = "resident_profiles"."residence_id") AND ("arm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("arm"."role" = 'owner'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "arm"
  WHERE (("arm"."residence_id" = "resident_profiles"."residence_id") AND ("arm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("arm"."role" = 'owner'::"text")))));



CREATE POLICY "Owners can view residence member permissions" ON "public"."member_permissions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "arm"
  WHERE (("arm"."residence_id" = "member_permissions"."residence_id") AND ("arm"."user_id" = "auth"."uid"()) AND ("arm"."role" = 'owner'::"text")))));



CREATE POLICY "Residents can approve/reject walk-in visitors" ON "public"."walk_in_visitor_logs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "arm"
  WHERE (("arm"."user_id" = "auth"."uid"()) AND ("arm"."residence_id" = "walk_in_visitor_logs"."residence_id")))));



CREATE POLICY "Residents can update staff in their residence" ON "public"."staff" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."residence_id" = "staff"."residence_id")))));



CREATE POLICY "Residents can view walk-in logs for their residence" ON "public"."walk_in_visitor_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "arm"
  WHERE (("arm"."user_id" = "auth"."uid"()) AND ("arm"."residence_id" = "walk_in_visitor_logs"."residence_id")))));



CREATE POLICY "Society managers can update residence memberships" ON "public"."resident_profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."manager_profiles" "sm"
     JOIN "public"."residences" "r" ON (("r"."society_id" = "sm"."society_id")))
  WHERE (("sm"."user_id" = "auth"."uid"()) AND ("r"."id" = "resident_profiles"."residence_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."manager_profiles" "sm"
     JOIN "public"."residences" "r" ON (("r"."society_id" = "sm"."society_id")))
  WHERE (("sm"."user_id" = "auth"."uid"()) AND ("r"."id" = "resident_profiles"."residence_id")))));



CREATE POLICY "Society members can view gates" ON "public"."society_gates" FOR SELECT USING (("society_id" IN ( SELECT "resident_profiles"."society_id"
   FROM "public"."resident_profiles"
  WHERE ("resident_profiles"."user_id" = "auth"."uid"())
UNION
 SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"())
UNION
 SELECT "guard_profiles"."society_id"
   FROM "public"."guard_profiles"
  WHERE ("guard_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "System can insert status history" ON "public"."membership_status_history" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can accept their own invites" ON "public"."society_manager_invites" FOR UPDATE TO "authenticated" USING (("phone" = ( SELECT "user_profiles"."phone"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())))) WITH CHECK (("phone" = ( SELECT "user_profiles"."phone"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can create staff assignments for their residence" ON "public"."staff_assignment" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."resident_profiles" "rp"
     JOIN "public"."member_permissions" "mp" ON (("mp"."membership_id" = "rp"."id")))
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."residence_id" = "staff_assignment"."residence_id") AND ("mp"."can_manage_staff" = true)))) AND ("assigned_by" = "auth"."uid"())));



CREATE POLICY "Users can create staff in their residence" ON "public"."staff" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."residence_id" = "staff"."residence_id")))) AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can create staff schedules for their residence" ON "public"."staff_schedule" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."staff_assignment" "sa"
     JOIN "public"."resident_profiles" "rp" ON (("rp"."residence_id" = "sa"."residence_id")))
     JOIN "public"."member_permissions" "mp" ON (("mp"."membership_id" = "rp"."id")))
  WHERE (("sa"."id" = "staff_schedule"."staff_assignment_id") AND ("rp"."user_id" = "auth"."uid"()) AND ("mp"."can_manage_staff" = true)))));



CREATE POLICY "Users can create visitor invitations for their residences" ON "public"."guest_invitations" FOR INSERT WITH CHECK ((("residence_id" IN ( SELECT "resident_profiles"."residence_id"
   FROM "public"."resident_profiles"
  WHERE ("resident_profiles"."user_id" = "auth"."uid"()))) AND ("invited_by_user_id" = "auth"."uid"())));



CREATE POLICY "Users can delete staff assignments for their residence" ON "public"."staff_assignment" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."resident_profiles" "rp"
     JOIN "public"."member_permissions" "mp" ON (("mp"."membership_id" = "rp"."id")))
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."residence_id" = "staff_assignment"."residence_id") AND ("mp"."can_manage_staff" = true)))));



CREATE POLICY "Users can delete staff schedules for their residence" ON "public"."staff_schedule" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM (("public"."staff_assignment" "sa"
     JOIN "public"."resident_profiles" "rp" ON (("rp"."residence_id" = "sa"."residence_id")))
     JOIN "public"."member_permissions" "mp" ON (("mp"."membership_id" = "rp"."id")))
  WHERE (("sa"."id" = "staff_schedule"."staff_assignment_id") AND ("rp"."user_id" = "auth"."uid"()) AND ("mp"."can_manage_staff" = true)))));



CREATE POLICY "Users can delete their own push tokens" ON "public"."user_push_tokens" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own visitor invitations" ON "public"."guest_invitations" FOR DELETE USING (("invited_by_user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own votes" ON "public"."complaint_votes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own notification preferences" ON "public"."user_notification_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own push tokens" ON "public"."user_push_tokens" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own votes" ON "public"."complaint_votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert themselves as manager" ON "public"."manager_profiles" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own invites by phone" ON "public"."society_manager_invites" FOR SELECT TO "authenticated" USING (("phone" = ( SELECT "user_profiles"."phone"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can update own notification preferences" ON "public"."user_notification_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update staff assignments for their residence" ON "public"."staff_assignment" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."resident_profiles" "rp"
     JOIN "public"."member_permissions" "mp" ON (("mp"."membership_id" = "rp"."id")))
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."residence_id" = "staff_assignment"."residence_id") AND ("mp"."can_manage_staff" = true)))));



CREATE POLICY "Users can update staff schedules for their residence" ON "public"."staff_schedule" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (("public"."staff_assignment" "sa"
     JOIN "public"."resident_profiles" "rp" ON (("rp"."residence_id" = "sa"."residence_id")))
     JOIN "public"."member_permissions" "mp" ON (("mp"."membership_id" = "rp"."id")))
  WHERE (("sa"."id" = "staff_schedule"."staff_assignment_id") AND ("rp"."user_id" = "auth"."uid"()) AND ("mp"."can_manage_staff" = true)))));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own push tokens" ON "public"."user_push_tokens" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own visitor invitations" ON "public"."guest_invitations" FOR UPDATE USING (("invited_by_user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own votes" ON "public"."complaint_votes" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view all votes" ON "public"."complaint_votes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view own notification preferences" ON "public"."user_notification_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own permissions" ON "public"."member_permissions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view shifts for their societies" ON "public"."society_shifts" FOR SELECT USING (("society_id" IN ( SELECT "resident_profiles"."society_id"
   FROM "public"."resident_profiles"
  WHERE ("resident_profiles"."user_id" = "auth"."uid"())
UNION
 SELECT "manager_profiles"."society_id"
   FROM "public"."manager_profiles"
  WHERE ("manager_profiles"."user_id" = "auth"."uid"())
UNION
 SELECT "guard_profiles"."society_id"
   FROM "public"."guard_profiles"
  WHERE ("guard_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view staff assignments for their residence" ON "public"."staff_assignment" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."residence_id" = "staff_assignment"."residence_id")))));



CREATE POLICY "Users can view staff in their residence" ON "public"."staff" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resident_profiles" "rp"
  WHERE (("rp"."user_id" = "auth"."uid"()) AND ("rp"."residence_id" = "staff"."residence_id")))));



CREATE POLICY "Users can view staff schedules for their residence" ON "public"."staff_schedule" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."staff_assignment" "sa"
     JOIN "public"."resident_profiles" "rp" ON (("rp"."residence_id" = "sa"."residence_id")))
  WHERE (("sa"."id" = "staff_schedule"."staff_assignment_id") AND ("rp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own membership status history" ON "public"."membership_status_history" FOR SELECT TO "authenticated" USING (("pending_membership_id" IN ( SELECT "pending_residence_memberships"."id"
   FROM "public"."pending_residence_memberships"
  WHERE ("pending_residence_memberships"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own push tokens" ON "public"."user_push_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view visitor invitations for their residences" ON "public"."guest_invitations" FOR SELECT USING (("residence_id" IN ( SELECT "resident_profiles"."residence_id"
   FROM "public"."resident_profiles"
  WHERE ("resident_profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view visitor logs for their residences" ON "public"."guest_logs" FOR SELECT USING (("residence_id" IN ( SELECT "resident_profiles"."residence_id"
   FROM "public"."resident_profiles"
  WHERE ("resident_profiles"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "allow delete for authenticated users" ON "public"."residence_membership_invitations" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "allow insert for authenticated users" ON "public"."pending_residence_memberships" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow insert for authenticated users" ON "public"."rejected_residence_membership_invitations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow insert for authenticated users" ON "public"."residence_membership_invitations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow insert for authenticated users" ON "public"."resident_profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow read for authenticated users" ON "public"."residences" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow read for authenticated users" ON "public"."societies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow select for authenticated users" ON "public"."pending_residence_memberships" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow select for authenticated users" ON "public"."rejected_residence_membership_invitations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow select for authenticated users" ON "public"."residence_membership_invitations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow select for authenticated users" ON "public"."resident_profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow update for authenticated users" ON "public"."pending_residence_memberships" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow update for authenticated users" ON "public"."residence_membership_invitations" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."complaint_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."domus_admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guest_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guest_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_updates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."manager_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."member_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."membership_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notices_delete_policy" ON "public"."notices" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."manager_profiles" "sm"
  WHERE (("sm"."society_id" = "notices"."society_id") AND ("sm"."user_id" = "auth"."uid"())))));



COMMENT ON POLICY "notices_delete_policy" ON "public"."notices" IS 'Only managers can delete notices';



CREATE POLICY "notices_insert_policy" ON "public"."notices" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."manager_profiles" "sm"
  WHERE (("sm"."society_id" = "notices"."society_id") AND ("sm"."user_id" = "auth"."uid"())))));



COMMENT ON POLICY "notices_insert_policy" ON "public"."notices" IS 'Only managers can create notices';



CREATE POLICY "notices_update_policy" ON "public"."notices" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."manager_profiles" "sm"
  WHERE (("sm"."society_id" = "notices"."society_id") AND ("sm"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."manager_profiles" "sm"
  WHERE (("sm"."society_id" = "notices"."society_id") AND ("sm"."user_id" = "auth"."uid"())))));



COMMENT ON POLICY "notices_update_policy" ON "public"."notices" IS 'Only managers can update notices';



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_residence_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rejected_residence_membership_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."residence_membership_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."residences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resident_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select all for authed" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."societies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."society_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."society_gates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."society_manager_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."society_shifts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff_assignment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff_schedule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_push_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."walk_in_visitor_logs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."citext"(character) TO "postgres";
GRANT ALL ON FUNCTION "public"."citext"(character) TO "anon";
GRANT ALL ON FUNCTION "public"."citext"(character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext"(character) TO "service_role";



GRANT ALL ON FUNCTION "public"."citext"("inet") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext"("inet") TO "anon";
GRANT ALL ON FUNCTION "public"."citext"("inet") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext"("inet") TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."check_guard_assignment_conflict"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_guard_assignment_conflict"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_guard_assignment_conflict"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_phone_not_in_other_invite_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_phone_not_in_other_invite_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_phone_not_in_other_invite_table"() TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_member_permissions"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_member_permissions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_member_permissions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_notification_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_default_permissions_for_role"("role_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_default_permissions_for_role"("role_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_default_permissions_for_role"("role_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_domus_admins_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_domus_admins_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_domus_admins_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_guard_gate_assignments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_guard_gate_assignments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_guard_gate_assignments_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notices_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notices_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notices_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notification_preferences_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notification_preferences_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notification_preferences_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_staff_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_staff_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_staff_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_push_tokens_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_push_tokens_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_push_tokens_updated_at"() TO "service_role";












GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "service_role";









GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."complaint_votes" TO "anon";
GRANT ALL ON TABLE "public"."complaint_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."complaint_votes" TO "service_role";



GRANT ALL ON TABLE "public"."complaints" TO "anon";
GRANT ALL ON TABLE "public"."complaints" TO "authenticated";
GRANT ALL ON TABLE "public"."complaints" TO "service_role";



GRANT ALL ON TABLE "public"."domus_admins" TO "anon";
GRANT ALL ON TABLE "public"."domus_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."domus_admins" TO "service_role";



GRANT ALL ON TABLE "public"."gates" TO "anon";
GRANT ALL ON TABLE "public"."gates" TO "authenticated";
GRANT ALL ON TABLE "public"."gates" TO "service_role";



GRANT ALL ON TABLE "public"."guard_assignments" TO "anon";
GRANT ALL ON TABLE "public"."guard_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."guard_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."guard_invites" TO "anon";
GRANT ALL ON TABLE "public"."guard_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."guard_invites" TO "service_role";



GRANT ALL ON TABLE "public"."guard_profiles" TO "anon";
GRANT ALL ON TABLE "public"."guard_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."guard_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."guest_invitations" TO "anon";
GRANT ALL ON TABLE "public"."guest_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."guest_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."guest_logs" TO "anon";
GRANT ALL ON TABLE "public"."guest_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."guest_logs" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_updates" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_updates" TO "service_role";



GRANT ALL ON TABLE "public"."manager_profiles" TO "anon";
GRANT ALL ON TABLE "public"."manager_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."manager_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."member_permissions" TO "anon";
GRANT ALL ON TABLE "public"."member_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."member_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."membership_status_history" TO "anon";
GRANT ALL ON TABLE "public"."membership_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."membership_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."notices" TO "anon";
GRANT ALL ON TABLE "public"."notices" TO "authenticated";
GRANT ALL ON TABLE "public"."notices" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."pending_residence_memberships" TO "anon";
GRANT ALL ON TABLE "public"."pending_residence_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_residence_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."rejected_residence_membership_invitations" TO "anon";
GRANT ALL ON TABLE "public"."rejected_residence_membership_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."rejected_residence_membership_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."residence_membership_invitations" TO "anon";
GRANT ALL ON TABLE "public"."residence_membership_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."residence_membership_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."residences" TO "anon";
GRANT ALL ON TABLE "public"."residences" TO "authenticated";
GRANT ALL ON TABLE "public"."residences" TO "service_role";



GRANT ALL ON TABLE "public"."resident_profiles" TO "anon";
GRANT ALL ON TABLE "public"."resident_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."resident_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."societies" TO "anon";
GRANT ALL ON TABLE "public"."societies" TO "authenticated";
GRANT ALL ON TABLE "public"."societies" TO "service_role";



GRANT ALL ON TABLE "public"."society_contacts" TO "anon";
GRANT ALL ON TABLE "public"."society_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."society_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."society_gates" TO "anon";
GRANT ALL ON TABLE "public"."society_gates" TO "authenticated";
GRANT ALL ON TABLE "public"."society_gates" TO "service_role";



GRANT ALL ON TABLE "public"."society_manager_invites" TO "anon";
GRANT ALL ON TABLE "public"."society_manager_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."society_manager_invites" TO "service_role";



GRANT ALL ON TABLE "public"."society_shifts" TO "anon";
GRANT ALL ON TABLE "public"."society_shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."society_shifts" TO "service_role";



GRANT ALL ON TABLE "public"."staff" TO "anon";
GRANT ALL ON TABLE "public"."staff" TO "authenticated";
GRANT ALL ON TABLE "public"."staff" TO "service_role";



GRANT ALL ON TABLE "public"."staff_assignment" TO "anon";
GRANT ALL ON TABLE "public"."staff_assignment" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_assignment" TO "service_role";



GRANT ALL ON TABLE "public"."staff_schedule" TO "anon";
GRANT ALL ON TABLE "public"."staff_schedule" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_schedule" TO "service_role";



GRANT ALL ON TABLE "public"."user_notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_push_tokens" TO "anon";
GRANT ALL ON TABLE "public"."user_push_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."user_push_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."walk_in_visitor_logs" TO "anon";
GRANT ALL ON TABLE "public"."walk_in_visitor_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."walk_in_visitor_logs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































alter table "public"."staff" drop constraint "staff_gender_check";

alter table "public"."staff" add constraint "staff_gender_check" CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[]))) not valid;

alter table "public"."staff" validate constraint "staff_gender_check";


  create policy "Allow auth users to select avatars 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'avatars'::text));



  create policy "Allow authenticated users to list category images"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'category-images'::text));


-- NOTE: These storage triggers are managed by Supabase and already exist on new projects
-- CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

-- CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

-- CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

-- CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

-- CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


