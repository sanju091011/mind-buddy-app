DROP POLICY IF EXISTS "Counselors can update their bookings" ON public.bookings;
CREATE POLICY "Counselors can update their bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'counselor') AND counsellor_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'counselor') AND counsellor_id = auth.uid());