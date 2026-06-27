# Data Strategy

The engine does not become better by blindly adding more data.

It becomes better when data is structured, testable, and connected to simulation behavior.

## Layer 1: User Seed Data

Collected from the user or a fictional case:

- current dilemma
- repeated life patterns
- recent events
- desired future
- feared future
- self-description
- social roles
- assets
- family system
- relationship network
- health and energy
- life timeline
- values
- decision style
- symbolic material: names, places, objects, pets, dreams, repeated phrases, dates, numbers, institutions, body marks, unfinished artifacts
- longform self-narrative, diaries, project notes, and life summaries

This is the most important data layer.

For GitHub examples, use fictional or sufficiently anonymized seed data only.

## Layer 2: Cognitive Prior Library

A curated library of human patterns:

- avoidance
- over-control
- proving
- people-pleasing
- shame loops
- delayed action
- achievement without satisfaction
- intimacy withdrawal
- attention debt
- recognition hunger

This layer should be small, structured, and testable.

## Layer 3: Life Environment Library

Context priors for external pressure:

- early adulthood
- midlife responsibility
- family pressure
- career instability
- relationship ambiguity
- social comparison
- economic uncertainty
- city pressure
- labor market pressure
- support network

This prevents reports from sounding purely internal and abstract.

## Layer 4: Coupling Rules

This is the most important long-term layer.

Examples:

- family expectation x low mobility -> transition delay
- prover x visibility x exhaustion -> opportunity and burnout rise together
- escaper x high pressure x low mobility -> sudden cutoff risk
- support network x observer feedback -> intervention branch opens

The engine should not only say “this person is a prover.” It should explain what happens when a prover meets a specific family system, asset runway, city pressure, and relationship network.

Symbolic material should also enter through coupling, not superstition.

Examples:

- name or handle x public artifact x observer feedback -> visibility branch becomes stronger
- place split x weak support network x new digital identity -> transition field opens, but belonging pressure rises
- unfinished object x attention debt x deadline pressure -> default branch and rupture branch both rise
- illness memory x lost rhythm x self-blame -> recovery pressure and avoidance pressure rise together
- repeated phrase x value conflict x longform narrative -> the engine treats the phrase as a private life motif

## Layer 4.5: Global Coupling Audit

Whenever a new knowledge layer is added, FormSight should audit how it interacts with all existing layers.

The goal is to avoid isolated labels.

Example:

```text
health risk x low savings x family pressure
-> cashflow interruption risk rises
-> intervention branch needs a safer income ladder
```

See:

```text
docs/global-coupling-audit.md
```

## Layer 5: Open Feedback Data

Collected after simulation:

- user accuracy rating
- observer feedback
- which sentences users screenshot
- which branches users question
- GitHub issues
- community examples
- failed cases

This is the layer that turns an entertaining prototype into a learning open-source project.

## What Not To Do

Do not dump large psychological texts directly into the engine.

Risks:

- concept conflicts
- mixed writing style
- pseudo-clinical tone
- lower perceived accuracy
- safety issues

## Recommended Growth Path

```text
small structured engine
-> fictional examples
-> open feedback
-> curated case library
-> retrieval layer
-> simulation evaluation
```
