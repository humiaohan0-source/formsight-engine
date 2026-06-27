const { readJson } = require("./shared/read-json");
const { scoreMaterialQuality } = require("./layers/seed-material/score-material-quality");
const { buildLifeGraph } = require("./layers/life-graph/build-life-graph");
const { buildEventSedimentation } = require("./layers/life-timeline/build-event-sedimentation");
const { initializeAgents } = require("./layers/agents/initialize-agents");
const { initializeExternalAgents } = require("./layers/agents/initialize-external-agents");
const { buildLifeState } = require("./layers/life-state/build-world-state");
const { matchPatterns, applyPatternBranchEffects } = require("./layers/life-state/match-patterns");
const { getLifeStage } = require("./layers/simulation/get-life-stage");
const { selectLifeEvents } = require("./layers/simulation/select-life-events");
const { selectTurningPoints } = require("./layers/simulation/select-turning-points");
const { applyCouplingRules } = require("./layers/simulation/apply-coupling-rules");
const { applyAdvancedCouplings } = require("./layers/simulation/apply-advanced-couplings");
const { applyReviewPathInfluence } = require("./layers/simulation/apply-review-path");
const { extractSymbolicSignals } = require("./layers/simulation/extract-symbolic-signals");
const { applySymbolicCouplings } = require("./layers/simulation/apply-symbolic-couplings");
const { sampleParallelBranches } = require("./layers/parallel-worlds/sample-branches");
const { deriveInitialLifeState, simulateLifeEvolution } = require("./layers/life-evolution/simulate-evolution");
const { runAgentRounds } = require("./layers/deep-simulation/run-agent-rounds");
const { estimateLlmSimulationCost } = require("./layers/deep-simulation/estimate-llm-cost");
const { buildLlmReactionPlan } = require("./layers/deep-simulation/build-llm-reaction-plan");
const { calibratePredictions } = require("./layers/calibration/calibrate-predictions");
const { buildConfidenceExplanation } = require("./layers/calibration/explain-confidence");
const { buildLifeLineNarratives } = require("./layers/report/build-life-line-narratives");
const { synthesizeReport } = require("./layers/report/synthesize-report");

function simulate(seed) {
  const agentDefinitions = readJson("data/inner-agents.json");
  const externalAgentDefinitions = readJson("data/external-agents.json");
  const conflictRules = readJson("data/conflict-rules.json");
  const lifeEvents = readJson("data/life-events.json");
  const couplingRules = readJson("data/coupling-rules.json");
  const stages = readJson("data/life-stages.json");
  const familySystemPatterns = readJson("data/family-system-patterns.json");
  const educationPathPatterns = readJson("data/education-path-patterns.json");
  const intergenerationalFamilyPatterns = readJson("data/intergenerational-family-patterns.json");
  const placeMobilityPatterns = readJson("data/place-mobility-patterns.json");
  const peerAuthorityPatterns = readJson("data/peer-authority-patterns.json");
  const classMoneyShamePatterns = readJson("data/class-money-shame-patterns.json");
  const bodyRhythmDigitalPatterns = readJson("data/body-rhythm-digital-patterns.json");
  const meaningBeliefPatterns = readJson("data/meaning-belief-patterns.json");
  const romanticHistoryPatterns = readJson("data/romantic-history-patterns.json");
  const worldviewOrientationPatterns = readJson("data/worldview-orientation-patterns.json");
  const agencyControlPatterns = readJson("data/agency-control-patterns.json");
  const timeFutureOrientationPatterns = readJson("data/time-future-orientation-patterns.json");
  const relationshipPatterns = readJson("data/relationship-patterns.json");
  const assetMobilityPatterns = readJson("data/asset-mobility-patterns.json");
  const environmentPatterns = readJson("data/environment-patterns.json");
  const turningPointPatterns = readJson("data/turning-point-patterns.json");
  const lifeTimelinePatterns = readJson("data/life-timeline-patterns.json");
  const valueSystemPatterns = readJson("data/value-system-patterns.json");
  const decisionStylePatterns = readJson("data/decision-style-patterns.json");
  const socialCapitalPatterns = readJson("data/social-capital-patterns.json");
  const energyDepletionPatterns = readJson("data/energy-depletion-patterns.json");
  const intimacyFamilyPathPatterns = readJson("data/intimacy-family-path-patterns.json");
  const wealthPathPatterns = readJson("data/wealth-path-patterns.json");
  const moneyPersonalityPatterns = readJson("data/money-personality-patterns.json");
  const savingBehaviorPatterns = readJson("data/saving-behavior-patterns.json");
  const healthFinancialCouplings = readJson("data/health-financial-couplings.json");
  const familyFinanceCouplings = readJson("data/family-finance-couplings.json");
  const incomePathPatterns = readJson("data/income-path-patterns.json");
  const macroEraPatterns = readJson("data/macro-era-patterns.json");
  const evolutionEventEffects = readJson("data/evolution-event-effects.json");
  const evolutionTimeHorizons = readJson("data/evolution-time-horizons.json");
  const evidenceSourceWeights = readJson("data/evidence-source-weights.json");
  const contradictionRules = readJson("data/contradiction-rules.json");
  const depthProfiles = readJson("data/simulation-depth-profiles.json");
  const agentReactionRules = readJson("data/agent-reaction-rules.json");
  const agentMemoryRules = readJson("data/agent-memory-rules.json");
  const simulationRounds = readJson("data/simulation-rounds.json");
  const llmReactionTemplates = readJson("data/llm-reaction-templates.json");
  const llmCostProfiles = readJson("data/llm-simulation-cost-profiles.json");
  const llmAdapterConfig = readJson("data/llm-adapter-config.json");
  const materialQualityRules = readJson("data/material-quality-rules.json");
  const advancedCouplingRules = readJson("data/advanced-coupling-rules.json");
  const reviewPathRules = readJson("data/review-path-rules.json");
  const lifeLineNarrativeRules = readJson("data/life-line-narrative-rules.json");
  const symbolicSignalRules = readJson("data/symbolic-signal-rules.json");
  const symbolicCouplingRules = readJson("data/symbolic-coupling-rules.json");
  const eventSedimentationRules = readJson("data/event-sedimentation-rules.json");

  const materialQuality = scoreMaterialQuality(seed, materialQualityRules);
  const lifeGraph = buildLifeGraph(seed);
  const eventSedimentation = buildEventSedimentation({
    lifeGraph,
    rules: eventSedimentationRules
  });
  const { innerAgents, conflicts } = initializeAgents(seed, agentDefinitions, conflictRules);
  const externalAgents = initializeExternalAgents(lifeGraph, externalAgentDefinitions);
  const stage = getLifeStage(seed, stages);
  const { world, worldForces } = buildLifeState(lifeGraph);
  const selectedLifeEvents = selectLifeEvents(stage, world, lifeEvents);
  const { matchedCouplings, branchWeights } = applyCouplingRules({
    innerAgents,
    externalAgents,
    world,
    rules: couplingRules
  });
  const familySystemMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: familySystemPatterns
  });
  const educationPathMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: educationPathPatterns
  });
  const intergenerationalFamilyMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: intergenerationalFamilyPatterns
  });
  const placeMobilityMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: placeMobilityPatterns
  });
  const peerAuthorityMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: peerAuthorityPatterns
  });
  const classMoneyShameMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: classMoneyShamePatterns
  });
  const bodyRhythmDigitalMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: bodyRhythmDigitalPatterns
  });
  const meaningBeliefMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: meaningBeliefPatterns
  });
  const romanticHistoryMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: romanticHistoryPatterns
  });
  const worldviewOrientationMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: worldviewOrientationPatterns
  });
  const agencyControlMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: agencyControlPatterns
  });
  const timeFutureOrientationMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: timeFutureOrientationPatterns
  });
  const relationshipPatternMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: relationshipPatterns
  });
  const assetMobilityMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: assetMobilityPatterns
  });
  const environmentPatternMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: environmentPatterns
  });
  const lifeTimelineMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: lifeTimelinePatterns
  });
  const valueSystemMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: valueSystemPatterns
  });
  const decisionStyleMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: decisionStylePatterns
  });
  const socialCapitalMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: socialCapitalPatterns
  });
  const energyDepletionMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: energyDepletionPatterns
  });
  const intimacyFamilyPathMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: intimacyFamilyPathPatterns
  });
  const wealthPathMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: wealthPathPatterns
  });
  const moneyPersonalityMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: moneyPersonalityPatterns
  });
  const savingBehaviorMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: savingBehaviorPatterns
  });
  const healthFinancialMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: healthFinancialCouplings
  });
  const familyFinanceMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: familyFinanceCouplings
  });
  const incomePathMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: incomePathPatterns
  });
  const macroEraMatches = matchPatterns({
    seed,
    world,
    agents: innerAgents,
    patterns: macroEraPatterns
  });
  const turningPoints = selectTurningPoints({
    seed,
    world,
    agents: innerAgents,
    patterns: turningPointPatterns
  });
  const patternGroups = {
    family_system: familySystemMatches,
    education_path: educationPathMatches,
    intergenerational_family: intergenerationalFamilyMatches,
    place_mobility: placeMobilityMatches,
    peer_authority: peerAuthorityMatches,
    class_money_shame: classMoneyShameMatches,
    body_rhythm_digital: bodyRhythmDigitalMatches,
    meaning_belief: meaningBeliefMatches,
    romantic_history: romanticHistoryMatches,
    worldview_orientation: worldviewOrientationMatches,
    agency_control: agencyControlMatches,
    time_future_orientation: timeFutureOrientationMatches,
    relationship: relationshipPatternMatches,
    asset_mobility: assetMobilityMatches,
    environment: environmentPatternMatches,
    life_timeline: lifeTimelineMatches,
    value_system: valueSystemMatches,
    decision_style: decisionStyleMatches,
    social_capital: socialCapitalMatches,
    energy_depletion: energyDepletionMatches,
    intimacy_family_path: intimacyFamilyPathMatches,
    wealth_path: wealthPathMatches,
    money_personality: moneyPersonalityMatches,
    saving_behavior: savingBehaviorMatches,
    health_finance: healthFinancialMatches,
    family_finance: familyFinanceMatches,
    income_path: incomePathMatches,
    macro_era: macroEraMatches,
    turning_points: turningPoints
  };
  const patternBranchWeights = applyPatternBranchEffects(branchWeights, [
    familySystemMatches,
    educationPathMatches,
    intergenerationalFamilyMatches,
    placeMobilityMatches,
    peerAuthorityMatches,
    classMoneyShameMatches,
    bodyRhythmDigitalMatches,
    meaningBeliefMatches,
    romanticHistoryMatches,
    worldviewOrientationMatches,
    agencyControlMatches,
    timeFutureOrientationMatches,
    relationshipPatternMatches,
    assetMobilityMatches,
    environmentPatternMatches,
    lifeTimelineMatches,
    valueSystemMatches,
    decisionStyleMatches,
    socialCapitalMatches,
    energyDepletionMatches,
    intimacyFamilyPathMatches,
    wealthPathMatches,
    moneyPersonalityMatches,
    savingBehaviorMatches,
    healthFinancialMatches,
    familyFinanceMatches,
    incomePathMatches,
    macroEraMatches,
    turningPoints
  ]);
  const sedimentedBranchWeights = Object.entries(eventSedimentation.branch_bias || {}).reduce((weights, [branch, delta]) => ({
    ...weights,
    [branch]: Number(weights[branch] || 0) + Number(delta || 0)
  }), patternBranchWeights);
  const advancedCouplingResult = applyAdvancedCouplings({
    innerAgents,
    externalAgents,
    world,
    patternGroups,
    branchWeights: sedimentedBranchWeights,
    rules: advancedCouplingRules
  });
  const reviewPath = applyReviewPathInfluence({
    seed,
    branchWeights: advancedCouplingResult.branch_weights,
    materialQuality,
    reviewRules: reviewPathRules
  });
  const symbolicSignals = extractSymbolicSignals({
    seed,
    rules: symbolicSignalRules,
    branchWeights: reviewPath.branch_weights
  });
  const symbolicCouplingResult = applySymbolicCouplings({
    symbolicSignals,
    innerAgents,
    externalAgents,
    world,
    branchWeights: symbolicSignals.branch_weights,
    rules: symbolicCouplingRules
  });
  const enrichedBranchWeights = symbolicCouplingResult.branch_weights;
  const branches = buildLifeLineNarratives({
    branches: sampleParallelBranches(innerAgents, conflicts, stage, world, enrichedBranchWeights),
    agents: innerAgents,
    conflicts,
    world,
    rules: lifeLineNarrativeRules
  });
  const lifeEvolution = simulateLifeEvolution({
    world,
    branches,
    eventEffects: evolutionEventEffects,
    timeHorizons: evolutionTimeHorizons,
    eventSedimentation,
    assetMobilityMatches,
    wealthPathMatches,
    moneyPersonalityMatches,
    savingBehaviorMatches,
    healthFinancialMatches,
    familyFinanceMatches,
    incomePathMatches
  });
  const depthProfile = depthProfiles.find((profile) => profile.id === seed.simulation_depth) ||
    depthProfiles.find((profile) => profile.id === "deep");
  const deepSimulation = runAgentRounds({
    profile: depthProfile,
    innerAgents,
    externalAgents,
    initialState: deriveInitialLifeState(world, eventSedimentation),
    baseBranchWeights: enrichedBranchWeights,
    reactionRules: agentReactionRules,
    memoryRules: agentMemoryRules,
    roundDefinitions: simulationRounds
  });
  const llmCostProfile = llmCostProfiles.find((profile) => profile.id === seed.llm_cost_profile) ||
    llmCostProfiles.find((profile) => profile.id === "deep_llm");
  const llmSimulationCost = estimateLlmSimulationCost({
    deepSimulation,
    templates: llmReactionTemplates,
    costProfile: llmCostProfile
  });
  const calibration = calibratePredictions({
    seed,
    sourceWeights: evidenceSourceWeights,
    contradictionRules,
    patternGroups
  });
  const confidenceExplanation = buildConfidenceExplanation({
    calibration,
    materialQuality
  });
  const llmReactionPlan = buildLlmReactionPlan({
    seed,
    deepSimulation,
    calibration,
    templates: llmReactionTemplates,
    adapterConfig: {
      ...llmAdapterConfig,
      ...(seed.llm_adapter || {})
    }
  });

  return synthesizeReport({
    seed,
    lifeGraph,
    eventSedimentation,
    materialQuality,
    agents: innerAgents,
    externalAgents,
    conflicts,
    stage,
    lifeEvents: selectedLifeEvents,
    couplings: matchedCouplings,
    advancedCouplings: advancedCouplingResult.matched_advanced_couplings,
    symbolicSignals,
    symbolicCouplings: symbolicCouplingResult.matched_symbolic_couplings,
    familySystemMatches,
    educationPathMatches,
    intergenerationalFamilyMatches,
    placeMobilityMatches,
    peerAuthorityMatches,
    classMoneyShameMatches,
    bodyRhythmDigitalMatches,
    meaningBeliefMatches,
    romanticHistoryMatches,
    worldviewOrientationMatches,
    agencyControlMatches,
    timeFutureOrientationMatches,
    relationshipPatternMatches,
    assetMobilityMatches,
    environmentPatternMatches,
    lifeTimelineMatches,
    valueSystemMatches,
    decisionStyleMatches,
    socialCapitalMatches,
    energyDepletionMatches,
    intimacyFamilyPathMatches,
    wealthPathMatches,
    moneyPersonalityMatches,
    savingBehaviorMatches,
    healthFinancialMatches,
    familyFinanceMatches,
    incomePathMatches,
    macroEraMatches,
    turningPoints,
    branchWeights: enrichedBranchWeights,
    branches,
    lifeEvolution,
    deepSimulation,
    llmSimulationCost,
    llmReactionPlan,
    calibration,
    confidenceExplanation,
    reviewPath,
    world,
    worldForces
  });
}

module.exports = {
  simulate
};
