-- ============================================================
-- 采购管理系统 — 数据库初始化 DDL
-- 引擎：PostgreSQL（Supabase）
-- 编码：UTF-8
-- 注意：列名使用 camelCase，与 TS 实体字段保持一致，消除 ORM 映射层
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. 人员表（主数据来自外部系统，本表存冗余）
-- ============================================================
CREATE TABLE IF NOT EXISTS persons (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"      VARCHAR(100)  NOT NULL,
  "email"     VARCHAR(200),
  "department" VARCHAR(100),
  "title"     VARCHAR(100),
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE persons IS '人员主数据（来自外部系统同步）';

-- ============================================================
-- 2. 品类表
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"      VARCHAR(50),                     -- 手动输入，可选
  "name"      VARCHAR(200)  NOT NULL,
  "parentId"  UUID          REFERENCES categories("id"),
  "sortOrder" INT           NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_code
  ON categories("code") WHERE "code" IS NOT NULL;

COMMENT ON TABLE categories IS '物料品类';

-- ============================================================
-- 3. 物料表
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"        VARCHAR(50)   NOT NULL UNIQUE,  -- 系统生成：MAT-YYYY-0001
  "name"        VARCHAR(200)  NOT NULL,
  "spec"        VARCHAR(200),
  "unit"        VARCHAR(50)   NOT NULL,
  "categoryId"  UUID          NOT NULL REFERENCES categories("id"),
  "description" TEXT,
  "status"      VARCHAR(20)   NOT NULL DEFAULT 'active',
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE materials IS '物料';

-- ============================================================
-- 4. 供应商表
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"           VARCHAR(50)   NOT NULL UNIQUE,  -- 系统生成：SUP-YYYY-0001
  "name"           VARCHAR(200)  NOT NULL,
  "creditCode"     CHAR(18),
  "contactPerson"  VARCHAR(100),
  "contactPhone"   VARCHAR(30),
  "contactEmail"   VARCHAR(200),
  "address"        TEXT,
  "businessScope"  TEXT,
  "status"         VARCHAR(20)   NOT NULL DEFAULT 'active',
  "remark"         TEXT,
  "createdAt"      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE suppliers IS '供应商';

-- ============================================================
-- 5. 定价表
-- ============================================================
CREATE TABLE IF NOT EXISTS pricings (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "supplierId" UUID          NOT NULL REFERENCES suppliers("id"),
  "materialId" UUID          NOT NULL REFERENCES materials("id"),
  "unitPrice"  NUMERIC(10,2) NOT NULL CHECK ("unitPrice" > 0),
  "currency"   VARCHAR(10)   NOT NULL DEFAULT 'CNY',
  "status"     VARCHAR(20)   NOT NULL DEFAULT 'active',
  "remark"     TEXT,
  "createdAt"  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE pricings IS '供应商物料定价';

-- ============================================================
-- 6. 合同模板表
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"         VARCHAR(50)   NOT NULL UNIQUE,  -- 系统生成：TPL-YYYY-0001
  "name"         VARCHAR(200)  NOT NULL,
  "contractType" VARCHAR(50)   NOT NULL,         -- nda | purchase_contract
  "htmlContent"  TEXT          NOT NULL,
  "variables"    JSONB         NOT NULL DEFAULT '{}',
  "enabled"      BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE templates IS '合同模板';

-- ============================================================
-- 7. 合同主表
-- ============================================================
CREATE TABLE IF NOT EXISTS contracts (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"            VARCHAR(50)     NOT NULL UNIQUE,  -- 系统生成：CTT-YYYY-0001
  "name"            VARCHAR(300)    NOT NULL,
  "type"            VARCHAR(50)     NOT NULL,         -- nda | purchase_contract
  "supplierId"      UUID            NOT NULL REFERENCES suppliers("id"),
  "handlerId"       VARCHAR(100)    NOT NULL,
  "handlerName"     VARCHAR(100)    NOT NULL,
  "templateId"      UUID            NOT NULL REFERENCES templates("id"),
  "content"         JSONB           NOT NULL DEFAULT '{}',
  "totalAmount"     NUMERIC(12,2),
  "effectiveDate"   DATE,
  "expirationDate"  DATE,
  "status"          VARCHAR(20)     NOT NULL DEFAULT 'draft',
  "companyName"     VARCHAR(200),
  "signDate"        DATE,
  "signedFilePath"  TEXT,
  "remark"          TEXT,
  "createdAt"       TIMESTAMPTZ     NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE contracts IS '合同主表';

-- ============================================================
-- 8. 合同采购条目表
-- ============================================================
CREATE TABLE IF NOT EXISTS contract_entries (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contractId"    UUID            NOT NULL REFERENCES contracts("id") ON DELETE CASCADE,
  "materialId"    UUID            NOT NULL REFERENCES materials("id"),
  "materialName"  VARCHAR(200)    NOT NULL,
  "spec"          VARCHAR(200),
  "unitPrice"     NUMERIC(10,2)   NOT NULL CHECK ("unitPrice" > 0),
  "quantity"      NUMERIC(10,2)   NOT NULL CHECK ("quantity" > 0),
  "unit"          VARCHAR(50)     NOT NULL,
  "totalPrice"    NUMERIC(12,2)   NOT NULL,
  "sortOrder"     INT             NOT NULL DEFAULT 0,
  "remark"        TEXT,
  "createdAt"     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE contract_entries IS '合同采购条目';

-- ============================================================
-- 索引
-- ============================================================

CREATE INDEX idx_suppliers_status ON suppliers("status");
CREATE INDEX idx_suppliers_name   ON suppliers("name");

CREATE INDEX idx_materials_status      ON materials("status");
CREATE INDEX idx_materials_category_id ON materials("categoryId");
CREATE INDEX idx_materials_name        ON materials("name");

CREATE INDEX idx_categories_parent_id ON categories("parentId");

CREATE INDEX idx_pricings_supplier_id ON pricings("supplierId");
CREATE INDEX idx_pricings_material_id ON pricings("materialId");
CREATE INDEX idx_pricings_status      ON pricings("status");
-- 唯一有效定价约束：同一供应商-物料组合仅允许一条有效定价
CREATE UNIQUE INDEX idx_pricings_active_unique
  ON pricings("supplierId", "materialId") WHERE "status" = 'active';

CREATE INDEX idx_contracts_status      ON contracts("status");
CREATE INDEX idx_contracts_supplier_id ON contracts("supplierId");
CREATE INDEX idx_contracts_type        ON contracts("type");

CREATE INDEX idx_contract_entries_contract_id ON contract_entries("contractId");

CREATE INDEX idx_templates_contract_type ON templates("contractType");
CREATE INDEX idx_templates_enabled       ON templates("enabled");

-- ============================================================
-- updatedAt 自动触发器
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_persons_updated_at
  BEFORE UPDATE ON persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_materials_updated_at
  BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_pricings_updated_at
  BEFORE UPDATE ON pricings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contract_entries_updated_at
  BEFORE UPDATE ON contract_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
