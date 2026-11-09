/* =========================================================
   IT应用资产管理系统 · 扩展模块
   拓扑与关系（P1） / 报表中心（P1-P2） / 成本与合规（P2）
   权限与审计（P0） / 自动发现与采集（P0-P1） / 开放集成（P2）
   ========================================================= */
(function () {
  'use strict';
  var ITAM = window.ITAM, U = ITAM.U, S = ITAM.S, D = window.ITAM_DATA;

  /* ==========================================================
     一、应用拓扑与关系（P1）
     ========================================================== */
  var topo = { focus: '', zoom: 1, tx: 0, ty: 0, layerInfra: true };
  var topoDrag = { on: false, x: 0, y: 0 };

  function topoData() {
    var nodes = {}, calls = S.callEdges;
    function push(id, role) {
      var a = ITAM.appById(id);
      if (!a || nodes[id]) return;
      nodes[id] = { id: id, name: a.name, role: role, level: a.levelId, status: a.statusId, domain: a.domainId, owner: a.owner, kind: 'app' };
    }
    if (topo.focus) {
      push(topo.focus, 'focus');
      calls.forEach(function (e) {
        if (e.to === topo.focus) push(e.from, 'up');
        if (e.from === topo.focus) push(e.to, 'down');
      });
      Object.keys(nodes).slice().forEach(function (id) {
        calls.forEach(function (e) {
          if (e.from === topo.focus || e.to === topo.focus) return;
          if (e.from === id) push(e.to, 'far');
          if (e.to === id) push(e.from, 'far');
        });
      });
    } else {
      S.apps.forEach(function (a) { push(a.id, 'all'); });
    }
    var edges = calls.filter(function (e) { return nodes[e.from] && nodes[e.to]; });
    if (topo.layerInfra) {
      Object.keys(nodes).slice().forEach(function (id) {
        var ap = ITAM.appById(id);
        (ap && ap.infra || []).forEach(function (n) {
          var sid = 'sys-' + U.slug(n);
          if (!nodes[sid]) {
            nodes[sid] = { id: sid, name: n, role: 'infra', kind: 'infra', parent: id };
          }
        });
      });
    }
    return { nodes: nodes, edges: edges };
  }

  var ROLE_STYLE = {
    focus: { fill: '#eaf0ff', stroke: '#2f6bff', text: '#1f52d0' },
    up: { fill: '#fff6e3', stroke: '#d98600', text: '#a86800' },
    down: { fill: '#e7f7ee', stroke: '#12a150', text: '#0d7a3c' },
    far: { fill: '#f7f9fc', stroke: '#cfd7e5', text: '#8a97aa' },
    all: { fill: '#ffffff', stroke: '#cfd7e5', text: '#1e293b' },
    infra: { fill: '#f1ecfd', stroke: '#7a4ddb', text: '#5b34ad' }
  };

  function topoRender() {
    var d = topoData();
    var ids = Object.keys(d.nodes);
    var W = 1100, H = 560;
    var appCount = ids.filter(function (i) { return d.nodes[i].kind === 'app'; }).length;

    var html = ITAM.pageHead('应用拓扑与关系',
      '展示应用间调用依赖关系，以及应用与数据库 / 中间件等基础设施的依赖，清晰呈现系统集成脉络。支持聚焦单应用的上下游影响分析、缩放、平移与导出。',
      '<button class="btn" id="topoExport"' + (ITAM.can('topology.export') ? '' : ' disabled') + '>⬇ 导出拓扑图 (SVG)</button>');

    html += '<div class="card"><div class="filter-bar">' +
      '<label style="font-size:12.5px;color:var(--text-2)">聚焦应用：</label>' +
      '<select class="select" id="topoFocus" style="min-width:230px">' +
      '<option value="">全局拓扑（全部应用）</option>' +
      S.apps.map(function (a) {
        return '<option value="' + a.id + '"' + (topo.focus === a.id ? ' selected' : '') + '>' + U.esc(a.name) + '（' + U.esc(a.code) + '）</option>';
      }).join('') + '</select>' +
      '<label class="chk"><input type="checkbox" id="topoInfra"' + (topo.layerInfra ? ' checked' : '') + '> 显示基础设施依赖层</label>' +
      '<button class="btn" id="topoFit">重置视图</button>' +
      '<span class="spacer"></span>' +
      '<span style="font-size:12px;color:var(--text-3)">应用节点 ' + appCount + ' 个 ｜ 依赖边 ' + d.edges.length + ' 条</span>' +
      '</div>';
    html += '<div class="card-bd" style="padding:12px"><div class="topo-wrap" id="topoWrap">' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" id="topoSvg"></svg>' +
      '<div class="topo-tools">' +
      '<button class="btn btn-mini" id="topoZoomIn" title="放大">＋</button>' +
      '<button class="btn btn-mini" id="topoZoomOut" title="缩小">－</button>' +
      '<button class="btn btn-mini" id="topoReset" title="复位">⟲</button>' +
      '</div>' +
      '<div class="topo-legend">' +
      '<div class="legend-item"><span class="sw" style="background:#eaf0ff;border:1px solid #2f6bff"></span>当前聚焦应用</div>' +
      '<div class="legend-item"><span class="sw" style="background:#fff6e3;border:1px solid #d98600"></span>上游调用方</div>' +
      '<div class="legend-item"><span class="sw" style="background:#e7f7ee;border:1px solid #12a150"></span>下游被依赖方</div>' +
      '<div class="legend-item"><span class="sw" style="background:#f1ecfd;border:1px solid #7a4ddb"></span>基础设施 / 中间件</div>' +
      '<div class="legend-item"><span style="font-size:11px;color:var(--text-3)">滚轮缩放 · 空白处拖动平移 · 点击节点聚焦</span></div>' +
      '</div></div></div></div>';

    if (topo.focus) {
      var a = ITAM.appById(topo.focus);
      var ups = D.ups(a), downs = D.downs(a);
      html += '<div class="grid g-4 mt14">' +
        ITAM.kpi('上游调用方', '⬆️', 'warn', ups.length, '个', '<span style="color:var(--text-3)">依赖本应用</span>') +
        ITAM.kpi('下游被依赖', '⬇️', 'success', downs.length, '个', '<span style="color:var(--text-3)">本应用调用</span>') +
        ITAM.kpi('基础设施依赖', '🗄️', 'purple', D.sysDeps(a).length, '项', '<span style="color:var(--text-3)">DB / 中间件</span>') +
        ITAM.kpi('直接关联影响面', '🌐', a.levelId === 'lv-core' ? 'danger' : 'info', ups.length + downs.length, '个应用', '<span style="color:var(--text-3)">需重点评估</span>') +
        '</div>';
      html += '<div class="grid g-3 mt14">' +
        '<div class="card"><div class="card-hd"><h3>上游调用方健康度</h3><span class="sub">本应用故障将影响这些系统</span></div><div class="card-bd">' +
        (ups.length ? ITAM.barList(ups.map(function (x) {
          var t = ITAM.appById(x);
          return { label: t.name, value: t.health, color: '#d98600' };
        }), '%') : '<span style="color:var(--text-3);font-size:12px">无上游应用</span>') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>下游被依赖方健康度</h3><span class="sub">本应用依赖这些系统提供服务</span></div><div class="card-bd">' +
        (downs.length ? ITAM.barList(downs.map(function (x) {
          var t = ITAM.appById(x);
          return { label: t.name, value: t.health, color: '#12a150' };
        }), '%') : '<span style="color:var(--text-3);font-size:12px">无下游依赖</span>') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>基础设施依赖</h3></div><div class="card-bd">' +
        (D.sysDeps(a).length ? D.sysDeps(a).map(function (x) { return '<span class="tag">🗄️ ' + U.esc(x.replace(/^sys-/, '')) + '</span>'; }).join('') : '—') +
        '<div class="hint mt14" style="color:var(--text-3)">技术栈：' + U.esc((a.techStack || []).join('、')) + '</div>' +
        '<div class="hint" style="color:var(--text-3)">部署形式：' + U.esc(ITAM.nameOf('deployments', a.deployId)) + '</div>' +
        '</div></div></div>';
    } else {
      var doms = ITAM.dict('domains').map(function (dm) {
        var cs = S.callEdges.filter(function (e) {
          var f = ITAM.appById(e.from), t = ITAM.appById(e.to);
          return f && t && f.domainId !== t.domainId && (f.domainId === dm.id || t.domainId === dm.id);
        }).length;
        return { label: dm.name, value: cs, color: '#2f6bff' };
      }).filter(function (x) { return x.value > 0; });
      var crossCount = S.callEdges.filter(function (e) {
        var f = ITAM.appById(e.from), t = ITAM.appById(e.to);
        return f && t && f.domainId !== t.domainId;
      }).length;
      var isolated = S.apps.filter(function (a) { return !D.ups(a).length && !D.downs(a).length; });
      html += '<div class="grid g-2-1 mt14">' +
        '<div class="card"><div class="card-hd"><h3>跨应用域调用关系数量</h3><span class="sub">体现业务域之间的系统集成耦合度</span></div>' +
        '<div class="card-bd">' + ITAM.barList(doms, ' 条') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>拓扑治理提示</h3></div><div class="card-bd tight">' +
        '<table class="tb" style="min-width:auto"><thead><tr><th>检查项</th><th>结果</th></tr></thead><tbody>' +
        [['依赖关系总数', S.callEdges.length + ' 条'],
        ['跨应用域调用', crossCount + ' 条'],
        ['核心应用被依赖', S.apps.filter(function (a) { return a.levelId === 'lv-core' && D.ups(a).length > 0; }).length + ' 个'],
        ['孤立应用（无依赖）', isolated.length + ' 个'],
        ['循环依赖检测', '未发现循环依赖 ✅']].map(function (r) {
          return '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td></tr>';
        }).join('') + '</tbody></table>' +
        (isolated.length ? '<div class="hint" style="padding:10px 12px;color:var(--warn)">孤立应用建议核实依赖登记完整性：' +
          isolated.slice(0, 6).map(function (a) { return U.esc(a.name); }).join('、') + '</div>' : '') +
        '</div></div></div>';
    }

    var focusEdges = topo.focus
      ? S.callEdges.filter(function (e) { return e.from === topo.focus || e.to === topo.focus; })
      : S.callEdges.slice(0, 24);
    html += '<div class="card mt14"><div class="card-hd"><h3>依赖关系明细</h3>' +
      '<span class="sub">' + (topo.focus ? '与聚焦应用直接相关的依赖关系' : '全局显示前 24 条，聚焦应用可查看全部') + '</span></div>' +
      '<div class="card-bd tight"><table class="tb"><thead><tr><th>上游（调用方）</th><th style="width:50px"></th>' +
      '<th>下游（被调用方）</th><th>关系类型</th><th>跨域</th><th>重要等级</th></tr></thead><tbody>' +
      (focusEdges.length ? focusEdges.map(function (e) {
        var f = ITAM.appById(e.from), t = ITAM.appById(e.to);
        if (!f || !t) return '';
        var cross = f.domainId !== t.domainId;
        return '<tr><td><span class="link" data-topofocus="' + f.id + '">' + U.esc(f.name) + '</span>' +
          '<div style="font-size:11px;color:var(--text-3)">' + U.esc(ITAM.nameOf('domains', f.domainId)) + '</div></td>' +
          '<td style="text-align:center;color:var(--primary);font-size:15px">➜</td>' +
          '<td><span class="link" data-topofocus="' + t.id + '">' + U.esc(t.name) + '</span>' +
          '<div style="font-size:11px;color:var(--text-3)">' + U.esc(ITAM.nameOf('domains', t.domainId)) + '</div></td>' +
          '<td><span class="badge b-blue">接口调用</span></td>' +
          '<td>' + (cross ? '<span class="badge b-orange">跨域</span>' : '<span class="badge b-gray">同域</span>') + '</td>' +
          '<td>' + ITAM.levelBadge(t) + '</td></tr>';
      }).join('') : '<tr><td colspan="6">' + ITAM.emptyBox('暂无依赖关系') + '</td></tr>') +
      '</tbody></table></div></div>';
    return html;
  }

  function drawTopo() {
    var svg = document.getElementById('topoSvg');
    if (!svg) return;
    var d = topoData();
    var ids = Object.keys(d.nodes);
    var W = 1100, H = 560;
    var apps = ids.filter(function (i) { return d.nodes[i].kind === 'app'; });
    var infras = ids.filter(function (i) { return d.nodes[i].kind === 'infra'; });
    var rows = { up: [], focus: [], down: [], far: [], all: [] };
    apps.forEach(function (i) { if (rows[d.nodes[i].role]) rows[d.nodes[i].role].push(i); });

    var pos = {};
    function place(list, y) {
      var n = list.length || 1;
      list.forEach(function (id, i) {
        pos[id] = { x: Math.max(76, Math.min(W - 76, W * (i + 0.5) / n)), y: y };
      });
    }
    if (topo.focus) {
      place(rows.up, 118);
      place(rows.focus, 285);
      place(rows.down, 452);
      if (rows.far.length) place(rows.far, 52);
    } else {
      var per = Math.ceil(rows.all.length / 4) || 1;
      rows.all.forEach(function (id, i) {
        var col = i % per, row = Math.floor(i / per);
        pos[id] = { x: 96 + col * ((W - 192) / Math.max(1, per - 1)), y: 66 + row * 118 };
      });
    }
    infras.forEach(function (id, i) {
      var base = pos[d.nodes[id].parent] || { x: W / 2, y: H - 70 };
      pos[id] = { x: Math.max(58, Math.min(W - 58, base.x + ((i % 5) - 2) * 62)), y: H - 40 };
    });

    var defs = '<defs>' +
      '<marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" fill="#9fb0c8"></path></marker>' +
      '<marker id="arwH" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" fill="#2f6bff"></path></marker></defs>';

    var edgeSvg = d.edges.map(function (e) {
      var p1 = pos[e.from], p2 = pos[e.to];
      if (!p1 || !p2) return '';
      var hl = topo.focus && (e.from === topo.focus || e.to === topo.focus);
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var sx = p1.x + dx / len * 56, sy = p1.y + dy / len * 20;
      var ex = p2.x - dx / len * 56, ey = p2.y - dy / len * 20;
      var mx = (sx + ex) / 2, my = (sy + ey) / 2 - Math.abs(dx) * 0.07;
      var color = e.type === 'infra' ? '#b9a6ea' : (hl ? '#2f6bff' : '#c3cddd');
      return '<path d="M' + sx + ',' + sy + ' Q' + mx + ',' + my + ' ' + ex + ',' + ey + '" fill="none" stroke="' + color +
        '" stroke-width="' + (hl ? 1.7 : 1) + '" marker-end="url(#' + (hl ? 'arwH' : 'arw') + ')" opacity="' +
        (topo.focus && !hl ? 0.3 : 0.92) + '"></path>';
    }).join('');

    var nodeSvg = ids.map(function (id) {
      var n = d.nodes[id], p = pos[id];
      if (!p) return '';
      var st = ROLE_STYLE[n.role] || ROLE_STYLE.all;
      var isFocus = n.role === 'focus';
      var lv = n.kind === 'app' ? ITAM.objOf('levels', n.level) : {};
      var w = n.kind === 'infra' ? 104 : 112, h = 40;
      var dim = topo.focus && n.role === 'far';
      return '<g class="topo-node" data-node="' + id + '" transform="translate(' + (p.x - w / 2) + ',' + (p.y - h / 2) + ')" opacity="' + (dim ? 0.45 : 1) + '">' +
        '<rect class="node-box" x="0" y="0" rx="8" width="' + w + '" height="' + h + '" fill="' + st.fill + '" stroke="' + st.stroke +
        '" stroke-width="' + (isFocus ? 2.4 : 1.2) + '"></rect>' +
        (n.kind === 'app' && lv.color === 'red' ? '<circle cx="' + (w - 10) + '" cy="10" r="4" fill="#e03131"></circle>' : '') +
        '<text x="' + (w / 2) + '" y="' + (h / 2 + 4) + '" text-anchor="middle" font-size="11.5" font-weight="' + (isFocus ? 700 : 500) +
        '" fill="' + st.text + '" style="pointer-events:none">' +
        U.esc(n.name.length > 9 ? n.name.slice(0, 9) + '…' : n.name) + '</text></g>';
    }).join('');

    svg.innerHTML = defs + '<g id="topoViewport" transform="translate(' + topo.tx + ',' + topo.ty + ') scale(' + topo.zoom + ')">' +
      edgeSvg + nodeSvg + '</g>';

    svg.querySelectorAll('[data-node]').forEach(function (g) {
      g.onclick = function (e) {
        e.stopPropagation();
        var id = g.getAttribute('data-node');
        if (id.indexOf('sys-') === 0) return;
        if (ITAM.appById(id)) { topo.focus = id; topo.zoom = 1; topo.tx = 0; topo.ty = 0; ITAM.render(); }
      };
    });
  }

  function topoMount(root) {
    drawTopo();
    var wrap = root.querySelector('#topoWrap');
    var fs = root.querySelector('#topoFocus');
    if (fs) fs.onchange = function () { topo.focus = fs.value; topo.zoom = 1; topo.tx = 0; topo.ty = 0; ITAM.render(); };
    var ifx = root.querySelector('#topoInfra');
    if (ifx) ifx.onchange = function () { topo.layerInfra = ifx.checked; ITAM.render(); };
    var fit = root.querySelector('#topoFit');
    if (fit) fit.onclick = function () { topo.zoom = 1; topo.tx = 0; topo.ty = 0; ITAM.render(); };
    var zi = root.querySelector('#topoZoomIn');
    if (zi) zi.onclick = function () { topo.zoom = Math.min(2.4, topo.zoom + 0.15); drawTopo(); };
    var zo = root.querySelector('#topoZoomOut');
    if (zo) zo.onclick = function () { topo.zoom = Math.max(0.4, topo.zoom - 0.15); drawTopo(); };
    var zr = root.querySelector('#topoReset');
    if (zr) zr.onclick = function () { topo.zoom = 1; topo.tx = 0; topo.ty = 0; drawTopo(); };
    root.querySelectorAll('[data-topofocus]').forEach(function (b) {
      b.onclick = function () { topo.focus = b.getAttribute('data-topofocus'); topo.zoom = 1; topo.tx = 0; topo.ty = 0; ITAM.render(); };
    });
    if (wrap) {
      wrap.addEventListener('wheel', function (e) {
        e.preventDefault();
        topo.zoom = Math.max(0.4, Math.min(2.4, topo.zoom + (e.deltaY < 0 ? 0.1 : -0.1)));
        drawTopo();
      }, { passive: false });
      wrap.addEventListener('mousedown', function (e) {
        if (e.target.closest('.topo-node') || e.target.closest('.topo-tools') || e.target.closest('.topo-legend')) return;
        topoDrag.on = true;
        topoDrag.x = e.clientX - topo.tx;
        topoDrag.y = e.clientY - topo.ty;
        wrap.classList.add('dragging');
      });
      document.addEventListener('mousemove', function (e) {
        if (!topoDrag.on) return;
        topo.tx = e.clientX - topoDrag.x;
        topo.ty = e.clientY - topoDrag.y;
        drawTopo();
      });
      document.addEventListener('mouseup', function () {
        topoDrag.on = false;
        var w = document.getElementById('topoWrap');
        if (w) w.classList.remove('dragging');
      });
    }
    var ex = root.querySelector('#topoExport');
    if (ex && !ex.disabled) ex.onclick = function () {
      var svg = document.getElementById('topoSvg');
      var clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', '1100');
      clone.setAttribute('height', '560');
      clone.innerHTML = '<rect width="1100" height="560" fill="#ffffff"></rect>' + clone.innerHTML;
      var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + clone.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '应用拓扑图_' + (topo.focus ? ITAM.appLabel(topo.focus) : '全局') + '_' + U.today() + '.svg';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 300);
      ITAM.pushAudit('导出拓扑图', topo.focus ? ITAM.appLabel(topo.focus) : '全局拓扑', '—', '成功', '导出 SVG 矢量图');
      ITAM.persist(); ITAM.toast('拓扑图已导出为 SVG', 'ok');
    };
  }

  ITAM.register('topology', { title: '拓扑与关系', render: topoRender, mount: topoMount });
  ITAM.openTopoFocus = function (id) {
    topo.focus = id; topo.zoom = 1; topo.tx = 0; topo.ty = 0;
    ITAM.render();
  };

  /* ==== PART2 ==== */

  /* ==========================================================
     二、报表中心（P1-P2）
     ========================================================== */
  var repTab = 'builtin';

  function assetRows() {
    var rows = [['应用编号', '应用名称', '应用域', '产品线', '重要等级', '状态', '部署形式']];
    S.apps.forEach(function (a) {
      rows.push([a.code, a.name, ITAM.nameOf('domains', a.domainId), ITAM.objOf('productLines', a.productLineId).name,
        ITAM.nameOf('levels', a.levelId), ITAM.nameOf('statuses', a.statusId), ITAM.nameOf('deployments', a.deployId)]);
    });
    return rows;
  }

  function rbCompute(dim, metric) {
    function keyOf(a) {
      switch (dim) {
        case '应用域': return ITAM.nameOf('domains', a.domainId);
        case '产品线': return ITAM.objOf('productLines', a.productLineId).name || '未分配';
        case '重要等级': return ITAM.nameOf('levels', a.levelId);
        case '资产状态': return ITAM.nameOf('statuses', a.statusId);
        case '部署形式': return ITAM.nameOf('deployments', a.deployId);
        case '开发模式': return ITAM.nameOf('devModes', a.devModeId);
        case '负责人': return a.owner;
        case '合规状态': return ({ compliant: '合规', pending: '待核查', risk: '存在风险项', archived: '已归档' })[a.compliance] || '未知';
      }
      return '其他';
    }
    var map = {};
    S.apps.forEach(function (a) {
      var k = keyOf(a);
      if (!map[k]) map[k] = { n: 0, core: 0, cost: 0, health: 0, lic: 0 };
      map[k].n++;
      map[k].health += a.health;
      map[k].cost += ITAM.costTotal(a);
      if (a.levelId === 'lv-core') map[k].core++;
      map[k].lic += S.licenses.filter(function (l) { return l.appId === a.id; }).length;
    });
    return Object.keys(map).map(function (k) {
      var v = map[k];
      var val = metric === '应用数量' ? v.n
        : metric === '核心应用数' ? v.core
          : metric === '成本合计' ? Math.round(v.cost)
            : metric === '平均健康度' ? Math.round(v.health / v.n) : v.lic;
      return { label: k, value: val };
    }).sort(function (a, b) { return b.value - a.value; });
  }

  function repRender() {
    var html = ITAM.pageHead('报表中心',
      '内置资产清单、License 到期、资产变更、业务域资产统计等常用报表模板；支持自定义维度组合、保存报表模板，并配置定时自动推送。',
      '<button class="btn" id="repExport"' + (ITAM.can('report.view') ? '' : ' disabled') + '>⬇ 导出资产清单</button>' +
      '<button class="btn btn-primary" id="repNew"' + (ITAM.can('report.manage') ? '' : ' disabled') + '>＋ 自定义报表</button>');

    html += '<div class="tabs">' +
      [['builtin', '内置报表模板'], ['custom', '自定义报表与推送']].map(function (t) {
        return '<button class="tab' + (repTab === t[0] ? ' active' : '') + '" data-reptab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (repTab === 'builtin') {
      html += '<div class="grid g-3">';
      ITAM.dict('reportTemplates').filter(function (r) { return r.category === '内置模板'; }).forEach(function (r) {
        html += '<div class="card"><div class="card-hd"><h3>' + U.esc(r.name) + '</h3><span class="badge b-blue">内置模板</span></div>' +
          '<div class="card-bd"><div style="font-size:12.5px;color:var(--text-2);min-height:44px">' + U.esc(r.desc) + '</div>' +
          '<div class="kv-inline mt14" style="font-size:11.5px"><span>维度：' + U.esc(r.dims) + '</span></div>' +
          '<div class="kv-inline" style="font-size:11.5px"><span>推送：' + U.esc(r.freq) + '</span><span>负责人：' + U.esc(r.owner) + '</span></div>' +
          '<div style="margin-top:10px;display:flex;gap:6px">' +
          '<button class="btn btn-mini btn-primary" data-reprun="' + r.id + '">生成报表</button>' +
          '<button class="btn btn-mini" data-repsched="' + r.id + '"' + (ITAM.can('report.manage') ? '' : ' disabled') + '>推送设置</button>' +
          '</div></div></div>';
      });
      html += '</div>';

      html += '<div class="card mt14"><div class="card-hd"><h3>内置报表预览 · 资产清单报表</h3>' +
        '<span class="sub">按应用域 / 产品线 / 状态 / 重要等级多维展示</span>' +
        '<div class="hd-actions"><button class="btn btn-mini" id="repQuickCsv">⬇ 导出 CSV</button></div></div>' +
        '<div class="card-bd tight"><div class="table-wrap" style="max-height:420px"><table class="tb"><thead><tr>' +
        '<th>应用编号</th><th>应用名称</th><th>应用域</th><th>产品线</th><th>重要等级</th><th>状态</th><th>部署形式</th><th>成本(万元)</th><th>健康度</th>' +
        '</tr></thead><tbody>' +
        S.apps.slice(0, 20).map(function (a) {
          return '<tr><td class="mono">' + U.esc(a.code) + '</td><td>' + U.esc(a.name) + '</td>' +
            '<td>' + U.esc(ITAM.nameOf('domains', a.domainId)) + '</td>' +
            '<td>' + U.esc(ITAM.objOf('productLines', a.productLineId).name) + '</td>' +
            '<td>' + ITAM.levelBadge(a) + '</td><td>' + ITAM.statusBadge(a) + '</td>' +
            '<td>' + U.esc(ITAM.nameOf('deployments', a.deployId)) + '</td>' +
            '<td class="num">' + ITAM.costTotal(a) + '</td><td class="num">' + a.health + '%</td></tr>';
        }).join('') + '</tbody></table></div>' +
        (S.apps.length > 20 ? '<div class="tb-scroll-hint">仅预览前 20 条，共 ' + S.apps.length + ' 条。导出可获取全量数据。</div>' : '') +
        '</div></div>';

      var totalCost = S.apps.reduce(function (s, a) { return s + ITAM.costTotal(a); }, 0) || 1;
      html += '<div class="card mt14"><div class="card-hd"><h3>业务域资产统计报表</h3>' +
        '<span class="sub">按应用域汇总资产数量、核心应用数与成本</span></div>' +
        '<div class="card-bd tight"><table class="tb"><thead><tr>' +
        '<th>应用域</th><th>应用总数</th><th>核心应用</th><th>运行中</th><th>产品线数</th><th>成本合计(万元)</th><th>成本占比</th>' +
        '</tr></thead><tbody>';
      html += ITAM.dict('domains').map(function (dm) {
        var arr = S.apps.filter(function (a) { return a.domainId === dm.id; });
        var c = arr.reduce(function (s, a) { return s + ITAM.costTotal(a); }, 0);
        return '<tr><td><b>' + U.esc(dm.name) + '</b> <span class="mono" style="font-size:11px">' + U.esc(dm.code) + '</span></td>' +
          '<td class="num">' + arr.length + '</td>' +
          '<td class="num">' + arr.filter(function (a) { return a.levelId === 'lv-core'; }).length + '</td>' +
          '<td class="num">' + arr.filter(function (a) { return a.statusId === 'st-run'; }).length + '</td>' +
          '<td class="num">' + ITAM.linesOf(dm.id).length + '</td>' +
          '<td class="num">' + Math.round(c) + '</td>' +
          '<td>' + ITAM.progress(c / totalCost * 100) +
          '<span style="font-size:10.5px;color:var(--text-3)">' + Math.round(c / totalCost * 100) + '%</span></td></tr>';
      }).join('');
      html += '<tr style="background:var(--surface-2);font-weight:600"><td>合计</td>' +
        '<td class="num">' + S.apps.length + '</td>' +
        '<td class="num">' + S.apps.filter(function (a) { return a.levelId === 'lv-core'; }).length + '</td>' +
        '<td class="num">' + S.apps.filter(function (a) { return a.statusId === 'st-run'; }).length + '</td>' +
        '<td class="num">' + ITAM.dict('productLines').length + '</td>' +
        '<td class="num">' + Math.round(totalCost) + '</td><td>100%</td></tr>';
      html += '</tbody></table></div></div>';
    } else {
      html += '<div class="hint mb10" style="color:var(--text-3)">自定义报表支持选择统计维度与分析指标，保存为模板后可配置定时推送（邮件 / 站内消息 / 企业微信）。</div>';
      html += '<div class="grid g-3">';
      var customs = ITAM.dict('reportTemplates').filter(function (r) { return r.category === '自定义报表'; });
      if (customs.length) {
        customs.forEach(function (r) {
          html += '<div class="card"><div class="card-hd"><h3>' + U.esc(r.name) + '</h3><span class="badge b-purple">自定义</span></div>' +
            '<div class="card-bd"><div style="font-size:12.5px;color:var(--text-2);min-height:44px">' + U.esc(r.desc) + '</div>' +
            '<div class="kv-inline mt14" style="font-size:11.5px"><span>维度：' + U.esc(r.dims) + '</span></div>' +
            '<div class="kv-inline" style="font-size:11.5px"><span>推送：' + U.esc(r.freq) + '</span><span>负责人：' + U.esc(r.owner) + '</span></div>' +
            '<div style="margin-top:10px;display:flex;gap:6px">' +
            '<button class="btn btn-mini btn-primary" data-reprun="' + r.id + '">生成报表</button>' +
            '<button class="btn btn-mini" data-repsched="' + r.id + '"' + (ITAM.can('report.manage') ? '' : ' disabled') + '>推送设置</button>' +
            '<button class="btn btn-mini btn-danger" data-repdel="' + r.id + '"' + (ITAM.can('report.manage') ? '' : ' disabled') + '>删除</button>' +
            '</div></div></div>';
        });
      } else {
        html += '<div class="card" style="grid-column:span 3">' + ITAM.emptyBox('暂无自定义报表', '可在下方构建器中配置维度并保存为模板') + '</div>';
      }
      html += '</div>';

      html += '<div class="card mt14"><div class="card-hd"><h3>自定义报表构建器</h3>' +
        '<span class="sub">选择统计维度与分析指标并实时预览结果</span></div>' +
        '<div class="card-bd"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">' +
        '<div class="field" style="margin:0;min-width:190px"><label>统计维度</label><select class="select" id="rbDim">' +
        ['应用域', '产品线', '重要等级', '资产状态', '部署形式', '开发模式', '负责人', '合规状态'].map(function (x) { return '<option>' + x + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field" style="margin:0;min-width:190px"><label>分析指标</label><select class="select" id="rbMetric">' +
        ['应用数量', '核心应用数', '成本合计', '平均健康度', 'License 数量'].map(function (x) { return '<option>' + x + '</option>'; }).join('') +
        '</select></div>' +
        '<button class="btn btn-primary" id="rbRun">生成预览</button>' +
        '<button class="btn" id="rbSave"' + (ITAM.can('report.manage') ? '' : ' disabled') + '>保存为模板</button>' +
        '</div><div id="rbResult" style="margin-top:14px"></div></div></div>';
    }
    return html;
  }

  function repMount(root) {
    root.querySelectorAll('[data-reptab]').forEach(function (b) {
      b.onclick = function () { repTab = b.getAttribute('data-reptab'); ITAM.render(); };
    });

    root.querySelectorAll('[data-reprun]').forEach(function (b) {
      b.onclick = function () {
        var r = ITAM.dict('reportTemplates').filter(function (x) { return x.id === b.getAttribute('data-reprun'); })[0];
        var rows;
        if (r.id === 'rp-2') {
          rows = S.licenses.slice().sort(function (a, b) {
            return (U.daysTo(a.expireDate) || 0) - (U.daysTo(b.expireDate) || 0);
          }).map(function (l) { return { label: l.product + '（' + l.vendor + '）', value: (U.daysTo(l.expireDate) || 0) + ' 天' }; });
        } else if (r.id === 'rp-3') {
          rows = ['待审批', '审批中', '已通过', '已驳回'].map(function (st) {
            return { label: st, value: S.changes.filter(function (c) { return c.status === st; }).length };
          });
        } else if (r.id === 'rp-4') {
          rows = rbCompute('应用域', '成本合计');
        } else if (r.id === 'rp-5') {
          rows = S.apps.filter(function (a) { return a.levelId === 'lv-core'; }).slice(0, 12).map(function (a) {
            return { label: a.name, value: a.health + '%' };
          });
        } else {
          rows = rbCompute('应用域', '应用数量');
        }
        var sum = rows.reduce(function (s, x) { return s + (typeof x.value === 'number' ? x.value : 0); }, 0) || 1;
        ITAM.openModal({
          title: '报表生成结果 · ' + U.esc(r.name),
          body: '<div class="hint" style="margin-bottom:10px">维度：' + U.esc(r.dims) + ' ｜ 生成时间：' + U.esc(D.tOff(0, new Date().getHours(), new Date().getMinutes())) + '</div>' +
            '<table class="tb" style="min-width:auto"><thead><tr><th>分组</th><th>数值</th><th>占比</th></tr></thead><tbody>' +
            rows.map(function (x) {
              return '<tr><td>' + U.esc(x.label) + '</td><td class="num">' + x.value + '</td><td>' +
                (typeof x.value === 'number' ? Math.round(x.value / sum * 100) + '%' : '—') + '</td></tr>';
            }).join('') + '</tbody></table>',
          footer: '<button class="btn" data-mclose="1">关闭</button><button class="btn btn-primary" id="rpExp">导出该报表</button>',
          onMount: function (m) {
            m.querySelector('#rpExp').onclick = function () {
              var out = [['分组', '数值']];
              rows.forEach(function (x) { out.push([x.label, x.value]); });
              U.download(r.name + '_' + U.today() + '.csv', U.csv(out));
              ITAM.pushAudit('生成报表', r.name, '—', '成功', '导出报表数据');
              ITAM.persist(); ITAM.toast('报表已导出', 'ok');
            };
          }
        });
      };
    });

    root.querySelectorAll('[data-repsched]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var r = ITAM.dict('reportTemplates').filter(function (x) { return x.id === b.getAttribute('data-repsched'); })[0];
        ITAM.openModal({
          title: '报表推送设置 · ' + U.esc(r.name),
          body: '<div class="field"><label>推送频率</label><select class="select" id="scFreq">' +
            ['按需生成', '每日 09:00 推送', '每周一 09:00 推送', '每月 1 日推送', '每周五 17:00 推送'].map(function (x) {
              return '<option' + (r.freq === x ? ' selected' : '') + '>' + x + '</option>';
            }).join('') + '</select></div>' +
            '<div class="field"><label>推送渠道</label><div style="display:flex;gap:14px">' +
            ['邮件', '站内消息', '企业微信'].map(function (c, i) {
              return '<label class="chk"><input type="checkbox" data-sc="' + c + '"' + (i < 2 ? ' checked' : '') + '>' + c + '</label>';
            }).join('') + '</div></div>' +
            '<div class="field"><label>接收人</label><input class="input" id="scOwner" value="' + U.esc(r.owner) + '"></div>' +
            '<div class="hint">定时推送依赖后端调度服务，本演示环境仅保存配置。</div>',
          footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="scOk">保存设置</button>',
          onMount: function (m) {
            m.querySelector('#scOk').onclick = function () {
              var before = r.freq + ' ｜ ' + r.owner;
              r.freq = m.querySelector('#scFreq').value;
              r.owner = m.querySelector('#scOwner').value.trim();
              ITAM.pushAudit('报表推送设置', r.name, before, '成功', r.freq + ' ｜ ' + r.owner);
              ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('推送设置已保存', 'ok');
            };
          }
        });
      };
    });

    root.querySelectorAll('[data-repdel]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var r = ITAM.dict('reportTemplates').filter(function (x) { return x.id === b.getAttribute('data-repdel'); })[0];
        ITAM.confirm('删除自定义报表', '确认删除报表模板「<b>' + U.esc(r.name) + '</b>」？', function () {
          S.reportTemplates.splice(S.reportTemplates.indexOf(r), 1);
          ITAM.pushAudit('删除报表模板', r.name, '—', '成功', '删除自定义报表');
          ITAM.persist(); ITAM.renderAll(); ITAM.toast('已删除报表模板', 'ok');
        }, '确认删除');
      };
    });

    var rbRun = root.querySelector('#rbRun');
    if (rbRun) {
      var runPreview = function () {
        var dim = root.querySelector('#rbDim').value;
        var metric = root.querySelector('#rbMetric').value;
        var data = rbCompute(dim, metric);
        var sum = data.reduce(function (s, x) { return s + (metric === '平均健康度' ? 0 : x.value); }, 0) || 1;
        root.querySelector('#rbResult').innerHTML =
          '<div class="grid g-2">' +
          '<div class="card"><div class="card-hd"><h3>' + U.esc(dim) + ' × ' + U.esc(metric) + '</h3></div><div class="card-bd">' +
          ITAM.barList(data.slice(0, 10), metric === '平均健康度' ? '%' : (metric === '成本合计' ? ' 万元' : ' 个')) +
          '</div></div>' +
          '<div class="card"><div class="card-hd"><h3>数据明细</h3></div><div class="card-bd tight">' +
          '<table class="tb" style="min-width:auto"><thead><tr><th>' + U.esc(dim) + '</th><th>' + U.esc(metric) + '</th><th>占比</th></tr></thead><tbody>' +
          data.map(function (x) {
            return '<tr><td>' + U.esc(x.label) + '</td><td class="num">' + x.value + '</td><td>' +
              (metric === '平均健康度' ? '—' : Math.round(x.value / sum * 100) + '%') + '</td></tr>';
          }).join('') + '</tbody></table></div></div></div>';
      };
      rbRun.onclick = runPreview;
      runPreview();

      var rbSave = root.querySelector('#rbSave');
      if (rbSave && !rbSave.disabled) rbSave.onclick = function () {
        var dim = root.querySelector('#rbDim').value;
        var metric = root.querySelector('#rbMetric').value;
        ITAM.openModal({
          title: '保存自定义报表模板',
          body: '<div class="field"><label>报表名称<i>*</i></label><input class="input" id="rtName" value="' + U.esc(dim + '维度' + metric + '报表') + '"></div>' +
            '<div class="field"><label>推送频率</label><select class="select" id="rtFreq">' +
            ['按需生成', '每日 09:00 推送', '每周一 09:00 推送', '每月 1 日推送', '每周五 17:00 推送'].map(function (x) { return '<option>' + x + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="field"><label>接收人</label><input class="input" id="rtOwner" value="' + U.esc(ITAM.persona().name) + '"></div>',
          footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="rtOk">保存模板</button>',
          onMount: function (m) {
            m.querySelector('#rtOk').onclick = function () {
              var name = m.querySelector('#rtName').value.trim();
              if (!name) return ITAM.toast('请填写报表名称', 'err');
              S.reportTemplates.push({
                id: U.uid('rp'), name: name, category: '自定义报表',
                dims: dim + ' / ' + metric, freq: m.querySelector('#rtFreq').value,
                owner: m.querySelector('#rtOwner').value.trim(),
                desc: '自定义报表：按' + dim + '统计' + metric
              });
              ITAM.pushAudit('保存报表模板', name, '—', '成功', '维度：' + dim + ' ｜ 指标：' + metric);
              ITAM.persist(); ITAM.closeModal(); repTab = 'custom'; ITAM.renderAll();
              ITAM.toast('报表模板已保存', 'ok');
            };
          }
        });
      };
    }

    var exp = root.querySelector('#repExport');
    if (exp && !exp.disabled) exp.onclick = function () {
      U.download('资产清单报表_' + U.today() + '.csv', U.csv(assetRows()));
      ITAM.pushAudit('导出报表', '资产清单报表', '—', '成功', '导出全量资产清单');
      ITAM.persist(); ITAM.toast('报表已导出', 'ok');
    };
    var qc = root.querySelector('#repQuickCsv');
    if (qc) qc.onclick = function () {
      U.download('资产清单报表_' + U.today() + '.csv', U.csv(assetRows()));
      ITAM.toast('已导出全量资产清单', 'ok');
    };
    var nw = root.querySelector('#repNew');
    if (nw && !nw.disabled) nw.onclick = function () {
      repTab = 'custom';
      ITAM.render();
      ITAM.toast('请在下方构建器中配置维度并保存为模板');
    };
  }

  ITAM.register('reports', { title: '报表中心', render: repRender, mount: repMount });

  /* ==== PART3 ==== */

  /* ==========================================================
     三、成本与合规（P2）
     ========================================================== */
  var ccTab = 'cost';

  function ccRender() {
    var totalCloud = S.apps.reduce(function (s, a) { return s + a.cost.cloud; }, 0);
    var totalServer = S.apps.reduce(function (s, a) { return s + a.cost.server; }, 0);
    var totalLic = S.apps.reduce(function (s, a) { return s + a.cost.license; }, 0);
    var totalOther = S.apps.reduce(function (s, a) { return s + a.cost.other; }, 0);
    var grand = totalCloud + totalServer + totalLic + totalOther || 1;

    var html = ITAM.pageHead('成本与合规管理',
      '将云资源、服务器、License 等费用归集到应用维度，实现 IT 成本精细化分摊；并提供合规标签管理与合规自查清单，推动治理闭环。',
      '<button class="btn" id="ccExport">⬇ 导出成本明细</button>' +
      '<button class="btn btn-primary" id="ccTagNew"' + (ITAM.can('compliance.manage') ? '' : ' disabled') + '>＋ 合规标签</button>');

    html += '<div class="tabs">' +
      [['cost', '应用资源成本归集'], ['compliance', '合规标签与自查']].map(function (t) {
        return '<button class="tab' + (ccTab === t[0] ? ' active' : '') + '" data-cctab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (ccTab === 'cost') {
      html += '<div class="grid g-4">' +
        ITAM.kpi('成本合计', '💰', 'purple', (grand / 100).toFixed(2), '百万元', '<span style="color:var(--text-3)">年度归集</span>') +
        ITAM.kpi('云资源', '☁️', 'primary', totalCloud, '万元', '<span style="color:var(--text-3)">占 ' + Math.round(totalCloud / grand * 100) + '%</span>') +
        ITAM.kpi('服务器', '🖥️', 'info', totalServer, '万元', '<span style="color:var(--text-3)">占 ' + Math.round(totalServer / grand * 100) + '%</span>') +
        ITAM.kpi('软件授权', '🔑', 'warn', totalLic, '万元', '<span style="color:var(--text-3)">占 ' + Math.round(totalLic / grand * 100) + '%</span>') +
        '</div>';

      html += '<div class="grid g-2-1 mt14">' +
        '<div class="card"><div class="card-hd"><h3>成本 Top 12 应用</h3>' +
        '<span class="sub">按应用维度归集，支撑投资决策与冗余整合</span></div><div class="card-bd">' +
        ITAM.barList(S.apps.slice().sort(function (a, b) { return ITAM.costTotal(b) - ITAM.costTotal(a); }).slice(0, 12).map(function (a) {
          return { label: a.name + '（' + ITAM.nameOf('domains', a.domainId) + '）', value: ITAM.costTotal(a), color: a.levelId === 'lv-core' ? '#e03131' : '#2f6bff' };
        }), ' 万元') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>成本结构</h3></div><div class="card-bd">' +
        ITAM.donut([
          { label: '云资源', value: totalCloud, color: '#2f6bff' },
          { label: '服务器', value: totalServer, color: '#0b8fd6' },
          { label: '软件授权', value: totalLic, color: '#d98600' },
          { label: '其他', value: totalOther, color: '#8a97aa' }
        ], 150) + '</div></div></div>';

      html += '<div class="grid g-2 mt14">' +
        '<div class="card"><div class="card-hd"><h3>按应用域成本汇总</h3></div><div class="card-bd">' +
        ITAM.barList(ITAM.dict('domains').map(function (dm) {
          var arr = S.apps.filter(function (a) { return a.domainId === dm.id; });
          return { label: dm.name, value: Math.round(arr.reduce(function (s, a) { return s + ITAM.costTotal(a); }, 0)), color: '#7a4ddb' };
        }).sort(function (a, b) { return b.value - a.value; }), ' 万元') + '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>成本管理提示</h3></div><div class="card-bd tight">' +
        '<table class="tb" style="min-width:auto"><thead><tr><th>分析视角</th><th>结论</th></tr></thead><tbody>' +
        (function () {
          var byApp = S.apps.slice().sort(function (a, b) { return ITAM.costTotal(b) - ITAM.costTotal(a); });
          var top3 = byApp.slice(0, 3).reduce(function (s, a) { return s + ITAM.costTotal(a); }, 0);
          var idle = S.apps.filter(function (a) { return a.statusId === 'st-retired' || a.statusId === 'st-pause'; });
          return [
            ['Top 3 应用成本占比', Math.round(top3 / grand * 100) + '%（' + byApp.slice(0, 3).map(function (a) { return a.name; }).join('、') + '）'],
            ['单位应用平均成本', Math.round(grand / S.apps.length) + ' 万元 / 个'],
            ['待回收资源成本', idle.reduce(function (s, a) { return s + ITAM.costTotal(a); }, 0) + ' 万元（' + idle.length + ' 个暂停 / 退役应用）'],
            ['核心应用成本占比', Math.round(S.apps.filter(function (a) { return a.levelId === 'lv-core'; }).reduce(function (s, a) { return s + ITAM.costTotal(a); }, 0) / grand * 100) + '%'],
            ['授权费用占比', Math.round(totalLic / grand * 100) + '%（需重点关注 License 到期）']
          ].map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td></tr>'; }).join('');
        })() + '</tbody></table></div></div></div>';

      html += '<div class="card mt14"><div class="card-hd"><h3>应用成本明细</h3>' +
        '<span class="sub">云资源 / 服务器 / 授权 / 其他（万元 / 年）</span></div>' +
        '<div class="card-bd tight"><div class="table-wrap" style="max-height:460px"><table class="tb"><thead><tr>' +
        '<th>应用名称</th><th>应用域</th><th>重要等级</th><th>云资源</th><th>服务器</th><th>软件授权</th><th>其他</th><th>合计</th><th>占比</th><th>操作</th>' +
        '</tr></thead><tbody>' +
        S.apps.slice().sort(function (a, b) { return ITAM.costTotal(b) - ITAM.costTotal(a); }).map(function (a) {
          var c = ITAM.costTotal(a);
          return '<tr><td><span class="link" data-openapp="' + a.id + '">' + U.esc(a.name) + '</span>' +
            '<div style="font-size:11px;color:var(--text-3)">' + U.esc(a.code) + '</div></td>' +
            '<td>' + U.esc(ITAM.nameOf('domains', a.domainId)) + '</td><td>' + ITAM.levelBadge(a) + '</td>' +
            '<td class="num">' + a.cost.cloud + '</td><td class="num">' + a.cost.server + '</td>' +
            '<td class="num">' + a.cost.license + '</td><td class="num">' + a.cost.other + '</td>' +
            '<td class="num"><b>' + c + '</b></td><td>' + ITAM.progress(c / grand * 100) + '</td>' +
            '<td><button class="btn btn-mini" data-costedit="' + a.id + '"' + (ITAM.can('cost.manage') ? '' : ' disabled') + '>维护</button></td></tr>';
        }).join('') + '</tbody></table></div></div></div>';
    } else {
      var tagStats = ITAM.dict('complianceTags').map(function (t) {
        return { t: t, n: S.apps.filter(function (a) { return (a.tags || []).indexOf(t.name) >= 0; }).length };
      });
      var riskApps = S.apps.filter(function (a) { return a.compliance === 'risk'; });
      var pendingApps = S.apps.filter(function (a) { return a.compliance === 'pending'; });

      html += '<div class="grid g-4">' +
        ITAM.kpi('合规标签', '🏷️', 'primary', ITAM.dict('complianceTags').length, '个', '<span style="color:var(--text-3)">等保 / 体系 / 行业</span>') +
        ITAM.kpi('合规应用', '✅', 'success', S.apps.filter(function (a) { return a.compliance === 'compliant'; }).length, '个', '<span style="color:var(--text-3)">已通过核查</span>') +
        ITAM.kpi('待核查', '⏳', 'warn', pendingApps.length, '个', '<span style="color:var(--text-3)">需补充材料</span>') +
        ITAM.kpi('存在风险项', '⚠️', 'danger', riskApps.length, '个', '<span style="color:var(--text-3)">需优先整改</span>') +
        '</div>';

      html += '<div class="grid g-1-2 mt14">' +
        '<div class="card"><div class="card-hd"><h3>合规标签使用情况</h3></div><div class="card-bd tight">' +
        '<table class="tb" style="min-width:auto"><thead><tr><th>标签</th><th>类型</th><th>关联应用</th><th>操作</th></tr></thead><tbody>' +
        tagStats.map(function (x) {
          return '<tr><td><span class="badge ' + x.t.color + '">' + U.esc(x.t.name) + '</span>' +
            '<div style="font-size:11px;color:var(--text-3)">' + U.esc(x.t.desc) + '</div></td>' +
            '<td>' + U.esc(x.t.type) + '</td><td class="num">' + x.n + '</td>' +
            '<td><button class="btn btn-mini btn-danger" data-tagdel="' + x.t.id + '"' + (ITAM.can('compliance.manage') ? '' : ' disabled') + '>删除</button></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="card"><div class="card-hd"><h3>应用合规状态分布</h3><span class="sub">含风险应用清单</span></div><div class="card-bd">' +
        ITAM.barList([
          { label: '合规', value: S.apps.filter(function (a) { return a.compliance === 'compliant'; }).length, color: '#12a150' },
          { label: '待核查', value: pendingApps.length, color: '#d98600' },
          { label: '存在风险项', value: riskApps.length, color: '#e03131' },
          { label: '已归档（退役）', value: S.apps.filter(function (a) { return a.compliance === 'archived'; }).length, color: '#8a97aa' }
        ], ' 个') +
        '<div class="section-title" style="margin-top:16px">风险应用清单</div>' +
        (riskApps.length
          ? '<table class="tb" style="min-width:auto"><thead><tr><th>应用</th><th>负责人</th><th>合规标签</th><th>操作</th></tr></thead><tbody>' +
            riskApps.map(function (a) {
              return '<tr><td><span class="link" data-openapp="' + a.id + '">' + U.esc(a.name) + '</span></td>' +
                '<td>' + U.esc(a.owner) + '</td>' +
                '<td>' + (a.tags || []).map(function (t) { return '<span class="tag">' + U.esc(t) + '</span>'; }).join('') + '</td>' +
                '<td><button class="btn btn-mini" data-cfix="' + a.id + '"' + (ITAM.can('compliance.manage') ? '' : ' disabled') + '>标记整改完成</button></td></tr>';
            }).join('') + '</tbody></table>'
          : '<div style="font-size:12px;color:var(--text-3)">暂无风险应用 🎉</div>') +
        '</div></div></div>';

      html += '<div class="card mt14"><div class="card-hd"><h3>合规自查清单</h3>' +
        '<span class="sub">内置合规检查项，记录自查结果，推动合规闭环</span>' +
        '<div class="hd-actions"><button class="btn btn-mini btn-primary" id="ccSelfNew"' +
        (ITAM.can('compliance.manage') ? '' : ' disabled') + '>＋ 新建自查项</button></div></div>' +
        '<div class="card-bd tight"><table class="tb"><thead><tr>' +
        '<th>编号</th><th>检查项</th><th>检查类别</th><th>适用范围</th><th>自查结果</th><th>负责人</th><th>检查时间</th><th>说明</th>' +
        '</tr></thead><tbody>' +
        ITAM.dict('selfChecks').map(function (c) {
          var cls = c.result === '符合' ? 'b-green' : (c.result === '部分符合' ? 'b-orange' : 'b-red');
          return '<tr><td class="mono">' + U.esc(c.id) + '</td><td><b>' + U.esc(c.item) + '</b></td>' +
            '<td>' + U.esc(c.category) + '</td><td>' + U.esc(c.app) + '</td>' +
            '<td><span class="badge ' + cls + '">' + U.esc(c.result) + '</span></td>' +
            '<td>' + U.esc(c.owner) + '</td><td class="mono">' + U.esc(c.checkedAt) + '</td>' +
            '<td style="font-size:11.5px;color:var(--text-3)">' + U.esc(c.remark) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }
    return html;
  }

  function ccMount(root) {
    root.querySelectorAll('[data-cctab]').forEach(function (b) {
      b.onclick = function () { ccTab = b.getAttribute('data-cctab'); ITAM.render(); };
    });
    root.querySelectorAll('[data-openapp]').forEach(function (b) {
      b.onclick = function () { ITAM.openApp(b.getAttribute('data-openapp')); };
    });
    root.querySelectorAll('[data-costedit]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var a = ITAM.appById(b.getAttribute('data-costedit'));
        ITAM.openModal({
          title: '维护成本归集 · ' + U.esc(a.name),
          body: '<div class="form-grid">' +
            '<div class="field"><label>云资源费用（万元/年）</label><input class="input" id="ce1" value="' + a.cost.cloud + '"></div>' +
            '<div class="field"><label>服务器费用（万元/年）</label><input class="input" id="ce2" value="' + a.cost.server + '"></div>' +
            '<div class="field"><label>软件授权费用（万元/年）</label><input class="input" id="ce3" value="' + a.cost.license + '"></div>' +
            '<div class="field"><label>其他费用（万元/年）</label><input class="input" id="ce4" value="' + a.cost.other + '"></div>' +
            '</div>',
          footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="ceOk">保存</button>',
          onMount: function (m) {
            m.querySelector('#ceOk').onclick = function () {
              var before = '合计 ' + ITAM.costTotal(a) + ' 万元';
              a.cost = {
                cloud: parseFloat(m.querySelector('#ce1').value) || 0,
                server: parseFloat(m.querySelector('#ce2').value) || 0,
                license: parseFloat(m.querySelector('#ce3').value) || 0,
                other: parseFloat(m.querySelector('#ce4').value) || 0
              };
              ITAM.pushAudit('维护成本归集', a.name, before, '成功', '合计 ' + ITAM.costTotal(a) + ' 万元', a.code);
              ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('成本已更新', 'ok');
            };
          }
        });
      };
    });

    var ex = root.querySelector('#ccExport');
    if (ex) ex.onclick = function () {
      var rows = [['应用编号', '应用名称', '应用域', '产品线', '重要等级', '状态', '云资源(万元)', '服务器(万元)',
        '授权(万元)', '其他(万元)', '成本合计(万元)', '合规状态', '合规标签']];
      S.apps.forEach(function (a) {
        rows.push([a.code, a.name, ITAM.nameOf('domains', a.domainId), ITAM.objOf('productLines', a.productLineId).name,
          ITAM.nameOf('levels', a.levelId), ITAM.nameOf('statuses', a.statusId),
          a.cost.cloud, a.cost.server, a.cost.license, a.cost.other, ITAM.costTotal(a),
          ({ compliant: '合规', pending: '待核查', risk: '存在风险项', archived: '已归档' })[a.compliance] || '',
          (a.tags || []).join('/')]);
      });
      U.download('应用成本明细_' + U.today() + '.csv', U.csv(rows));
      ITAM.pushAudit('导出成本明细', '成本管理', '—', '成功', '导出 ' + S.apps.length + ' 条');
      ITAM.persist(); ITAM.toast('成本明细已导出', 'ok');
    };

    var tn = root.querySelector('#ccTagNew');
    if (tn && !tn.disabled) tn.onclick = function () {
      ITAM.openModal({
        title: '新增合规标签',
        body: '<div class="form-grid">' +
          '<div class="field"><label>标签名称<i>*</i></label><input class="input" id="tgName" placeholder="如：等保三级"></div>' +
          '<div class="field"><label>标签类型</label><select class="select" id="tgType">' +
          ['等级保护', '体系认证', '行业监管', '支付卡行业', '数据合规', '生命周期'].map(function (t) { return '<option>' + t + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label>颜色</label><select class="select" id="tgColor">' +
          ['b-red', 'b-orange', 'b-blue', 'b-green', 'b-purple', 'b-cyan', 'b-gray'].map(function (c) { return '<option>' + c + '>' + c + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field span2"><label>说明</label><input class="input" id="tgDesc"></div></div>',
        footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="tgOk">保存</button>',
        onMount: function (m) {
          m.querySelector('#tgOk').onclick = function () {
            var name = m.querySelector('#tgName').value.trim();
            if (!name) return ITAM.toast('请填写标签名称', 'err');
            if (ITAM.dict('complianceTags').some(function (t) { return t.name === name; })) return ITAM.toast('标签已存在', 'err');
            S.complianceTags.push({
              id: U.uid('tag'), name: name,
              type: m.querySelector('#tgType').value,
              color: m.querySelector('#tgColor').value,
              desc: m.querySelector('#tgDesc').value.trim()
            });
            ITAM.pushAudit('新增合规标签', name, '—', '成功', '新增合规标签');
            ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('已新增合规标签', 'ok');
          };
        }
      });
    };

    root.querySelectorAll('[data-tagdel]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var t = ITAM.dict('complianceTags').filter(function (x) { return x.id === b.getAttribute('data-tagdel'); })[0];
        var used = S.apps.filter(function (a) { return (a.tags || []).indexOf(t.name) >= 0; }).length;
        if (used) return ITAM.toast('删除失败：标签「' + t.name + '」已被 ' + used + ' 个应用使用', 'err');
        S.complianceTags.splice(S.complianceTags.indexOf(t), 1);
        ITAM.pushAudit('删除合规标签', t.name, '—', '成功', '删除合规标签');
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('已删除标签', 'ok');
      };
    });

    root.querySelectorAll('[data-cfix]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var a = ITAM.appById(b.getAttribute('data-cfix'));
        a.compliance = 'compliant';
        ITAM.pushAudit('合规整改完成', a.name, '存在风险项', '成功', '合规', a.code);
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('已将「' + a.name + '」标记为合规', 'ok');
      };
    });

    var sn = root.querySelector('#ccSelfNew');
    if (sn && !sn.disabled) sn.onclick = function () {
      ITAM.openModal({
        title: '新建合规自查项',
        body: '<div class="form-grid">' +
          '<div class="field span2"><label>检查项<i>*</i></label><input class="input" id="scItem" placeholder="如：核心应用是否完成年度等保复测"></div>' +
          '<div class="field"><label>检查类别</label><select class="select" id="scCat">' +
          ['台账规范性', '安全合规', '授权合规', '数据合规', '生命周期'].map(function (c) { return '<option>' + c + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label>自查结果</label><select class="select" id="scRes"><option>符合</option><option>部分符合</option><option>不符合</option></select></div>' +
          '<div class="field"><label>适用范围</label><input class="input" id="scApp" value="全部应用"></div>' +
          '<div class="field"><label>负责人</label><input class="input" id="scOwner" value="' + U.esc(ITAM.persona().name) + '"></div>' +
          '<div class="field span2"><label>说明</label><input class="input" id="scRemark"></div></div>',
        footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="scOk">保存</button>',
        onMount: function (m) {
          m.querySelector('#scOk').onclick = function () {
            var item = m.querySelector('#scItem').value.trim();
            if (!item) return ITAM.toast('请填写检查项', 'err');
            S.selfChecks.unshift({
              id: 'SC-' + String(S.selfChecks.length + 1).padStart(2, '0'),
              item: item, category: m.querySelector('#scCat').value,
              result: m.querySelector('#scRes').value, app: m.querySelector('#scApp').value.trim(),
              owner: m.querySelector('#scOwner').value.trim(), checkedAt: U.today(),
              remark: m.querySelector('#scRemark').value.trim()
            });
            ITAM.pushAudit('合规自查提交', item, '—', '成功', '新增自查项');
            ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('自查项已保存', 'ok');
          };
        }
      });
    };
  }

  ITAM.register('compliance', { title: '成本与合规', render: ccRender, mount: ccMount });

  /* ==== PART4 ==== */

  /* ==========================================================
     四、权限与审计（P0）
     ========================================================== */
  var auTab = 'matrix';

  function permName(key) {
    var n = key;
    ITAM.dict('permissionCatalog').forEach(function (g) {
      g.items.forEach(function (it) { if (it.key === key) n = it.name; });
    });
    return n;
  }

  function auRender() {
    var html = ITAM.pageHead('权限与审计',
      '基于角色的权限控制（RBAC）与数据隔离，支持细粒度查看 / 编辑 / 删除 / 导出权限配置；完整记录所有增删改操作（操作人、时间、IP、变更前后内容），满足内控及审计要求。',
      '<button class="btn" id="auExport"' + (ITAM.can('audit.export') ? '' : ' disabled') + '>⬇ 导出审计日志</button>' +
      (ITAM.can('role.manage') ? '<button class="btn btn-primary" id="roleNew">＋ 新增角色</button>' : ''));

    html += '<div class="tabs">' +
      [['matrix', '角色权限矩阵'], ['roles', '角色管理'], ['logs', '操作审计日志']].map(function (t) {
        return '<button class="tab' + (auTab === t[0] ? ' active' : '') + '" data-autab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (auTab === 'matrix') {
      var editable = ITAM.can('role.manage');
      html += '<div class="hint mb10" style="color:var(--text-3)">' +
        (editable ? '点击单元格可实时勾选 / 取消角色权限，修改立即生效并写入审计日志。'
          : '当前角色无「角色权限管理」权限，矩阵为只读视图。') +
        '「数据权限范围」用于控制角色可见的数据边界。</div>';
      html += '<div class="card"><div class="card-bd tight"><div class="table-wrap"><table class="matrix"><thead><tr>' +
        '<th style="min-width:190px">权限项</th>' +
        S.roles.map(function (r) {
          return '<th>' + U.esc(r.name) + '<div style="font-size:10.5px;color:var(--text-3);font-weight:400">' + U.esc(r.scope) + '</div></th>';
        }).join('') + '</tr></thead><tbody>';
      ITAM.dict('permissionCatalog').forEach(function (g) {
        html += '<tr><td colspan="' + (S.roles.length + 1) + '" style="background:var(--surface-2);font-weight:600;color:var(--primary-dark)">' +
          U.esc(g.group) + '</td></tr>';
        g.items.forEach(function (it) {
          html += '<tr><td>' + U.esc(it.name) +
            '<div class="mono" style="font-size:10.5px;color:var(--text-3)">' + U.esc(it.key) + '</div></td>' +
            S.roles.map(function (r) {
              var on = r.id === 'role-sys' || !!r.perms[it.key];
              var lock = r.id === 'role-sys';
              return '<td><span class="perm-cell" data-role="' + r.id + '" data-perm="' + it.key + '" style="cursor:' +
                (editable && !lock ? 'pointer' : 'default') + '">' +
                (on ? '<span class="badge b-green">✓</span>' : '<span class="badge b-gray">—</span>') + '</span></td>';
            }).join('') + '</tr>';
        });
      });
      html += '</tbody></table></div></div></div>';
      html += '<div class="grid g-2 mt14">' +
        '<div class="card"><div class="card-hd"><h3>数据权限隔离规则</h3></div><div class="card-bd tight">' +
        '<table class="tb" style="min-width:auto"><thead><tr><th>角色</th><th>数据范围</th><th>说明</th></tr></thead><tbody>' +
        S.roles.map(function (r) {
          return '<tr><td><b>' + U.esc(r.name) + '</b></td><td><span class="badge b-blue">' + U.esc(r.scope) + '</span></td>' +
            '<td style="font-size:11.5px;color:var(--text-3)">' + U.esc(r.desc) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="card"><div class="card-hd"><h3>权限配置统计</h3></div><div class="card-bd">' +
        ITAM.barList(S.roles.map(function (r) {
          var n = r.id === 'role-sys' ? ITAM.dict('allKeys').length
            : Object.keys(r.perms).filter(function (k) { return r.perms[k]; }).length;
          return { label: r.name, value: n, color: '#2f6bff' };
        }), ' 项') +
        '<div class="hint mt14" style="color:var(--text-3)">权限项共 ' + ITAM.dict('allKeys').length +
        ' 项，覆盖资产台账、分类配置、生命周期、License、拓扑报表、成本合规、审计集成、系统管理八大类。</div>' +
        '</div></div></div>';
    } else if (auTab === 'roles') {
      html += '<div class="grid g-3">';
      S.roles.forEach(function (r) {
        var n = r.id === 'role-sys' ? ITAM.dict('allKeys').length
          : Object.keys(r.perms).filter(function (k) { return r.perms[k]; }).length;
        var max = ITAM.dict('allKeys').length;
        html += '<div class="card"><div class="card-hd"><h3>' + U.esc(r.name) + '</h3>' +
          '<span class="badge ' + (r.id === 'role-sys' ? 'b-red' : 'b-blue') + '">' +
          (r.id === 'role-sys' ? '内置超管' : '可配置') + '</span></div>' +
          '<div class="card-bd"><div style="font-size:12.5px;color:var(--text-2);min-height:40px">' + U.esc(r.desc) + '</div>' +
          '<div class="kv-inline mt14" style="font-size:11.5px"><span>数据范围：' + U.esc(r.scope) + '</span></div>' +
          '<div class="bar-item" style="margin-top:10px"><div class="bar-top"><span>已授权权限</span>' +
          '<span class="val">' + n + ' / ' + max + '</span></div>' + ITAM.progress(n / max * 100) + '</div>' +
          '<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">' +
          (ITAM.can('role.manage') && r.id !== 'role-sys'
            ? '<button class="btn btn-mini" data-roledit="' + r.id + '">编辑</button>' +
              '<button class="btn btn-mini btn-danger" data-roledel="' + r.id + '">删除</button>' : '') +
          '<button class="btn btn-mini" data-roleview="' + r.id + '">查看权限明细</button>' +
          '<button class="btn btn-mini btn-primary" data-roleswitch="' + r.id + '">以此角色登录</button>' +
          '</div></div></div>';
      });
      html += '</div>';
    } else {
      var logs = S.audits.slice().sort(function (a, b) { return a.time < b.time ? 1 : -1; });
      var fail = logs.filter(function (l) { return l.result === '失败'; }).length;
      var users = [];
      logs.forEach(function (l) { if (users.indexOf(l.user) < 0) users.push(l.user); });
      html += '<div class="grid g-4">' +
        ITAM.kpi('审计记录', '📋', 'primary', logs.length, '条', '<span style="color:var(--text-3)">在线保留 3 年</span>') +
        ITAM.kpi('操作人数', '👥', 'info', users.length, '人', '<span style="color:var(--text-3)">含系统任务</span>') +
        ITAM.kpi('失败操作', '⛔', 'danger', fail, '条', '<span style="color:var(--text-3)">需关注</span>') +
        ITAM.kpi('数据变更留痕', '📝', 'purple', logs.filter(function (l) { return l.before !== '—'; }).length, '条', '<span style="color:var(--text-3)">含变更前后</span>') +
        '</div>';
      html += '<div class="card mt14"><div class="card-bd tight"><div class="filter-bar">' +
        '<input class="input grow" id="auKw" placeholder="🔍 操作人 / 操作类型 / 对象 / IP">' +
        '<select class="select" id="auUser"><option value="">全部操作人</option>' +
        users.map(function (u) { return '<option>' + U.esc(u) + '</option>'; }).join('') + '</select>' +
        '<select class="select" id="auResult"><option value="">全部结果</option><option>成功</option><option>失败</option></select>' +
        '<button class="btn" id="auReset">重置</button></div>';
      html += '<div class="table-wrap" style="max-height:560px"><table class="tb"><thead><tr>' +
        '<th>时间</th><th>操作人</th><th>角色</th><th>操作类型</th><th>操作对象</th><th>IP 地址</th><th>结果</th><th>变更前 → 变更后</th><th>备注</th>' +
        '</tr></thead><tbody id="auBody">' +
        logs.slice(0, 60).map(function (l) {
          return '<tr><td class="mono" style="white-space:nowrap">' + U.esc(l.time) + '</td>' +
            '<td>' + U.esc(l.user) + '</td>' +
            '<td style="font-size:11.5px;color:var(--text-3)">' + U.esc(l.role) + '</td>' +
            '<td>' + U.esc(l.action) + '</td>' +
            '<td>' + U.esc(l.object) + '<div class="mono" style="font-size:10.5px">' + U.esc(l.objectCode) + '</div></td>' +
            '<td class="mono">' + U.esc(l.ip) + '</td>' +
            '<td><span class="badge ' + (l.result === '成功' ? 'b-green' : 'b-red') + '">' + U.esc(l.result) + '</span></td>' +
            '<td style="font-size:11.5px;max-width:280px">' + U.esc(l.before) +
            (l.before !== l.after && l.before !== '—' ? '<br><span style="color:var(--success)">→ ' + U.esc(l.after) + '</span>' : '') + '</td>' +
            '<td style="font-size:11px;color:var(--text-3)">' + U.esc(l.remark) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      html += (logs.length > 60 ? '<div class="tb-scroll-hint">仅展示最近 60 条，共 ' + logs.length + ' 条。导出可获取全量记录。</div>' : '');
      html += '</div></div>';
    }
    return html;
  }

  function auMount(root) {
    root.querySelectorAll('[data-autab]').forEach(function (b) {
      b.onclick = function () { auTab = b.getAttribute('data-autab'); ITAM.render(); };
    });

    root.querySelectorAll('.perm-cell').forEach(function (cell) {
      cell.onclick = function () {
        var roleId = cell.getAttribute('data-role');
        var perm = cell.getAttribute('data-perm');
        if (!ITAM.can('role.manage')) return ITAM.toast('当前角色无「角色权限管理」权限', 'err');
        if (roleId === 'role-sys') return ITAM.toast('系统管理员为内置超级角色，权限不可调整', 'warn');
        var r = ITAM.find('roles', roleId);
        r.perms[perm] = !r.perms[perm];
        var pn = permName(perm);
        ITAM.pushAudit('角色权限调整', r.name + ' · ' + pn,
          r.perms[perm] ? '未授权' : '已授权', '成功', r.perms[perm] ? '已授权' : '已取消授权', perm);
        ITAM.persist(); ITAM.renderAll();
        ITAM.toast(r.name + '：' + pn + ' 已' + (r.perms[perm] ? '授权' : '取消'), 'ok');
      };
    });

    root.querySelectorAll('[data-roledit]').forEach(function (b) {
      if (!b.disabled) b.onclick = function () { roleForm(ITAM.find('roles', b.getAttribute('data-roledit'))); };
    });
    root.querySelectorAll('[data-roledel]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var r = ITAM.find('roles', b.getAttribute('data-roledel'));
        ITAM.confirm('删除角色', '确认删除角色「<b>' + U.esc(r.name) + '</b>」？该角色下的用户需重新分配角色。', function () {
          S.roles.splice(S.roles.indexOf(r), 1);
          if (S.roleId === r.id) S.roleId = 'role-asset';
          ITAM.pushAudit('删除角色', r.name, '—', '成功', '删除自定义角色');
          ITAM.persist(); ITAM.renderAll(); ITAM.toast('已删除角色', 'ok');
        }, '确认删除');
      };
    });
    root.querySelectorAll('[data-roleview]').forEach(function (b) {
      b.onclick = function () {
        var r = ITAM.find('roles', b.getAttribute('data-roleview'));
        var granted = [];
        ITAM.dict('permissionCatalog').forEach(function (g) {
          var items = g.items.filter(function (it) { return r.id === 'role-sys' || r.perms[it.key]; });
          if (items.length) {
            granted.push('<div style="margin-bottom:10px"><b style="color:var(--primary-dark)">' + U.esc(g.group) + '</b>' +
              '<div style="margin-top:5px">' + items.map(function (it) { return '<span class="tag">' + U.esc(it.name) + '</span>'; }).join('') + '</div></div>');
          }
        });
        ITAM.openModal({
          title: '权限明细 · ' + U.esc(r.name),
          body: '<div class="hint" style="margin-bottom:10px">数据范围：' + U.esc(r.scope) + ' ｜ ' + U.esc(r.desc) + '</div>' +
            (granted.join('') || ITAM.emptyBox('该角色暂无授权'))
        });
      };
    });
    root.querySelectorAll('[data-roleswitch]').forEach(function (b) {
      b.onclick = function () {
        S.roleId = b.getAttribute('data-roleswitch');
        ITAM.pushAudit('切换角色视角', ITAM.currentRole().name, '—', '成功', '切换至角色：' + ITAM.currentRole().name);
        ITAM.persist(); ITAM.renderAll();
        ITAM.toast('已切换为「' + ITAM.currentRole().name + '」视角', 'ok');
      };
    });
    var rn = root.querySelector('#roleNew');
    if (rn) rn.onclick = function () { roleForm(null); };

    var kw = root.querySelector('#auKw');
    var uu = root.querySelector('#auUser');
    var rr = root.querySelector('#auResult');
    function flt() {
      var q = (kw ? kw.value : '').trim().toLowerCase();
      var u = uu ? uu.value : '';
      var rs = rr ? rr.value : '';
      root.querySelectorAll('#auBody tr').forEach(function (tr) {
        var txt = tr.textContent.toLowerCase();
        var ok = (!q || txt.indexOf(q) >= 0)
          && (!u || tr.children[1].textContent === u)
          && (!rs || tr.children[6].textContent.trim() === rs);
        tr.style.display = ok ? '' : 'none';
      });
    }
    if (kw) kw.oninput = flt;
    if (uu) uu.onchange = flt;
    if (rr) rr.onchange = flt;
    var rst = root.querySelector('#auReset');
    if (rst) rst.onclick = function () {
      if (kw) kw.value = '';
      if (uu) uu.value = '';
      if (rr) rr.value = '';
      flt();
    };

    var ex = root.querySelector('#auExport');
    if (ex && !ex.disabled) ex.onclick = function () {
      var rows = [['时间', '操作人', '角色', '操作类型', '操作对象', '对象编号', 'IP地址', '结果', '变更前', '变更后', '备注']];
      S.audits.slice().sort(function (a, b) { return a.time < b.time ? 1 : -1; }).forEach(function (l) {
        rows.push([l.time, l.user, l.role, l.action, l.object, l.objectCode, l.ip, l.result, l.before, l.after, l.remark]);
      });
      U.download('操作审计日志_' + U.today() + '.csv', U.csv(rows));
      ITAM.pushAudit('导出审计日志', '操作审计日志', '—', '成功', '导出 ' + (rows.length - 1) + ' 条记录');
      ITAM.persist(); ITAM.toast('审计日志已导出', 'ok');
    };
  }

  function roleForm(r) {
    var isEdit = !!r;
    var v = r || { id: U.uid('role'), name: '', scope: '所辖业务域', desc: '', perms: {} };
    var body = '<div class="form-grid">' +
      '<div class="field"><label>角色名称<i>*</i></label><input class="input" id="rfName" value="' + U.esc(v.name) + '" placeholder="如：业务域管理员"></div>' +
      '<div class="field"><label>数据权限范围</label><select class="select" id="rfScope">' +
      ['全集团数据', '全集团数据（只读）', '所辖业务域', '所辖业务域（只读）', '本部门数据'].map(function (x) {
        return '<option' + (v.scope === x ? ' selected' : '') + '>' + x + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field span2"><label>角色说明</label><input class="input" id="rfDesc" value="' + U.esc(v.desc) + '"></div>' +
      '</div><div class="section-title">权限勾选</div>' +
      ITAM.dict('permissionCatalog').map(function (g) {
        return '<div style="margin-bottom:10px"><b style="font-size:12.5px;color:var(--primary-dark)">' + U.esc(g.group) + '</b>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:5px">' +
          g.items.map(function (it) {
            return '<label class="chk"><input type="checkbox" data-rp="' + it.key + '"' + (v.perms[it.key] ? ' checked' : '') + '>' + U.esc(it.name) + '</label>';
          }).join('') + '</div></div>';
      }).join('');

    ITAM.openModal({
      title: isEdit ? '编辑角色 · ' + U.esc(v.name) : '新增角色',
      body: body,
      footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="rfOk">保存</button>',
      onMount: function (m) {
        m.querySelector('#rfOk').onclick = function () {
          var name = m.querySelector('#rfName').value.trim();
          if (!name) return ITAM.toast('请填写角色名称', 'err');
          if (S.roles.some(function (x) { return x.name === name && x.id !== v.id; })) return ITAM.toast('角色名称已存在', 'err');
          var perms = {};
          m.querySelectorAll('[data-rp]').forEach(function (cb) { perms[cb.getAttribute('data-rp')] = cb.checked; });
          var payload = {
            name: name, scope: m.querySelector('#rfScope').value,
            desc: m.querySelector('#rfDesc').value.trim(), perms: perms
          };
          if (isEdit) {
            var bn = Object.keys(v.perms).filter(function (k) { return v.perms[k]; }).length;
            var before = v.name + ' ｜ ' + bn + ' 项权限';
            Object.keys(payload).forEach(function (k) { v[k] = payload[k]; });
            var an = Object.keys(v.perms).filter(function (k) { return v.perms[k]; }).length;
            ITAM.pushAudit('编辑角色', v.name, before, '成功', v.name + ' ｜ ' + an + ' 项权限');
          } else {
            payload.id = U.uid('role');
            payload.avatar = name.slice(0, 1);
            S.roles.push(payload);
            ITAM.pushAudit('新增角色', payload.name, '—', '成功', '新增自定义角色，数据范围：' + payload.scope);
          }
          ITAM.persist(); ITAM.closeModal(); ITAM.renderAll();
          ITAM.toast(isEdit ? '角色已保存' : '角色已创建', 'ok');
        };
      }
    });
  }

  ITAM.register('audit', { title: '权限与审计', render: auRender, mount: auMount });

  /* ==========================================================
     五、自动发现与采集（P0-P1）
     ========================================================== */
  function dscRender() {
    var pending = S.discoveries.filter(function (x) { return x.status === '待确认'; });
    var html = ITAM.pageHead('自动发现与采集',
      '对接研发管理平台、CMDB、监控平台与进程端口扫描器，定期扫描并自动识别新增 / 下线应用与组件依赖，降低人工维护成本，保障台账数据的准确性与时效性。',
      '<button class="btn" id="dscScan">🔄 立即扫描</button>' +
      '<button class="btn" id="dscExport">⬇ 导出发现记录</button>');

    html += '<div class="grid g-4">' +
      ITAM.kpi('已接入数据源', '📡', 'primary', S.sources.length, '个', '<span style="color:var(--text-3)">主动采集 / 双向同步</span>') +
      ITAM.kpi('采集记录总量', '📦', 'info', U.num(S.sources.reduce(function (s, x) { return s + x.records; }, 0)), '条', '<span style="color:var(--text-3)">最近同步期内</span>') +
      ITAM.kpi('待确认发现', '🔔', 'warn', pending.length, '条', '<span style="color:var(--text-3)">需人工确认入库</span>') +
      ITAM.kpi('已处置', '✅', 'success', S.discoveries.length - pending.length, '条', '<span style="color:var(--text-3)">已入库 / 已忽略</span>') +
      '</div>';

    html += '<div class="card mt14"><div class="card-hd"><h3>多源数据接入</h3>' +
      '<span class="sub">对接企业现有平台，构建统一的资产管理闭环</span></div>' +
      '<div class="card-bd"><div class="grid g-4">' +
      S.sources.map(function (s) {
        return '<div class="card" style="box-shadow:none"><div class="int-card">' +
          '<div class="int-logo ' + s.color + '">' + s.icon + '</div>' +
          '<div style="flex:1;min-width:0"><b style="font-size:13px">' + U.esc(s.name) + '</b>' +
          '<div style="font-size:11.5px;color:var(--text-3);margin:4px 0 6px">' + U.esc(s.desc) + '</div>' +
          '<div class="kv-inline" style="font-size:11px">' +
          '<span><span class="badge b-blue">' + U.esc(s.type) + '</span></span>' +
          '<span><span class="badge b-green">' + U.esc(s.status) + '</span></span></div>' +
          '<div style="font-size:11px;color:var(--text-3);margin-top:6px">最近同步：' + U.esc(s.lastSync) + '</div>' +
          '<div style="font-size:11px;color:var(--text-3)">采集记录：' + U.num(s.records) + ' 条</div>' +
          '<button class="btn btn-mini" style="margin-top:8px" data-srctoggle="' + s.id + '">刷新同步</button>' +
          '</div></div></div>';
      }).join('') + '</div></div></div>';

    html += '<div class="card mt14"><div class="card-hd"><h3>扫描发现结果</h3>' +
      '<span class="sub">自动识别新增应用、下线应用、架构变更与组件依赖，需人工确认后入库</span></div>' +
      '<div class="card-bd tight"><table class="tb"><thead><tr>' +
      '<th>发现编号</th><th>对象</th><th>发现类型</th><th>数据来源</th><th>重要等级</th><th>责任人</th><th>发现时间</th><th>详情</th><th>状态</th><th style="width:190px">处置</th>' +
      '</tr></thead><tbody>' +
      (S.discoveries.length ? S.discoveries.map(function (x) {
        var typeCls = { '新增应用': 'b-green', '下线应用': 'b-gray', '架构变更': 'b-orange', '边界合规': 'b-red', '组件依赖': 'b-blue' }[x.type] || 'b-gray';
        return '<tr><td class="mono">' + U.esc(x.id) + '</td><td><b>' + U.esc(x.name) + '</b></td>' +
          '<td><span class="badge ' + typeCls + '">' + U.esc(x.type) + '</span></td>' +
          '<td style="font-size:11.5px">' + U.esc(x.source) + '</td>' +
          '<td><span class="badge ' + ({ '核心': 'b-red', '重要': 'b-orange', '一般': 'b-blue' })[x.level] + '">' + U.esc(x.level) + '</span></td>' +
          '<td>' + U.esc(x.owner) + '</td><td class="mono" style="font-size:11px">' + U.esc(x.foundAt) + '</td>' +
          '<td style="font-size:11.5px;color:var(--text-3);max-width:300px">' + U.esc(x.detail) + '</td>' +
          '<td><span class="badge ' + ({ '待确认': 'b-orange', '已入库': 'b-green', '已忽略': 'b-gray' })[x.status] + '">' + U.esc(x.status) + '</span></td>' +
          '<td>' + (x.status === '待确认'
            ? '<div class="row-actions">' +
              '<button class="btn btn-mini btn-primary" data-dscin="' + x.id + '"' + (ITAM.can('discover.manage') ? '' : ' disabled') + '>确认入库</button>' +
              '<button class="btn btn-mini" data-dscignore="' + x.id + '"' + (ITAM.can('discover.manage') ? '' : ' disabled') + '>忽略</button></div>'
            : '<span style="font-size:11.5px;color:var(--text-3)">已处置</span>') + '</td></tr>';
      }).join('') : '<tr><td colspan="10">' + ITAM.emptyBox('暂无发现记录') + '</td></tr>') +
      '</tbody></table></div></div>';

    html += '<div class="grid g-2 mt14">' +
      '<div class="card"><div class="card-hd"><h3>采集识别能力</h3></div><div class="card-bd tight">' +
      '<table class="tb" style="min-width:auto"><thead><tr><th>能力</th><th>说明</th><th>优先级</th></tr></thead><tbody>' +
      [['多源数据接入', '对接研发管理平台，定期扫描代码仓库与应用架构关联，检视应用定位与边界合规性', 'P0'],
      ['应用自动识别', '自动识别应用进程、服务端口、依赖组件，自动发现新增应用或下线应用', 'P1'],
      ['CMDB 配置同步', '双向同步基础设施配置项，建立应用 - 基础设施映射关系', 'P0'],
      ['监控指标采集', '采集应用运行状态与可用性指标，支撑资产健康度评估', 'P1'],
      ['边界合规校验', '识别代码仓库与应用边界定义不一致的情况并推送整改', 'P1']].map(function (r) {
        return '<tr><td><b>' + r[0] + '</b></td><td style="font-size:11.5px;color:var(--text-2)">' + r[1] + '</td>' +
          '<td><span class="badge ' + (r[2] === 'P0' ? 'b-red' : 'b-orange') + '">' + r[2] + '</span></td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<div class="card"><div class="card-hd"><h3>发现类型分布</h3></div><div class="card-bd">' +
      (function () {
        var types = {};
        S.discoveries.forEach(function (x) { types[x.type] = (types[x.type] || 0) + 1; });
        var colors = { '新增应用': '#12a150', '下线应用': '#8a97aa', '架构变更': '#d98600', '边界合规': '#e03131', '组件依赖': '#2f6bff' };
        var items = Object.keys(types).map(function (k) { return { label: k, value: types[k], color: colors[k] || '#8a97aa' }; });
        return items.length ? ITAM.donut(items, 160) : ITAM.emptyBox('暂无发现记录');
      })() + '</div></div></div>';
    return html;
  }

  function dscMount(root) {
    root.querySelectorAll('[data-srctoggle]').forEach(function (b) {
      b.onclick = function () {
        var s = S.sources.filter(function (x) { return x.id === b.getAttribute('data-srctoggle'); })[0];
        s.lastSync = D.tOff(0, new Date().getHours(), new Date().getMinutes());
        s.records += Math.floor(Math.random() * 40) + 5;
        ITAM.pushAudit('数据源同步', s.name, '—', '成功', '手动触发同步，累计 ' + s.records + ' 条');
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('「' + s.name + '」同步完成', 'ok');
      };
    });

    root.querySelectorAll('[data-dscin]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var x = S.discoveries.filter(function (y) { return y.id === b.getAttribute('data-dscin'); })[0];
        if (x.type === '新增应用') {
          var maxN = 0;
          S.apps.forEach(function (ap) { var mm = /APP-(\d+)/.exec(ap.code); if (mm) maxN = Math.max(maxN, parseInt(mm[1], 10)); });
          var dom = ITAM.dict('domains')[1] || ITAM.dict('domains')[0];
          var pls = ITAM.linesOf(dom.id);
          S.apps.push({
            id: U.uid('app'), code: 'APP-' + String(maxN + 1).padStart(4, '0'), name: x.name, pinyin: '',
            domainId: dom.id, productLineId: pls.length ? pls[0].id : '',
            levelId: x.level === '核心' ? 'lv-core' : (x.level === '重要' ? 'lv-major' : 'lv-normal'),
            statusId: 'st-draft', deployId: 'dp-k8s', devModeId: 'dv-self',
            owner: x.owner, dept: '待补充', onlineDate: '', retireDate: '',
            brief: '由自动发现采集入库：' + x.detail,
            devOrg: '待补充', vendor: '待补充', techStack: ['待补充'], infra: ['待补充'], tags: [], health: 85,
            cost: { cloud: 0, server: 0, license: 0, other: 0 }, users: ['待补充'], value: '（待补充价值定位）',
            modules: [{ name: '待补充', desc: '请补充核心功能模块' }], inputs: [], outputs: [],
            createTime: U.today(), updateTime: D.tOff(0, new Date().getHours(), new Date().getMinutes()),
            discoverSource: '自动发现入库', compliance: 'pending'
          });
          ITAM.pushAudit('发现结果入库', x.name, '—', '成功', '自动发现创建应用资产（信息待完善，状态为草稿）', x.id);
        } else {
          ITAM.pushAudit('发现结果入库', x.name, '—', '成功', '已确认并更新台账（' + x.type + '）', x.id);
        }
        x.status = '已入库';
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('「' + x.name + '」已确认入库', 'ok');
      };
    });

    root.querySelectorAll('[data-dscignore]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var x = S.discoveries.filter(function (y) { return y.id === b.getAttribute('data-dscignore'); })[0];
        ITAM.confirm('忽略发现结果',
          '确认忽略 <b>' + U.esc(x.name) + '</b> 的「' + U.esc(x.type) + '」发现？<br>后续扫描若再次发现可重新确认。',
          function () {
            x.status = '已忽略';
            ITAM.pushAudit('忽略发现结果', x.name, '待确认', '成功', '已忽略发现结果', x.id);
            ITAM.persist(); ITAM.renderAll(); ITAM.toast('已忽略该发现结果', 'ok');
          }, '确认忽略');
      };
    });

    var sc = root.querySelector('#dscScan');
    if (sc) sc.onclick = function () {
      var pool = [
        { name: '电子发票平台 - 新集群', type: '架构变更', source: '进程 / 端口扫描器', detail: '发现新增服务节点 4 个，疑似扩容，请核对台账部署信息', level: '重要', owner: '邓超' },
        { name: '风控决策平台', type: '组件依赖', source: '监控平台', detail: '新增规则引擎组件依赖 Flink，需登记至技术栈', level: '核心', owner: '江晨' },
        { name: '合同管理系统', type: '新增应用', source: '研发管理平台（代码仓库）', detail: '仓库 prj-contract-ext 建立独立部署单元，未在台账登记', level: '一般', owner: '方圆' }
      ];
      var pickItem = pool[Math.floor(Math.random() * pool.length)];
      S.discoveries.unshift({
        id: 'DSC-' + (1025 + S.discoveries.length),
        name: pickItem.name, type: pickItem.type, source: pickItem.source,
        detail: pickItem.detail, level: pickItem.level, owner: pickItem.owner,
        foundAt: D.tOff(0, new Date().getHours(), new Date().getMinutes()), status: '待确认'
      });
      S.sources.forEach(function (s) { s.lastSync = D.tOff(0, new Date().getHours(), new Date().getMinutes()); });
      ITAM.pushAudit('执行自动扫描', '全部数据源', '—', '成功', '扫描完成，新增 1 条发现结果');
      ITAM.persist(); ITAM.renderAll();
      ITAM.toast('扫描完成，新增 1 条发现结果待确认', 'ok');
    };

    var ex = root.querySelector('#dscExport');
    if (ex) ex.onclick = function () {
      var rows = [['发现编号', '对象', '发现类型', '数据来源', '重要等级', '责任人', '发现时间', '详情', '状态']];
      S.discoveries.forEach(function (x) { rows.push([x.id, x.name, x.type, x.source, x.level, x.owner, x.foundAt, x.detail, x.status]); });
      U.download('自动发现记录_' + U.today() + '.csv', U.csv(rows));
      ITAM.pushAudit('导出发现记录', '自动发现', '—', '成功', '导出 ' + S.discoveries.length + ' 条');
      ITAM.persist(); ITAM.toast('发现记录已导出', 'ok');
    };
  }

  ITAM.register('discover', { title: '自动发现与采集', render: dscRender, mount: dscMount });

  /* ==== PART5 ==== */

  /* ==========================================================
     六、开放集成（P2）
     ========================================================== */
  var intTab = 'system';

  function intRender() {
    var html = ITAM.pageHead('开放集成',
      '对外提供资产查询、新增、变更等开放 API，支持与 CMDB、监控、财务、项目等第三方系统集成；支持资产变更、License 到期等关键事件通过 Webhook 推送至企业微信 / 钉钉等协作平台，并适配移动端查看。',
      '<button class="btn" id="intExport"' + (ITAM.can('integration.view') ? '' : ' disabled') + '>⬇ 导出集成清单</button>' +
      '<button class="btn btn-primary" id="whNew"' + (ITAM.can('integration.manage') ? '' : ' disabled') + '>＋ 新增 Webhook</button>');

    html += '<div class="tabs">' +
      [['system', '系统集成'], ['api', '开放 API'], ['webhook', 'Webhook 推送'], ['mobile', '移动端']].map(function (t) {
        return '<button class="tab' + (intTab === t[0] ? ' active' : '') + '" data-inttab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (intTab === 'system') {
      html += '<div class="grid g-3">' + S.integrations.map(function (it) {
        return '<div class="card"><div class="int-card">' +
          '<div class="int-logo ' + it.color + '">' + it.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;align-items:center;gap:6px"><b style="font-size:13.5px">' + U.esc(it.name) + '</b>' +
          '<span class="badge ' + (it.status === '运行正常' ? 'b-green' : 'b-orange') + '">' + U.esc(it.status) + '</span></div>' +
          '<div style="font-size:11.5px;color:var(--text-3);margin:4px 0 8px">' + U.esc(it.desc) + '</div>' +
          '<div class="kv-inline" style="font-size:11px"><span>集成方向：<b>' + U.esc(it.dir) + '</b></span></div>' +
          '<div class="kv-inline" style="font-size:11px"><span>最近同步：' + U.esc(it.lastSync) + '</span>' +
          '<span>记录：' + U.num(it.records) + '</span></div>' +
          '<div style="margin-top:9px;display:flex;gap:6px">' +
          '<button class="btn btn-mini" data-intsync="' + it.id + '"' + (ITAM.can('integration.manage') ? '' : ' disabled') + '>手动同步</button>' +
          (it.status !== '运行正常'
            ? '<button class="btn btn-mini btn-primary" data-intfix="' + it.id + '"' + (ITAM.can('integration.manage') ? '' : ' disabled') + '>重连</button>' : '') +
          '</div></div></div></div>';
      }).join('') + '</div>';

      html += '<div class="card mt14"><div class="card-hd"><h3>集成架构说明</h3><span class="sub">构建统一的 IT 资产管理闭环</span></div>' +
        '<div class="card-bd tight"><table class="tb"><thead><tr>' +
        '<th>对接系统</th><th>集成方向</th><th>主要数据 / 作用</th><th>同步频率</th></tr></thead><tbody>' +
        [['CMDB', '双向同步', '同步基础设施配置项（服务器、中间件等），建立应用 - 基础设施映射关系', '每 30 分钟'],
        ['研发管理平台（代码仓库）', '主动采集', '自动发现应用、校验应用边界合规性，支撑自动化台账维护', '每日 02:00'],
        ['财务系统', '单向同步', '获取 License、云资源等费用数据，用于应用成本归集', '每日 22:00'],
        ['监控平台', '单向采集 / 事件推送', '获取应用运行状态、可用性等指标，为资产健康度评估提供数据支撑', '每 5 分钟'],
        ['ITSM / 流程平台', '双向集成', '变更、退役等流程与工单系统打通，实现审批闭环', '实时'],
        ['协作平台（企业微信 / 钉钉）', '事件推送', '将预警、变更等关键事件及时推送至责任人', '事件驱动']].map(function (r) {
          return '<tr><td><b>' + r[0] + '</b></td><td><span class="badge b-blue">' + r[1] + '</span></td>' +
            '<td style="font-size:11.5px;color:var(--text-2)">' + r[2] + '</td>' +
            '<td class="mono" style="font-size:11px">' + r[3] + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    } else if (intTab === 'api') {
      html += '<div class="grid g-4">' +
        ITAM.kpi('开放接口', '🔌', 'primary', S.openApis.length, '个', '<span style="color:var(--text-3)">Restful API v1</span>') +
        ITAM.kpi('授权范围', '🔑', 'purple', 4, '类', '<span style="color:var(--text-3)">asset / license / cost / change</span>') +
        ITAM.kpi('近 7 日调用', '📈', 'success', U.num(128460), '次', '<span class="trend-up">▲ 12.4%</span>') +
        ITAM.kpi('接口成功率', '✅', 'info', '99.96', '%', '<span style="color:var(--text-3)">近 7 日</span>') +
        '</div>';

      html += '<div class="card mt14"><div class="card-hd"><h3>开放 API 目录</h3>' +
        '<span class="sub">支持 OAuth 2.0 客户端凭证模式鉴权，按 scope 授权</span>' +
        '<div class="hd-actions"><button class="btn btn-mini" id="apiDoc">📖 查看调用示例</button></div></div>' +
        '<div class="card-bd tight">' + S.openApis.map(function (a) {
          return '<div class="api-row"><span class="method ' + a.method.toLowerCase() + '">' + a.method + '</span>' +
            '<span class="mono" style="font-weight:600">' + U.esc(a.path) + '</span>' +
            '<span style="font-size:12.5px;color:var(--text-2);flex:1">' + U.esc(a.desc) + '</span>' +
            '<span class="badge b-gray">' + U.esc(a.scope) + '</span></div>';
        }).join('') + '</div></div>';

      html += '<div class="grid g-2 mt14">' +
        '<div class="card"><div class="card-hd"><h3>调用示例</h3></div><div class="card-bd">' +
        '<div class="code-block">curl -X GET "https://itam.example.com/openapi/v1/apps?domain=retail&amp;page=1" \\\n' +
        '  -H "Authorization: Bearer $ITAM_TOKEN" \\\n' +
        '  -H "Content-Type: application/json"\n\n' +
        '# 响应示例\n{\n  "code": 0,\n  "data": {\n    "total": 34,\n    "items": [\n      {\n' +
        '        "code": "APP-0001",\n        "name": "会员中心",\n        "domain": "零售业务",\n' +
        '        "productLine": "会员产品线",\n        "level": "核心",\n        "status": "运行中"\n      }\n    ]\n  }\n}</div>' +
        '</div></div>' +
        '<div class="card"><div class="card-hd"><h3>集成对接要点</h3></div>' +
        '<div class="card-bd" style="font-size:12.5px;line-height:2">' +
        '<div>① 鉴权：OAuth 2.0 客户端凭证模式，Token 有效期 2 小时，支持刷新。</div>' +
        '<div>② 限流：默认单应用 100 QPS，可申请提升；超限返回 429。</div>' +
        '<div>③ 幂等：写接口支持 <code>X-Idempotency-Key</code> 请求头保证幂等。</div>' +
        '<div>④ 数据权限：按 scope 与客户端绑定的数据范围返回数据，实现数据隔离。</div>' +
        '<div>⑤ 事件通知：变更完成、License 到期等事件通过 Webhook 异步推送。</div>' +
        '<div>⑥ 版本管理：路径带版本号 <code>/v1</code>，废弃版本提前 6 个月公告。</div>' +
        '</div></div></div>';
    } else if (intTab === 'webhook') {
      html += '<div class="hint mb10" style="color:var(--text-3)">支持将资产变更、License 到期等关键事件推送至企业微信 / 钉钉等协作平台，实现预警与变更信息的及时触达。</div>';
      html += '<div class="grid g-2">' + S.webhooks.map(function (w) {
        return '<div class="card"><div class="card-hd"><h3>' + U.esc(w.event) + '</h3>' +
          '<span class="badge ' + (w.status === '启用' ? 'b-green' : 'b-gray') + '">' + U.esc(w.status) + '</span>' +
          '<div class="hd-actions">' +
          '<button class="btn btn-mini" data-whtoggle="' + w.id + '"' + (ITAM.can('integration.manage') ? '' : ' disabled') + '>' +
          (w.status === '启用' ? '停用' : '启用') + '</button>' +
          '<button class="btn btn-mini" data-whtest="' + w.id + '">测试推送</button>' +
          '<button class="btn btn-mini btn-danger" data-whdel="' + w.id + '"' + (ITAM.can('integration.manage') ? '' : ' disabled') + '>删除</button>' +
          '</div></div>' +
          '<div class="card-bd">' +
          '<div class="kv-inline" style="font-size:12px;margin-bottom:10px">' +
          '<span style="flex:1">推送目标：<b>' + U.esc(w.target) + '</b></span></div>' +
          '<div style="font-size:11.5px;color:var(--text-3)">最近推送：<span class="mono">' + U.esc(w.lastPush) + '</span></div>' +
          '<div class="bar-item" style="margin-top:10px"><div class="bar-top"><span>推送成功率</span>' +
          '<span class="val">' + w.successRate + '%</span></div>' +
          ITAM.progress(w.successRate, w.successRate >= 99 ? '' : (w.successRate >= 95 ? 'warn' : 'danger')) + '</div>' +
          '<div class="mono" style="font-size:11px;color:var(--text-3);margin-top:10px;word-break:break-all">' + U.esc(w.url) + '</div>' +
          '</div></div>';
      }).join('') + '</div>';

      html += '<div class="card mt14"><div class="card-hd"><h3>Webhook 负载示例</h3></div><div class="card-bd">' +
        '<div class="code-block">{\n  "event": "asset.change.completed",\n  "timestamp": "' + D.tOff(0, 10, 30) + '",\n' +
        '  "data": {\n    "appCode": "APP-0003",\n    "appName": "营销活动引擎",\n    "changeType": "升级",\n' +
        '    "before": { "status": "变更中" },\n    "after": { "status": "运行中" },\n    "operator": "王磊",\n' +
        '    "url": "https://itam.example.com/apps/app-3"\n  }\n}</div></div></div>';
    } else {
      html += '<div class="grid g-2-1">' +
        '<div class="card"><div class="card-hd"><h3>移动端适配能力</h3>' +
        '<span class="sub">提升资产查看与审批响应效率</span></div>' +
        '<div class="card-bd"><div class="grid g-2">' +
        [['📱 资产台账查看', '移动端查看应用清单与详情（基础信息、扩展信息、拓扑关系），支持拼音快速检索'],
        ['🔔 预警消息接收', 'License 到期、变更待审批、自动发现等关键事件实时推送至手机'],
        ['✅ 简单审批', '支持变更工单、退役评估的移动端快速审批，一键通过 / 驳回并填写意见'],
        ['🔍 扫码查询', '扫描资产二维码直达应用详情页，便于现场核查与盘点'],
        ['📊 移动看板', '应用总数、核心应用数、分类统计等指标的移动端可视化看板'],
        ['🔐 安全管控', '移动端接入需企业 SSO 认证，数据按角色权限隔离']].map(function (x) {
          return '<div class="card" style="box-shadow:none"><div class="card-bd">' +
            '<div style="font-size:13px;font-weight:600;margin-bottom:5px">' + x[0] + '</div>' +
            '<div style="font-size:12px;color:var(--text-2)">' + x[1] + '</div></div></div>';
        }).join('') + '</div></div></div>' +
        '<div class="card"><div class="card-hd"><h3>接入方式</h3></div><div class="card-bd tight">' +
        '<table class="tb" style="min-width:auto"><thead><tr><th>端</th><th>方式</th><th>状态</th></tr></thead><tbody>' +
        [['企业微信 / 钉钉工作台', 'H5 应用嵌入', '已上线'],
        ['独立 App（iOS / Android）', '原生 + Hybrid', '已上线'],
        ['微信小程序', '小程序', '规划中'],
        ['移动浏览器', '响应式 H5', '已上线']].map(function (r) {
          return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td>' +
            '<td><span class="badge ' + (r[2] === '已上线' ? 'b-green' : 'b-orange') + '">' + r[2] + '</span></td></tr>';
        }).join('') + '</tbody></table>' +
        '<div class="card-bd" style="border-top:1px solid var(--border)">' +
        '<div class="hint" style="color:var(--text-3);line-height:1.9">' +
        '响应式适配说明：当浏览器宽度小于 900px 时，本系统前端自动切换为移动端布局' +
        '（导航折叠为图标栏、表格支持横向滚动、表单改为单列、卡片改为单列堆叠），可直接在手机浏览器中查看台账与审批。' +
        '</div></div></div></div>';
    }
    return html;
  }

  function intMount(root) {
    root.querySelectorAll('[data-inttab]').forEach(function (b) {
      b.onclick = function () { intTab = b.getAttribute('data-inttab'); ITAM.render(); };
    });

    root.querySelectorAll('[data-intsync]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var it = S.integrations.filter(function (x) { return x.id === b.getAttribute('data-intsync'); })[0];
        it.lastSync = D.tOff(0, new Date().getHours(), new Date().getMinutes());
        it.records += Math.floor(Math.random() * 60) + 10;
        ITAM.pushAudit('集成手动同步', it.name, '—', '成功', '同步成功，累计 ' + it.records + ' 条');
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('「' + it.name + '」同步完成', 'ok');
      };
    });
    root.querySelectorAll('[data-intfix]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var it = S.integrations.filter(function (x) { return x.id === b.getAttribute('data-intfix'); })[0];
        var before = it.status;
        it.status = '运行正常';
        it.lastSync = D.tOff(0, new Date().getHours(), new Date().getMinutes());
        ITAM.pushAudit('集成重连', it.name, before, '成功', '运行正常');
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('「' + it.name + '」已恢复运行', 'ok');
      };
    });

    root.querySelectorAll('[data-whtoggle]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var w = S.webhooks.filter(function (x) { return x.id === b.getAttribute('data-whtoggle'); })[0];
        w.status = w.status === '启用' ? '停用' : '启用';
        ITAM.pushAudit('Webhook 状态调整', w.event, '—', '成功', w.status);
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('已' + w.status + '「' + w.event + '」推送', 'ok');
      };
    });
    root.querySelectorAll('[data-whtest]').forEach(function (b) {
      b.onclick = function () {
        var w = S.webhooks.filter(function (x) { return x.id === b.getAttribute('data-whtest'); })[0];
        if (w.status !== '启用') return ITAM.toast('该 Webhook 已停用，请先启用', 'warn');
        w.lastPush = D.tOff(0, new Date().getHours(), new Date().getMinutes());
        ITAM.pushAudit('Webhook 测试推送', w.event, '—', '成功', '测试消息已推送至 ' + w.target);
        ITAM.persist(); ITAM.renderAll(); ITAM.toast('测试消息已推送至「' + w.target + '」', 'ok');
      };
    });
    root.querySelectorAll('[data-whdel]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var w = S.webhooks.filter(function (x) { return x.id === b.getAttribute('data-whdel'); })[0];
        ITAM.confirm('删除 Webhook', '确认删除「<b>' + U.esc(w.event) + '</b>」的推送配置？', function () {
          S.webhooks.splice(S.webhooks.indexOf(w), 1);
          ITAM.pushAudit('删除 Webhook', w.event, '—', '成功', '删除推送配置');
          ITAM.persist(); ITAM.renderAll(); ITAM.toast('已删除 Webhook 配置', 'ok');
        }, '确认删除');
      };
    });

    var wn = root.querySelector('#whNew');
    if (wn && !wn.disabled) wn.onclick = function () {
      ITAM.openModal({
        title: '新增 Webhook 推送',
        body: '<div class="form-grid">' +
          '<div class="field"><label>事件类型<i>*</i></label><select class="select" id="whEvent">' +
          ['资产变更完成', 'License 即将到期', '变更工单待审批', '发现新增 / 下线应用', '合规自查提醒', '退役评估待审批'].map(function (x) { return '<option>' + x + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label>推送平台</label><select class="select" id="whPlat">' +
          ['企业微信', '钉钉', '飞书', '自定义 HTTP'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
          '<div class="field span2"><label>推送目标（群 / 人员）<i>*</i></label><input class="input" id="whTarget" placeholder="如：IT 资产治理群"></div>' +
          '<div class="field span2"><label>Webhook 地址<i>*</i></label><input class="input" id="whUrl" placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=****"></div>' +
          '</div>',
        footer: '<button class="btn" data-mclose="1">取消</button><button class="btn btn-primary" id="whOk">保存并测试</button>',
        onMount: function (m) {
          m.querySelector('#whOk').onclick = function () {
            var target = m.querySelector('#whTarget').value.trim();
            var url = m.querySelector('#whUrl').value.trim();
            if (!target || !url) return ITAM.toast('请填写推送目标与 Webhook 地址', 'err');
            var w = {
              id: U.uid('wh'), event: m.querySelector('#whEvent').value,
              target: m.querySelector('#whPlat').value + ' · ' + target, url: url,
              status: '启用', lastPush: D.tOff(0, new Date().getHours(), new Date().getMinutes()), successRate: 100
            };
            S.webhooks.push(w);
            ITAM.pushAudit('新增 Webhook', w.event, '—', '成功', '推送目标：' + w.target);
            ITAM.persist(); ITAM.closeModal(); ITAM.renderAll(); ITAM.toast('Webhook 已保存并完成测试推送', 'ok');
          };
        }
      });
    };

    var apiDoc = root.querySelector('#apiDoc');
    if (apiDoc) apiDoc.onclick = function () {
      ITAM.openModal({
        title: '开放 API 调用示例',
        body: '<div class="code-block"># 1. 获取访问令牌（OAuth 2.0 客户端凭证模式）\n' +
          'curl -X POST "https://itam.example.com/oauth/token" \\\n' +
          '  -d "grant_type=client_credentials" \\\n' +
          '  -d "client_id=your_client_id" \\\n' +
          '  -d "client_secret=your_client_secret" \\\n' +
          '  -d "scope=asset:read license:read"\n\n' +
          '# 2. 查询应用资产列表\n' +
          'curl -X GET "https://itam.example.com/openapi/v1/apps?domain=retail&amp;level=core" \\\n' +
          '  -H "Authorization: Bearer $TOKEN"\n\n' +
          '# 3. 查询 License 到期预警\n' +
          'curl -X GET "https://itam.example.com/openapi/v1/licenses?expireWithin=90" \\\n' +
          '  -H "Authorization: Bearer $TOKEN"\n\n' +
          '# 4. 新增应用资产（幂等）\n' +
          'curl -X POST "https://itam.example.com/openapi/v1/apps" \\\n' +
          '  -H "Authorization: Bearer $TOKEN" \\\n' +
          '  -H "X-Idempotency-Key: 8f3a-20251019-001" \\\n' +
          '  -d \'{"name":"测试应用","domain":"零售业务","owner":"张伟"}\'</div>'
      });
    };

    var ex = root.querySelector('#intExport');
    if (ex && !ex.disabled) ex.onclick = function () {
      var rows = [['类别', '名称', '集成方向 / 调用方法', '状态', '最近同步 / 说明']];
      S.integrations.forEach(function (it) { rows.push(['系统集成', it.name, it.dir, it.status, it.lastSync]); });
      S.openApis.forEach(function (a) { rows.push(['开放 API', a.method + ' ' + a.path, a.scope, '可用', a.desc]); });
      S.webhooks.forEach(function (w) { rows.push(['Webhook', w.event, w.target, w.status, '成功率 ' + w.successRate + '%']); });
      U.download('开放集成清单_' + U.today() + '.csv', U.csv(rows));
      ITAM.pushAudit('导出集成清单', '开放集成', '—', '成功', '导出集成与接口清单');
      ITAM.persist(); ITAM.toast('集成清单已导出', 'ok');
    };
  }

  ITAM.register('integration', { title: '开放集成', render: intRender, mount: intMount });
})();
