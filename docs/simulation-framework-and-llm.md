# 仿真框架与 LLM 设计

## 一句话解释

仿真框架负责“世界怎么运行”，LLM 负责“理解材料、扮演 agent、综合判断和生成报告”。

```text
仿真框架 = 时间、状态、规则、事件、行动、记忆更新、分支采样
LLM = 阅读材料、抽取信息、生成 agent、判断 agent 如何反应、写报告
```

## MiroFish 的启发

MiroFish 的机制可以概括为：

```text
现实材料 -> 外部社会 agent -> 群体演化 -> 未来报告
```

FormSight / 见相 对应为：

```text
个人材料 -> 个人世界图谱 -> 内在人格 agent + 外部社会 agent
-> 人生状态演化 -> 平行人生报告
```

MiroFish 的高级感来自：

```text
真实材料 + 大量 agent + 多轮演化 + 报告综合 + 可视化产物
```

FormSight 不需要一开始完全复制高 token 路线，但需要保留通往高 token 仿真的接口。

## Token 成本判断

如果完全按照 MiroFish 式多 agent 仿真，token 消耗会很大。

原因包括：

- 长材料需要抽取实体、关系、冲突和图谱
- 多个 agent 需要 persona、记忆、目标和行为倾向
- 每轮模拟都可能调用 LLM
- 长期记忆会增加上下文成本
- 最终报告需要汇总多轮演化结果

粗略估算：

```text
总 token ≈ agent 数量 x 每轮上下文 token x 模拟轮数
```

例如：

```text
100 agents x 800 tokens x 20 rounds ≈ 1,600,000 tokens
```

这还不包括材料抽取、图谱构建、记忆检索和最终报告。

## FormSight 的开源分层架构

FormSight 当前不是商业分层，而是研究/实验分层：

```text
规则模式 -> LLM 辅助模式 -> 深度 agent 模式 -> 高 token 研究模式
```

### 1. 规则模式

用途：

- GitHub demo
- 本地运行
- 快速验证机制
- 低成本可解释模拟

技术：

- 结构化 seed
- 知识库匹配
- 权重规则
- 置信度校准
- 纵向演化规则
- 可视化报告

特点：

- 不消耗 LLM token
- 速度快
- 成本低
- 可解释
- 适合开源复现

### 2. LLM 辅助模式

用途：

- 更自然的材料输入
- 更自然的中文报告
- 更复杂的 agent reaction

技术：

- LLM 把长文本抽成结构化 seed
- 规则引擎完成基础仿真
- LLM 辅助生成报告或 agent 反应

特点：

- token 消耗可控
- 体验比纯规则更自然
- 仍保留结构化可解释性

### 3. 深度 agent 模式

用途：

- 多轮 agent 演化
- 观察 agent 记忆如何改变分支压力
- 研究人格力量与外部环境的反馈回路

技术：

- 少量内在 agent
- 少量外部 agent
- 多轮事件
- agent memory
- branch pressure evolution
- LLM dry-run plan

当前实现：

```text
data/agent-reaction-rules.json
data/agent-memory-rules.json
data/simulation-rounds.json
src/layers/deep-simulation/run-agent-rounds.js
src/layers/deep-simulation/agent-memory.js
```

### 4. 高 token 研究模式

用途：

- MiroFish 式多 agent 仿真实验
- 大量 agent
- 多阶段、多分支、多轮演化
- 研究展示

可能接入：

- OpenAI-compatible API
- LangGraph
- GraphRAG
- Zep memory
- Cytoscape.js / D3 / ECharts visualization

特点：

- token 成本高
- 运行时间长
- 适合作为显式研究模式，而不是默认运行模式

## LLM Reaction Adapter

当前已经加入 dry-run adapter：

```text
data/llm-adapter-config.json
src/layers/deep-simulation/build-llm-reaction-plan.js
```

它会生成：

- agent reaction prompt
- round synthesis prompt
- final deep report prompt
- expected JSON schema
- provider / model / mode
- token estimate

当前不实际调用模型。未来接入真实 LLM 时，可以新增 executor：

```text
llm_reaction_plan
-> executor
-> OpenAI-compatible API
-> parsed JSON reaction
-> update simulation state
```

## Agent Memory Layer

FormSight 的多轮模拟已经加入 agent 记忆层：

```text
round event
-> agent reaction
-> memory update
-> state / branch pressure feedback
-> next round
```

通俗地说：系统不再让每个 agent 每轮都“失忆”。控制者会记住风险，逃离者会记住压力密度，证明者会记住曝光是否带来认可，支持网络会记住被看见是否推动行动。

当前实现：

```text
data/agent-memory-rules.json
src/layers/deep-simulation/agent-memory.js
```

## 对用户的解释

可以这样描述：

> 我们不是让 AI 直接猜你的未来，而是先根据你的材料建立一个个人世界。里面有你的内在人格、家庭压力、资产约束、关系网络、身体能量、社会环境和时代变量。低成本版本会用结构化规则快速模拟；深度版本会让多个 agent 在这个世界里多轮演化，观察不同选择如何把你推向不同人生分支。

## 最小可行路线

```text
1. 规则仿真框架
2. 知识库和人生状态变量
3. 置信度校准和矛盾检测
4. agent 记忆
5. 多轮 agent 演化
6. 可视化仿真板
7. LLM dry-run 成本计划
8. 真实 LLM executor
9. 高 token 研究模式
```
