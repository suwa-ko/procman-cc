-- ============================================================
-- 采购管理系统 — 种子数据
-- 在 DDL 迁移执行后运行
-- ============================================================

-- ====== 1. 人员 ======
INSERT INTO persons ("id", "name", "email", "department", "title") VALUES
  (gen_random_uuid(), '张三', 'zhangsan@ex.com', '采购部', '采购经理'),
  (gen_random_uuid(), '李四', 'lisi@ex.com', '采购部', '采购专员'),
  (gen_random_uuid(), '王五', 'wangwu@ex.com', '法务部', '法务经理'),
  (gen_random_uuid(), '赵六', 'zhaoliu@ex.com', '财务部', '财务主管'),
  (gen_random_uuid(), '孙七', 'sunqi@ex.com', '技术部', '技术总监');

-- ====== 2. 品类 ======
INSERT INTO categories ("id", "code", "name", "sortOrder") VALUES
  (gen_random_uuid(), 'CAT-001', '电子元器件', 1),
  (gen_random_uuid(), 'CAT-002', '机械设备', 2),
  (gen_random_uuid(), 'CAT-003', '办公用品', 3),
  (gen_random_uuid(), 'CAT-004', '化工原料', 4),
  (gen_random_uuid(), 'CAT-005', '包装材料', 5);

-- ====== 3. 物料（引用品类） ======
DO $$
DECLARE
  cat_elec UUID;
  cat_mach UUID;
  cat_offi UUID;
  cat_chem UUID;
  cat_pack UUID;
  mat_year INT := EXTRACT(YEAR FROM now())::INT;
  mat_seq  INT := 0;
BEGIN
  SELECT "id" INTO cat_elec FROM categories WHERE "code" = 'CAT-001';
  SELECT "id" INTO cat_mach FROM categories WHERE "code" = 'CAT-002';
  SELECT "id" INTO cat_offi FROM categories WHERE "code" = 'CAT-003';
  SELECT "id" INTO cat_chem FROM categories WHERE "code" = 'CAT-004';
  SELECT "id" INTO cat_pack FROM categories WHERE "code" = 'CAT-005';

  INSERT INTO materials ("id", "code", "name", "spec", "unit", "categoryId", "description", "status") VALUES
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 1), '电阻器 10KΩ', '0805 ±1%', '个', cat_elec, '贴片电阻', 'active'),
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 2), '电容器 100μF', '25V 铝电解', '个', cat_elec, '铝电解电容', 'active'),
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 3), 'STM32F407VET6', 'ARM Cortex-M4', '片', cat_elec, '微控制器', 'active'),
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 4), '步进电机 42BYGH', '1.8° 1.5A', '台', cat_mach, '两相步进电机', 'active'),
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 5), 'A4 复印纸', '70g 500张/包', '包', cat_offi, '办公用纸', 'active'),
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 6), '工业酒精', '99.7% 500ml', '瓶', cat_chem, '清洗用酒精', 'active'),
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 7), '纸箱 K3K', '400×300×200mm', '个', cat_pack, '三层瓦楞纸箱', 'active'),
    (gen_random_uuid(), format('MAT-%s-%04d', mat_year, 8), 'LED 灯珠', '5050 白光', '颗', cat_elec, 'SMD LED', 'active');
END $$;

-- ====== 4. 供应商 ======
DO $$
DECLARE
  sup_year INT := EXTRACT(YEAR FROM now())::INT;
BEGIN
  INSERT INTO suppliers ("id", "code", "name", "creditCode", "contactPerson", "contactPhone", "address", "status") VALUES
    (gen_random_uuid(), format('SUP-%s-%04d', sup_year, 1), '深圳华强电子有限公司', '91440300MA5D123456', '陈总', '0755-88886666', '深圳市福田区华强北路1002号', 'active'),
    (gen_random_uuid(), format('SUP-%s-%04d', sup_year, 2), '北京神州数码有限公司', '91110108MA7E123456', '刘经理', '010-66668888', '北京市海淀区中关村大街1号', 'active'),
    (gen_random_uuid(), format('SUP-%s-%04d', sup_year, 3), '上海晨光文具有限公司', '91310115MA1H123456', '周主管', '021-55552222', '上海市浦东新区张江高科技园区', 'active'),
    (gen_random_uuid(), format('SUP-%s-%04d', sup_year, 4), '广州化工集团有限公司', '91440101MA5C123456', '吴副总', '020-33339999', '广州市黄埔区石化路88号', 'frozen'),
    (gen_random_uuid(), format('SUP-%s-%04d', sup_year, 5), '成都精密机械厂', '91510100MA61X12345', '郑厂长', '028-77775555', '成都市高新区天府大道999号', 'active');
END $$;

-- ====== 5. 定价（关联供应商 + 物料） ======
DO $$
DECLARE
  s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID;
  m1 UUID; m2 UUID; m3 UUID; m4 UUID; m5 UUID; m6 UUID; m7 UUID; m8 UUID;
BEGIN
  SELECT "id" INTO s1 FROM suppliers WHERE "name" = '深圳华强电子有限公司';
  SELECT "id" INTO s2 FROM suppliers WHERE "name" = '北京神州数码有限公司';
  SELECT "id" INTO s3 FROM suppliers WHERE "name" = '上海晨光文具有限公司';
  SELECT "id" INTO s4 FROM suppliers WHERE "name" = '广州化工集团有限公司';
  SELECT "id" INTO s5 FROM suppliers WHERE "name" = '成都精密机械厂';

  SELECT "id" INTO m1 FROM materials WHERE "name" = '电阻器 10KΩ';
  SELECT "id" INTO m2 FROM materials WHERE "name" = '电容器 100μF';
  SELECT "id" INTO m3 FROM materials WHERE "name" = 'STM32F407VET6';
  SELECT "id" INTO m4 FROM materials WHERE "name" = '步进电机 42BYGH';
  SELECT "id" INTO m5 FROM materials WHERE "name" = 'A4 复印纸';
  SELECT "id" INTO m6 FROM materials WHERE "name" = '工业酒精';
  SELECT "id" INTO m7 FROM materials WHERE "name" = '纸箱 K3K';
  SELECT "id" INTO m8 FROM materials WHERE "name" = 'LED 灯珠';

  INSERT INTO pricings ("id", "supplierId", "materialId", "unitPrice", "currency", "status") VALUES
    (gen_random_uuid(), s1, m1, 0.05, 'CNY', 'active'),
    (gen_random_uuid(), s1, m2, 0.30, 'CNY', 'active'),
    (gen_random_uuid(), s1, m8, 0.12, 'CNY', 'active'),
    (gen_random_uuid(), s2, m3, 45.00, 'CNY', 'active'),
    (gen_random_uuid(), s2, m4, 120.00, 'CNY', 'active'),
    (gen_random_uuid(), s3, m5, 25.00, 'CNY', 'active'),
    (gen_random_uuid(), s4, m6, 8.50, 'CNY', 'active'),
    (gen_random_uuid(), s5, m7, 2.00, 'CNY', 'active');
END $$;

-- ====== 6. 模板 ======
DO $$
DECLARE
  tpl_year INT := EXTRACT(YEAR FROM now())::INT;
BEGIN
  INSERT INTO templates ("id", "code", "name", "contractType", "htmlContent", "variables", "enabled") VALUES
    (
      gen_random_uuid(),
      format('TPL-%s-%04d', tpl_year, 1),
      '通用采购合同模板',
      'purchase_contract',
      $tmpl$<!-- 合同编号 -->
<div class="contract-no-line">
  <span class="label">合同编号：</span><span class="value">{{contract.code}}</span>
</div>

<h1>多物品采购合同</h1>

<div class="signing-info">
  <span>签订日期：{{date contract.effectiveDate}}</span>
  <span>签订地点：{{default contract.content.signingPlace "四川省成都市"}}</span>
</div>

<div class="preamble">
  <p>
    本合同由以下双方经友好协商，依据《中华人民共和国民法典》及相关法律法规，就甲方向乙方采购物品事宜达成一致，以资共同信守。
  </p>
</div>

<table class="party-info-table">
  <tr>
    <td class="label-col">甲方（采购方）</td>
    <td class="value-col"><p>{{default contract.companyName "（采购方名称）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">法定代表人</td>
    <td class="value-col"><p>{{default contract.handlerName "（法定代表人）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">地址</td>
    <td class="value-col"><p>{{default contract.content.companyAddress "（采购方地址）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">联系人</td>
    <td class="value-col"><p>{{default contract.content.companyContact "（甲方联系人）"}}</p></td>
  </tr>
  <tr class="party-sep">
    <td class="label-col">乙方（供应方）</td>
    <td class="value-col"><p>{{default contract.content.supplierName "（供应方名称）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">联系人</td>
    <td class="value-col"><p>{{default contract.content.supplierContact "（联系人）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">联系电话</td>
    <td class="value-col"><p>{{default contract.content.supplierPhone "（联系电话）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">开户银行</td>
    <td class="value-col"><p>{{default contract.content.supplierBank "（开户银行）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">银行账号</td>
    <td class="value-col"><p>{{default contract.content.supplierAccount "（银行账号）"}}</p></td>
  </tr>
</table>

<div class="section">
  <h2>第一条&emsp;采购标的</h2>
  <p>甲方向乙方采购以下物品，具体明细如下表：</p>

  <table class="purchase-table">
    <thead>
      <tr>
        <th class="col-seq">序号</th>
        <th class="col-name">物品名称</th>
        <th class="col-spec">规格型号</th>
        <th class="col-price">单价（元）</th>
        <th class="col-qty">数量</th>
        <th class="col-unit">单位</th>
        <th class="col-total">总价（元）</th>
      </tr>
    </thead>
    <tbody>
      {{#each contract.entries}}
      <tr>
        <td class="col-seq">{{inc @index}}</td>
        <td class="col-name">{{materialName}}</td>
        <td class="col-spec">{{default spec "-"}}</td>
        <td class="col-price">{{currency unitPrice}}</td>
        <td class="col-qty">{{quantity}}</td>
        <td class="col-unit">{{unit}}</td>
        <td class="col-total">{{currency totalPrice}}</td>
      </tr>
      {{/each}}
      <tr class="total-row">
        <td colspan="6" class="text-right"><strong>合计总金额（人民币元）</strong></td>
        <td class="col-total">{{currency contract.totalAmount}}</td>
      </tr>
    </tbody>
  </table>

  <p>
    以上合计总金额为人民币 <strong>{{currency contract.totalAmount}}</strong> 元。
    {{#if contract.content.amountInWords}}
    大写：{{contract.content.amountInWords}}。
    {{/if}}
  </p>
</div>

<div class="section">
  <h2>第二条&emsp;质量标准</h2>
  <p>
    {{default contract.content.qualityClause "乙方所提供的物品应符合国家相关质量标准、行业标准及双方确认的技术规格要求。"}}
  </p>
</div>

<div class="section">
  <h2>第三条&emsp;交付与运输</h2>
  <p><span class="clause-num">3.1 </span>交付时间：{{default contract.content.deliveryClause "乙方应在合同生效后按双方约定时间完成交付。"}}</p>
  <p><span class="clause-num">3.2 </span>交付地点：{{default contract.content.deliveryLocation "甲方指定地点。"}}</p>
  <p><span class="clause-num">3.3 </span>运输方式及费用承担：{{default contract.content.transportClause "由乙方负责运输至交付地点，运输费用由乙方承担。"}}</p>
</div>

<div class="section">
  <h2>第四条&emsp;验收</h2>
  <p>{{default contract.content.acceptanceClause "甲方应在收到货物后于合理期限内按照本合同约定的质量标准进行验收。"}}</p>
</div>

<div class="section">
  <h2>第五条&emsp;付款方式</h2>
  <p>{{default contract.content.paymentClause "双方协商确定付款方式及期限。"}}</p>
</div>

<div class="section">
  <h2>第六条&emsp;违约责任</h2>
  <p>{{default contract.content.liabilityClause "若一方违反本合同约定，应承担相应的违约责任并赔偿对方因此遭受的损失。"}}</p>
</div>

{{#if contract.content.additionalClause}}
<div class="section">
  <h2>第七条&emsp;补充条款</h2>
  <p>{{contract.content.additionalClause}}</p>
</div>
{{/if}}

<div class="section">
  <h2>合同期限</h2>
  <p>本合同有效期自 <strong>{{date contract.effectiveDate}}</strong> 起至 <strong>{{date contract.expirationDate}}</strong> 止。</p>
</div>

<div class="section">
  <h2>争议解决</h2>
  <p>{{default contract.content.disputeClause "因本合同引起的争议，双方应首先协商解决；协商不成的，任何一方均有权向甲方所在地法院提起诉讼。"}}</p>
</div>

<div class="section">
  <h2>其他约定</h2>
  <p>本合同一式贰份，甲乙双方各执壹份，具有同等法律效力。</p>
  <p>本合同自双方签字盖章之日起生效。</p>
</div>

<div class="signature">
  <table class="signature-table">
    <tr>
      <td>
        <p class="sig-party">甲方（盖章）</p>
        <p class="sig-line">{{default contract.companyName "采购方"}}</p>
        <p class="sig-line">法定代表人/授权代表（签字）：</p>
        <p class="sig-line">日期：&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日</p>
      </td>
      <td>
        <p class="sig-party">乙方（盖章）</p>
        <p class="sig-line">{{default contract.content.supplierName "供应方"}}</p>
        <p class="sig-line">法定代表人/授权代表（签字）：</p>
        <p class="sig-line">日期：&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日</p>
      </td>
    </tr>
  </table>
</div>$tmpl$,
      '{}',
      true
    ),
    (
      gen_random_uuid(),
      format('TPL-%s-%04d', tpl_year, 2),
      '保密协议模板',
      'nda',
      $tmpl$<!-- 合同编号 -->
<div class="contract-no-line">
  <span class="label">合同编号：</span><span class="value">{{contract.code}}</span>
</div>

<h1>保密协议</h1>

<div class="signing-info">
  <span>签订日期：{{date contract.effectiveDate}}</span>
  <span>签订地点：{{default contract.content.signingPlace "四川省成都市"}}</span>
</div>

<div class="preamble">
  <p>
    本保密协议由以下双方经协商一致，依据《中华人民共和国民法典》《反不正当竞争法》等相关法律法规，就保密信息保护事宜达成如下协议。
  </p>
</div>

<table class="party-info-table">
  <tr>
    <td class="label-col">甲方（披露方）</td>
    <td class="value-col"><p>{{default contract.companyName "（甲方公司名称）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">法定代表人</td>
    <td class="value-col"><p>{{default contract.handlerName "（法定代表人）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">地址</td>
    <td class="value-col"><p>{{default contract.content.companyAddress "（甲方地址）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">联系人</td>
    <td class="value-col"><p>{{default contract.content.companyContact "（甲方联系人）"}}</p></td>
  </tr>
  <tr class="party-sep">
    <td class="label-col">乙方（接收方）</td>
    <td class="value-col"><p>{{default contract.content.supplierName "（乙方名称）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">联系人</td>
    <td class="value-col"><p>{{default contract.content.supplierContact "（乙方联系人）"}}</p></td>
  </tr>
  <tr>
    <td class="label-col">联系电话</td>
    <td class="value-col"><p>{{default contract.content.supplierPhone "（联系电话）"}}</p></td>
  </tr>
</table>

<div class="section">
  <h2>第一条&emsp;保密信息定义</h2>
  <p>1.1 "保密信息"是指一方向另一方披露的与本协议目的相关的所有非公开信息。</p>
  <p>1.2 包括但不限于：技术资料、商业计划、客户信息、供应商信息、财务数据、定价信息、合同条款等。</p>
</div>

<div class="section">
  <h2>第二条&emsp;保密义务</h2>
  <p>2.1 接收方同意对披露方的保密信息予以严格保密，未经书面同意不得向任何第三方披露。</p>
  <p>2.2 接收方仅可为履行本协议目的向有必要知悉的员工披露，且应确保其遵守保密义务。</p>
</div>

<div class="section">
  <h2>第三条&emsp;保密期限</h2>
  <p>本协议项下的保密义务自签署之日起生效，协议终止后保密义务仍持续有效。</p>
</div>

<div class="section">
  <h2>第四条&emsp;例外情形</h2>
  <p>4.1 披露时已为公众所知悉的信息；4.2 非因接收方过错进入公有领域的信息；4.3 接收方在披露前已合法持有的信息。</p>
</div>

<div class="section">
  <h2>第五条&emsp;违约责任</h2>
  <p>{{default contract.content.liabilityClause "若接收方违反保密义务，应赔偿披露方因此遭受的全部损失。"}}</p>
</div>

<div class="section">
  <h2>第六条&emsp;适用法律与争议解决</h2>
  <p>{{default contract.content.governingLaw "本协议的订立、效力、解释、履行及争议解决均适用中华人民共和国法律。"}}</p>
</div>

<div class="section">
  <h2>其他约定</h2>
  <p>本协议一式贰份，双方各执壹份，具有同等法律效力。</p>
  <p>本协议自双方签字盖章之日起生效。</p>
</div>

<div class="signature">
  <table class="signature-table">
    <tr>
      <td>
        <p class="sig-party">甲方（盖章）</p>
        <p class="sig-line">{{default contract.companyName "披露方"}}</p>
        <p class="sig-line">法定代表人/授权代表（签字）：</p>
        <p class="sig-line">日期：&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日</p>
      </td>
      <td>
        <p class="sig-party">乙方（盖章）</p>
        <p class="sig-line">{{default contract.content.supplierName "接收方"}}</p>
        <p class="sig-line">法定代表人/授权代表（签字）：</p>
        <p class="sig-line">日期：&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日</p>
      </td>
    </tr>
  </table>
</div>$tmpl$,
      '{}',
      true
    );
END $$;

-- ====== 7. 合同 + 条目 ======
DO $$
DECLARE
  s_elec UUID; s_offi UUID; s_mach UUID;
  p1 UUID; p2 UUID;
  t1 UUID;
  mat_res UUID; mat_cap UUID; mat_led UUID; mat_pap UUID; mat_mot UUID;
  ctt_year INT := EXTRACT(YEAR FROM now())::INT;
  c1 UUID; c2 UUID; c3 UUID;
BEGIN
  SELECT "id" INTO s_elec FROM suppliers WHERE "name" = '深圳华强电子有限公司';
  SELECT "id" INTO s_offi FROM suppliers WHERE "name" = '上海晨光文具有限公司';
  SELECT "id" INTO s_mach FROM suppliers WHERE "name" = '成都精密机械厂';

  SELECT "id" INTO p1 FROM persons WHERE "name" = '张三';
  SELECT "id" INTO p2 FROM persons WHERE "name" = '李四';

  SELECT "id" INTO t1 FROM templates WHERE "name" = '通用采购合同模板';

  SELECT "id" INTO mat_res FROM materials WHERE "name" = '电阻器 10KΩ';
  SELECT "id" INTO mat_cap FROM materials WHERE "name" = '电容器 100μF';
  SELECT "id" INTO mat_led FROM materials WHERE "name" = 'LED 灯珠';
  SELECT "id" INTO mat_pap FROM materials WHERE "name" = 'A4 复印纸';
  SELECT "id" INTO mat_mot FROM materials WHERE "name" = '步进电机 42BYGH';

  -- 合同1：电子元器件采购
  INSERT INTO contracts ("id", "code", "name", "type", "supplierId", "handlerId", "handlerName", "templateId", "content", "totalAmount", "status")
  VALUES (gen_random_uuid(), format('CTT-%s-%04d', ctt_year, 1), '电子元器件采购合同', 'purchase_contract', s_elec, p1, '张三', t1, '{"signingPlace":"深圳市"}'::jsonb, 350000, 'effective')
  RETURNING "id" INTO c1;

  INSERT INTO contract_entries ("id", "contractId", "materialId", "materialName", "spec", "unitPrice", "quantity", "unit", "totalPrice", "sortOrder") VALUES
    (gen_random_uuid(), c1, mat_res, '电阻器 10KΩ', '0805 ±1%', 0.05, 1000000, '个', 50000, 1),
    (gen_random_uuid(), c1, mat_cap, '电容器 100μF', '25V 铝电解', 0.30, 500000, '个', 150000, 2),
    (gen_random_uuid(), c1, mat_led, 'LED 灯珠', '5050 白光', 0.12, 1250000, '颗', 150000, 3);

  -- 合同2：办公用纸采购
  INSERT INTO contracts ("id", "code", "name", "type", "supplierId", "handlerId", "handlerName", "templateId", "content", "totalAmount", "status")
  VALUES (gen_random_uuid(), format('CTT-%s-%04d', ctt_year, 2), 'A4 复印纸年度采购', 'purchase_contract', s_offi, p2, '李四', t1, '{"signingPlace":"上海市"}'::jsonb, 50000, 'draft')
  RETURNING "id" INTO c2;

  INSERT INTO contract_entries ("id", "contractId", "materialId", "materialName", "spec", "unitPrice", "quantity", "unit", "totalPrice", "sortOrder") VALUES
    (gen_random_uuid(), c2, mat_pap, 'A4 复印纸', '70g 500张/包', 25.00, 2000, '包', 50000, 1);

  -- 合同3：步进电机
  INSERT INTO contracts ("id", "code", "name", "type", "supplierId", "handlerId", "handlerName", "templateId", "content", "totalAmount", "status")
  VALUES (gen_random_uuid(), format('CTT-%s-%04d', ctt_year, 3), '步进电机采购合同', 'purchase_contract', s_mach, p1, '张三', t1, '{"signingPlace":"成都市"}'::jsonb, 120000, 'draft')
  RETURNING "id" INTO c3;

  INSERT INTO contract_entries ("id", "contractId", "materialId", "materialName", "spec", "unitPrice", "quantity", "unit", "totalPrice", "sortOrder") VALUES
    (gen_random_uuid(), c3, mat_mot, '步进电机 42BYGH', '1.8° 1.5A', 120.00, 1000, '台', 120000, 1);
END $$;
