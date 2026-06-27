const {
  initializeAgentMemory,
  updateAgentMemory,
  summarizeAgentMemory
} = require("./agent-memory");

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function addEffects(state, effects = {}, intensity = 1) {
  const next = { ...state };

  Object.entries(effects).forEach(([key, delta]) => {
    next[key] = clamp(Number(next[key] || 0) + Number(delta || 0) * intensity);
  });

  return next;
}

function addBranchPressure(branchPressure, effects = {}, intensity = 1) {
  const next = { ...branchPressure };

  Object.entries(effects).forEach(([key, delta]) => {
    next[key] = Number(next[key] || 0) + Number(delta || 0) * intensity;
  });

  return next;
}

function findRule(agent, reactionRules) {
  return reactionRules.find((rule) => rule.agent_id === agent.id);
}

function summarizeRound(state, branchPressure) {
  const strongestState = Object.entries(state).sort((a, b) => b[1] - a[1])[0];
  const strongestBranch = Object.entries(branchPressure).sort((a, b) => b[1] - a[1])[0];

  return {
    strongest_state: strongestState?.[0],
    strongest_state_score: strongestState?.[1],
    strongest_branch: strongestBranch?.[0],
    strongest_branch_score: strongestBranch?.[1]
  };
}

function runAgentRounds({
  profile,
  innerAgents,
  externalAgents,
  initialState,
  baseBranchWeights,
  reactionRules,
  memoryRules,
  roundDefinitions
}) {
  if (!profile || Number(profile.rounds || 0) <= 0) {
    return {
      profile,
      initial_state: initialState,
      final_state: initialState,
      final_branch_pressure: baseBranchWeights,
      rounds: []
    };
  }

  const selectedInnerAgents = innerAgents.slice(0, Number(profile.inner_agent_limit || innerAgents.length));
  const selectedExternalAgents = externalAgents.slice(0, Number(profile.external_agent_limit || externalAgents.length));
  const activeAgents = [...selectedInnerAgents, ...selectedExternalAgents];

  let state = { ...initialState };
  let branchPressure = { ...baseBranchWeights };
  let agentMemory = initializeAgentMemory(activeAgents, memoryRules);
  const rounds = [];

  for (let index = 0; index < Number(profile.rounds || 0); index += 1) {
    const round = roundDefinitions[index % roundDefinitions.length];
    const roundNumber = index + 1;
    const roundWithNumber = {
      ...round,
      round_number: roundNumber
    };
    state = addEffects(state, round.state_effects, 1);

    const agentReactions = activeAgents.map((agent) => {
      const rule = findRule(agent, reactionRules);
      if (!rule) {
        return {
          agent_id: agent.id,
          agent_name: agent.name,
          stance: "No reaction rule yet.",
          intensity: 0,
          memory_before: agentMemory[agent.id]?.last_observation || null,
          state_effects: {},
          branch_pressure: {}
        };
      }

      const intensity = clamp(Number(agent.score || 1) / 4, 0.25, 2);
      const memoryBefore = agentMemory[agent.id]?.last_observation || null;
      state = addEffects(state, rule.state_effects, intensity);
      branchPressure = addBranchPressure(branchPressure, rule.branch_pressure, intensity);

      return {
        agent_id: agent.id,
        agent_name: agent.name,
        stance: rule.stance,
        intensity,
        memory_before: memoryBefore,
        state_effects: rule.state_effects,
        branch_pressure: rule.branch_pressure
      };
    });

    const memoryUpdate = updateAgentMemory({
      memory: agentMemory,
      round: roundWithNumber,
      reactions: agentReactions,
      state,
      branchPressure,
      memoryRules
    });

    agentMemory = memoryUpdate.memory;
    state = addEffects(state, memoryUpdate.state_effects, 1);
    branchPressure = addBranchPressure(branchPressure, memoryUpdate.branch_pressure, 1);

    rounds.push({
      round_number: roundNumber,
      round_id: round.id,
      round_name: round.name,
      event: round.event,
      agent_reactions: agentReactions,
      memory_effects_after_round: {
        state_effects: memoryUpdate.state_effects,
        branch_pressure: memoryUpdate.branch_pressure
      },
      memory_after_round: summarizeAgentMemory(agentMemory),
      state_after_round: state,
      branch_pressure_after_round: branchPressure,
      summary: summarizeRound(state, branchPressure)
    });
  }

  return {
    profile,
    active_agents: activeAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      score: agent.score
    })),
    initial_state: initialState,
    final_state: state,
    final_branch_pressure: branchPressure,
    final_agent_memory: summarizeAgentMemory(agentMemory),
    rounds
  };
}

module.exports = {
  runAgentRounds
};
