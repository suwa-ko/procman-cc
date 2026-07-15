-- 005_add_code_to_pricings.sql
-- pricings 表增加 code 列，支持定价编码（PRC-年份-流水号）

ALTER TABLE public.pricings
  ADD COLUMN code VARCHAR(50);

-- 唯一约束：编码不可重复
ALTER TABLE public.pricings
  ADD CONSTRAINT uq_pricings_code UNIQUE (code);
