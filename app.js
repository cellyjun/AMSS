/* =========================================================
   IT 应用资产管理系统 - 前端预览（纯前端原型，数据为演示数据）
   ========================================================= */

/* ---------------------- 演示数据 ---------------------- */
const DOMAINS = ["零售业务", "供应链", "财务共享", "客户服务", "人力资源", "数据平台"];
const OWNERS = ["张明", "李婷", "王建国", "陈晓东", "刘洋", "赵倩", "孙磊", "周薇"];
const TECHS = ["Spring Boot", "Node.js", "React", "Vue", "Oracle", "MySQL", "Redis", "Kafka"];
const STATUS = { draft: "草稿", online: "运行中", change: "变更中", paused: "暂停", retired: "已退役" };
const STATUS_CLASS = { draft: "gray", online: "green", change: "amber", paused: "gray", retired: "red" };
const IMPORTANCE = { core: "核心", important: "重要", normal: "一般" };
const IMPORTANCE_CLASS = { core: "core", important: "important", normal: "normal" };

const APPS = [
  { id: "APP-1001", name: "会员中心", owner: "李婷", domain: "零售业务", status: "online", importance: "core", tech: "Spring Boot", deploy: "容器化(K8s)", online: "2019-03-12", users: "120万", desc: "统一会员注册、积分与等级权益管理。", license: "已购", cost: 486, cloud: "阿里云", vendor: "自研" },
  { id: "APP-1002", name: "订单中台", owner: "王建国", domain: "供应链", status: "online", importance: "core", tech: "Java", deploy: "容器化(K8s)", online: "2018-07-01", users: "全渠道", desc: "全渠道订单聚合、拆单与履约调度。", license: "已购", cost: 732, cloud: "阿里云", vendor: "自研" },
  { id: "APP-1003", name: "商品主数据", owner: "陈晓东", domain: "供应链", status: "change", importance: "important", tech: "Spring Boot", deploy: "虚机", online: "2020-11-20", users: "1500+", desc: "商品主数据统一维护与分发。", license: "已购", cost: 214, cloud: "私有云", vendor: "自研" },
  { id: "APP-1004", name: "支付网关", owner: "张明", domain: "财务共享", status: "online", importance: "core", tech: "Go", deploy: "容器化(K8s)", online: "2017-05-30", users: "全渠道", desc: "聚合支付、渠道路由与对账。", license: "已购", cost: 655, cloud: "阿里云", vendor: "自研" },
  { id: "APP-1005", name: "客服工单系统", owner: "刘洋", domain: "客户服务", status: "online", importance: "important", tech: "Vue + Node.js", deploy: "容器化(K8s)", online: "2021-02-18", users: "3000+", desc: "客户工单受理、流转与满意度回访。", license: "已购", cost: 178, cloud: "腾讯云", vendor: "采购" },
  { id: "APP-1006", name: "人力资源门户", owner: "赵倩", domain: "人力资源", status: "paused", importance: "normal", tech: "Java", deploy: "虚机", online: "2016-09-05", users: "8000+", desc: "员工自助、考勤与薪酬查询。", license: "待续费", cost: 96, cloud: "私有云", vendor: "采购" },
  { id: "APP-1007", name: "数据资产平台", owner: "孙磊", domain: "数据平台", status: "online", importance: "core", tech: "Scala + Flink", deploy: "容器化(K8s)", online: "2020-06-15", users: "500+", desc: "指标口径管理、数据服务与资产地图。", license: "已购", cost: 540, cloud: "阿里云", vendor: "自研" },
  { id: "APP-1008", name: "营销活动引擎", owner: "周薇", domain: "零售业务", status: "change", importance: "important", tech: "Spring Boot", deploy: "容器化(K8s)", online: "2021-08-22", users: "全渠道", desc: "大促活动配置、优惠券与秒杀。", license: "已购", cost: 322, cloud: "阿里云", vendor: "自研" },
  { id: "APP-1009", name: "财务核算系统", owner: "张明", domain: "财务共享", status: "online", importance: "important", tech: "Java", deploy: "虚机", online: "2015-04-10", users: "600+", desc: "总账、应收应付与月结。", license: "已购", cost: 268, cloud: "私有云", vendor: "采购" },
  { id: "APP-1010", name: "供应商协同", owner: "王建国", domain: "供应链", status: "online", importance: "normal", tech: "Vue + Java", deploy: "容器化(K8s)", online: "2022-03-01", users: "2000+", desc: "供应商入驻、资质与对账协同。", license: "已购", cost: 142, cloud: "腾讯云", vendor: "采购" },
  { id: "APP-1011", name: "旧版商城前台", owner: "李婷", domain: "零售业务", status: "retired", importance: "normal", tech: "PHP", deploy: "虚机", online: "2014-06-01", users: "—", desc: "已被新版小程序商城替代，待下线归档。", license: "停用", cost: 38, cloud: "私有云", vendor: "自研" },
  { id: "APP-1012", name: "统一身份认证 IAM", owner: "陈晓东", domain: "数据平台", status: "online", importance: "core", tech: "Java", deploy: "容器化(K8s)", online: "2018-12-12", users: "全集团", desc: "单点登录、权限模型与审计。", license: "已购", cost: 401, cloud: "阿里云", vendor: "自研" },
  { id: "APP-1013", name: "电子发票平台", owner: "赵倩", domain: "财务共享", status: "draft", importance: "normal", tech: "Spring Boot", deploy: "容器化(K8s)", online: "—", users: "全渠道", desc: "开票、红冲与税务对接。", license: "未购", cost: 55, cloud: "阿里云", vendor: "采购" },
  { id: "APP-1014", name: "物流轨迹服务", owner: "孙磊", domain: "供应链", status: "online", importance: "normal", tech: "Node.js", deploy: "容器化(K8s)", online: "2021-11-09", users: "全渠道", desc: "承运商对接与物流轨迹查询。", license: "已购", cost: 87, cloud: "腾讯云", vendor: "自研" },
  { id: "APP-1015", name: "智能推荐引擎", owner: "周薇", domain: "数据平台", status: "online", importance: "important", tech: "Python + TensorFlow", deploy: "容器化(K8s)", online: "2022-09-18", users: "全渠道", desc: "千人千面商品与内容推荐。", license: "已购", cost: 359, cloud: "阿里云", vendor: "自研" }
];

/* 应用资产台账 - 详情扩展信息（产品线 / 上下游拓扑 / 输入输出数据 / 核心模块 / 价值定位 / 用户群） */
const APP_DETAILS = {
  "APP-1001": {
    productLine: "会员产品线",
    upstream: ["小程序商城", "移动 App", "线下 POS"],
    downstream: ["订单中台", "营销活动引擎", "数据资产平台"],
    inputData: [
      { name: "会员注册信息", from: "小程序商城 / 移动 App" },
      { name: "积分变动流水", from: "营销活动引擎" },
      { name: "支付结果", from: "支付网关" }
    ],
    outputData: [
      { name: "会员主数据", to: "订单中台 / 数据资产平台" },
      { name: "会员等级与权益", to: "营销活动引擎" }
    ],
    modules: [
      { name: "统一注册登录", desc: "支持手机号、微信、企业账号等多方式注册与单点登录" },
      { name: "等级权益", desc: "会员成长值计算、等级升降与权益自动发放" },
      { name: "积分管理", desc: "积分获取、消耗、冻结与对账" },
      { name: "标签画像", desc: "会员标签维护与画像基础数据输出" }
    ],
    value: "企业会员统一入口与会员资产沉淀平台，支撑精准营销与复购提升。",
    users: "C 端会员 120 万+、运营人员 200+"
  },
  "APP-1002": {
    productLine: "交易产品线",
    upstream: ["小程序商城", "移动 App", "电商后台"],
    downstream: ["支付网关", "商品主数据", "物流轨迹服务", "数据资产平台"],
    inputData: [
      { name: "下单请求", from: "前端各渠道" },
      { name: "商品信息", from: "商品主数据" },
      { name: "库存数据", from: "仓储系统" }
    ],
    outputData: [
      { name: "订单主数据", to: "数据资产平台" },
      { name: "支付单", to: "支付网关" },
      { name: "履约指令", to: "物流轨迹服务" }
    ],
    modules: [
      { name: "订单聚合", desc: "多渠道路由与订单统一接入" },
      { name: "拆单合单", desc: "按仓库 / 商家 / 履约能力拆分与合并" },
      { name: "履约调度", desc: "履约状态跟踪与异常处理" },
      { name: "订单查询", desc: "订单检索、对账与售后支撑" }
    ],
    value: "全渠道交易中枢，保障订单一致性与履约效率，是业务增长的交易底座。",
    users: "消费者全渠道、运营/客服 3000+"
  },
  "APP-1003": {
    productLine: "供应链产品线",
    upstream: ["供应商协同", "电商后台"],
    downstream: ["订单中台", "营销活动引擎", "数据资产平台"],
    inputData: [
      { name: "商品建档信息", from: "供应商协同" },
      { name: "类目属性标准", from: "主数据标准" }
    ],
    outputData: [
      { name: "商品主数据", to: "订单中台 / 营销活动引擎 / 前端" }
    ],
    modules: [
      { name: "商品建档", desc: "商品基础信息与生命周期维护" },
      { name: "类目属性管理", desc: "类目树与销售属性、规格属性维护" },
      { name: "多规格多单位", desc: "多规格 SKU 与计量单位换算" },
      { name: "数据分发", desc: "商品主数据对外统一分发与订阅" }
    ],
    value: "商品单一可信数据源（SSOT），保障全渠道商品信息一致性。",
    users: "采购/商品运营 1500+"
  },
  "APP-1004": {
    productLine: "支付产品线",
    upstream: ["订单中台", "小程序商城"],
    downstream: ["财务核算系统", "数据资产平台"],
    inputData: [
      { name: "支付请求", from: "订单中台" },
      { name: "渠道对账文件", from: "银行 / 第三方支付" }
    ],
    outputData: [
      { name: "支付结果", to: "订单中台" },
      { name: "交易流水", to: "财务核算系统 / 数据资产平台" }
    ],
    modules: [
      { name: "渠道路由", desc: "多渠道支付路由与降级容错" },
      { name: "聚合支付", desc: "统一支付、退款与查询接口" },
      { name: "对账清算", desc: "自动对账、差错处理与清算" },
      { name: "风控拦截", desc: "实时交易风控与限额控制" }
    ],
    value: "统一支付入口，保障资金安全、交易稳定与对账准确。",
    users: "消费者全渠道、财务人员 600+"
  },
  "APP-1005": {
    productLine: "客服产品线",
    upstream: ["小程序商城", "会员中心", "订单中台"],
    downstream: ["数据资产平台"],
    inputData: [
      { name: "客户工单", from: "前端 / 会员中心 / 订单中台" },
      { name: "客户信息", from: "会员中心" }
    ],
    outputData: [
      { name: "服务质量数据", to: "数据资产平台" }
    ],
    modules: [
      { name: "工单受理", desc: "多入口工单统一受理与建单" },
      { name: "智能分派", desc: "按技能组与负载智能分派" },
      { name: "流转跟踪", desc: "工单流转、升级与超时提醒" },
      { name: "满意度回访", desc: "结单回访与满意度评价" }
    ],
    value: "提升客户问题解决效率与满意度，沉淀服务数据反哺体验优化。",
    users: "客服坐席 3000+、C 端用户"
  },
  "APP-1006": {
    productLine: "人力产品线",
    upstream: ["统一身份认证 IAM"],
    downstream: [],
    inputData: [
      { name: "员工主数据", from: "HR 系统" },
      { name: "考勤数据", from: "门禁 / 打卡系统" }
    ],
    outputData: [
      { name: "人力报表", to: "数据资产平台" }
    ],
    modules: [
      { name: "员工自助", desc: "个人信息、证明打印等自助服务" },
      { name: "考勤管理", desc: "考勤统计、请假与加班管理" },
      { name: "薪酬查询", desc: "工资单查询与历史明细" },
      { name: "流程审批", desc: "人事流程在线审批" }
    ],
    value: "提升 HR 服务效率与员工自助体验，降低人事事务成本。",
    users: "集团员工 8000+"
  },
  "APP-1007": {
    productLine: "数据产品线",
    upstream: ["订单中台", "会员中心", "支付网关", "营销活动引擎"],
    downstream: ["智能推荐引擎", "经营分析平台"],
    inputData: [
      { name: "业务系统数据", from: "订单 / 会员 / 支付 / 营销等系统" }
    ],
    outputData: [
      { name: "统一指标口径", to: "各业务域" },
      { name: "数据服务 API", to: "前端 / 应用" },
      { name: "数据资产地图", to: "数据治理方" }
    ],
    modules: [
      { name: "指标管理", desc: "指标定义、口径与血缘管理" },
      { name: "数据服务", desc: "数据 API 发布与订阅" },
      { name: "资产地图", desc: "数据资产目录与检索" },
      { name: "血缘分析", desc: "数据加工血缘与影响分析" }
    ],
    value: "统一数据口径与资产目录，支撑数据驱动决策与数据治理。",
    users: "数据分析师 500+、业务人员"
  },
  "APP-1008": {
    productLine: "营销产品线",
    upstream: ["电商后台", "会员中心"],
    downstream: ["小程序商城", "订单中台", "数据资产平台"],
    inputData: [
      { name: "会员标签", from: "会员中心" },
      { name: "商品数据", from: "商品主数据" }
    ],
    outputData: [
      { name: "优惠券 / 活动配置", to: "小程序商城" },
      { name: "活动效果数据", to: "数据资产平台" }
    ],
    modules: [
      { name: "活动配置", desc: "大促活动规则与投放配置" },
      { name: "优惠券", desc: "券模板、发放与核销" },
      { name: "秒杀", desc: "高并发秒杀与库存扣减" },
      { name: "效果分析", desc: "活动转化与 ROI 分析" }
    ],
    value: "支撑大促与精准营销，提升用户转化与复购。",
    users: "运营人员、C 端用户"
  },
  "APP-1009": {
    productLine: "财务产品线",
    upstream: ["支付网关", "订单中台"],
    downstream: ["数据资产平台"],
    inputData: [
      { name: "交易流水", from: "支付网关" },
      { name: "订单数据", from: "订单中台" }
    ],
    outputData: [
      { name: "财务凭证与总账", to: "集团财务" },
      { name: "财务报表", to: "管理层 / 数据资产平台" }
    ],
    modules: [
      { name: "总账", desc: "科目、凭证与总账处理" },
      { name: "应收应付", desc: "应收应付核算与账龄管理" },
      { name: "月结", desc: "自动月结与关账" },
      { name: "报表", desc: "法定与内部财务报表" }
    ],
    value: "保障财务核算准确、及时与合规，是财务管理核心底座。",
    users: "财务人员 600+"
  },
  "APP-1010": {
    productLine: "供应链产品线",
    upstream: [],
    downstream: ["商品主数据", "财务核算系统"],
    inputData: [
      { name: "供应商资质", from: "供应商" },
      { name: "对账数据", from: "供应商 / 财务" }
    ],
    outputData: [
      { name: "供应商主数据", to: "商品主数据" },
      { name: "应付数据", to: "财务核算系统" }
    ],
    modules: [
      { name: "供应商入驻", desc: "入驻申请与审核" },
      { name: "资质管理", desc: "资质证件维护与到期提醒" },
      { name: "对账协同", desc: "在线对账与差异处理" },
      { name: "供应商评价", desc: "履约与质量评价" }
    ],
    value: "提升供应链上下游协同效率，降低采购与对账成本。",
    users: "供应商 2000+、采购人员"
  },
  "APP-1011": {
    productLine: "会员产品线",
    upstream: [],
    downstream: [],
    inputData: [],
    outputData: [
      { name: "历史订单数据", to: "数据资产平台（已迁移）" }
    ],
    modules: [
      { name: "商品展示", desc: "旧版 PC 商城主页与列表" },
      { name: "下单", desc: "旧版下单流程" },
      { name: "支付", desc: "旧版支付跳转" }
    ],
    value: "已由新版小程序商城替代，待完成数据归档后下线。",
    users: "历史 C 端用户（已停止新增）"
  },
  "APP-1012": {
    productLine: "平台产品线",
    upstream: ["全部业务应用"],
    downstream: ["全部业务应用"],
    inputData: [
      { name: "账号与组织信息", from: "HR 系统 / 各业务系统" }
    ],
    outputData: [
      { name: "访问令牌 Token", to: "全部应用" },
      { name: "权限模型", to: "全部应用" },
      { name: "认证审计日志", to: "审计平台" }
    ],
    modules: [
      { name: "单点登录", desc: "SSO 与多协议认证" },
      { name: "权限模型", desc: "RBAC 角色与权限管理" },
      { name: "组织同步", desc: "组织架构与账号同步" },
      { name: "认证审计", desc: "登录与授权审计" }
    ],
    value: "统一身份与权限底座，保障全集团访问安全与合规。",
    users: "全集团用户"
  },
  "APP-1013": {
    productLine: "财务产品线",
    upstream: ["订单中台"],
    downstream: ["财务核算系统"],
    inputData: [
      { name: "订单数据", from: "订单中台" }
    ],
    outputData: [
      { name: "电子发票", to: "客户 / 财务核算系统" }
    ],
    modules: [
      { name: "开票", desc: "在线开票与批量开票" },
      { name: "红冲", desc: "发票红冲与作废" },
      { name: "税务对接", desc: "对接税务平台" }
    ],
    value: "提升开票效率与税务合规水平。",
    users: "财务人员、C 端用户（建设中）"
  },
  "APP-1014": {
    productLine: "供应链产品线",
    upstream: ["订单中台"],
    downstream: ["数据资产平台"],
    inputData: [
      { name: "物流运单", from: "承运商" },
      { name: "履约指令", from: "订单中台" }
    ],
    outputData: [
      { name: "物流轨迹", to: "前端 / 订单中台 / 客服系统" }
    ],
    modules: [
      { name: "承运商对接", desc: "多承运商接口对接" },
      { name: "轨迹查询", desc: "物流轨迹聚合与查询" },
      { name: "异常预警", desc: "物流异常识别与预警" }
    ],
    value: "提升履约过程透明度与客户体验。",
    users: "全渠道用户、客服人员"
  },
  "APP-1015": {
    productLine: "数据产品线",
    upstream: ["数据资产平台", "会员中心"],
    downstream: ["小程序商城", "营销活动引擎"],
    inputData: [
      { name: "用户行为数据", from: "各前端应用" },
      { name: "会员标签", from: "会员中心" }
    ],
    outputData: [
      { name: "推荐结果", to: "小程序商城 / 营销活动引擎" }
    ],
    modules: [
      { name: "召回", desc: "多路召回候选集生成" },
      { name: "排序", desc: "精排与重排策略" },
      { name: "特征工程", desc: "实时与离线特征处理" },
      { name: "A/B 实验", desc: "推荐策略在线实验" }
    ],
    value: "实现千人千面推荐，提升转化率与用户体验。",
    users: "全渠道用户"
  }
};

const LICENSES = [
  { id: "LIC-201", product: "Oracle Database 19c", vendor: "Oracle", type: "企业版", qty: 8, used: 8, expire: "2026-11-05", owner: "张明", status: "临近到期" },
  { id: "LIC-202", product: "Red Hat Enterprise Linux", vendor: "Red Hat", type: "订阅", qty: 120, used: 96, expire: "2029-01-01", owner: "孙磊", status: "正常" },
  { id: "LIC-203", product: "Kafka 企业版", vendor: "Confluent", type: "订阅", qty: 12, used: 12, expire: "2026-10-28", owner: "王建国", status: "临近到期" },
  { id: "LIC-204", product: "Tableau 分析平台", vendor: "Salesforce", type: "席位", qty: 50, used: 41, expire: "2027-04-15", owner: "赵倩", status: "正常" },
  { id: "LIC-205", product: "Nginx Plus", vendor: "F5", type: "订阅", qty: 20, used: 20, expire: "2026-12-30", owner: "陈晓东", status: "正常" },
  { id: "LIC-206", product: "MySQL 商业支持", vendor: "Oracle", type: "支持服务", qty: 40, used: 33, expire: "2026-10-20", owner: "李婷", status: "已到期" },
  { id: "LIC-207", product: "SAP 财务模块", vendor: "SAP", type: "用户许可", qty: 600, used: 580, expire: "2027-08-01", owner: "张明", status: "正常" }
];

const CHANGES = [
  { id: "CHG-5201", app: "商品主数据", type: "架构调整", applicant: "陈晓东", approver: "张管理", status: "审批中", time: "2026-10-12 10:24" },
  { id: "CHG-5200", app: "营销活动引擎", type: "版本升级", applicant: "周薇", approver: "张管理", status: "审批中", time: "2026-10-11 16:08" },
  { id: "CHG-5198", app: "会员中心", type: "负责人变更", applicant: "李婷", approver: "张管理", status: "已通过", time: "2026-10-09 09:31" },
  { id: "CHG-5196", app: "旧版商城前台", type: "应用退役", applicant: "李婷", approver: "张管理", status: "评估中", time: "2026-10-08 14:02" },
  { id: "CHG-5193", app: "支付网关", type: "配置变更", applicant: "张明", approver: "张管理", status: "已通过", time: "2026-10-06 11:47" }
];

const AUDIT = [
  { time: "2026-10-12 10:31:05", user: "陈晓东", ip: "10.20.31.77", action: "更新", obj: "应用[商品主数据] 状态：运行中 → 变更中", before: "运行中", after: "变更中" },
  { time: "2026-10-12 09:12:44", user: "李婷", ip: "10.20.18.9", action: "导出", obj: "应用资产台账（筛选：零售业务）", before: "—", after: "368 条" },
  { time: "2026-10-11 16:20:10", user: "周薇", ip: "10.20.44.21", action: "新增", obj: "变更工单 CHG-5200", before: "—", after: "已提交" },
  { time: "2026-10-11 15:02:38", user: "张管理", ip: "10.20.1.5", action: "审批", obj: "变更工单 CHG-5198 通过", before: "审批中", after: "已通过" },
  { time: "2026-10-10 17:45:52", user: "孙磊", ip: "10.20.52.13", action: "更新", obj: "License[Kafka 企业版] 续费登记", before: "到期 2026-10-28", after: "已提交续费" },
  { time: "2026-10-10 11:19:03", user: "赵倩", ip: "10.20.63.8", action: "新增", obj: "应用[电子发票平台]", before: "—", after: "草稿" }
];

const DISCOVERY = [
  { name: "app-risk-engine", repo: "git.corp/ads/risk-engine", port: "8096/8097", first: "2026-10-10", status: "疑似新增", confidence: 92, src: "代码仓库扫描" },
  { name: "promo-worker-02", repo: "git.corp/mkt/promo", port: "—", first: "2026-10-08", status: "疑似新增", confidence: 78, src: "进程发现" },
  { name: "legacy-oms", repo: "git.corp/oms/legacy", port: "8080", first: "2026-09-30", status: "疑似下线", confidence: 88, src: "端口探测" },
  { name: "数据同步组件-cdc", repo: "git.corp/data/cdc", port: "9001", first: "2026-10-05", status: "边界存疑", confidence: 61, src: "架构关联检视" }
];

const REPORTS = [
  { name: "应用资产清单报表", type: "内置", freq: "按需", owner: "系统", updated: "2026-10-12" },
  { name: "License 到期预警报表", type: "内置", freq: "每日 08:00", owner: "系统", updated: "2026-10-12" },
  { name: "资产变更明细报表", type: "内置", freq: "每周一", owner: "系统", updated: "2026-10-06" },
  { name: "业务域资产统计", type: "内置", freq: "每月1日", owner: "系统", updated: "2026-10-01" },
  { name: "核心应用健康度", type: "自定义", freq: "每日 09:00 推送", owner: "孙磊", updated: "2026-10-11" },
  { name: "应用成本归集分析", type: "自定义", freq: "每月5日 推送", owner: "张明", updated: "2026-10-05" }
];

const COMPLIANCE_ITEMS = [
  { name: "等保三级备案", target: "核心应用", done: 14, total: 18 },
  { name: "数据分类分级", target: "全部应用", done: 96, total: 168 },
  { name: "账号权限复核", target: "全部应用", done: 132, total: 168 },
  { name: "日志留存合规", target: "核心应用", done: 16, total: 18 }
];

/* 应用资产分类自定义配置（分类字典） */
const CATEGORIES = {
  appDomain: {
    title: "应用域分类",
    desc: "应用所属业务域分类，用于业务维度归集与统计",
    items: [
      { name: "零售业务", count: 3, enabled: true },
      { name: "供应链", count: 4, enabled: true },
      { name: "财务共享", count: 3, enabled: true },
      { name: "客户服务", count: 1, enabled: true },
      { name: "人力资源", count: 1, enabled: true },
      { name: "数据平台", count: 3, enabled: true }
    ]
  },
  productLine: {
    title: "产品线分类",
    desc: "应用所属产品线/产品族，每条产品线隶属于唯一应用域（从属关系）",
    items: [
      { name: "会员产品线", parent: "零售业务", count: 2, enabled: true },
      { name: "营销产品线", parent: "零售业务", count: 1, enabled: true },
      { name: "交易产品线", parent: "供应链", count: 1, enabled: true },
      { name: "供应链产品线", parent: "供应链", count: 3, enabled: true },
      { name: "支付产品线", parent: "财务共享", count: 1, enabled: true },
      { name: "财务产品线", parent: "财务共享", count: 2, enabled: true },
      { name: "客服产品线", parent: "客户服务", count: 1, enabled: true },
      { name: "人力产品线", parent: "人力资源", count: 1, enabled: true },
      { name: "数据产品线", parent: "数据平台", count: 2, enabled: true },
      { name: "平台产品线", parent: "数据平台", count: 1, enabled: true }
    ]
  },
  status: {
    title: "状态分类",
    desc: "资产状态分类及流转状态，供生命周期流程引用",
    items: [
      { name: "草稿", count: 1, enabled: true },
      { name: "运行中", count: 10, enabled: true },
      { name: "变更中", count: 2, enabled: true },
      { name: "暂停", count: 1, enabled: true },
      { name: "已退役", count: 1, enabled: true }
    ]
  },
  importance: {
    title: "重要等级分类",
    desc: "资产重要等级分类，支持颜色标识与筛选",
    items: [
      { name: "核心", count: 5, enabled: true, color: "#f04a5b" },
      { name: "重要", count: 5, enabled: true, color: "#f5a623" },
      { name: "一般", count: 5, enabled: true, color: "#23b26d" }
    ]
  },
  deploy: {
    title: "部署形式分类",
    desc: "应用部署形式分类，如物理机、虚机、容器化等",
    items: [
      { name: "物理机", count: 0, enabled: true },
      { name: "虚拟机", count: 4, enabled: true },
      { name: "容器化（K8s）", count: 11, enabled: true },
      { name: "云原生", count: 0, enabled: false },
      { name: "混合部署", count: 0, enabled: false }
    ]
  },
  devMode: {
    title: "开发模式分类",
    desc: "应用开发模式分类，如自研、采购、外包、联合研发",
    items: [
      { name: "自主研发", count: 10, enabled: true },
      { name: "采购商用", count: 5, enabled: true },
      { name: "外包开发", count: 0, enabled: false },
      { name: "联合研发", count: 0, enabled: false }
    ]
  }
};

const TOPO = {
  nodes: [
    { id: "web", label: "小程序商城", x: 12, y: 20, type: "normal" },
    { id: "mem", label: "会员中心", x: 32, y: 16, type: "core" },
    { id: "ord", label: "订单中台", x: 52, y: 14, type: "core" },
    { id: "pay", label: "支付网关", x: 74, y: 20, type: "core" },
    { id: "promo", label: "营销活动引擎", x: 32, y: 46, type: "normal" },
    { id: "mdm", label: "商品主数据", x: 54, y: 46, type: "normal" },
    { id: "iam", label: "统一身份认证", x: 12, y: 74, type: "core" },
    { id: "db1", label: "Oracle 集群", x: 44, y: 78, type: "infra" },
    { id: "kafka", label: "Kafka 消息总线", x: 66, y: 60, type: "infra" },
    { id: "redis", label: "Redis 缓存", x: 86, y: 74, type: "infra" }
  ],
  edges: [
    ["web", "mem"], ["web", "ord"], ["mem", "iam"], ["ord", "pay"], ["ord", "mdm"],
    ["promo", "ord"], ["promo", "kafka"], ["mdm", "db1"], ["mem", "redis"],
    ["pay", "db1"], ["ord", "kafka"], ["mem", "kafka"], ["web", "promo"]
  ]
};

/* ---------------------- 工具函数 ---------------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove("show"), 2000);
}

function openDrawer(title, html) {
  $("#drawerTitle").textContent = title;
  $("#drawerBody").innerHTML = html;
  $("#drawer").classList.add("show");
  $("#drawerMask").classList.add("show");
}
function closeDrawer() {
  $("#drawer").classList.remove("show");
  $("#drawerMask").classList.remove("show");
}

/* ---------------------- 图表绘制 ---------------------- */
function donut(segments, size = 168) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map((s) => {
    const len = (s.value / total) * c;
    const arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="16" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" stroke-linecap="butt"></circle>`;
    offset += len;
    return arc;
  }).join("");
  return `
    <div class="ring-wrap">
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#eef1f6" stroke-width="16"></circle>
        ${arcs}
      </svg>
      <div class="ring-txt">${total}</div>
    </div>`;
}

function ringChart(pct, color = "#3552f5", size = 120) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const len = (pct / 100) * c;
  return `
    <div class="ring-wrap" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#eef1f6" stroke-width="10"></circle>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="10"
          stroke-dasharray="${len} ${c - len}" stroke-linecap="round"></circle>
      </svg>
      <div class="ring-txt" style="font-size:18px">${pct}%</div>
    </div>`;
}

function barLineChart(data, { w = 640, h = 220, color = "#3552f5" } = {}) {
  const pad = 34;
  const max = Math.max(...data.map((d) => d.value)) * 1.2 || 1;
  const bw = (w - pad * 2) / data.length;
  const bars = data.map((d, i) => {
    const bh = (d.value / max) * (h - pad * 2);
    const x = pad + i * bw + bw * 0.2;
    const y = h - pad - bh;
    return `<rect x="${x}" y="${y}" width="${bw * 0.6}" height="${bh}" rx="6" fill="url(#gbar)"></rect>
      <text x="${x + bw * 0.3}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#5b6b85">${d.value}</text>
      <text x="${x + bw * 0.3}" y="${h - pad + 16}" text-anchor="middle" font-size="11" fill="#93a1b8">${esc(d.label)}</text>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="height:${h}px">
    <defs><linearGradient id="gbar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}99"/></linearGradient></defs>
    ${bars}
  </svg>`;
}

/* =========================================================
   视图：可视化仪表盘
   ========================================================= */
function viewDashboard() {
  const total = APPS.length;
  const core = APPS.filter((a) => a.importance === "core").length;
  const online = APPS.filter((a) => a.status === "online").length;
  const nearing = LICENSES.filter((l) => l.status === "临近到期" || l.status === "已到期").length;
  const retiring = APPS.filter((a) => a.status === "retired").length;

  const statusSeg = [
    { label: "运行中", value: online, color: "#23b26d" },
    { label: "变更中", value: APPS.filter((a) => a.status === "change").length, color: "#f5a623" },
    { label: "暂停", value: APPS.filter((a) => a.status === "paused").length, color: "#93a1b8" },
    { label: "草稿", value: APPS.filter((a) => a.status === "draft").length, color: "#8b5cf6" },
    { label: "已退役", value: retiring, color: "#f04a5b" }
  ];

  const domainStat = DOMAINS.map((d) => ({ label: d.replace("业务", "").replace("共享", "").replace("服务", ""), value: APPS.filter((a) => a.domain === d).length }));
  const maxDomain = Math.max(...domainStat.map((d) => d.value));

  const kpi = (label, value, ico, cls, foot) => `
    <div class="card kpi">
      <div class="kpi-top">
        <span class="kpi-label">${label}</span>
        <span class="kpi-ico ${cls}">${ico}</span>
      </div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-foot">${foot}</div>
    </div>`;

  return `
    <div class="page-head">
      <div>
        <h2>可视化仪表盘</h2>
        <p>集团应用资产总览 · 数据更新于 2026-10-12 10:31</p>
      </div>
      <div class="page-actions">
        <button class="btn" data-nav="reports">报表中心</button>
        <button class="btn primary" data-nav="ledger">＋ 新增应用</button>
      </div>
    </div>

    <div class="grid cols-4" style="margin-bottom:16px">
      ${kpi("应用总数", total, "▤", "ico-blue", `<span class="trend-up">▲ 3</span> 较上月新增`)}
      ${kpi("核心应用", core, "◈", "ico-red", `占比 ${Math.round((core / total) * 100)}%，需重点保障`)}
      ${kpi("运行中", online, "◉", "ico-teal", `在线率 ${Math.round((online / total) * 100)}%`)}
      ${kpi("License 预警", nearing, "⌘", "ico-amber", `含 <b>${LICENSES.filter((l) => l.status === "已到期").length}</b> 已到期，建议尽快处理`)}
    </div>

    <div class="grid cols-3">
      <div class="card" style="grid-column: span 2">
        <div class="card-head"><h3>业务域应用分布</h3><span class="sub">按所属业务域统计</span></div>
        <div class="card-body">
          ${domainStat.map((d) => `
            <div class="bar-row">
              <span class="bl">${d.label}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${(d.value / maxDomain) * 100}%"></div></div>
              <span class="bv">${d.value}</span>
            </div>`).join("")}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>应用状态分布</h3></div>
        <div class="card-body" style="display:flex;flex-direction:column;align-items:center">
          ${donut(statusSeg)}
          <div class="legend" style="justify-content:center">
            ${statusSeg.map((s) => `<span><i style="background:${s.color}"></i>${s.label} ${s.value}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="grid cols-3" style="margin-top:16px">
      <div class="card" style="grid-column: span 2">
        <div class="card-head"><h3>License 到期预警</h3><span class="sub">未来 90 天 / 已到期</span></div>
        <div class="card-body">
          ${LICENSES.filter((l) => l.status !== "正常").map((l) => `
            <div class="list-item">
              <div class="li-main">
                <div class="li-title">${l.product}</div>
                <div class="li-sub">${l.vendor} · ${l.type} · 到期 ${l.expire} · 负责人 ${l.owner}</div>
              </div>
              <span class="badge ${l.status === "已到期" ? "red" : "amber"}">${l.status}</span>
            </div>`).join("")}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>最近变更动态</h3></div>
        <div class="card-body">
          <div class="timeline">
            ${CHANGES.slice(0, 4).map((c) => `
              <div class="tl-item ${c.status === "已通过" ? "green" : c.status === "审批中" ? "amber" : ""}">
                <div class="tl-title">${c.app} · ${c.type}</div>
                <div class="tl-sub">${c.applicant} 提交 · ${c.status}</div>
              </div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* =========================================================
   视图：应用资产台账
   ========================================================= */
let ledgerState = { q: "", domain: "", status: "", importance: "" };

function viewLedger() {
  return `
    <div class="page-head">
      <div>
        <h2>应用资产台账</h2>
        <p>全集团统一应用资产清单 · 支持多维检索、批量导入导出</p>
      </div>
      <div class="page-actions">
        <button class="btn" id="btnImport">⬆ 批量导入</button>
        <button class="btn" id="btnExport">⬇ 导出</button>
        <button class="btn primary" id="btnAdd">＋ 新增应用</button>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="toolbar">
          <div class="field"><input id="fq" placeholder="应用名称 / 编号 / 负责人（拼音模糊）" style="width:280px" value="${esc(ledgerState.q)}"></div>
          <div class="field"><select id="fdomain"><option value="">全部业务域</option>${DOMAINS.map((d) => `<option ${ledgerState.domain === d ? "selected" : ""}>${d}</option>`).join("")}</select></div>
          <div class="field"><select id="fstatus"><option value="">全部状态</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${ledgerState.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
          <div class="field"><select id="fimp"><option value="">全部等级</option>${Object.entries(IMPORTANCE).map(([k, v]) => `<option value="${k}" ${ledgerState.importance === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
          <span class="spacer"></span>
          <span class="muted" id="ledgerCount"></span>
        </div>
        <div class="table-wrap">
          <table class="tbl">
            <thead><tr>
              <th>应用编号</th><th>应用名称</th><th>业务域</th><th>负责人</th><th>重要等级</th>
              <th>状态</th><th>部署方式</th><th>技术栈</th><th>上线时间</th><th>操作</th>
            </tr></thead>
            <tbody id="ledgerBody"></tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function renderLedgerRows() {
  const q = ledgerState.q.trim().toLowerCase();
  const rows = APPS.filter((a) =>
    (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q)) &&
    (!ledgerState.domain || a.domain === ledgerState.domain) &&
    (!ledgerState.status || a.status === ledgerState.status) &&
    (!ledgerState.importance || a.importance === ledgerState.importance)
  );
  $("#ledgerCount").textContent = `共 ${rows.length} 条`;
  $("#ledgerBody").innerHTML = rows.map((a) => `
    <tr>
      <td class="muted">${a.id}</td>
      <td><span class="link" data-app="${a.id}">${a.name}</span></td>
      <td>${a.domain}</td>
      <td>${a.owner}</td>
      <td><span class="tag ${IMPORTANCE_CLASS[a.importance]}">${IMPORTANCE[a.importance]}</span></td>
      <td><span class="badge ${STATUS_CLASS[a.status]}">${STATUS[a.status]}</span></td>
      <td>${a.deploy}</td>
      <td>${a.tech}</td>
      <td class="muted">${a.online}</td>
      <td><span class="link" data-app="${a.id}">详情</span></td>
    </tr>`).join("") || `<tr><td colspan="10" class="muted" style="text-align:center;padding:28px">没有匹配的应用资产</td></tr>`;

  $$("#ledgerBody [data-app]").forEach((el) => el.addEventListener("click", () => showAppDetail(el.dataset.app)));
  return rows.length;
}

function bindLedger() {
  const refresh = () => { ledgerState.q = $("#fq").value; ledgerState.domain = $("#fdomain").value; ledgerState.status = $("#fstatus").value; ledgerState.importance = $("#fimp").value; renderLedgerRows(); };
  ["#fq", "#fdomain", "#fstatus", "#fimp"].forEach((s) => {
    const el = $(s);
    el.addEventListener(el.tagName === "INPUT" ? "input" : "change", refresh);
  });
  $("#btnImport").addEventListener("click", () => toast("已打开 Excel 批量导入向导（演示）"));
  $("#btnExport").addEventListener("click", () => toast(`已按当前筛选条件导出 ${renderLedgerRows()} 条记录`));
  $("#btnAdd").addEventListener("click", () => showAppForm());
  renderLedgerRows();
}

function showAppDetail(id) {
  const a = APPS.find((x) => x.id === id);
  if (!a) return;
  const d = APP_DETAILS[id] || {};
  const tagList = (arr) => arr && arr.length ? arr.map((t) => `<span class="tag">${esc(t)}</span>`).join("") : '<span class="muted">无</span>';

  openDrawer("应用详情", `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div>
        <div style="font-size:17px;font-weight:750">${a.name}</div>
        <div class="muted">${a.id} · ${a.vendor}</div>
      </div>
      <span class="badge ${STATUS_CLASS[a.status]}">${STATUS[a.status]}</span>
    </div>

    <div class="section-title" style="margin-top:0">基础信息</div>
    <dl class="kv">
      <dt>所属业务域</dt><dd>${a.domain}</dd>
      <dt>所属产品线</dt><dd><span class="tag">${d.productLine || "—"}</span></dd>
      <dt>负责人</dt><dd>${a.owner}</dd>
      <dt>重要等级</dt><dd><span class="tag ${IMPORTANCE_CLASS[a.importance]}">${IMPORTANCE[a.importance]}</span></dd>
      <dt>技术栈</dt><dd>${a.tech}</dd>
      <dt>部署方式</dt><dd>${a.deploy}</dd>
      <dt>云资源</dt><dd>${a.cloud}</dd>
      <dt>上线时间</dt><dd>${a.online}</dd>
      <dt>License</dt><dd>${a.license}</dd>
      <dt>年成本(万元)</dt><dd>${a.cost}</dd>
    </dl>

    <div class="section-title">功能简述</div>
    <p style="font-size:13px;color:var(--ink-2);line-height:1.7">${a.desc}</p>

    <div class="section-title">价值定位</div>
    <p style="font-size:13px;color:var(--ink-2);line-height:1.7">${d.value || "—"}</p>

    <div class="section-title">用户 / 客户群</div>
    <p style="font-size:13px;color:var(--ink-2);line-height:1.7">${d.users || "—"}</p>

    <div class="section-title">上下游拓扑关系</div>
    <div style="border:1px solid var(--line);border-radius:10px;padding:12px;background:#fafbfe;font-size:13px;line-height:2">
      <div style="color:var(--ink-3);font-size:12px;margin-bottom:4px">▲ 上游（调用本应用 / 提供数据）</div>
      <div>${tagList(d.upstream)}</div>
      <div style="text-align:center;color:var(--brand);font-weight:700;margin:4px 0">↓</div>
      <div style="text-align:center;font-weight:700;margin:6px 0;color:var(--ink)">【${a.name}】</div>
      <div style="text-align:center;color:var(--brand);font-weight:700;margin:4px 0">↓</div>
      <div style="color:var(--ink-3);font-size:12px;margin-bottom:4px">▼ 下游（被本应用调用 / 接收数据）</div>
      <div>${tagList(d.downstream)}</div>
    </div>

    <div class="section-title">接收的其他系统数据</div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>数据项</th><th>来源系统</th></tr></thead>
      <tbody>${(d.inputData || []).map((x) => `<tr><td><b>${esc(x.name)}</b></td><td class="muted">${esc(x.from)}</td></tr>`).join("") || `<tr><td colspan="2" class="muted">无</td></tr>`}</tbody>
    </table></div>

    <div class="section-title">输出的核心数据</div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>数据项</th><th>消费方</th></tr></thead>
      <tbody>${(d.outputData || []).map((x) => `<tr><td><b>${esc(x.name)}</b></td><td class="muted">${esc(x.to)}</td></tr>`).join("") || `<tr><td colspan="2" class="muted">无</td></tr>`}</tbody>
    </table></div>

    <div class="section-title">核心功能模块</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${(d.modules || []).map((m) => `
        <div style="border:1px solid var(--line);border-radius:10px;padding:10px 12px">
          <div style="font-weight:650;font-size:13px;margin-bottom:3px">${esc(m.name)}</div>
          <div class="muted" style="line-height:1.6">${esc(m.desc)}</div>
        </div>`).join("") || '<span class="muted">无</span>'}
    </div>
  `);
}

function showAppForm() {
  openDrawer("新增应用资产", `
    <div style="display:flex;flex-direction:column;gap:16px">
      ${[["应用名称 *", "请输入"], ["应用编号", "如 APP-1016"], ["负责人", "请输入"]].map(([l, p]) => `
        <label style="display:flex;flex-direction:column;gap:6px;font-size:13px">
          <span style="color:var(--ink-2);font-weight:600">${l}</span>
          <input placeholder="${p}" style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;outline:none">
        </label>`).join("")}
      <label style="display:flex;flex-direction:column;gap:6px;font-size:13px">
        <span style="color:var(--ink-2);font-weight:600">所属业务域</span>
        <select style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;outline:none">${DOMAINS.map((d) => `<option>${d}</option>`).join("")}</select>
      </label>
      <label style="display:flex;flex-direction:column;gap:6px;font-size:13px">
        <span style="color:var(--ink-2);font-weight:600">重要等级</span>
        <select style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;outline:none">
          <option value="core">核心</option><option value="important">重要</option><option value="normal">一般</option>
        </select>
      </label>
      <label style="display:flex;flex-direction:column;gap:6px;font-size:13px">
        <span style="color:var(--ink-2);font-weight:600">功能简述</span>
        <textarea rows="3" placeholder="请输入应用功能与价值描述" style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;outline:none;font-family:inherit"></textarea>
      </label>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn primary" id="saveApp">保存</button>
        <button class="btn" id="cancelApp">取消</button>
        <button class="btn" id="draftApp">存为草稿</button>
      </div>
    </div>
  `);
  $("#saveApp").addEventListener("click", () => { closeDrawer(); toast("应用资产已保存（演示）"); });
  $("#draftApp").addEventListener("click", () => { closeDrawer(); toast("已存为草稿（演示）"); });
  $("#cancelApp").addEventListener("click", closeDrawer);
}

/* =========================================================
   视图：自动发现与采集
   ========================================================= */
function viewDiscovery() {
  return `
    <div class="page-head">
      <div>
        <h2>自动发现与采集</h2>
        <p>对接研发管理平台，扫描代码仓库 / 进程 / 端口，自动识别新增与下线应用</p>
      </div>
      <div class="page-actions">
        <button class="btn" id="btnScan">↻ 立即扫描</button>
        <button class="btn primary" id="btnSync">同步至台账</button>
      </div>
    </div>

    <div class="grid cols-4" style="margin-bottom:16px">
      ${[["代码仓库接入", "6", "ico-blue", "已纳管仓库 320 个"], ["本次扫描耗时", "48s", "ico-teal", "覆盖 5 套环境"], ["疑似新增应用", "2", "ico-amber", "待确认入库"], ["疑似下线应用", "1", "ico-red", "待确认退役"]]
      .map(([l, v, c, f]) => `<div class="card kpi"><div class="kpi-top"><span class="kpi-label">${l}</span><span class="kpi-ico ${c}">◎</span></div><div class="kpi-value">${v}</div><div class="kpi-foot">${f}</div></div>`).join("")}
    </div>

    <div class="grid cols-3">
      <div class="card" style="grid-column: span 2">
        <div class="card-head"><h3>发现结果</h3><span class="sub">需人工确认后写入台账</span></div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="tbl">
              <thead><tr><th>应用/组件</th><th>来源</th><th>代码仓库</th><th>端口</th><th>发现时间</th><th>匹配度</th><th>判定</th><th>操作</th></tr></thead>
              <tbody>
                ${DISCOVERY.map((d) => `
                  <tr>
                    <td><b>${d.name}</b></td>
                    <td class="muted">${d.src}</td>
                    <td class="muted">${d.repo}</td>
                    <td>${d.port}</td>
                    <td class="muted">${d.first}</td>
                    <td>${d.confidence}%</td>
                    <td><span class="badge ${d.status.includes("新增") ? "amber" : d.status.includes("下线") ? "red" : "purple"}">${d.status}</span></td>
                    <td><span class="link" data-disc="${d.name}">确认</span></td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>采集覆盖</h3></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:20px;align-items:center">
          <div style="display:flex;gap:20px;align-items:center">
            ${ringChart(94, "#12b8a6")}
            <div>
              <div style="font-weight:700;margin-bottom:6px">仓库定位覆盖率</div>
              <div class="muted">已关联应用定位<br>320 / 340 个仓库</div>
            </div>
          </div>
          ${[["进程自动识别", 88, "#3552f5"], ["端口依赖发现", 76, "#8b5cf6"], ["边界合规检视", 69, "#f5a623"]]
            .map(([l, p, c]) => `
              <div style="width:100%">
                <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span>${l}</span><b>${p}%</b></div>
                <div class="bar-track"><div class="bar-fill" style="width:${p}%;background:${c}"></div></div>
              </div>`).join("")}
        </div>
      </div>
    </div>`;
}

/* =========================================================
   视图：License 管理
   ========================================================= */
function viewLicense() {
  const nearing = LICENSES.filter((l) => l.status !== "正常").length;
  return `
    <div class="page-head">
      <div><h2>License 管理</h2><p>软件授权台账登记与到期预警，规避合规风险</p></div>
      <div class="page-actions">
        <button class="btn" id="btnRule">预警规则设置</button>
        <button class="btn primary" id="btnLicAdd">＋ 登记 License</button>
      </div>
    </div>

    <div class="grid cols-3" style="margin-bottom:16px">
      ${[["License 总数", LICENSES.length, "ico-blue"], ["临近/已到期", nearing, "ico-amber"], ["授权席位使用率", Math.round((LICENSES.reduce((s, l) => s + l.used, 0) / LICENSES.reduce((s, l) => s + l.qty, 0)) * 100) + "%", "ico-teal"]]
      .map(([l, v, c]) => `<div class="card kpi"><div class="kpi-top"><span class="kpi-label">${l}</span><span class="kpi-ico ${c}">⌘</span></div><div class="kpi-value">${v}</div><div class="kpi-foot">授权合规监控中</div></div>`).join("")}
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-wrap">
          <table class="tbl">
            <thead><tr><th>License 编号</th><th>软件/产品</th><th>服务商</th><th>授权类型</th><th>授权数量</th><th>已使用</th><th>使用率</th><th>到期时间</th><th>负责人</th><th>状态</th></tr></thead>
            <tbody>
              ${LICENSES.map((l) => {
                const pct = Math.round((l.used / l.qty) * 100);
                const cls = l.status === "正常" ? "green" : l.status === "已到期" ? "red" : "amber";
                return `<tr>
                  <td class="muted">${l.id}</td>
                  <td><b>${l.product}</b></td>
                  <td>${l.vendor}</td>
                  <td>${l.type}</td>
                  <td>${l.qty}</td>
                  <td>${l.used}</td>
                  <td style="min-width:120px">
                    <div class="bar-track" style="height:7px"><div class="bar-fill" style="width:${pct}%;background:${pct > 90 ? "#f04a5b" : "#3552f5"}"></div></div>
                    <div class="muted" style="margin-top:3px">${pct}%</div>
                  </td>
                  <td>${l.expire}</td>
                  <td>${l.owner}</td>
                  <td><span class="badge ${cls}">${l.status}</span></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* =========================================================
   视图：生命周期与变更
   ========================================================= */
function viewLifecycle() {
  const steps = [["draft", "草稿"], ["online", "上线"], ["change", "变更"], ["paused", "暂停"], ["retired", "退役"]];
  const counts = steps.map(([k]) => APPS.filter((a) => a.status === k).length);
  const maxc = Math.max(...counts, 1);
  return `
    <div class="page-head">
      <div><h2>生命周期与变更管理</h2><p>状态流转留痕 · 变更工单审批闭环 · 退役评估流程</p></div>
      <div class="page-actions">
        <button class="btn" id="btnRetireFlow">退役评估流程</button>
        <button class="btn primary" id="btnChangeAdd">＋ 发起变更工单</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><h3>资产生命周期状态流转</h3><span class="sub">点击节点筛选</span></div>
      <div class="card-body">
        <div class="flow" style="justify-content:center;padding:8px 0 18px">
          ${steps.map(([k, label], i) => `
            <span class="step ${k === "online" ? "current" : "done"}">${label}</span>
            ${i < steps.length - 1 ? '<span class="arrow">→</span>' : ""}`).join("")}
        </div>
        <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
          ${steps.map(([k, label], i) => `
            <div style="text-align:center;min-width:96px">
              <div style="font-size:22px;font-weight:760">${counts[i]}</div>
              <div class="muted">${label}</div>
            </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="grid cols-3">
      <div class="card" style="grid-column: span 2">
        <div class="card-head"><h3>变更工单</h3><span class="sub">审批通过后自动回填台账</span></div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="tbl">
              <thead><tr><th>工单号</th><th>关联应用</th><th>变更类型</th><th>申请人</th><th>审批人</th><th>提交时间</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                ${CHANGES.map((c) => `<tr>
                  <td class="muted">${c.id}</td>
                  <td><b>${c.app}</b></td>
                  <td>${c.type}</td>
                  <td>${c.applicant}</td>
                  <td>${c.approver}</td>
                  <td class="muted">${c.time}</td>
                  <td><span class="badge ${c.status === "已通过" ? "green" : c.status === "审批中" ? "amber" : "purple"}">${c.status}</span></td>
                  <td><span class="link" data-chg="${c.id}">查看</span></td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>退役评估检查项</h3></div>
        <div class="card-body">
          ${["业务确认无在用功能", "数据归档方案完成", "接口调用方已下线", "资源回收已执行", "合规与安全确认"].map((t, i) => `
            <div class="list-item">
              <span style="color:${i < 3 ? "var(--green)" : "var(--amber)"};font-size:16px">${i < 3 ? "✔" : "○"}</span>
              <div class="li-main"><div class="li-title">${t}</div></div>
              <span class="badge ${i < 3 ? "green" : "amber"}">${i < 3 ? "已完成" : "待处理"}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}

/* =========================================================
   视图：应用拓扑关系
   ========================================================= */
function viewTopology() {
  const nodeById = Object.fromEntries(TOPO.nodes.map((n) => [n.id, n]));
  const lines = TOPO.edges.map(([a, b]) => {
    const na = nodeById[a], nb = nodeById[b];
    const x1 = (na.x / 100) * 1000, y1 = (na.y / 100) * 1000;
    const x2 = (nb.x / 100) * 1000, y2 = (nb.y / 100) * 1000;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c8d3e6" stroke-width="2" marker-end="url(#arrow)"></line>`;
  }).join("");

  return `
    <div class="page-head">
      <div><h2>应用拓扑与关系管理</h2><p>展示应用间调用依赖、应用与数据库/中间件依赖关系</p></div>
      <div class="page-actions">
        <button class="btn" id="topoZoomOut">－ 缩小</button>
        <button class="btn" id="topoZoomIn">＋ 放大</button>
        <button class="btn" id="topoExport">⬇ 导出拓扑图</button>
      </div>
    </div>

    <div class="grid cols-4" style="margin-bottom:16px">
      ${[["应用节点", TOPO.nodes.filter((n) => n.type !== "infra").length, "ico-blue"], ["基础设施节点", TOPO.nodes.filter((n) => n.type === "infra").length, "ico-teal"], ["调用关系", TOPO.edges.length, "ico-purple"], ["核心应用", TOPO.nodes.filter((n) => n.type === "core").length, "ico-red"]]
      .map(([l, v, c]) => `<div class="card kpi"><div class="kpi-top"><span class="kpi-label">${l}</span><span class="kpi-ico ${c}">◇</span></div><div class="kpi-value">${v}</div><div class="kpi-foot">拓扑实时渲染</div></div>`).join("")}
    </div>

    <div class="card">
      <div class="card-head"><h3>应用依赖拓扑</h3>
        <span class="sub">点击节点查看依赖详情，支持缩放与导出</span>
      </div>
      <div class="card-body">
        <div class="topology-canvas" id="topoCanvas">
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#c8d3e6"></path>
              </marker>
            </defs>
            ${lines}
          </svg>
          ${TOPO.nodes.map((n) => `
            <div class="topo-node ${n.type}" style="left:${n.x}%;top:${n.y}%" data-topo="${n.id}">
              <span class="ndot"></span>${n.label}
            </div>`).join("")}
          <div class="topo-hint">滚轮/按钮缩放 · 拖拽预览</div>
        </div>
      </div>
    </div>`;
}

/* =========================================================
   视图：报表中心
   ========================================================= */
function viewReports() {
  const trend = [{ label: "5月", value: 148 }, { label: "6月", value: 152 }, { label: "7月", value: 155 }, { label: "8月", value: 160 }, { label: "9月", value: 164 }, { label: "10月", value: 168 }];
  return `
    <div class="page-head">
      <div><h2>报表中心</h2><p>内置 + 自定义报表，支持定时自动推送</p></div>
      <div class="page-actions">
        <button class="btn" id="btnPush">⏱ 定时推送设置</button>
        <button class="btn primary" id="btnReportAdd">＋ 新建自定义报表</button>
      </div>
    </div>

    <div class="grid cols-3" style="margin-bottom:16px">
      <div class="card" style="grid-column: span 2">
        <div class="card-head"><h3>应用资产增长趋势</h3><span class="sub">近 6 个月</span></div>
        <div class="card-body">${barLineChart(trend, { h: 230 })}</div>
      </div>
      <div class="card">
        <div class="card-head"><h3>报表推送</h3></div>
        <div class="card-body">
          ${[["每日资产健康度", "09:00", "企业微信"], ["License 到期提醒", "08:00", "邮件 + 钉钉"], ["周度变更汇总", "周一 10:00", "邮件"]]
            .map(([n, t, ch]) => `<div class="list-item"><div class="li-main"><div class="li-title">${n}</div><div class="li-sub">${t} · ${ch}</div></div><span class="badge green">已启用</span></div>`).join("")}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>报表模板</h3><span class="sub">共 ${REPORTS.length} 个模板</span></div>
      <div class="card-body">
        <div class="table-wrap">
          <table class="tbl">
            <thead><tr><th>报表名称</th><th>类型</th><th>推送频率</th><th>负责人</th><th>更新时间</th><th>操作</th></tr></thead>
            <tbody>
              ${REPORTS.map((r) => `<tr>
                <td><b>${r.name}</b></td>
                <td><span class="tag ${r.type === "内置" ? "" : "important"}">${r.type}</span></td>
                <td>${r.freq}</td>
                <td>${r.owner}</td>
                <td class="muted">${r.updated}</td>
                <td><span class="link" data-report="${esc(r.name)}">查看</span> · <span class="link" data-report-export="${esc(r.name)}">导出</span></td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* =========================================================
   视图：成本与合规
   ========================================================= */
function viewCompliance() {
  const domainCost = DOMAINS.map((d) => ({ label: d.replace("业务", "").replace("共享", "").replace("服务", ""), value: APPS.filter((a) => a.domain === d).reduce((s, a) => s + a.cost, 0) }));
  const maxCost = Math.max(...domainCost.map((d) => d.value));
  const totalCost = APPS.reduce((s, a) => s + a.cost, 0);
  const tagStats = [
    { label: "等保三级", value: 14, color: "#3552f5" },
    { label: "已合规", value: 96, color: "#23b26d" },
    { label: "待整改", value: 46, color: "#f5a623" },
    { label: "不合规", value: 12, color: "#f04a5b" }
  ];
  return `
    <div class="page-head">
      <div><h2>成本与合规管理</h2><p>IT 成本按应用归集 · 合规标签与自查闭环</p></div>
      <div class="page-actions">
        <button class="btn" id="btnCostSync">↻ 同步财务数据</button>
        <button class="btn primary" id="btnComplianceCheck">发起合规自查</button>
      </div>
    </div>

    <div class="grid cols-3" style="margin-bottom:16px">
      ${[["应用年成本合计", totalCost + " 万", "ico-blue"], ["成本归集覆盖率", "92%", "ico-teal"], ["合规达标率", "78%", "ico-green"]]
      .map(([l, v, c]) => `<div class="card kpi"><div class="kpi-top"><span class="kpi-label">${l}</span><span class="kpi-ico ${c}">◈</span></div><div class="kpi-value">${v}</div><div class="kpi-foot">数据来源：财务系统 / 合规自查</div></div>`).join("")}
    </div>

    <div class="grid cols-2" style="margin-bottom:16px">
      <div class="card">
        <div class="card-head"><h3>各业务域成本归集</h3><span class="sub">单位：万元/年</span></div>
        <div class="card-body">
          ${domainCost.map((d) => `
            <div class="bar-row">
              <span class="bl">${d.label}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${(d.value / maxCost) * 100}%;background:linear-gradient(90deg,#12b8a6,#3552f5)"></div></div>
              <span class="bv">${d.value}</span>
            </div>`).join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>合规标签分布</h3></div>
        <div class="card-body" style="display:flex;gap:24px;align-items:center;justify-content:center">
          ${donut(tagStats, 160)}
          <div class="legend" style="flex-direction:column;gap:10px">
            ${tagStats.map((t) => `<span><i style="background:${t.color}"></i>${t.label} <b>${t.value}</b></span>`).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>合规自查清单</h3><span class="sub">推动合规闭环管理</span></div>
      <div class="card-body">
        ${COMPLIANCE_ITEMS.map((c) => {
          const pct = Math.round((c.done / c.total) * 100);
          return `<div style="display:flex;align-items:center;gap:18px;padding:12px 4px;border-bottom:1px solid var(--line)">
            <div style="flex:1"><div style="font-weight:600">${c.name}</div><div class="muted">适用范围：${c.target}</div></div>
            <div class="bar-track" style="width:220px;height:8px"><div class="bar-fill" style="width:${pct}%;background:${pct >= 90 ? "#23b26d" : pct >= 60 ? "#f5a623" : "#f04a5b"}"></div></div>
            <div style="width:90px;text-align:right;font-weight:700">${c.done}/${c.total}</div>
            <span class="badge ${pct >= 90 ? "green" : pct >= 60 ? "amber" : "red"}">${pct}%</span>
          </div>`;
        }).join("")}
      </div>
    </div>`;
}

/* =========================================================
   视图：权限与审计
   ========================================================= */
function viewAudit() {
  const roles = [
    { name: "超级管理员", users: 2, scope: "全集团", perms: ["查看", "编辑", "删除", "导出", "授权"] },
    { name: "资产管理员", users: 6, scope: "全集团", perms: ["查看", "编辑", "导出"] },
    { name: "业务域负责人", users: 12, scope: "本业务域", perms: ["查看", "编辑"] },
    { name: "审计员", users: 3, scope: "全集团（只读）", perms: ["查看", "导出"] },
    { name: "普通用户", users: 86, scope: "本部门", perms: ["查看"] }
  ];
  return `
    <div class="page-head">
      <div><h2>权限与审计</h2><p>基于角色的细粒度权限控制与全量操作审计日志</p></div>
      <div class="page-actions">
        <button class="btn" id="btnAuditExport">⬇ 导出审计日志</button>
        <button class="btn primary" id="btnRoleAdd">＋ 新增角色</button>
      </div>
    </div>

    <div class="grid cols-3" style="margin-bottom:16px">
      ${[["角色数量", roles.length, "ico-blue"], ["授权用户", roles.reduce((s, r) => s + r.users, 0), "ico-teal"], ["今日操作记录", "1,284", "ico-purple"]]
      .map(([l, v, c]) => `<div class="card kpi"><div class="kpi-top"><span class="kpi-label">${l}</span><span class="kpi-ico ${c}">☰</span></div><div class="kpi-value">${v}</div><div class="kpi-foot">权限模型：RBAC + 数据隔离</div></div>`).join("")}
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><h3>角色权限矩阵</h3></div>
      <div class="card-body">
        <div class="table-wrap">
          <table class="tbl">
            <thead><tr><th>角色</th><th>用户数</th><th>数据范围</th><th>权限项</th></tr></thead>
            <tbody>
              ${roles.map((r) => `<tr>
                <td><b>${r.name}</b></td>
                <td>${r.users}</td>
                <td>${r.scope}</td>
                <td>${r.perms.map((p) => `<span class="tag">${p}</span>`).join("")}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>操作审计日志</h3><span class="sub">记录操作人 / 时间 / IP / 变更前后内容</span></div>
      <div class="card-body">
        <div class="table-wrap">
          <table class="tbl">
            <thead><tr><th>时间</th><th>操作人</th><th>IP</th><th>操作</th><th>对象</th><th>变更前</th><th>变更后</th></tr></thead>
            <tbody>
              ${AUDIT.map((a) => `<tr>
                <td class="muted">${a.time}</td>
                <td>${a.user}</td>
                <td class="muted">${a.ip}</td>
                <td><span class="tag">${a.action}</span></td>
                <td>${esc(a.obj)}</td>
                <td class="muted">${esc(a.before)}</td>
                <td>${esc(a.after)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* =========================================================
   视图：应用资产分类自定义配置管理
   ========================================================= */
function viewClassification() {
  const dims = Object.keys(CATEGORIES);
  const totalItems = dims.reduce((s, k) => s + CATEGORIES[k].items.length, 0);
  const enabledItems = dims.reduce((s, k) => s + CATEGORIES[k].items.filter((i) => i.enabled).length, 0);

  const hierarchy = CATEGORIES.appDomain.items.map((dom) => ({
    dom,
    lines: CATEGORIES.productLine.items.filter((pl) => pl.parent === dom.name)
  }));

  const card = (key) => {
    const c = CATEGORIES[key];
    return `
      <div class="card">
        <div class="card-head">
          <div>
            <h3>${c.title}</h3>
            <span class="sub">${c.desc}</span>
          </div>
          <button class="btn" data-cat-add="${key}">＋ 新增</button>
        </div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:8px">
            ${c.items.map((it, i) => {
              const childInfo = key === "appDomain" ? `下辖 ${CATEGORIES.productLine.items.filter((p) => p.parent === it.name).length} 条产品线` : "";
              const parentTag = key === "productLine" && it.parent ? `<span class="tag" style="background:var(--brand-soft);color:var(--brand);margin-left:6px">↳ ${esc(it.parent)}</span>` : "";
              return `
              <div class="list-item" style="padding:9px 4px">
                <label class="switch" title="${it.enabled ? "已启用" : "已停用"}">
                  <input type="checkbox" data-cat-toggle="${key}:${i}" ${it.enabled ? "checked" : ""}>
                  <span class="switch-track"></span>
                </label>
                <div class="li-main">
                  <div class="li-title" style="${it.enabled ? "" : "color:var(--ink-3);text-decoration:line-through"}">
                    ${it.color ? `<i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${it.color};margin-right:6px"></i>` : ""}${esc(it.name)}${parentTag}
                  </div>
                  ${childInfo ? `<div class="li-sub">${childInfo}</div>` : ""}
                </div>
                <span class="badge ${it.enabled ? "blue" : "gray"}">引用 ${it.count}</span>
                <span class="link" data-cat-edit="${key}:${i}">编辑</span>
                <span class="link" data-cat-del="${key}:${i}" style="color:var(--red)">删除</span>
              </div>`;
            }).join("") || '<span class="muted">暂无分类项</span>'}
          </div>
        </div>
      </div>`;
  };

  return `
    <div class="page-head">
      <div>
        <h2>资产分类配置管理</h2>
        <p>自定义维护各类分类字典；应用域为父分类，产品线从属于应用域</p>
      </div>
      <div class="page-actions">
        <button class="btn" id="btnCatReset">恢复默认</button>
        <button class="btn primary" id="btnCatAdd">＋ 新增分类维度</button>
      </div>
    </div>

    <div class="grid cols-4" style="margin-bottom:16px">
      ${[["分类维度", dims.length, "ico-blue"], ["分类项总数", totalItems, "ico-teal"], ["已启用分类项", enabledItems, "ico-green"], ["已停用分类项", totalItems - enabledItems, "ico-gray"]]
      .map(([l, v, c]) => `<div class="card kpi"><div class="kpi-top"><span class="kpi-label">${l}</span><span class="kpi-ico ${c}">▦</span></div><div class="kpi-value">${v}</div><div class="kpi-foot">分类字典自定义配置</div></div>`).join("")}
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><h3>分类层级关系</h3><span class="sub">应用域（父） → 产品线（子，多对一从属）</span></div>
      <div class="card-body">
        <div class="grid cols-3">
          ${hierarchy.map((h) => `
            <div style="border:1px solid var(--line);border-radius:12px;padding:12px">
              <div style="font-weight:700;margin-bottom:8px">
                <span class="badge ${h.dom.enabled ? "blue" : "gray"}" style="margin-right:6px">应用域</span>${esc(h.dom.name)}
              </div>
              <div>${h.lines.map((l) => `<span class="tag">${esc(l.name)}</span>`).join("") || '<span class="muted">暂无产品线</span>'}</div>
            </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="grid cols-2">
      ${dims.map(card).join("")}
    </div>`;
}

function bindClassification() {
  const rerender = () => navigate("classification");

  $$("#view [data-cat-toggle]").forEach((el) => el.addEventListener("change", () => {
    const [dim, i] = el.dataset.catToggle.split(":");
    CATEGORIES[dim].items[+i].enabled = el.checked;
    toast(`已${el.checked ? "启用" : "停用"}「${CATEGORIES[dim].items[+i].name}」（演示）`);
    rerender();
  }));

  $$("#view [data-cat-del]").forEach((el) => el.addEventListener("click", () => {
    const [dim, i] = el.dataset.catDel.split(":");
    const it = CATEGORIES[dim].items[+i];
    if (it.count > 0) { toast(`「${it.name}」已被 ${it.count} 个应用引用，无法删除（演示）`); return; }
    CATEGORIES[dim].items.splice(+i, 1);
    toast(`已删除分类项「${it.name}」（演示）`);
    rerender();
  }));

  $$("#view [data-cat-edit]").forEach((el) => el.addEventListener("click", () => {
    const [dim, i] = el.dataset.catEdit.split(":");
    openCatForm(dim, +i);
  }));

  $$("#view [data-cat-add]").forEach((el) => el.addEventListener("click", () => openCatForm(el.dataset.catAdd, -1)));

  $("#btnCatReset").addEventListener("click", () => toast("已恢复默认分类配置（演示）"));
  $("#btnCatAdd").addEventListener("click", () => toast("新增分类维度需配置字段类型与联动规则（演示）"));
}

function openCatForm(dim, index) {
  const c = CATEGORIES[dim];
  const editing = index >= 0;
  const cur = editing ? c.items[index] : { name: "", enabled: true, color: "" };
  const isProductLine = dim === "productLine";
  const domainSelect = isProductLine
    ? `<label style="display:flex;flex-direction:column;gap:6px;font-size:13px">
        <span style="color:var(--ink-2);font-weight:600">所属应用域 *</span>
        <select id="catParent" style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;outline:none">
          ${CATEGORIES.appDomain.items.filter((d) => d.enabled).map((d) => `<option ${cur.parent === d.name ? "selected" : ""}>${esc(d.name)}</option>`).join("")}
        </select>
        <span class="muted">产品线从属于应用域（多对一）</span>
      </label>`
    : "";
  openDrawer(`${editing ? "编辑" : "新增"}分类项 · ${c.title}`, `
    <div style="display:flex;flex-direction:column;gap:16px">
      <label style="display:flex;flex-direction:column;gap:6px;font-size:13px">
        <span style="color:var(--ink-2);font-weight:600">分类名称 *</span>
        <input id="catName" value="${esc(cur.name)}" placeholder="请输入分类名称" style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;outline:none">
      </label>
      ${domainSelect}
      <label style="display:flex;flex-direction:column;gap:6px;font-size:13px">
        <span style="color:var(--ink-2);font-weight:600">标识颜色（可选）</span>
        <input id="catColor" type="color" value="${cur.color || "#3552f5"}" style="width:70px;height:38px;border:1px solid var(--line);border-radius:10px;padding:2px;background:#fff">
      </label>
      <label style="display:flex;align-items:center;gap:10px;font-size:13px">
        <input id="catEnabled" type="checkbox" ${cur.enabled ? "checked" : ""}>
        <span>启用该分类项</span>
      </label>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn primary" id="catSave">保存</button>
        <button class="btn" id="catCancel">取消</button>
      </div>
    </div>
  `);
  $("#catCancel").addEventListener("click", closeDrawer);
  $("#catSave").addEventListener("click", () => {
    const name = $("#catName").value.trim();
    if (!name) { toast("请输入分类名称"); return; }
    const payload = { name, enabled: $("#catEnabled").checked, color: $("#catColor").value };
    if (isProductLine) payload.parent = $("#catParent").value;
    if (editing) { Object.assign(c.items[index], payload); }
    else { c.items.push({ ...payload, count: 0 }); }
    closeDrawer();
    toast(`已保存分类项「${name}」${isProductLine ? `（隶属 ${payload.parent}）` : ""}（演示）`);
    navigate("classification");
  });
}

/* =========================================================
   路由与事件
   ========================================================= */
const VIEWS = {
  dashboard: { title: "可视化仪表盘", render: viewDashboard },
  ledger: { title: "应用资产台账", render: viewLedger },
  classification: { title: "资产分类配置", render: viewClassification },
  discovery: { title: "自动发现与采集", render: viewDiscovery },
  license: { title: "License 管理", render: viewLicense },
  lifecycle: { title: "生命周期与变更", render: viewLifecycle },
  topology: { title: "应用拓扑关系", render: viewTopology },
  reports: { title: "报表中心", render: viewReports },
  compliance: { title: "成本与合规", render: viewCompliance },
  audit: { title: "权限与审计", render: viewAudit }
};

let topoZoom = 1;

function navigate(view) {
  const cfg = VIEWS[view] || VIEWS.dashboard;
  $$("#nav .nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  $("#crumb").textContent = cfg.title;
  $("#view").innerHTML = cfg.render();
  $("#view").scrollTop = 0;
  topoZoom = 1;
  bindView(view);
}

function bindView(view) {
  // 通用：视图内导航按钮
  $$("#view [data-nav]").forEach((b) => b.addEventListener("click", () => navigate(b.dataset.nav)));

  if (view === "ledger") bindLedger();

  if (view === "classification") bindClassification();

  if (view === "discovery") {
    $("#btnScan").addEventListener("click", () => toast("正在扫描代码仓库 / 进程 / 端口…（演示）"));
    $("#btnSync").addEventListener("click", () => toast("已将 2 个新增应用同步至资产台账（演示）"));
    $$("#view [data-disc]").forEach((el) => el.addEventListener("click", () => toast(`已确认「${el.dataset.disc}」（演示）`)));
  }

  if (view === "license") {
    $("#btnRule").addEventListener("click", () => toast("打开预警规则设置：到期前 90/30/7 天提醒（演示）"));
    $("#btnLicAdd").addEventListener("click", () => toast("打开 License 登记表单（演示）"));
  }

  if (view === "lifecycle") {
    $("#btnChangeAdd").addEventListener("click", () => toast("打开变更工单发起页（演示）"));
    $("#btnRetireFlow").addEventListener("click", () => toast("打开退役评估流程（演示）"));
    $$("#view [data-chg]").forEach((el) => el.addEventListener("click", () => toast(`查看工单 ${el.dataset.chg}（演示）`)));
  }

  if (view === "topology") {
    const applyZoom = () => {
      const c = $("#topoCanvas");
      if (!c) return;
      const inner = c.querySelector("svg");
      const nodes = c.querySelectorAll(".topo-node");
      nodes.forEach((n) => { n.style.transform = `translate(-50%,-50%) scale(${topoZoom})`; });
    };
    $("#topoZoomIn").addEventListener("click", () => { topoZoom = Math.min(2, topoZoom + 0.15); applyZoom(); });
    $("#topoZoomOut").addEventListener("click", () => { topoZoom = Math.max(0.6, topoZoom - 0.15); applyZoom(); });
    $("#topoExport").addEventListener("click", () => toast("拓扑图已导出为 PNG / PDF（演示）"));
    $$("#view [data-topo]").forEach((el) => el.addEventListener("click", () => {
      const n = TOPO.nodes.find((x) => x.id === el.dataset.topo);
      openDrawer("节点依赖详情", `
        <div style="font-size:16px;font-weight:750;margin-bottom:6px">${n.label}</div>
        <div class="muted" style="margin-bottom:16px">节点类型：${n.type === "infra" ? "基础设施" : n.type === "core" ? "核心应用" : "普通应用"}</div>
        <div class="section-title">上游调用方</div>
        <div>${TOPO.edges.filter((e) => e[1] === n.id).map((e) => `<span class="tag">${TOPO.nodes.find((x) => x.id === e[0]).label}</span>`).join("") || '<span class="muted">无</span>'}</div>
        <div class="section-title">下游依赖</div>
        <div>${TOPO.edges.filter((e) => e[0] === n.id).map((e) => `<span class="tag">${TOPO.nodes.find((x) => x.id === e[1]).label}</span>`).join("") || '<span class="muted">无</span>'}</div>
      `);
    }));
  }

  if (view === "reports") {
    $("#btnPush").addEventListener("click", () => toast("打开定时推送设置（演示）"));
    $("#btnReportAdd").addEventListener("click", () => toast("打开自定义报表设计器（演示）"));
    $$("#view [data-report]").forEach((el) => el.addEventListener("click", () => toast(`打开报表「${el.dataset.report}」（演示）`)));
    $$("#view [data-report-export]").forEach((el) => el.addEventListener("click", () => toast(`导出报表「${el.dataset.reportExport}」（演示）`)));
  }

  if (view === "compliance") {
    $("#btnCostSync").addEventListener("click", () => toast("已从财务系统同步成本数据（演示）"));
    $("#btnComplianceCheck").addEventListener("click", () => toast("已发起合规自查任务并通知责任人（演示）"));
  }

  if (view === "audit") {
    $("#btnRoleAdd").addEventListener("click", () => toast("打开新增角色与权限配置（演示）"));
    $("#btnAuditExport").addEventListener("click", () => toast("审计日志已导出（演示）"));
  }
}

/* ---------------------- 初始化 ---------------------- */
function init() {
  $$("#nav .nav-item").forEach((b) => b.addEventListener("click", () => navigate(b.dataset.view)));
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#drawerMask").addEventListener("click", closeDrawer);
  $("#globalSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      ledgerState.q = e.target.value;
      navigate("ledger");
      toast(`已按「${e.target.value}」在台账中检索`);
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  navigate("dashboard");
}

init();
