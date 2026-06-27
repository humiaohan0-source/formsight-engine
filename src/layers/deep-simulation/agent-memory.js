function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function findRule(agentId, memoryRules = []) {
  return memoryRules.find((rule) => rule.agent_id === agentId);
}

function pickStrongestValue(values = {}, keys = []) {
  const candidates = keys
    .map((key) => [key, Number(values[key] || 0)])
    .sort((a, b) => b[1] - a[1]);

  return candidates[0] || [undefined, undefined];
}

function initializeAgentMemory(activeAgents = [], memoryRules = []) {
  return activeAgents.reduce((memory, agent) => {
    const rule = findRule(agent.id, memoryRules);

    memory[agent.id] = {
      agent_id: agent.id,
      agent_name: agent.name,
      theme: rule?.theme || "No memory theme defined yet.",
      round_count: 0,
      accumulated_intensity: 0,
      salient_memories: [],
      last_observation: null
    };

    return memory;
  }, {});
}

function buildObservation({ rule, reaction, state, branchPressure }) {
  const [stateKey, stateScore] = pickStrongestValue(state, rule?.state_focus || []);
  const [branchKey, branchScore] = pickStrongestValue(branchPressure, rule?.branch_focus || []);
  const intensity = Number(reaction.intensity || 0);
  const threshold = Number(rule?.high_intensity_threshold || 1.25);

  if (!rule) return reaction.stance;
  if (intensity >= threshold && rule.high_intensity_observation) {
    return rule.high_intensity_observation;
  }
  if (stateKey && stateScore >= Number(rule.state_threshold || 7) && rule.state_observation) {
    return rule.state_observation.replaceAll("{state}", stateKey);
  }
  if (branchKey && branchScore >= Number(rule.branch_threshold || 8) && rule.branch_observation) {
    return rule.branch_observation.replaceAll("{branch}", branchKey);
  }

  return rule.default_observation || reaction.stance;
}

function updateAgentMemory({ memory, round, reactions, state, branchPressure, memoryRules }) {
  const nextMemory = JSON.parse(JSON.stringify(memory || {}));
  const stateEffects = {};
  const branchEffects = {};

  reactions.forEach((reaction) => {
    const rule = findRule(reaction.agent_id, memoryRules);
    const item = nextMemory[reaction.agent_id];
    if (!item) return;

    const [stateKey, stateScore] = pickStrongestValue(state, rule?.state_focus || []);
    const [branchKey, branchScore] = pickStrongestValue(branchPressure, rule?.branch_focus || []);
    const intensity = Number(reaction.intensity || 0);
    const observation = buildObservation({ rule, reaction, state, branchPressure });

    item.round_count += 1;
    item.accumulated_intensity = Number((item.accumulated_intensity + intensity).toFixed(2));
    item.last_observation = observation;
    item.salient_memories.push({
      round_number: round.round_number,
      round_name: round.round_name,
      observation,
      strongest_state: stateKey,
      strongest_state_score: stateScore,
      strongest_branch: branchKey,
      strongest_branch_score: branchScore
    });

    const maxEntries = Number(rule?.max_memory_entries || 4);
    item.salient_memories = item.salient_memories.slice(-maxEntries);

    if (rule?.state_memory_effects) {
      Object.entries(rule.state_memory_effects).forEach(([key, value]) => {
        stateEffects[key] = clamp(Number(stateEffects[key] || 0) + Number(value || 0) * intensity, -3, 3);
      });
    }
    if (rule?.branch_memory_effects) {
      Object.entries(rule.branch_memory_effects).forEach(([key, value]) => {
        branchEffects[key] = Number(branchEffects[key] || 0) + Number(value || 0) * intensity;
      });
    }
  });

  return {
    memory: nextMemory,
    state_effects: stateEffects,
    branch_pressure: branchEffects
  };
}

function summarizeAgentMemory(memory = {}) {
  return Object.values(memory).map((item) => ({
    agent_id: item.agent_id,
    agent_name: item.agent_name,
    theme: item.theme,
    accumulated_intensity: item.accumulated_intensity,
    last_observation: item.last_observation,
    memory_count: item.salient_memories.length
  }));
}

module.exports = {
  initializeAgentMemory,
  updateAgentMemory,
  summarizeAgentMemory
};
