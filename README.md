# FormSight / 见相 Engine

> An open-source experimental engine for structured personal life-path simulation.

FormSight / 见相 is not a fortune-telling tool and does not claim to deterministically predict a person's life. It is a local, inspectable simulation engine that turns structured self-narrative material into:

- a life graph;
- inner and external agents;
- reality variables;
- coupling rules;
- parallel life branches;
- confidence notes;
- HTML reports and visual boards.

The useful way to read its output is: **a map, not an oracle**.

## What is open sourced here

This repository contains only the bottom-layer runtime engine:

```text
src/        Core simulation and rendering code
data/       Structured rules, agents, patterns, couplings
examples/   Fictional / synthetic seed inputs
docs/       Architecture and model notes
LICENSE     MIT license
```

This repository intentionally does **not** include:

- private user materials;
- private reports;
- content-operation notes;
- paid beta delivery templates;
- social-media scripts or growth data.

## Requirements

- Node.js 18+
- No npm dependencies are required for the current rule-based runtime.

## Quick Start

Run a JSON simulation:

```bash
node src/simulate.js examples/sample-seed.json
```

Generate an HTML report:

```bash
node src/render-report.js examples/sample-seed.json reports/sample-report.html
```

Generate a visual simulation board:

```bash
node src/render-visualization.js examples/sample-seed.json reports/simulation-visualization.html
```

Or use npm scripts:

```bash
npm run check
npm run simulate
npm run report
npm run visualize
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd run visualize
```

After running the report or visualizer commands, open the generated HTML files in the `reports/` folder.

## Input format

The engine accepts a structured seed JSON file. Start from:

```text
examples/sample-seed.json
```

You can copy it and create your own local file:

```bash
cp examples/sample-seed.json examples/my-seed.local.json
```

Local seed files are ignored by git when named `*.local.json`.

The seed may include:

- profile and current question;
- recent events;
- social roles;
- assets and constraints;
- family system;
- relationship network;
- body and energy;
- life timeline;
- values and decision style;
- symbolic material;
- repeated patterns;
- desired and feared futures.

## Privacy

Do not commit real personal materials to a public repository.

Recommended workflow:

1. Keep private seed files local, e.g. `examples/my-seed.local.json`.
2. Remove names, phone numbers, addresses, school names, workplace names, and chat screenshots before sharing.
3. Treat generated reports as private unless the subject explicitly agrees to share them.

## Safety boundary

FormSight is for reflection, research, writing, and speculative self-modeling.

It is not:

- medical diagnosis;
- psychotherapy;
- legal advice;
- financial advice;
- career advice;
- deterministic life prediction.

Use it to notice patterns and generate hypotheses. Do not use it as a final authority for major life decisions.

## Project status

Early prototype.

Current runtime is mostly rule-based. Some files prepare for future LLM-assisted agent simulation, but the current public commands run locally and do not call any model API.

## License

MIT License.
