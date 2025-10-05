
-- Minimal table definitions for Supabase (align with your current models)
create table if not exists customers (
  id bigserial primary key,
  tenant_id int not null default 1,
  name text not null,
  contact text default ''
);

create table if not exists process_templates (
  id bigserial primary key,
  tenant_id int not null default 1,
  name text not null,
  default_role text default 'operator',
  order_index int default 0
);

create table if not exists job_requests (
  id bigserial primary key,
  tenant_id int not null default 1,
  customer_id bigint references customers(id),
  title text not null,
  description text default '',
  created_at timestamptz default now(),
  started boolean default false
);

create table if not exists step_instances (
  id bigserial primary key,
  tenant_id int not null default 1,
  job_id bigint references job_requests(id),
  template_id bigint references process_templates(id),
  name text not null,
  assigned_role text,
  assignee_id uuid null, -- Supabase auth user id
  status text default 'pending',
  est_duration_hours int null,
  required_qty int null,
  produced_qty int null
);

create table if not exists step_logs (
  id bigserial primary key,
  tenant_id int not null default 1,
  step_id bigint references step_instances(id),
  message text,
  created_at timestamptz default now()
);

create table if not exists file_assets (
  id bigserial primary key,
  tenant_id int not null default 1,
  job_id bigint references job_requests(id),
  step_id bigint references step_instances(id),
  key text not null,
  url text not null,
  original_name text not null,
  uploaded_at timestamptz default now()
);

create table if not exists comments (
  id bigserial primary key,
  tenant_id int not null default 1,
  job_id bigint references job_requests(id),
  step_id bigint references step_instances(id),
  author_id uuid not null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists role_permissions (
  id bigserial primary key,
  tenant_id int not null default 1,
  role text not null,
  resource text not null,
  action text not null,
  allow boolean default true
);

create table if not exists notification_preferences (
  id bigserial primary key,
  user_id uuid unique not null,
  email_on_assign boolean default true,
  email_on_status boolean default true,
  email_on_comment boolean default true
);

create table if not exists calendar_events (
  id bigserial primary key,
  tenant_id int not null default 1,
  job_id bigint references job_requests(id),
  step_id bigint references step_instances(id),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text default ''
);


create table if not exists audit_logs (
  id bigserial primary key,
  tenant_id int not null default 1,
  user_id uuid,
  model text not null,
  entity_id bigint not null,
  action text not null,
  field text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);
