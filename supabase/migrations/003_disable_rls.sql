-- ============================================================
-- 采购管理系统 — 禁用 RLS（本地开发环境）
-- 033: 本地开发环境无需行级安全策略，
-- 所有通过 Supabase Client 的操作可访问全部数据。
-- ============================================================

ALTER TABLE persons DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricings DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contract_entries DISABLE ROW LEVEL SECURITY;
