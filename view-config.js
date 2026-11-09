/* =========================================================
   一、分类配置管理（P0）
   二、License 管理（P0）
   三、生命周期与变更管理（P0-P1）
   ========================================================= */
(function () {
  'use strict';
  var ITAM = window.ITAM, U = ITAM.U, S = ITAM.S, D = window.ITAM_DATA;

  /* ================= 分类配置管理 ================= */
  var KIND_META = {
    domains: { title: '应用域分类', label: '应用域', note: '作为产品线的上级分类（应用域 → 产品线，一对多）' },
    productLines: { title: '产品线分类', label: '产品线', note: '必须指定所属应用域，与应用所属产品线字段联动' },
    statuses: { title: '状态分类', label: '状态', note: '资产状态分类及是否允许继续流转' },
    levels: { title: '重要等级分类', label: '重要等级', note: '含颜色标识，用于台账与仪表盘可视化' },
    deployments: { title: '部署形式分类', label: '部署形式', note: '物理机 / 虚拟机 / 容器化 / 云原生等' },
    devModes: { title: '开发模式分类', label: '开发模式', note: '自主研发 / 采购商用 / 外包开发 / 联合研发等' }
  };
  var cfgKind = 'domains';
  var cfgShowDisabled = false;

  function usageCount(kind, id) {
    var field = { domains: 'domainId', productLines: 'productLineId', statuses: 'statusId', levels: 'levelId', deployments: 'deployId', devModes: 'devModeId' }[kind];
    return S.apps.filter(function (a) { return a[field] === id; }).length;
  }
  function childCount(id) { return S.productLines.filter(function (p) { return p.domainId === id; }).length; }

  function cfgRender() {
    var meta = KIND_META[cfgKind];
    var list = ITAM.dict(cfgKind).slice().sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
    var rows = cfgShowDisabled ? list : list.filter(function (x) { return x.enabled !== false; });

    var html = ITAM.pageHead('分类配置管理',
      '管理员可自定义维护各类分类字典，支持新增 / 编辑 / 停用 / 排序分类项，并在应用资产录入时下拉引用，实现分类体系统一与灵活扩展。' +
      '<br>特别注意：<b>产品线必须隶属于唯一一个应用域</b>；停用某应用域前需先处理其下辖产品线。',
      '<button class="btn" id="cfgExport">⬇ 导出字典</button>' +
      '<button class="btn btn-primary" id="cfgCreate"' + (ITAM.can('config.manage') ? '' : ' disabled') + '>＋ 新增' + meta.label + '</button>');

    html += '<div class="card"><div class="card-bd tight">';
    html += '<div class="tabs" style="padding:0 14px;margin:0">' +
      Object.keys(KIND_META).map(function (k) {
        return '<button class="tab' + (k === cfgKind ? ' active' : '') + '" data-kind="' + k + '">' +
          KIND_META[k].title + '（' + ITAM.dict(k).length + '）</button>';
      }).join('') + '</div>';
    html += '<div class="filter-bar" style="border-radius:0">' +
      '<span style="font-size:12.5px;color:var(--text-2)"><b>' + meta.title + '</b> ｜ ' + meta.note + '</span>' +
      '<span class="spacer"></span>' +
      '<label class="chk"><input type="checkbox" id="cfgShowDisabled"' + (cfgShowDisabled ? ' checked' : '') + '> 显示已停用</label>' +
      '</div>';
    html += '<div class="table-wrap"><table class="tb"><thead><tr>' +
      '<th style="width:76px">排序</th><th>' + meta.label + '名称</th><th>编码</th>' +
      (cfgKind === 'productLines' ? '<th>所属应用域（从属关系）</th><th>产品负责人</th>' : '') +
      (cfgKind === 'levels' ? '<th>颜色标识</th><th>权重</th>' : '') +
      (cfgKind === 'statuses' ? '<th>允许流转</th>' : '') +
      (cfgKind === 'domains' ? '<th>下辖产品线</th>' : '') +
      '<th>说明</th><th>引用应用数</th><th>状态</th><th style="width:180px">操作</th></tr></thead><tbody>';

    html += rows.length ? rows.map(function (x) {
      var on = x.enabled !== false;
      return '<tr' + (on ? '' : ' style="opacity:.6"') + '>' +
        '<td><input class="input" style="width:56px;height:26px" type="number" value="' + (x.sort || 1) + '" data-sortof="' + x.id + '"' +
        (ITAM.can('config.manage') ? '' : ' disabled') + '></td>' +
        '<td><b>' + U.esc(x.name) + '</b>' +
        (cfgKind === 'domains' ? '<div style="font-size:11px;color:var(--text-3)">上级分类（父）</div>' : '') +
        (cfgKind === 'productLines' ? '<div style="font-size:11px;color:var(--text-3)">隶属于应用域（子）</div>' : '') + '</td>' +
        '<td class="mono">' + U.esc(x.code || '—') + '</td>' +
        (cfgKind === 'productLines'
          ? '<td><span class="badge b-blue">' + U.esc(ITAM.nameOf('domains', x.domainId)) + '</span></td><td>' + U.esc(x.owner || '—') + '</td>' : '') +
        (cfgKind === 'levels'
          ? '<td><span class="badge b-' + x.color + '">' + U.esc(x.name) + '</span></td><td class="num">' + (x.weight || 0) + '</td>' : '') +
        (cfgKind === 'statuses'
          ? '<td>' + (x.allowFlow ? '<span class="badge b-green">允许</span>' : '<span class="badge b-gray">终态</span>') + '</td>' : '') +
        (cfgKind === 'domains'
          ? '<td><span class="badge ' + (childCount(x.id) ? 'b-purple' : 'b-gray') + '">' + childCount(x.id) + ' 条</span></td>' : '') +
        '<td style="font-size:11.5px;color:var(--text-3)">' + U.esc(x.desc || '—') + '</td>' +
        '<td class="num">' + usageCount(cfgKind, x.id) + '</td>' +
        '<td>' + (on ? '<span class="badge b-green">启用</span>' : '<span class="badge b-gray">停用</span>') + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn btn-mini" data-cedit="' + x.id + '"' + (ITAM.can('config.manage') ? '' : ' disabled') + '>编辑</button>' +
        '<button class="btn btn-mini" data-ctoggle="' + x.id + '"' + (ITAM.can('config.manage') ? '' : ' disabled') + '>' + (on ? '停用' : '启用') + '</button>' +
        '<button class="btn btn-mini btn-danger" data-cdel="' + x.id + '"' + (ITAM.can('config.manage') ? '' : ' disabled') + '>删除</button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="10">' + ITAM.emptyBox('暂无分类项') + '</td></tr>';
    html += '</tbody></table></div></div></div>';

    html += '<div class="grid g-2 mt14">' +
      '<div class="card"><div class="card-hd"><h3>应用域 → 产品线 从属关系</h3><span class="sub">一对多，产品线唯一归属</span></div><div class="card-bd">' +
      '<div class="bars">' + ITAM.dict('domains').map(function (dm) {
        var kids = ITAM.linesOf(dm.id);
        return '<div class="bar-item"><div class="bar-top"><span><b>' + U.esc(dm.name) + '</b> ' +
          '<span style="color:var(--text-3);font-size:11px">（' + U.esc(dm.code) + '）</span></span>' +
          '<span class="val">' + kids.length + ' 条产品线</span></div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' +
          (kids.length ? kids.map(function (p) {
            return '<span class="badge ' + (p.enabled !== false ? 'b-blue' : 'b-gray') + '">' + U.esc(p.name) + '</span>';
          }).join('') : '<span style="font-size:11.5px;color:var(--text-3)">暂无下辖产品线</span>') +
          '</div></div>';
      }).join('') + '</div></div></div>' +
      '<div class="card"><div class="card-hd"><h3>配置约束说明</h3></div>' +
      '<div class="card-bd" style="font-size:12.5px;line-height:2">' +
      '<div>① <b>应用域</b>为上级分类（父），<b>产品线</b>为下级分类（子），每条产品线必须且只能隶属于一个应用域。</div>' +
      '<div>② 配置产品线时必须选择所属应用域；应用台账中「所属产品线」与「所属应用域」联动校验。</div>' +
      '<div>③ 停用某应用域前，需先处理其下辖的全部产品线。</div>' +
      '<div>④ 已被应用引用的分类项不可删除，仅可停用；停用后不再出现在录入下拉中，历史数据仍保留。</div>' +
      '<div>⑤ 分类项支持排序值调整，排序值越小越靠前。</div>' +
      '</div></div></div>';
    return html;
  }

  function cfgMount(root) {
    root.querySelectorAll('[data-kind]').forEach(function (b) {
      b.onclick = function () { cfgKind = b.getAttribute('data-kind'); ITAM.render(); };
    });
    var sd = root.querySelector('#cfgShowDisabled');
    if (sd) sd.onchange = function () { cfgShowDisabled = sd.checked; ITAM.render(); };
    root.querySelectorAll('[data-sortof]').forEach(function (inp) {
      if (inp.disabled) return;
      inp.onchange = function () {
        var x = ITAM.find(cfgKind, inp.getAttribute('data-sortof'));
        if (!x) return;
        var old = x.sort;
        x.sort = parseInt(inp.value, 10) || 1;
        if (old === x.sort) return;
        ITAM.pushAudit('修改分类字典', KIND_META[cfgKind].label + '：' + x.name, '排序 ' + old, '成功', '排序 ' + x.sort);
        ITAM.persist(); ITAM.toast('排序已更新', 'ok');
      };
    });
    root.querySelectorAll('[data-cedit]').forEach(function (b) {
      if (!b.disabled) b.onclick = function () { cfgForm(ITAM.find(cfgKind, b.getAttribute('data-cedit'))); };
    });
    root.querySelectorAll('[data-ctoggle]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var x = ITAM.find(cfgKind, b.getAttribute('data-ctoggle'));
        var on = x.enabled !== false;
        if (on) {
          if (cfgKind === 'domains' && childCount(x.id) > 0) {
            return ITAM.toast('停用失败：应用域「' + x.name + '」下仍有 ' + childCount(x.id) + ' 条产品线，请先处理其下辖产品线', 'err');
          }
          if (usageCount(cfgKind, x.id) > 0) {
            return ITAM.confirm('确认停用分类项',
              '分类项「<b>' + U.esc(x.name) + '</b>」已被 <b>' + usageCount(cfgKind, x.id) + '</b> 个应用引用。<br>' +
              '停用后不影响历史数据，但新建 / 编辑应用时不再出现在下拉选项中。',
              function () {
                x.enabled = false;
                ITAM.pushAudit('修改分类字典', x.name, '启用', '成功', '停用分类项');
                ITAM.persist(); ITAM.renderAll(); ITAM.toast('已停用「' + x.name + '」', 'ok');
              }, '确认停用');
          }
        }
        x.enabled = !on;
        ITAM.pushAudit('修改分类字典', x.name, on ? '启用' : '停用', '成功', x.enabled ? '启用分类项' : '停用分类项');
        ITAM.persist(); ITAM.renderAll();
        ITAM.toast('已' + (x.enabled ? '启用' : '停用') + '「' + x.name + '」', 'ok');
      };
    });
    root.querySelectorAll('[data-cdel]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var x = ITAM.find(cfgKind, b.getAttribute('data-cdel'));
        if (cfgKind === 'domains' && childCount(x.id) > 0) {
          return ITAM.toast('删除失败：请先处理「' + x.name + '」下的 ' + childCount(x.id) + ' 条产品线', 'err');
        }
        if (usageCount(cfgKind, x.id) > 0) {
          return ITAM.toast('删除失败：该分类项已被 ' + usageCount(cfgKind, x.id) + ' 个应用引用，请改为停用', 'err');
        }
        ITAM.confirm('删除分类项', '确认删除「<b>' + U.esc(x.name) + '</b>」？此操作不可撤销。', function () {
          var arr = S[cfgKind];
          arr.splice(arr.indexOf(x), 1);
          ITAM.pushAudit('删除分类字典', x.name, '—', '成功', '删除分类项');
          ITAM.persist(); ITAM.renderAll(); ITAM.toast('已删除「' + x.name + '」', 'ok');
        }, '确认删除');
      };
    });
    var eb = root.querySelector('#cfgExport');
    if (eb) eb.onclick = function () {
      var rows = [['分类维度', '名称', '编码', '所属应用域', '排序', '状态', '说明']];
      Object.keys(KIND_META).forEach(function (k) {
        ITAM.dict(k).forEach(function (x) {
          rows.push([KIND_META[k].title, x.name, x.code || '',
            k === 'productLines' ? ITAM.nameOf('domains', x.domainId) : '',
            x.sort || '', x.enabled !== false ? '启用' : '停用', x.desc || '']);
        });
      });
      U.download('分类字典_' + U.today() + '.csv', U.csv(rows));
      ITAM.pushAudit('导出分类字典', '全部字典', '—', '成功', '共 ' + (rows.length - 1) + ' 条');
      ITAM.persist(); ITAM.toast('分类字典已导出', 'ok');
    };
    var cb = root.querySelector('#cfgCreate');
    if (cb && !cb.disabled) cb.onclick = function () { cfgForm(null); };
  }

  function cfgForm(x) {
    var isEdit = !!x;
    var meta = KIND_META[cfgKind];
    var v = x || { name: '', code: '', sort: ITAM.dict(cfgKind).length + 1, enabled: true, desc: '' };
    if (cfgKind === 'levels') { v.color = v.color || 'blue'; v.weight = v.weight || 1; }
    if (cfgKind === 'statuses') { v.allowFlow = v.allowFlow !== false; }
    if (cfgKind === 'productLines') { v.domainId = v.domainId || ''; v.owner = v.owner || ''; }

    var body = '<div class="form-grid">' +
      '<div class="field"><label>' + meta.label + '名称<i>*</i></label><input class="input" id="cfName" value="' + U.esc(v.name) + '"></div>' +
      '<div class="field"><label>编码</label><input class="input" id="cfCode" value="' + U.esc(v.code || '') + '" placeholder="如 PL-VIP"></div>' +
      (cfgKind === 'productLines'
        ? '<div class="field span2"><label>所属应用域（从属关系）<i>*</i></label><select class="select" id="cfDomain">' +
          '<option value="">请选择所属应用域</option>' +
          ITAM.dict('domains').filter(function (d) { return d.enabled !== false; }).map(function (d) {
            return '<option value="' + d.id + '"' + (v.domainId === d.id ? ' selected' : '') + '>' + U.esc(d.name) + '（' + U.esc(d.code) + '）</option>';
          }).join('') + '</select><div class="hint">每条产品线必须隶属于唯一一个应用域</div></div>' +
          '<div class="field"><label>产品负责人</label><input class="input" id="cfOwner" value="' + U.esc(v.owner || '') + '"></div>'
        : '') +
      (cfgKind === 'levels'
        ? '<div class="field"><label>颜色标识</label><select class="select" id="cfColor">' +
          ['red', 'orange', 'blue', 'green', 'purple', 'cyan', 'gray'].map(function (c) {
            return '<option value="' + c + '"' + (v.color === c ? ' selected' : '') + '>' + c + '</option>';
          }).join('') + '</select></div>' +
          '<div class="field"><label>权重（用于排序 / 统计优先）</label><input class="input" id="cfWeight" type="number" value="' + (v.weight || 1) + '"></div>'
        : '') +
      (cfgKind === 'statuses'
        ? '<div class="field span2"><label class="chk"><input type="checkbox" id="cfFlow"' + (v.allowFlow !== false ? ' checked' : '') + '> 允许从该状态继续流转（终态请取消勾选）</label></div>'
        : '') +
      '<div class="field"><label>排序值</label><input class="input" id="cfSort" type="number" value="' + (v.sort || 1) + '"></div>' +
      '<div class="field"><label>是否启用</label><select class="select" id="cfEnabled">' +
      '<option value="1"' + (v.enabled !== false ? ' selected' : '') + '>启用</option>' +
      '<option value="0"' + (v.enabled === false ? ' selected' : '') + '>停用</option></select></div>' +
      '<div class="field span2"><label>说明</label><textarea class="textarea" id="cfDesc">' + U.esc(v.desc || '') + '</textarea></div>' +
      '</div>';

    ITAM.openModal({
      title: (isEdit ? '编辑' : '新增') + meta.label + '分类项',
      body: body,
      footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="cfSave">保存</button>',
      onMount: function (m) {
        m.querySelector('#cfSave').onclick = function () {
          var name = m.querySelector('#cfName').value.trim();
          if (!name) return ITAM.toast('请填写分类名称', 'err');
          if (ITAM.dict(cfgKind).some(function (y) { return y.name === name && y.id !== v.id; })) {
            return ITAM.toast('分类名称「' + name + '」已存在', 'err');
          }
          var payload = {
            name: name,
            code: m.querySelector('#cfCode').value.trim(),
            sort: parseInt(m.querySelector('#cfSort').value, 10) || 1,
            enabled: m.querySelector('#cfEnabled').value === '1',
            desc: m.querySelector('#cfDesc').value.trim()
          };
          if (cfgKind === 'productLines') {
            var domainId = m.querySelector('#cfDomain').value;
            if (!domainId) return ITAM.toast('产品线必须指定所属应用域', 'err');
            payload.domainId = domainId;
            payload.owner = m.querySelector('#cfOwner').value.trim();
          }
          if (cfgKind === 'levels') {
            payload.color = m.querySelector('#cfColor').value;
            payload.weight = parseInt(m.querySelector('#cfWeight').value, 10) || 1;
          }
          if (cfgKind === 'statuses') payload.allowFlow = m.querySelector('#cfFlow').checked;

          if (isEdit) {
            var before = v.name + ' ｜ 排序 ' + v.sort + ' ｜ ' + (v.enabled !== false ? '启用' : '停用');
            Object.keys(payload).forEach(function (k) { v[k] = payload[k]; });
            ITAM.pushAudit('修改分类字典', v.name, before, '成功', v.name + ' ｜ 排序 ' + v.sort + ' ｜ ' + (v.enabled ? '启用' : '停用'));
          } else {
            payload.id = U.uid(cfgKind.slice(0, 2));
            S[cfgKind].push(payload);
            ITAM.pushAudit('新增分类字典', payload.name, '—', '成功', '在「' + meta.title + '」中新增分类项');
          }
          ITAM.persist(); ITAM.closeModal(); ITAM.renderAll();
          ITAM.toast((isEdit ? '已保存' : '已新增') + '分类项「' + name + '」', 'ok');
        };
      }
    });
  }

  ITAM.register('config', { title: '分类配置管理', render: cfgRender, mount: cfgMount });

  /* ==== PART2 ==== */

  /* ================= License 管理 ================= */
  var licFilter = { kw: '', status: '', category: '' };
  var licSort = { key: 'expireDate', dir: 'asc' };

  function licList() {
    var q = licFilter.kw.trim().toLowerCase();
    return S.licenses.filter(function (l) {
      if (licFilter.category && l.category !== licFilter.category) return false;
      if (licFilter.status) {
        var k = ITAM.licenseStatus(l).key;
        if (licFilter.status === 'alert' && !(k === 'warn' || k === 'urgent')) return false;
        if (licFilter.status !== 'alert' && k !== licFilter.status) return false;
      }
      if (q) {
        var hay = [l.product, l.vendor, l.category, l.responsible, l.type, ITAM.appLabel(l.appId), l.licenseNo].join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      var va, vb;
      if (licSort.key === 'amount') { va = a.amount; vb = b.amount; }
      else if (licSort.key === 'product') { va = a.product; vb = b.product; }
      else { va = a.expireDate; vb = b.expireDate; }
      if (va < vb) return licSort.dir === 'asc' ? -1 : 1;
      if (va > vb) return licSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function licRender() {
    var list = licList();
    var all = S.licenses;
    var expired = all.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d < 0; });
    var urgent = all.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d >= 0 && d <= 15; });
    var warn = all.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d > 15 && d <= l.alertDays; });
    var cats = [];
    all.forEach(function (l) { if (cats.indexOf(l.category) < 0) cats.push(l.category); });
    var totalAmount = all.reduce(function (s, l) { return s + l.amount; }, 0);

    var html = ITAM.pageHead('License 管理',
      '登记软件授权证书、授权数量、授权类型、购买时间与服务商信息，支持 License 到期前自定义预警（邮件 / 站内消息 / 企业微信），避免合规风险。',
      '<button class="btn" id="licExport"' + (ITAM.can('license.view') ? '' : ' disabled') + '>⬇ 导出台账</button>' +
      '<button class="btn" id="licAlertCfg"' + (ITAM.can('license.alert') ? '' : ' disabled') + '>🔔 预警策略</button>' +
      '<button class="btn btn-primary" id="licCreate"' + (ITAM.can('license.manage') ? '' : ' disabled') + '>＋ 登记 License</button>');

    html += '<div class="grid g-4">' +
      ITAM.kpi('License 总数', '🔑', 'primary', all.length, '项', '<span style="color:var(--text-3)">年费用 ' + U.money(totalAmount) + '</span>') +
      ITAM.kpi('已过期', '⛔', 'gray', expired.length, '项', '<span style="color:var(--text-3)">需立即处理</span>') +
      ITAM.kpi('15 天内到期', '🚨', 'danger', urgent.length, '项', '<span class="trend-down">紧急预警</span>') +
      ITAM.kpi('预警期内', '⚠️', 'warn', warn.length, '项', '<span style="color:var(--text-3)">按各自阈值提醒</span>') +
      '</div>';

    html += '<div class="card mt14"><div class="card-bd tight">';
    html += '<div class="filter-bar">' +
      '<input class="input grow" id="licKw" placeholder="🔍 软件名称 / 服务商 / 责任人 / 关联应用 / 授权编号" value="' + U.esc(licFilter.kw) + '">' +
      '<select class="select" id="licStatus"><option value="">全部状态</option>' +
      '<option value="alert"' + (licFilter.status === 'alert' ? ' selected' : '') + '>预警中（含紧急）</option>' +
      '<option value="urgent"' + (licFilter.status === 'urgent' ? ' selected' : '') + '>紧急（≤15 天）</option>' +
      '<option value="warn"' + (licFilter.status === 'warn' ? ' selected' : '') + '>预警期内</option>' +
      '<option value="ok"' + (licFilter.status === 'ok' ? ' selected' : '') + '>正常</option>' +
      '<option value="expired"' + (licFilter.status === 'expired' ? ' selected' : '') + '>已过期</option></select>' +
      '<select class="select" id="licCat"><option value="">全部分类</option>' +
      cats.map(function (c) { return '<option value="' + U.esc(c) + '"' + (licFilter.category === c ? ' selected' : '') + '>' + U.esc(c) + '</option>'; }).join('') +
      '</select><button class="btn" id="licReset">重置</button></div>';

    html += '<div class="table-wrap"><table class="tb"><thead><tr>' +
      '<th data-lsort="product" style="cursor:pointer">软件 / 授权名称' + (licSort.key === 'product' ? (licSort.dir === 'asc' ? ' ▲' : ' ▼') : '') + '</th>' +
      '<th>服务商</th><th>授权类型</th><th>授权数量</th><th>授权编号</th><th>购买时间</th>' +
      '<th data-lsort="expireDate" style="cursor:pointer">到期日' + (licSort.key === 'expireDate' ? (licSort.dir === 'asc' ? ' ▲' : ' ▼') : '') + '</th>' +
      '<th>到期状态</th><th>预警设置</th><th>关联应用</th><th>责任人</th>' +
      '<th data-lsort="amount" style="cursor:pointer">金额(万元)' + (licSort.key === 'amount' ? (licSort.dir === 'asc' ? ' ▲' : ' ▼') : '') + '</th>' +
      '<th style="width:150px">操作</th></tr></thead><tbody>';

    html += list.length ? list.map(function (l) {
      var ls = ITAM.licenseStatus(l);
      return '<tr><td><b>' + U.esc(l.product) + '</b><div style="font-size:11px;color:var(--text-3)">' + U.esc(l.category) + '</div></td>' +
        '<td>' + U.esc(l.vendor) + '</td><td>' + U.esc(l.type) + '</td><td class="num">' + U.num(l.qty) + '</td>' +
        '<td class="mono">' + U.esc(l.licenseNo) + '</td><td class="mono">' + U.esc(l.buyDate) + '</td>' +
        '<td class="mono">' + U.esc(l.expireDate) + '</td>' +
        '<td><span class="badge ' + ls.cls + '">' + ls.text + '</span></td>' +
        '<td style="font-size:11.5px">提前 ' + l.alertDays + ' 天<div style="color:var(--text-3)">' + U.esc(l.channels.join(' / ')) + '</div></td>' +
        '<td style="font-size:12px">' + U.esc(l.appId ? ITAM.appLabel(l.appId) : '未关联') + '</td>' +
        '<td>' + U.esc(l.responsible) + '</td><td class="num">' + l.amount + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn btn-mini" data-licedit="' + l.id + '"' + (ITAM.can('license.manage') ? '' : ' disabled') + '>编辑</button>' +
        '<button class="btn btn-mini" data-licrenew="' + l.id + '"' + (ITAM.can('license.manage') ? '' : ' disabled') + '>续期</button>' +
        '<button class="btn btn-mini btn-danger" data-licdel="' + l.id + '"' + (ITAM.can('license.manage') ? '' : ' disabled') + '>删除</button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="13">' + ITAM.emptyBox('没有符合条件的 License 记录') + '</td></tr>';
    html += '</tbody></table></div></div></div>';

    var buckets = [
      { label: '已过期', v: expired.length, c: '#8a97aa' },
      { label: '≤15天', v: urgent.length, c: '#e03131' },
      { label: '16-30天', v: all.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d > 15 && d <= 30; }).length, c: '#d98600' },
      { label: '31-60天', v: all.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d > 30 && d <= 60; }).length, c: '#0b8fd6' },
      { label: '60天以上', v: all.filter(function (l) { var d = U.daysTo(l.expireDate); return d !== null && d > 60; }).length, c: '#12a150' }
    ];
    html += '<div class="grid g-2-1 mt14">' +
      '<div class="card"><div class="card-hd"><h3>License 到期时间分布</h3></div><div class="card-bd">' +
      ITAM.colChart(buckets.map(function (b) { return { label: b.label, value: b.v, color: b.c }; }), ' 项') + '</div></div>' +
      '<div class="card"><div class="card-hd"><h3>按分类汇总</h3></div><div class="card-bd">' +
      ITAM.barList(cats.map(function (c) {
        return { label: c, value: all.filter(function (l) { return l.category === c; }).length, color: '#2f6bff' };
      }), ' 项') + '</div></div></div>';
    return html;
  }

  function licMount(root) {
    var kw = root.querySelector('#licKw');
    if (kw) {
      var tm = null;
      kw.oninput = function () {
        clearTimeout(tm);
        tm = setTimeout(function () {
          licFilter.kw = kw.value; ITAM.render();
          var x = document.querySelector('#licKw');
          if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); }
        }, 280);
      };
    }
    var st = root.querySelector('#licStatus');
    if (st) st.onchange = function () { licFilter.status = st.value; ITAM.render(); };
    var ct = root.querySelector('#licCat');
    if (ct) ct.onchange = function () { licFilter.category = ct.value; ITAM.render(); };
    var rs = root.querySelector('#licReset');
    if (rs) rs.onclick = function () { licFilter = { kw: '', status: '', category: '' }; ITAM.render(); };
    root.querySelectorAll('[data-lsort]').forEach(function (th) {
      th.onclick = function () {
        var k = th.getAttribute('data-lsort');
        if (licSort.key === k) licSort.dir = licSort.dir === 'asc' ? 'desc' : 'asc';
        else { licSort.key = k; licSort.dir = 'asc'; }
        ITAM.render();
      };
    });
    root.querySelectorAll('[data-licedit]').forEach(function (b) {
      if (!b.disabled) b.onclick = function () { licForm(S.licenses.filter(function (x) { return x.id === b.getAttribute('data-licedit'); })[0]); };
    });
    root.querySelectorAll('[data-licrenew]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var l = S.licenses.filter(function (x) { return x.id === b.getAttribute('data-licrenew'); })[0];
        ITAM.openModal({
          title: 'License 续期 · ' + U.esc(l.product),
          body: '<div class="field"><label>当前到期日</label><input class="input" value="' + U.esc(l.expireDate) + '" disabled></div>' +
            '<div class="field"><label>续期至</label><input class="input" id="rnDate" value="' + D.dOff(365) + '"></div>' +
            '<div class="field"><label>续期金额（万元 / 年）</label><input class="input" id="rnAmt" value="' + l.amount + '"></div>',
          footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="rnOk">确认续期</button>',
          onMount: function (m) {
            m.querySelector('#rnOk').onclick = function () {
              var before = '到期日 ' + l.expireDate + ' ｜ 金额 ' + l.amount;
              l.expireDate = m.querySelector('#rnDate').value.trim() || l.expireDate;
              l.amount = parseFloat(m.querySelector('#rnAmt').value) || l.amount;
              ITAM.pushAudit('License 续期', l.product, before, '成功', '到期日 ' + l.expireDate + ' ｜ 金额 ' + l.amount);
              ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('已完成续期登记', 'ok');
            };
          }
        });
      };
    });
    root.querySelectorAll('[data-licdel]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var l = S.licenses.filter(function (x) { return x.id === b.getAttribute('data-licdel'); })[0];
        ITAM.confirm('删除 License 记录', '确认删除「<b>' + U.esc(l.product) + '</b>」的授权登记？', function () {
          S.licenses.splice(S.licenses.indexOf(l), 1);
          ITAM.pushAudit('删除 License', l.product, '—', '成功', '删除授权登记');
          ITAM.persist(); ITAM.renderAll(); ITAM.toast('已删除 License 记录', 'ok');
        }, '确认删除');
      };
    });
    var eb = root.querySelector('#licExport');
    if (eb && !eb.disabled) eb.onclick = function () {
      var rows = [['软件/授权名称', '服务商', '授权类型', '授权数量', '授权编号', '购买时间', '到期日', '剩余天数',
        '到期状态', '预警提前天数', '提醒方式', '关联应用', '责任人', '分类', '金额(万元)', '备注']];
      licList().forEach(function (l) {
        var ls = ITAM.licenseStatus(l);
        rows.push([l.product, l.vendor, l.type, l.qty, l.licenseNo, l.buyDate, l.expireDate, ls.days, ls.text,
          l.alertDays, l.channels.join('/'), l.appId ? ITAM.appLabel(l.appId) : '未关联', l.responsible,
          l.category, l.amount, l.remark]);
      });
      U.download('License台账_' + U.today() + '.csv', U.csv(rows));
      ITAM.pushAudit('导出 License 台账', 'License 管理', '—', '成功', '导出 ' + (rows.length - 1) + ' 条');
      ITAM.persist(); ITAM.toast('License 台账已导出', 'ok');
    };
    var ac = root.querySelector('#licAlertCfg');
    if (ac && !ac.disabled) ac.onclick = function () {
      var policies = [
        { d: 90, ch: ['邮件', '站内消息'] }, { d: 60, ch: ['邮件', '站内消息'] },
        { d: 30, ch: ['邮件', '站内消息', '企业微信'] }, { d: 15, ch: ['邮件', '站内消息', '企业微信'] },
        { d: 7, ch: ['邮件', '站内消息', '企业微信'] }, { d: 3, ch: ['邮件', '站内消息', '企业微信'] }
      ];
      ITAM.openModal({
        title: 'License 到期预警策略',
        body: '<div class="hint" style="margin-bottom:10px">系统将在授权到期前的以下节点自动推送预警，各条 License 还可单独设置提前预警天数。</div>' +
          '<table class="tb" style="min-width:auto"><thead><tr><th>预警节点</th><th>推送渠道</th><th>接收人</th></tr></thead><tbody>' +
          policies.map(function (p) {
            return '<tr><td>到期前 <b>' + p.d + '</b> 天</td><td>' +
              p.ch.map(function (c) { return '<span class="tag">' + c + '</span>'; }).join('') + '</td>' +
              '<td>License 责任人 + 应用负责人</td></tr>';
          }).join('') + '</tbody></table>' +
          '<div class="hint mt14" style="line-height:1.9">• 紧急预警（≤15 天）同时推送至 IT 治理群<br>' +
          '• 已过期授权将升级为每日提醒，直至续期或下线完成<br>' +
          '• Webhook 推送配置见「开放集成」页</div>'
      });
    };
    var cb = root.querySelector('#licCreate');
    if (cb && !cb.disabled) cb.onclick = function () { licForm(null); };
  }

  function licForm(l) {
    var isEdit = !!l;
    var v = l || {
      product: '', vendor: '', type: '订阅', qty: 1, buyDate: U.today(), expireDate: D.dOff(365),
      alertDays: 30, category: '业务系统', amount: 0, appId: '', responsible: ITAM.persona().name,
      channels: ['邮件', '站内消息'], licenseNo: '', remark: ''
    };
    var body = '<div class="form-grid">' +
      '<div class="field span2"><label>软件 / 授权名称<i>*</i></label><input class="input" id="lfProduct" value="' + U.esc(v.product) + '" placeholder="如 Oracle Database 19c 企业版"></div>' +
      '<div class="field"><label>服务商</label><input class="input" id="lfVendor" value="' + U.esc(v.vendor) + '"></div>' +
      '<div class="field"><label>授权类型</label><select class="select" id="lfType">' +
      ['永久授权', '订阅', '按量付费', 'OEM'].map(function (t) { return '<option' + (v.type === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="field"><label>授权数量</label><input class="input" id="lfQty" type="number" value="' + v.qty + '"></div>' +
      '<div class="field"><label>授权编号</label><input class="input" id="lfNo" value="' + U.esc(v.licenseNo) + '"></div>' +
      '<div class="field"><label>购买时间</label><input class="input" id="lfBuy" value="' + U.esc(v.buyDate) + '"></div>' +
      '<div class="field"><label>到期日<i>*</i></label><input class="input" id="lfExpire" value="' + U.esc(v.expireDate) + '"></div>' +
      '<div class="field"><label>提前预警天数</label><input class="input" id="lfAlert" type="number" value="' + v.alertDays + '"></div>' +
      '<div class="field"><label>费用分类</label><select class="select" id="lfCat">' +
      ['业务系统', '服务器', '基础设施', '数据库', '安全', '研发工具', '协作平台'].map(function (c) {
        return '<option' + (v.category === c ? ' selected' : '') + '>' + c + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field"><label>金额（万元 / 年）</label><input class="input" id="lfAmt" type="number" value="' + v.amount + '"></div>' +
      '<div class="field"><label>关联应用</label><select class="select" id="lfApp"><option value="">不关联</option>' +
      S.apps.map(function (a) { return '<option value="' + a.id + '"' + (v.appId === a.id ? ' selected' : '') + '>' + U.esc(a.name) + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="field"><label>责任人</label><input class="input" id="lfOwner" value="' + U.esc(v.responsible) + '"></div>' +
      '<div class="field span2"><label>提醒方式</label><div style="display:flex;gap:14px">' +
      ['邮件', '站内消息', '企业微信'].map(function (c) {
        return '<label class="chk"><input type="checkbox" data-ch="' + c + '"' + (v.channels.indexOf(c) >= 0 ? ' checked' : '') + '>' + c + '</label>';
      }).join('') + '</div></div>' +
      '<div class="field span2"><label>备注</label><textarea class="textarea" id="lfRemark">' + U.esc(v.remark) + '</textarea></div>' +
      '</div>';
    ITAM.openModal({
      title: isEdit ? '编辑 License 登记' : '登记 License',
      body: body,
      footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="lfSave">保存</button>',
      onMount: function (m) {
        m.querySelector('#lfSave').onclick = function () {
          var product = m.querySelector('#lfProduct').value.trim();
          if (!product) return ITAM.toast('请填写软件 / 授权名称', 'err');
          var expire = m.querySelector('#lfExpire').value.trim();
          if (!expire) return ITAM.toast('请填写到期日', 'err');
          var chs = [];
          m.querySelectorAll('[data-ch]').forEach(function (cb) { if (cb.checked) chs.push(cb.getAttribute('data-ch')); });
          var payload = {
            product: product, vendor: m.querySelector('#lfVendor').value.trim(),
            type: m.querySelector('#lfType').value, qty: parseInt(m.querySelector('#lfQty').value, 10) || 1,
            licenseNo: m.querySelector('#lfNo').value.trim() || ('LIC-' + Date.now().toString().slice(-7)),
            buyDate: m.querySelector('#lfBuy').value.trim(), expireDate: expire,
            alertDays: parseInt(m.querySelector('#lfAlert').value, 10) || 30,
            category: m.querySelector('#lfCat').value, amount: parseFloat(m.querySelector('#lfAmt').value) || 0,
            appId: m.querySelector('#lfApp').value, responsible: m.querySelector('#lfOwner').value.trim(),
            channels: chs.length ? chs : ['站内消息'], remark: m.querySelector('#lfRemark').value.trim()
          };
          if (isEdit) {
            var before = '到期日 ' + v.expireDate + ' ｜ 数量 ' + v.qty;
            Object.keys(payload).forEach(function (k) { v[k] = payload[k]; });
            ITAM.pushAudit('编辑 License', v.product, before, '成功', '到期日 ' + v.expireDate + ' ｜ 数量 ' + v.qty);
          } else {
            payload.id = U.uid('lic');
            S.licenses.push(payload);
            ITAM.pushAudit('License 登记', payload.product, '—', '成功', '新增授权登记，到期日 ' + payload.expireDate);
          }
          ITAM.persist(); ITAM.closeModal(); ITAM.renderAll();
          ITAM.toast(isEdit ? '已保存 License 记录' : '已登记 License', 'ok');
        };
      }
    });
  }

  ITAM.register('license', { title: 'License 管理', render: licRender, mount: licMount });

  /* ==== PART3 ==== */

  /* ================= 生命周期与变更管理 ================= */
  var lcTab = 'kanban';

  function lcRender() {
    var pending = S.changes.filter(function (c) { return c.status === '待审批' || c.status === '审批中'; });
    var done = S.changes.filter(function (c) { return c.status === '已通过'; });
    var rejected = S.changes.filter(function (c) { return c.status === '已驳回'; });

    var html = ITAM.pageHead('生命周期与变更管理',
      '覆盖应用从规划、建设、上线、变更、暂停到退役的全生命周期：支持状态流转与留痕、变更工单审批（审批通过自动回填台账）、退役评估流程。',
      '<button class="btn" id="lcExport">⬇ 导出工单</button>' +
      '<button class="btn btn-primary" id="lcNew"' + (ITAM.can('change.submit') ? '' : ' disabled') + '>＋ 发起变更工单</button>');

    html += '<div class="grid g-4">' +
      ITAM.kpi('在途工单', '🔄', 'warn', pending.length, '单', '<span style="color:var(--text-3)">待审批 / 审批中</span>') +
      ITAM.kpi('已通过', '✅', 'success', done.length, '单', '<span style="color:var(--text-3)">已回填台账</span>') +
      ITAM.kpi('已驳回', '⛔', 'danger', rejected.length, '单', '<span style="color:var(--text-3)">需补充材料</span>') +
      ITAM.kpi('状态节点', '🧭', 'primary', ITAM.dict('statuses').length, '个', '<span style="color:var(--text-3)">草稿 → 退役</span>') +
      '</div>';

    html += '<div class="tabs mt14">' +
      [['kanban', '状态流转看板'], ['flow', '状态流转全景'], ['list', '变更工单列表'], ['retire', '退役评估流程']].map(function (t) {
        return '<button class="tab' + (lcTab === t[0] ? ' active' : '') + '" data-lctab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (lcTab === 'kanban') {
      html += '<div class="hint mb10" style="color:var(--text-3)">提示：可直接拖拽应用卡片在状态列之间流转（需「执行状态流转」权限），每次流转自动写入审计日志。</div>';
      html += '<div class="kanban">' + ITAM.dict('statuses').slice().sort(function (a, b) { return a.sort - b.sort; }).map(function (st) {
        var apps = S.apps.filter(function (a) { return a.statusId === st.id; });
        return '<div class="kan-col" data-col="' + st.id + '">' +
          '<div class="kan-hd"><span class="badge b-' + st.color + ' dot">' + U.esc(st.name) + '</span>' +
          (st.allowFlow ? '' : '<span style="font-size:10.5px;color:var(--text-3)">终态</span>') +
          '<span class="cnt">' + apps.length + '</span></div>' +
          '<div class="kan-bd kan-drop" data-drop="' + st.id + '">' +
          (apps.length ? apps.map(function (a) {
            return '<div class="kan-card" draggable="' + (ITAM.can('lifecycle.flow') ? 'true' : 'false') + '" data-app="' + a.id + '">' +
              '<div class="nm">' + U.esc(a.name) + '</div>' +
              '<div class="mt"><span>' + U.esc(ITAM.nameOf('domains', a.domainId)) + '</span><span>👤 ' + U.esc(a.owner) + '</span></div>' +
              '<div style="margin-top:6px;display:flex;gap:6px;align-items:center">' + ITAM.levelBadge(a) +
              '<span style="font-size:10.5px;color:var(--text-3);margin-left:auto">' + U.esc(a.code) + '</span></div></div>';
          }).join('') : '<div style="font-size:11.5px;color:var(--text-3);padding:10px;text-align:center">（空）</div>') +
          '</div></div>';
      }).join('') + '</div>';

      html += '<div class="grid g-2 mt14">' +
        '<div class="card"><div class="card-hd"><h3>状态流转规则</h3></div><div class="card-bd tight">' +
        '<table class="tb" style="min-width:auto"><thead><tr><th>标准流转路径</th><th>触发方式</th><th>留痕</th></tr></thead><tbody>' +
        [['草稿 → 运行中', '上线确认，需填写上线时间', '写审计日志'],
        ['运行中 → 变更中', '提交变更工单后自动置为变更中', '写审计日志 + 工单关联'],
        ['变更中 → 运行中', '变更工单审批通过并执行完成', '写审计日志 + 台账回填'],
        ['运行中 → 暂停', '业务暂停申请（需说明原因）', '写审计日志'],
        ['暂停 → 已退役', '退役评估流程通过后置为已退役', '写审计日志 + 资源回收核查'],
        ['任意 → 草稿', '信息完善阶段回退', '写审计日志']].map(function (r) {
          return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td><span class="badge b-blue">' + r[2] + '</span></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="card"><div class="card-hd"><h3>最近状态流转</h3></div><div class="card-bd">' +
        ITAM.timeline(S.audits.filter(function (l) {
          return l.action === '编辑应用' || l.action.indexOf('流转') >= 0 || l.actionType === 'approve';
        }).slice(0, 6).map(function (l) {
          return { time: l.time, title: l.action + ' · ' + l.object, desc: '操作人 ' + l.user + '（' + l.role + '）｜ ' + (l.after || ''), state: l.result === '成功' ? 'ok' : 'warn' };
        })) + '</div></div></div>';
    } else if (lcTab === 'flow') {
      var nodes = ITAM.dict('statuses').slice().sort(function (a, b) { return a.sort - b.sort; });
      html += '<div class="card"><div class="card-hd"><h3>资产生命周期状态流转全景</h3><span class="sub">点击节点可查看该状态下的应用清单</span></div><div class="card-bd">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;padding:14px 0">' +
        nodes.map(function (n, i) {
          var cnt = S.apps.filter(function (a) { return a.statusId === n.id; }).length;
          return (i ? '<div style="font-size:20px;color:var(--border-strong)">➜</div>' : '') +
            '<div class="card" style="min-width:168px;cursor:pointer;box-shadow:none" data-flownode="' + n.id + '">' +
            '<div class="card-bd" style="text-align:center">' +
            '<div class="badge b-' + n.color + ' dot" style="font-size:12.5px;padding:3px 12px">' + U.esc(n.name) + '</div>' +
            '<div style="font-size:24px;font-weight:700;margin:8px 0 4px">' + cnt + '</div>' +
            '<div style="font-size:11.5px;color:var(--text-3)">' + U.esc(n.desc) + '</div></div></div>';
        }).join('') + '</div></div></div>';

      html += '<div class="grid g-2 mt14">' +
        '<div class="card"><div class="card-hd"><h3>各状态下应用清单</h3></div><div class="card-bd tight">' +
        '<table class="tb" style="min-width:auto"><thead><tr><th>应用</th><th>状态</th><th>负责人</th><th>最近更新</th></tr></thead><tbody>' +
        S.apps.slice().sort(function (a, b) {
          return (ITAM.objOf('statuses', a.statusId).sort || 0) - (ITAM.objOf('statuses', b.statusId).sort || 0);
        }).map(function (a) {
          return '<tr><td><span class="link" data-openapp="' + a.id + '">' + U.esc(a.name) + '</span></td>' +
            '<td>' + ITAM.statusBadge(a) + '</td><td>' + U.esc(a.owner) + '</td>' +
            '<td class="mono">' + U.esc(U.rel(a.updateTime)) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="card"><div class="card-hd"><h3>生命周期健康提示</h3></div><div class="card-bd">' +
        ITAM.barList([
          { label: '暂停超 6 个月未退役', value: S.apps.filter(function (a) { return a.statusId === 'st-pause'; }).length, color: '#d98600' },
          { label: '草稿超期未上线', value: S.apps.filter(function (a) { return a.statusId === 'st-draft'; }).length, color: '#0b8fd6' },
          { label: '变更中长期未闭环', value: S.apps.filter(function (a) { return a.statusId === 'st-change'; }).length, color: '#e03131' },
          { label: '已退役已归档', value: S.apps.filter(function (a) { return a.statusId === 'st-retired' && a.compliance === 'archived'; }).length, color: '#12a150' }
        ], ' 个') + '</div></div></div>';
    } else if (lcTab === 'list') {
      html += '<div class="card"><div class="card-bd tight"><div class="table-wrap"><table class="tb"><thead><tr>' +
        '<th>工单号</th><th>类型</th><th>标题</th><th>应用</th><th>申请人</th><th>影响评估</th><th>审批状态</th><th>当前节点</th><th>审批人</th><th>提交时间</th><th style="width:160px">操作</th>' +
        '</tr></thead><tbody>' +
        (S.changes.length ? S.changes.map(function (c) {
          var canApprove = ITAM.can('change.approve') && (c.status === '待审批' || c.status === '审批中');
          return '<tr><td class="mono">' + U.esc(c.id) + '</td>' +
            '<td><span class="badge ' + ({ '升级': 'b-blue', '架构调整': 'b-purple', '负责人变更': 'b-cyan', '退役': 'b-orange' })[c.type] + '">' + U.esc(c.type) + '</span></td>' +
            '<td><b>' + U.esc(c.title) + '</b></td><td>' + U.esc(c.appName) + '</td><td>' + U.esc(c.applicant) + '</td>' +
            '<td><span class="badge ' + ({ '高': 'b-red', '中': 'b-orange', '低': 'b-green' })[c.impact] + '">' + c.impact + '</span></td>' +
            '<td><span class="badge ' + ({ '待审批': 'b-orange', '审批中': 'b-blue', '已通过': 'b-green', '已驳回': 'b-red' })[c.status] + '">' + U.esc(c.status) + '</span></td>' +
            '<td style="font-size:11.5px">' + U.esc(c.node) + '</td><td>' + U.esc(c.approver) + '</td>' +
            '<td class="mono">' + U.esc(c.createdAt) + '</td>' +
            '<td><div class="row-actions">' +
            '<button class="btn btn-mini" data-cview="' + c.id + '">详情</button>' +
            '<button class="btn btn-mini btn-primary" data-cappr="' + c.id + '"' + (canApprove ? '' : ' disabled') + '>审批</button>' +
            '</div></td></tr>';
        }).join('') : '<tr><td colspan="11">' + ITAM.emptyBox('暂无变更工单') + '</td></tr>') +
        '</tbody></table></div></div></div>';
    } else {
      html += '<div class="card"><div class="card-hd"><h3>退役评估流程</h3><span class="sub">应用下线需经过评估、数据归档、资源回收等审批环节</span></div>' +
        '<div class="card-bd">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:6px 0 14px">' +
        ['① 退役申请', '② 业务影响评估', '③ 数据归档确认', '④ 资源回收核查', '⑤ 台账置为已退役'].map(function (s, i) {
          return (i ? '<div style="color:var(--border-strong)">➜</div>' : '') +
            '<span class="badge b-' + (i === 4 ? 'gray' : 'blue') + '" style="padding:4px 12px;font-size:12px">' + s + '</span>';
        }).join('') + '</div>' +
        '<table class="tb"><thead><tr><th>应用</th><th>当前状态</th><th>退役申请</th><th>评估进度</th><th>负责人</th><th>操作</th></tr></thead><tbody>' +
        S.apps.filter(function (a) { return a.statusId === 'st-pause' || a.statusId === 'st-retired'; }).map(function (a) {
          var ch = S.changes.filter(function (c) { return c.appId === a.id && c.type === '退役'; })[0];
          var pct = a.statusId === 'st-retired' ? 100 : (ch ? (ch.status === '审批中' ? 60 : ch.status === '已通过' ? 90 : 30) : 10);
          return '<tr><td><span class="link" data-openapp="' + a.id + '">' + U.esc(a.name) + '</span></td>' +
            '<td>' + ITAM.statusBadge(a) + '</td>' +
            '<td>' + (ch ? '<span class="mono">' + U.esc(ch.id) + '</span> <span class="badge ' +
              ({ '待审批': 'b-orange', '审批中': 'b-blue', '已通过': 'b-green', '已驳回': 'b-red' })[ch.status] + '">' + U.esc(ch.status) + '</span>'
              : '<span style="color:var(--text-3)">未发起</span>') + '</td>' +
            '<td><div style="min-width:120px">' + ITAM.progress(pct, pct >= 100 ? '' : 'warn') +
            '<span style="font-size:10.5px;color:var(--text-3)">' + pct + '%</span></div></td>' +
            '<td>' + U.esc(a.owner) + '</td>' +
            '<td>' + (ch ? '<button class="btn btn-mini" data-cview="' + ch.id + '">查看评估</button>'
              : '<button class="btn btn-mini" data-retire="' + a.id + '"' + (ITAM.can('change.submit') ? '' : ' disabled') + '>发起退役评估</button>') + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<div class="hint mt14" style="line-height:1.9;color:var(--text-3)">' +
        '• 退役评估通过后，应用状态自动置为「已退役」，退役时间写入台账<br>' +
        '• 数据归档与资源回收为强制检查项，未完成不允许通过评估<br>' +
        '• 全程留痕，可追溯每一环节的审批人与时间</div></div></div>';
    }
    return html;
  }

  function lcMount(root) {
    root.querySelectorAll('[data-lctab]').forEach(function (b) {
      b.onclick = function () { lcTab = b.getAttribute('data-lctab'); ITAM.render(); };
    });
    root.querySelectorAll('[data-openapp]').forEach(function (b) {
      b.onclick = function () { ITAM.openApp(b.getAttribute('data-openapp')); };
    });
    root.querySelectorAll('[data-flownode]').forEach(function (b) {
      b.onclick = function () {
        var st = ITAM.find('statuses', b.getAttribute('data-flownode'));
        var apps = S.apps.filter(function (a) { return a.statusId === st.id; });
        ITAM.openModal({
          title: '「' + st.name + '」状态下的应用（' + apps.length + '）',
          body: '<div class="hint" style="margin-bottom:8px">' + U.esc(st.desc) + ' ｜ 允许继续流转：' + (st.allowFlow ? '是' : '否（终态）') + '</div>' +
            (apps.length ? '<table class="tb" style="min-width:auto"><thead><tr><th>应用</th><th>负责人</th><th>重要等级</th></tr></thead><tbody>' +
              apps.map(function (a) {
                return '<tr><td><span class="link" data-openapp="' + a.id + '">' + U.esc(a.name) + '</span></td>' +
                  '<td>' + U.esc(a.owner) + '</td><td>' + ITAM.levelBadge(a) + '</td></tr>';
              }).join('') + '</tbody></table>' : ITAM.emptyBox('该状态下暂无应用'))
        });
        setTimeout(function () {
          document.querySelectorAll('#modal [data-openapp]').forEach(function (x) {
            x.onclick = function () { ITAM.closeModal(); ITAM.openApp(x.getAttribute('data-openapp')); };
          });
        }, 0);
      };
    });

    /* 拖拽状态流转 */
    var dragId = null;
    root.querySelectorAll('.kan-card[draggable="true"]').forEach(function (card) {
      card.addEventListener('dragstart', function (e) {
        dragId = card.getAttribute('data-app');
        card.classList.add('drag-ghost');
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', function () { card.classList.remove('drag-ghost'); dragId = null; });
      card.onclick = function () { ITAM.openApp(card.getAttribute('data-app')); };
    });
    root.querySelectorAll('[data-drop]').forEach(function (zone) {
      zone.addEventListener('dragover', function (e) { if (dragId) { e.preventDefault(); zone.classList.add('over'); } });
      zone.addEventListener('dragleave', function () { zone.classList.remove('over'); });
      zone.addEventListener('drop', function (e) {
        e.preventDefault(); zone.classList.remove('over');
        if (!dragId) return;
        var stId = zone.getAttribute('data-drop');
        var a = ITAM.appById(dragId);
        var target = ITAM.find('statuses', stId);
        if (!a || !target || a.statusId === stId) return;
        if (!ITAM.can('lifecycle.flow')) return ITAM.toast('当前角色无「执行状态流转」权限', 'err');
        if (target.enabled === false) return ITAM.toast('目标状态已停用，无法流转', 'err');
        var before = ITAM.nameOf('statuses', a.statusId);
        ITAM.confirm('确认状态流转',
          '将应用 <b>' + U.esc(a.name) + '</b> 从「' + before + '」流转至「' + U.esc(target.name) + '」？<br>流转记录将写入台账与审计日志。',
          function () {
            a.statusId = stId;
            a.updateTime = D.tOff(0, new Date().getHours(), new Date().getMinutes());
            if (stId === 'st-retired') a.retireDate = a.retireDate || U.today();
            ITAM.pushAudit('应用状态流转', a.name, '状态：' + before, '成功', '状态：' + target.name, a.code);
            ITAM.persist(); ITAM.renderAll(); ITAM.toast('已流转至「' + target.name + '」', 'ok');
          }, '确认流转');
      });
    });

    root.querySelectorAll('[data-cview]').forEach(function (b) {
      b.onclick = function () { changeDetail(b.getAttribute('data-cview')); };
    });
    root.querySelectorAll('[data-cappr]').forEach(function (b) {
      if (!b.disabled) b.onclick = function () { approveChange(b.getAttribute('data-cappr')); };
    });
    root.querySelectorAll('[data-retire]').forEach(function (b) {
      if (!b.disabled) b.onclick = function () { openChangeForm(b.getAttribute('data-retire'), '退役'); };
    });
    var nb = root.querySelector('#lcNew');
    if (nb && !nb.disabled) nb.onclick = function () { openChangeForm(); };
    var eb = root.querySelector('#lcExport');
    if (eb) eb.onclick = function () {
      var rows = [['工单号', '类型', '标题', '应用', '申请人', '影响评估', '审批状态', '当前节点', '审批人', '提交时间', '变更原因']];
      S.changes.forEach(function (c) {
        rows.push([c.id, c.type, c.title, c.appName, c.applicant, c.impact, c.status, c.node, c.approver, c.createdAt, c.reason]);
      });
      U.download('变更工单_' + U.today() + '.csv', U.csv(rows));
      ITAM.pushAudit('导出变更工单', '变更管理', '—', '成功', '导出 ' + S.changes.length + ' 条');
      ITAM.persist(); ITAM.toast('变更工单已导出', 'ok');
    };
  }

  function changeDetail(id) {
    var c = S.changes.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var a = ITAM.appById(c.appId);
    var canAct = ITAM.can('change.approve') && (c.status === '待审批' || c.status === '审批中');
    ITAM.openDrawer({
      narrow: true,
      title: U.esc(c.title),
      sub: '<span class="mono">' + U.esc(c.id) + '</span> ｜ ' +
        '<span class="badge ' + ({ '升级': 'b-blue', '架构调整': 'b-purple', '负责人变更': 'b-cyan', '退役': 'b-orange' })[c.type] + '">' + U.esc(c.type) + '</span>' +
        ' ｜ 申请人 ' + U.esc(c.applicant),
      actions: [{ label: '🖨 打印工单', onClick: function () { window.print(); } }],
      body: '<div class="section-title">工单信息</div>' +
        ITAM.dl([
          { k: '工单号', v: '<span class="mono">' + U.esc(c.id) + '</span>' },
          { k: '变更类型', v: U.esc(c.type) },
          { k: '影响评估', v: '<span class="badge ' + ({ '高': 'b-red', '中': 'b-orange', '低': 'b-green' })[c.impact] + '">' + c.impact + '</span>' },
          { k: '审批状态', v: '<span class="badge ' + ({ '待审批': 'b-orange', '审批中': 'b-blue', '已通过': 'b-green', '已驳回': 'b-red' })[c.status] + '">' + U.esc(c.status) + '</span>' },
          { k: '当前节点', v: U.esc(c.node) },
          { k: '审批人', v: U.esc(c.approver) },
          { k: '关联应用', v: a ? U.esc(a.name) + '（' + U.esc(a.code) + '）' : '—' },
          { k: '提交时间', v: U.esc(c.createdAt) },
          { k: '变更前状态', v: U.esc(ITAM.nameOf('statuses', c.beforeStatus)) },
          { k: '变更前负责人', v: U.esc(c.beforeOwner || '—') },
          { k: '预期结果', v: U.esc(c.type === '负责人变更' ? '负责人变更' : (c.type === '退役' ? '应用退役' : '版本 / 架构变更')) }
        ]) +
        '<div class="section-title">变更原因与说明</div><div class="card"><div class="card-bd">' + U.esc(c.reason) + '</div></div>' +
        '<div class="section-title">审批流转记录</div>' + ITAM.timeline(c.timeline),
      footer: canAct
        ? '<div class="form-actions"><button class="btn btn-danger" id="cdReject">驳回</button>' +
          '<button class="btn btn-primary" id="cdPass">审批通过</button></div>' : '',
      onMount: function (root) {
        var p = root.querySelector('#cdPass'), r = root.querySelector('#cdReject');
        if (p) p.onclick = function () { ITAM.closeDrawer(); approveChange(c.id); };
        if (r) r.onclick = function () {
          ITAM.closeDrawer();
          ITAM.openModal({
            title: '驳回变更工单 · ' + U.esc(c.id),
            body: '<div class="field"><label>驳回原因<i>*</i></label><textarea class="textarea" id="rjReason" placeholder="请填写驳回原因，如：缺少成本测算 / 未提供回退方案"></textarea></div>',
            footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-danger" id="rjOk">确认驳回</button>',
            onMount: function (m) {
              m.querySelector('#rjOk').onclick = function () {
                var reason = m.querySelector('#rjReason').value.trim();
                if (!reason) return ITAM.toast('请填写驳回原因', 'err');
                c.status = '已驳回'; c.node = '已终止'; c.approver = ITAM.persona().name;
                c.timeline.push({ time: D.tOff(0, new Date().getHours(), new Date().getMinutes()), title: '审批驳回', desc: '驳回原因：' + reason, state: 'warn' });
                ITAM.pushAudit('驳回变更工单', c.appName + ' · ' + c.title, '状态：审批中', '成功', '状态：已驳回（' + reason + '）', c.id);
                ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('已驳回工单 ' + c.id, 'ok');
              };
            }
          });
        };
      }
    });
  }

  function approveChange(id) {
    var c = S.changes.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var a = ITAM.appById(c.appId);
    ITAM.openModal({
      title: '审批变更工单 · ' + U.esc(c.id),
      body: '<div class="hint" style="line-height:1.9;margin-bottom:12px"><b>' + U.esc(c.title) + '</b><br>' +
        '类型：' + U.esc(c.type) + ' ｜ 影响评估：' + c.impact + ' ｜ 当前节点：' + U.esc(c.node) + '</div>' +
        '<div class="field"><label>审批意见</label><textarea class="textarea" id="apOpinion">审批通过，同意按方案执行，注意灰度与回退预案。</textarea></div>' +
        '<div class="field"><label class="chk"><input type="checkbox" id="apRefill" checked' + (a ? '' : ' disabled') + '> ' +
        '审批通过后自动回填资产台账' + (a ? '（' + U.esc(a.name) + ' 状态同步更新，并记录变更留痕）' : '（无关联应用）') + '</label></div>',
      footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="apOk">确认通过</button>',
      onMount: function (m) {
        m.querySelector('#apOk').onclick = function () {
          var opinion = m.querySelector('#apOpinion').value.trim();
          var refill = m.querySelector('#apRefill').checked;
          var now = D.tOff(0, new Date().getHours(), new Date().getMinutes());
          c.status = '已通过'; c.node = '已完成'; c.approver = ITAM.persona().name;
          c.timeline.push({ time: now, title: '审批通过', desc: opinion || '同意变更申请', state: 'ok' });
          if (a && refill) {
            var before = ITAM.nameOf('statuses', a.statusId);
            if (c.type === '负责人变更') a.owner = '李强';
            else if (c.type === '退役') { a.statusId = 'st-retired'; a.retireDate = U.today(); a.compliance = 'archived'; }
            else a.statusId = 'st-run';
            a.updateTime = now;
            c.timeline.push({ time: now, title: '自动回填台账', desc: a.name + ' 状态：' + before + ' → ' + ITAM.nameOf('statuses', a.statusId), state: 'ok' });
            ITAM.pushAudit('审批变更工单', a.name, '状态：' + before, '成功',
              '审批通过并回填台账：状态 ' + ITAM.nameOf('statuses', a.statusId), c.id);
          } else {
            ITAM.pushAudit('审批变更工单', c.appName + ' · ' + c.title, '状态：' + c.status, '成功', '审批通过（未回填台账）', c.id);
          }
          ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('工单 ' + c.id + ' 审批通过', 'ok');
        };
      }
    });
  }

  function openChangeForm(appId, presetType) {
    ITAM.openModal({
      title: '发起变更工单',
      body: '<div class="form-grid">' +
        '<div class="field"><label>变更类型<i>*</i></label><select class="select" id="ncType">' +
        ['升级', '架构调整', '负责人变更', '退役'].map(function (t) {
          return '<option' + (presetType === t ? ' selected' : '') + '>' + t + '</option>';
        }).join('') + '</select></div>' +
        '<div class="field"><label>影响评估</label><select class="select" id="ncImpact"><option>低</option><option selected>中</option><option>高</option></select></div>' +
        '<div class="field span2"><label>关联应用<i>*</i></label><select class="select" id="ncApp">' +
        S.apps.map(function (a) {
          return '<option value="' + a.id + '"' + (appId === a.id ? ' selected' : '') + '>' + U.esc(a.name) +
            '（' + U.esc(a.code) + '｜' + U.esc(ITAM.nameOf('statuses', a.statusId)) + '）</option>';
        }).join('') + '</select></div>' +
        '<div class="field span2"><label>工单标题<i>*</i></label><input class="input" id="ncTitle" placeholder="如：营销活动引擎 V2.4 版本升级"></div>' +
        '<div class="field span2"><label>变更原因与方案<i>*</i></label><textarea class="textarea" style="min-height:90px" id="ncReason" placeholder="请说明变更背景、方案、影响范围与回退预案"></textarea></div>' +
        '</div>',
      footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="ncOk">提交工单</button>',
      onMount: function (m) {
        var appSel = m.querySelector('#ncApp');
        var titleI = m.querySelector('#ncTitle');
        var typeSel = m.querySelector('#ncType');
        function syncTitle() {
          var a = ITAM.appById(appSel.value);
          if (a && !titleI.value) {
            titleI.value = a.name + ' ' + (typeSel.value === '退役' ? '退役评估' : typeSel.value);
          }
        }
        appSel.onchange = syncTitle;
        typeSel.onchange = function () { titleI.value = ''; syncTitle(); };
        syncTitle();
        m.querySelector('#ncOk').onclick = function () {
          var title = titleI.value.trim();
          var reason = m.querySelector('#ncReason').value.trim();
          if (!title) return ITAM.toast('请填写工单标题', 'err');
          if (!reason) return ITAM.toast('请填写变更原因与方案', 'err');
          var a = ITAM.appById(appSel.value);
          if (!a) return ITAM.toast('请选择关联应用', 'err');
          var t = typeSel.value;
          var now = D.tOff(0, new Date().getHours(), new Date().getMinutes());
          var c = {
            id: 'CHG-' + (2500 + S.changes.length + Math.floor(Math.random() * 900)),
            type: t, appId: a.id, appName: a.name, title: title,
            applicant: ITAM.persona().name, status: '待审批', createdAt: U.today(),
            approver: '—', reason: reason, impact: m.querySelector('#ncImpact').value,
            node: '业务负责人审批', beforeStatus: a.statusId, beforeOwner: a.owner,
            timeline: [
              { time: now, title: '提交申请', desc: ITAM.persona().name + ' 提交「' + t + '」申请', state: 'ok' },
              { time: now, title: '资料自动校验', desc: '系统校验台账字段完整性：通过', state: 'ok' },
              { time: now, title: '待业务负责人审批', desc: '当前节点：业务负责人审批', state: 'warn' }
            ]
          };
          S.changes.unshift(c);
          if (t === '升级' || t === '架构调整') {
            a.statusId = 'st-change';
            a.updateTime = now;
          }
          ITAM.pushAudit('提交变更工单', a.name + ' · ' + title, '状态：' + ITAM.nameOf('statuses', c.beforeStatus), '成功', '工单已提交待审批', c.id);
          ITAM.persist(); ITAM.closeModal(); ITAM.renderAll();
          ITAM.toast('工单 ' + c.id + ' 已提交，等待审批', 'ok');
        };
      }
    });
  }

  ITAM.register('lifecycle', { title: '生命周期与变更', render: lcRender, mount: lcMount });
  ITAM.openChangeForm = openChangeForm;
})();
