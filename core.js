/* =========================================================
   IT应用资产管理系统 · 核心框架
   状态与持久化 / 路由 / 权限 / 通用组件 / 可视化仪表盘
   ========================================================= */
(function () {
  'use strict';

  var D = window.ITAM_DATA;
  var LS_KEY = 'itam_platform_v3';

  /* ================= 工具 ================= */
  var U = {
    esc: function (s) {
      return String(s === undefined || s === null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    num: function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); },
    money: function (n) { return (Math.round(n * 10) / 10).toFixed(1) + ' 万元'; },
    today: function () { return D.dOff(0); },
    rel: function (s) {
      if (!s) return '—';
      var t = new Date(String(s).replace(/-/g, '/').replace(' ', 'T')).getTime();
      if (isNaN(t)) return String(s).slice(0, 16);
      var diff = Date.now() - t, day = 86400000;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
      if (diff < day) return Math.floor(diff / 3600000) + ' 小时前';
      if (diff < day * 30) return Math.floor(diff / day) + ' 天前';
      return String(s).slice(0, 10);
    },
    daysTo: function (dateStr) {
      var t = new Date(String(dateStr).replace(/-/g, '/')).getTime();
      if (isNaN(t)) return null;
      return Math.ceil((t - Date.now()) / 86400000);
    },
    slug: function (s) { return String(s).replace(/[^A-Za-z0-9]/g, ''); },
    download: function (filename, text, mime) {
      var blob = new Blob(['\ufeff' + text], { type: (mime || 'text/csv') + ';charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 300);
    },
    csv: function (rows) {
      return rows.map(function (r) {
        return r.map(function (c) {
          var v = c === null || c === undefined ? '' : String(c);
          return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        }).join(',');
      }).join('\r\n');
    },
    uid: function (p) { return (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  };

  /* ================= 状态 / 持久化 ================= */
  var PERSIST_KEYS = ['domains', 'productLines', 'statuses', 'levels', 'deployments', 'devModes', 'apps',
    'licenses', 'changes', 'audits', 'discoveries', 'roles', 'reportTemplates', 'webhooks',
    'complianceTags', 'selfChecks', 'sources', 'integrations', 'openApis', 'callEdges'];

  var S = { roleId: 'role-asset', route: 'dashboard', filters: {} };
  var VIEWS = {};
  var PERSONAS = {
    'role-sys': { name: '张伟', avatar: '张' }, 'role-arch': { name: '王磊', avatar: '王' },
    'role-asset': { name: '李明', avatar: '李' }, 'role-lic': { name: '曹敏', avatar: '曹' },
    'role-audit': { name: '赵颖', avatar: '赵' }, 'role-guest': { name: '刘洋', avatar: '刘' }
  };

  function cloneData() {
    var o = { schema: 1 };
    PERSIST_KEYS.forEach(function (k) {
      o[k] = JSON.parse(JSON.stringify(k === 'callEdges'
        ? D.edges.filter(function (e) { return e.type === 'call'; })
        : D[k]));
    });
    return o;
  }

  function derive() {
    var byName = {};
    S.apps.forEach(function (a) { byName[a.name] = a; });
    S.byName = byName;
    var infra = [];
    S.apps.forEach(function (a) {
      (a.infra || []).forEach(function (n) {
        infra.push({ from: a.id, to: 'sys-' + U.slug(n), type: 'infra', label: n });
      });
    });
    S.edges = S.callEdges.concat(infra);
  }

  function load() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) { raw = null; }
    if (!raw || !raw.apps || !raw.apps.length) { raw = cloneData(); }
    var base = null;
    PERSIST_KEYS.forEach(function (k) {
      if (raw[k] !== undefined) { S[k] = raw[k]; }
      else { if (!base) base = cloneData(); S[k] = base[k]; }
    });
    S.roleId = raw.roleId || 'role-asset';
    S.allKeys = D.allKeys;
    S.permissionCatalog = D.permissionCatalog;
    derive();
  }

  function persist() {
    var o = { schema: 1, roleId: S.roleId };
    PERSIST_KEYS.forEach(function (k) { o[k] = S[k]; });
    try { localStorage.setItem(LS_KEY, JSON.stringify(o)); }
    catch (e) { toast('本地存储写入失败（可能超出容量），本次修改仅当前会话有效', 'warn'); }
  }

  function reset() {
    try { localStorage.removeItem(LS_KEY); } catch (e) { }
    load();
  }

  /* ================= 字典查询 ================= */
  function dict(kind) { return S[kind] || []; }
  function find(kind, id) {
    var arr = dict(kind);
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  function nameOf(kind, id) { var x = find(kind, id); return x ? x.name : '—'; }
  function objOf(kind, id) { return find(kind, id) || {}; }
  function linesOf(domainId) { return dict('productLines').filter(function (p) { return p.domainId === domainId; }); }
  function appById(id) {
    for (var i = 0; i < S.apps.length; i++) if (S.apps[i].id === id) return S.apps[i];
    return null;
  }
  function appLabel(id) { var a = appById(id); return a ? a.name : id; }
  function appPath(a) {
    return U.esc(nameOf('domains', a.domainId)) + ' <i style="color:#c3ccda">/</i> ' + U.esc(objOf('productLines', a.productLineId).name || '—');
  }
  function costTotal(a) { return (a.cost.cloud || 0) + (a.cost.server || 0) + (a.cost.license || 0) + (a.cost.other || 0); }
  function levelBadge(app) {
    var lv = objOf('levels', app.levelId);
    return '<span class="badge b-' + (lv.color || 'gray') + ' dot">' + U.esc(lv.name || '—') + '</span>';
  }
  function statusBadge(app) {
    var st = objOf('statuses', app.statusId);
    return '<span class="badge b-' + (st.color || 'gray') + ' dot">' + U.esc(st.name || '—') + '</span>';
  }
  function licenseStatus(l) {
    var d = U.daysTo(l.expireDate);
    if (d === null) return { key: 'unknown', text: '未知', cls: 'b-gray', days: null };
    if (d < 0) return { key: 'expired', text: '已过期', cls: 'b-gray', days: d };
    if (d <= 15) return { key: 'urgent', text: '紧急（' + d + ' 天）', cls: 'b-red', days: d };
    if (d <= l.alertDays) return { key: 'warn', text: '预警（' + d + ' 天）', cls: 'b-orange', days: d };
    return { key: 'ok', text: '正常（' + d + ' 天）', cls: 'b-green', days: d };
  }

  /* ================= 权限 ================= */
  function currentRole() { return find('roles', S.roleId) || S.roles[0]; }
  function persona() { return PERSONAS[S.roleId] || { name: '用户', avatar: '用' }; }
  function can(perm) {
    if (!perm) return true;
    var r = currentRole();
    if (!r) return false;
    if (r.id === 'role-sys') return true;
    return !!r.perms[perm];
  }

  /* ================= 路由表 ================= */
  var ROUTES = [
    { id: 'dashboard', name: '可视化仪表盘', group: '工作台', icon: '📊', perm: 'assets.view' },
    { id: 'assets', name: '应用资产台账', group: '资产治理', icon: '🗂️', perm: 'assets.view' },
    { id: 'config', name: '分类配置管理', group: '资产治理', icon: '🧱', perm: 'config.view' },
    { id: 'lifecycle', name: '生命周期与变更', group: '资产治理', icon: '🔄', perm: 'lifecycle.view' },
    { id: 'license', name: 'License 管理', group: '治理与合规', icon: '🔑', perm: 'license.view' },
    { id: 'topology', name: '拓扑与关系', group: '治理与合规', icon: '🕸️', perm: 'topology.view' },
    { id: 'compliance', name: '成本与合规', group: '治理与合规', icon: '🛡️', perm: 'compliance.view' },
    { id: 'reports', name: '报表中心', group: '分析与集成', icon: '📑', perm: 'report.view' },
    { id: 'audit', name: '权限与审计', group: '分析与集成', icon: '🔐', perm: 'audit.view' },
    { id: 'discover', name: '自动发现与采集', group: '分析与集成', icon: '📡', perm: 'assets.view' },
    { id: 'integration', name: '开放集成', group: '分析与集成', icon: '🔌', perm: 'integration.view' }
  ];

  /* ================= 通用组件 ================= */
  function toast(msg, type) {
    var d = document.createElement('div');
    d.className = 'toast ' + (type || '');
    var ico = type === 'ok' ? '✅' : type === 'err' ? '⛔' : type === 'warn' ? '⚠️' : 'ℹ️';
    d.innerHTML = '<span>' + ico + '</span><span>' + U.esc(msg) + '</span>';
    document.getElementById('toastWrap').appendChild(d);
    setTimeout(function () {
      d.style.transition = 'opacity .3s'; d.style.opacity = '0';
      setTimeout(function () { d.remove(); }, 320);
    }, 2600);
  }

  function openDrawer(opt) {
    var mask = document.getElementById('drawerMask');
    var dr = document.getElementById('drawer');
    var body = document.getElementById('drawerBody');
    dr.className = 'drawer' + (opt.narrow ? ' narrow' : '');
    body.innerHTML =
      '<div class="drawer-hd">' +
      '<div><h3>' + (opt.title || '') + '</h3>' + (opt.sub ? '<div class="sub">' + opt.sub + '</div>' : '') + '</div>' +
      '<div class="hd-actions">' +
      (opt.actions || []).map(function (a, i) {
        return '<button class="btn ' + (a.cls || '') + '" data-dact="' + i + '">' + a.label + '</button>';
      }).join('') +
      '<button class="drawer-close" data-close="1">✕</button></div></div>' +
      '<div class="drawer-body">' + (opt.body || '') + '</div>' + (opt.footer || '');
    mask.classList.add('show');
    dr.classList.add('show');
    body.querySelectorAll('[data-close]').forEach(function (b) { b.onclick = closeDrawer; });
    (opt.actions || []).forEach(function (a, i) {
      var el = body.querySelector('[data-dact="' + i + '"]');
      if (el && a.onClick) el.onclick = function () { a.onClick(el); };
    });
    if (opt.onMount) opt.onMount(body);
    return body;
  }
  function closeDrawer() {
    document.getElementById('drawerMask').classList.remove('show');
    document.getElementById('drawer').classList.remove('show');
  }

  function openModal(opt) {
    var mask = document.getElementById('modalMask');
    var m = document.getElementById('modal');
    m.innerHTML = '<div class="modal-hd"><h3>' + (opt.title || '') + '</h3></div>' +
      '<div class="modal-bd">' + (opt.body || '') + '</div>' +
      '<div class="modal-ft">' + (opt.footer || '<button class="btn" data-mclose="1">关闭</button>') + '</div>';
    mask.classList.add('show');
    m.querySelectorAll('[data-mclose]').forEach(function (b) { b.onclick = closeModal; });
    if (opt.onMount) opt.onMount(m);
    return m;
  }
  function closeModal() { document.getElementById('modalMask').classList.remove('show'); }

  function confirmBox(title, msg, onOk, okLabel) {
    openModal({
      title: title,
      body: '<div style="font-size:13px;line-height:1.85">' + msg + '</div>',
      footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="cfmOk">' + (okLabel || '确认') + '</button>',
      onMount: function (m) {
        m.querySelector('#cfmOk').onclick = function () { closeModal(); onOk(); };
      }
    });
  }

  /* ================= HTML 片段 ================= */
  function pageHead(title, sub, actions) {
    return '<div class="page-head"><div><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' +
      (actions ? '<div class="head-actions">' + actions + '</div>' : '') + '</div>';
  }
  function noPerm(perm) {
    return '<div class="card"><div class="empty"><div class="big">🔒</div>' +
      '<h3>无权访问该模块</h3><p>当前角色「' + U.esc(currentRole().name) + '」缺少权限：<code>' + U.esc(perm) + '</code>。<br>' +
      '可在顶栏切换角色，或在「权限与审计 → 角色权限矩阵」中为本角色勾选该权限。</p>' +
      '<button class="btn btn-primary" data-goto-roles="1">前往角色权限矩阵</button></div></div>';
  }
  function emptyBox(txt, sub) {
    return '<div class="empty"><div class="big">📭</div><div>' + U.esc(txt) + '</div>' +
      (sub ? '<div style="font-size:11.5px;margin-top:4px">' + U.esc(sub) + '</div>' : '') + '</div>';
  }
  function kpi(title, ico, color, val, unit, foot) {
    return '<div class="card kpi"><div class="kpi-top"><span class="kpi-ico" style="background:var(--' + color + '-soft);color:var(--' + color + ')">' + ico + '</span>' + title + '</div>' +
      '<div class="kpi-val">' + val + (unit ? '<small>' + unit + '</small>' : '') + '</div>' +
      '<div class="kpi-foot">' + (foot || '') + '</div></div>';
  }
  function donut(items, size) {
    var total = items.reduce(function (s, i) { return s + i.value; }, 0) || 1;
    var r = 54, cx = 70, cy = 70, sw = 20, circ = 2 * Math.PI * r, acc = 0;
    var rings = items.map(function (it) {
      var len = it.value / total * circ;
      var seg = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + it.color +
        '" stroke-width="' + sw + '" stroke-dasharray="' + len + ' ' + (circ - len) + '" stroke-dashoffset="' + (-acc) +
        '" transform="rotate(-90 ' + cx + ' ' + cy + ')"></circle>';
      acc += len;
      return seg;
    }).join('');
    var legend = items.map(function (it) {
      return '<div class="legend-item"><span class="sw" style="background:' + it.color + '"></span>' + U.esc(it.label) +
        '<span class="val">' + it.value + ' ｜ ' + Math.round(it.value / total * 100) + '%</span></div>';
    }).join('');
    var sz = size || 168;
    return '<div class="chart-row" style="gap:8px"><svg viewBox="0 0 140 140" width="' + sz + '" height="' + sz + '">' + rings +
      '<text x="70" y="66" text-anchor="middle" font-size="19" font-weight="700" fill="#1e293b">' + total + '</text>' +
      '<text x="70" y="84" text-anchor="middle" font-size="10" fill="#8a97aa">应用总数</text></svg>' +
      '<div class="legend">' + legend + '</div></div>';
  }
  function barList(items, unit) {
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    return '<div class="bars">' + items.map(function (i) {
      return '<div class="bar-item"><div class="bar-top"><span>' + U.esc(i.label) + '</span><span class="val">' + i.value + (unit || '') + '</span></div>' +
        '<div class="bar-track"><i class="bar-fill" style="width:' + (i.value / max * 100) + '%;background:' + (i.color || '#2f6bff') + '"></i></div></div>';
    }).join('') + '</div>';
  }
  function colChart(items, unit) {
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    return '<div class="mini-bars">' + items.map(function (i) {
      return '<div class="mini-bar" title="' + U.esc(i.label) + '：' + i.value + (unit || '') + '">' +
        '<span class="nv">' + i.value + '</span>' +
        '<div class="col" style="height:' + Math.max(4, i.value / max * 88) + '%;' + (i.color ? 'background:' + i.color : '') + '"></div>' +
        '<span class="lb">' + U.esc(i.label) + '</span></div>';
    }).join('') + '</div>';
  }
  function timeline(items) {
    return '<div class="timeline">' + items.map(function (t) {
      return '<div class="tl-item ' + (t.state || '') + '"><div class="tl-time">' + U.esc(t.time) + '</div>' +
        '<div class="tl-title">' + U.esc(t.title) + '</div><div class="tl-desc">' + U.esc(t.desc) + '</div></div>';
    }).join('') + '</div>';
  }
  function dl(cells, cols) {
    return '<div class="dl' + (cols ? ' ' + cols : '') + '">' + cells.map(function (c) {
      return '<div class="cell"><div class="k">' + U.esc(c.k) + '</div><div class="v">' +
        (c.v === undefined || c.v === null || c.v === '' ? '—' : c.v) + '</div></div>';
    }).join('') + '</div>';
  }
  function progress(pct, cls) {
    return '<div class="progress"><i class="' + (cls || '') + '" style="width:' + Math.max(2, Math.min(100, pct)) + '%"></i></div>';
  }

  /* ================= 统计 ================= */
  function stats() {
    var apps = S.apps;
    return {
      total: apps.length,
      run: apps.filter(function (a) { return a.statusId === 'st-run'; }).length,
      core: apps.filter(function (a) { return a.levelId === 'lv-core' && a.statusId !== 'st-retired'; }).length,
      retired: apps.filter(function (a) { return a.statusId === 'st-retired'; }).length,
      pendingChange: S.changes.filter(function (c) { return c.status === '待审批' || c.status === '审批中'; }).length,
      licAlerts: S.licenses.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d <= l.alertDays; }),
      newMonth: apps.filter(function (a) { return String(a.createTime).slice(0, 7) === U.today().slice(0, 7); }).length,
      totalCost: apps.reduce(function (s, a) { return s + costTotal(a); }, 0),
      pendingDisc: S.discoveries.filter(function (x) { return x.status === '待确认'; }).length
    };
  }

  /* ================= 审计写入 ================= */
  function pushAudit(action, objName, before, result, after, objCode) {
    var now = new Date();
    S.audits.unshift({
      id: 'LOG-' + Date.now().toString().slice(-8),
      time: D.tOff(0, now.getHours(), now.getMinutes()),
      user: persona().name, role: currentRole().name,
      action: action, actionType: 'op',
      object: objName, objectCode: objCode || '—',
      ip: '10.24.' + (Math.floor(Math.random() * 200) + 10) + '.' + (Math.floor(Math.random() * 240) + 10),
      result: result || '成功',
      before: before || '—', after: after || '—',
      remark: '内控留痕，在线保留 3 年'
    });
  }

  /* ================= 仪表盘 ================= */
  VIEWS.dashboard = {
    render: function () {
      var st = stats();
      var t = D.KPI_TREND;
      var colors = ['#2f6bff', '#7a4ddb', '#12a150', '#0b8fd6', '#d98600', '#e03131', '#8a97aa'];
      var domItems = dict('domains').map(function (d, i) {
        return { label: d.name, value: S.apps.filter(function (a) { return a.domainId === d.id; }).length, color: colors[i % colors.length] };
      }).filter(function (x) { return x.value > 0; });
      var lvItems = dict('levels').map(function (l) {
        return { label: l.name, value: S.apps.filter(function (a) { return a.levelId === l.id; }).length, color: ({ red: '#e03131', orange: '#d98600', blue: '#2f6bff' })[l.color] || '#8a97aa' };
      });
      var stItems = dict('statuses').map(function (s) {
        return { label: s.name, value: S.apps.filter(function (a) { return a.statusId === s.id; }).length, color: ({ gray: '#8a97aa', green: '#12a150', orange: '#d98600', cyan: '#0b8fd6' })[s.color] || '#8a97aa' };
      });
      var dpItems = dict('deployments').map(function (d) {
        return { label: d.name, value: S.apps.filter(function (a) { return a.deployId === d.id; }).length };
      });
      var plTop = dict('productLines').map(function (p) {
        return { label: p.name, value: S.apps.filter(function (a) { return a.productLineId === p.id; }).length };
      }).sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
      var expiring = S.licenses.slice().sort(function (a, b) {
        return (U.daysTo(a.expireDate) || 0) - (U.daysTo(b.expireDate) || 0);
      }).slice(0, 6);
      var recent = S.audits.slice().sort(function (a, b) { return a.time < b.time ? 1 : -1; }).slice(0, 6);

      var html = pageHead('可视化仪表盘',
        '总览应用资产家底、分类分布、License 到期与变更治理态势；数据来自本地演示数据，可实时反映台账最新状态。',
        '<button class="btn" data-act="dash-refresh">🔄 刷新指标</button>' +
        '<button class="btn btn-primary" data-act="dash-export">⬇ 导出总览数据</button>');

      html += '<div class="grid g-4">' +
        kpi('应用总数', '🗂️', 'primary', st.total, '个', '<span class="trend-up">▲ 本月新增 ' + st.newMonth + ' 个</span>') +
        kpi('核心应用', '⭐', 'danger', st.core, '个', '<span class="trend-down">占全部 ' + Math.round(st.core / st.total * 100) + '%</span>') +
        kpi('运行中', '🟢', 'success', st.run, '个', '<span style="color:var(--text-3)">覆盖率 ' + Math.round(st.run / st.total * 100) + '%</span>') +
        kpi('待处理变更', '🔄', 'warn', st.pendingChange, '单', '<span class="trend-down">需审批处理</span>') +
        '</div><div class="grid g-4 mt14">' +
        kpi('License 待到期', '🔑', 'warn', st.licAlerts.length, '项', '<span class="trend-down">已进入预警期</span>') +
        kpi('已退役', '📦', 'gray', st.retired, '个', '<span style="color:var(--text-3)">完成资源回收</span>') +
        kpi('IT 成本合计', '💰', 'purple', (Math.round(st.totalCost / 10) / 100).toFixed(2), '百万元', '<span style="color:var(--text-3)">云 + 服务器 + 授权</span>') +
        kpi('待处置发现', '📡', 'info', st.pendingDisc, '条', '<span style="color:var(--text-3)">自动采集待确认</span>') +
        '</div>';

      html += '<div class="grid g-2-1 mt14">' +
        '<div class="card"><div class="card-hd"><h3>应用域资产分布</h3><span class="sub">统一台账按业务域归集</span>' +
        '<div class="hd-actions"><button class="btn btn-mini" data-goto="config">维护分类 →</button></div></div>' +
        '<div class="card-bd">' + donut(domItems) + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>台账增长趋势</h3><span class="sub">近 12 个月</span></div>' +
        '<div class="card-bd">' + colChart(t.total.map(function (v, i) { return { label: (i + 1) + '月', value: v }; })) +
        '<div class="kv-inline mt14"><span>核心应用：<b>' + t.core[t.core.length - 1] + '</b></span>' +
        '<span>累计退役：<b>' + t.retired[t.retired.length - 1] + '</b></span></div></div></div></div>';

      html += '<div class="grid g-3 mt14">' +
        '<div class="card"><div class="card-hd"><h3>重要等级分布</h3></div><div class="card-bd">' + barList(lvItems, ' 个') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>生命周期状态分布</h3></div><div class="card-bd">' + barList(stItems, ' 个') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>部署形式分布</h3></div><div class="card-bd">' + barList(dpItems, ' 个') + '</div></div>' +
        '</div>';

      html += '<div class="grid g-2-1 mt14">' +
        '<div class="card"><div class="card-hd"><h3>产品线资产数量 Top 8</h3><span class="sub">产品线隶属于应用域</span></div>' +
        '<div class="card-bd">' + barList(plTop, ' 个') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>License 到期预警</h3>' +
        '<div class="hd-actions"><button class="btn btn-mini" data-goto="license">全部 →</button></div></div>' +
        '<div class="card-bd tight">' + expiring.map(function (l) {
          var ls = licenseStatus(l);
          return '<div class="popover-item" style="border-bottom:1px solid var(--surface-2)"><div style="flex:1">' +
            '<div class="ttl">' + U.esc(l.product) + '</div>' +
            '<div class="desc">' + U.esc(l.vendor) + ' ｜ 到期 ' + U.esc(l.expireDate) + ' ｜ ' + U.esc(appLabel(l.appId)) + '</div></div>' +
            '<span class="badge ' + ls.cls + '">' + ls.text + '</span></div>';
        }).join('') + '</div></div></div>';

      html += '<div class="grid g-1-2 mt14">' +
        '<div class="card"><div class="card-hd"><h3>待办事项</h3></div><div class="card-bd"><div class="bars">' +
        '<div class="bar-item"><div class="bar-top"><span>变更工单待审批</span><span class="val">' + st.pendingChange + ' 单</span></div>' + progress(st.pendingChange * 12, 'warn') + '</div>' +
        '<div class="bar-item"><div class="bar-top"><span>License 预警处理</span><span class="val">' + st.licAlerts.length + ' 项</span></div>' + progress(st.licAlerts.length * 14, 'danger') + '</div>' +
        '<div class="bar-item"><div class="bar-top"><span>自动发现待确认</span><span class="val">' + st.pendingDisc + ' 条</span></div>' + progress(st.pendingDisc * 20) + '</div>' +
        '<div class="bar-item"><div class="bar-top"><span>合规自查待整改</span><span class="val">' + S.selfChecks.filter(function (c) { return c.result !== '符合'; }).length + ' 项</span></div>' +
        progress(S.selfChecks.filter(function (c) { return c.result !== '符合'; }).length * 18, 'warn') + '</div>' +
        '</div></div></div>' +
        '<div class="card"><div class="card-hd"><h3>最近操作动态</h3><span class="sub">操作审计留痕</span>' +
        '<div class="hd-actions"><button class="btn btn-mini" data-goto="audit">审计日志 →</button></div></div>' +
        '<div class="card-bd tight"><table class="tb"><thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>对象</th><th>结果</th></tr></thead><tbody>' +
        recent.map(function (a) {
          return '<tr><td class="mono">' + U.esc(a.time) + '</td><td>' + U.esc(a.user) +
            '<div style="font-size:11px;color:var(--text-3)">' + U.esc(a.role) + '</div></td>' +
            '<td>' + U.esc(a.action) + '</td><td>' + U.esc(a.object) + '</td>' +
            '<td><span class="badge ' + (a.result === '成功' ? 'b-green' : 'b-red') + '">' + U.esc(a.result) + '</span></td></tr>';
        }).join('') + '</tbody></table></div></div></div>';
      return html;
    },
    mount: function (root) {
      root.querySelectorAll('[data-goto]').forEach(function (b) {
        b.onclick = function () { go(b.getAttribute('data-goto')); };
      });
      var rf = root.querySelector('[data-act="dash-refresh"]');
      if (rf) rf.onclick = function () { render(); toast('指标已刷新', 'ok'); };
      var ex = root.querySelector('[data-act="dash-export"]');
      if (ex) ex.onclick = function () {
        if (!can('assets.export')) return toast('当前角色无「导出数据」权限', 'err');
        var st = stats();
        var rows = [['指标', '数值'], ['应用总数', st.total], ['核心应用', st.core], ['运行中', st.run],
          ['已退役', st.retired], ['待处理变更', st.pendingChange], ['License 预警', st.licAlerts.length],
          ['IT 成本合计(万元)', Math.round(st.totalCost)], [], ['应用域', '应用数量']];
        dict('domains').forEach(function (d) {
          rows.push([d.name, S.apps.filter(function (a) { return a.domainId === d.id; }).length]);
        });
        U.download('资产总览_' + U.today() + '.csv', U.csv(rows));
        pushAudit('导出资产总览', '可视化仪表盘', '—', '成功', '导出总览指标与分布数据');
        persist(); renderTopbar();
        toast('总览数据已导出', 'ok');
      };
    }
  };

  /* ================= 渲染 ================= */
  function renderNav() {
    var nav = document.getElementById('nav');
    var groups = [];
    ROUTES.forEach(function (r) { if (groups.indexOf(r.group) < 0) groups.push(r.group); });
    var st = stats();
    var html = '';
    groups.forEach(function (g) {
      html += '<div class="nav-label">' + U.esc(g) + '</div>';
      ROUTES.filter(function (r) { return r.group === g; }).forEach(function (r) {
        var ok = can(r.perm);
        var badge = '';
        if (r.id === 'lifecycle') badge = '<span class="nav-badge">' + st.pendingChange + '</span>';
        if (r.id === 'license') badge = '<span class="nav-badge">' + st.licAlerts.length + '</span>';
        if (r.id === 'discover') badge = '<span class="nav-badge">' + st.pendingDisc + '</span>';
        html += '<button class="nav-item' + (S.route === r.id ? ' active' : '') + '" data-route="' + r.id + '"' +
          (ok ? '' : ' style="opacity:.45" title="当前角色无访问权限"') + '>' +
          '<span class="ico">' + r.icon + '</span><span class="txt">' + U.esc(r.name) + '</span>' +
          (ok ? badge : '<span class="nav-badge">锁</span>') + '</button>';
      });
    });
    nav.innerHTML = html;
    nav.querySelectorAll('[data-route]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-route');
        var r = ROUTES.filter(function (x) { return x.id === id; })[0];
        if (r && !can(r.perm)) { toast('当前角色「' + currentRole().name + '」无「' + r.name + '」访问权限', 'err'); return; }
        go(id);
      };
    });
  }

  function renderTopbar() {
    var sel = document.getElementById('roleSelect');
    if (!sel.options.length) {
      sel.innerHTML = S.roles.map(function (r) { return '<option value="' + r.id + '">' + U.esc(r.name) + '</option>'; }).join('');
      sel.onchange = function () {
        S.roleId = sel.value;
        pushAudit('切换角色视角', currentRole().name, '—', '成功', '当前身份：' + persona().name);
        persist();
        toast('已切换为「' + currentRole().name + '」视角', 'ok');
        renderAll();
      };
    }
    sel.value = S.roleId;
    var p = persona();
    document.getElementById('userName').textContent = p.name;
    document.getElementById('userAvatar').textContent = p.avatar;
    document.getElementById('userRole').textContent = currentRole().name;
    var st = stats();
    document.getElementById('notifyDot').textContent = st.licAlerts.length + st.pendingChange + st.pendingDisc;
  }

  function renderCrumb() {
    var r = ROUTES.filter(function (x) { return x.id === S.route; })[0] || ROUTES[0];
    document.getElementById('crumbGroup').textContent = r.group;
    document.getElementById('crumbName').textContent = r.name;
    document.title = r.name + ' · IT应用资产管理系统';
  }

  function render() {
    var v = VIEWS[S.route];
    var root = document.getElementById('view');
    var r = ROUTES.filter(function (x) { return x.id === S.route; })[0];
    if (!v) { root.innerHTML = emptyBox('该模块尚未注册'); return; }
    if (r && !can(r.perm)) {
      root.innerHTML = pageHead(r.name, '权限受限') + noPerm(r.perm);
      var b = root.querySelector('[data-goto-roles]');
      if (b) b.onclick = function () { if (can('audit.view')) go('audit'); else toast('当前角色无权限查看权限矩阵', 'err'); };
      return;
    }
    root.innerHTML = v.render();
    if (v.mount) v.mount(root);
    root.querySelectorAll('[data-goto]').forEach(function (b) {
      b.onclick = function () { go(b.getAttribute('data-goto')); };
    });
  }

  function renderAll() { renderNav(); renderTopbar(); renderCrumb(); render(); }

  function go(id) {
    if (!VIEWS[id]) { toast('模块未注册：' + id, 'err'); return; }
    S.route = id;
    if (location.hash !== '#/' + id) location.hash = '#/' + id;
    renderAll();
  }

  /* ================= 全局搜索 ================= */
  function bindSearch() {
    var input = document.getElementById('globalSearch');
    var panel = document.getElementById('searchPanel');
    function close() { panel.classList.remove('show'); }
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { close(); return; }
      var hits = S.apps.filter(function (a) {
        return a.name.toLowerCase().indexOf(q) >= 0 || a.code.toLowerCase().indexOf(q) >= 0 ||
          String(a.owner).toLowerCase().indexOf(q) >= 0 || (a.pinyin || '').indexOf(q) >= 0 ||
          nameOf('domains', a.domainId).toLowerCase().indexOf(q) >= 0;
      }).slice(0, 12);
      panel.innerHTML = hits.length ? hits.map(function (a) {
        return '<div class="search-item" data-id="' + a.id + '"><div style="flex:1"><b>' + U.esc(a.name) + '</b>' +
          '<div class="code">' + U.esc(a.code) + ' ｜ ' + appPath(a) + ' ｜ 负责人 ' + U.esc(a.owner) + '</div></div>' +
          levelBadge(a) + statusBadge(a) + '</div>';
      }).join('') : '<div style="padding:16px;color:var(--text-3);font-size:12.5px">未找到匹配的应用资产，可尝试拼音首字母，如 <b>hyzx</b>（会员中心）</div>';
      panel.classList.add('show');
      panel.querySelectorAll('[data-id]').forEach(function (it) {
        it.onclick = function () {
          var id = it.getAttribute('data-id');
          close(); input.value = '';
          go('assets');
          setTimeout(function () { if (window.ITAM && window.ITAM.openApp) window.ITAM.openApp(id); }, 60);
        };
      });
    });
    input.addEventListener('blur', function () { setTimeout(close, 180); });
  }

  /* ================= 通知面板 ================= */
  function bindNotify() {
    var btn = document.getElementById('btnNotify');
    var panel = document.getElementById('notifyPanel');
    btn.onclick = function () {
      var alerts = S.licenses.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d <= l.alertDays; });
      var pend = S.changes.filter(function (c) { return c.status === '待审批' || c.status === '审批中'; });
      var disc = S.discoveries.filter(function (x) { return x.status === '待确认'; });
      var html = '<div class="popover-hd">预警与待办<span style="margin-left:auto;font-size:11.5px;color:var(--text-3)">共 ' +
        (alerts.length + pend.length + disc.length) + ' 条</span></div><div class="popover-bd">';
      alerts.forEach(function (l) {
        var ls = licenseStatus(l);
        html += '<div class="popover-item"><span>🔑</span><div style="flex:1"><div class="ttl">License 到期：' + U.esc(l.product) + '</div>' +
          '<div class="desc">' + U.esc(l.vendor) + ' ｜ ' + U.esc(l.expireDate) + ' ｜ 提醒：' + U.esc(l.channels.join(' / ')) + '</div></div>' +
          '<span class="badge ' + ls.cls + '">' + ls.text + '</span></div>';
      });
      pend.forEach(function (c) {
        html += '<div class="popover-item"><span>🔄</span><div style="flex:1"><div class="ttl">' + U.esc(c.title) + '</div>' +
          '<div class="desc">' + U.esc(c.id) + ' ｜ ' + U.esc(c.type) + ' ｜ 当前节点：' + U.esc(c.node) + '</div></div>' +
          '<span class="badge b-orange">' + U.esc(c.status) + '</span></div>';
      });
      disc.forEach(function (x) {
        html += '<div class="popover-item"><span>📡</span><div style="flex:1"><div class="ttl">自动发现待确认：' + U.esc(x.name) + '</div>' +
          '<div class="desc">' + U.esc(x.type) + ' ｜ 来源：' + U.esc(x.source) + '</div></div>' +
          '<span class="badge b-cyan">待确认</span></div>';
      });
      if (!alerts.length && !pend.length && !disc.length) {
        html += '<div style="padding:20px;text-align:center;color:var(--text-3)">暂无预警与待办 🎉</div>';
      }
      panel.innerHTML = html + '</div>';
      panel.classList.toggle('show');
    };
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) panel.classList.remove('show');
    });
  }

  /* ================= 对外接口 ================= */
  var ITAM = {
    U: U, S: S, ROUTES: ROUTES, VIEWS: VIEWS, PERSONAS: PERSONAS,
    dict: dict, find: find, nameOf: nameOf, objOf: objOf, linesOf: linesOf, appById: appById, appLabel: appLabel,
    levelBadge: levelBadge, statusBadge: statusBadge, appPath: appPath, costTotal: costTotal, licenseStatus: licenseStatus,
    stats: stats, can: can, currentRole: currentRole, persona: persona,
    toast: toast, openDrawer: openDrawer, closeDrawer: closeDrawer, openModal: openModal, closeModal: closeModal, confirm: confirmBox,
    pageHead: pageHead, noPerm: noPerm, emptyBox: emptyBox, kpi: kpi, donut: donut, barList: barList, colChart: colChart,
    timeline: timeline, dl: dl, progress: progress,
    go: go, render: render, renderAll: renderAll, renderNav: renderNav, renderTopbar: renderTopbar, renderCrumb: renderCrumb,
    persist: persist, reset: reset, pushAudit: pushAudit, bindNotify: bindNotify,
    register: function (id, def) { VIEWS[id] = def; }
  };
  window.ITAM = ITAM;

  window.addEventListener('hashchange', function () {
    var id = location.hash.replace('#/', '');
    if (VIEWS[id] && id !== S.route) { S.route = id; renderAll(); }
  });

  document.addEventListener('DOMContentLoaded', function () {
    load();
    var id = location.hash.replace('#/', '');
    if (VIEWS[id]) S.route = id;
    var cur = ROUTES.filter(function (x) { return x.id === S.route; })[0];
    if (!can(cur && cur.perm)) S.route = 'dashboard';
    renderAll();
    bindSearch();
    bindNotify();
    document.getElementById('menuToggle').onclick = function () { document.getElementById('app').classList.toggle('collapsed'); };
    document.getElementById('drawerMask').onclick = closeDrawer;
    document.getElementById('modalMask').onclick = function (e) { if (e.target.id === 'modalMask') closeModal(); };
    document.getElementById('btnResetSide').onclick = function () {
      confirmBox('恢复演示数据', '将清空浏览器本地保存的全部演示数据，并还原为初始演示状态。<br><b>此操作不可撤销</b>，是否继续？', function () {
        reset(); S.route = 'dashboard'; location.hash = '#/dashboard';
        renderAll(); toast('已恢复初始演示数据', 'ok');
      }, '确认恢复');
    };
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawer(); closeModal(); }
    });
  });
})();
