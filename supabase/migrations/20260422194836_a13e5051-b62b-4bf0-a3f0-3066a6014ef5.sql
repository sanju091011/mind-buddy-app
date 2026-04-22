-- Block users from modifying privileged booking fields
CREATE OR REPLACE FUNCTION public.protect_booking_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Admins and the assigned counselor are allowed to change these
  IF public.has_role(auth.uid(), 'admin')
     OR (public.has_role(auth.uid(), 'counselor') AND OLD.counsellor_id = auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.counsellor_id IS DISTINCT FROM OLD.counsellor_id
     OR NEW.counsellor_name IS DISTINCT FROM OLD.counsellor_name
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to modify counsellor_id, counsellor_name, status, or user_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_booking_fields ON public.bookings;
CREATE TRIGGER trg_protect_booking_fields
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.protect_booking_fields();

-- Explicit no-update on messages
CREATE POLICY "No one can edit messages"
  ON public.messages AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);