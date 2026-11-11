-- HCI course: hashed student passwords + fixed recovery code 1234567890.
-- The app has always looked students up in hci_students first and then in
-- cp2_students (Computer Programming course). These functions keep that order,
-- checking hashed passwords inside the database. Safe to re-run.
-- Requires the com_prog migration (cp2_students.password_hash) to have run already.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.hci_students (
  id             bigint generated always as identity primary key,
  student_name   text not null,
  student_number text not null unique,
  section_number text,
  password       text,
  progress       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

alter table public.hci_students
  add column if not exists password_hash text;

-- Hash existing plaintext passwords, then replace the plaintext with random unusable text.
update public.hci_students
set password_hash = extensions.crypt(password, extensions.gen_salt('bf', 12)),
    password = encode(extensions.gen_random_bytes(32), 'hex')
where password_hash is null
  and password is not null;

-- Login: hci_students first, then cp2_students. Returns which table matched in 'source'.
create or replace function public.hci_student_login(
  p_student_number text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hci public.hci_students%rowtype;
  v_cp2 public.cp2_students%rowtype;
begin
  if p_student_number is null or p_password is null then
    return jsonb_build_object('success', false);
  end if;

  select * into v_hci
  from public.hci_students s
  where s.student_number = trim(p_student_number)
    and s.password_hash is not null
    and extensions.crypt(p_password, s.password_hash) = s.password_hash
  limit 1;

  if found then
    return jsonb_build_object(
      'success', true, 'source', 'hci_students',
      'id', v_hci.id,
      'student_name', v_hci.student_name,
      'student_number', v_hci.student_number,
      'section_number', v_hci.section_number,
      'progress', coalesce(v_hci.progress, '{}'::jsonb)
    );
  end if;

  select * into v_cp2
  from public.cp2_students s
  where s.student_number = trim(p_student_number)
    and s.password_hash is not null
    and extensions.crypt(p_password, s.password_hash) = s.password_hash
  limit 1;

  if found then
    return jsonb_build_object(
      'success', true, 'source', 'cp2_students',
      'id', v_cp2.id,
      'student_name', v_cp2.student_name,
      'student_number', v_cp2.student_number,
      'section_number', v_cp2.section_number,
      'progress', coalesce(v_cp2.progress, '{}'::jsonb)
    );
  end if;

  return jsonb_build_object('success', false);
end;
$$;

-- New registrations go into hci_students only.
create or replace function public.hci_register_student(
  p_student_name text,
  p_student_number text,
  p_section_number text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student public.hci_students%rowtype;
begin
  if length(trim(coalesce(p_student_name, ''))) = 0
     or coalesce(trim(p_student_number), '') !~ '^[0-9]{8}$'
     or length(coalesce(p_password, '')) < 8 then
    return jsonb_build_object('success', false, 'error', 'invalid');
  end if;

  if exists (select 1 from public.hci_students where student_number = trim(p_student_number))
     or exists (select 1 from public.cp2_students where student_number = trim(p_student_number)) then
    return jsonb_build_object('success', false, 'error', 'exists');
  end if;

  insert into public.hci_students (
    student_name, student_number, section_number, password, password_hash, progress
  ) values (
    trim(p_student_name), trim(p_student_number), p_section_number,
    encode(extensions.gen_random_bytes(32), 'hex'),
    extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
    '{}'::jsonb
  )
  returning * into v_student;

  return jsonb_build_object(
    'success', true,
    'student', jsonb_build_object(
      'source', 'hci_students',
      'id', v_student.id,
      'student_name', v_student.student_name,
      'student_number', v_student.student_number,
      'section_number', v_student.section_number,
      'progress', coalesce(v_student.progress, '{}'::jsonb)
    )
  );
exception when unique_violation then
  return jsonb_build_object('success', false, 'error', 'exists');
end;
$$;

-- Fixed recovery code for all students: 1234567890 (reusable, not consumed).
-- Resets the account in hci_students, or in cp2_students if the student is only there.
create or replace function public.hci_reset_student_password(
  p_student_number text,
  p_recovery_code text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  if p_student_number is null
     or p_recovery_code is null
     or trim(p_recovery_code) <> '1234567890'
     or length(coalesce(p_new_password, '')) < 8 then
    return false;
  end if;

  v_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf', 12));

  update public.hci_students
  set password_hash = v_hash,
      password = encode(extensions.gen_random_bytes(32), 'hex')
  where student_number = trim(p_student_number);
  if found then
    return true;
  end if;

  update public.cp2_students
  set password_hash = v_hash,
      password = encode(extensions.gen_random_bytes(32), 'hex')
  where student_number = trim(p_student_number);
  return found;
end;
$$;

revoke all on function public.hci_student_login(text, text) from public;
revoke all on function public.hci_register_student(text, text, text, text) from public;
revoke all on function public.hci_reset_student_password(text, text, text) from public;
grant execute on function public.hci_student_login(text, text) to anon, authenticated;
grant execute on function public.hci_register_student(text, text, text, text) to anon, authenticated;
grant execute on function public.hci_reset_student_password(text, text, text) to anon, authenticated;

-- Browser clients can no longer read or change passwords/hashes.
revoke all on table public.hci_students from anon, authenticated;
grant select (id, student_name, student_number, section_number, progress)
  on table public.hci_students to anon, authenticated;
grant update (progress) on table public.hci_students to anon, authenticated;
grant delete on table public.hci_students to anon, authenticated;
