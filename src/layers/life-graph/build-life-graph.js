function buildLifeGraph(seed) {
  return {
    profile: seed.profile || {},
    events: seed.recent_events || [],
    roles: seed.social_roles || [],
    assets: seed.assets || {},
    environment: seed.environment || {},
    family: seed.family_system || {},
    education_path: seed.education_path || {},
    intergenerational_family: seed.intergenerational_family || {},
    place_mobility: seed.place_mobility || {},
    peer_authority: seed.peer_authority || {},
    class_money_shame: seed.class_money_shame || {},
    body_image_gender: seed.body_image_gender || {},
    time_rhythm: seed.time_rhythm || {},
    digital_information: seed.digital_information || {},
    meaning_belief: seed.meaning_belief || {},
    romantic_history: seed.romantic_history || {},
    worldview_orientation: seed.worldview_orientation || {},
    agency_control: seed.agency_control || {},
    time_future_orientation: seed.time_future_orientation || {},
    network: seed.relationship_network || {},
    health: seed.health_and_energy || {},
    timeline: seed.life_timeline || [],
    value_system: seed.value_system || {},
    decision_style: seed.decision_style || {},
    social_capital: seed.social_capital || {},
    intimacy_path: seed.intimacy_and_family_path || {},
    wealth_path: seed.wealth_path || {},
    macro_era: seed.macro_era || {},
    repeated_patterns: seed.repeated_patterns || [],
    desired_future: seed.desired_future || [],
    feared_future: seed.feared_future || [],
    time_horizon: seed.time_horizon || {}
  };
}

module.exports = {
  buildLifeGraph
};
