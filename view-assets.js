/* =========================================================
   应用资产台账（P0）
   ========================================================= */
(function () {
  'use strict';
  var ITAM = window.ITAM, U = ITAM.U, S = ITAM.S, D = window.ITAM_DATA;

  var PAGE_SIZE = 10;
  var view = { page: 1, sortKey: 'code', sortDir: 'asc', selected: {}, cols: null };
  var COL_LABELS = {
    code: '应用编号', name: '应用名称', domain: '应用域', productLine: '产品线', level: '重要等级',
    status: '状态', deploy: '部署形式', devMode: '开发模式', owner: '负责人', dept: '所属部门',
    online: '上线时间', health: '健康度', cost: '成本', tags: '合规标签', update: '最近更新'
  };

  function defaultFilters() {
    return { kw: '', domainId: '', productLineId: '', statusId: '', levelId: '', deployId: '', devModeId: '', costRange: '' };
  }
  function F() { return S.filters.assets || (S.filters.assets = defaultFilters()); }

  function ensureCols() {
    if (!view.cols) {
      view.cols = {};
      Object.keys(COL_LABELS).forEach(function (k) { view.cols[k] = true; });
    }
    return view.cols;
  }

  function filtered() {
    var f = F();
    var q = f.kw.trim().toLowerCase();
    var list = S.apps.filter(function (a) {
      if (f.domainId && a.domainId !== f.domainId) return false;
      if (f.productLineId && a.productLineId !== f.productLineId) return false;
      if (f.statusId && a.statusId !== f.statusId) return false;
      if (f.levelId && a.levelId !== f.levelId) return false;
      if (f.deployId && a.deployId !== f.deployId) return false;
      if (f.devModeId && a.devModeId !== f.devModeId) return false;
      if (f.costRange) {
        var c = ITAM.costTotal(a);
        if (f.costRange === 'low' && c >= 60) return false;
        if (f.costRange === 'mid' && (c < 60 || c >= 120)) return false;
        if (f.costRange === 'high' && c < 120) return false;
      }
      if (q) {
        var hay = [a.name, a.code, a.owner, a.pinyin || '', a.dept,
          ITAM.nameOf('domains', a.domainId), ITAM.objOf('productLines', a.productLineId).name,
          a.brief, (a.techStack || []).join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var sk = view.sortKey, dir = view.sortDir === 'asc' ? 1 : -1;
    var lvW = { 'lv-core': 3, 'lv-major': 2, 'lv-normal': 1 };
    list.sort(function (a, b) {
      var va, vb;
      switch (sk) {
        case 'name': va = a.name; vb = b.name; break;
        case 'owner': va = a.owner; vb = b.owner; break;
        case 'online': va = a.onlineDate || ''; vb = b.onlineDate || ''; break;
        case 'cost': va = ITAM.costTotal(a); vb = ITAM.costTotal(b); break;
        case 'health': va = a.health; vb = b.health; break;
        case 'level': va = lvW[a.levelId] || 0; vb = lvW[b.levelId] || 0; break;
        case 'update': va = a.updateTime || ''; vb = b.updateTime || ''; break;
        default: va = a.code; vb = b.code;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return list;
  }

  function opts(arr, cur, all) {
    return ['<option value="">' + all + '</option>'].concat(arr.map(function (x) {
      return '<option value="' + x.id + '"' + (cur === x.id ? ' selected' : '') + '>' + U.esc(x.name) + '</option>';
    })).join('');
  }

  function toolbar() {
    var f = F();
    var lines = ITAM.dict('productLines');
    if (f.domainId) lines = lines.filter(function (p) { return p.domainId === f.domainId; });
    return '<div class="filter-bar">' +
      '<input class="input grow" id="fKw" placeholder="🔍 名称 / 编号 / 负责人 / 拼音首字母 / 技术栈" value="' + U.esc(f.kw) + '">' +
      '<select class="select" id="fDomain">' + opts(ITAM.dict('domains'), f.domainId, '全部应用域') + '</select>' +
      '<select class="select" id="fLine">' + opts(lines, f.productLineId, '全部产品线') + '</select>' +
      '<select class="select" id="fStatus">' + opts(ITAM.dict('statuses'), f.statusId, '全部状态') + '</select>' +
      '<select class="select" id="fLevel">' + opts(ITAM.dict('levels'), f.levelId, '全部重要等级') + '</select>' +
      '<select class="select" id="fDeploy">' + opts(ITAM.dict('deployments'), f.deployId, '全部部署形式') + '</select>' +
      '<select class="select" id="fDev">' + opts(ITAM.dict('devModes'), f.devModeId, '全部开发模式') + '</select>' +
      '<select class="select" id="fCost"><option value="">全部成本区间</option>' +
      '<option value="low"' + (f.costRange === 'low' ? ' selected' : '') + '>&lt; 60 万元</option>' +
      '<option value="mid"' + (f.costRange === 'mid' ? ' selected' : '') + '>60 ~ 120 万元</option>' +
      '<option value="high"' + (f.costRange === 'high' ? ' selected' : '') + '>&gt; 120 万元</option></select>' +
      '<button class="btn" id="fReset">重置</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn" id="btnCols">⚙ 列设置</button>' +
      '<button class="btn" id="btnImport"' + (ITAM.can('assets.import') ? '' : ' disabled') + '>⬆ 批量导入</button>' +
      '<button class="btn" id="btnExport"' + (ITAM.can('assets.export') ? '' : ' disabled') + '>⬇ 导出</button>' +
      '<button class="btn btn-primary" id="btnCreate"' + (ITAM.can('assets.create') ? '' : ' disabled') + '>＋ 新增应用</button>' +
      '</div>';
  }

  function tableHead() {
    var c = ensureCols();
    function th(key, label, sortKey) {
      if (!c[key]) return '';
      return '<th' + (sortKey ? ' data-sort="' + sortKey + '" style="cursor:pointer"' : '') + '>' + label +
        (sortKey && view.sortKey === sortKey ? (view.sortDir === 'asc' ? ' ▲' : ' ▼') : '') + '</th>';
    }
    return '<thead><tr><th style="width:34px"><input type="checkbox" id="chkAll"></th>' +
      th('code', '应用编号', 'code') + th('name', '应用名称', 'name') + th('domain', '应用域') + th('productLine', '产品线') +
      th('level', '重要等级', 'level') + th('status', '状态') + th('deploy', '部署形式') + th('devMode', '开发模式') +
      th('owner', '负责人', 'owner') + th('dept', '所属部门') + th('online', '上线时间', 'online') +
      th('health', '健康度', 'health') + th('cost', '成本', 'cost') + th('tags', '合规标签') + th('update', '最近更新', 'update') +
      '<th style="width:160px">操作</th></tr></thead>';
  }

  function rowHtml(a) {
    var c = ensureCols();
    function td(key, v, cls) { return c[key] ? '<td class="' + (cls || '') + '">' + v + '</td>' : ''; }
    var hC = a.health >= 90 ? '' : (a.health >= 75 ? 'warn' : 'danger');
    return '<tr data-row="' + a.id + '">' +
      '<td><input type="checkbox" data-sel="' + a.id + '"' + (view.selected[a.id] ? ' checked' : '') + '></td>' +
      td('code', '<span class="mono">' + U.esc(a.code) + '</span>') +
      td('name', '<span class="link" data-open="' + a.id + '">' + U.esc(a.name) + '</span>' +
        '<div style="font-size:11px;color:var(--text-3)">' + U.esc((a.brief || '').slice(0, 22)) + '…</div>') +
      td('domain', U.esc(ITAM.nameOf('domains', a.domainId))) +
      td('productLine', U.esc(ITAM.objOf('productLines', a.productLineId).name || '—')) +
      td('level', ITAM.levelBadge(a)) +
      td('status', ITAM.statusBadge(a)) +
      td('deploy', U.esc(ITAM.nameOf('deployments', a.deployId))) +
      td('devMode', U.esc(ITAM.nameOf('devModes', a.devModeId))) +
      td('owner', U.esc(a.owner)) +
      td('dept', '<span style="font-size:11.5px;color:var(--text-3)">' + U.esc(a.dept) + '</span>') +
      td('online', '<span class="mono">' + U.esc(a.onlineDate || '—') + '</span>') +
      td('health', '<div style="min-width:66px">' + ITAM.progress(a.health, hC) +
        '<span style="font-size:10.5px;color:var(--text-3)">' + a.health + '%</span></div>') +
      td('cost', '<span class="num">' + ITAM.costTotal(a) + '</span>', 'num') +
      td('tags', (a.tags || []).map(function (t) { return '<span class="tag">' + U.esc(t) + '</span>'; }).join('') || '—') +
      td('update', '<span style="font-size:11.5px;color:var(--text-3)">' + U.esc(U.rel(a.updateTime)) + '</span>') +
      '<td><div class="row-actions">' +
      '<button class="btn btn-mini" data-open="' + a.id + '">详情</button>' +
      '<button class="btn btn-mini" data-edit="' + a.id + '"' + (ITAM.can('assets.edit') ? '' : ' disabled') + '>编辑</button>' +
      '<button class="btn btn-mini btn-danger" data-del="' + a.id + '"' + (ITAM.can('assets.delete') ? '' : ' disabled') + '>删除</button>' +
      '</div></td></tr>';
  }

  function render() {
    var list = filtered();
    var totalPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (view.page > totalPage) view.page = totalPage;
    var pageList = list.slice((view.page - 1) * PAGE_SIZE, view.page * PAGE_SIZE);
    var c = ensureCols();
    var colCount = Object.keys(c).filter(function (k) { return c[k]; }).length + 2;
    var selCount = Object.keys(view.selected).filter(function (k) { return view.selected[k]; }).length;

    var html = ITAM.pageHead('应用资产台账',
      '全集团统一应用资产清单，支持按名称 / 编号 / 负责人 / 应用域 / 产品线 / 状态 / 重要等级 / 部署形式 / 开发模式 / 成本区间多维检索，以及拼音模糊搜索（如 hyzx → 会员中心）。',
      '<button class="btn" data-goto="config">🧱 分类配置</button>' +
      '<button class="btn" data-goto="topology">🕸️ 查看拓扑</button>');

    html += '<div class="card"><div class="card-bd tight">' + toolbar();

    html += '<div class="kv-inline" style="padding:8px 14px;border-bottom:1px solid var(--border);background:#fff">' +
      '<span>共筛出 <b>' + list.length + '</b> 个应用</span>' +
      '<span>核心 <b>' + list.filter(function (a) { return a.levelId === 'lv-core'; }).length + '</b></span>' +
      '<span>运行中 <b>' + list.filter(function (a) { return a.statusId === 'st-run'; }).length + '</b></span>' +
      '<span>成本合计 <b>' + Math.round(list.reduce(function (s, a) { return s + ITAM.costTotal(a); }, 0)) + '</b> 万元</span>' +
      '<span>已选 <b>' + selCount + '</b> 项</span>' +
      (selCount ? '<span style="margin-left:auto;display:flex;gap:6px">' +
        '<button class="btn btn-mini" id="btnBatchTag"' + (ITAM.can('assets.edit') ? '' : ' disabled') + '>🏷 批量打标</button>' +
        '<button class="btn btn-mini btn-danger" id="btnBatchDel"' + (ITAM.can('assets.delete') ? '' : ' disabled') + '>批量删除</button>' +
        '<button class="btn btn-mini" id="btnClearSel">清空选择</button></span>' : '') +
      '</div>';

    html += '<div class="table-wrap"><table class="tb">' + tableHead() + '<tbody>' +
      (pageList.length ? pageList.map(rowHtml).join('')
        : '<tr><td colspan="' + colCount + '">' + ITAM.emptyBox('没有符合条件的应用资产', '试试调整筛选条件或清空关键词') + '</td></tr>') +
      '</tbody></table></div>';

    html += '<div class="pager"><span>第 ' + view.page + ' / ' + totalPage + ' 页 ｜ 每页 ' + PAGE_SIZE + ' 条 ｜ 共 ' + list.length + ' 条</span>' +
      '<span class="pages">' +
      '<button class="pg" data-pg="prev"' + (view.page <= 1 ? ' disabled' : '') + '>‹</button>';
    for (var i = 1; i <= totalPage; i++) {
      html += '<button class="pg' + (i === view.page ? ' active' : '') + '" data-pg="' + i + '">' + i + '</button>';
    }
    html += '<button class="pg" data-pg="next"' + (view.page >= totalPage ? ' disabled' : '') + '>›</button></span></div>';
    html += '</div></div>';
    return html;
  }

  function mount(root) {
    var f = F();
    function bindSelect(id, key) {
      var el = root.querySelector('#' + id);
      if (!el) return;
      el.onchange = function () {
        f[key] = el.value;
        if (key === 'domainId') f.productLineId = '';
        view.page = 1;
        ITAM.render();
      };
    }
    var kw = root.querySelector('#fKw');
    if (kw) {
      var timer = null;
      kw.oninput = function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          f.kw = kw.value; view.page = 1;
          ITAM.render();
          var x = document.querySelector('#fKw');
          if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); }
        }, 280);
      };
    }
    bindSelect('fDomain', 'domainId'); bindSelect('fLine', 'productLineId');
    bindSelect('fStatus', 'statusId'); bindSelect('fLevel', 'levelId');
    bindSelect('fDeploy', 'deployId'); bindSelect('fDev', 'devModeId'); bindSelect('fCost', 'costRange');

    var rs = root.querySelector('#fReset');
    if (rs) rs.onclick = function () {
      S.filters.assets = defaultFilters(); view.page = 1; view.selected = {};
      ITAM.render(); ITAM.toast('筛选条件已重置');
    };

    root.querySelectorAll('[data-sort]').forEach(function (th) {
      th.onclick = function () {
        var k = th.getAttribute('data-sort');
        if (view.sortKey === k) view.sortDir = view.sortDir === 'asc' ? 'desc' : 'asc';
        else { view.sortKey = k; view.sortDir = 'asc'; }
        ITAM.render();
      };
    });

    root.querySelectorAll('[data-pg]').forEach(function (b) {
      b.onclick = function () {
        var v = b.getAttribute('data-pg');
        var tp = Math.max(1, Math.ceil(filtered().length / PAGE_SIZE));
        if (v === 'prev') view.page = Math.max(1, view.page - 1);
        else if (v === 'next') view.page = Math.min(tp, view.page + 1);
        else view.page = parseInt(v, 10);
        ITAM.render();
      };
    });

    root.querySelectorAll('[data-open]').forEach(function (b) {
      b.onclick = function () { openApp(b.getAttribute('data-open')); };
    });
    root.querySelectorAll('[data-edit]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () { openForm(ITAM.appById(b.getAttribute('data-edit'))); };
    });
    root.querySelectorAll('[data-del]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var a = ITAM.appById(b.getAttribute('data-del'));
        ITAM.confirm('删除应用资产',
          '确认删除应用 <b>' + U.esc(a.name) + '</b>（' + U.esc(a.code) + '）？<br>' +
          '删除后该应用的拓扑关系与关联工单将一并移除，操作会写入审计日志。',
          function () {
            var idx = S.apps.indexOf(a);
            S.apps.splice(idx, 1);
            S.callEdges = S.callEdges.filter(function (e) { return e.from !== a.id && e.to !== a.id; });
            S.changes = S.changes.filter(function (c) { return c.appId !== a.id; });
            S.licenses.forEach(function (l) { if (l.appId === a.id) l.appId = ''; });
            ITAM.pushAudit('删除应用', a.name, a.code + ' ｜ 状态：' + ITAM.nameOf('statuses', a.statusId), '成功', '应用已从台账移除', a.code);
            ITAM.persist(); ITAM.renderAll();
            ITAM.toast('已删除应用「' + a.name + '」', 'ok');
          }, '确认删除');
      };
    });

    var chkAll = root.querySelector('#chkAll');
    if (chkAll) chkAll.onclick = function () {
      filtered().slice((view.page - 1) * PAGE_SIZE, view.page * PAGE_SIZE).forEach(function (a) {
        view.selected[a.id] = chkAll.checked;
      });
      ITAM.render();
    };
    root.querySelectorAll('[data-sel]').forEach(function (cb) {
      cb.onclick = function () { view.selected[cb.getAttribute('data-sel')] = cb.checked; ITAM.render(); };
    });

    var cs = root.querySelector('#btnClearSel');
    if (cs) cs.onclick = function () { view.selected = {}; ITAM.render(); };

    var bd = root.querySelector('#btnBatchDel');
    if (bd) bd.onclick = function () {
      var ids = Object.keys(view.selected).filter(function (k) { return view.selected[k]; });
      ITAM.confirm('批量删除', '将删除已选 <b>' + ids.length + '</b> 个应用资产及其拓扑关系，是否继续？', function () {
        S.apps = S.apps.filter(function (a) { return ids.indexOf(a.id) < 0; });
        S.callEdges = S.callEdges.filter(function (e) { return ids.indexOf(e.from) < 0 && ids.indexOf(e.to) < 0; });
        S.changes = S.changes.filter(function (c) { return ids.indexOf(c.appId) < 0; });
        ITAM.pushAudit('批量删除应用', ids.length + ' 个应用', '—', '成功', '已删除：' + ids.join(', '));
        view.selected = {}; ITAM.persist(); ITAM.renderAll();
        ITAM.toast('已批量删除 ' + ids.length + ' 个应用', 'ok');
      });
    };

    var bt = root.querySelector('#btnBatchTag');
    if (bt) bt.onclick = function () {
      var ids = Object.keys(view.selected).filter(function (k) { return view.selected[k]; });
      ITAM.openModal({
        title: '批量打合规标签',
        body: '<div class="field"><label>选择合规标签</label><select class="select" id="batchTagSel">' +
          ITAM.dict('complianceTags').map(function (t) {
            return '<option value="' + U.esc(t.name) + '">' + U.esc(t.name) + ' · ' + U.esc(t.type) + '</option>';
          }).join('') + '</select><div class="hint">将为已选 ' + ids.length + ' 个应用追加该标签</div></div>',
        footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="okTag">确认打标</button>',
        onMount: function (m) {
          m.querySelector('#okTag').onclick = function () {
            var v = m.querySelector('#batchTagSel').value;
            ids.forEach(function (id) {
              var a = ITAM.appById(id);
              if (a.tags.indexOf(v) < 0) a.tags.push(v);
            });
            ITAM.pushAudit('批量打合规标签', ids.length + ' 个应用', '—', '成功', '新增标签：' + v);
            ITAM.persist(); ITAM.closeModal(); view.selected = {}; ITAM.renderAll();
            ITAM.toast('已为 ' + ids.length + ' 个应用打上「' + v + '」', 'ok');
          };
        }
      });
    };

    var bc = root.querySelector('#btnCols');
    if (bc) bc.onclick = function () {
      var c = ensureCols();
      ITAM.openModal({
        title: '列设置',
        body: '<div class="hint" style="margin-bottom:10px">勾选需要在台账表格中展示的列</div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
          Object.keys(COL_LABELS).map(function (k) {
            return '<label class="chk"><input type="checkbox" data-col="' + k + '"' + (c[k] ? ' checked' : '') + '>' + COL_LABELS[k] + '</label>';
          }).join('') + '</div>',
        footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="okCols">应用</button>',
        onMount: function (m) {
          m.querySelector('#okCols').onclick = function () {
            m.querySelectorAll('[data-col]').forEach(function (cb) { c[cb.getAttribute('data-col')] = cb.checked; });
            ITAM.closeModal(); ITAM.render();
          };
        }
      });
    };

    var imp = root.querySelector('#btnImport');
    if (imp && !imp.disabled) imp.onclick = openImport;
    var exp = root.querySelector('#btnExport');
    if (exp && !exp.disabled) exp.onclick = doExport;
    var cr = root.querySelector('#btnCreate');
    if (cr && !cr.disabled) cr.onclick = function () { openForm(null); };
  }

  /* ---------------- 导出 ---------------- */
  function doExport() {
    var list = filtered();
    var rows = [['应用编号', '应用名称', '拼音首字母', '应用域', '产品线', '重要等级', '状态', '部署形式', '开发模式',
      '负责人', '所属部门', '上线时间', '退役时间', '健康度', '云资源(万元)', '服务器(万元)', '授权(万元)', '其他(万元)',
      '成本合计(万元)', '合规标签', '技术栈', '基础设施', '开发组织', '数据来源']];
    list.forEach(function (a) {
      rows.push([a.code, a.name, a.pinyin, ITAM.nameOf('domains', a.domainId), ITAM.objOf('productLines', a.productLineId).name,
        ITAM.nameOf('levels', a.levelId), ITAM.nameOf('statuses', a.statusId), ITAM.nameOf('deployments', a.deployId),
        ITAM.nameOf('devModes', a.devModeId), a.owner, a.dept, a.onlineDate, a.retireDate, a.health + '%',
        a.cost.cloud, a.cost.server, a.cost.license, a.cost.other, ITAM.costTotal(a),
        (a.tags || []).join('/'), (a.techStack || []).join('/'), (a.infra || []).join('/'), a.devOrg, a.discoverSource]);
    });
    U.download('应用资产台账_' + U.today() + '.csv', U.csv(rows));
    ITAM.pushAudit('导出资产清单', '应用资产台账', '—', '成功', '导出 ' + list.length + ' 条记录', 'EXPORT');
    ITAM.persist(); ITAM.renderTopbar();
    ITAM.toast('已导出 ' + list.length + ' 条资产记录', 'ok');
  }

  /* ---------------- 导入 ---------------- */
  function parseCSV(text) {
    var rows = [], row = [], cur = '', inQ = false;
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQ) {
        if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
        else cur += ch;
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ',') { row.push(cur); cur = ''; }
        else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
        else cur += ch;
      }
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  function matchDict(kind, name) {
    if (!name) return '';
    var arr = ITAM.dict(kind);
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].name === name || (arr[i].code || '').toUpperCase() === String(name).toUpperCase()) return arr[i].id;
    }
    return '';
  }
  var PY_MAP = { 会: 'h', 员: 'y', 中: 'z', 心: 'x', 权: 'q', 益: 'y', 平: 'p', 台: 't', 营: 'y', 销: 'x', 活: 'h', 动: 'd', 引: 'y', 擎: 'q', 优: 'y', 惠: 'h', 券: 'q', 精: 'j', 准: 'z', 电: 'd', 商: 's', 交: 'j', 易: 'y', 订: 'd', 单: 'd', 库: 'k', 存: 'c', 采: 'c', 购: 'g', 协: 'x', 同: 't', 供: 'g', 应: 'y', 门: 'm', 户: 'h', 支: 'z', 付: 'f', 网: 'w', 关: 'g', 资: 'z', 金: 'j', 清: 'q', 结: 'j', 算: 's', 财: 'c', 务: 'w', 共: 'g', 享: 'x', 子: 'z', 发: 'f', 票: 'p', 智: 'z', 能: 'n', 客: 'k', 服: 'f', 人: 'r', 力: 'l', 源: 'y', 系: 'x', 统: 't', 招: 'z', 聘: 'p', 管: 'g', 理: 'l', 数: 's', 据: 'j', 可: 'k', 视: 's', 化: 'h', 大: 'd', 屏: 'p', 报: 'b', 表: 'b', 用: 'y', 消: 'x', 息: 'x', 推: 't', 送: 's', 配: 'p', 置: 'z', 运: 'y', 维: 'w', 监: 'j', 控: 'k', 日: 'r', 志: 'z', 分: 'f', 析: 'x', 主: 'z', 合: 'h', 风: 'f', 决: 'j', 策: 'c', 移: 'y', 办: 'b', 公: 'g', 档: 'd', 案: 'a', 老: 'l', 版: 'b', 积: 'j', 城: 'c', 定: 'd', 价: 'j', 测: 'c', 试: 's' };
  function pinyinOf(s) {
    return String(s).split('').map(function (ch) { return PY_MAP[ch] || ''; }).join('').slice(0, 10);
  }

  function openImport() {
    ITAM.openModal({
      title: '批量导入资产数据',
      body: '<div class="hint" style="line-height:1.9;margin-bottom:10px">支持 CSV 文件或文本粘贴导入（Excel 可先另存为 CSV）。<br>' +
        '表头需包含：<code>应用名称, 应用编号, 应用域, 产品线, 重要等级, 状态, 部署形式, 开发模式, 负责人, 所属部门, 上线时间, 功能简述</code>。<br>' +
        '分类值可使用名称（如「零售业务」「会员产品线」），系统自动匹配字典；未匹配项会保留并提示。</div>' +
        '<div class="field"><label>导入方式</label><select class="select" id="impMode">' +
        '<option value="paste">粘贴文本</option><option value="file">选择本地 CSV 文件</option></select></div>' +
        '<div class="field" id="impPasteWrap"><label>粘贴 CSV 内容</label>' +
        '<textarea class="textarea" id="impText" style="min-height:150px" placeholder="应用名称,应用编号,应用域,产品线,重要等级,状态,部署形式,开发模式,负责人,所属部门,上线时间,功能简述&#10;测试应用,APP-9001,零售业务,会员产品线,一般,草稿,容器化（K8s）,自主研发,测试员,零售运营中心,2025-10-01,演示导入的应用"></textarea></div>' +
        '<div class="field" id="impFileWrap" style="display:none"><label>选择 CSV 文件</label><input type="file" id="impFile" accept=".csv,.txt"></div>',
      footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="okImp">开始导入</button>',
      onMount: function (m) {
        m.querySelector('#impMode').onchange = function () {
          var isFile = this.value === 'file';
          m.querySelector('#impPasteWrap').style.display = isFile ? 'none' : '';
          m.querySelector('#impFileWrap').style.display = isFile ? '' : 'none';
        };
        var fileText = '';
        m.querySelector('#impFile').onchange = function () {
          var file = this.files[0];
          if (!file) return;
          var rd = new FileReader();
          rd.onload = function () { fileText = String(rd.result).replace(/^\ufeff/, ''); };
          rd.readAsText(file, 'utf-8');
        };
        m.querySelector('#okImp').onclick = function () {
          var mode = m.querySelector('#impMode').value;
          var txt = mode === 'file' ? fileText : m.querySelector('#impText').value;
          if (!txt.trim()) return ITAM.toast('请提供导入内容', 'err');
          var parsed = parseCSV(txt);
          if (parsed.length < 2) return ITAM.toast('未解析到有效数据行（需含表头 + 至少 1 行数据）', 'err');
          var head = parsed[0].map(function (h) { return String(h).trim(); });
          var added = 0, warn = [];
          var maxN = 0;
          S.apps.forEach(function (x) { var mm = /APP-(\d+)/.exec(x.code); if (mm) maxN = Math.max(maxN, parseInt(mm[1], 10)); });
          for (var i = 1; i < parsed.length; i++) {
            var r = parsed[i];
            if (!r.join('').trim()) continue;
            var get = (function (arr) {
              return function (nm) { var ix = head.indexOf(nm); return ix >= 0 ? String(arr[ix] || '').trim() : ''; };
            })(r);
            var nm0 = get('应用名称');
            if (!nm0) { warn.push('第 ' + (i + 1) + ' 行缺少应用名称，已跳过'); continue; }
            var domId = matchDict('domains', get('应用域'));
            var plId = matchDict('productLines', get('产品线'));
            if (get('应用域') && !domId) warn.push('第 ' + (i + 1) + ' 行应用域「' + get('应用域') + '」未匹配字典，已置空');
            if (get('产品线') && !plId) warn.push('第 ' + (i + 1) + ' 行产品线「' + get('产品线') + '」未匹配字典，已置空');
            var pl = plId ? ITAM.find('productLines', plId) : null;
            if (pl && domId && pl.domainId !== domId) {
              warn.push('第 ' + (i + 1) + ' 行产品线「' + pl.name + '」不属于所选应用域，已按产品线归属修正为「' + ITAM.nameOf('domains', pl.domainId) + '」');
              domId = pl.domainId;
            }
            maxN++;
            var newApp = {
              id: U.uid('app'),
              code: get('应用编号') || ('APP-' + String(maxN).padStart(4, '0')),
              name: nm0, pinyin: pinyinOf(nm0),
              domainId: domId || (pl ? pl.domainId : ''), productLineId: plId || '',
              levelId: matchDict('levels', get('重要等级')) || 'lv-normal',
              statusId: matchDict('statuses', get('状态')) || 'st-draft',
              deployId: matchDict('deployments', get('部署形式')) || 'dp-vm',
              devModeId: matchDict('devModes', get('开发模式')) || 'dv-self',
              owner: get('负责人') || '待指定', dept: get('所属部门') || '待指定',
              onlineDate: get('上线时间') || '', retireDate: '',
              brief: get('功能简述') || '（批量导入，待补充功能简述）',
              devOrg: '待补充', vendor: '待补充',
              techStack: ['待补充'], infra: ['待补充'], tags: [], health: 85,
              cost: { cloud: 0, server: 0, license: 0, other: 0 },
              users: ['待补充'], value: '（待补充价值定位）',
              modules: [{ name: '待补充', desc: '请补充核心功能模块' }],
              inputs: [], outputs: [],
              createTime: U.today(), updateTime: D.tOff(0, new Date().getHours(), new Date().getMinutes()),
              discoverSource: 'Excel 批量导入', compliance: 'pending'
            };
            if (S.apps.some(function (x) { return x.code === newApp.code; })) {
              warn.push('第 ' + (i + 1) + ' 行应用编号「' + newApp.code + '」已存在，已自动生成新编号');
              maxN++;
              newApp.code = 'APP-' + String(maxN).padStart(4, '0');
            }
            S.apps.push(newApp); added++;
          }
          if (added) {
            ITAM.pushAudit('导入资产数据', '应用资产台账', '—', '成功', '成功导入 ' + added + ' 条，异常 ' + warn.length + ' 条');
            ITAM.persist(); ITAM.closeModal(); ITAM.renderAll();
          }
          ITAM.toast('导入完成：成功 ' + added + ' 条' + (warn.length ? '，' + warn.length + ' 条提示' : ''), added ? 'ok' : 'err');
          if (warn.length) {
            ITAM.openModal({
              title: '导入提示明细（' + warn.length + ' 条）',
              body: '<div style="font-size:12.5px;line-height:2">' + warn.map(function (w) { return '• ' + U.esc(w); }).join('<br>') + '</div>'
            });
          }
        };
      }
    });
  }

  /* ---------------- 新增 / 编辑表单 ---------------- */
  function openForm(app) {
    var isEdit = !!app;
    var a;
    if (isEdit) {
      a = app;
    } else {
      a = {
        name: '', code: '', pinyin: '', domainId: '', productLineId: '', levelId: 'lv-normal', statusId: 'st-draft',
        deployId: 'dp-vm', devModeId: 'dv-self', owner: '', dept: '', onlineDate: '', retireDate: '', brief: '',
        devOrg: '', vendor: '', techStack: [], infra: [], tags: [], health: 90,
        cost: { cloud: 0, server: 0, license: 0, other: 0 },
        users: [], value: '', modules: [], inputs: [], outputs: [], createTime: U.today(), updateTime: '',
        discoverSource: '人工登记', compliance: 'pending'
      };
    }

    function selBy(kind, cur, ph) {
      return '<option value="">' + ph + '</option>' + ITAM.dict(kind).filter(function (x) { return x.enabled !== false; }).map(function (x) {
        return '<option value="' + x.id + '"' + (cur === x.id ? ' selected' : '') + '>' + U.esc(x.name) + '</option>';
      }).join('');
    }
    function lineOpts(domId, cur) {
      var ls = ITAM.dict('productLines').filter(function (p) { return p.enabled !== false && (!domId || p.domainId === domId); });
      return '<option value="">请选择产品线</option>' + ls.map(function (p) {
        return '<option value="' + p.id + '"' + (cur === p.id ? ' selected' : '') + '>' + U.esc(p.name) + '（' + U.esc(ITAM.nameOf('domains', p.domainId)) + '）</option>';
      }).join('');
    }

    var body =
      '<div class="form-section"><h4>一、应用基础信息</h4><div class="form-grid">' +
      '<div class="field"><label>应用名称<i>*</i></label><input class="input" id="fmName" value="' + U.esc(a.name) + '" placeholder="如：会员中心"></div>' +
      '<div class="field"><label>应用编号</label><input class="input" id="fmCode" value="' + U.esc(a.code) + '" placeholder="留空自动生成"><div class="hint">编号需全局唯一</div></div>' +
      '<div class="field"><label>所属应用域<i>*</i></label><select class="select" id="fmDomain">' + selBy('domains', a.domainId, '请选择应用域') + '</select><div class="hint">应用域为产品线的上级分类</div></div>' +
      '<div class="field"><label>所属产品线<i>*</i></label><select class="select" id="fmLine">' + lineOpts(a.domainId, a.productLineId) + '</select><div class="hint">仅展示所选应用域下辖产品线</div></div>' +
      '<div class="field"><label>重要等级</label><select class="select" id="fmLevel">' + selBy('levels', a.levelId, '请选择') + '</select></div>' +
      '<div class="field"><label>资产状态</label><select class="select" id="fmStatus">' + selBy('statuses', a.statusId, '请选择') + '</select></div>' +
      '<div class="field"><label>部署形式</label><select class="select" id="fmDeploy">' + selBy('deployments', a.deployId, '请选择') + '</select></div>' +
      '<div class="field"><label>开发方式</label><select class="select" id="fmDev">' + selBy('devModes', a.devModeId, '请选择') + '</select></div>' +
      '<div class="field"><label>负责人</label><input class="input" id="fmOwner" value="' + U.esc(a.owner) + '" placeholder="如：李明"></div>' +
      '<div class="field"><label>所属部门</label><input class="input" id="fmDept" value="' + U.esc(a.dept) + '" placeholder="如：零售运营中心"></div>' +
      '<div class="field"><label>上线时间</label><input class="input" id="fmOnline" value="' + U.esc(a.onlineDate) + '" placeholder="YYYY-MM-DD"></div>' +
      '<div class="field"><label>退役时间</label><input class="input" id="fmRetire" value="' + U.esc(a.retireDate || '') + '" placeholder="未退役留空"></div>' +
      '<div class="field span2"><label>功能简述</label><textarea class="textarea" id="fmBrief">' + U.esc(a.brief) + '</textarea></div>' +
      '<div class="field"><label>开发组织 / 厂商</label><input class="input" id="fmOrg" value="' + U.esc(a.devOrg || '') + '"></div>' +
      '<div class="field"><label>技术栈（顿号分隔）</label><input class="input" id="fmTech" value="' + U.esc((a.techStack || []).join('、')) + '"></div>' +
      '<div class="field"><label>基础设施依赖（顿号分隔）</label><input class="input" id="fmInfra" value="' + U.esc((a.infra || []).join('、')) + '"></div>' +
      '<div class="field"><label>合规标签（顿号分隔）</label><input class="input" id="fmTags" value="' + U.esc((a.tags || []).join('、')) + '" placeholder="如：等保三级、ISO27001"></div>' +
      '</div></div>' +

      '<div class="form-section"><h4>二、台账详情扩展信息</h4><div class="form-grid">' +
      '<div class="field span2"><label>价值定位</label><textarea class="textarea" id="fmValue">' + U.esc(a.value || '') + '</textarea></div>' +
      '<div class="field"><label>用户 / 客户群（顿号分隔）</label><input class="input" id="fmUsers" value="' + U.esc((a.users || []).join('、')) + '"></div>' +
      '<div class="field"><label>健康度（0-100）</label><input class="input" id="fmHealth" value="' + (a.health || 90) + '"></div>' +
      '<div class="field span2"><label>核心功能模块（每行一条，格式：模块名 | 简述）</label>' +
      '<textarea class="textarea" id="fmModules" style="min-height:88px">' +
      U.esc((a.modules || []).map(function (mg) { return mg.name + ' | ' + mg.desc; }).join('\n')) + '</textarea></div>' +
      '<div class="field"><label>输入数据（每行：数据项 | 来源系统）</label><textarea class="textarea" id="fmInputs">' +
      U.esc((a.inputs || []).map(function (x) { return (x[0] || x.name || '') + ' | ' + (x[1] || x.from || ''); }).join('\n')) + '</textarea></div>' +
      '<div class="field"><label>输出数据（每行：数据项 | 消费方）</label><textarea class="textarea" id="fmOutputs">' +
      U.esc((a.outputs || []).map(function (x) { return (x[0] || x.name || '') + ' | ' + (x[1] || x.to || ''); }).join('\n')) + '</textarea></div>' +
      '</div></div>' +

      '<div class="form-section"><h4>三、成本归集（万元 / 年）</h4><div class="form-grid">' +
      '<div class="field"><label>云资源费用</label><input class="input" id="fmC1" value="' + (a.cost.cloud || 0) + '"></div>' +
      '<div class="field"><label>服务器费用</label><input class="input" id="fmC2" value="' + (a.cost.server || 0) + '"></div>' +
      '<div class="field"><label>License 授权费用</label><input class="input" id="fmC3" value="' + (a.cost.license || 0) + '"></div>' +
      '<div class="field"><label>其他费用</label><input class="input" id="fmC4" value="' + (a.cost.other || 0) + '"></div>' +
      '</div></div>';

    var footer = '<div class="form-actions">' +
      '<button class="btn" data-close="1">取消</button>' +
      (isEdit ? '' : '<button class="btn" id="fmDraft">保存为草稿</button>') +
      '<button class="btn btn-primary" id="fmSave">' + (isEdit ? '保存修改' : '创建应用') + '</button>' +
      '</div>';

    ITAM.openDrawer({
      narrow: true,
      title: isEdit ? '编辑应用 · ' + U.esc(a.name) : '新增应用资产',
      sub: isEdit ? U.esc(a.code) + ' ｜ 最近更新 ' + U.esc(U.rel(a.updateTime)) : '填写台账基础信息与详情扩展信息',
      body: body,
      footer: footer,
      onMount: function (root) {
        var domSel = root.querySelector('#fmDomain');
        var lineSel = root.querySelector('#fmLine');
        domSel.onchange = function () { lineSel.innerHTML = lineOpts(domSel.value, ''); };
        function splitList(id) {
          var v = root.querySelector('#' + id).value.trim();
          return v ? v.split(/[、,，\/]/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
        }
        function parsePairs(id) {
          return root.querySelector('#' + id).value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
            var p = l.split('|').map(function (x) { return x.trim(); });
            return [p[0] || '', p[1] || ''];
          });
        }
        function collect(statusOverride) {
          var name = root.querySelector('#fmName').value.trim();
          if (!name) { ITAM.toast('请填写应用名称', 'err'); return null; }
          var domainId = domSel.value, lineId = lineSel.value;
          if (!domainId) { ITAM.toast('请选择所属应用域', 'err'); return null; }
          if (!lineId) { ITAM.toast('请选择所属产品线', 'err'); return null; }
          var pl = ITAM.find('productLines', lineId);
          if (pl && pl.domainId !== domainId) {
            ITAM.toast('产品线与应用域不匹配：产品线「' + pl.name + '」隶属于「' + ITAM.nameOf('domains', pl.domainId) + '」', 'err');
            return null;
          }
          var mods = root.querySelector('#fmModules').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
            var p = l.split('|').map(function (x) { return x.trim(); });
            return { name: p[0] || '', desc: p[1] || '' };
          });
          return {
            name: name, code: root.querySelector('#fmCode').value.trim(), pinyin: pinyinOf(name),
            domainId: domainId, productLineId: lineId,
            levelId: root.querySelector('#fmLevel').value,
            statusId: statusOverride || root.querySelector('#fmStatus').value,
            deployId: root.querySelector('#fmDeploy').value,
            devModeId: root.querySelector('#fmDev').value,
            owner: root.querySelector('#fmOwner').value.trim() || '待指定',
            dept: root.querySelector('#fmDept').value.trim() || '待指定',
            onlineDate: root.querySelector('#fmOnline').value.trim(),
            retireDate: root.querySelector('#fmRetire').value.trim(),
            brief: root.querySelector('#fmBrief').value.trim(),
            devOrg: root.querySelector('#fmOrg').value.trim(),
            techStack: splitList('fmTech'), infra: splitList('fmInfra'),
            tags: splitList('fmTags'), users: splitList('fmUsers'),
            health: Math.max(0, Math.min(100, parseInt(root.querySelector('#fmHealth').value, 10) || 90)),
            value: root.querySelector('#fmValue').value.trim(),
            modules: mods,
            inputs: parsePairs('fmInputs'), outputs: parsePairs('fmOutputs'),
            cost: {
              cloud: parseFloat(root.querySelector('#fmC1').value) || 0,
              server: parseFloat(root.querySelector('#fmC2').value) || 0,
              license: parseFloat(root.querySelector('#fmC3').value) || 0,
              other: parseFloat(root.querySelector('#fmC4').value) || 0
            }
          };
        }
        function commit(statusOverride, isDraft) {
          var data = collect(statusOverride);
          if (!data) return;
          if (isEdit) {
            var before = a.name + ' ｜ 状态：' + ITAM.nameOf('statuses', a.statusId) + ' ｜ 负责人：' + a.owner;
            Object.keys(data).forEach(function (k) { a[k] = data[k]; });
            if (!a.code) a.code = b_code || a.code;
            a.updateTime = D.tOff(0, new Date().getHours(), new Date().getMinutes());
            ITAM.pushAudit('编辑应用', a.name, before, '成功',
              a.name + ' ｜ 状态：' + ITAM.nameOf('statuses', a.statusId) + ' ｜ 负责人：' + a.owner, a.code);
            ITAM.toast('已保存「' + a.name + '」的修改', 'ok');
          } else {
            if (!data.code) {
              var maxN = 0;
              S.apps.forEach(function (x) { var mm = /APP-(\d+)/.exec(x.code); if (mm) maxN = Math.max(maxN, parseInt(mm[1], 10)); });
              data.code = 'APP-' + String(maxN + 1).padStart(4, '0');
            }
            if (S.apps.some(function (x) { return x.code === data.code; })) {
              ITAM.toast('应用编号「' + data.code + '」已存在，请修改', 'err');
              return;
            }
            data.id = U.uid('app');
            data.createTime = U.today();
            data.updateTime = D.tOff(0, new Date().getHours(), new Date().getMinutes());
            data.discoverSource = '人工登记';
            data.compliance = 'pending';
            data.vendor = data.devOrg || '待补充';
            data.retireDate = data.retireDate || '';
            S.apps.push(data);
            ITAM.pushAudit('新增应用', data.name, '—', '成功',
              '应用已创建并进入「' + ITAM.nameOf('statuses', data.statusId) + '」状态', data.code);
            ITAM.toast('已创建应用「' + data.name + '」', 'ok');
          }
          ITAM.persist(); ITAM.closeDrawer(); ITAM.renderAll();
        }
        var b_code = null;
        root.querySelector('#fmSave').onclick = function () { commit(null, false); };
        var db = root.querySelector('#fmDraft');
        if (db) db.onclick = function () { commit('st-draft', true); };
        root.querySelectorAll('[data-close]').forEach(function (b) { b.onclick = ITAM.closeDrawer; });
      }
    });
  }

  /* ---------------- 台账详情抽屉 ---------------- */
  function openApp(id) {
    var a = ITAM.appById(id);
    if (!a) return ITAM.toast('应用不存在', 'err');
    var cur = 'base';
    var upIds = D.ups(a), downIds = D.downs(a), sysIds = D.sysDeps(a);
    var chgs = S.changes.filter(function (c) { return c.appId === a.id; });
    var logs = S.audits.filter(function (l) { return l.object === a.name; }).slice(0, 12);
    var lics = S.licenses.filter(function (l) { return l.appId === a.id; });

    function depList(ids, emptyTxt) {
      if (!ids.length) return '<span style="color:var(--text-3);font-size:12px">' + emptyTxt + '</span>';
      return ids.map(function (x) {
        var t = ITAM.appById(x);
        if (!t) return '';
        return '<span class="tag" style="cursor:pointer" data-jump="' + t.id + '">' + U.esc(t.name) + ' · ' + U.esc(ITAM.nameOf('levels', t.levelId)) + '</span>';
      }).join('');
    }
    function pairTable(rows, k1, k2) {
      if (!rows || !rows.length) return '<div class="card-bd" style="color:var(--text-3);font-size:12px">— 暂无登记 —</div>';
      return '<table class="tb" style="min-width:auto"><thead><tr><th>' + k1 + '</th><th>' + k2 + '</th></tr></thead><tbody>' +
        rows.map(function (r) {
          var v1 = Array.isArray(r) ? r[0] : (r.name || '');
          var v2 = Array.isArray(r) ? r[1] : (r.from || r.to || '');
          return '<tr><td>' + U.esc(v1) + '</td><td>' + U.esc(v2) + '</td></tr>';
        }).join('') + '</tbody></table>';
    }

    var tabs = [
      ['base', '基础信息'], ['ext', '详情扩展信息'], ['topo', '上下游拓扑'],
      ['lic', '关联 License（' + lics.length + '）'],
      ['change', '变更与状态（' + chgs.length + '）'],
      ['audit', '审计留痕（' + logs.length + '）']
    ];

    ITAM.openDrawer({
      title: U.esc(a.name) + ' ' + ITAM.levelBadge(a) + ' ' + ITAM.statusBadge(a),
      sub: '<span class="mono">' + U.esc(a.code) + '</span> ｜ ' + ITAM.appPath(a) + ' ｜ 负责人 ' + U.esc(a.owner) + '（' + U.esc(a.dept) + '）',
      actions: [
        { label: '🕸️ 查看拓扑', onClick: function () {
            ITAM.closeDrawer(); ITAM.go('topology');
            setTimeout(function () { if (window.ITAM.openTopoFocus) window.ITAM.openTopoFocus(a.id); }, 80);
          } },
        { label: '✏️ 编辑', onClick: function () {
            if (!ITAM.can('assets.edit')) return ITAM.toast('当前角色无编辑权限', 'err');
            ITAM.closeDrawer(); openForm(a);
          } },
        { label: '📄 导出详情', onClick: function () {
            if (!ITAM.can('assets.export')) return ITAM.toast('当前角色无导出权限', 'err');
            var rows = [['字段', '内容']];
            rows.push(['应用名称', a.name], ['应用编号', a.code], ['应用域', ITAM.nameOf('domains', a.domainId)],
              ['产品线', ITAM.objOf('productLines', a.productLineId).name],
              ['重要等级', ITAM.nameOf('levels', a.levelId)], ['状态', ITAM.nameOf('statuses', a.statusId)],
              ['部署形式', ITAM.nameOf('deployments', a.deployId)], ['开发方式', ITAM.nameOf('devModes', a.devModeId)],
              ['负责人', a.owner], ['所属部门', a.dept], ['上线时间', a.onlineDate], ['退役时间', a.retireDate || '—'],
              ['功能简述', a.brief], ['价值定位', a.value], ['用户/客户群', (a.users || []).join('、')],
              ['技术栈', (a.techStack || []).join('/')], ['基础设施', (a.infra || []).join('/')],
              ['合规标签', (a.tags || []).join('/')], ['成本合计(万元)', ITAM.costTotal(a)], ['开发组织', a.devOrg]);
            rows.push([]);
            rows.push(['上游调用方', upIds.map(function (x) { return ITAM.appLabel(x); }).join('、')]);
            rows.push(['下游被依赖', downIds.map(function (x) { return ITAM.appLabel(x); }).join('、')]);
            rows.push(['基础设施依赖', sysIds.map(function (x) { return x.replace(/^sys-/, ''); }).join('、')]);
            rows.push([]);
            rows.push(['核心功能模块', '简述']);
            (a.modules || []).forEach(function (mg) { rows.push([mg.name, mg.desc]); });
            U.download(a.name + '_资产详情_' + U.today() + '.csv', U.csv(rows));
            ITAM.pushAudit('导出应用详情', a.name, '—', '成功', '导出单应用详情（含扩展信息与拓扑）', a.code);
            ITAM.persist(); ITAM.renderTopbar();
            ITAM.toast('详情已导出', 'ok');
          } }
      ],
      body: '<div class="tabs" id="detailTabs">' + tabs.map(function (t) {
        return '<button class="tab" data-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div><div id="tabBody"></div>',
      onMount: function (root) {
        function paint(tab) {
          var el = root.querySelector('#tabBody');
          if (tab === 'base') {
            el.innerHTML = '<div class="section-title">基础信息</div>' +
              ITAM.dl([
                { k: '应用编号', v: '<span class="mono">' + U.esc(a.code) + '</span>' },
                { k: '应用名称', v: U.esc(a.name) },
                { k: '所属应用域', v: U.esc(ITAM.nameOf('domains', a.domainId)) },
                { k: '所属产品线', v: U.esc(ITAM.objOf('productLines', a.productLineId).name || '—') },
                { k: '重要等级', v: ITAM.levelBadge(a) },
                { k: '资产状态', v: ITAM.statusBadge(a) },
                { k: '部署形式', v: U.esc(ITAM.nameOf('deployments', a.deployId)) },
                { k: '开发方式', v: U.esc(ITAM.nameOf('devModes', a.devModeId)) },
                { k: '负责人', v: U.esc(a.owner) },
                { k: '所属部门', v: U.esc(a.dept) },
                { k: '上线时间', v: '<span class="mono">' + U.esc(a.onlineDate || '—') + '</span>' },
                { k: '退役时间', v: '<span class="mono">' + U.esc(a.retireDate || '—') + '</span>' },
                { k: '开发组织 / 厂商', v: U.esc(a.devOrg || '—') },
                { k: '数据来源', v: '<span class="badge b-cyan">' + U.esc(a.discoverSource) + '</span>' },
                { k: '合规状态', v: ({ compliant: '<span class="badge b-green">合规</span>', pending: '<span class="badge b-orange">待核查</span>', risk: '<span class="badge b-red">存在风险项</span>', archived: '<span class="badge b-gray">已归档</span>' })[a.compliance] || '—' }
              ]) +
              '<div class="section-title">功能简述</div><div class="card"><div class="card-bd">' + U.esc(a.brief) + '</div></div>' +
              '<div class="section-title">技术栈 / 基础设施 / 合规标签</div>' +
              '<div class="card"><div class="card-bd">' +
              '<div style="margin-bottom:8px"><b style="font-size:12px">技术栈：</b>' +
              ((a.techStack || []).length ? a.techStack.map(function (t) { return '<span class="tag">' + U.esc(t) + '</span>'; }).join('') : '—') + '</div>' +
              '<div style="margin-bottom:8px"><b style="font-size:12px">基础设施依赖：</b>' +
              ((a.infra || []).length ? a.infra.map(function (t) { return '<span class="tag">' + U.esc(t) + '</span>'; }).join('') : '—') + '</div>' +
              '<div><b style="font-size:12px">合规标签：</b>' +
              ((a.tags || []).length ? a.tags.map(function (t) {
                var tg = ITAM.dict('complianceTags').filter(function (x) { return x.name === t; })[0];
                return '<span class="badge ' + (tg ? tg.color : 'b-gray') + '" style="margin:0 4px 4px 0">' + U.esc(t) + '</span>';
              }).join('') : '—') + '</div></div></div>' +
              '<div class="section-title">成本归集（万元 / 年）</div><div class="grid g-4">' +
              ITAM.kpi('云资源', '☁️', 'primary', a.cost.cloud, '', '') +
              ITAM.kpi('服务器', '🖥️', 'info', a.cost.server, '', '') +
              ITAM.kpi('授权费用', '🔑', 'warn', a.cost.license, '', '') +
              ITAM.kpi('合计', '💰', 'purple', ITAM.costTotal(a), '', '') +
              '</div>';
          } else if (tab === 'ext') {
            el.innerHTML = '<div class="section-title">价值定位</div>' +
              '<div class="card"><div class="card-bd">' + U.esc(a.value || '—') + '</div></div>' +
              '<div class="section-title">用户 / 客户群</div>' +
              '<div class="card"><div class="card-bd">' +
              ((a.users || []).length ? a.users.map(function (u) { return '<span class="tag">' + U.esc(u) + '</span>'; }).join('') : '—') +
              '</div></div>' +
              '<div class="section-title">核心功能模块</div><div class="card"><div class="card-bd tight">' +
              ((a.modules || []).length
                ? '<table class="tb" style="min-width:auto"><thead><tr><th style="width:34px">#</th><th>模块名称</th><th>模块简述</th></tr></thead><tbody>' +
                  a.modules.map(function (mg, i) {
                    return '<tr><td>' + (i + 1) + '</td><td><b>' + U.esc(mg.name) + '</b></td><td>' + U.esc(mg.desc) + '</td></tr>';
                  }).join('') + '</tbody></table>'
                : ITAM.emptyBox('暂无模块登记')) + '</div></div>' +
              '<div class="grid g-2 mt14">' +
              '<div class="card"><div class="card-hd"><h3>输入数据（接收其他系统数据）</h3></div>' + pairTable(a.inputs, '数据项', '来源系统') + '</div>' +
              '<div class="card"><div class="card-hd"><h3>输出数据（对外核心数据）</h3></div>' + pairTable(a.outputs, '数据项', '消费方') + '</div>' +
              '</div>';
          } else if (tab === 'topo') {
            el.innerHTML = '<div class="section-title">上游调用方（依赖本应用）</div>' +
              '<div class="card"><div class="card-bd">' + depList(upIds, '暂无上游应用调用本应用') + '</div></div>' +
              '<div class="section-title">下游被依赖方（本应用调用）</div>' +
              '<div class="card"><div class="card-bd">' + depList(downIds, '本应用暂未登记下游依赖') + '</div></div>' +
              '<div class="section-title">基础设施 / 中间件依赖</div><div class="card"><div class="card-bd">' +
              (sysIds.length ? sysIds.map(function (x) { return '<span class="tag">🗄️ ' + U.esc(x.replace(/^sys-/, '')) + '</span>'; }).join('') : '—') +
              '</div></div>' +
              '<div class="hint mt14" style="color:var(--text-3)">上 / 下游关系来源于台账登记与自动采集，可在「拓扑与关系」页查看可视化图谱与影响分析。</div>' +
              '<div class="mt14"><button class="btn" id="goTopo">🕸️ 在拓扑图中查看</button></div>';
            setTimeout(function () {
              var b = root.querySelector('#goTopo');
              if (b) b.onclick = function () {
                ITAM.closeDrawer(); ITAM.go('topology');
                setTimeout(function () { if (window.ITAM.openTopoFocus) window.ITAM.openTopoFocus(a.id); }, 80);
              };
            }, 0);
          } else if (tab === 'lic') {
            el.innerHTML = lics.length
              ? '<div class="card"><div class="card-bd tight"><table class="tb"><thead><tr><th>软件 / 授权</th><th>服务商</th><th>类型</th><th>数量</th><th>到期日</th><th>状态</th><th>金额</th></tr></thead><tbody>' +
                lics.map(function (l) {
                  var ls = ITAM.licenseStatus(l);
                  return '<tr><td><b>' + U.esc(l.product) + '</b></td><td>' + U.esc(l.vendor) + '</td><td>' + U.esc(l.type) + '</td>' +
                    '<td class="num">' + U.num(l.qty) + '</td><td class="mono">' + U.esc(l.expireDate) + '</td>' +
                    '<td><span class="badge ' + ls.cls + '">' + ls.text + '</span></td><td class="num">' + l.amount + ' 万元</td></tr>';
                }).join('') + '</tbody></table></div></div>'
              : ITAM.emptyBox('该应用暂无关联 License', '可在「License 管理」中登记并关联本应用');
          } else if (tab === 'change') {
            var passed = chgs.filter(function (c) { return c.status === '已通过'; })[0];
            el.innerHTML = '<div class="section-title">状态流转记录</div><div class="card"><div class="card-bd">' +
              ITAM.timeline([
                { time: a.onlineDate || a.createTime, title: '应用上线', desc: '状态流转至「运行中」，记录已归档', state: 'ok' },
                passed
                  ? { time: passed.createdAt, title: passed.type + '：' + passed.title, desc: '审批通过，已自动回填台账', state: 'ok' }
                  : { time: '—', title: '暂无已通过的变更', desc: '可在下方发起变更工单，审批通过后自动回填', state: '' }
              ]) + '</div></div>' +
              '<div class="section-title">关联变更工单（' + chgs.length + '）</div>' +
              (chgs.length
                ? '<div class="card"><div class="card-bd tight"><table class="tb"><thead><tr><th>工单号</th><th>类型</th><th>标题</th><th>申请人</th><th>状态</th><th>提交时间</th></tr></thead><tbody>' +
                  chgs.map(function (c) {
                    return '<tr><td class="mono">' + U.esc(c.id) + '</td><td>' + U.esc(c.type) + '</td><td>' + U.esc(c.title) + '</td>' +
                      '<td>' + U.esc(c.applicant) + '</td>' +
                      '<td><span class="badge ' + ({ '待审批': 'b-orange', '审批中': 'b-blue', '已通过': 'b-green', '已驳回': 'b-red' })[c.status] + '">' + U.esc(c.status) + '</span></td>' +
                      '<td class="mono">' + U.esc(c.createdAt) + '</td></tr>';
                  }).join('') + '</tbody></table></div></div>'
                : ITAM.emptyBox('暂无变更工单')) +
              '<div class="mt14"><button class="btn btn-primary" id="detailNewChange"' + (ITAM.can('change.submit') ? '' : ' disabled') + '>＋ 发起变更工单</button></div>';
            setTimeout(function () {
              var b = root.querySelector('#detailNewChange');
              if (b && !b.disabled) b.onclick = function () {
                ITAM.closeDrawer(); ITAM.go('lifecycle');
                setTimeout(function () { if (window.ITAM.openChangeForm) window.ITAM.openChangeForm(a.id); }, 90);
              };
            }, 0);
          } else {
            el.innerHTML = logs.length
              ? '<div class="card"><div class="card-bd tight"><table class="tb"><thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>IP</th><th>结果</th><th>变更前 → 变更后</th></tr></thead><tbody>' +
                logs.map(function (l) {
                  return '<tr><td class="mono">' + U.esc(l.time) + '</td><td>' + U.esc(l.user) + '</td><td>' + U.esc(l.action) + '</td>' +
                    '<td class="mono">' + U.esc(l.ip) + '</td>' +
                    '<td><span class="badge ' + (l.result === '成功' ? 'b-green' : 'b-red') + '">' + U.esc(l.result) + '</span></td>' +
                    '<td style="font-size:11.5px">' + U.esc(l.before) +
                    (l.before !== l.after && l.before !== '—' ? '<br><span style="color:var(--success)">→ ' + U.esc(l.after) + '</span>' : '') +
                    '</td></tr>';
                }).join('') + '</tbody></table></div></div>'
              : ITAM.emptyBox('暂无操作审计记录');
          }
          root.querySelectorAll('[data-jump]').forEach(function (t) {
            t.onclick = function () { openApp(t.getAttribute('data-jump')); };
          });
        }
        root.querySelectorAll('[data-tab]').forEach(function (b) {
          b.onclick = function () {
            root.querySelectorAll('[data-tab]').forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            paint(b.getAttribute('data-tab'));
          };
        });
        var first = root.querySelector('[data-tab="base"]');
        if (first) first.classList.add('active');
        paint('base');
      }
    });
  }

  ITAM.register('assets', { title: '应用资产台账', render: render, mount: mount });
  ITAM.openApp = openApp;
  ITAM.openAssetForm = openForm;
  ITAM.assetFiltered = filtered;
  ITAM.assetExport = doExport;
})();
