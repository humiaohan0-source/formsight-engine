function replaceTemplate(templateLines, values) {
  return templateLines
    .join("\n")
    .replaceAll("{agent_name}", values.agent_name)
    .replaceAll("{agent_stance}", values.agent_stance)
    .replaceAll("{round_event}", values.round_event)
    .replaceAll("{life_state}", JSON.stringify(values.life_state))
    .replaceAll("{branch_pressure}", JSON.stringify(values.branch_pressure))
    .replaceAll("{agent_memory}", JSON.stringify(values.agent_memory || null));
}

function estimateTokens(template) {
  return Number(template.estimated_prompt_tokens || 0) + Number(template.estimated_completion_tokens || 0);
}

function buildAgentReactionCalls({ deepSimulation, templates, adapterConfig }) {
  const template = templates.agent_reaction;
  const maxPreviewCalls = Number(adapterConfig.max_preview_calls || 8);
  const calls = [];

  (deepSimulation.rounds || []).forEach((round) => {
    (round.agent_reactions || []).forEach((reaction) => {
      const prompt = replaceTemplate(template.template, {
        agent_name: reaction.agent_name,
        agent_stance: reaction.stance,
        round_event: round.event,
        life_state: round.state_after_round,
        branch_pressure: round.branch_pressure_after_round,
        agent_memory: {
          before: reaction.memory_before,
          after_round: (round.memory_after_round || []).find((item) => item.agent_id === reaction.agent_id)
        }
      });

      calls.push({
        call_id: `round_${round.round_number}_${reaction.agent_id}`,
        round_number: round.round_number,
        agent_id: reaction.agent_id,
        agent_name: reaction.agent_name,
        provider: adapterConfig.provider,
        model: adapterConfig.model,
        mode: adapterConfig.mode,
        prompt,
        expected_json_schema: {
          thought: "string",
          action_tendency: "string",
          state_effects: "object",
          branch_pressure: "object",
          confidence: "number"
        },
        estimated_tokens: estimateTokens(template)
      });
    });
  });

  return {
    total_calls: calls.length,
    preview_calls: calls.slice(0, maxPreviewCalls),
    estimated_total_tokens: calls.reduce((sum, call) => sum + call.estimated_tokens, 0)
  };
}

function buildRoundSynthesisCalls({ deepSimulation, templates, adapterConfig }) {
  const template = templates.round_synthesis;
  const calls = (deepSimulation.rounds || []).map((round) => {
    const prompt = [
      ...template.template,
      "",
      `Round: ${round.round_number} / ${round.round_name}`,
      `Event: ${round.event}`,
      `Agent reactions: ${JSON.stringify(round.agent_reactions)}`,
      `Agent memory after round: ${JSON.stringify(round.memory_after_round || [])}`,
      `Memory effects after deterministic pass: ${JSON.stringify(round.memory_effects_after_round || {})}`,
      `State after deterministic pass: ${JSON.stringify(round.state_after_round)}`,
      `Branch pressure after deterministic pass: ${JSON.stringify(round.branch_pressure_after_round)}`
    ].join("\n");

    return {
      call_id: `round_${round.round_number}_synthesis`,
      round_number: round.round_number,
      provider: adapterConfig.provider,
      model: adapterConfig.model,
      mode: adapterConfig.mode,
      prompt,
      expected_json_schema: {
        state_after_round: "object",
        branch_pressure_after_round: "object",
        turning_signal: "string",
        summary: "string"
      },
      estimated_tokens: estimateTokens(template)
    };
  });

  return {
    total_calls: calls.length,
    preview_calls: calls.slice(0, Number(adapterConfig.max_preview_calls || 8)),
    estimated_total_tokens: calls.reduce((sum, call) => sum + call.estimated_tokens, 0)
  };
}

function buildFinalReportCall({ seed, deepSimulation, calibration, templates, adapterConfig }) {
  const template = templates.final_deep_report;
  const prompt = [
    ...template.template,
    "",
    `Seed summary: ${JSON.stringify(seed.profile || {})}`,
    `Deep simulation: ${JSON.stringify(deepSimulation)}`,
    `Final agent memory: ${JSON.stringify(deepSimulation.final_agent_memory || [])}`,
    `Calibration: ${JSON.stringify(calibration?.summary || {})}`
  ].join("\n");

  return {
    call_id: "final_deep_report",
    provider: adapterConfig.provider,
    model: adapterConfig.model,
    mode: adapterConfig.mode,
    prompt,
    expected_json_schema: {
      title: "string",
      dominant_trajectory: "string",
      evidence_reasoning: "string",
      uncertainty: "string",
      branch_summary: "object"
    },
    estimated_tokens: estimateTokens(template)
  };
}

function buildLlmReactionPlan({ seed, deepSimulation, calibration, templates, adapterConfig }) {
  const agentReactionCalls = buildAgentReactionCalls({
    deepSimulation,
    templates,
    adapterConfig
  });
  const roundSynthesisCalls = buildRoundSynthesisCalls({
    deepSimulation,
    templates,
    adapterConfig
  });
  const finalReportCall = buildFinalReportCall({
    seed,
    deepSimulation,
    calibration,
    templates,
    adapterConfig
  });
  const estimatedTotalTokens =
    agentReactionCalls.estimated_total_tokens +
    roundSynthesisCalls.estimated_total_tokens +
    finalReportCall.estimated_tokens;

  return {
    mode: adapterConfig.mode,
    provider: adapterConfig.provider,
    model: adapterConfig.model,
    status: adapterConfig.mode === "dry_run" ? "planned_not_executed" : "ready_for_execution",
    agent_reaction_calls: agentReactionCalls,
    round_synthesis_calls: roundSynthesisCalls,
    final_report_call: finalReportCall,
    estimated_total_tokens: estimatedTotalTokens
  };
}

module.exports = {
  buildLlmReactionPlan
};
