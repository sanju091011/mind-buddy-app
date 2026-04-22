-- 1. Tighten counselor access window
CREATE OR REPLACE FUNCTION public.is_counselor_for(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.user_id = _student_id
      AND b.counsellor_id = auth.uid()
      AND b.status IN ('pending', 'confirmed')
  )
$$;

-- 2. Remove bookings from realtime publication (not used by UI; reduces broadcast surface)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='bookings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings';
  END IF;
END $$;

-- 3. Restrictive policy: only admins can ever insert into user_roles
CREATE POLICY "Only admins can assign any role"
  ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));