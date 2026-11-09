/* =========================================================
   IT应用资产管理系统 · Mock 数据层
   对应需求：《IT应用资产管理系统特性与功能梳理》
   ========================================================= */
(function () {
  'use strict';

  function dOff(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function tOff(days, hh, mm) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hh || 9, mm || 30, 0, 0);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' '
      + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ---------------- 1. 分类字典（含 应用域 → 产品线 从属关系） ---------------- */
  var domains = [
    { id: 'dm-retail', name: '零售业务', code: 'RET', sort: 1, enabled: true, desc: '面向 C 端零售与会员经营业务' },
    { id: 'dm-supply', name: '供应链', code: 'SUP', sort: 2, enabled: true, desc: '采购、库存、物流等供应链域' },
    { id: 'dm-fin', name: '财务共享', code: 'FIN', sort: 3, enabled: true, desc: '财务、资金、税务、共享服务' },
    { id: 'dm-cs', name: '客户服务', code: 'CSV', sort: 4, enabled: true, desc: '客服、工单、客户体验' },
    { id: 'dm-hr', name: '人力资源', code: 'HRM', sort: 5, enabled: true, desc: '组织人事、招聘、薪酬' },
    { id: 'dm-data', name: '数据平台', code: 'DAT', sort: 6, enabled: true, desc: '数据中台、公共技术平台' }
  ];

  var productLines = [
    { id: 'pl-vip', name: '会员产品线', code: 'PL-VIP', domainId: 'dm-retail', owner: '李明', sort: 1, enabled: true },
    { id: 'pl-mkt', name: '营销产品线', code: 'PL-MKT', domainId: 'dm-retail', owner: '陈涛', sort: 2, enabled: true },
    { id: 'pl-trade', name: '交易产品线', code: 'PL-TRD', domainId: 'dm-supply', owner: '孙鹏', sort: 3, enabled: true },
    { id: 'pl-scm', name: '供应链产品线', code: 'PL-SCM', domainId: 'dm-supply', owner: '吴强', sort: 4, enabled: true },
    { id: 'pl-pay', name: '支付产品线', code: 'PL-PAY', domainId: 'dm-fin', owner: '何静', sort: 5, enabled: true },
    { id: 'pl-fin', name: '财务产品线', code: 'PL-FIN', domainId: 'dm-fin', owner: '曹敏', sort: 6, enabled: true },
    { id: 'pl-cs', name: '客服产品线', code: 'PL-CS', domainId: 'dm-cs', owner: '蒋莉', sort: 7, enabled: true },
    { id: 'pl-hr', name: '人力产品线', code: 'PL-HR', domainId: 'dm-hr', owner: '谢峰', sort: 8, enabled: true },
    { id: 'pl-data', name: '数据产品线', code: 'PL-DAT', domainId: 'dm-data', owner: '韩雪', sort: 9, enabled: true },
    { id: 'pl-plat', name: '平台产品线', code: 'PL-PLT', domainId: 'dm-data', owner: '沈莉', sort: 10, enabled: true },
    { id: 'pl-infra', name: '基础架构产品线', code: 'PL-INF', domainId: 'dm-data', owner: '段誉', sort: 11, enabled: true },
    { id: 'pl-legacy', name: '历史归档产品线', code: 'PL-ARC', domainId: 'dm-retail', owner: '张伟', sort: 12, enabled: false }
  ];

  var statuses = [
    { id: 'st-draft', name: '草稿', color: 'gray', sort: 1, enabled: true, allowFlow: true, desc: '已登记未上线，信息完善中' },
    { id: 'st-run', name: '运行中', color: 'green', sort: 2, enabled: true, allowFlow: true, desc: '生产环境正常提供服务' },
    { id: 'st-change', name: '变更中', color: 'orange', sort: 3, enabled: true, allowFlow: true, desc: '存在在途变更工单' },
    { id: 'st-pause', name: '暂停', color: 'cyan', sort: 4, enabled: true, allowFlow: true, desc: '业务暂停但资源未回收' },
    { id: 'st-retired', name: '已退役', color: 'gray', sort: 5, enabled: true, allowFlow: false, desc: '已完成下线与资源回收' }
  ];

  var levels = [
    { id: 'lv-core', name: '核心', color: 'red', weight: 3, sort: 1, enabled: true, desc: '故障将直接导致业务中断' },
    { id: 'lv-major', name: '重要', color: 'orange', weight: 2, sort: 2, enabled: true, desc: '影响关键业务流程效率' },
    { id: 'lv-normal', name: '一般', color: 'blue', weight: 1, sort: 3, enabled: true, desc: '影响范围有限，可降级使用' }
  ];

  var deployments = [
    { id: 'dp-physical', name: '物理机', sort: 1, enabled: true, desc: '自建机房物理服务器部署' },
    { id: 'dp-vm', name: '虚拟机', sort: 2, enabled: true, desc: '虚拟化资源池部署' },
    { id: 'dp-k8s', name: '容器化（K8s）', sort: 3, enabled: true, desc: 'Kubernetes 容器编排部署' },
    { id: 'dp-cloud', name: '云原生', sort: 4, enabled: true, desc: '公有云 PaaS / SaaS 服务' },
    { id: 'dp-hybrid', name: '混合部署', sort: 5, enabled: true, desc: '本地与云上混合架构' }
  ];

  var devModes = [
    { id: 'dv-self', name: '自主研发', sort: 1, enabled: true, desc: '内部团队自研并持有源码' },
    { id: 'dv-buy', name: '采购商用', sort: 2, enabled: true, desc: '外购商业软件产品' },
    { id: 'dv-out', name: '外包开发', sort: 3, enabled: true, desc: '委托第三方开发交付' },
    { id: 'dv-joint', name: '联合研发', sort: 4, enabled: true, desc: '与合作方联合建设' }
  ];

  /* ---------------- 2. 应用资产台账 ---------------- */
  /* [名称, 拼音首字母, 应用域, 产品线, 重要等级, 状态, 部署形式, 开发模式, 负责人, 所属部门, 上线日期, 功能简述] */
  var raw = [
    ['会员中心', 'hyzx', 'dm-retail', 'pl-vip', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '李明', '零售运营中心', '2019-06-18', '统一会员注册、会员等级、积分与权益的核心系统，支撑全集团会员体系统一运营。'],
    ['会员权益平台', 'hyqypt', 'dm-retail', 'pl-vip', 'lv-major', 'st-run', 'dp-cloud', 'dv-self', '王芳', '零售运营中心', '2021-04-09', '会员积分兑换、权益发放与核销，连接营销与会员体系。'],
    ['营销活动引擎', 'yxhdyq', 'dm-retail', 'pl-mkt', 'lv-core', 'st-change', 'dp-k8s', 'dv-self', '陈涛', '市场营销部', '2020-09-12', '促销活动编排、投放与效果回收，支撑大促峰值流量。'],
    ['优惠券中心', 'yhqz', 'dm-retail', 'pl-mkt', 'lv-major', 'st-run', 'dp-vm', 'dv-self', '刘颖', '市场营销部', '2020-11-25', '券模板管理、券码生成、发放与核销。'],
    ['精准营销平台', 'jzyxpt', 'dm-retail', 'pl-mkt', 'lv-normal', 'st-run', 'dp-k8s', 'dv-joint', '赵磊', '市场营销部', '2022-03-15', '基于用户画像的人群圈选与精准触达。'],
    ['电商交易平台', 'dsjypt', 'dm-supply', 'pl-trade', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '孙鹏', '交易研发部', '2018-05-20', 'App / 小程序 / H5 全渠道下单与交易履约主链路。'],
    ['订单中心', 'ddzx', 'dm-supply', 'pl-trade', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '周婷', '交易研发部', '2018-07-01', '全渠道订单统一受理、流转、状态与履约管理。'],
    ['库存中心', 'kczx', 'dm-supply', 'pl-scm', 'lv-core', 'st-run', 'dp-vm', 'dv-self', '吴强', '供应链技术部', '2019-02-14', '多仓库存同步、占用、调拨与盘点。'],
    ['采购协同平台', 'cgxtpt', 'dm-supply', 'pl-scm', 'lv-major', 'st-run', 'dp-vm', 'dv-buy', '郑楠', '供应链管理部', '2020-06-30', '采购寻源、比价、订单与供应商协同。'],
    ['供应商门户', 'gyswm', 'dm-supply', 'pl-scm', 'lv-normal', 'st-run', 'dp-vm', 'dv-out', '冯磊', '供应链管理部', '2021-09-01', '供应商自助注册、对账与交付跟踪。'],
    ['支付网关', 'zfwg', 'dm-fin', 'pl-pay', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '何静', '支付技术部', '2019-10-08', '统一支付路由、渠道适配与支付对账。'],
    ['资金清结算平台', 'zjqjspt', 'dm-fin', 'pl-pay', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '许伟', '支付技术部', '2020-01-16', '资金清算、结算与商户分账。'],
    ['财务共享中心', 'cwgxzx', 'dm-fin', 'pl-fin', 'lv-core', 'st-run', 'dp-cloud', 'dv-buy', '曹敏', '财务共享中心', '2019-08-22', '费用报销、总账核算与财务共享作业。'],
    ['电子发票平台', 'dzfppt', 'dm-fin', 'pl-fin', 'lv-major', 'st-run', 'dp-cloud', 'dv-buy', '邓超', '财务共享中心', '2021-05-11', '发票开具、查验与归档管理。'],
    ['智能客服平台', 'znkfpt', 'dm-cs', 'pl-cs', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '蒋莉', '客户服务中心', '2020-12-03', '多渠道在线客服、智能机器人应答与工单流转。'],
    ['客户之声平台', 'khzspt', 'dm-cs', 'pl-cs', 'lv-normal', 'st-run', 'dp-cloud', 'dv-out', '潘瑜', '客户服务中心', '2022-07-19', '客户反馈采集、情感分析与体验改进闭环。'],
    ['人力资源系统', 'rlzyxt', 'dm-hr', 'pl-hr', 'lv-major', 'st-run', 'dp-vm', 'dv-buy', '谢峰', '人力资源部', '2018-11-05', '组织架构、人事、薪酬与考勤一体化管理。'],
    ['招聘管理平台', 'zpglpt', 'dm-hr', 'pl-hr', 'lv-normal', 'st-run', 'dp-cloud', 'dv-buy', '唐悦', '人力资源部', '2021-03-22', '招聘需求、简历筛选、面试与录用全流程。'],
    ['数据中台', 'sjzt', 'dm-data', 'pl-data', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '韩雪', '数据平台部', '2020-04-27', '数据采集、治理、建模与资产化统一平台。'],
    ['数据可视化大屏', 'sjkxhdp', 'dm-data', 'pl-data', 'lv-major', 'st-run', 'dp-k8s', 'dv-self', '曹阳', '数据平台部', '2021-06-08', '经营指标实时可视化与指挥中心大屏。'],
    ['报表服务平台', 'bbfwpt', 'dm-data', 'pl-data', 'lv-normal', 'st-run', 'dp-k8s', 'dv-self', '秦朗', '数据平台部', '2022-01-12', '统一报表开发、订阅与定时推送服务。'],
    ['用户中心', 'yhzx', 'dm-data', 'pl-plat', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '沈莉', '平台技术部', '2019-04-15', '统一身份、账号、认证与授权体系。'],
    ['消息推送平台', 'xxtspt', 'dm-data', 'pl-plat', 'lv-major', 'st-run', 'dp-k8s', 'dv-self', '卢伟', '平台技术部', '2020-08-19', '短信、邮件、站内信、App 推送统一通道。'],
    ['API 网关', 'apigw', 'dm-data', 'pl-plat', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '贺军', '平台技术部', '2019-12-10', '接口路由、限流熔断、鉴权与开放能力托管。'],
    ['配置中心', 'pzzx', 'dm-data', 'pl-infra', 'lv-major', 'st-run', 'dp-k8s', 'dv-self', '崔浩', '基础架构部', '2020-02-25', '分布式配置统一管理与灰度发布。'],
    ['运维监控平台', 'ywjkpt', 'dm-data', 'pl-infra', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '段誉', '基础架构部', '2018-09-30', '基础设施与应用监控、告警与容量分析。'],
    ['日志分析平台', 'rzfxpt', 'dm-data', 'pl-infra', 'lv-major', 'st-run', 'dp-k8s', 'dv-self', '吴迪', '基础架构部', '2020-07-14', '日志采集、检索与安全审计分析。'],
    ['主数据管理', 'zdsjgl', 'dm-data', 'pl-infra', 'lv-major', 'st-run', 'dp-vm', 'dv-buy', '石磊', '基础架构部', '2019-05-06', '主数据标准建模、清洗与统一分发。'],
    ['合同管理系统', 'htglxt', 'dm-fin', 'pl-fin', 'lv-normal', 'st-run', 'dp-cloud', 'dv-buy', '方圆', '法务合规部', '2021-11-17', '合同起草、审批、签署与归档管理。'],
    ['风控决策平台', 'fkjcpt', 'dm-fin', 'pl-pay', 'lv-core', 'st-run', 'dp-k8s', 'dv-self', '江晨', '风险管理部', '2021-02-09', '交易反欺诈、规则引擎与实时风险决策。'],
    ['移动办公平台', 'ydbgpt', 'dm-hr', 'pl-hr', 'lv-major', 'st-run', 'dp-cloud', 'dv-joint', '卢宁', '人力资源部', '2022-05-23', '移动审批、协同办公与消息触达。'],
    ['档案管理系统', 'daglxt', 'dm-hr', 'pl-hr', 'lv-normal', 'st-pause', 'dp-vm', 'dv-buy', '乔木', '行政事务部', '2019-09-11', '电子档案归档、借阅与销毁管理（业务暂停，资源待回收）。'],
    ['老版积分商城', 'lbjfsc', 'dm-retail', 'pl-legacy', 'lv-normal', 'st-retired', 'dp-vm', 'dv-self', '张伟', '零售运营中心', '2016-03-01', '已全量下线，积分兑换能力迁移至会员权益平台。'],
    ['智能定价系统', 'zndjxt', 'dm-supply', 'pl-trade', 'lv-normal', 'st-draft', 'dp-hybrid', 'dv-joint', '顾晨', '交易研发部', '2025-11-01', '基于竞争态势与需求的动态定价（建设期，尚未上线）。']
  ];

  var infraPool = [
    ['MySQL 8.0', 'Redis 6', 'Kafka'],
    ['MySQL 8.0', 'Redis 6', 'Elasticsearch'],
    ['Oracle 19c', 'Redis 6'],
    ['MySQL 8.0', 'RocketMQ', 'Nginx'],
    ['PostgreSQL 15', 'Redis 6', 'Kafka'],
    ['MySQL 8.0', 'Kafka', 'Kubernetes']
  ];
  var vendorPool = ['阿里云', '腾讯云', '华为云', '自建机房', 'SAP', '用友', '金蝶', 'Oracle'];
  var tagPool = [
    ['等保三级', 'ISO27001'], ['等保二级'], ['等保三级', '行业合规'],
    ['ISO27001', '行业合规'], ['等保二级', 'ISO27001'], ['等保三级']
  ];
  var dataInPool = [
    ['会员基础信息', '会员中心'], ['订单明细', '订单中心'], ['商品主数据', '主数据管理'],
    ['支付结果', '支付网关'], ['用户账号', '用户中心'], ['合同信息', '合同管理系统'],
    ['供应商主数据', '主数据管理'], ['库存快照', '库存中心'], ['组织人事数据', '人力资源系统'],
    ['客户反馈数据', '客户之声平台']
  ];
  var dataOutPool = [
    ['交易域数据', '数据中台'], ['会员标签', '精准营销平台'], ['经营报表', '数据可视化大屏'],
    ['风险评分', '风控决策平台'], ['账户信息', '各业务系统'], ['对账文件', '财务共享中心'],
    ['监控指标', '运维监控平台'], ['日志数据', '日志分析平台'], ['主数据分发', '各业务系统']
  ];
  var techPool = [
    ['Java / Spring Cloud', 'Vue 3', 'MySQL'],
    ['Go', 'React', 'PostgreSQL'],
    ['Java', 'Vue 3', 'Oracle'],
    ['Node.js', 'React', 'MongoDB'],
    ['Python', 'Vue 3', 'MySQL']
  ];
  var usersPool = [
    '集团全体会员（约 1800 万）', '内部运营人员（约 320 人）', '集团员工（约 12000 人）',
    '外部供应商（4600 家）', '业务及管理人员（850 人）', '财务与审计人员（260 人）'
  ];

  function mods(i) {
    var base = [
      ['基础数据管理', '基础资料、字典与参数配置维护'],
      ['业务流程处理', '核心业务流转与状态管理'],
      ['查询与统计分析', '多维查询、导出与统计报表'],
      ['对外接口服务', 'Restful API 对外能力开放'],
      ['权限与审计', '角色权限控制与操作留痕']
    ];
    var extra = [
      ['规则引擎', '业务规则可配置化编排'],
      ['定时任务调度', '批量任务与定时作业管理'],
      ['消息通知', '事件驱动的消息触达'],
      ['数据同步', '与上下游系统的数据同步'],
      ['监控告警', '运行指标采集与阈值告警']
    ];
    var list = [];
    for (var k = 0; k < base.length; k++) list.push({ name: base[k][0], desc: base[k][1] });
    var e = extra[i % extra.length];
    list.push({ name: e[0], desc: e[1] });
    return list;
  }

  var apps = raw.map(function (r, i) {
    var health = [96, 88, 74, 92, 68, 99, 97, 95, 82, 90, 99, 98][i % 12];
    return {
      id: 'app-' + (i + 1),
      code: 'APP-' + String(i + 1).padStart(4, '0'),
      name: r[0], pinyin: r[1],
      domainId: r[2], productLineId: r[3], levelId: r[4], statusId: r[5],
      deployId: r[6], devModeId: r[7], owner: r[8], dept: r[9],
      onlineDate: r[10],
      retireDate: r[5] === 'st-retired' ? '2024-06-30' : '',
      brief: r[11],
      devOrg: r[7] === 'dv-self' ? '集团研发中心' : (r[7] === 'dv-buy' ? '外部厂商交付' : '合作方联合团队'),
      vendor: vendorPool[i % vendorPool.length],
      techStack: techPool[i % techPool.length],
      infra: infraPool[i % infraPool.length],
      tags: r[5] === 'st-retired' ? ['已下线'] : tagPool[i % tagPool.length],
      health: health,
      cost: {
        cloud: 12 + (i * 7) % 96,
        server: 8 + (i * 5) % 60,
        license: (i % 4 === 0) ? 20 + (i * 3) % 80 : (i % 3 === 0 ? 6 + (i * 2) % 24 : 0),
        other: 3 + (i * 2) % 12
      },
      users: [usersPool[i % usersPool.length]],
      value: r[0] + '在集团该业务领域承担关键支撑作用，' +
        (r[4] === 'lv-core' ? '属于核心系统，故障将直接影响主营业务连续性，需重点保障。' : '为主营业务提供重要能力支撑，具备一定的降级使用空间。'),
      modules: mods(i),
      inputs: [dataInPool[i % dataInPool.length], dataInPool[(i + 3) % dataInPool.length]],
      outputs: [dataOutPool[i % dataOutPool.length], dataOutPool[(i + 4) % dataOutPool.length]],
      createTime: '2024-' + String((i % 9) + 1).padStart(2, '0') + '-' + String((i % 27) + 1).padStart(2, '0'),
      updateTime: tOff(-(i % 45) - 1, 10, 12),
      discoverSource: ['人工登记', '代码仓库扫描', 'CMDB 同步', '进程端口发现'][i % 4],
      compliance: r[5] === 'st-retired' ? 'archived' : ['compliant', 'compliant', 'pending', 'risk'][i % 4]
    };
  });

  var byName = {};
  apps.forEach(function (a) { byName[a.name] = a; });

  /* 依赖关系：[上游应用, 下游应用] */
  var edgeNames = [
    ['会员权益平台', '会员中心'], ['会员权益平台', '优惠券中心'], ['会员权益平台', '消息推送平台'],
    ['营销活动引擎', '会员中心'], ['营销活动引擎', '优惠券中心'], ['营销活动引擎', '精准营销平台'], ['营销活动引擎', '消息推送平台'],
    ['优惠券中心', '会员中心'],
    ['精准营销平台', '数据中台'], ['精准营销平台', '会员中心'],
    ['电商交易平台', '订单中心'], ['电商交易平台', '库存中心'], ['电商交易平台', '支付网关'],
    ['电商交易平台', '优惠券中心'], ['电商交易平台', '会员中心'],
    ['订单中心', '库存中心'], ['订单中心', '支付网关'], ['订单中心', '消息推送平台'],
    ['库存中心', '主数据管理'],
    ['采购协同平台', '供应商门户'], ['采购协同平台', '主数据管理'], ['采购协同平台', '财务共享中心'],
    ['供应商门户', '主数据管理'],
    ['支付网关', '风控决策平台'], ['支付网关', '用户中心'], ['支付网关', '资金清结算平台'],
    ['风控决策平台', '数据中台'], ['风控决策平台', '会员中心'],
    ['资金清结算平台', '财务共享中心'], ['资金清结算平台', '电子发票平台'],
    ['财务共享中心', '电子发票平台'], ['财务共享中心', '报表服务平台'],
    ['电子发票平台', '主数据管理'],
    ['智能客服平台', '订单中心'], ['智能客服平台', '会员中心'], ['智能客服平台', '消息推送平台'],
    ['客户之声平台', '数据中台'],
    ['人力资源系统', '用户中心'], ['人力资源系统', '消息推送平台'],
    ['招聘管理平台', '人力资源系统'],
    ['数据中台', '主数据管理'], ['数据中台', '日志分析平台'],
    ['数据可视化大屏', '数据中台'], ['数据可视化大屏', '报表服务平台'],
    ['报表服务平台', '数据中台'],
    ['用户中心', '配置中心'], ['用户中心', '消息推送平台'],
    ['消息推送平台', 'API 网关'],
    ['API 网关', '用户中心'], ['API 网关', '配置中心'], ['API 网关', '日志分析平台'],
    ['配置中心', '日志分析平台'],
    ['运维监控平台', '日志分析平台'], ['运维监控平台', '消息推送平台'],
    ['主数据管理', '用户中心'],
    ['合同管理系统', '财务共享中心'], ['合同管理系统', '主数据管理'],
    ['移动办公平台', '用户中心'], ['移动办公平台', '消息推送平台'], ['移动办公平台', '人力资源系统'],
    ['档案管理系统', '合同管理系统'], ['档案管理系统', '主数据管理']
  ];

  var edges = [];
  edgeNames.forEach(function (e) {
    if (byName[e[0]] && byName[e[1]]) edges.push({ from: byName[e[0]].id, to: byName[e[1]].id, type: 'call' });
  });
  apps.forEach(function (a) {
    (a.infra || []).forEach(function (n) {
      edges.push({ from: a.id, to: 'sys-' + n.replace(/[^A-Za-z0-9]/g, ''), type: 'infra', label: n });
    });
  });

  function ups(a) { return edges.filter(function (e) { return e.to === a.id && e.type === 'call'; }).map(function (e) { return e.from; }); }
  function downs(a) { return edges.filter(function (e) { return e.from === a.id && e.type === 'call'; }).map(function (e) { return e.to; }); }
  function sysDeps(a) { return edges.filter(function (e) { return e.from === a.id && e.type === 'infra'; }).map(function (e) { return e.to; }); }

  /* ---------------- 3. License 台账 ---------------- */
  var licenseSeed = [
    ['Oracle Database 19c 企业版', 'Oracle', '永久授权', 4, -700, 20, '服务器', 96, 'app-13'],
    ['WebLogic 中间件授权', 'Oracle', '永久授权', 8, -520, 30, '服务器', 48, 'app-6'],
    ['Kubernetes 商业支持', 'RedHat', '订阅', 120, -400, 60, '基础设施', 72, 'app-23'],
    ['Elasticsearch 商业版', 'Elastic', '订阅', 32, -380, 45, '基础设施', 36, 'app-27'],
    ['SAP ERP 用户许可', 'SAP', '永久授权', 500, -1200, 90, '业务系统', 320, 'app-13'],
    ['用友 NC 财务许可', '用友', '订阅', 300, -300, 30, '业务系统', 88, 'app-13'],
    ['企业微信服务包', '腾讯', '订阅', 12000, -200, 15, '协作平台', 24, 'app-31'],
    ['阿里云 RDS 授权', '阿里云', '按量付费', 60, -600, 30, '数据库', 64, 'app-19'],
    ['F5 负载均衡授权', 'F5', '永久授权', 6, -900, 60, '基础设施', 110, 'app-11'],
    ['Tableau 报表许可', 'Salesforce', '订阅', 80, -260, 30, '业务系统', 45, 'app-20'],
    ['Fortify 代码扫描许可', 'Micro Focus', '订阅', 20, -100, 25, '研发工具', 30, 'app-23'],
    ['Nginx Plus 支持服务', 'F5', '订阅', 15, -180, 40, '基础设施', 18, 'app-23'],
    ['达梦数据库授权', '达梦', '永久授权', 12, -450, 60, '数据库', 56, 'app-28'],
    ['JDK 商业支持', 'Oracle', '订阅', 200, -60, 30, '研发工具', 42, 'app-26'],
    ['勒索防护终端授权', '奇安信', '订阅', 5000, -240, 20, '安全', 130, 'app-26'],
    ['自动化测试平台许可', '微盟', '订阅', 40, -30, 15, '研发工具', 26, 'app-23']
  ];
  var expireOffsets = [12, 26, 45, -6, 78, 33, 9, 120, 210, 62, 5, 96, 150, 28, 41, -2];
  var licenses = licenseSeed.map(function (l, i) {
    return {
      id: 'lic-' + (i + 1),
      product: l[0], vendor: l[1], type: l[2], qty: l[3],
      buyDate: dOff(l[4]), expireDate: dOff(expireOffsets[i]),
      alertDays: l[5], category: l[6], amount: l[7], appId: l[8],
      responsible: ['李明', '曹敏', '段誉', '韩雪'][i % 4],
      licenseNo: 'LIC-' + String(2024000 + i * 37),
      channels: i % 3 === 0 ? ['邮件', '站内消息'] : (i % 3 === 1 ? ['站内消息'] : ['邮件', '站内消息', '企业微信']),
      remark: '授权数量需与实际部署实例保持一致，续期前完成合规校核。'
    };
  });

  /* ---------------- 4. 变更工单 / 退役评估 ---------------- */
  var ticketSeed = [
    ['升级', 'app-3', '营销活动引擎 V2.4 版本升级', '陈涛', '已通过', '2025-09-28', '王磊', '版本 2.3 → 2.4，新增实时人群圈选能力，需架构评审通过后灰度发布。', '高'],
    ['架构调整', 'app-6', '交易主链路服务拆分', '孙鹏', '审批中', '2025-10-08', '王磊', '订单与支付模块拆分，降低单点故障风险，需完成流量切换预案。', '高'],
    ['负责人变更', 'app-8', '库存中心负责人变更', '吴强', '待审批', '2025-10-15', '—', '原负责人吴强调岗，变更为李强，需完成交接确认与权限移交。', '低'],
    ['升级', 'app-20', '数据可视化大屏底座升级', '曹阳', '已通过', '2025-09-12', '王磊', '大屏渲染引擎升级，提升并发承载能力至 5000 QPS。', '中'],
    ['架构调整', 'app-19', '数据中台存储分层改造', '韩雪', '已驳回', '2025-09-05', '—', '冷热数据分层方案缺少成本测算与回退方案，退回补充材料。', '高'],
    ['升级', 'app-11', '支付网关渠道适配扩展', '何静', '审批中', '2025-10-11', '王磊', '新增两家银行渠道适配，涉及资金安全需二次评审。', '高'],
    ['退役', 'app-33', '老版积分商城退役评估', '张伟', '已通过', '2025-06-20', '王磊', '业务已迁移至会员权益平台，完成数据归档与资源回收核查。', '中'],
    ['退役', 'app-32', '档案管理系统退役评估', '乔木', '审批中', '2025-10-02', '王磊', '业务暂停超过 6 个月，拟启动退役流程，需完成档案数据归档确认。', '中'],
    ['升级', 'app-19', '数据中台 ETL 引擎升级', '韩雪', '待审批', '2025-10-17', '—', '调度引擎升级至 3.x，需评估对现有作业的兼容性影响。', '中'],
    ['负责人变更', 'app-15', '智能客服平台负责人变更', '蒋莉', '已通过', '2025-08-30', '王磊', '负责人变更为张敏，已完成交接与权限移交。', '低']
  ];
  var changes = ticketSeed.map(function (t, i) {
    var app = apps.filter(function (a) { return a.id === t[1]; })[0] || apps[0];
    /* ticketSeed 结构：[类型, appId, 标题, 申请人, 状态, 提交日期, 审批人, 原因, 影响评估] */
    var cType = t[0], cAppId = t[1], cTitle = t[2], cApplicant = t[3];
    var cStatus = t[4], cCreated = t[5], cApprover = t[6], cReason = t[7], cImpact = t[8];
    var tl = [
      { time: cCreated + ' 09:20', title: '提交申请', desc: cApplicant + ' 提交「' + cType + '」申请', state: 'ok' },
      { time: cCreated + ' 09:21', title: '资料自动校验', desc: '系统校验台账字段完整性：通过', state: 'ok' }
    ];
    if (cStatus === '待审批') {
      tl.push({ time: cCreated + ' 09:22', title: '待业务负责人审批', desc: '当前节点：业务负责人审批', state: 'warn' });
    } else if (cStatus === '审批中') {
      tl.push(
        { time: cCreated + ' 14:05', title: '业务负责人审批通过', desc: '进入架构评审节点', state: 'ok' },
        { time: cCreated + ' 14:06', title: '架构评审中', desc: '当前节点：架构评审', state: 'warn' });
    } else if (cStatus === '已通过') {
      tl.push({ time: cCreated + ' 16:30', title: '审批通过', desc: '审批通过，已自动回填资产台账并记录留痕', state: 'ok' });
    } else {
      tl.push({ time: cCreated + ' 16:30', title: '审批驳回', desc: '驳回原因：' + cReason, state: 'warn' });
    }
    return {
      id: 'CHG-' + (2500 + i),
      type: cType, appId: cAppId, appName: app.name, title: cTitle,
      applicant: cApplicant, status: cStatus, createdAt: cCreated, approver: cApprover,
      reason: cReason, impact: cImpact,
      node: cStatus === '待审批' ? '业务负责人审批'
        : (cStatus === '审批中' ? '架构评审' : (cStatus === '已通过' ? '已完成' : '已终止')),
      beforeStatus: app.statusId, beforeOwner: app.owner,
      timeline: tl
    };
  });

  /* ---------------- 5. 操作审计日志 ---------------- */
  var auditPool = [
    ['新增应用', 'create'], ['编辑应用', 'update'], ['删除应用', 'delete'], ['导出资产清单', 'export'],
    ['导入资产数据', 'import'], ['修改分类字典', 'config'], ['审批变更工单', 'approve'],
    ['角色权限调整', 'role'], ['License 登记', 'license'], ['合规自查提交', 'compliance']
  ];
  var auditUsers = [['张伟', '资产管理员'], ['王磊', '架构管理员'], ['李明', '应用负责人'], ['曹敏', '财务共享中心'], ['赵颖', '审计员'], ['system', '系统任务']];
  var audits = [];
  for (var i = 0; i < 46; i++) {
    var ap0 = auditPool[i % auditPool.length];
    var u0 = auditUsers[i % auditUsers.length];
    var ap = apps[(i * 5 + 2) % apps.length];
    audits.push({
      id: 'LOG-' + (100000 + i),
      time: tOff(-i, 8 + (i % 10), (i * 7) % 60),
      user: u0[0], role: u0[1],
      action: ap0[0], actionType: ap0[1],
      object: ap.name, objectCode: ap.code,
      ip: '10.' + (20 + i % 30) + '.' + (i % 200) + '.' + (10 + i % 240),
      result: (i % 9 === 0) ? '失败' : '成功',
      before: ap0[1] === 'update' ? ap.name + ' ｜ 状态：运行中 ｜ 负责人：' + ap.owner : '—',
      after: ap0[1] === 'update' ? ap.name + ' ｜ 状态：变更中 ｜ 负责人：' + ap.owner
        : (ap0[1] === 'create' ? '应用「' + ap.name + '」已创建并进入草稿状态' : '操作已提交并留存数据快照'),
      remark: ap0[1] === 'export' ? '导出范围：筛选结果共 ' + (12 + i % 20) + ' 条' : '内控留痕，在线保留 3 年'
    });
  }

  /* ---------------- 6. 自动发现与采集 ---------------- */
  var sources = [
    { id: 'src-git', name: '研发管理平台（代码仓库）', type: '主动采集', icon: '🧩', color: 'b-blue', status: '已接入', lastSync: tOff(0, 6, 20), records: 4821, desc: '扫描代码仓库与应用架构关联，校验应用定位与边界合规性' },
    { id: 'src-cmdb', name: 'CMDB 配置管理库', type: '双向同步', icon: '🗄️', color: 'b-purple', status: '已接入', lastSync: tOff(0, 5, 10), records: 12680, desc: '同步服务器、中间件等配置项，建立应用 - 基础设施映射关系' },
    { id: 'src-mon', name: '监控平台', type: '单向采集', icon: '📈', color: 'b-green', status: '已接入', lastSync: tOff(0, 7, 0), records: 9540, desc: '采集应用可用性、响应时间等指标，支撑资产健康度评估' },
    { id: 'src-proc', name: '进程 / 端口扫描器', type: '主动采集', icon: '🔎', color: 'b-cyan', status: '已接入', lastSync: tOff(-1, 2, 0), records: 3120, desc: '自动识别应用进程、服务端口与依赖组件' }
  ];
  var discoveries = [
    { id: 'DSC-1024', name: '智能定价系统', type: '新增应用', source: '研发管理平台（代码仓库）', detail: '仓库 prj-pricing-v2 已建立独立部署单元，但未在资产台账登记', level: '重要', owner: '顾晨', foundAt: tOff(-1, 9, 20), status: '待确认' },
    { id: 'DSC-1023', name: '会员中心 - 灰度集群', type: '架构变更', source: '进程 / 端口扫描器', detail: '发现新增服务端口 18081-18083，疑似灰度集群扩容', level: '核心', owner: '李明', foundAt: tOff(-1, 3, 12), status: '待确认' },
    { id: 'DSC-1022', name: '报表服务平台 - 旧版节点', type: '下线应用', source: 'CMDB 配置管理库', detail: '原 6 台节点连续 30 天无流量与进程活动，疑似已下线', level: '一般', owner: '秦朗', foundAt: tOff(-2, 11, 0), status: '待确认' },
    { id: 'DSC-1021', name: '客户之声平台', type: '边界合规', source: '研发管理平台（代码仓库）', detail: '同一仓库同时承载客服与营销逻辑，与应用边界定义不符', level: '一般', owner: '潘瑜', foundAt: tOff(-3, 15, 40), status: '已忽略' },
    { id: 'DSC-1020', name: '支付网关 - 渠道适配模块', type: '组件依赖', source: '进程 / 端口扫描器', detail: '发现新增 Redis 集群依赖，台账基础设施信息待更新', level: '核心', owner: '何静', foundAt: tOff(-4, 10, 5), status: '已入库' },
    { id: 'DSC-1019', name: '数据中台 - 调度组件', type: '组件依赖', source: '监控平台', detail: '新增 DolphinScheduler 组件依赖，需登记至技术栈', level: '重要', owner: '韩雪', foundAt: tOff(-5, 16, 30), status: '已入库' }
  ];

  /* ---------------- 7. 角色与权限 ---------------- */
  var permissionCatalog = [
    { group: '资产台账', items: [
      { key: 'assets.view', name: '查看资产台账' }, { key: 'assets.create', name: '新增应用' },
      { key: 'assets.edit', name: '编辑应用' }, { key: 'assets.delete', name: '删除应用' },
      { key: 'assets.import', name: '批量导入' }, { key: 'assets.export', name: '导出数据' }
    ] },
    { group: '分类配置', items: [
      { key: 'config.view', name: '查看分类字典' }, { key: 'config.manage', name: '维护分类字典' }
    ] },
    { group: '生命周期', items: [
      { key: 'lifecycle.view', name: '查看状态流转' }, { key: 'lifecycle.flow', name: '执行状态流转' },
      { key: 'change.submit', name: '提交变更工单' }, { key: 'change.approve', name: '审批变更 / 退役' }
    ] },
    { group: 'License', items: [
      { key: 'license.view', name: '查看 License' }, { key: 'license.manage', name: '维护 License' },
      { key: 'license.alert', name: '配置到期预警' }
    ] },
    { group: '拓扑与报表', items: [
      { key: 'topology.view', name: '查看应用拓扑' }, { key: 'topology.export', name: '导出拓扑图' },
      { key: 'report.view', name: '查看报表' }, { key: 'report.manage', name: '自定义报表与推送' }
    ] },
    { group: '成本合规', items: [
      { key: 'cost.view', name: '查看成本' }, { key: 'cost.manage', name: '维护成本归集' },
      { key: 'compliance.view', name: '查看合规' }, { key: 'compliance.manage', name: '维护合规标签与自查' }
    ] },
    { group: '审计与集成', items: [
      { key: 'audit.view', name: '查看审计日志' }, { key: 'audit.export', name: '导出审计日志' },
      { key: 'integration.view', name: '查看开放集成' }, { key: 'integration.manage', name: '配置集成与 Webhook' }
    ] },
    { group: '系统管理', items: [
      { key: 'role.manage', name: '角色权限管理' }, { key: 'discover.manage', name: '发现结果处置' }
    ] }
  ];
  var allKeys = [];
  permissionCatalog.forEach(function (g) { g.items.forEach(function (it) { allKeys.push(it.key); }); });

  function pick(keys) { var o = {}; allKeys.forEach(function (k) { o[k] = keys.indexOf(k) >= 0; }); return o; }

  var roles = [
    { id: 'role-sys', name: '系统管理员', avatar: '管', scope: '全集团数据', desc: '系统最高权限，负责分类字典、角色权限与集成配置', perms: pick(allKeys) },
    { id: 'role-arch', name: '架构管理员', avatar: '架', scope: '全集团数据', desc: '负责架构评审、拓扑治理与变更审批', perms: pick(['assets.view', 'assets.edit', 'assets.export', 'config.view', 'lifecycle.view', 'lifecycle.flow', 'change.submit', 'change.approve', 'topology.view', 'topology.export', 'report.view', 'report.manage', 'cost.view', 'compliance.view', 'audit.view', 'integration.view', 'discover.manage']) },
    { id: 'role-asset', name: '资产管理员', avatar: '资', scope: '所辖业务域', desc: '维护资产台账、批量导入导出与生命周期流转', perms: pick(['assets.view', 'assets.create', 'assets.edit', 'assets.delete', 'assets.import', 'assets.export', 'config.view', 'lifecycle.view', 'lifecycle.flow', 'change.submit', 'license.view', 'topology.view', 'report.view', 'cost.view', 'compliance.view', 'compliance.manage']) },
    { id: 'role-lic', name: 'License 管理员', avatar: '授', scope: '全集团数据', desc: '负责软件授权登记与到期预警配置', perms: pick(['assets.view', 'config.view', 'license.view', 'license.manage', 'license.alert', 'report.view', 'cost.view', 'integration.view']) },
    { id: 'role-audit', name: '审计员', avatar: '审', scope: '全集团数据（只读）', desc: '只读查看台账、合规与审计日志，可导出审计记录', perms: pick(['assets.view', 'config.view', 'lifecycle.view', 'license.view', 'topology.view', 'report.view', 'cost.view', 'compliance.view', 'audit.view', 'audit.export']) },
    { id: 'role-guest', name: '只读用户', avatar: '读', scope: '所辖业务域（只读）', desc: '仅可查看资产台账与拓扑关系', perms: pick(['assets.view', 'config.view', 'lifecycle.view', 'topology.view', 'report.view']) }
  ];

  /* ---------------- 8. 合规 / 报表 / 集成 / 开放能力 ---------------- */
  var complianceTags = [
    { id: 'tag-1', name: '等保三级', color: 'b-red', type: '等级保护', desc: '国家信息安全等级保护三级' },
    { id: 'tag-2', name: '等保二级', color: 'b-orange', type: '等级保护', desc: '国家信息安全等级保护二级' },
    { id: 'tag-3', name: 'ISO27001', color: 'b-blue', type: '体系认证', desc: '信息安全管理体系认证' },
    { id: 'tag-4', name: '行业合规', color: 'b-purple', type: '行业监管', desc: '行业主管部门合规要求' },
    { id: 'tag-5', name: 'PCI-DSS', color: 'b-cyan', type: '支付卡行业', desc: '支付卡行业数据安全标准' },
    { id: 'tag-6', name: '已下线', color: 'b-gray', type: '生命周期', desc: '已退役应用归档标识' }
  ];
  var selfChecks = [
    { id: 'SC-01', item: '应用归属与责任人是否明确', category: '台账规范性', result: '符合', owner: '张伟', app: '全部应用', checkedAt: dOff(-6), remark: '33 个应用均已登记负责人与所属业务域' },
    { id: 'SC-02', item: '核心应用是否完成等保测评', category: '安全合规', result: '部分符合', owner: '赵颖', app: '11 个核心应用', checkedAt: dOff(-5), remark: '2 个核心应用测评报告即将到期，需安排复测' },
    { id: 'SC-03', item: 'License 授权数量与部署实例是否一致', category: '授权合规', result: '不符合', owner: '曹敏', app: 'Oracle 相关应用', checkedAt: dOff(-4), remark: 'Oracle 实例数超出授权数量 2 个，需补购或下线' },
    { id: 'SC-04', item: '应用是否存在越界数据共享', category: '数据合规', result: '符合', owner: '潘瑜', app: '客户之声平台', checkedAt: dOff(-3), remark: '已完成边界整改并复检通过' },
    { id: 'SC-05', item: '退役应用数据是否完成归档', category: '生命周期', result: '符合', owner: '张伟', app: '老版积分商城', checkedAt: dOff(-2), remark: '数据已归档至冷存储，资源已完成回收' },
    { id: 'SC-06', item: '中间件与数据库是否存在高危漏洞版本', category: '安全合规', result: '部分符合', owner: '段誉', app: '全部应用', checkedAt: dOff(-1), remark: '存在 3 个待升级的 Log4j 版本实例' }
  ];

  var reportTemplates = [
    { id: 'rp-1', name: '资产清单报表', category: '内置模板', dims: '应用域 / 产品线 / 状态 / 重要等级', freq: '按需导出', owner: '张伟', desc: '全量应用资产清单，支持按筛选条件导出 Excel / CSV' },
    { id: 'rp-2', name: 'License 到期报表', category: '内置模板', dims: '到期区间 / 服务商 / 关联应用', freq: '每周一 09:00 推送', owner: '曹敏', desc: '汇总 90 天内到期的软件授权，推送至责任人与协作平台' },
    { id: 'rp-3', name: '资产变更报表', category: '内置模板', dims: '变更类型 / 申请人 / 审批状态 / 时间', freq: '每月 1 日推送', owner: '王磊', desc: '统计变更工单处理情况与平均审批时长' },
    { id: 'rp-4', name: '业务域资产统计', category: '内置模板', dims: '应用域 / 核心应用数 / 成本合计', freq: '按需生成', owner: '韩雪', desc: '按业务域汇总资产数量与成本分布' },
    { id: 'rp-5', name: '核心应用健康度周报', category: '自定义报表', dims: '重要等级 = 核心 / 健康度 / 告警次数', freq: '每周五 17:00 推送', owner: '段誉', desc: '自定义报表：核心应用可用性与健康度趋势' },
    { id: 'rp-6', name: '成本分摊明细报表', category: '自定义报表', dims: '应用 / 成本类型 / 归集月份', freq: '每月 5 日推送', owner: '曹敏', desc: '自定义报表：按应用归集云资源、服务器与授权成本' }
  ];

  var integrations = [
    { id: 'int-1', name: 'CMDB', icon: '🗄️', color: 'b-purple', dir: '双向同步', status: '运行正常', lastSync: tOff(0, 5, 10), records: 12680, desc: '同步基础设施配置项，建立应用 - 基础设施映射关系' },
    { id: 'int-2', name: '研发管理平台', icon: '🧩', color: 'b-blue', dir: '主动采集', status: '运行正常', lastSync: tOff(0, 6, 20), records: 4821, desc: '自动发现应用、校验应用边界合规性' },
    { id: 'int-3', name: '财务系统', icon: '💰', color: 'b-green', dir: '单向同步', status: '运行正常', lastSync: tOff(-1, 22, 0), records: 2140, desc: '获取 License、云资源费用数据用于成本归集' },
    { id: 'int-4', name: '监控平台', icon: '📈', color: 'b-cyan', dir: '单向采集', status: '运行正常', lastSync: tOff(0, 7, 0), records: 9540, desc: '获取应用可用性等指标，支撑资产健康度评估' },
    { id: 'int-5', name: 'ITSM / 流程平台', icon: '🔁', color: 'b-orange', dir: '双向集成', status: '告警', lastSync: tOff(-1, 18, 30), records: 386, desc: '变更、退役等流程与工单系统打通，实现审批闭环' },
    { id: 'int-6', name: '协作平台（企业微信）', icon: '💬', color: 'b-green', dir: '事件推送', status: '运行正常', lastSync: tOff(0, 8, 12), records: 1274, desc: '预警、变更等关键事件推送至责任人' }
  ];

  var openApis = [
    { method: 'GET', path: '/openapi/v1/apps', desc: '查询应用资产列表（支持分页与多维筛选）', scope: 'asset:read' },
    { method: 'GET', path: '/openapi/v1/apps/{id}', desc: '查询应用详情（含扩展信息与拓扑）', scope: 'asset:read' },
    { method: 'POST', path: '/openapi/v1/apps', desc: '新增应用资产', scope: 'asset:write' },
    { method: 'PUT', path: '/openapi/v1/apps/{id}', desc: '变更应用资产信息', scope: 'asset:write' },
    { method: 'GET', path: '/openapi/v1/topology/{id}', desc: '查询应用上下游拓扑关系', scope: 'asset:read' },
    { method: 'GET', path: '/openapi/v1/licenses', desc: '查询 License 台账与到期预警', scope: 'license:read' },
    { method: 'GET', path: '/openapi/v1/costs/summary', desc: '按应用 / 应用域查询成本归集', scope: 'cost:read' },
    { method: 'POST', path: '/openapi/v1/changes', desc: '发起变更工单', scope: 'change:write' }
  ];

  var webhooks = [
    { id: 'wh-1', event: '资产变更完成', target: '企业微信 · IT 资产治理群', url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=****', status: '启用', lastPush: tOff(0, 9, 5), successRate: 100 },
    { id: 'wh-2', event: 'License 即将到期', target: '企业微信 · License 责任人', url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=****', status: '启用', lastPush: tOff(-1, 9, 0), successRate: 100 },
    { id: 'wh-3', event: '变更工单待审批', target: '钉钉 · 架构评审群', url: 'https://oapi.dingtalk.com/robot/send?access_token=****', status: '启用', lastPush: tOff(0, 10, 30), successRate: 97 },
    { id: 'wh-4', event: '发现新增 / 下线应用', target: '企业微信 · 资产管理群', url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=****', status: '停用', lastPush: tOff(-9, 8, 0), successRate: 92 }
  ];

  var KPI_TREND = {
    total: [27, 28, 29, 29, 31, 32, 32, 33, 33, 33, 34, 34],
    core: [10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11],
    retired: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
  };

  window.ITAM_DATA = {
    domains: domains, productLines: productLines, statuses: statuses, levels: levels,
    deployments: deployments, devModes: devModes,
    apps: apps, edges: edges, ups: ups, downs: downs, sysDeps: sysDeps, byName: byName,
    licenses: licenses, changes: changes, audits: audits,
    sources: sources, discoveries: discoveries,
    permissionCatalog: permissionCatalog, allKeys: allKeys, roles: roles,
    complianceTags: complianceTags, selfChecks: selfChecks,
    reportTemplates: reportTemplates, integrations: integrations,
    openApis: openApis, webhooks: webhooks, KPI_TREND: KPI_TREND,
    dOff: dOff, tOff: tOff
  };
})();
