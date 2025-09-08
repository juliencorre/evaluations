-- Fix missing INSERT policy for teacher table
-- This allows users to create their own teacher record during registration

-- Add INSERT policy for teacher table
drop policy if exists "teacher self insert" on teacher;
create policy "teacher self insert" on teacher for insert to authenticated 
  with check (user_id = auth.uid());

-- Also allow authenticated users to create teacher records for themselves
drop policy if exists "teacher self access" on teacher;
create policy "teacher self access" on teacher for select to authenticated 
  using (user_id = auth.uid());

drop policy if exists "teacher self update" on teacher;
create policy "teacher self update" on teacher for update to authenticated 
  using (user_id = auth.uid()) with check (user_id = auth.uid());