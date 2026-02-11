CREATE POLICY "Users can update guest logs for their residences"
ON public.guest_logs
FOR UPDATE
USING (
  residence_id IN (
    SELECT residence_id
    FROM resident_profiles
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  residence_id IN (
    SELECT residence_id
    FROM resident_profiles
    WHERE user_id = auth.uid()
  )
);
