-- =====================================================================
-- SUPABASE — ONE‑SHOT CLEAN SCHEMA (Évaluations + Auth enseignants)
-- Ordre corrigé (tables avant fonctions/policies), sans triggers stricts
-- Idempotent : DROP ... IF EXISTS pour contraintes & policies
-- =====================================================================

-- Extensions requises ---------------------------------------------------
create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists btree_gist;    -- exclusion constraints

-- Schéma applicatif -----------------------------------------------------
create schema if not exists app;

-- =========================
-- 1) Tables de base & références Auth
-- =========================
create table if not exists teacher (
  teacher_id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text not null,
  last_name  text not null,
  email text,
  active boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists school_year (
  school_year_id uuid primary key default gen_random_uuid(),
  label text not null,                           -- "2025-2026"
  starts_on date not null,
  ends_on   date not null,
  created_at timestamptz not null default now(),
  unique (label)
);

create table if not exists school (
  school_id uuid primary key default gen_random_uuid(),
  name text not null,
  uai  text,
  city text,
  created_at timestamptz not null default now(),
  unique (uai)
);

create table if not exists class (
  class_id uuid primary key default gen_random_uuid(),
  school_id uuid references school(school_id) on delete set null,
  school_year_id uuid not null references school_year(school_year_id) on delete cascade,
  label text not null,                           -- "CE2 A", "GS", ...
  level text,
  primary_teacher_id uuid not null references teacher(teacher_id),
  created_at timestamptz not null default now(),
  unique (school_year_id, school_id, label)
);

create table if not exists class_teacher (
  class_id   uuid not null references class(class_id) on delete cascade,
  teacher_id uuid not null references teacher(teacher_id) on delete cascade,
  role text not null default 'co' check (role in ('main','co','avs','intervenant','remplacant','autre')),
  is_primary boolean not null default false,
  starts_on date not null default current_date,
  ends_on   date,
  created_at timestamptz not null default now(),
  primary key (class_id, teacher_id, starts_on)
);

create table if not exists student (
  student_id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  birth_date date,
  external_ref text,
  created_at timestamptz not null default now()
);

create table if not exists enrolment (
  enrolment_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references student(student_id) on delete cascade,
  class_id   uuid not null references class(class_id)   on delete cascade,
  enrolled_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (student_id, class_id)
);

-- =====================================
-- 2) Référentiel de compétences (hiérarchie)
-- =====================================
create table if not exists competence_framework (
  framework_id uuid primary key default gen_random_uuid(),
  name text not null,
  locale text default 'fr-FR',
  version text,
  effective_from date,
  effective_to   date,
  created_at timestamptz not null default now()
);

create table if not exists domain (
  domain_id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references competence_framework(framework_id) on delete cascade,
  code text,
  label text not null,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  unique (framework_id, code)
);

create table if not exists field (
  field_id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references competence_framework(framework_id) on delete cascade,
  domain_id uuid not null references domain(domain_id) on delete cascade,
  code text,
  label text not null,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  unique (framework_id, code)
);

create table if not exists competence (
  competence_id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references competence_framework(framework_id) on delete cascade,
  field_id uuid not null references field(field_id) on delete cascade,
  code text,
  label text not null,
  description text,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  unique (framework_id, code)
);

create table if not exists specific_competence (
  specific_competence_id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references competence_framework(framework_id) on delete cascade,
  competence_id uuid not null references competence(competence_id) on delete cascade,
  code text,
  label text not null,
  description text,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  unique (framework_id, code)
);

-- =============================
-- 3) Helpers Auth/RPC (après tables)
-- =============================
create or replace function app.current_user_id()
returns uuid language sql stable as $$ select auth.uid(); $$;

create or replace function app.current_teacher_id()
returns uuid language sql stable as $$
  select t.teacher_id from teacher t where t.user_id = auth.uid();
$$;

create or replace function app.ensure_teacher(p_first text default 'Inconnu', p_last text default 'Utilisateur')
returns uuid language plpgsql security definer set search_path = public, auth, app as $$
declare tid uuid; begin
  insert into teacher(user_id, first_name, last_name)
  values (auth.uid(), coalesce(p_first,'Inconnu'), coalesce(p_last,'Utilisateur'))
  on conflict(user_id) do update
    set first_name = excluded.first_name,
        last_name  = excluded.last_name
  returning teacher_id into tid;
  return tid;
end $$;

create or replace function app.is_teacher_in_class(target_class uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from class_teacher ct
    join teacher t on t.teacher_id = ct.teacher_id
    where ct.class_id = target_class
      and t.user_id = auth.uid()
      and ct.starts_on <= current_date
      and (ct.ends_on is null or ct.ends_on >= current_date)
  );
$$;

-- =============================
-- 4) Barèmes, gabarits, sessions, résultats
-- =============================
create table if not exists rubric (
  rubric_id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'ordinal' check (kind in ('ordinal','numeric','hybrid')),
  description text,
  created_by_teacher_id uuid not null default app.current_teacher_id() references teacher(teacher_id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists rubric_level (
  rubric_level_id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references rubric(rubric_id) on delete cascade,
  code text not null,
  label text not null,
  ordinal int not null,
  min_score numeric,
  max_score numeric,
  color text,
  created_at timestamptz not null default now(),
  unique (rubric_id, code),
  unique (rubric_id, ordinal)
);

create table if not exists eval_template (
  template_id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references competence_framework(framework_id) on delete restrict,
  name text not null,
  description text,
  created_by_teacher_id uuid not null default app.current_teacher_id() references teacher(teacher_id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (framework_id, name, created_by_teacher_id)
);

create table if not exists eval_template_line (
  template_line_id uuid primary key default gen_random_uuid(),
  template_id uuid not null references eval_template(template_id) on delete cascade,
  competence_id uuid references competence(competence_id) on delete restrict,
  specific_competence_id uuid references specific_competence(specific_competence_id) on delete restrict,
  rubric_id uuid not null references rubric(rubric_id) on delete restrict,
  weight numeric default 1,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  check ((competence_id is not null and specific_competence_id is null)
      or (competence_id is null and specific_competence_id is not null))
);

create table if not exists eval_session (
  session_id uuid primary key default gen_random_uuid(),
  class_id uuid not null references class(class_id) on delete cascade,
  template_id uuid not null references eval_template(template_id) on delete restrict,
  label text not null,
  session_date date not null default current_date,
  notes text,
  created_by_teacher_id uuid references teacher(teacher_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists evaluation (
  evaluation_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references eval_session(session_id) on delete cascade,
  student_id uuid not null references student(student_id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','finalized')),
  started_at timestamptz default now(),
  submitted_at timestamptz,
  evaluator_teacher_id uuid references teacher(teacher_id) on delete set null,
  unique (session_id, student_id)
);

create table if not exists eval_result (
  eval_result_id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references evaluation(evaluation_id) on delete cascade,
  template_line_id uuid not null references eval_template_line(template_line_id) on delete restrict,
  rubric_level_id uuid references rubric_level(rubric_level_id) on delete restrict,
  numeric_score numeric,
  comment text,
  teacher_id uuid references teacher(teacher_id) on delete set null,
  updated_by_teacher_id uuid references teacher(teacher_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (evaluation_id, template_line_id)
);

-- =============================
-- 5) Contraintes & Index (idempotents)
-- =============================
-- Dates cohérentes + pas de double titulaire qui se chevauche
alter table class_teacher drop constraint if exists chk_ct_dates;
alter table class_teacher add constraint chk_ct_dates
  check (ends_on is null or ends_on >= starts_on);

alter table class_teacher drop constraint if exists ex_class_primary_no_overlap;
alter table class_teacher add constraint ex_class_primary_no_overlap
  exclude using gist (
    class_id with =,
    daterange(starts_on, coalesce(ends_on, 'infinity'::date), '[]') with &&
  ) where (is_primary);

create index if not exists idx_class_primary_teacher on class(primary_teacher_id);
create index if not exists idx_enrolment_student on enrolment(student_id);
create index if not exists idx_class_year on class(school_year_id);
create index if not exists idx_domain_framework on domain(framework_id);
create index if not exists idx_field_domain on field(domain_id);
create index if not exists idx_comp_field on competence(field_id);
create index if not exists idx_spec_comp on specific_competence(competence_id);
create index if not exists idx_tpl_framework on eval_template(framework_id);
create index if not exists idx_tpl_line_comp on eval_template_line(competence_id);
create index if not exists idx_tpl_line_spec on eval_template_line(specific_competence_id);
create index if not exists idx_session_class on eval_session(class_id);
create index if not exists idx_eval_session on evaluation(session_id);
create index if not exists idx_result_eval on eval_result(evaluation_id);
create index if not exists idx_rubric_creator on rubric(created_by_teacher_id);
create index if not exists idx_template_creator on eval_template(created_by_teacher_id);
create index if not exists idx_class_teacher_teacher on class_teacher(teacher_id);
create index if not exists idx_class_teacher_class   on class_teacher(class_id);

-- =============================
-- 6) Row Level Security (RLS)
-- =============================
-- teacher : self‑service
alter table teacher enable row level security;
drop policy if exists "teacher self access" on teacher;
create policy "teacher self access" on teacher for select to authenticated using (user_id = auth.uid());

drop policy if exists "teacher self update" on teacher;
create policy "teacher self update" on teacher for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- school_year / school : lecture ouverte aux authentifiés
alter table school_year enable row level security;
drop policy if exists "read school_year" on school_year;
create policy "read school_year" on school_year for select to authenticated using (true);

alter table school enable row level security;
drop policy if exists "read school" on school;
create policy "read school" on school for select to authenticated using (true);

-- class : visible/modifiable si enseignant de la classe
alter table class enable row level security;
drop policy if exists "read class by teacher" on class;
create policy "read class by teacher" on class for select to authenticated using (app.is_teacher_in_class(class_id));

drop policy if exists "insert class by self as primary" on class;
create policy "insert class by self as primary" on class for insert to authenticated with check (primary_teacher_id = app.current_teacher_id());

drop policy if exists "update class by teacher" on class;
create policy "update class by teacher" on class for update to authenticated using (app.is_teacher_in_class(class_id)) with check (true);

-- class_teacher : accès à ses lignes et à ses classes
alter table class_teacher enable row level security;
drop policy if exists "read class_teacher for my classes" on class_teacher;
create policy "read class_teacher for my classes" on class_teacher for select to authenticated using (
  exists (select 1 from teacher t where t.teacher_id = class_teacher.teacher_id and t.user_id = auth.uid())
  or app.is_teacher_in_class(class_teacher.class_id)
);

drop policy if exists "insert class_teacher self" on class_teacher;
create policy "insert class_teacher self" on class_teacher for insert to authenticated with check (
  teacher_id = app.current_teacher_id() and (
    app.is_teacher_in_class(class_id) or true -- cas création initiale
  )
);

drop policy if exists "update class_teacher self-class" on class_teacher;
create policy "update class_teacher self-class" on class_teacher for update to authenticated using (
  teacher_id = app.current_teacher_id() or app.is_teacher_in_class(class_id)
) with check (true);

drop policy if exists "delete class_teacher self" on class_teacher;
create policy "delete class_teacher self" on class_teacher for delete to authenticated using (teacher_id = app.current_teacher_id());

-- student : visible si inscrit dans une classe de l'enseignant
alter table student enable row level security;
drop policy if exists "read student in my classes" on student;
create policy "read student in my classes" on student for select to authenticated using (
  exists (
    select 1 from enrolment e
    join class_teacher ct on ct.class_id = e.class_id
    join teacher t on t.teacher_id = ct.teacher_id
    where e.student_id = student.student_id
      and t.user_id = auth.uid()
      and ct.starts_on <= current_date
      and (ct.ends_on is null or ct.ends_on >= current_date)
  )
);

drop policy if exists "insert student by teacher" on student;
create policy "insert student by teacher" on student for insert to authenticated with check (true);

drop policy if exists "update student in my classes" on student;
create policy "update student in my classes" on student for update to authenticated using (
  exists (
    select 1 from enrolment e
    join class c on c.class_id = e.class_id
    where e.student_id = student.student_id and app.is_teacher_in_class(c.class_id)
  )
) with check (true);

-- enrolment : par classe
alter table enrolment enable row level security;
drop policy if exists "read enrolment my classes" on enrolment;
create policy "read enrolment my classes" on enrolment for select to authenticated using (app.is_teacher_in_class(class_id));

drop policy if exists "insert enrolment my classes" on enrolment;
create policy "insert enrolment my classes" on enrolment for insert to authenticated with check (app.is_teacher_in_class(class_id));

drop policy if exists "update enrolment my classes" on enrolment;
create policy "update enrolment my classes" on enrolment for update to authenticated using (app.is_teacher_in_class(class_id)) with check (app.is_teacher_in_class(class_id));

drop policy if exists "delete enrolment my classes" on enrolment;
create policy "delete enrolment my classes" on enrolment for delete to authenticated using (app.is_teacher_in_class(class_id));

-- référentiel : lecture ouverte aux authentifiés
alter table competence_framework enable row level security;
drop policy if exists "read framework" on competence_framework;
create policy "read framework" on competence_framework for select to authenticated using (true);

alter table domain enable row level security;
drop policy if exists "read domain" on domain;
create policy "read domain" on domain for select to authenticated using (true);

alter table field enable row level security;
drop policy if exists "read field" on field;
create policy "read field" on field for select to authenticated using (true);

alter table competence enable row level security;
drop policy if exists "read competence" on competence;
create policy "read competence" on competence for select to authenticated using (true);

alter table specific_competence enable row level security;
drop policy if exists "read specific_competence" on specific_competence;
create policy "read specific_competence" on specific_competence for select to authenticated using (true);

-- barèmes/gabarits
alter table rubric enable row level security;
drop policy if exists "read rubric" on rubric;
create policy "read rubric" on rubric for select to authenticated using (true);

drop policy if exists "write own rubric" on rubric;
create policy "write own rubric" on rubric for all to authenticated using (created_by_teacher_id = app.current_teacher_id()) with check (created_by_teacher_id = app.current_teacher_id());

alter table rubric_level enable row level security;
drop policy if exists "read rubric_level" on rubric_level;
create policy "read rubric_level" on rubric_level for select to authenticated using (true);

drop policy if exists "write rubric_level via own rubric" on rubric_level;
create policy "write rubric_level via own rubric" on rubric_level for all to authenticated using (
  exists (select 1 from rubric r where r.rubric_id = rubric_level.rubric_id and r.created_by_teacher_id = app.current_teacher_id())
) with check (
  exists (select 1 from rubric r where r.rubric_id = rubric_level.rubric_id and r.created_by_teacher_id = app.current_teacher_id())
);

alter table eval_template enable row level security;
drop policy if exists "read template" on eval_template;
create policy "read template" on eval_template for select to authenticated using (true);

drop policy if exists "write own template" on eval_template;
create policy "write own template" on eval_template for all to authenticated using (created_by_teacher_id = app.current_teacher_id()) with check (created_by_teacher_id = app.current_teacher_id());

alter table eval_template_line enable row level security;
drop policy if exists "read template_line" on eval_template_line;
create policy "read template_line" on eval_template_line for select to authenticated using (true);

drop policy if exists "write template_line via own template" on eval_template_line;
create policy "write template_line via own template" on eval_template_line for all to authenticated using (
  exists (select 1 from eval_template t where t.template_id = eval_template_line.template_id and t.created_by_teacher_id = app.current_teacher_id())
) with check (
  exists (select 1 from eval_template t where t.template_id = eval_template_line.template_id and t.created_by_teacher_id = app.current_teacher_id())
);

alter table eval_session enable row level security;
drop policy if exists "read session my classes" on eval_session;
create policy "read session my classes" on eval_session for select to authenticated using (app.is_teacher_in_class(class_id));

drop policy if exists "write session my classes" on eval_session;
create policy "write session my classes" on eval_session for all to authenticated using (app.is_teacher_in_class(class_id)) with check (app.is_teacher_in_class(class_id));

alter table evaluation enable row level security;
drop policy if exists "read evaluation my classes" on evaluation;
create policy "read evaluation my classes" on evaluation for select to authenticated using (
  exists (select 1 from eval_session s where s.session_id = evaluation.session_id and app.is_teacher_in_class(s.class_id))
);

drop policy if exists "write evaluation my classes" on evaluation;
create policy "write evaluation my classes" on evaluation for all to authenticated using (
  exists (select 1 from eval_session s where s.session_id = evaluation.session_id and app.is_teacher_in_class(s.class_id))
) with check (
  exists (select 1 from eval_session s where s.session_id = evaluation.session_id and app.is_teacher_in_class(s.class_id))
);

alter table eval_result enable row level security;
drop policy if exists "read result my classes" on eval_result;
create policy "read result my classes" on eval_result for select to authenticated using (
  exists (select 1 from evaluation e join eval_session s on s.session_id = e.session_id where e.evaluation_id = eval_result.evaluation_id and app.is_teacher_in_class(s.class_id))
);

drop policy if exists "write result my classes" on eval_result;
create policy "write result my classes" on eval_result for all to authenticated using (
  exists (select 1 from evaluation e join eval_session s on s.session_id = e.session_id where e.evaluation_id = eval_result.evaluation_id and app.is_teacher_in_class(s.class_id))
) with check (
  exists (select 1 from evaluation e join eval_session s on s.session_id = e.session_id where e.evaluation_id = eval_result.evaluation_id and app.is_teacher_in_class(s.class_id))
);

-- =============================
-- 7) Vues utilitaires
-- =============================
create or replace view v_class_active_teachers as
select ct.class_id, ct.teacher_id, ct.role, ct.is_primary, ct.starts_on, ct.ends_on
from class_teacher ct
where current_date >= ct.starts_on and (ct.ends_on is null or current_date <= ct.ends_on);

create or replace view v_class_primary_today as
select * from v_class_active_teachers where is_primary;

-- =============================
-- 8) Notes
-- =============================
-- Après le signup, côté client : await supabase.rpc('ensure_teacher', { p_first: 'Prénom', p_last: 'Nom' })
-- Pour créer une classe : INSERT INTO class (..., primary_teacher_id = app.current_teacher_id());
-- Ajoutez les co‑enseignants via class_teacher ; l'exclusion évite deux titulaires qui se chevauchent.
