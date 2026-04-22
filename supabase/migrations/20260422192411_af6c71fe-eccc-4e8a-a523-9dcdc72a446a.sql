-- Allow admins to view profiles (for support / analytics).
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Belt-and-suspenders: explicitly forbid users from inserting their own admin role.
-- This RESTRICTIVE policy ANDs with the existing PERMISSIVE "Admins can insert roles" policy,
-- ensuring that even if another permissive policy is added later, no user can self-elevate.
CREATE POLICY "Forbid self-elevation to admin"
  ON public.user_roles AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    role <> 'admin' OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Forbid self-elevation via update"
  ON public.user_roles AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );