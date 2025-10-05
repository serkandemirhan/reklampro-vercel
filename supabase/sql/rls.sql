
-- Enable RLS
alter table customers enable row level security;
alter table process_templates enable row level security;
alter table job_requests enable row level security;
alter table step_instances enable row level security;
alter table step_logs enable row level security;
alter table file_assets enable row level security;
alter table comments enable row level security;
alter table role_permissions enable row level security;
alter table notification_preferences enable row level security;
alter table calendar_events enable row level security;
alter table audit_logs enable row level security;

-- Helper function to read tenant from JWT
create or replace function auth.tenant_id() returns int language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'tenant_id')::int, 0);
$$;

-- Policies (restrict by tenant_id = token tenant)
create policy tenant_customers on customers for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_process_templates on process_templates for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_job_requests on job_requests for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_step_instances on step_instances for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_step_logs on step_logs for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_file_assets on file_assets for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_comments on comments for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_role_permissions on role_permissions for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_calendar_events on calendar_events for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());
create policy tenant_audit_logs on audit_logs for all using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id());

-- notification_preferences are per-user, allow only the owner
create policy notif_prefs_owner on notification_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
