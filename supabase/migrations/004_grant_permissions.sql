-- 004_grant_permissions.sql
-- 授予 CRUD 权限：anon / authenticated / service_role 能通过 PostgREST 读写表
-- 处于本地开发阶段，RLS 已禁用，仍需显式授予 DML 权限

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_entries TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.persons TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO anon, authenticated, service_role;
