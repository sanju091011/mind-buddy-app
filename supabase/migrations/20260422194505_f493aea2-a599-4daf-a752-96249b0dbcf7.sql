CREATE OR REPLACE FUNCTION public.is_counselor_for(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.user_id = _student_id
      AND b.counsellor_id = auth.uid()
      AND b.status = 'confirmed'
  )
$$;

DROP POLICY IF EXISTS "Forbid self-elevation to admin" ON public.user_roles;