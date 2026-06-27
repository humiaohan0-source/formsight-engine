function estimateCallTokens(template, multiplier = 1) {
  const promptTokens = Number(template.estimated_prompt_tokens || 0);
  const completionTokens = Number(template.estimated_completion_tokens || 0);

  return {
    prompt_tokens: Math.round(promptTokens * multiplier),
    completion_tokens: Math.round(completionTokens * multiplier),
    total_tokens: Math.round((promptTokens + completionTokens) * multiplier)
  };
}

function estimateLlmSimulationCost({ deepSimulation, templates, costProfile }) {
  const rounds = deepSimulation?.rounds || [];
  const activeAgentCount = deepSimulation?.active_agents?.length || 0;
  const roundCount = rounds.length;
  const multiplier = Number(costProfile.memory_retrieval_multiplier || 1);
  const calls = [];

  if (costProfile.agent_reaction_calls) {
    const perCall = estimateCallTokens(templates.agent_reaction, multiplier);
    calls.push({
      type: "agent_reaction",
      count: activeAgentCount * roundCount,
      ...perCall,
      total_tokens: perCall.total_tokens * activeAgentCount * roundCount
    });
  }

  if (costProfile.round_synthesis_calls) {
    const perCall = estimateCallTokens(templates.round_synthesis, multiplier);
    calls.push({
      type: "round_synthesis",
      count: roundCount,
      ...perCall,
      total_tokens: perCall.total_tokens * roundCount
    });
  }

  if (costProfile.final_deep_report_calls) {
    const perCall = estimateCallTokens(templates.final_deep_report, multiplier);
    calls.push({
      type: "final_deep_report",
      count: 1,
      ...perCall
    });
  }

  const totalTokens = calls.reduce((sum, call) => sum + Number(call.total_tokens || 0), 0);

  return {
    profile_id: costProfile.id,
    profile_name: costProfile.name,
    description: costProfile.description,
    active_agent_count: activeAgentCount,
    round_count: roundCount,
    calls,
    estimated_total_tokens: totalTokens
  };
}

module.exports = {
  estimateLlmSimulationCost
};
