ALTER TABLE public.chat_sessions
  ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can create their own chat sessions"
  ON public.chat_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);