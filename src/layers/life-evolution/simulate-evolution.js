function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function applyStateBias(state, bias = {}) {
  const next = { ...state };

  Object.entries(bias || {}).forEach(([key, delta]) => {
    if (next[key] === undefined) return;
    next[key] = clamp(Number(next[key] || 0) + Number(delta || 0));
  });

  return next;
}

function deriveInitialLifeState(world, eventSedimentation = {}) {
  const scores = world.scores || {};
  const assets = world.assets || {};
  const network = world.network || {};
  const family = world.family || {};
  const health = world.health || {};
  const socialCapital = world.social_capital || {};
  const decisionStyle = world.decision_style || {};

  const certaintyBias = String(decisionStyle.default_mode || "").includes("certainty") ? 2 : 0;

  const baseState = {
    self_trust: clamp(5 - certaintyBias + Number(network.truth_tellers || 0)),
    action_momentum: clamp(3 + Number(socialCapital.public_visibility || 0) - certaintyBias),
    relational_safety: clamp(4 + Number(network.supportive_people || 0) - Number(network.draining_ties || 0)),
    financial_buffer: clamp(Number(scores.financial_runway || 0)),
    body_recovery: clamp(6 + Number(health.sleep_quality || 0) + Number(health.body_energy || 0) - Number(scores.energy_risk || 0)),
    social_visibility: clamp(2 + Number(socialCapital.public_visibility || 0) + (assets.reputation_assets || []).length),
    family_gravity: clamp(3 + Number(family.boundary_pressure || 0)),
    identity_flexibility: clamp(5 + Number(scores.life_mobility || 0) - certaintyBias)
  };

  return applyStateBias(baseState, eventSedimentation.state_bias || {});
}

function selectBranchEvents(branchId, eventEffects) {
  const selected = eventEffects.filter((event) => event.branch === branchId);

  if (branchId === "inertia") {
    return selected;
  }

  if (branchId === "intervention") {
    return selected;
  }

  return selected;
}

function applyEventEffects(state, events, multiplier) {
  const next = { ...state };

  events.forEach((event) => {
    Object.entries(event.effects || {}).forEach(([key, delta]) => {
      next[key] = clamp(Number(next[key] || 0) + Number(delta || 0) * multiplier);
    });
  });

  return next;
}

function hasMatch(matches, id) {
  return (matches || []).some((match) => match.id === id);
}

function applyFinancialEffect(effect, context) {
  if (!effect) return;
  context.interventionGrowth += Number(effect.intervention_growth || 0);
  context.interventionDrag += Number(effect.intervention_drag || 0);
  context.baselineDrag += Number(effect.baseline_drag || 0);
  context.volatility += Number(effect.volatility || 0);
  if (effect.reason) context.reasons.push(effect.reason);
}

function deriveFinancialDynamics({
  world,
  assetMobilityMatches = [],
  wealthPathMatches = [],
  moneyPersonalityMatches = [],
  savingBehaviorMatches = [],
  healthFinancialMatches = [],
  familyFinanceMatches = [],
  incomePathMatches = []
}) {
  const assets = world.assets || {};
  const wealthPath = world.wealth_path || {};
  const socialCapital = world.social_capital || {};
  const environment = world.environment || {};
  const skillCount = (assets.skill_assets || []).length;
  const reputationCount = (assets.reputation_assets || []).length;
  const debtPressure = Number(assets.debt_pressure || 0);
  const optionalityCapital = Number(wealthPath.optionality_capital || 0);
  const publicVisibility = Number(socialCapital.public_visibility || 0);
  const livingCostPressure = Number(environment.living_cost_pressure || 0);

  let interventionGrowth = 0;
  let interventionDrag = 0;
  let baselineDrag = 0;
  let volatility = 0.8;
  const reasons = [];
  const context = {
    interventionGrowth,
    interventionDrag,
    baselineDrag,
    volatility,
    reasons
  };

  if (hasMatch(assetMobilityMatches, "skill_based_mobility")) {
    context.interventionGrowth += 0.8 + skillCount * 0.15;
    context.volatility += 0.5;
    reasons.push("skill assets can become small external tests");
  }

  if (hasMatch(assetMobilityMatches, "reputation_buffer")) {
    context.interventionGrowth += 0.4 + reputationCount * 0.08;
    reasons.push("reputation can reduce opportunity search cost");
  }

  if (hasMatch(wealthPathMatches, "skill_to_asset_window")) {
    context.interventionGrowth += 1.1 + optionalityCapital * 0.25 + publicVisibility * 0.2;
    context.volatility += 0.8;
    reasons.push("public artifacts can convert skill into optionality");
  }

  if (hasMatch(wealthPathMatches, "low_runway_high_meaning")) {
    context.interventionGrowth += 0.4;
    context.interventionDrag += 0.35;
    context.volatility += 0.5;
    reasons.push("meaning-driven transition raises upside and downside at the same time");
  }

  if (hasMatch(wealthPathMatches, "cashflow_lock")) {
    context.interventionDrag += 0.7;
    context.volatility += 0.3;
    reasons.push("cashflow lock slows financial conversion");
  }

  if (hasMatch(assetMobilityMatches, "high_cost_transition")) {
    context.interventionDrag += 0.45 + livingCostPressure * 0.08;
    context.volatility += 0.4;
    reasons.push("high transition cost keeps the downside real");
  }

  if (hasMatch(assetMobilityMatches, "limited_runway")) {
    context.interventionDrag += 0.25 + debtPressure * 0.12;
    reasons.push("limited runway forces staged growth");
  }

  [
    moneyPersonalityMatches,
    savingBehaviorMatches,
    healthFinancialMatches,
    familyFinanceMatches,
    incomePathMatches
  ].flat().forEach((match) => applyFinancialEffect(match.financial_effect, context));

  const netInterventionGrowth = clamp(context.interventionGrowth - context.interventionDrag - context.baselineDrag * 0.25, -1.5, 1.8);

  return {
    intervention_financial_growth: Number(netInterventionGrowth.toFixed(2)),
    intervention_financial_volatility: Number(clamp(context.volatility, 0.4, 4.5).toFixed(2)),
    financial_baseline_drag: Number(context.baselineDrag.toFixed(2)),
    reasons: [...new Set(reasons)]
  };
}

function applyFinancialDynamics(state, branchId, multiplier, financialDynamics) {
  if (branchId !== "intervention") return { state, uncertainty: {} };

  const growth = Number(financialDynamics.intervention_financial_growth || 0);
  const volatility = Number(financialDynamics.intervention_financial_volatility || 0);
  const acceleration = Math.max(0, Number(multiplier || 1) - 1) * Math.max(0, growth) * 0.28;
  const nextFinancialBuffer = clamp(Number(state.financial_buffer || 0) + growth * Number(multiplier || 1) + acceleration);
  const downside = clamp(nextFinancialBuffer - volatility * Number(multiplier || 1) * 0.55);
  const upside = clamp(nextFinancialBuffer + volatility * Number(multiplier || 1) * 0.9);

  return {
    state: {
      ...state,
      financial_buffer: Number(nextFinancialBuffer.toFixed(2))
    },
    uncertainty: {
      financial_buffer: {
        low: Number(downside.toFixed(2)),
        high: Number(upside.toFixed(2)),
        volatility: Number(volatility.toFixed(2)),
        reasons: financialDynamics.reasons || []
      }
    }
  };
}

function summarizeState(state) {
  const strongest = Object.entries(state).sort((a, b) => b[1] - a[1])[0];
  const weakest = Object.entries(state).sort((a, b) => a[1] - b[1])[0];

  return {
    strongest_variable: strongest?.[0],
    strongest_score: strongest?.[1],
    weakest_variable: weakest?.[0],
    weakest_score: weakest?.[1]
  };
}

function simulateLifeEvolution({
  world,
  branches,
  eventEffects,
  timeHorizons,
  eventSedimentation,
  assetMobilityMatches,
  wealthPathMatches,
  moneyPersonalityMatches,
  savingBehaviorMatches,
  healthFinancialMatches,
  familyFinanceMatches,
  incomePathMatches
}) {
  const initialState = deriveInitialLifeState(world, eventSedimentation);
  const financialDynamics = deriveFinancialDynamics({
    world,
    assetMobilityMatches,
    wealthPathMatches,
    moneyPersonalityMatches,
    savingBehaviorMatches,
    healthFinancialMatches,
    familyFinanceMatches,
    incomePathMatches
  });

  const branchTimelines = branches.map((branch) => {
    const events = selectBranchEvents(branch.id, eventEffects);

    return {
      branch_id: branch.id,
      branch_name: branch.name,
      events: events.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description
      })),
      timeline: timeHorizons.map((horizon) => {
        const eventState = applyEventEffects(initialState, events, Number(horizon.multiplier || 1));
        const dynamicResult = applyFinancialDynamics(
          eventState,
          branch.id,
          Number(horizon.multiplier || 1),
          financialDynamics
        );
        const state = dynamicResult.state;

        return {
          horizon_id: horizon.id,
          horizon_name: horizon.name,
          state,
          uncertainty: dynamicResult.uncertainty,
          summary: summarizeState(state)
        };
      })
    };
  });

  return {
    initial_state: initialState,
    event_sedimentation: eventSedimentation,
    financial_dynamics: financialDynamics,
    branch_timelines: branchTimelines
  };
}

module.exports = {
  deriveInitialLifeState,
  simulateLifeEvolution
};
