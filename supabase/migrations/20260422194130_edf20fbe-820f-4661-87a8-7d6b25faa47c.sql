-- Counselor support
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS counsellor_id uuid;
CREATE INDEX IF NOT EXISTS idx_bookings_counsellor_id ON public.bookings(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

CREATE OR REPLACE FUNCTION public.is_counselor_for(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.user_id = _student_id AND b.counsellor_id = auth.uid()
  )
$$;

CREATE POLICY "Counselors can view assigned student profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'counselor') AND public.is_counselor_for(id));

CREATE POLICY "Counselors can view assigned student mood entries"
  ON public.mood_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'counselor') AND public.is_counselor_for(user_id));

CREATE POLICY "Counselors can view their bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'counselor') AND counsellor_id = auth.uid());

CREATE POLICY "Counselors can update their bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'counselor') AND counsellor_id = auth.uid());

-- Chat sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own chat sessions"
  ON public.chat_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR (is_anonymous = true AND user_id IS NULL));
CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chat sessions"
  ON public.chat_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all chat sessions"
  ON public.chat_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user','ai')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_chat_session(_session_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_sessions s
    WHERE s.id = _session_id AND s.user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can view messages in their sessions"
  ON public.messages FOR SELECT TO authenticated
  USING (public.owns_chat_session(session_id));
CREATE POLICY "Users can insert messages in their sessions"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (public.owns_chat_session(session_id));
CREATE POLICY "Users can delete messages in their sessions"
  ON public.messages FOR DELETE TO authenticated
  USING (public.owns_chat_session(session_id));
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='bookings') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings';
  END IF;
END $$;

-- Wellness analytics
CREATE OR REPLACE FUNCTION public.weekly_wellness_score(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(ROUND(AVG(mood_score) * 20)::int, 0)
  FROM public.mood_entries
  WHERE user_id = _user_id AND created_at >= now() - interval '7 days'
$$;

CREATE OR REPLACE VIEW public.struggling_users
WITH (security_invoker = true) AS
SELECT
  user_id,
  ROUND(AVG(mood_score)::numeric, 2) AS avg_mood,
  COUNT(*)::int AS entry_count,
  MAX(created_at) AS last_entry_at
FROM public.mood_entries
WHERE created_at >= now() - interval '14 days' AND mood_score IS NOT NULL
GROUP BY user_id
HAVING AVG(mood_score) <= 2 AND COUNT(*) >= 3;

GRANT SELECT ON public.struggling_users TO authenticated;