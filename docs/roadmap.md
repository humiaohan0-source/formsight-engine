# Roadmap

## Stage 0: Static Prototype

Current status.

- user seed JSON
- keyword-based agent scoring
- conflict matching
- three-branch simulation
- JSON report output

Purpose:

> Prove the architecture can run.

## Stage 1: Structured Life Graph

Replace flat text matching with a life graph.

Nodes:

- events
- people
- institutions
- self-beliefs
- fears
- desires
- repeated patterns
- resources
- constraints

Edges:

- caused by
- avoided by
- amplified by
- conflicts with
- protects against
- repeats after

Output:

```text
autobiographical graph → agent initialization
```

## Stage 2: Agent Memory

Each inner agent should hold memory.

Example:

```json
{
  "agent": "The Controller",
  "memories": [
    "When risk appeared, delay reduced anxiety.",
    "Stable environments were associated with safety.",
    "Irreversible choices were treated as danger."
  ]
}
```

Memory affects:

- decisions
- conflict strength
- life-stage reactions
- branch probability

## Stage 3: External World Simulation

Add external agents and environments.

External agents:

- family expectation
- partner / friend
- manager / institution
- labor market
- peer comparison
- cultural script

This creates a hybrid model:

```text
inner agents + external agents → life environment simulation
```

## Stage 4: Multi-Year Life Simulation

Simulate across life stages:

- early adulthood
- career formation
- intimacy formation
- midlife responsibility
- meaning crisis
- late-life review

Each stage includes:

- pressure fields
- likely events
- dominant agents
- conflict intensity
- decisions
- consequences

## Stage 5: Parallel World Sampling

Generate multiple worlds:

- inertia world
- risk-taking world
- relationship-first world
- achievement-first world
- rupture-and-reset world
- integrated world

Each world should produce:

- timeline
- turning points
- losses
- gains
- unresolved residue
- final life pattern

## Stage 6: Open Feedback Learning

Collect:

- user accuracy rating
- observer review
- screenshot sentences
- follow-up outcomes
- GitHub issues
- community examples

Use feedback to tune:

- agent priors
- conflict rules
- report style
- branch probability

## Stage 7: Open Visualization And Demo

Possible surfaces:

- CLI demo for GitHub
- static HTML report
- static HTML/SVG visualizer
- public demo with fictional or anonymized seeds
- optional H5 frontend
- optional research-style examples

Current principle:

> Make the simulation understandable before making it commercial.

## Stage 8: Tiered Simulation Cost

FormSight should support multiple simulation depths instead of one fixed-cost model.

- Open rule engine: rules, knowledge base, calibration, deterministic evolution
- Standard: LLM extraction plus rule simulation plus LLM report
- Deep: a small set of inner and external agents running multiple rounds
- Flagship experiment: MiroFish-style high-token multi-agent simulation

The product principle:

> Do not spend MiroFish-level tokens on every run. Use structure first, LLM second, and make expensive multi-agent simulation an explicit research mode.

## Stage 9: GitHub Release Hygiene

Prepare the project for public release:

- readable README
- MIT LICENSE
- fictional sample seeds
- no private user data
- clear safety boundary
- generated report examples
- generated visualization examples
- issue templates for feedback
- roadmap written for contributors

## North Star

The final engine should feel like:

> A personal MiroFish that builds a small simulated life-world around one person and explores how their inner agents interact with external pressure across time.

It should not feel like:

- a personality test
- a horoscope
- a generic AI essay
- a clinical diagnosis
