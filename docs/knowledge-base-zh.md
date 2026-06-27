# 底层知识库说明

FormSight / 见相的知识库不是百科资料堆叠，而是“可参与模拟的结构化规则”。每一条知识都应尽量说明：

- 它在什么输入或现实状态下被触发
- 它会放大或压住哪些内在人格 agent
- 它如何改变人生分支权重
- 它在报告里应该被解释成什么现实含义

当前知识库位于：

```text
data/
```

## 1. 内在 Agent

文件：

```text
data/inner-agents.json
```

作用：定义用户内在的人格力量，识别欲望、恐惧、策略和人生牵引。

## 2. 外部社会 Agent

文件：

```text
data/external-agents.json
```

作用：定义外部世界中的压力和支持力量，包括家庭期待、城市压力、行业市场、支持网络、能量系统、资产约束。

## 3. 人生时间线模式

文件：

```text
data/life-timeline-patterns.json
```

作用：识别早期经历、重大失败、第一次被看见、稳定角色、关系镜像等节点如何沉淀成今天的命运倾向。

这部分回答的是：这个人为什么会反复走向同一种选择。

## 4. 价值系统模式

文件：

```text
data/value-system-patterns.json
```

作用：识别一个人愿意为什么牺牲、忍耐、冒险或迟迟不动。

示例：

- 自由与安全冲突
- 认可作为自我许可
- 意义开始压过地位
- 关系里的真实表达需求
- 责任之后的自主

## 5. 决策风格模式

文件：

```text
data/decision-style-patterns.json
```

作用：识别机会来临时，一个人是行动、等待、撤退、寻求认可，还是先在脑内模拟很久。

这部分会直接改变惯性线、干预线和断裂线的权重。

## 6. 家庭系统模式

## 6. 社会资本与圈层跃迁

文件：

```text
data/social-capital-patterns.json
```

作用：识别一个人的可信任关系、桥接关系、公共可见度、圈层天花板，以及能否进入新的信息场和机会场。

这部分回答的是：能力如何被看见，机会如何抵达。

## 7. 身体能量与长期损耗

文件：

```text
data/energy-depletion-patterns.json
```

作用：识别注意力债务、野心与身体错配、休息禁令、低能量干预窗口。

这部分回答的是：一个人还能不能持续供养当前人生结构。

## 8. 亲密关系与婚育路径

文件：

```text
data/intimacy-family-path-patterns.json
```

作用：识别亲密关系、承诺压力、家庭责任、真实表达能力如何影响长期人生分支。

这部分回答的是：私生活是消耗系统，还是命运转向的稳定底盘。

## 9. 财富路径

文件：

```text
data/wealth-path-patterns.json
```

作用：识别现金流依赖、技能资产化、状态消费压力、转型预算和选择权资本。

这部分回答的是：一个人能否在不崩盘的情况下测试新人生。

## 10. 宏观时代环境

文件：

```text
data/macro-era-patterns.json
```

作用：识别 AI 工具、行业波动、城市成本、作品集式工作等时代变量如何改变个人命运。

这部分回答的是：同一个人放在这个时代，会被哪些新机会和新压力塑形。

## 11. 家庭系统模式

文件：

```text
data/family-system-patterns.json
```

作用：识别家庭如何改变一个人的风险感、羞耻感、稳定偏好和行动阈值。

## 12. 关系模式

文件：

```text
data/relationship-patterns.json
```

作用：识别一个人在亲密关系、友情、合作关系里的重复模式，也对应产品里的“外部观察者复核机制”。

## 13. 资产与阶层机动性

文件：

```text
data/asset-mobility-patterns.json
```

作用：不只看钱，也看技能资产、声誉资产、储蓄缓冲、债务压力和试错成本。

## 14. 环境模式

文件：

```text
data/environment-patterns.json
```

作用：识别城市、行业、机会密度、比较压力、生活成本如何改变命运场。

## 15. 人生事件与关键转折点

文件：

```text
data/life-events.json
data/turning-point-patterns.json
```

作用：

- `life-events` 定义更容易发生的测试场景
- `turning-point-patterns` 定义更像“命运关口”的结构性节点

## 16. 冲突规则与耦合规则

文件：

```text
data/conflict-rules.json
data/coupling-rules.json
```

作用：

- 冲突规则：定义内在 agent 之间如何互相拉扯
- 耦合规则：定义“内在 agent + 外部 agent + 世界状态”如何共同改变人生分支

## 17. 纵向演化机制

文件：

```text
data/life-state-variables.json
data/evolution-event-effects.json
data/evolution-time-horizons.json
```

作用：

- `life-state-variables` 定义会随时间变化的人生状态变量
- `evolution-event-effects` 定义不同分支下的事件后果
- `evolution-time-horizons` 定义 3 个月、1 年、3 年、10 年等时间尺度

当前状态变量包括：

- 自我信任
- 行动动量
- 关系安全感
- 资产缓冲
- 身体恢复力
- 社会可见度
- 家庭牵制力
- 身份弹性

这部分让 FormSight 不只回答“你现在是什么结构”，还可以回答“如果这个结构继续运行，它会怎样改变未来的你”。

## 18. 预测校准机制

文件：

```text
data/evidence-source-weights.json
data/contradiction-rules.json
src/layers/calibration/calibrate-predictions.js
```

作用：

- `evidence-source-weights` 定义不同证据来源的可信权重
- `contradiction-rules` 定义输入里常见的矛盾结构
- `calibrate-predictions` 根据证据强度给模式命中计算置信度

证据强度从高到低大致是：

- 行为历史
- 外部观察
- 结构化事实
- 自我报告
- 愿望与恐惧
- 模型推断

这部分的目标不是让报告看起来更复杂，而是减少“只靠关键词就下判断”的问题，让每个预测都有可信度来源。

## 19. 多轮 Agent 深度模拟

文件：

```text
data/simulation-depth-profiles.json
data/agent-reaction-rules.json
data/simulation-rounds.json
src/layers/deep-simulation/run-agent-rounds.js
```

作用：

- `simulation-depth-profiles` 定义低成本、标准、深度、旗舰四档模拟深度
- `agent-reaction-rules` 定义内在 agent 和外部 agent 在回合中的反应
- `simulation-rounds` 定义压力浮现、机会窗口、外部观察、成本校验等回合事件
- `run-agent-rounds` 让多个 agent 在多轮事件里更新人生状态和分支压力

这部分是向高 token 版本过渡的中间层：当前先用规则模拟 agent 反应，未来可以把每个 agent 的反应替换为 LLM 调用。

## 20. LLM 深度模拟成本估算

文件：

```text
data/llm-reaction-templates.json
data/llm-simulation-cost-profiles.json
src/layers/deep-simulation/estimate-llm-cost.js
```

作用：

- 定义 agent reaction、round synthesis、final deep report 的 prompt 模板
- 按模拟轮数、活跃 agent 数量、调用类型估算 token 消耗
- 支持 standard / deep / flagship 三种 LLM 成本配置

这部分不是实际调用模型，而是为未来高 token 版本预留接口和成本边界。

## 21. LLM Reaction Adapter

文件：

```text
data/llm-adapter-config.json
src/layers/deep-simulation/build-llm-reaction-plan.js
```

作用：

- 为每个 agent reaction 生成未来可发送给 LLM 的 prompt payload
- 为每轮 round synthesis 生成综合 prompt
- 为 final deep report 生成报告 prompt
- 当前默认 `dry_run`，只生成计划，不实际调用模型

后续接入真实模型时，只需要新增 executor，把 `llm_reaction_plan` 里的调用逐条发送到 OpenAI-compatible API。

## 扩充原则

每次新增知识，不要只加解释文字。优先补齐：

- 触发条件
- 影响对象
- 分支权重变化
- 报告解释
- 可验证的输入字段

这样知识库才会真正参与模拟，而不只是参与文案。

## 22. Agent 记忆机制

文件：
```text
data/agent-memory-rules.json
src/layers/deep-simulation/agent-memory.js
```

作用：
- 让每个 agent 在多轮模拟中保留前几轮的关键印象
- 把“上一轮发生了什么”变成下一轮反应的一部分
- 根据记忆小幅改变人生状态变量和分支压力
- 为未来高 token LLM 版本提供 agent memory 上下文

这一步很重要，因为真实人生不是每一天都重新开始。一个人会记住风险、羞耻、支持、失败、机会、身体透支和家庭压力；这些记忆会改变他下一次面对类似事件时的默认反应。

当前版本先用规则模拟记忆，后续可以升级为：
```text
agent memory -> LLM agent reaction -> memory update -> next round
```

## 23. 输入材料质量评分

文件：
```text
data/material-quality-rules.json
src/layers/seed-material/score-material-quality.js
```

作用：
- 判断本次输入材料的“模拟分辨率”
- 区分强材料、可用材料、薄材料
- 告诉用户哪些结论可信，哪些需要后续追问

这一步解决的是产品可信度问题：FormSight 不应该直接装作什么都知道，而应该说明“这次预测建立在什么材料上”。

## 24. 证据模式 / 校准路径

文件：
```text
data/review-path-rules.json
src/layers/simulation/apply-review-path.js
```

作用：
- 外部观察证据：当 seed 中包含朋友、同事、伴侣等外部观察时，提高校准权重
- 私密结构化材料：当材料必须留在本地时，用更细的结构化字段弥补外部观察不足
- 深度研究模式：用于更长时间线、更多 agent 和更复杂耦合分析

这不是商业包装，而是模型校准路径：不同证据来源会改变证据权重、材料质量和人生分支压力。

## 25. 增强耦合规则

文件：
```text
data/advanced-coupling-rules.json
src/layers/simulation/apply-advanced-couplings.js
```

作用：
- 表达多个变量之间的组合效应
- 例如“家庭期待 x 低机动性 -> 转型延迟”
- 例如“证明者 x 高可见度 x 低恢复 -> 机会与耗竭同增”

这部分是长期护城河。真正的预测感不来自单个标签，而来自变量之间的耦合。

## 26. 人生线叙事规则

文件：
```text
data/life-line-narrative-rules.json
src/layers/report/build-life-line-narratives.js
```

作用：
- 把惯性线、干预线、断裂线升级成更有命运档案感的人生线
- 生成 3 个月、1 年、3 年的未来片段
- 生成更容易阅读和复核的短句

这一步提高的是报告可读性和结果可复核性。

## 27. 预测置信解释

文件：
```text
src/layers/calibration/explain-confidence.js
```

作用：
- 解释哪些预测最可信
- 解释哪些判断只是弱信号
- 显示不确定性来源

这一步让 FormSight 和廉价心理测试拉开距离：它不是只给结论，而是给结论背后的证据结构。

## 28. 象征线索与弱信号层

文件：
```text
data/symbolic-signal-rules.json
src/layers/simulation/extract-symbolic-signals.js
```

作用：
- 识别名字、网名、地点、物品、宠物、疾病记忆、门槛事件、反复数字、反复词语、公开作品等弱信号
- 观察这些线索如何和身份叙事、羞耻、责任、关系、作品署名、社会评价发生连接
- 以低权重方式影响人生分支

注意：
这不是玄学定命。名字、地点或物品不会直接决定命运。它们的作用是：当它们反复出现在一个人的生活、记忆和社会反馈里，就可能成为身份锚点或行动提示。

示例：
```text
名字 / 网名 -> 作品署名 -> 社会可见度
地点分裂 -> 身份过渡 -> 新场域入口
宠物 -> 日常责任 -> 降低断裂概率
疾病记忆 -> 失去节律 -> 恢复动力 / 自责
未完成物 -> 注意力债务 -> 默认线增强
```

## 29. 象征耦合规则

文件：
```text
data/symbolic-coupling-rules.json
src/layers/simulation/apply-symbolic-couplings.js
```

作用：
- 不单独迷信某个象征，而是判断它和其他变量组合后是否改变分支
- 将象征线索与内在 agent、外部 agent、现实状态分数耦合

示例：
```text
门槛事件 x 家庭角色 x 低资产缓冲 -> 默认线增强
自我档案 x 公开作品 x 观察者 -> 隐秘转向线增强
失去节律 x 身体事件 x 控制者 -> 默认线与干预线同时增强
欺骗伤口 x 讨好者 x 沉默 -> 默认线和断裂线增强
地点分裂 x 线上身份 -> 新场域入口
```

这层让 FormSight 从“人格分析”进一步变成“人生材料分析”：它不只看一个人是什么性格，也看他被哪些名字、地点、物件、记忆和场域持续牵引。
