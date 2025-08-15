-- Events auto-cleanup: delete events and related rows 15 days after event_date
-- Safe to run multiple times (IF NOT EXISTS guards where possible)

-- 1) Ensure foreign keys have ON DELETE CASCADE so child rows get removed automatically
DO $$
BEGIN
  -- event_registrations.event_id -> events.id
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'event_registrations_event_id_fkey'
  ) THEN
    ALTER TABLE IF EXISTS public.event_registrations
      DROP CONSTRAINT IF EXISTS event_registrations_event_id_fkey;
  END IF;
  ALTER TABLE IF EXISTS public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

  -- event_attendance.event_id -> events.id
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'event_attendance_event_id_fkey'
  ) THEN
    ALTER TABLE IF EXISTS public.event_attendance
      DROP CONSTRAINT IF EXISTS event_attendance_event_id_fkey;
  END IF;
  ALTER TABLE IF EXISTS public.event_attendance
    ADD CONSTRAINT event_attendance_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

  -- seat_assignments.event_id -> events.id
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'seat_assignments_event_id_fkey'
  ) THEN
    ALTER TABLE IF EXISTS public.seat_assignments
      DROP CONSTRAINT IF EXISTS seat_assignments_event_id_fkey;
  END IF;
  ALTER TABLE IF EXISTS public.seat_assignments
    ADD CONSTRAINT seat_assignments_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
END $$;

-- 2) Helper index for cleanup query performance
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events (event_date);

-- 3) Cleanup function: delete events older than 15 days past event_date
CREATE OR REPLACE FUNCTION public.ev_cleanup_expired_events()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_cutoff timestamptz := now() - interval '15 days';
BEGIN
  -- Collect expired event ids
  WITH expired AS (
    SELECT id FROM public.events WHERE event_date < v_cutoff
  )
  -- Delete dependents first (robust even if FKs lack ON DELETE CASCADE)
  DELETE FROM public.event_attendance ea USING expired e WHERE ea.event_id = e.id;

  DELETE FROM public.event_registrations er USING expired e WHERE er.event_id = e.id;

  DELETE FROM public.seat_assignments sa USING expired e WHERE sa.event_id = e.id;

  -- Finally delete events
  DELETE FROM public.events e USING expired x WHERE e.id = x.id;
END;
$$;

-- 4) Schedule the cleanup daily at 02:00 using pg_cron (if available)
-- Note: pg_cron must be enabled on your Supabase project. This block is safe even if already scheduled.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Create a job if it doesn't already exist
    PERFORM cron.schedule(
      job_name => 'ev_cleanup_daily',
      schedule => '0 2 * * *',
      command => $$CALL public.ev_cleanup_expired_events();$$
    );
  END IF;
END $$;
