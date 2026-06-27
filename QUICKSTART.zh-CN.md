# 见相 FormSight Engine｜快速开始

这份仓库只包含「见相」的底层运行模型，不包含私域运营资料、视频脚本、真实用户材料或付费交付模板。

它适合会用 Node.js / Agent / Codex / Cursor / Claude Code 的人，在本地用自己的材料做模拟。

## 1. 安装环境

需要：

- Node.js 18 或以上
- Git

当前版本不需要安装额外 npm 依赖。

## 2. 运行示例

下载仓库后，在项目根目录运行：

```bash
node src/simulate.js examples/sample-seed.json
```

生成 HTML 报告：

```bash
node src/render-report.js examples/sample-seed.json reports/sample-report.html
```

生成可视化面板：

```bash
node src/render-visualization.js examples/sample-seed.json reports/simulation-visualization.html
```

也可以用 npm scripts：

```bash
npm run check
npm run simulate
npm run report
npm run visualize
```

生成结果会出现在：

```text
reports/
```

## 3. 换成自己的材料

复制示例文件：

```bash
cp examples/sample-seed.json examples/my-seed.local.json
```

然后编辑：

```text
examples/my-seed.local.json
```

再运行：

```bash
node src/render-report.js examples/my-seed.local.json reports/my-report.html
node src/render-visualization.js examples/my-seed.local.json reports/my-visualization.html
```

`.local.json` 文件默认不会被 Git 提交，适合放自己的私密材料。

## 4. 你需要填写什么

seed 文件可以包括：

- 当前问题；
- 最近重要事件；
- 家庭系统；
- 关系网络；
- 现实资源；
- 身体精力；
- 早期经历；
- 反复行为模式；
- 价值观；
- 想要的未来；
- 害怕的未来；
- 关键转折点。

如果不知道怎么写，可以先看：

```text
docs/模拟问题引导.md
```

## 5. 隐私提醒

不要把真实个人材料直接提交到公开 GitHub。

建议：

- 使用 `*.local.json` 存放自己的材料；
- 删除姓名、手机号、微信号、学校、公司、住址等信息；
- 不上传聊天截图；
- 不公开别人的材料，除非得到明确同意。

## 6. 怎么理解结果

见相不是算命，也不是心理诊断。

它更像一个结构化模拟器：把你的经历、卡点、反应模式、现实资源拆成变量，然后生成几条可能的人生路径。

结果应该被当成：

```text
假设 / 地图 / 复盘线索
```

而不是：

```text
命令 / 诊断 / 最终答案
```
