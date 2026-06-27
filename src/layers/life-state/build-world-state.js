function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildWorldState(lifeGraph) {
  const assets = lifeGraph.assets || {};
  const environment = lifeGraph.environment || {};
  const family = lifeGraph.family || {};
  const educationPath = lifeGraph.education_path || {};
  const intergenerationalFamily = lifeGraph.intergenerational_family || {};
  const placeMobility = lifeGraph.place_mobility || {};
  const peerAuthority = lifeGraph.peer_authority || {};
  const classMoneyShame = lifeGraph.class_money_shame || {};
  const bodyImageGender = lifeGraph.body_image_gender || {};
  const timeRhythm = lifeGraph.time_rhythm || {};
  const digitalInformation = lifeGraph.digital_information || {};
  const meaningBelief = lifeGraph.meaning_belief || {};
  const romanticHistory = lifeGraph.romantic_history || {};
  const worldviewOrientation = lifeGraph.worldview_orientation || {};
  const agencyControl = lifeGraph.agency_control || {};
  const timeFutureOrientation = lifeGraph.time_future_orientation || {};
  const network = lifeGraph.network || {};
  const health = lifeGraph.health || {};
  const timeline = lifeGraph.timeline || [];
  const valueSystem = lifeGraph.value_system || {};
  const decisionStyle = lifeGraph.decision_style || {};
  const socialCapital = lifeGraph.social_capital || {};
  const intimacyPath = lifeGraph.intimacy_path || {};
  const wealthPath = lifeGraph.wealth_path || {};
  const macroEra = lifeGraph.macro_era || {};
  const roles = lifeGraph.roles || [];

  const roleLoad = roles.reduce((sum, role) => sum + Number(role.load || 0), 0);
  const schoolPeerRisk = Number(educationPath.peer_safety || 0) <= 2 ? 2 : 0;
  const schoolFitRisk = Number(educationPath.school_fit || 0) <= 2 ? 2 : 0;
  const teacherSupport = Number(educationPath.teacher_support || 0);
  const generationalPressure =
    Number(intergenerationalFamily.face_pressure || 0) +
    Number(intergenerationalFamily.emotional_inheritance || 0) +
    Number(intergenerationalFamily.parent_path_shadow || 0);
  const placePressure =
    Number(placeMobility.belonging_split || 0) +
    Number(placeMobility.current_city_misalignment || 0) +
    Number(placeMobility.migration_pressure || 0);
  const peerPressure =
    Number(peerAuthority.peer_evaluation_pressure || 0) +
    Number(peerAuthority.authority_wound || 0) +
    Number(peerAuthority.circle_energy_mismatch || 0);
  const peerSupport =
    Number(peerAuthority.peer_support || 0) +
    Number(peerAuthority.mentor_support || 0);
  const classPressure =
    Number(classMoneyShame.class_anxiety || 0) +
    Number(classMoneyShame.money_shame || 0) +
    Number(classMoneyShame.consumption_pressure || 0);
  const visibilityPressure =
    Number(bodyImageGender.appearance_anxiety || 0) +
    Number(bodyImageGender.gender_constraint || 0) +
    Number(bodyImageGender.visibility_fear || 0);
  const rhythmSupport = Number(timeRhythm.rhythm_stability || 0);
  const rhythmRisk =
    Number(timeRhythm.rhythm_fragility || 0) +
    Number(timeRhythm.sleep_disorder || 0) +
    Number(timeRhythm.procrastination_loop || 0);
  const digitalNoise =
    Number(digitalInformation.negative_information_scanning || 0) +
    Number(digitalInformation.doomscrolling || 0) +
    Number(digitalInformation.comparison_feed || 0);
  const meaningSupport =
    Number(meaningBelief.meaning_clarity || 0) +
    Number(meaningBelief.contribution_drive || 0) +
    Number(meaningBelief.spiritual_anchor || 0);
  const romanticPressure =
    Number(romanticHistory.unresolved_attachment || 0) +
    Number(romanticHistory.betrayal_memory || 0) +
    Number(romanticHistory.intimacy_avoidance || 0) +
    Number(romanticHistory.repetition_attraction || 0);
  const romanticSupport =
    Number(romanticHistory.secure_love_memory || 0) +
    Number(romanticHistory.repair_capacity || 0);
  const worldviewPressure =
    Number(worldviewOrientation.world_threat || 0) +
    Number(worldviewOrientation.cynicism_level || 0) +
    Number(worldviewOrientation.zero_sum_belief || 0) +
    Number(worldviewOrientation.over_sign_reading || 0);
  const worldviewSupport =
    Number(worldviewOrientation.reality_testing || 0) +
    Number(worldviewOrientation.pragmatic_belief || 0) +
    Number(worldviewOrientation.hopeful_worldview || 0);
  const agencyPressure =
    Number(agencyControl.learned_helplessness || 0) +
    Number(agencyControl.external_locus || 0) +
    Number(agencyControl.perfection_control || 0);
  const agencySupport =
    Number(agencyControl.internal_locus || 0) +
    Number(agencyControl.experiment_identity || 0) +
    Number(agencyControl.decision_ownership || 0);
  const timePressure =
    Number(timeFutureOrientation.future_blindness || 0) +
    Number(timeFutureOrientation.urgency_anxiety || 0) +
    Number(timeFutureOrientation.past_fixation || 0);
  const timeSupport =
    Number(timeFutureOrientation.long_term_frame || 0) +
    Number(timeFutureOrientation.short_cycle_planning || 0);
  const runway = Number(assets.savings_months || 0) - Number(assets.debt_pressure || 0);
  const externalPressure =
    Number(environment.living_cost_pressure || 0) +
    Number(environment.social_comparison_pressure || 0) +
    Number(environment.industry_volatility || 0) +
    Number(family.boundary_pressure || 0) +
    schoolPeerRisk +
    schoolFitRisk +
    generationalPressure +
    placePressure +
    peerPressure +
    classPressure +
    visibilityPressure +
    romanticPressure +
    worldviewPressure +
    agencyPressure +
    timePressure +
    roleLoad;
  const support =
    Number(network.supportive_people || 0) +
    Number(network.truth_tellers || 0) +
    Number(assets.monthly_income_level || 0) +
    teacherSupport +
    peerSupport +
    rhythmSupport +
    meaningSupport +
    romanticSupport +
    worldviewSupport +
    agencySupport +
    timeSupport +
    runway;
  const energyRisk =
    Number(health.stress_level || 0) +
    Number(health.attention_fragmentation || 0) -
    Number(health.sleep_quality || 0) -
    Number(health.body_energy || 0) +
    schoolPeerRisk +
    Number(intergenerationalFamily.emotional_inheritance || 0) * 0.5 +
    rhythmRisk +
    digitalNoise +
    classPressure * 0.35 +
    visibilityPressure * 0.35 +
    romanticPressure * 0.4 +
    worldviewPressure * 0.3 +
    agencyPressure * 0.45 +
    timePressure * 0.35;

  return {
    roles,
    assets,
    environment,
    family,
    education_path: educationPath,
    intergenerational_family: intergenerationalFamily,
    place_mobility: placeMobility,
    peer_authority: peerAuthority,
    class_money_shame: classMoneyShame,
    body_image_gender: bodyImageGender,
    time_rhythm: timeRhythm,
    digital_information: digitalInformation,
    meaning_belief: meaningBelief,
    romantic_history: romanticHistory,
    worldview_orientation: worldviewOrientation,
    agency_control: agencyControl,
    time_future_orientation: timeFutureOrientation,
    network,
    health,
    timeline,
    value_system: valueSystem,
    decision_style: decisionStyle,
    social_capital: socialCapital,
    intimacy_path: intimacyPath,
    wealth_path: wealthPath,
    macro_era: macroEra,
    time_horizon: lifeGraph.time_horizon || {},
    scores: {
      role_load: roleLoad,
      financial_runway: runway,
      external_pressure: externalPressure,
      support_capacity: support,
      energy_risk: clamp(energyRisk, 0, 10),
      life_mobility: clamp(
        support +
          Number(environment.opportunity_density || 0) +
          Number(placeMobility.mobility_desire || 0) +
          meaningSupport * 0.4 -
          agencyPressure * 0.25 -
          timePressure * 0.2 +
          agencySupport * 0.35 +
          worldviewSupport * 0.2 +
          externalPressure / 2,
        0,
        10
      )
    }
  };
}

function assessWorldForces(world) {
  const forces = [];

  if (world.scores.financial_runway >= 6) {
    forces.push({
      type: "support",
      name: "financial runway",
      text: "Savings provide enough runway to test a new branch without immediate collapse."
    });
  } else {
    forces.push({
      type: "constraint",
      name: "limited runway",
      text: "Financial runway is limited, so any major life branch needs staged experimentation."
    });
  }

  if (world.scores.external_pressure >= 14) {
    forces.push({
      type: "constraint",
      name: "high external pressure",
      text: "Family expectations, city cost, industry volatility, and role load create a compressed decision field."
    });
  }

  if (world.scores.support_capacity >= 8) {
    forces.push({
      type: "support",
      name: "support network",
      text: "There is enough support capacity to reality-test decisions with other people."
    });
  } else {
    forces.push({
      type: "constraint",
      name: "thin support network",
      text: "Support exists but is not abundant; too much private rumination may distort the simulation."
    });
  }

  if (world.scores.energy_risk >= 4) {
    forces.push({
      type: "constraint",
      name: "energy risk",
      text: "Stress and attention fragmentation may make the person mistake exhaustion for fate."
    });
  }

  return forces;
}

function buildLifeState(lifeGraph) {
  const world = buildWorldState(lifeGraph);
  return {
    world,
    worldForces: assessWorldForces(world)
  };
}

module.exports = {
  buildLifeState
};
