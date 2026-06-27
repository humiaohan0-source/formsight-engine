const fs = require("fs");
const path = require("path");
const { simulate } = require("./engine");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function pct(value, max = 10) {
  return clamp((Number(value || 0) / max) * 100);
}

function topItems(items = [], count = 6) {
  return [...items].sort((a, b) => Number(b.score || b.weight || 0) - Number(a.score || a.weight || 0)).slice(0, count);
}

function branchColor(id) {
  return {
    inertia: "#a45f43",
    intervention: "#22736b",
    rupture: "#7b3f63"
  }[id] || "#b38a35";
}

function branchName(id) {
  return {
    inertia: "默认人生线",
    intervention: "隐秘转向线",
    rupture: "断裂重启线"
  }[id] || id;
}

function agentLabel(report, id) {
  const agent = [...(report.dominant_agents || []), ...(report.external_agents || [])].find((item) => item.id === id);
  return agent?.name || id;
}

function conditionLabel(report, key, value) {
  const labels = {
    life_mobility: "人生机动性",
    external_pressure: "外部压力",
    support_capacity: "支持容量",
    energy_risk: "能量风险",
    financial_runway: "资产缓冲",
    role_load: "角色负载"
  };
  if (key.endsWith("_gte")) return `${labels[key.replace("_gte", "")] || key.replace("_gte", "")} >= ${value}`;
  if (key.endsWith("_lte")) return `${labels[key.replace("_lte", "")] || key.replace("_lte", "")} <= ${value}`;
  return `${labels[key] || key}: ${value}`;
}

function trimLabel(value, max = 18) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function couplingInputs(report, item) {
  const conditions = item.if || {};
  const agentInputs = [
    ...(conditions.inner_agents_all || []),
    ...(conditions.inner_agents_any || []),
    ...(conditions.external_agents_all || []),
    ...(conditions.external_agents_any || [])
  ].map((id) => agentLabel(report, id));
  const patternInputs = [
    ...(conditions.patterns_all || []),
    ...(conditions.patterns_any || [])
  ].map((id) => `模式: ${id}`);
  const scoreInputs = Object.entries(conditions.world_scores || {}).map(([key, value]) => conditionLabel(report, key, value));
  const symbolicInputs = [
    ...(conditions.symbolic_all || []),
    ...(conditions.symbolic_any || [])
  ].map((id) => `象征: ${id}`);

  return [...agentInputs, ...patternInputs, ...symbolicInputs, ...scoreInputs];
}

function couplingBranches(item) {
  if (item.branch_effects) {
    return Object.keys(item.branch_effects);
  }
  if (item.effect?.branch) {
    return [item.effect.branch];
  }
  return [];
}

function renderPipeline(report) {
  const steps = [
    ["Seed", "用户材料", report.material_quality?.score || 0],
    ["Graph", "人生图谱", Object.keys(report.life_graph || {}).length * 10],
    ["Agents", "内外 Agent", (report.dominant_agents.length + report.external_agents.length) * 8],
    ["Coupling", "耦合规则", (report.couplings.length + report.advanced_couplings.length) * 18],
    ["Rounds", "多轮演化", report.deep_simulation?.rounds?.length * 16 || 0],
    ["Archive", "命运档案", report.calibration?.summary?.evidence_score || 0]
  ];

  return `<section class="panel pipeline">
    <h2>Simulation Pipeline</h2>
    <div class="pipe-row">
      ${steps.map(([label, text, score], index) => `<div class="pipe-step">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(text)}</strong>
        <i style="height:${pct(score, 100)}%"></i>
      </div>${index < steps.length - 1 ? `<b class="arrow">→</b>` : ""}`).join("")}
    </div>
  </section>`;
}

function renderAgentField(report) {
  const agents = [
    ...topItems(report.dominant_agents, 4).map((agent) => ({ ...agent, type: "inner" })),
    ...topItems(report.external_agents, 5).map((agent) => ({ ...agent, type: "external" }))
  ];
  const centerX = 360;
  const centerY = 250;
  const radius = 170;
  const nodes = agents.map((agent, index) => {
    const angle = (Math.PI * 2 * index) / agents.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const size = 18 + Number(agent.score || 1) * 2.4;
    const color = agent.type === "inner" ? "#22736b" : "#a45f43";

    return { ...agent, x, y, size, color };
  });

  return `<section class="panel">
    <h2>Agent Field</h2>
    <svg class="agent-map" viewBox="0 0 720 520" role="img" aria-label="agent field">
      <defs>
        <radialGradient id="coreGlow">
          <stop offset="0%" stop-color="#f6e7c3" stop-opacity="1" />
          <stop offset="100%" stop-color="#f6e7c3" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="${centerX}" cy="${centerY}" r="92" fill="url(#coreGlow)" />
      <circle cx="${centerX}" cy="${centerY}" r="54" fill="#fffaf0" stroke="#b38a35" stroke-width="2" />
      <text x="${centerX}" y="${centerY - 6}" text-anchor="middle" class="svg-title">FormSight</text>
      <text x="${centerX}" y="${centerY + 18}" text-anchor="middle" class="svg-small">Life Core</text>
      ${nodes.map((node) => `<line x1="${centerX}" y1="${centerY}" x2="${node.x}" y2="${node.y}" stroke="${node.color}" stroke-opacity=".26" stroke-width="${Math.max(1, Number(node.score || 1) / 2)}" />`).join("")}
      ${nodes.map((node) => `<g>
        <circle cx="${node.x}" cy="${node.y}" r="${node.size}" fill="${node.color}" fill-opacity=".88" />
        <circle cx="${node.x}" cy="${node.y}" r="${node.size + 7}" fill="none" stroke="${node.color}" stroke-opacity=".18" stroke-width="8" />
        <text x="${node.x}" y="${node.y + node.size + 24}" text-anchor="middle" class="svg-label">${escapeHtml(node.name)}</text>
      </g>`).join("")}
    </svg>
  </section>`;
}

function renderBranchPressure(report) {
  const branches = report.branches || [];
  const max = Math.max(...branches.map((branch) => Number(branch.weight || 0)), 1);

  return `<section class="panel">
    <h2>Branch Pressure</h2>
    <div class="branch-bars">
      ${branches.map((branch) => `<div class="branch-row">
        <div>
          <strong>${escapeHtml(branch.cinematic_name || branchName(branch.id))}</strong>
          <span>${escapeHtml(branch.shareable_sentence || branch.premise)}</span>
        </div>
        <b>${escapeHtml(Number(branch.weight || 0).toFixed(1))}</b>
        <i><em style="width:${pct(branch.weight, max)}%; background:${branchColor(branch.id)}"></em></i>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderTimeline(report) {
  const scenes = (report.branches || []).flatMap((branch) => {
    return (branch.future_scenes || []).map((scene) => ({
      branch: branch.id,
      name: branch.cinematic_name || branchName(branch.id),
      ...scene
    }));
  });

  return `<section class="panel wide">
    <h2>Parallel Life Scenes</h2>
    <div class="scene-grid">
      ${scenes.map((scene) => `<article style="border-color:${branchColor(scene.branch)}">
        <span>${escapeHtml(scene.horizon)}</span>
        <h3>${escapeHtml(scene.name)}</h3>
        <p>${escapeHtml(scene.text)}</p>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderMemory(report) {
  const memory = report.deep_simulation?.final_agent_memory || [];

  return `<section class="panel">
    <h2>Agent Memory</h2>
    <div class="memory-list">
      ${memory.slice(0, 8).map((item) => `<div class="memory-item">
        <strong>${escapeHtml(item.agent_name)}</strong>
        <span>${escapeHtml(item.theme)}</span>
        <p>${escapeHtml(item.last_observation)}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderCouplingMap(report) {
  const couplings = [...(report.symbolic_couplings || []), ...(report.advanced_couplings || []), ...(report.couplings || [])].slice(0, 8);

  return `<section class="panel">
    <h2>Coupling Hits</h2>
    <div class="coupling-list">
      ${couplings.map((item) => `<div>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.interpretation || item.effect?.interpretation || "")}</p>
      </div>`).join("") || `<div><strong>No coupling hit</strong><p>当前样本没有命中可视化耦合。</p></div>`}
    </div>
  </section>`;
}

function renderSymbolicSignalBoard(report) {
  const signals = report.symbolic_signals?.signals || [];
  if (!signals.length) return "";

  return `<section class="panel wide">
    <h2>Symbolic Signals</h2>
    <p class="viz-note">这些是名字、地点、宠物、疾病记忆、延毕、被骗举报、赛博日记等弱信号。它们不是决定命运的因果，而是会通过身份叙事、情绪记忆和现实提醒持续改变分支压力。</p>
    <div class="symbol-grid">
      ${signals.map((signal) => `<article>
        <strong>${escapeHtml(signal.name)}</strong>
        <span>${escapeHtml(signal.confidence)}</span>
        <p>${escapeHtml(signal.life_effect)}</p>
        <i>${escapeHtml(JSON.stringify(signal.branch_effect || {}))}</i>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderCouplingNetwork(report) {
  const couplings = [...(report.symbolic_couplings || []), ...(report.advanced_couplings || []), ...(report.couplings || [])].slice(0, 7);
  const inputLabels = [...new Set(couplings.flatMap((item) => couplingInputs(report, item)))].slice(0, 12);
  const inputNodes = inputLabels.map((label, index) => ({
    id: `input_${index}`,
    label,
    x: 120,
    y: 80 + index * 40
  }));
  const couplingNodes = couplings.map((item, index) => ({
    id: item.id || `coupling_${index}`,
    label: item.name,
    item,
    x: 480,
    y: 86 + index * 62
  }));
  const branchNodes = ["inertia", "intervention", "rupture"].map((id, index) => ({
    id,
    label: branchName(id),
    x: 850,
    y: 145 + index * 115
  }));
  const inputByLabel = new Map(inputNodes.map((node) => [node.label, node]));
  const branchById = new Map(branchNodes.map((node) => [node.id, node]));
  const inputEdges = couplingNodes.flatMap((node) => {
    return couplingInputs(report, node.item)
      .map((label) => inputByLabel.get(label))
      .filter(Boolean)
      .map((input) => ({ from: input, to: node }));
  });
  const branchEdges = couplingNodes.flatMap((node) => {
    return couplingBranches(node.item)
      .map((branch) => branchById.get(branch))
      .filter(Boolean)
      .map((branch) => ({
        from: node,
        to: branch,
        color: branchColor(branch.id),
        weight: Number(node.item.branch_effects?.[branch.id] || node.item.effect?.weight_delta || 1)
      }));
  });

  return `<section class="panel wide">
    <h2>Coupling Network</h2>
    <p class="viz-note">左侧是触发条件，中间是命中的耦合规则，右侧是被推高或压低的人生分支。线越粗，说明这条耦合对分支的推动越强。</p>
    <svg class="coupling-network" viewBox="0 0 980 560" role="img" aria-label="coupling network">
      <defs>
        <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#7f8b87" />
        </marker>
      </defs>
      ${inputEdges.map((edge) => `<path d="M${edge.from.x + 90},${edge.from.y} C${edge.from.x + 190},${edge.from.y} ${edge.to.x - 180},${edge.to.y} ${edge.to.x - 76},${edge.to.y}" stroke="#7f8b87" stroke-width="1.4" stroke-opacity=".42" fill="none" marker-end="url(#arrowHead)" />`).join("")}
      ${branchEdges.map((edge) => `<path d="M${edge.from.x + 82},${edge.from.y} C${edge.from.x + 190},${edge.from.y} ${edge.to.x - 170},${edge.to.y} ${edge.to.x - 86},${edge.to.y}" stroke="${edge.color}" stroke-width="${Math.max(1.6, Math.abs(edge.weight) * 2.2)}" stroke-opacity=".62" fill="none" marker-end="url(#arrowHead)" />`).join("")}
      ${inputNodes.map((node) => `<g>
        <rect x="${node.x - 92}" y="${node.y - 15}" width="184" height="30" rx="8" fill="#fffaf0" stroke="#d7c9ad" />
        <text x="${node.x}" y="${node.y + 5}" text-anchor="middle" class="svg-chip">${escapeHtml(trimLabel(node.label, 22))}</text>
      </g>`).join("")}
      ${couplingNodes.map((node) => `<g>
        <rect x="${node.x - 86}" y="${node.y - 24}" width="172" height="48" rx="10" fill="#f7f1e6" stroke="#b38a35" stroke-width="1.4" />
        <text x="${node.x}" y="${node.y - 3}" text-anchor="middle" class="svg-label">${escapeHtml(trimLabel(node.label, 15))}</text>
        <text x="${node.x}" y="${node.y + 15}" text-anchor="middle" class="svg-small">coupling</text>
      </g>`).join("")}
      ${branchNodes.map((node) => `<g>
        <rect x="${node.x - 88}" y="${node.y - 24}" width="176" height="48" rx="999" fill="${branchColor(node.id)}" fill-opacity=".88" />
        <text x="${node.x}" y="${node.y + 5}" text-anchor="middle" class="svg-branch">${escapeHtml(node.label)}</text>
      </g>`).join("")}
    </svg>
  </section>`;
}

function renderBranchEvolution(report) {
  const rounds = report.deep_simulation?.rounds || [];
  if (!rounds.length) return "";
  const branches = ["inertia", "intervention", "rupture"];
  const width = 980;
  const height = 430;
  const left = 72;
  const right = 58;
  const top = 42;
  const bottom = 78;
  const chartW = width - left - right;
  const chartH = height - top - bottom;
  const values = rounds.flatMap((round) => branches.map((branch) => Number(round.branch_pressure_after_round?.[branch] || 0)));
  const maxValue = Math.max(...values, 1);
  const x = (index) => left + (chartW * index) / Math.max(1, rounds.length - 1);
  const y = (value) => top + chartH - (Number(value || 0) / maxValue) * chartH;
  const lines = branches.map((branch) => {
    const points = rounds.map((round, index) => `${x(index)},${y(round.branch_pressure_after_round?.[branch])}`).join(" ");
    return { branch, points };
  });

  return `<section class="panel wide">
    <h2>Branch Evolution Timeline</h2>
    <p class="viz-note">这张图看每一轮事件之后，三条人生线的压力如何变化。它比静态分数更接近“命运正在形成”的过程。</p>
    <svg class="time-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="branch evolution timeline">
      ${[0, 0.25, 0.5, 0.75, 1].map((ratio) => `<line x1="${left}" y1="${top + chartH * ratio}" x2="${width - right}" y2="${top + chartH * ratio}" stroke="#d8cbb5" stroke-dasharray="5 7" />`).join("")}
      ${rounds.map((round, index) => `<line x1="${x(index)}" y1="${top}" x2="${x(index)}" y2="${top + chartH}" stroke="#e3d7c2" stroke-width="1" />`).join("")}
      ${lines.map((line) => `<polyline points="${line.points}" fill="none" stroke="${branchColor(line.branch)}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`).join("")}
      ${branches.flatMap((branch) => rounds.map((round, index) => `<circle cx="${x(index)}" cy="${y(round.branch_pressure_after_round?.[branch])}" r="5" fill="${branchColor(branch)}" />`)).join("")}
      ${rounds.map((round, index) => `<g>
        <text x="${x(index)}" y="${height - 42}" text-anchor="middle" class="svg-small">R${escapeHtml(round.round_number)}</text>
        <text x="${x(index)}" y="${height - 22}" text-anchor="middle" class="svg-tiny">${escapeHtml(trimLabel(round.round_name, 12))}</text>
      </g>`).join("")}
      ${branches.map((branch, index) => `<g>
        <rect x="${left + index * 168}" y="10" width="150" height="24" rx="999" fill="${branchColor(branch)}" fill-opacity=".12" />
        <circle cx="${left + 14 + index * 168}" cy="22" r="5" fill="${branchColor(branch)}" />
        <text x="${left + 28 + index * 168}" y="26" class="svg-small">${escapeHtml(branchName(branch))}</text>
      </g>`).join("")}
    </svg>
    <div class="round-strip">
      ${rounds.map((round) => `<article>
        <strong>R${escapeHtml(round.round_number)} ${escapeHtml(round.round_name)}</strong>
        <span>${escapeHtml(round.event)}</span>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderHtml(seed, report) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>见相 FormSight Simulation Visualizer</title>
  <style>
    :root { --ink:#182423; --muted:#64706d; --line:rgba(24,36,35,.14); --paper:#fffdf7; --wash:#f3eee4; --teal:#22736b; --rust:#a45f43; --plum:#7b3f63; --gold:#b38a35; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; background:#ece6da; }
    main { width:min(1180px,100%); margin:0 auto; padding:22px 14px 38px; }
    header { min-height:170px; display:grid; align-content:end; padding:28px; margin-bottom:14px; border:1px solid var(--line); border-radius:10px; background:linear-gradient(135deg,#fffaf0,#efe4d2); box-shadow:0 20px 60px rgba(39,44,42,.12); }
    .eyebrow { margin:0 0 8px; color:var(--teal); font-size:12px; font-weight:900; letter-spacing:0; }
    h1 { margin:0; font-size:clamp(34px,6vw,68px); line-height:1; letter-spacing:0; }
    h2 { margin:0 0 14px; font-size:19px; }
    h3 { margin:0 0 6px; font-size:15px; }
    p { line-height:1.68; }
    .sub { margin:12px 0 0; max-width:760px; color:#394543; font-size:15px; }
    .grid { display:grid; grid-template-columns:1.25fr .85fr; gap:14px; }
    .panel { border:1px solid var(--line); border-radius:10px; padding:18px; background:rgba(255,253,247,.94); box-shadow:0 18px 48px rgba(39,44,42,.10); overflow:hidden; }
    .wide { grid-column:1 / -1; }
    .pipeline { grid-column:1 / -1; }
    .pipe-row { display:grid; grid-template-columns:repeat(11,1fr); gap:8px; align-items:stretch; min-height:144px; }
    .pipe-step { position:relative; display:flex; flex-direction:column; justify-content:flex-end; min-height:132px; padding:12px; border:1px solid var(--line); border-radius:8px; background:#fffaf0; overflow:hidden; }
    .pipe-step i { position:absolute; inset:auto 0 0; background:linear-gradient(0deg,rgba(34,115,107,.28),rgba(179,138,53,.12)); z-index:0; }
    .pipe-step span, .pipe-step strong { position:relative; z-index:1; }
    .pipe-step span { color:var(--muted); font-size:12px; font-weight:800; }
    .pipe-step strong { margin-top:5px; font-size:14px; }
    .arrow { display:grid; place-items:center; color:var(--gold); font-size:22px; }
    .agent-map { width:100%; min-height:430px; }
    .svg-title { font-size:22px; font-weight:900; fill:var(--ink); }
    .svg-small { font-size:13px; fill:var(--muted); }
    .svg-label { font-size:13px; font-weight:800; fill:var(--ink); }
    .svg-chip { font-size:12px; font-weight:800; fill:#34403d; }
    .svg-branch { font-size:14px; font-weight:900; fill:#fffdf7; }
    .svg-tiny { font-size:10px; fill:var(--muted); }
    .viz-note { margin-top:-6px; color:var(--muted); font-size:13px; }
    .coupling-network { width:100%; min-height:520px; }
    .time-chart { width:100%; min-height:390px; }
    .branch-bars { display:grid; gap:14px; }
    .branch-row { display:grid; grid-template-columns:1fr 48px; gap:10px; align-items:center; }
    .branch-row span { display:block; color:var(--muted); font-size:12px; margin-top:4px; }
    .branch-row b { text-align:right; color:var(--rust); }
    .branch-row i { grid-column:1 / -1; display:block; height:10px; border-radius:999px; background:rgba(24,36,35,.1); overflow:hidden; }
    .branch-row em { display:block; height:100%; border-radius:999px; }
    .scene-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
    .scene-grid article { border:1px solid var(--line); border-left:5px solid var(--gold); border-radius:8px; padding:14px; background:rgba(255,255,255,.55); }
    .scene-grid span { color:var(--muted); font-weight:900; font-size:12px; }
    .scene-grid p { margin:0; color:#34403d; font-size:13px; }
    .symbol-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
    .symbol-grid article { border:1px solid var(--line); border-top:5px solid var(--plum); border-radius:8px; padding:14px; background:rgba(255,255,255,.55); }
    .symbol-grid strong { display:block; font-size:14px; }
    .symbol-grid span { display:inline-block; margin:7px 0; color:var(--plum); font-size:12px; font-weight:900; }
    .symbol-grid p { margin:0; color:#34403d; font-size:13px; }
    .symbol-grid i { display:block; margin-top:8px; color:var(--muted); font-size:11px; font-style:normal; }
    .memory-list, .coupling-list { display:grid; gap:10px; }
    .memory-item, .coupling-list div { padding:12px; border:1px solid var(--line); border-radius:8px; background:rgba(255,255,255,.55); }
    .memory-item span { display:block; color:var(--muted); font-size:12px; margin:4px 0; }
    .memory-item p, .coupling-list p { margin:0; font-size:13px; }
    .round-strip { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:10px; }
    .round-strip article { padding:12px; border:1px solid var(--line); border-radius:8px; background:rgba(255,255,255,.55); }
    .round-strip strong { display:block; font-size:13px; }
    .round-strip span { display:block; margin-top:5px; color:var(--muted); font-size:12px; line-height:1.55; }
    .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-top:16px; }
    .metric { padding:12px; border:1px solid var(--line); border-radius:8px; background:rgba(255,255,255,.58); }
    .metric strong { display:block; color:var(--rust); font-size:28px; line-height:1; }
    .metric span { display:block; margin-top:7px; color:var(--muted); font-size:12px; font-weight:900; }
    @media (max-width:820px) { .grid, .scene-grid, .symbol-grid, .metrics, .round-strip { grid-template-columns:1fr; } .pipe-row { grid-template-columns:1fr; } .arrow { display:none; } header { padding:20px; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">FORMSIGHT / VISUAL SIMULATION BOARD</p>
      <h1>见相可视化仿真板</h1>
      <p class="sub">${escapeHtml(seed.profile?.current_question || "A personal parallel life simulation.")}</p>
      <div class="metrics">
        <div class="metric"><strong>${escapeHtml(report.material_quality?.score)}</strong><span>材料分辨率</span></div>
        <div class="metric"><strong>${escapeHtml(report.deep_simulation?.rounds?.length || 0)}</strong><span>模拟回合</span></div>
        <div class="metric"><strong>${escapeHtml(report.advanced_couplings?.length || 0)}</strong><span>增强耦合</span></div>
        <div class="metric"><strong>${escapeHtml(report.llm_simulation_cost?.estimated_total_tokens || 0)}</strong><span>深度 token 预算</span></div>
      </div>
    </header>
    <div class="grid">
      ${renderPipeline(report)}
      ${renderAgentField(report)}
      <div>
        ${renderBranchPressure(report)}
        ${renderMemory(report)}
      </div>
      ${renderCouplingNetwork(report)}
      ${renderBranchEvolution(report)}
      ${renderSymbolicSignalBoard(report)}
      ${renderTimeline(report)}
      ${renderCouplingMap(report)}
    </div>
  </main>
</body>
</html>`;
}

function main() {
  const seedPath = process.argv[2];
  const outputPath = process.argv[3] || "reports/simulation-visualization.html";

  if (!seedPath) {
    console.error("Usage: node src/render-visualization.js <seed.json> [output.html]");
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(path.resolve(seedPath), "utf8"));
  const report = simulate(seed);
  const resolvedOutput = path.resolve(outputPath);

  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
  fs.writeFileSync(resolvedOutput, renderHtml(seed, report), "utf8");
  console.log(`Visualization written to ${resolvedOutput}`);
}

main();
