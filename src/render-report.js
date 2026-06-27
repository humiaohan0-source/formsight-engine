const fs = require("fs");
const path = require("path");
const { simulate } = require("./engine");

const zh = {
  agents: {
    prover: "证明者",
    controller: "控制者",
    observer: "冷眼观察者",
    escaper: "逃离者",
    pleaser: "讨好者",
    judge: "审判者"
  },
  branches: {
    inertia: "惯性人生线",
    intervention: "干预人生线",
    rupture: "断裂重启线"
  },
  stages: {
    "Early Adulthood": "成年早期",
    "Mid Adulthood": "中年阶段",
    "Late Adulthood": "晚年阶段"
  },
  pressure: {
    "career direction": "职业方向",
    "identity formation": "身份成形",
    intimacy: "亲密关系",
    "economic independence": "经济独立",
    "long-term responsibility": "长期责任",
    "family structure": "家庭结构",
    "career ceiling": "职业天花板",
    "meaning crisis": "意义危机",
    legacy: "人生遗产",
    health: "健康",
    "regret integration": "遗憾整合",
    "family memory": "家庭记忆"
  }
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function agentName(id) {
  return zh.agents[id] || id;
}

function branchName(id) {
  return zh.branches[id] || id;
}

function branchColor(id) {
  return {
    inertia: "var(--gold)",
    intervention: "var(--teal)",
    rupture: "var(--plum)"
  }[id] || "var(--teal)";
}

function pressureText(items = []) {
  return items.map((item) => zh.pressure[item] || item).join(" / ");
}

function readableId(id) {
  return String(id || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function trimText(value, max = 20) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

function branchProbabilities(report) {
  const branches = report.branches || [];
  const total = branches.reduce((sum, branch) => sum + Math.max(0, Number(branch.weight || 0)), 0) || 1;
  return Object.fromEntries(branches.map((branch) => [
    branch.id,
    Math.max(0, Number(branch.weight || 0)) / total * 100
  ]));
}

function branchProbability(report, branchId) {
  return branchProbabilities(report)[branchId] || 0;
}

function formatProbability(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function resultLineName(id) {
  return {
    inertia: "主线",
    intervention: "转向线",
    rupture: "重启线"
  }[id] || id;
}

function resultBranchById(report, id) {
  return (report.branches || []).find((branch) => branch.id === id) || {};
}

function strongestBranch(report) {
  return [...(report.branches || [])].sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0))[0] || {};
}

function resultBranchScene(branch, horizon) {
  const scene = (branch.future_scenes || []).find((item) => String(item.horizon || "").includes(horizon));
  return scene?.text || branch.trajectory || branch.premise || "";
}

function isStudyChoiceQuestion(report) {
  const question = String(report.current_question || "").toLowerCase();
  return ["stem", "sociology", "employment", "cross-exam", "major", "考研", "跨考", "专业", "就业"].some((item) => question.includes(item));
}

function resultDiagnosis(report) {
  const strongest = strongestBranch(report);
  const strongestProbability = formatProbability(branchProbability(report, strongest.id));
  if (isStudyChoiceQuestion(report)) {
    return {
      title: "结果摘要：不是立刻三选一，而是先验证一条路",
      summary: "这份材料显示，用户真正卡住的不是“理工科 / 社会学 / 就业”哪一个更好，而是每次看见一条路，都会立刻被负面信息、家庭评价和自我怀疑拉走。当前最优线是转向线：用 3 个月把跨考理工科拆成可验证的基础课进度，再决定是否加码。",
      verdict: `当前最高可能性：${resultLineName(strongest.id)} ${strongestProbability}。直接就业更像逃离不确定，不适合现在当主线；继续泛泛跨考也会继续消耗。`,
      lines: {
        inertia: {
          label: "继续犹豫线",
          result: "继续在多个专业之间换来换去，看到负面新闻就撤退，学习进度被思绪反复打断。",
          trigger: "没有固定测试周期；继续把家庭评价、专业风评和自我价值绑在一起。",
          sign: "3 个月后还在比较专业优劣，但数学/物理/目标方向基础课没有稳定进度。"
        },
        intervention: {
          label: "低后悔测试线",
          result: "不立刻决定一生方向，只选一个理工方向做 90 天验证：固定课程、固定进度、固定复盘点。",
          trigger: "把“我要不要跨考”改成“我能不能连续 90 天完成基础课进度”。",
          sign: "如果 90 天后基础课能推进，跨考才从幻想变成现实选项；如果推进不了，就回到社会学/就业组合路径。"
        },
        rupture: {
          label: "断裂重启线",
          result: "长期压着不定，最后可能突然转向直接就业、突然放弃跨考，或和母亲在方向问题上爆发更强冲突。",
          trigger: "睡眠、情绪、家庭压力或专业焦虑继续累积，但没有形成可执行计划。",
          sign: "表现形式不是慢慢变好，而是“算了我不想读了 / 直接就业吧 / 换个方向重来”。"
        }
      }
    };
  }

  return {
    title: "结果摘要：先看三条线会在现实里变成什么",
    summary: "这份报告最重要的不是抽象解释，而是当前变量继续运行时，现实会出现哪三种具体走向。",
    verdict: `当前最高可能性：${resultLineName(strongest.id)} ${strongestProbability}。`,
    lines: {
      inertia: {
        label: "惯性延续线",
        result: "继续沿着现在的结构走，问题不会消失，只会换一种形式反复回来。",
        trigger: "关键变量维持原状。",
        sign: resultBranchScene(resultBranchById(report, "inertia"), "3")
      },
      intervention: {
        label: "主动转向线",
        result: "先做一个低成本、可验证的小动作，让旧结构开始松动。",
        trigger: "不等待完全确定，先用现实反馈验证一个选择。",
        sign: resultBranchScene(resultBranchById(report, "intervention"), "3")
      },
      rupture: {
        label: "断裂重启线",
        result: "被压住的冲突突然突破，人生以更剧烈的方式重新排列。",
        trigger: "情绪、关系、钱或身体压力继续累积，但没有被提前处理。",
        sign: resultBranchScene(resultBranchById(report, "rupture"), "3")
      }
    }
  };
}

function renderResultFirst(report) {
  const diagnosis = resultDiagnosis(report);
  const branches = ["inertia", "intervention", "rupture"].map((id) => resultBranchById(report, id)).filter((branch) => branch.id);

  return `<section class="result-first">
    <div class="section-head">
      <div>
        <h2>${escapeHtml(diagnosis.title)}</h2>
        <p class="small">这一段是交付结果，不是模型解释。用户先看这里，就能知道自己的现实问题会往哪里走。</p>
      </div>
    </div>
    <p class="result-lead">${escapeHtml(diagnosis.summary)}</p>
    <div class="verdict">${escapeHtml(diagnosis.verdict)}</div>
    <div class="result-lines">
      ${branches.map((branch) => {
        const line = diagnosis.lines[branch.id] || {};
        return `<article class="${escapeHtml(branch.id)}">
          <div class="line-head"><span>${escapeHtml(resultLineName(branch.id))}</span><b>${escapeHtml(formatProbability(branchProbability(report, branch.id)))}</b></div>
          <h3>${escapeHtml(line.label || branch.cinematic_name || branchName(branch.id))}</h3>
          <p><strong>具体结果：</strong>${escapeHtml(line.result || branch.trajectory || "")}</p>
          <p><strong>触发条件：</strong>${escapeHtml(line.trigger || branch.premise || "")}</p>
          <p><strong>现实表现：</strong>${escapeHtml(line.sign || resultBranchScene(branch, "3"))}</p>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function lookupAgentLabel(report, id) {
  const items = [
    ...(report.dominant_agents || []),
    ...(report.external_agents || [])
  ];
  const found = items.find((item) => item.id === id || item.name === id);
  return found?.name || agentName(id) || readableId(id);
}

function conditionText(report, key, value) {
  const labels = {
    role_load: "角色负载",
    financial_runway: "资产缓冲",
    external_pressure: "外部压力",
    support_capacity: "支持能力",
    energy_risk: "能量风险",
    life_mobility: "人生机动性"
  };

  if (key.endsWith("_gte")) return `${labels[key.replace("_gte", "")] || key.replace("_gte", "")} >= ${value}`;
  if (key.endsWith("_lte")) return `${labels[key.replace("_lte", "")] || key.replace("_lte", "")} <= ${value}`;
  return `${labels[key] || key}: ${value}`;
}

function couplingInputs(report, item) {
  const conditions = item.if || {};
  const agents = [
    ...(conditions.inner_agents || []),
    ...(conditions.inner_agents_all || []),
    ...(conditions.inner_agents_any || []),
    ...(conditions.external_agents || []),
    ...(conditions.external_agents_all || []),
    ...(conditions.external_agents_any || [])
  ].map((id) => lookupAgentLabel(report, id));
  const patterns = [
    ...(conditions.patterns_all || []),
    ...(conditions.patterns_any || [])
  ].map((id) => `模式: ${readableId(id)}`);
  const symbolic = [
    ...(conditions.symbolic_all || []),
    ...(conditions.symbolic_any || [])
  ].map((id) => `象征: ${readableId(id)}`);
  const scores = Object.entries(conditions.world_scores || {})
    .map(([key, value]) => conditionText(report, key, value));

  return [...agents, ...patterns, ...symbolic, ...scores].filter(Boolean);
}

function couplingBranches(item) {
  if (item.branch_effects) return Object.keys(item.branch_effects);
  if (item.effect?.branch) return [item.effect.branch];
  return [];
}

function scoreLevel(score, highLabel, midLabel, lowLabel) {
  if (score >= 8) return highLabel;
  if (score >= 4) return midLabel;
  return lowLabel;
}

function patternCard(pattern, kind) {
  const tags = [
    ...(pattern.amplifies || []).map((id) => `放大 ${agentName(id)}`),
    ...(pattern.tests || []).map((id) => `测试 ${agentName(id)}`),
    ...(pattern.suppresses || []).map((id) => `压住 ${agentName(id)}`)
  ];

  const effect =
    pattern.life_effect ||
    pattern.risk ||
    pattern.recommended_strategy ||
    pattern.description ||
    "当前模式会改变人生分支的权重。";
  const financialEffect = pattern.financial_effect
    ? `<p class="small">资产影响：${escapeHtml(JSON.stringify(pattern.financial_effect))}</p>`
    : "";

  return `<div class="card pattern-card">
    <div class="card-top">
      <span class="kind">${escapeHtml(kind)}</span>
      <span class="score">命中 ${escapeHtml(pattern.score)}</span>
    </div>
    <h3>${escapeHtml(pattern.name)}</h3>
    <p>${escapeHtml(pattern.description)}</p>
    <p class="effect">${escapeHtml(effect)}</p>
    ${financialEffect}
    <div>${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
  </div>`;
}

function renderWorldState(report) {
  const world = report.world;
  const scores = world.scores;

  return `<section>
    <h2>个人世界状态</h2>
    <p class="small">命运不是只由性格决定。这里把资产、环境、家庭、关系、角色负载、身体能量、时间线、价值系统和决策风格放进同一个世界模型里。</p>
    <div class="score-grid">
      <div class="metric"><strong>${scores.role_load}</strong><span>社会角色负载</span><small>${scoreLevel(scores.role_load, "高负载", "中等负载", "低负载")}</small></div>
      <div class="metric"><strong>${scores.financial_runway}</strong><span>资产缓冲</span><small>${scoreLevel(scores.financial_runway, "缓冲较足", "缓冲一般", "缓冲偏弱")}</small></div>
      <div class="metric"><strong>${scores.external_pressure}</strong><span>外部压力</span><small>${scoreLevel(scores.external_pressure, "压力很高", "压力中等", "压力较低")}</small></div>
      <div class="metric"><strong>${scores.support_capacity}</strong><span>支持能力</span><small>${scoreLevel(scores.support_capacity, "支持较强", "支持一般", "支持偏薄")}</small></div>
      <div class="metric"><strong>${scores.energy_risk}</strong><span>能量风险</span><small>${scoreLevel(scores.energy_risk, "高风险", "中风险", "低风险")}</small></div>
      <div class="metric"><strong>${scores.life_mobility}</strong><span>人生机动性</span><small>${scoreLevel(scores.life_mobility, "可移动", "有限移动", "移动受限")}</small></div>
    </div>
  </section>`;
}

function renderMaterialQuality(report) {
  const quality = report.material_quality;
  if (!quality) return "";

  return `<section>
    <h2>输入材料质量</h2>
    <p class="small">这一步用来判断本次预测的分辨率：材料越具体，模拟越能从“泛泛判断”进入“个人命运结构”。</p>
    <div class="score-grid">
      <div class="metric"><strong>${escapeHtml(quality.score)}</strong><span>材料质量</span><small>${escapeHtml(quality.label)}</small></div>
      <div class="metric"><strong>${escapeHtml(quality.dimensions.length)}</strong><span>材料维度</span><small>身份 / 行为 / 现实 / 关系 / 价值</small></div>
      <div class="metric"><strong>${escapeHtml(quality.missing_dimensions.length)}</strong><span>薄弱维度</span><small>需要后续追问</small></div>
    </div>
    <div class="grid">
      ${quality.dimensions.map((item) => `<div class="card">
        <h3>${escapeHtml(item.name)} <span class="score">${escapeHtml(item.score)}</span></h3>
        <p>${escapeHtml(item.interpretation)}</p>
        <p class="small">材料数量：${escapeHtml(item.raw_count)} / 目标密度</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderReviewPath(report) {
  const review = report.review_path;
  if (!review) return "";

  return `<section>
    <h2>Evidence Mode</h2>
    <p class="small">This section describes how additional evidence changes calibration. It is a model signal, not a commercial path.</p>
    <div class="card">
      <h3>${escapeHtml(review.selected_path.name)}</h3>
      <p>${escapeHtml(review.selected_path.model_meaning || review.selected_path.description)}</p>
      <p class="effect">${escapeHtml(review.evidence_note)}</p>
      <p class="small">${escapeHtml(review.selected_path.description || "")}</p>
    </div>
    <div class="score-grid">
      <div class="metric"><strong>${escapeHtml(review.calibration_effect.adjusted_material_quality_score)}</strong><span>Adjusted material score</span><small>${escapeHtml(review.calibration_effect.interpretation)}</small></div>
      <div class="metric"><strong>${escapeHtml(review.calibration_effect.observer_bonus)}</strong><span>Observer bonus</span><small>External evidence</small></div>
      <div class="metric"><strong>${escapeHtml(review.calibration_effect.structure_bonus)}</strong><span>Structure bonus</span><small>Structured private material</small></div>
    </div>
  </section>`;
}

function renderRealityVariables(report) {
  const world = report.world;

  return `<section>
    <h2>现实变量拆解</h2>
    <div class="grid">
      <div class="card">
        <h3>社会角色</h3>
        ${(world.roles || []).map((role) => `<p><strong>${escapeHtml(role.role)}</strong>：${escapeHtml(role.description)} <span class="tag">负载 ${escapeHtml(role.load)}</span></p>`).join("")}
      </div>
      <div class="card">
        <h3>资产与迁移能力</h3>
        <p><strong>收入等级：</strong>${escapeHtml(world.assets.monthly_income_level)}</p>
        <p><strong>储蓄缓冲：</strong>${escapeHtml(world.assets.savings_months)} 个月</p>
        <p><strong>债务压力：</strong>${escapeHtml(world.assets.debt_pressure)}</p>
        <p><strong>技能资产：</strong>${escapeHtml((world.assets.skill_assets || []).join(" / "))}</p>
        <p><strong>声誉资产：</strong>${escapeHtml((world.assets.reputation_assets || []).join(" / "))}</p>
      </div>
      <div class="card">
        <h3>家庭系统</h3>
        <p><strong>家庭期待：</strong>${escapeHtml(world.family.family_expectation)}</p>
        <p><strong>隐性规则：</strong>${escapeHtml(world.family.unspoken_family_rule)}</p>
        <p><strong>边界压力：</strong>${escapeHtml(world.family.boundary_pressure)}</p>
      </div>
      <div class="card">
        <h3>价值与决策</h3>
        <p><strong>核心价值：</strong>${escapeHtml((world.value_system.top_values || []).join(" / "))}</p>
        <p><strong>被牺牲的价值：</strong>${escapeHtml((world.value_system.sacrificed_values || []).join(" / "))}</p>
        <p><strong>默认决策方式：</strong>${escapeHtml(world.decision_style.default_mode)}</p>
        <p><strong>压力下反应：</strong>${escapeHtml(world.decision_style.under_pressure)}</p>
      </div>
      <div class="card">
        <h3>社会资本</h3>
        <p><strong>当前圈层：</strong>${escapeHtml(world.social_capital.current_circle)}</p>
        <p><strong>桥接关系：</strong>${escapeHtml(world.social_capital.bridge_ties)}</p>
        <p><strong>公共可见度：</strong>${escapeHtml(world.social_capital.public_visibility)}</p>
        <p><strong>缺失网络：</strong>${escapeHtml(world.social_capital.missing_network)}</p>
      </div>
      <div class="card">
        <h3>财富与时代</h3>
        <p><strong>现金流依赖：</strong>${escapeHtml(world.wealth_path.cashflow_dependency)}</p>
        <p><strong>选择权资本：</strong>${escapeHtml(world.wealth_path.optionality_capital)}</p>
        <p><strong>资产化路径：</strong>${escapeHtml(world.wealth_path.asset_building_path)}</p>
        <p><strong>时代窗口：</strong>${escapeHtml(world.macro_era.market_window)}</p>
      </div>
    </div>
  </section>`;
}

function renderVariableForceFocus(report) {
  const state = report.life_evolution?.initial_state || report.deep_simulation?.rounds?.[0]?.state_after_round || {};
  const variables = [
    {
      id: "family_gravity",
      label: "家庭牵制力",
      short: "家庭",
      value: Number(state.family_gravity ?? 0),
      force: Number(state.family_gravity ?? 0),
      forceLabel: "推力强度",
      x: 156,
      y: 86,
      color: "var(--rust)",
      note: "责任、期待与边界压力会把人拉回旧结构。"
    },
    {
      id: "financial_buffer",
      label: "资产缓冲",
      short: "钱",
      value: Number(state.financial_buffer ?? 0),
      force: 10 - Number(state.financial_buffer ?? 0),
      forceLabel: "缺口压力",
      x: 156,
      y: 248,
      color: "var(--gold)",
      note: "缓冲越低，现实约束越强；没钱不是没有作用，而是会压缩每一次转向的动作空间。"
    },
    {
      id: "body_recovery",
      label: "身体恢复力",
      short: "身体",
      value: Number(state.body_recovery ?? 0),
      force: Number(state.body_recovery ?? 0),
      forceLabel: "支撑强度",
      x: 156,
      y: 410,
      color: "var(--teal)",
      note: "身体能量决定一个人还能不能继续补贴旧模式。"
    },
    {
      id: "action_momentum",
      label: "行动动量",
      short: "行动",
      value: Number(state.action_momentum ?? 0),
      force: Number(state.action_momentum ?? 0),
      forceLabel: "推力强度",
      x: 374,
      y: 248,
      color: "var(--plum)",
      note: "行动一旦形成连续反馈，人生线会开始偏移。"
    }
  ];
  const center = { x: 640, y: 248 };
  const target = { x: 858, y: 248 };
  const strongest = [...variables].sort((a, b) => b.force - a.force)[0];

  return `<section class="variable-force-section">
    <div class="section-head">
      <div>
        <h2>关键变量推力</h2>
        <p class="small">这四个变量对应下一条视频 6-12 秒的核心画面：家庭、钱、身体、行动不是背景信息，它们会一起把人生推向某条线。注意：资产缓冲低不是“没有作用”，而是以缺口压力的形式强烈约束现实。</p>
      </div>
      <span class="universe-node-label">当前最强推力：${escapeHtml(strongest.label)} ${escapeHtml(strongest.force.toFixed(1))}</span>
    </div>
    <div class="variable-force-map">
      <svg viewBox="0 0 980 500" role="img" aria-label="家庭、资产、身体、行动四个变量的动态推力">
        <defs>
          <filter id="variableGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text x="68" y="42" class="field-axis">现实变量</text>
        <text x="574" y="42" class="field-axis">耦合压力</text>
        <text x="792" y="42" class="field-axis">人生线偏移</text>
        <path class="variable-spine" d="M${center.x} ${center.y} C724 188 792 184 898 138" />
        <path class="variable-spine intervention-spine" d="M${center.x} ${center.y} C726 236 786 236 908 248" />
        <path class="variable-spine rupture-spine" d="M${center.x} ${center.y} C724 314 792 334 898 382" />
        <text x="814" y="119" class="variable-branch-label">主线</text>
        <text x="800" y="232" class="variable-branch-label">转向线</text>
        <text x="800" y="407" class="variable-branch-label">重启线</text>
        ${variables.map((item, index) => {
          const clamped = Math.max(0, Math.min(10, item.force));
          const radius = 27 + clamped * 2.5;
          const path = `M${item.x + radius} ${item.y} C${item.x + 170} ${item.y} ${center.x - 120} ${center.y} ${center.x - 36} ${center.y}`;
          return `<g>
            <path class="variable-force-edge" d="${escapeHtml(path)}" style="stroke:${escapeHtml(item.color)}; stroke-width:${escapeHtml((2 + clamped * 0.34).toFixed(1))}; animation-delay:${(index * 0.16).toFixed(2)}s" />
            <circle class="variable-signal" r="${escapeHtml((3.2 + clamped * 0.22).toFixed(1))}" style="fill:${escapeHtml(item.color)}">
              <animateMotion dur="${escapeHtml((2.7 + index * 0.35).toFixed(2))}s" repeatCount="indefinite" path="${escapeHtml(path)}" />
            </circle>
            <g class="variable-force-node ${escapeHtml(item.id === strongest.id ? "strongest" : "")}" style="--node-color:${escapeHtml(item.color)}; animation-delay:${(index * 0.12).toFixed(2)}s">
              <circle cx="${escapeHtml(item.x)}" cy="${escapeHtml(item.y)}" r="${escapeHtml(radius.toFixed(1))}" />
              <circle class="variable-node-pulse" cx="${escapeHtml(item.x)}" cy="${escapeHtml(item.y)}" r="${escapeHtml(radius.toFixed(1))}" />
              <text x="${escapeHtml(item.x)}" y="${escapeHtml(item.y - 7)}" text-anchor="middle">${escapeHtml(item.short)}</text>
              <text x="${escapeHtml(item.x)}" y="${escapeHtml(item.y + 14)}" text-anchor="middle" class="variable-value">${escapeHtml(item.value.toFixed(1))}</text>
            </g>
          </g>`;
        }).join("")}
        <g class="pressure-core">
          <circle cx="${escapeHtml(center.x)}" cy="${escapeHtml(center.y)}" r="44" />
          <circle class="pressure-core-pulse" cx="${escapeHtml(center.x)}" cy="${escapeHtml(center.y)}" r="44" />
          <text x="${escapeHtml(center.x)}" y="${escapeHtml(center.y - 4)}" text-anchor="middle">变量耦合</text>
          <text x="${escapeHtml(center.x)}" y="${escapeHtml(center.y + 16)}" text-anchor="middle" class="field-mini">形成推力</text>
        </g>
        <circle class="variable-target" cx="${escapeHtml(target.x)}" cy="${escapeHtml(target.y)}" r="18" />
      </svg>
      <div class="variable-force-cards">
        ${variables.map((item) => `<article style="border-top-color:${escapeHtml(item.color)}">
          <strong>${escapeHtml(item.label)}</strong>
          <b>${escapeHtml(item.value.toFixed(1))}</b>
          <div class="bar"><i style="width:${escapeHtml((Math.max(0, Math.min(10, item.force)) * 10).toFixed(0))}%; background:${escapeHtml(item.color)}"></i></div>
          <span class="force-caption">${escapeHtml(item.forceLabel)} ${escapeHtml(item.force.toFixed(1))}</span>
          <p>${escapeHtml(item.note)}</p>
        </article>`).join("")}
      </div>
    </div>
  </section>`;
}

function renderTimeline(report) {
  const timeline = report.world.timeline || [];

  return `<section>
    <h2>人生时间线种子</h2>
    <p class="small">这些节点不是单纯回忆，而是后续命运模式的历史来源。</p>
    <div class="timeline">
      ${timeline.map((item) => `<div class="timeline-item">
        <span>${escapeHtml(item.age ?? "?")}</span>
        <div>
          <h3>${escapeHtml(item.type)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>
      </div>`).join("") || `<div class="card"><p>当前没有输入人生时间线。</p></div>`}
    </div>
  </section>`;
}

function renderEventSedimentation(report) {
  const sediment = report.event_sedimentation || {};
  const deposits = sediment.dominant_deposits || [];
  const branchEntries = Object.entries(sediment.branch_bias || {})
    .sort((a, b) => Math.abs(Number(b[1] || 0)) - Math.abs(Number(a[1] || 0)))
    .slice(0, 3);
  const stateEntries = Object.entries(sediment.state_bias || {})
    .sort((a, b) => Math.abs(Number(b[1] || 0)) - Math.abs(Number(a[1] || 0)))
    .slice(0, 6);

  return `<section>
    <h2>人生事件沉积层</h2>
    <p class="small">一个人不是突然变成现在这样。模型会把童年、学校、关系、身体、金钱、迁移等节点转成沉积变量，再影响当前状态和三条人生线。</p>
    <div class="sediment-head">
      <div><strong>${escapeHtml(sediment.events_analyzed || 0)}</strong><span>纳入分析的时间线事件</span></div>
      <div><strong>${escapeHtml(sediment.total_intensity || 0)}</strong><span>累计沉积强度</span></div>
      <div><strong>${escapeHtml(sediment.repair_count || 0)}</strong><span>出现修复线索的事件</span></div>
    </div>
    <div class="grid">
      ${deposits.length ? deposits.slice(0, 6).map((deposit) => `<div class="card sediment-card">
        <h3>${escapeHtml(deposit.name)} <span class="score">${escapeHtml(deposit.intensity)}</span></h3>
        <p><strong>发生阶段：</strong>${escapeHtml(deposit.age !== undefined ? `${deposit.age}岁` : "年龄未知")} / ${escapeHtml(deposit.stage)}</p>
        <p>${escapeHtml(deposit.life_effect || "这类事件会改变后续选择方式。")}</p>
        <p><strong>修复状态：</strong>${escapeHtml(deposit.repaired ? "材料中出现修复线索" : "材料中未见明显修复")}</p>
      </div>`).join("") : `<div class="card"><p>当前时间线材料还不够细，暂时无法形成稳定的事件沉积判断。</p></div>`}
    </div>
    <div class="sediment-tags">
      ${stateEntries.map(([key, value]) => `<span>${escapeHtml(variableName(key))} ${Number(value) >= 0 ? "+" : ""}${escapeHtml(Number(value).toFixed(1))}</span>`).join("")}
      ${branchEntries.map(([key, value]) => `<span>${escapeHtml(branchName(key))} ${Number(value) >= 0 ? "+" : ""}${escapeHtml(Number(value).toFixed(1))}</span>`).join("")}
    </div>
  </section>`;
}

function renderPatternSection(title, subtitle, patterns, kind) {
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <p class="small">${escapeHtml(subtitle)}</p>
    <div class="grid">
      ${patterns.length ? patterns.map((pattern) => patternCard(pattern, kind)).join("") : `<div class="card"><p>当前材料没有明显命中这一类模式。</p></div>`}
    </div>
  </section>`;
}

function renderAgents(report) {
  return `<section>
    <h2>主导内在人格 Agent</h2>
    <div class="grid">
      ${report.dominant_agents.map((agent) => `<div class="card">
        <h3>${escapeHtml(agentName(agent.id))} <span class="score">${escapeHtml(agent.score)}</span></h3>
        <p><strong>核心欲望：</strong>${escapeHtml(agent.desire)}</p>
        <p><strong>核心恐惧：</strong>${escapeHtml(agent.fear)}</p>
        <p><strong>常用策略：</strong>${escapeHtml(agent.strategy)}</p>
        <p><strong>人生牵引：</strong>${escapeHtml(agent.life_pull)}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderForces(report) {
  return `<section>
    <h2>现实支持与约束</h2>
    <div class="grid">
      ${report.world_forces.map((force) => `<div class="card force ${force.type}">
        <h3>${escapeHtml(force.type === "support" ? "支持因素" : "约束因素")}：${escapeHtml(force.name)}</h3>
        <p>${escapeHtml(force.text)}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderExternalAgents(report) {
  return `<section>
    <h2>外部社会 Agent</h2>
    <p class="small">这些不是你的性格，而是外部世界中会施压、奖励、限制或帮助你的力量。</p>
    <div class="grid">
      ${report.external_agents.map((agent) => `<div class="card">
        <h3>${escapeHtml(agent.name)} <span class="score">${escapeHtml(agent.score)}</span></h3>
        <p><strong>领域：</strong>${escapeHtml(agent.domain)}</p>
        <p><strong>施压方式：</strong>${escapeHtml(agent.pressure_style)}</p>
        <p><strong>人生影响：</strong>${escapeHtml(agent.life_effect)}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderLifeEvents(report) {
  return `<section>
    <h2>更容易触发的人生事件</h2>
    <div class="grid">
      ${report.life_events.map((event) => `<div class="card">
        <h3>${escapeHtml(event.name)} <span class="score">${escapeHtml(event.score)}</span></h3>
        <p>${escapeHtml(event.description)}</p>
        <p><strong>测试的 agent：</strong>${escapeHtml(event.tests_agents.join(" / "))}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderCouplings(report) {
  return `<section>
    <h2>耦合规则命中</h2>
    <p class="small">这里显示“内在人格 + 外部现实 + 历史节点 + 价值系统 + 决策风格”如何共同改变人生分支权重。</p>
    <div class="grid">
      ${report.couplings.map((rule) => `<div class="card force ${rule.effect.branch === "intervention" ? "support" : "constraint"}">
        <h3>${escapeHtml(rule.name)}</h3>
        <p>${escapeHtml(rule.effect.interpretation)}</p>
        <p><strong>影响分支：</strong>${escapeHtml(branchName(rule.effect.branch))} +${escapeHtml(rule.effect.weight_delta)}</p>
      </div>`).join("") || `<div class="card"><p>当前没有命中特定耦合规则。</p></div>`}
    </div>
    <div class="branch-weight">
      <span>${branchName("inertia")}：${escapeHtml(formatProbability(branchProbability(report, "inertia")))}</span>
      <span>${branchName("intervention")}：${escapeHtml(formatProbability(branchProbability(report, "intervention")))}</span>
      <span>${branchName("rupture")}：${escapeHtml(formatProbability(branchProbability(report, "rupture")))}</span>
    </div>
    <h3>增强耦合</h3>
    <div class="grid">
      ${(report.advanced_couplings || []).map((rule) => `<div class="card force ${Number(rule.branch_effects?.rupture || 0) > 0 ? "constraint" : "support"}">
        <h3>${escapeHtml(rule.name)}</h3>
        <p>${escapeHtml(rule.interpretation)}</p>
        <p class="small">分支影响：${escapeHtml(JSON.stringify(rule.branch_effects || {}))}</p>
      </div>`).join("") || `<div class="card"><p>当前没有命中增强耦合规则。</p></div>`}
    </div>
  </section>`;
}

function renderDynamicCouplingField(report) {
  const couplings = [
    ...(report.symbolic_couplings || []),
    ...(report.advanced_couplings || []),
    ...(report.couplings || [])
  ].filter((item) => couplingBranches(item).length).slice(0, 7);

  if (!couplings.length) return "";

  const inputLabels = [...new Set(couplings.flatMap((item) => couplingInputs(report, item)))].slice(0, 8);
  const branchIds = ["inertia", "intervention", "rupture"];
  const inputNodes = inputLabels.map((label, index) => ({
    label,
    x: 92,
    y: 80 + index * (360 / Math.max(inputLabels.length - 1, 1))
  }));
  const couplingNodes = couplings.map((item, index) => ({
    item,
    id: item.id || `coupling_${index}`,
    label: item.name || item.id || `耦合 ${index + 1}`,
    x: 480,
    y: 74 + index * (372 / Math.max(couplings.length - 1, 1))
  }));
  const branchNodes = branchIds.map((id, index) => ({
    id,
    label: branchName(id),
    probability: branchProbability(report, id),
    x: 884,
    y: 96 + index * 168
  }));
  const inputLookup = new Map(inputNodes.map((node) => [node.label, node]));
  const branchLookup = new Map(branchNodes.map((node) => [node.id, node]));
  const inputEdges = couplingNodes.flatMap((node) => {
    return couplingInputs(report, node.item)
      .map((label) => inputLookup.get(label))
      .filter(Boolean)
      .slice(0, 3)
      .map((source) => ({
        source,
        target: node,
        path: `M${source.x + 88} ${source.y} C260 ${source.y} 318 ${node.y} ${node.x - 38} ${node.y}`
      }));
  });
  const branchEdges = couplingNodes.flatMap((node) => {
    return couplingBranches(node.item)
      .map((id) => branchLookup.get(id))
      .filter(Boolean)
      .map((target) => ({
        source: node,
        target,
        color: branchColor(target.id),
        strength: Number(node.item.branch_effects?.[target.id] ?? node.item.effect?.weight_delta ?? 1),
        path: `M${node.x + 42} ${node.y} C612 ${node.y} 720 ${target.y} ${target.x - 62} ${target.y}`
      }));
  });
  const strongest = [...branchNodes].sort((a, b) => b.probability - a.probability)[0];

  return `<section class="coupling-field-section">
    <div class="section-head">
      <div>
        <h2>命运耦合场</h2>
        <p class="small">动态线条表示当前材料触发的变量流：左侧变量进入中间耦合规则，再把压力推向三条人生线。线条越活跃，说明这条关系正在更强地参与分支生成。</p>
      </div>
      <span class="universe-node-label">主导推力：${escapeHtml(branchName(strongest.id))}</span>
    </div>
    <div class="coupling-field">
      <svg viewBox="0 0 980 560" role="img" aria-label="命运耦合动态场">
        <defs>
          <filter id="fieldGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text x="54" y="38" class="field-axis">变量输入</text>
        <text x="430" y="38" class="field-axis">耦合规则</text>
        <text x="826" y="38" class="field-axis">人生线可能性</text>
        ${inputEdges.map((edge, index) => `<path class="field-edge input-edge" d="${escapeHtml(edge.path)}" style="animation-delay:${(index * 0.13).toFixed(2)}s" />`).join("")}
        ${branchEdges.map((edge, index) => `<g>
          <path class="field-edge branch-edge" d="${escapeHtml(edge.path)}" style="stroke:${escapeHtml(edge.color)}; stroke-width:${escapeHtml(Math.max(2.4, Math.min(6, 2.4 + Math.abs(edge.strength))).toFixed(1))}; animation-delay:${(index * 0.17).toFixed(2)}s" />
          <circle class="signal-dot" r="${escapeHtml(Math.max(3, Math.min(6, 3 + Math.abs(edge.strength))).toFixed(1))}" style="fill:${escapeHtml(edge.color)}; animation-delay:${(index * 0.17).toFixed(2)}s">
            <animateMotion dur="${escapeHtml((3.1 + (index % 3) * 0.45).toFixed(2))}s" repeatCount="indefinite" path="${escapeHtml(edge.path)}" />
          </circle>
        </g>`).join("")}
        ${inputNodes.map((node, index) => `<g class="field-input-node" style="animation-delay:${(index * 0.08).toFixed(2)}s">
          <rect x="${escapeHtml(node.x - 42)}" y="${escapeHtml(node.y - 17)}" width="174" height="34" rx="8" />
          <text x="${escapeHtml(node.x + 45)}" y="${escapeHtml(node.y + 5)}" text-anchor="middle">${escapeHtml(trimText(node.label, 17))}</text>
        </g>`).join("")}
        ${couplingNodes.map((node, index) => `<g class="field-coupling-node" style="animation-delay:${(index * 0.12).toFixed(2)}s">
          <circle cx="${escapeHtml(node.x)}" cy="${escapeHtml(node.y)}" r="31" />
          <circle class="coupling-pulse" cx="${escapeHtml(node.x)}" cy="${escapeHtml(node.y)}" r="31" />
          <text x="${escapeHtml(node.x)}" y="${escapeHtml(node.y - 2)}" text-anchor="middle">${escapeHtml(trimText(node.label, 12))}</text>
          <text x="${escapeHtml(node.x)}" y="${escapeHtml(node.y + 15)}" text-anchor="middle" class="field-mini">触发</text>
        </g>`).join("")}
        ${branchNodes.map((node, index) => {
          const radius = Math.max(33, Math.min(58, 28 + node.probability * 0.42));
          return `<g class="field-branch-node ${escapeHtml(node.id === strongest.id ? "dominant" : "")}" style="--branch-color:${escapeHtml(branchColor(node.id))}; animation-delay:${(index * 0.18).toFixed(2)}s">
            <circle class="branch-orbit" cx="${escapeHtml(node.x)}" cy="${escapeHtml(node.y)}" r="${escapeHtml(radius.toFixed(1))}" />
            <circle class="branch-core" cx="${escapeHtml(node.x)}" cy="${escapeHtml(node.y)}" r="22" />
            <text x="${escapeHtml(node.x)}" y="${escapeHtml(node.y - 33)}" text-anchor="middle" class="field-branch-title">${escapeHtml(node.label)}</text>
            <text x="${escapeHtml(node.x)}" y="${escapeHtml(node.y + 6)}" text-anchor="middle" class="field-branch-weight">${escapeHtml(formatProbability(node.probability))}</text>
          </g>`;
        }).join("")}
      </svg>
      <div class="coupling-field-cards">
        ${couplings.slice(0, 4).map((item) => {
          const branches = couplingBranches(item).map(branchName).join(" / ");
          return `<article>
            <strong>${escapeHtml(item.name || item.id)}</strong>
            <span>${escapeHtml(branches || "未指向分支")}</span>
            <p>${escapeHtml(item.interpretation || item.effect?.interpretation || "当前耦合正在改变人生线的压力。")}</p>
          </article>`;
        }).join("")}
      </div>
    </div>
  </section>`;
}

function renderSymbolicSignals(report) {
  const symbolic = report.symbolic_signals;
  if (!symbolic || !symbolic.signals?.length) return "";
  const couplings = report.symbolic_couplings || [];

  return `<section>
    <h2>象征线索与弱信号</h2>
    <p class="small">这里不是把名字、地点、宠物或偶然事件当成玄学因果，而是观察它们如何和记忆、身份、羞耻、责任、作品署名发生连接，成为低权重但长期存在的命运变量。</p>
    <div class="grid">
      ${symbolic.signals.map((signal) => `<div class="card">
        <h3>${escapeHtml(signal.name)} <span class="score">${escapeHtml(signal.confidence)}</span></h3>
        <p>${escapeHtml(signal.interpretation)}</p>
        <p class="effect">${escapeHtml(signal.life_effect)}</p>
        <p class="small">分支影响：${escapeHtml(JSON.stringify(signal.branch_effect || {}))}</p>
      </div>`).join("")}
    </div>
    <h3>象征耦合</h3>
    <div class="grid">
      ${couplings.map((rule) => `<div class="card force ${Number(rule.branch_effects?.rupture || 0) > 0 ? "constraint" : "support"}">
        <h3>${escapeHtml(rule.name)}</h3>
        <p>${escapeHtml(rule.interpretation)}</p>
        <p class="small">分支影响：${escapeHtml(JSON.stringify(rule.branch_effects || {}))}</p>
      </div>`).join("") || `<div class="card"><p>当前没有命中象征耦合。</p></div>`}
    </div>
  </section>`;
}

function variableName(id) {
  const names = {
    self_trust: "自我信任",
    action_momentum: "行动动量",
    relational_safety: "关系安全感",
    financial_buffer: "资产缓冲",
    body_recovery: "身体恢复力",
    social_visibility: "社会可见度",
    family_gravity: "家庭牵制力",
    identity_flexibility: "身份弹性"
  };

  return names[id] || id;
}

function renderUncertainty(key, uncertainty = {}) {
  const item = uncertainty[key];
  if (!item) return "";
  const range = `${item.low} - ${item.high}`;
  const reasons = (item.reasons || []).slice(0, 3).join("；");

  return `<p class="state-note">区间 ${escapeHtml(range)}，波动 ${escapeHtml(item.volatility)}${reasons ? `：${escapeHtml(reasons)}` : ""}</p>`;
}

function renderStateBars(state, uncertainty = {}) {
  return `<div class="state-bars">
    ${Object.entries(state || {}).map(([key, value]) => `<div class="state-row">
      <span>${escapeHtml(variableName(key))}</span>
      <div class="bar"><i style="width:${Math.max(0, Math.min(10, Number(value || 0))) * 10}%"></i></div>
      <b>${escapeHtml(value)}</b>
      ${renderUncertainty(key, uncertainty)}
    </div>`).join("")}
  </div>`;
}

function renderLifeEvolution(report) {
  const evolution = report.life_evolution;
  if (!evolution) return "";

  return `<section>
    <h2>纵向演化模拟</h2>
    <p class="small">这里不是一次性判断，而是模拟不同分支如何在 3 个月、1 年、3 年、10 年里改变人生状态变量。</p>
    <div class="card">
      <h3>初始人生状态变量</h3>
      ${renderStateBars(evolution.initial_state)}
    </div>
    <div class="evolution-grid">
      ${evolution.branch_timelines.map((branch) => `<div class="card evolution-card">
        <h3>${escapeHtml(branchName(branch.branch_id))}</h3>
        <p class="small">触发事件：${escapeHtml(branch.events.map((event) => event.name).join(" / ") || "无")}</p>
        ${branch.timeline.map((step) => `<div class="evolution-step">
          <h4>${escapeHtml(step.horizon_name)}</h4>
          <p class="small">最强变量：${escapeHtml(variableName(step.summary.strongest_variable))} ${escapeHtml(step.summary.strongest_score)}；最弱变量：${escapeHtml(variableName(step.summary.weakest_variable))} ${escapeHtml(step.summary.weakest_score)}</p>
          ${renderStateBars(step.state, step.uncertainty)}
        </div>`).join("")}
      </div>`).join("")}
    </div>
  </section>`;
}

function confidenceLabel(level) {
  const labels = {
    high: "高置信",
    medium: "中置信",
    low: "低置信"
  };

  return labels[level] || level;
}

function renderCalibration(report) {
  const calibration = report.calibration;
  if (!calibration) return "";

  const topConfidence = calibration.confidence_items.slice(0, 8);

  return `<section>
    <h2>预测校准层</h2>
    <p class="small">这里不是新增预测，而是评估预测依据是否足够强：哪些来自行为历史，哪些来自外部观察，哪些只是弱推断。</p>
    <div class="score-grid">
      <div class="metric"><strong>${escapeHtml(calibration.summary.evidence_score)}</strong><span>证据总分</span><small>${escapeHtml(calibration.summary.reliability_label)}</small></div>
      <div class="metric"><strong>${escapeHtml(calibration.summary.high_confidence_count)}</strong><span>高置信模式</span><small>多证据一致</small></div>
      <div class="metric"><strong>${escapeHtml(calibration.summary.contradiction_count)}</strong><span>矛盾信号</span><small>预测穿透点</small></div>
    </div>

    <h3>证据来源</h3>
    <div class="grid">
      ${calibration.evidence_profile.sources.map((source) => `<div class="card">
        <h3>${escapeHtml(source.name)} <span class="score">${escapeHtml(source.weighted_score)}</span></h3>
        <p>${escapeHtml(source.description)}</p>
        <p><strong>数量：</strong>${escapeHtml(source.count)} <strong>权重：</strong>${escapeHtml(source.weight)}</p>
      </div>`).join("")}
    </div>

    <h3>高权重预测项</h3>
    <div class="grid">
      ${topConfidence.map((item) => `<div class="card">
        <h3>${escapeHtml(item.name)} <span class="score">${escapeHtml(confidenceLabel(item.confidence_level))}</span></h3>
        <p><strong>类别：</strong>${escapeHtml(item.group_id)}</p>
        <p><strong>模式分：</strong>${escapeHtml(item.pattern_score)} <strong>置信度：</strong>${escapeHtml(item.confidence.toFixed(2))}</p>
      </div>`).join("")}
    </div>

    <h3>矛盾检测</h3>
    <div class="grid">
      ${calibration.contradictions.length ? calibration.contradictions.map((item) => `<div class="card force constraint">
        <h3>${escapeHtml(item.name)} <span class="score">${escapeHtml(item.confidence_score.toFixed(2))}</span></h3>
        <p>${escapeHtml(item.description)}</p>
        <p><strong>风险：</strong>${escapeHtml(item.risk)}</p>
        <p><strong>命中词：</strong>${escapeHtml(item.hits.join(" / "))}</p>
      </div>`).join("") : `<div class="card"><p>当前没有检测到强矛盾信号。</p></div>`}
    </div>
  </section>`;
}

function renderConfidenceExplanation(report) {
  const explanation = report.confidence_explanation;
  if (!explanation) return "";

  return `<section>
    <h2>为什么可以相信</h2>
    <p class="small">${escapeHtml(explanation.summary.explanation)}</p>
    <div class="grid">
      ${explanation.strongest_claims.map((item) => `<div class="card">
        <h3>${escapeHtml(item.name)} <span class="score">${escapeHtml(item.confidence)}</span></h3>
        <p>${escapeHtml(item.explanation)}</p>
        <p class="small">${escapeHtml(item.group_id)} / ${escapeHtml(item.confidence_level)}</p>
      </div>`).join("")}
    </div>
    <h3>不确定性来源</h3>
    <div class="grid">
      ${explanation.uncertainty_sources.slice(0, 6).map((item) => `<div class="card force constraint">
        <p>${escapeHtml(item)}</p>
      </div>`).join("") || `<div class="card"><p>当前没有明显不确定性来源。</p></div>`}
    </div>
  </section>`;
}

function renderDeepSimulation(report) {
  const simulation = report.deep_simulation;
  if (!simulation || !simulation.rounds?.length) return "";
  const cost = report.llm_simulation_cost;
  const finalMemory = simulation.final_agent_memory || [];

  return `<section>
    <h2>多轮 Agent 深度模拟</h2>
    <p class="small">这一层模拟内在 agent 和外部 agent 在多个事件回合中的反应。它比静态匹配更深，但仍保持可解释和低成本。</p>
    ${cost ? `<div class="score-grid">
      <div class="metric"><strong>${escapeHtml(cost.estimated_total_tokens)}</strong><span>LLM token 预估</span><small>${escapeHtml(cost.profile_name)}</small></div>
      <div class="metric"><strong>${escapeHtml(cost.active_agent_count)}</strong><span>活跃 agent</span><small>${escapeHtml(cost.round_count)} 轮模拟</small></div>
      <div class="metric"><strong>${escapeHtml(cost.calls.reduce((sum, call) => sum + Number(call.count || 0), 0))}</strong><span>预计 LLM 调用</span><small>agent / round / report</small></div>
    </div>` : ""}
    <div class="card">
      <h3>${escapeHtml(simulation.profile.name)} 模式</h3>
      <p>${escapeHtml(simulation.profile.description)}</p>
      <p><strong>活跃 agent：</strong>${escapeHtml((simulation.active_agents || []).map((agent) => agent.name).join(" / "))}</p>
    </div>
    <div class="grid">
      ${finalMemory.slice(0, 6).map((memory) => `<div class="card">
        <h3>${escapeHtml(memory.agent_name)} <span class="score">${escapeHtml(Number(memory.accumulated_intensity || 0).toFixed(2))}</span></h3>
        <p>${escapeHtml(memory.theme)}</p>
        <p class="small">${escapeHtml(memory.last_observation || "")}</p>
      </div>`).join("")}
    </div>
    <div class="evolution-grid">
      ${simulation.rounds.map((round) => `<div class="card evolution-card">
        <h3>第 ${escapeHtml(round.round_number)} 轮：${escapeHtml(round.round_name)}</h3>
        <p>${escapeHtml(round.event)}</p>
        <p class="small">当前最强状态：${escapeHtml(variableName(round.summary.strongest_state))} ${escapeHtml(round.summary.strongest_state_score)}；主导分支压力：${escapeHtml(branchName(round.summary.strongest_branch))} ${escapeHtml(round.summary.strongest_branch_score.toFixed ? round.summary.strongest_branch_score.toFixed(1) : round.summary.strongest_branch_score)}</p>
        ${renderStateBars(round.state_after_round)}
        <div class="grid">
          ${round.agent_reactions.slice(0, 6).map((reaction) => `<div class="card">
            <h3>${escapeHtml(reaction.agent_name)} <span class="score">${escapeHtml(Number(reaction.intensity || 0).toFixed(2))}</span></h3>
            <p>${escapeHtml(reaction.stance)}</p>
          </div>`).join("")}
        </div>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderLlmReactionPlan(report) {
  const plan = report.llm_reaction_plan;
  if (!plan) return "";

  return `<section>
    <h2>LLM Reaction Adapter</h2>
    <p class="small">当前是 dry-run：系统只生成未来要发给模型的调用计划，不实际消耗 API token。</p>
    <div class="score-grid">
      <div class="metric"><strong>${escapeHtml(plan.estimated_total_tokens)}</strong><span>计划 token</span><small>${escapeHtml(plan.status)}</small></div>
      <div class="metric"><strong>${escapeHtml(plan.agent_reaction_calls.total_calls)}</strong><span>Agent reaction</span><small>${escapeHtml(plan.provider)}</small></div>
      <div class="metric"><strong>${escapeHtml(plan.round_synthesis_calls.total_calls + 1)}</strong><span>综合调用</span><small>round + report</small></div>
    </div>
    <div class="grid">
      ${plan.agent_reaction_calls.preview_calls.slice(0, 4).map((call) => `<div class="card">
        <h3>${escapeHtml(call.call_id)}</h3>
        <p><strong>Agent：</strong>${escapeHtml(call.agent_name)}</p>
        <p><strong>模型：</strong>${escapeHtml(call.model)}</p>
        <p><strong>预计 tokens：</strong>${escapeHtml(call.estimated_tokens)}</p>
        <p class="small">${escapeHtml(call.prompt.slice(0, 360))}...</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderBranches(report) {
  return `<section>
    <h2>三条平行人生线</h2>
    <div class="branches">
      ${report.branches.map((branch) => `<div class="card branch">
        <h3>${escapeHtml(branch.cinematic_name || branchName(branch.id))} <span class="score">${escapeHtml(formatProbability(branchProbability(report, branch.id)))}</span></h3>
        <p class="small">${escapeHtml(branch.premise)}</p>
        <p>${escapeHtml(branch.trajectory)}</p>
        ${branch.narrative_logic ? `<p class="effect">${escapeHtml(branch.narrative_logic)}</p>` : ""}
        ${(branch.future_scenes || []).map((scene) => `<p><strong>${escapeHtml(scene.horizon)}：</strong>${escapeHtml(scene.text)}</p>`).join("")}
        ${branch.shareable_sentence ? `<p class="small">${escapeHtml(branch.shareable_sentence)}</p>` : ""}
        <p><strong>可能转折点：</strong>${escapeHtml(branch.likely_inflection)}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function branchTheme(id) {
  return {
    inertia: {
      className: "line-inertia",
      label: "现实惯性宇宙",
      shortLabel: "主线",
      description: "已成现实的人生继续向前延伸，旧模式仍然保留最大惯性。"
    },
    intervention: {
      className: "line-intervention",
      label: "隐秘转向宇宙",
      shortLabel: "转向线",
      description: "一个关键行为先动起来，新评价系统开始生成另一个自己。"
    },
    rupture: {
      className: "line-rupture",
      label: "断裂重启宇宙",
      shortLabel: "重启线",
      description: "被压住的冲突突破现实边界，人生以更剧烈的方式重新排列。"
    }
  }[id] || {
    className: "line-inertia",
    label: id,
    shortLabel: id,
    description: "一条由当前材料生成的平行人生线。"
  };
}

function renderParallelUniverseMap(report) {
  const branches = report.branches || [];
  if (!branches.length) return "";

  const branchById = new Map(branches.map((branch) => [branch.id, branch]));
  const orderedBranches = ["inertia", "intervention", "rupture"]
    .map((id) => branchById.get(id))
    .filter(Boolean);
  const fallbackBranches = branches.filter((branch) => !orderedBranches.includes(branch));
  const visibleBranches = [...orderedBranches, ...fallbackBranches].slice(0, 3);
  const nodeRows = {
    inertia: 136,
    intervention: 62,
    rupture: 216
  };
  const branchPaths = {
    inertia: "M430 140 C520 118 622 126 730 136 C816 144 888 136 948 118",
    intervention: "M430 140 C512 86 598 58 704 60 C820 62 884 50 948 36",
    rupture: "M430 140 C514 190 604 222 708 220 C820 218 884 236 948 258"
  };

  return `<section class="universe-section">
    <div class="section-head">
      <div>
        <h2>三条平行宇宙人生线</h2>
        <p class="small">前半段是已经发生的现实主线：它不是直线，而是在反复波动中走到今天。到了现实节点，模型把未来拆成三个并行的自己：继续主线、隐秘转向、断裂重启。</p>
      </div>
      <span class="universe-node-label">现实分岔点</span>
    </div>
    <div class="universe-map">
      <svg viewBox="0 0 980 320" role="img" aria-label="三条平行宇宙人生线">
        <defs>
          <filter id="lineGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path class="past-shadow" d="M34 150 C76 106 116 194 160 150 S244 106 288 150 S360 196 430 140" />
        <path class="past-wave" d="M34 150 C76 106 116 194 160 150 S244 106 288 150 S360 196 430 140" />
        <circle class="split-halo" cx="430" cy="140" r="34" />
        <circle class="split-node" cx="430" cy="140" r="10" />
        <text x="48" y="92" class="map-kicker">已成现实的人生</text>
        <text x="338" y="112" class="map-kicker">现实节点</text>
        ${visibleBranches.map((branch) => {
          const theme = branchTheme(branch.id);
          const row = nodeRows[branch.id] || 136;
          const path = branchPaths[branch.id] || branchPaths.inertia;

          return `<g class="${escapeHtml(theme.className)}">
            <path class="future-path" d="${escapeHtml(path)}" />
            <circle class="future-node" cx="948" cy="${escapeHtml(row)}" r="9" />
            <text x="758" y="${escapeHtml(row - 20)}" class="branch-title">${escapeHtml(theme.label)}</text>
            <text x="758" y="${escapeHtml(row + 2)}" class="branch-score">可能性 ${escapeHtml(formatProbability(branchProbability(report, branch.id)))}</text>
          </g>`;
        }).join("")}
      </svg>
      <div class="universe-cards">
        ${visibleBranches.map((branch) => {
          const theme = branchTheme(branch.id);

          return `<article class="${escapeHtml(theme.className)}">
            <span>${escapeHtml(theme.shortLabel)}</span>
            <strong>${escapeHtml(branch.cinematic_name || theme.label)}</strong>
            <b>${escapeHtml(formatProbability(branchProbability(report, branch.id)))}</b>
            <p>${escapeHtml(theme.description)}</p>
          </article>`;
        }).join("")}
      </div>
    </div>
  </section>`;
}

function renderHtml(seed, report) {
  const stageName = zh.stages[report.life_stage] || report.life_stage;
  const pressure = pressureText(report.stage.pressure_fields);

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>见相 FormSight 平行人生模拟报告</title>
  <style>
    :root { --ink:#172121; --muted:#657371; --line:rgba(24,33,33,.13); --panel:#fffaf0; --teal:#1f6f69; --rust:#b45a35; --plum:#65415f; --gold:#b38a35; --night:#101717; --night2:#182221; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; background:
      linear-gradient(135deg,rgba(16,23,23,.98),rgba(24,34,33,.97) 46%,rgba(47,38,43,.96)),
      #101717; min-height:100vh; position:relative; overflow-x:hidden; }
    body:before { content:""; position:fixed; inset:0; pointer-events:none; background:
      linear-gradient(rgba(255,250,240,.035) 1px,transparent 1px),
      linear-gradient(90deg,rgba(255,250,240,.035) 1px,transparent 1px),
      linear-gradient(120deg,transparent 0 44%,rgba(179,138,53,.08) 45%,transparent 47% 100%);
      background-size:42px 42px,42px 42px,220px 220px; opacity:.72; }
    body:after { content:""; position:fixed; inset:0; pointer-events:none; background:
      linear-gradient(180deg,rgba(255,255,255,.05),transparent 16%,transparent 82%,rgba(0,0,0,.22)),
      repeating-linear-gradient(180deg,rgba(255,255,255,.025) 0 1px,transparent 1px 4px); mix-blend-mode:screen; opacity:.32; }
    main { width:min(100%,960px); margin:0 auto; padding:24px 14px 46px; position:relative; z-index:1; }
    .hero, section { border:1px solid rgba(255,250,240,.42); border-radius:10px; background:linear-gradient(145deg,rgba(255,250,240,.96),rgba(244,239,228,.92)); box-shadow:0 24px 60px rgba(0,0,0,.26),0 0 0 1px rgba(255,255,255,.18) inset; backdrop-filter:blur(18px); }
    .hero { padding:28px; margin-bottom:16px; position:relative; overflow:hidden; background:linear-gradient(145deg,rgba(255,250,240,.98),rgba(237,244,241,.92) 58%,rgba(249,239,223,.9)); }
    .hero:before { content:""; position:absolute; inset:0; pointer-events:none; background:
      linear-gradient(120deg,transparent 0 38%,rgba(31,111,105,.12) 39%,transparent 42%),
      repeating-linear-gradient(90deg,rgba(31,111,105,.09) 0 1px,transparent 1px 18px); opacity:.45; }
    .hero:after { content:""; position:absolute; left:0; right:0; bottom:0; height:4px; background:linear-gradient(90deg,var(--teal),var(--gold),var(--plum)); opacity:.82; }
    .hero > * { position:relative; z-index:1; }
    .eyebrow { margin:0 0 8px; color:var(--teal); font-size:12px; font-weight:950; letter-spacing:0; }
    h1 { margin:0 0 14px; font-size:clamp(30px,7vw,54px); line-height:1.08; letter-spacing:0; }
    h2 { margin:0; font-size:22px; }
    h3 { margin:0 0 8px; font-size:18px; }
    p { line-height:1.75; }
    .lead { margin:0; color:#34403f; font-size:17px; }
    section { padding:20px; margin:16px 0; position:relative; overflow:hidden; }
    section:before { content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(90deg,rgba(31,111,105,.06),transparent 22%,transparent 78%,rgba(101,65,95,.05)); opacity:.9; }
    section > * { position:relative; z-index:1; }
    .grid { display:grid; gap:14px; grid-template-columns:repeat(2,minmax(0,1fr)); }
    .card { border:1px solid rgba(24,33,33,.12); border-radius:8px; padding:16px; background:rgba(255,255,255,.62); box-shadow:0 10px 24px rgba(22,31,31,.06); }
    .result-first { border-color:rgba(31,111,105,.34); background:linear-gradient(135deg,rgba(255,250,240,.98),rgba(232,245,241,.94)); }
    .result-lead { margin:0 0 12px; font-size:18px; font-weight:850; color:#263332; }
    .verdict { border-left:4px solid var(--rust); padding:11px 13px; margin:12px 0; background:rgba(180,90,53,.08); font-weight:950; line-height:1.65; }
    .result-lines { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
    .result-lines article { border:1px solid rgba(24,33,33,.12); border-radius:8px; padding:15px; background:rgba(255,255,255,.66); border-top:5px solid var(--gold); box-shadow:0 10px 26px rgba(22,31,31,.07); }
    .result-lines article.intervention { border-top-color:var(--teal); }
    .result-lines article.rupture { border-top-color:var(--plum); }
    .line-head { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:8px; }
    .line-head span { color:var(--muted); font-size:12px; font-weight:950; }
    .line-head b { color:var(--rust); font-size:28px; }
    .result-lines h3 { font-size:18px; margin:0 0 8px; }
    .result-lines p { margin:8px 0 0; color:#34403f; font-size:13px; line-height:1.62; }
    .card-top { display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:10px; }
    .kind { color:var(--teal); font-size:12px; font-weight:900; }
    .score { display:inline-flex; min-width:34px; min-height:26px; align-items:center; justify-content:center; border-radius:999px; color:white; background:var(--teal); font-weight:900; padding:3px 8px; font-size:13px; }
    .tag { display:inline-block; margin:4px 6px 0 0; padding:5px 9px; border-radius:999px; background:rgba(31,111,105,.1); color:#244c49; font-weight:800; font-size:13px; }
    .small { color:var(--muted); font-size:13px; }
    .effect { color:#453c38; border-left:3px solid var(--gold); padding-left:10px; }
    .seed { white-space:pre-wrap; color:#3b4544; overflow:auto; }
    .score-grid { display:grid; gap:12px; grid-template-columns:repeat(3,minmax(0,1fr)); }
    .metric { padding:16px; border:1px solid rgba(24,33,33,.12); border-radius:8px; background:rgba(255,255,255,.62); box-shadow:0 10px 24px rgba(22,31,31,.06); }
    .metric strong { display:block; color:var(--rust); font-size:34px; line-height:1; }
    .metric span { display:block; margin:8px 0 4px; font-weight:900; }
    .metric small { color:var(--muted); }
    .force.support { border-left:5px solid var(--teal); }
    .force.constraint { border-left:5px solid var(--rust); }
    .branch-weight { display:grid; gap:8px; grid-template-columns:repeat(3,minmax(0,1fr)); margin-top:14px; }
    .branch-weight span { padding:12px; border-radius:8px; background:rgba(31,111,105,.09); font-weight:900; text-align:center; }
    .branches { display:grid; gap:14px; grid-template-columns:repeat(3,minmax(0,1fr)); }
    .branch { border-left:5px solid var(--gold); }
    .branch:nth-child(2) { border-left-color:var(--teal); }
    .branch:nth-child(3) { border-left-color:var(--rust); }
    .timeline { display:grid; gap:12px; }
    .timeline-item { display:grid; grid-template-columns:64px 1fr; gap:12px; align-items:start; border:1px solid rgba(24,33,33,.12); border-radius:8px; padding:14px; background:rgba(255,255,255,.62); box-shadow:0 10px 24px rgba(22,31,31,.06); }
    .timeline-item span { display:flex; align-items:center; justify-content:center; min-height:40px; border-radius:999px; background:rgba(180,90,53,.13); color:var(--rust); font-weight:900; }
    .sediment-head { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin:14px 0; }
    .sediment-head div { border:1px solid rgba(31,111,105,.16); border-radius:8px; padding:14px; background:rgba(232,245,241,.7); }
    .sediment-head strong { display:block; color:var(--teal); font-size:30px; line-height:1; }
    .sediment-head span { color:var(--muted); font-size:12px; font-weight:900; }
    .sediment-card p { font-size:13px; line-height:1.62; }
    .sediment-tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    .sediment-tags span { border:1px solid rgba(101,65,95,.18); border-radius:999px; padding:7px 10px; background:rgba(101,65,95,.07); color:#4a3948; font-size:12px; font-weight:900; }
    .evolution-grid { display:grid; gap:14px; grid-template-columns:1fr; margin-top:14px; }
    .evolution-card { display:grid; gap:12px; }
    .evolution-step { border-top:1px solid var(--line); padding-top:12px; }
    .evolution-step h4 { margin:0 0 6px; font-size:15px; }
    .state-bars { display:grid; gap:8px; }
    .state-row { display:grid; grid-template-columns:96px 1fr 28px; gap:8px; align-items:center; font-size:13px; }
    .state-note { grid-column:2 / 4; margin:0; color:var(--muted); font-size:12px; line-height:1.45; }
    .bar { height:9px; border-radius:999px; background:rgba(29,37,38,.12); overflow:hidden; }
    .bar i { display:block; height:100%; border-radius:999px; background:linear-gradient(90deg,var(--teal),var(--gold)); }
    .section-head { display:flex; gap:16px; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .section-head h2 { margin-bottom:8px; }
    .universe-node-label { flex:0 0 auto; display:inline-flex; align-items:center; min-height:34px; padding:0 12px; border-radius:999px; color:#73412b; background:rgba(180,90,53,.12); font-size:13px; font-weight:900; }
    .universe-map { display:grid; gap:14px; }
    .universe-map svg { width:100%; min-height:260px; border:1px solid rgba(255,250,240,.5); border-radius:8px; background:linear-gradient(180deg,rgba(14,24,24,.94),rgba(28,37,36,.9)); box-shadow:0 18px 42px rgba(0,0,0,.24) inset; }
    .past-shadow { fill:none; stroke:rgba(29,37,38,.10); stroke-width:9; stroke-linecap:round; }
    .past-wave { fill:none; stroke:#7c6a5b; stroke-width:3.5; stroke-linecap:round; stroke-dasharray:13 12; filter:url(#lineGlow); }
    .split-halo { fill:rgba(179,138,53,.18); stroke:rgba(179,138,53,.42); stroke-width:2; }
    .split-node { fill:var(--gold); stroke:#fffdf8; stroke-width:3; }
    .future-path { fill:none; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round; filter:url(#lineGlow); }
    .future-node { stroke:#fffdf8; stroke-width:3; }
    .line-inertia .future-path, .line-inertia .future-node { stroke:var(--gold); fill:var(--gold); }
    .line-intervention .future-path, .line-intervention .future-node { stroke:var(--teal); fill:var(--teal); }
    .line-rupture .future-path, .line-rupture .future-node { stroke:var(--plum); fill:var(--plum); }
    .map-kicker { fill:var(--muted); font-size:14px; font-weight:900; }
    .branch-title { fill:var(--ink); font-size:16px; font-weight:900; }
    .branch-score { fill:var(--muted); font-size:13px; font-weight:800; }
    .universe-cards { display:grid; gap:12px; grid-template-columns:repeat(3,minmax(0,1fr)); }
    .universe-cards article { display:grid; grid-template-columns:1fr auto; gap:6px 10px; align-items:start; min-height:138px; padding:14px; border:1px solid var(--line); border-radius:8px; background:rgba(255,255,255,.66); border-top:5px solid var(--gold); }
    .universe-cards article.line-intervention { border-top-color:var(--teal); }
    .universe-cards article.line-rupture { border-top-color:var(--plum); }
    .universe-cards span { color:var(--muted); font-size:12px; font-weight:900; }
    .universe-cards strong { grid-column:1 / 2; font-size:17px; }
    .universe-cards b { grid-column:2 / 3; grid-row:1 / 3; color:var(--rust); font-size:28px; line-height:1; }
    .universe-cards p { grid-column:1 / -1; margin:4px 0 0; color:#34403f; font-size:13px; line-height:1.6; }
    .coupling-field { display:grid; gap:14px; }
    .coupling-field svg { width:100%; min-height:420px; border:1px solid rgba(255,250,240,.5); border-radius:8px; background:linear-gradient(180deg,rgba(14,24,24,.94),rgba(28,37,36,.9)); box-shadow:0 18px 42px rgba(0,0,0,.24) inset; }
    .field-axis { fill:var(--muted); font-size:13px; font-weight:900; }
    .field-edge { fill:none; stroke-linecap:round; stroke-linejoin:round; opacity:.68; }
    .input-edge { stroke:rgba(104,112,111,.38); stroke-width:1.8; stroke-dasharray:5 12; animation:fieldDash 6s linear infinite; }
    .branch-edge { stroke-dasharray:12 16; animation:fieldDash 3.2s linear infinite; filter:url(#fieldGlow); opacity:.78; }
    .signal-dot { filter:url(#fieldGlow); opacity:.84; }
    .field-input-node rect { fill:rgba(255,255,255,.82); stroke:rgba(31,111,105,.28); stroke-width:1.2; }
    .field-input-node text { fill:#34403f; font-size:12px; font-weight:850; }
    .field-input-node { animation:fieldSoftPulse 4.6s ease-in-out infinite; }
    .field-coupling-node circle:first-child { fill:rgba(255,253,248,.9); stroke:rgba(180,90,53,.48); stroke-width:2.4; filter:url(#fieldGlow); }
    .coupling-pulse { fill:none; stroke:rgba(180,90,53,.38); stroke-width:2; transform-origin:center; animation:couplingPulse 2.8s ease-out infinite; }
    .field-coupling-node text { fill:var(--ink); font-size:11px; font-weight:900; }
    .field-coupling-node .field-mini { fill:var(--rust); font-size:10px; font-weight:900; }
    .field-branch-node { animation:branchBreath 3.6s ease-in-out infinite; }
    .branch-orbit { fill:transparent; stroke:var(--branch-color); stroke-width:2.4; stroke-dasharray:8 9; opacity:.52; filter:url(#fieldGlow); }
    .field-branch-node.dominant .branch-orbit { stroke-width:4; opacity:.78; }
    .branch-core { fill:var(--branch-color); stroke:#fffdf8; stroke-width:4; filter:url(#fieldGlow); }
    .field-branch-title { fill:var(--ink); font-size:14px; font-weight:900; }
    .field-branch-weight { fill:#fffdf8; font-size:13px; font-weight:950; }
    .coupling-field-cards { display:grid; gap:12px; grid-template-columns:repeat(4,minmax(0,1fr)); }
    .coupling-field-cards article { min-height:154px; padding:13px; border:1px solid var(--line); border-radius:8px; background:rgba(255,255,255,.68); }
    .coupling-field-cards strong { display:block; font-size:14px; line-height:1.35; }
    .coupling-field-cards span { display:block; margin:8px 0; color:var(--teal); font-size:12px; font-weight:900; }
    .coupling-field-cards p { margin:0; color:#34403f; font-size:12px; line-height:1.62; }
    .variable-force-map { display:grid; gap:14px; }
    .variable-force-map svg { width:100%; min-height:390px; border:1px solid rgba(255,250,240,.5); border-radius:8px; background:linear-gradient(180deg,rgba(14,24,24,.94),rgba(28,37,36,.9)); box-shadow:0 18px 42px rgba(0,0,0,.24) inset; }
    .variable-force-edge { fill:none; stroke-linecap:round; stroke-dasharray:12 14; opacity:.74; filter:url(#variableGlow); animation:fieldDash 3.4s linear infinite; }
    .variable-signal { opacity:.9; filter:url(#variableGlow); }
    .variable-force-node { animation:variableNodeBreath 3.8s ease-in-out infinite; }
    .variable-force-node circle:first-child { fill:rgba(255,253,248,.9); stroke:var(--node-color); stroke-width:3; filter:url(#variableGlow); }
    .variable-force-node.strongest circle:first-child { stroke-width:4.5; }
    .variable-node-pulse { fill:none; stroke:var(--node-color); stroke-width:2; opacity:.44; transform-origin:center; animation:couplingPulse 2.9s ease-out infinite; }
    .variable-force-node text { fill:var(--ink); font-size:15px; font-weight:950; }
    .variable-force-node .variable-value { fill:var(--muted); font-size:13px; font-weight:900; }
    .pressure-core circle:first-child { fill:rgba(255,253,248,.96); stroke:rgba(31,111,105,.58); stroke-width:3; filter:url(#variableGlow); }
    .pressure-core-pulse { fill:none; stroke:rgba(31,111,105,.36); stroke-width:2; animation:couplingPulse 2.6s ease-out infinite; }
    .pressure-core text { fill:var(--ink); font-size:13px; font-weight:950; }
    .variable-spine { fill:none; stroke:var(--gold); stroke-width:3.2; stroke-linecap:round; stroke-dasharray:10 13; opacity:.56; animation:fieldDash 4.4s linear infinite; }
    .variable-spine.intervention-spine { stroke:var(--teal); stroke-width:4.4; opacity:.78; }
    .variable-spine.rupture-spine { stroke:var(--plum); opacity:.45; }
    .variable-branch-label { fill:var(--muted); font-size:13px; font-weight:900; }
    .variable-target { fill:var(--teal); stroke:#fffdf8; stroke-width:4; filter:url(#variableGlow); animation:branchBreath 3s ease-in-out infinite; }
    .variable-force-cards { display:grid; gap:12px; grid-template-columns:repeat(4,minmax(0,1fr)); }
    .variable-force-cards article { min-height:146px; padding:13px; border:1px solid var(--line); border-top:5px solid var(--teal); border-radius:8px; background:rgba(255,255,255,.68); }
    .variable-force-cards strong { display:block; font-size:15px; }
    .variable-force-cards b { display:block; margin:6px 0 8px; color:var(--rust); font-size:28px; line-height:1; }
    .force-caption { display:block; margin-top:7px; color:var(--muted); font-size:12px; font-weight:900; }
    .variable-force-cards p { margin:9px 0 0; color:#34403f; font-size:12px; line-height:1.58; }
    @keyframes fieldDash { to { stroke-dashoffset:-84; } }
    @keyframes fieldSoftPulse { 0%,100% { opacity:.78; } 50% { opacity:1; } }
    @keyframes couplingPulse { 0% { transform:scale(.92); opacity:.64; } 100% { transform:scale(1.42); opacity:0; } }
    @keyframes branchBreath { 0%,100% { opacity:.82; } 50% { opacity:1; } }
    @keyframes variableNodeBreath { 0%,100% { opacity:.84; } 50% { opacity:1; } }
    @media (max-width:720px) { .grid, .branches, .score-grid, .branch-weight, .universe-cards, .coupling-field-cards, .variable-force-cards, .result-lines, .sediment-head { grid-template-columns:1fr; } .hero, section { padding:18px; } .timeline-item { grid-template-columns:1fr; } .section-head { display:grid; } .universe-map svg { min-height:210px; } .coupling-field svg { min-height:340px; } .variable-force-map svg { min-height:320px; } }
  </style>
</head>
<body>
  <main>
    <div class="hero">
      <p class="eyebrow">FORMSIGHT / 见相 / A Parallel Life Simulation Engine</p>
      <h1>平行人生模拟报告</h1>
      <p class="lead">这不是算命，而是把输入材料拆成内在人格、外部社会力量、家庭系统、关系模式、资产机动性、环境压力、人生时间线、价值系统、决策风格与关键转折点，再模拟它们如何共同塑造未来分支。</p>
    </div>

    <section>
      <h2>当前问题</h2>
      <p>${escapeHtml(seed.profile?.current_question)}</p>
      <span class="tag">人生阶段：${escapeHtml(stageName)}</span>
      <span class="tag">压力场：${escapeHtml(pressure)}</span>
    </section>

    ${renderResultFirst(report)}
    ${renderWorldState(report)}
    ${renderMaterialQuality(report)}
    ${renderReviewPath(report)}
    ${renderRealityVariables(report)}
    ${renderVariableForceFocus(report)}
    ${renderTimeline(report)}
    ${renderEventSedimentation(report)}
    ${renderAgents(report)}
    ${renderPatternSection("求学经历与同伴关系", "学校阶段、同学关系、老师评价和成长状态，会影响一个人后来如何面对选择、比较、专业路径和新圈层。", report.education_path_matches || [], "求学")}
    ${renderPatternSection("代际家庭与原生结构", "原生家庭不是背景信息，而是会改变羞耻感、责任感、边界感和人生选择解释方式的底层结构。", report.intergenerational_family_matches || [], "代际")}
    ${renderPatternSection("城市迁移与归属感", "地理位置、搬离原环境、城市错位和归属感分裂，会改变一个人有没有机会进入新的人生线。", report.place_mobility_matches || [], "城市")}
    ${renderPatternSection("同辈圈层与权威关系", "朋友、同学、老师、领导和导师型人物，会影响一个人是进入现实测试，还是继续被评价系统压住。", report.peer_authority_matches || [], "圈层")}
    ${renderPatternSection("阶层感与金钱羞耻", "钱不只是现金流，也是体面、安全感、被看低的记忆和选择权。没钱本身也会持续塑造现实。", report.class_money_shame_matches || [], "阶层")}
    ${renderPatternSection("身体形象、作息与数字生活", "身体可见性、性别经验、作息节律和信息摄入，会直接影响行动力、关系选择和未来线稳定性。", report.body_rhythm_digital_matches || [], "身体/信息")}
    ${renderPatternSection("意义系统与精神支点", "意义感、使命感、命运感和心理/玄学兴趣，会影响一个人如何解释自己，以及是否能把解释转成行动。", report.meaning_belief_matches || [], "意义")}
    ${renderPatternSection("感情经历痕迹", "早期亲密关系、背叛记忆、救赎幻想和关系修复经验，会改变一个人后续如何信任、投入、撤退和选择伴侣。", report.romantic_history_matches || [], "感情经历")}
    ${renderPatternSection("世界观与现实观", "一个人把世界看成危险场、机会场、零和场，还是可测试的现实场，会直接改变风险判断和行动方式。", report.worldview_orientation_matches || [], "世界观")}
    ${renderPatternSection("行动主权与控制感", "命运不是只由外部压力决定，也取决于一个人是否相信行动有用、是否能把选择变成实验。", report.agency_control_matches || [], "行动感")}
    ${renderPatternSection("时间感与未来感", "未来感长短、紧迫焦虑、过去固定和短周期规划能力，会影响一个人是慢慢转向还是突然重启。", report.time_future_orientation_matches || [], "未来感")}
    ${renderPatternSection("人生时间线模式", "一个人不是突然变成现在这样。时间线模式解释旧选择如何沉淀成今天的命运倾向。", report.life_timeline_matches, "时间线")}
    ${renderPatternSection("价值系统模式", "价值系统解释一个人愿意为什么忍耐、牺牲、冒险，或迟迟不动。", report.value_system_matches, "价值")}
    ${renderPatternSection("决策风格模式", "决策风格决定机会来临时，一个人是行动、等待、撤退，还是先在脑内模拟很久。", report.decision_style_matches, "决策")}
    ${renderPatternSection("社会资本与圈层跃迁", "命运不只取决于能力，也取决于一个人能否进入新的信息场、评价场和机会场。", report.social_capital_matches, "社会资本")}
    ${renderPatternSection("身体能量与长期损耗", "很多所谓命运转折，其实是身体和注意力系统不再继续补贴旧模式。", report.energy_depletion_matches, "能量")}
    ${renderPatternSection("亲密关系与婚育路径", "亲密关系会改变责任、稳定需求、试错空间和一个人的情绪底盘。", report.intimacy_family_path_matches, "亲密")}
    ${renderPatternSection("财富路径", "财富路径不只是收入，而是现金流、资产化、试错预算和选择权资本。", report.wealth_path_matches, "财富")}
    ${renderPatternSection("金钱人格", "金钱不是纯数字。一个人把钱理解成安全、自由、羞耻、证明还是逃离，会改变资产缓冲的演化方式。", report.money_personality_matches || [], "金钱人格")}
    ${renderPatternSection("储蓄与消费行为", "资产缓冲取决于能不能留住钱，也取决于压力、注意力和消费习惯如何影响储蓄。", report.saving_behavior_matches || [], "储蓄")}
    ${renderPatternSection("健康财务耦合", "身体风险会影响现金流、医疗支出、工作容量和长期复利能力。", report.health_financial_matches || [], "健康财务")}
    ${renderPatternSection("家庭财务牵连", "家庭支持既可能托底，也可能带来控制、稳定压力和选择权损耗。", report.family_finance_matches || [], "家庭财务")}
    ${renderPatternSection("收入路径", "收入路径决定干预线是只有概念，还是能长出现金流、服务收入、作品收入或稳定过渡。", report.income_path_matches || [], "收入")}
    ${renderPatternSection("宏观时代环境", "个人命运会被时代窗口、行业波动、AI 工具和城市成本重新塑形。", report.macro_era_matches, "时代")}
    ${renderPatternSection("家庭系统模式", "家庭不是背景板，而是会改变风险感、羞耻感和行动阈值的系统。", report.family_system_matches, "家庭")}
    ${renderPatternSection("关系模式", "关系模式决定一个人是否能被外部观察者校准，也决定压力什么时候变成撤退。", report.relationship_pattern_matches, "关系")}
    ${renderPatternSection("资产与阶层机动性", "资产不是只有钱，也包括技能、声誉、时间缓冲和试错成本。", report.asset_mobility_matches, "资产")}
    ${renderPatternSection("环境模式", "城市、行业和比较压力会改变同一个人格模式的命运结果。", report.environment_pattern_matches, "环境")}
    ${renderForces(report)}
    ${renderExternalAgents(report)}
    ${renderLifeEvents(report)}
    ${renderCalibration(report)}
    ${renderConfidenceExplanation(report)}
    ${renderPatternSection("未来关键转折点", "这些不是预言，而是当前结构更容易生成的人生关口。", report.turning_points, "转折")}
    ${renderSymbolicSignals(report)}
    ${renderCouplings(report)}
    ${renderDynamicCouplingField(report)}
    ${renderDeepSimulation(report)}
    ${renderLlmReactionPlan(report)}
    ${renderLifeEvolution(report)}
    ${renderParallelUniverseMap(report)}
    ${renderBranches(report)}

    <section>
      <h2>核心冲突</h2>
      <div class="card force constraint">
        <h3>${escapeHtml(report.core_conflict.name)}</h3>
        <p>${escapeHtml(report.core_conflict.dynamic)}</p>
        <p><strong>风险：</strong>${escapeHtml(report.core_conflict.risk)}</p>
      </div>
    </section>

    <section>
      <h2>原始输入材料</h2>
      <div class="card seed">${escapeHtml(JSON.stringify(seed, null, 2))}</div>
    </section>
  </main>
</body>
</html>`;
}

function main() {
  const seedPath = process.argv[2];
  const outputPath = process.argv[3] || "reports/report.html";

  if (!seedPath) {
    console.error("Usage: node src/render-report.js <seed.json> [output.html]");
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(path.resolve(seedPath), "utf8"));
  const report = simulate(seed);
  const html = renderHtml(seed, report);
  const resolvedOutput = path.resolve(outputPath);

  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
  fs.writeFileSync(resolvedOutput, html, "utf8");
  console.log(`Report written to ${resolvedOutput}`);
}

main();
