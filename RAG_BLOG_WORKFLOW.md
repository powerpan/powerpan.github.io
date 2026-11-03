# RAG Markdown 到博客发布工作流

本文档定义后续用 Markdown 作为 RAG 系统底座时，如何把 GPT 生成的文章草稿整理成站点可发布博客。

适用场景：

- 用户先让 GPT 生成一篇文章，大概率是 Markdown。
- 需要把草稿整理成项目内统一的 RAG Markdown。
- 需要将长草稿浓缩到适合博客阅读的长度。
- 最后需要按站点现有规则生成博客详情页 HTML，并更新首页、列表页和 i18n。

---

## 0. 基本原则

- 所有输入、输出和中间文件都必须留在 `webblog` 项目内部。
- 不要写入项目之外的目录。
- 不要直接修改已有原始 HTML，除非是在执行正式发文流程时更新站点索引或新增文章页。
- RAG 底座以 `rag-articles/*.md` 为主。
- HTML 发布仍然严格遵循 [`NEW_BLOG_POST.md`](/Users/ericpan/game_project/webblog/NEW_BLOG_POST.md)。
- 当前展示前端为 `templates/webblog-reimagined/`。旧站 HTML/i18n 仍是双语内容源，完成后须用 `--articles-only` 导入新版并构建 `dist/`；不能只做旧版页面，也不能用旧站数据覆盖新版简介或项目。具体步骤见 `NEW_BLOG_POST.md` 的“当前前端与内容入口”和第 6.5 节。

---

## 0.2 线上中转仓库与取稿边界

当用户说“去中转仓库 / 中转文件夹获取最新文章 / 处理线上中转稿件”时，默认指线上 handoff 仓库，而不是本地 `webblog/transfer/` 目录本身。

线上中转仓库信息：

```text
GitHub 仓库：powerpan/gpt-codex-workspace
主要目录：transfer/YYYY-MM-DD/
常见稿件：Markdown 草稿，文件名通常是中文文章标题
辅助索引：BLOG_ARTICLE_INDEX.md（如存在，用于检查已发布文章和避免重复选题）
辅助说明：README.md、docs/CONTEXT.md（如存在，用于理解 handoff 规则）
```

正式站点仓库仍然是：

```text
GitHub 仓库：powerpan/powerpan.github.io
本地路径：/Users/ericpan/game_project/webblog
线上站点：https://erichz.site/
```

线上中转稿件进入本地发布流程时，先把选中的远程草稿归档到本地：

```text
transfer/{YYYY-MM-DD}/{原始文件名}.md
```

然后再按本文档生成或更新：

```text
rag-articles/{slug}.md
blog-drafts/{slug}.md
blog/{slug}.html
js/i18n/articles/{slug}.js
js/i18n/blog-list.js
index.html
blog/index.html
BLOG_TOPIC_POOL.md
```

给 Codex / Agent 的交叉验证要求：

- 处理线上中转稿件前，应优先检查当前项目文档中的本节说明。
- 如果 Codex 有历史记忆或会话记录，也可以用关键词 `powerpan/gpt-codex-workspace`、`BLOG_ARTICLE_INDEX.md`、`transfer/YYYY-MM-DD/` 进行交叉验证。
- 如果项目文档、Codex 记忆、GitHub 实际返回结果之间存在冲突，不要自行猜测；必须报告冲突来源、证据路径或远程路径，并等待用户确认。
- 不得把 Codex 记忆当成唯一事实来源；最终以当前项目文档和实际 GitHub 查询结果为准。

---

## 0.3 未处理稿件判定与空队列处理

目前线上中转仓库没有独立的 `processed` 标记、状态文件或 manifest。因此，“是否未处理”只能通过标题、文件名、slug 和正文相似度做保守判断。

处理线上中转仓库时，按下面顺序判断：

1. 到 `powerpan/gpt-codex-workspace` 的 `transfer/YYYY-MM-DD/` 中，从最新日期开始查找 Markdown 草稿。
2. 对候选稿件提取标题、文件名、可能的 slug、正文核心主题。
3. 在本地 `webblog` 项目中检查是否已有标题或内容相符的文章痕迹，重点检查：

```text
transfer/
rag-articles/
blog-drafts/
blog/
js/i18n/articles/
blog/index.html
js/i18n/blog-list.js
```

4. 如果本地已经存在标题、slug 或内容明显相符的 `rag-articles`、`blog-drafts`、`blog/*.html`、i18n 或列表页记录，应视为已处理，不要重复发布。
5. 如果远程候选稿件在本地上述位置都没有相符记录，才可视为“可能未处理稿件”，然后继续按本文档流程处理。

如果在线上中转仓库没有找到未处理文章：

- 必须立即停止发文流程。
- 不要从 `BLOG_TOPIC_POOL.md` 自行选题原创。
- 不要复用旧的 transfer 草稿。
- 不要凭空生成新文章。
- 不要修改 `blog/`、`rag-articles/`、`blog-drafts/`、`js/i18n/`、`index.html` 或 `blog/index.html`。
- 直接向用户报告：`线上中转仓库没有找到未处理文章`。
- 报告时说明已检查的远程目录范围，以及用于判定“已处理”的本地目录范围。
- 只有用户明确指定某个草稿、重新提供文章内容，或明确要求“从主题池原创生成”，才能继续。

---

## 0.5 固定输入输出目录

每一次文章任务都必须使用下面的固定目录，不要临时发明新位置。

| 阶段 | 目录 | 命名规则 | 说明 |
|------|------|----------|------|
| 外部转入原稿 | `transfer/{YYYY-MM-DD}/` | 保留来源文件名 | 从其他仓库或工具转入的原始材料，只做归档，不直接发布 |
| RAG 标准底稿 | `rag-articles/` | `{slug}.md` | 进入 RAG 系统的标准 Markdown，必须带统一 front matter |
| 博客浓缩稿 | `blog-drafts/` | `{slug}.md` | 基于 RAG 底稿浓缩后的博客长度 Markdown，用于人工审阅和生成 HTML |
| 博客详情页 | `blog/` | `{slug}.html` | 站点实际发布页面 |
| 国际化文本 | `js/i18n/articles/{slug}.js`、`js/i18n/blog-list.js` | `{prefix}_*`、`blog{N}_title`、`blog_card{N}_*` | 文章正文每篇一个文件，卡片和计数集中在 blog-list |
| 首页最新文章 | `index.html` | 最新 6 篇 | 只维护首页博客区的最新 6 篇卡片 |
| 全量文章列表 | `blog/index.html` | 全部文章倒序 | 必须维护总数、筛选计数和连续编号 |
| 主题使用记录 | `BLOG_TOPIC_POOL.md` | 主题行追加日期 | 每次发文都要记录选用主题 |
| 新版文章快照 | `templates/webblog-reimagined/content/` | `en.json`、`zh.json`、`source.json`、`seo.json` | 从 `_site/` 用 `--articles-only` 同步，保留新版个人与项目内容 |
| 新版 RSS | `templates/webblog-reimagined/public/` | `feed.xml` | 文章导入器同步，保留既有 GUID |
| 新版预览页 | `templates/webblog-reimagined/`、其 `zh/` | `index.html`、`journal/` | 现有构建器生成；编号不是永久文章 ID |
| 新版生产构建 | `templates/webblog-reimagined/dist/` | 正式 slug 和双语路径 | 仅本地生成、不自动上传；不提交构建产物 |
| 发布清单与可选 ZIP | `templates/webblog-reimagined/` | `release-manifest.json`、`webblog-reimagined-production.zip` | 构建器/打包器生成，均不提交；未获授权不上传 |
| 预览验收截图 | `node_modules/.cache/article-qa/` | `{slug}-{lang}-{viewport}-{state}.png` | 项目内临时证据，不提交；临时 QA 脚本检查后删除 |
| 字体维护 | `templates/webblog-reimagined/assets/fonts/` | 现有 `noto-*-sc-content.woff` | 新字符不全时扩充子集，保留已有字形；原始字体缓存放 `node_modules/.cache/article-fonts/`，不提交 |
| 转换脚本 | `tools/` | `*.py` | 项目内工具脚本统一放这里 |

站点文章筛选固定使用 6 个主分类：

| 主分类 | `data-category` | 筛选 key | 标签 key |
|--------|-----------------|----------|----------|
| AI 工程 | `ai` | `blog_filter_ai` | `blog_tag_ai` |
| Agent 自动化 | `agent` | `blog_filter_agent` | `blog_tag_agent` |
| 视觉多模态 | `vision` | `blog_filter_vision` | `blog_tag_vision` |
| 系统架构 | `architecture` | `blog_filter_architecture` | `blog_tag_architecture` |
| 技术观察 | `observation` | `blog_filter_observation` | `blog_tag_observation` |
| 社会随笔 | `essay` | `blog_filter_essay` | `blog_tag_essay` |

固定路径示例：

```text
transfer/2026-04-27/ai-agent-architecture-survey-draft.md
rag-articles/ai-agent-architecture.md
blog-drafts/ai-agent-architecture.md
blog/ai-agent-architecture.html
```

---

## 1. 标准 RAG Markdown 格式

后续所有进入 RAG 底座的文章，都统一整理为：

```markdown
---
type: article
source: blog
original_file: xxx.html
---

# 标题

## 小节

正文
```

字段说明：

| 字段 | 说明 |
|------|------|
| `type` | 固定为 `article` |
| `source` | 固定为 `blog` |
| `original_file` | 如果来源是已有 HTML，填写原 HTML 文件名；如果来源是新 GPT 草稿，填写计划发布的 `{slug}.html` |

文件命名：

```text
rag-articles/{slug}.md
```

示例：

```text
blog/webgpu-dl.html -> rag-articles/webgpu-dl.md
blog/ai-workflow-agent-blog.html -> rag-articles/ai-workflow-agent-blog.md
```

---

## 2. 已有 HTML 转 RAG Markdown

当需要把现有博客文章导入 RAG 底座时，运行：

```bash
python tools/import_blog_to_md.py
```

脚本行为：

- 读取 `blog/*.html`
- 跳过没有 `<article class="blog-article-body">` 的页面，例如 `blog/index.html`
- 提取 `<h1>` 作为标题
- 提取 `<article class="blog-article-body">` 内正文
- 保留 `h2`、`p`、`ul`、`li`、`blockquote`、代码块和内联代码的文本结构
- 输出到 `rag-articles/*.md`
- 打印转换记录：

```text
Converted: blog/webgpu-dl.html -> rag-articles/webgpu-dl.md
```

---

## 3. GPT 草稿转标准 RAG Markdown

当用户提供一篇 GPT 生成的 Markdown 草稿时，按下面流程处理：

1. 读取草稿内容，判断主题、标题、核心论点和适合的 slug。
2. 不直接把草稿原样发布。
3. 先整理成标准 RAG Markdown，输出到：

```text
rag-articles/{slug}.md
```

4. 如果草稿没有 front matter，补齐标准 front matter。
5. 如果草稿结构混乱，重排为：

```markdown
# 标题

## 小节一

正文

## 小节二

正文
```

6. 保留有价值的技术细节、判断依据、工程经验和具体例子。
7. 删除明显重复、口水化、过度铺垫、营销化表达。

新 GPT 草稿的 `original_file` 规则：

```yaml
original_file: {slug}.html
```

---

## 4. 浓缩成博客长度

RAG Markdown 是底稿，不等于最终博客。

在生成 HTML 前，需要把文章浓缩成适合站点风格的博客长度，并固定输出到：

```text
blog-drafts/{slug}.md
```

编辑标准：

- 固定写作口气：从我们自己的立场写文章，开门见山提出判断，再拿事件、数字、推导和具体场景展开。让读者感到作者确实在思考和表达，不写成替各种立场预先免责的审查报告。此标准适用于以后每篇文章及其英文版。
- 删除防御性叙述，包括“这不是我编造的”“我没有／我避免／我没有声称”“不代表我认为”“这里不是在指控”等作者自证，以及开头、结尾的通用免责段。核验日期、复现状态、编辑说明放在 RAG 底稿或内部记录中；正文把来源和实验配置写在事情发生的地方。
- 技术条件用肯定、具体的事实表达。例如写“这组实验固定 KV 内存预算，并发从 2 条增加到 3 条”，而不是接连声明“不代表单请求变快、不能证明同 batch 变慢”。确实影响结论的条件保留在论证中，不把每个判断都软化成“可能、未必、还需进一步研究”。代码的否定条件、反例和必要的数值区别照常保留。
- 标题和小节要有指向、有态度，允许反问和冲突感；正文为标题提供证据。少写抽象的“边界、启示、真正重要的是”，多写发生了什么、谁付出了代价、我支持什么做法。语气鲜明靠判断和材料，不能靠改动数字、删掉关键条件或把指控写成定案。
- 先列出原稿的主论点、关键案例、具体证据、反例或限制条件，再决定删什么。压缩重复论述和铺垫，不把事实过程压成一句抽象结论。
- 对有多个独立案例的深度技术评论，博客版通常保留约 3000–5000 个汉字的正文，供篇幅复核，不作为机械字数上限。若压到 3000 字以下，必须检查是否丢了案例经过、来源归属或结论边界；若超过区间，只删重复，不为凑字数删证据。
- 关键案例交代背景、动作、结果和来源。资料记载了攻击尝试，就写尝试的过程；确有成功访问，再写访问结果。用具体事实说明进展，其他案例只在能推进论证时保留。
- 近期事件、数字、法律或安全判断逐项核对原始公开材料；把来源放在相关段落附近。区分机构报告、第三方观察、作者推断和已确认事实。
- 博客版不单独设置文末“参考资料”“资料与边界”或 Sources 清单；必要出处直接链接在正文对应语句中，不使用跳转到文末的编号注释。来源核验、结论边界仍须保留，完整参考记录留在 RAG 底稿中。
- 小节数量、段落长短随材料变化。标题要指向本节真正讨论的事件或判断；避免整齐的“问题／原因／影响／四点建议／结语”套式，也不要为了视觉对称强行做清单。
- 保留作者的判断过程、真实犹疑和必要的细节。删除口号式总结、重复的反问、无事实支撑的“本质上”“真正重要的是”等句式；段尾不必每次升华成金句。
- 技术文章说明工程约束和可执行取舍；评论文章写出观点分歧、利益关系和责任如何分配。不要把 Markdown 机械搬进 HTML，也不要用几个加粗要点代替叙述。

在生成 HTML 前，通读一次 `blog-drafts/{slug}.md`：读者应能理解事情怎样发生、我们支持和反对什么、事实怎样支撑这些判断。若读起来像摘要提纲或审核意见，先修改短稿，再继续做页面。

再做一次口气复核：每段是在推进观点，还是在替作者澄清立场？删掉只为防止读者误会而追加的辩解，把应当留下的实验条件和来源并回对应段落。英文独立通读，避免把中文删掉的免责声明换成英语留在页面上。

---

## 5. 从浓缩稿生成博客 HTML

最终发布 HTML 时，严格执行：

```text
NEW_BLOG_POST.md
```

必须完成：

- 新建 `blog/{slug}.html`
- 新建或更新 `js/i18n/articles/{slug}.js` 的 `zh` 和 `en` 字典
- 更新 `js/i18n/blog-list.js` 的首页/归档卡片 key 和计数
- 如果是最新 6 篇，更新首页 `index.html`
- 更新完整列表页 `blog/index.html`
- 更新文章计数
- 更新主题池 `BLOG_TOPIC_POOL.md`
- 验证所有 `data-i18n` key 存在
- 验证 `data-i18n-html` 和 `data-i18n` 使用正确
- 验证首页最新 6 篇、列表页顺序和数量正确

注意：

- HTML 不是从 Markdown 直接无脑转换。
- HTML 要符合现有页面模板、导航、footer、script 和 CSS 引用顺序。
- i18n key 命名要遵循 `NEW_BLOG_POST.md`。
- 中文正文和英文翻译都要补齐。
- 英文按同一事实与论证重新编辑，不能比中文少掉关键案例、来源或限制条件。
- 删除参考清单时，同步博客 Markdown、详情页、双语字典和目录项；正文中的编号引用改为直接来源链接，不能留下失效的 `#ref-*` 锚点。原始中转稿和 RAG 底稿不因页面展示调整而丢失资料。
- 阅读时长以最终正文估算，并同步详情页、首页卡片和归档卡片；修改篇幅后重新核对。

---

## 6. 推荐执行顺序

每次用户直接给新文章草稿，或已经从线上中转仓库确认存在未处理稿件时，按这个顺序执行。
如果任务来源是线上中转仓库，必须先执行 `0.2` 和 `0.3` 的取稿、交叉验证和空队列判断；没有未处理稿件时不得进入下面的发布步骤：

1. 选定 slug 和文章主题。
2. 写入或更新 `rag-articles/{slug}.md`。
3. 基于 RAG Markdown 浓缩成 `blog-drafts/{slug}.md`。
4. 按 `NEW_BLOG_POST.md` 生成 `blog/{slug}.html`。
5. 更新 `js/i18n/articles/{slug}.js` 和 `js/i18n/blog-list.js`。
6. 更新 `index.html` 最新 6 篇。
7. 更新 `blog/index.html` 全量列表和计数。
8. 更新 `BLOG_TOPIC_POOL.md` 使用日期。
9. 同步 SEO 和 `_site/` 中间构建，再以 `--articles-only` 导入新版并生成 `templates/webblog-reimagined/dist/`。
10. 运行发布前校验。
11. 默认只留在工作区，除非用户明确要求提交或推送。
12. 如果用户明确要求提交并推送远程，推送完成后必须提醒用户：把本次新增或更新的 `rag-articles/{slug}.md` 放入实际 RAG 系统。

发布前固定命令：

```bash
node tools/update_seo.js
node tools/update_seo.js --check
node tools/check_i18n.js
node tools/build_site.js
node tools/build_site.js --check
npm run check
node templates/webblog-reimagined/tools/import-content.cjs --articles-only
node templates/webblog-reimagined/tools/release.cjs
node --test templates/webblog-reimagined/tools/release.test.cjs
```

---

## 7. 校验清单

- [ ] `rag-articles/{slug}.md` 存在
- [ ] Markdown front matter 符合标准
- [ ] Markdown 标题和正文结构清晰
- [ ] 博客短稿保留关键案例的过程、出处与证据限制，篇幅经过复核
- [ ] 小节标题和段落经过人工编辑，没有重复的提纲式套话
- [ ] 博客 HTML 已按站点模板创建
- [ ] 对应 i18n 分块中英文 key 齐全
- [ ] 中英文案例、数字、限制条件对齐；阅读时长在各入口一致
- [ ] `node tools/update_seo.js` 已同步 sitemap、RSS、SEO meta、专题页和相关文章
- [ ] `node tools/update_seo.js --check` 通过
- [ ] `node tools/check_i18n.js` 严格项通过
- [ ] `node tools/build_site.js` 已生成 `_site/` 内容中间构建
- [ ] `node tools/build_site.js --check` 通过
- [ ] `npm run check` 通过（包括公开网址、站内链接及旧链接兼容测试）；新版生产包使用 `preview-production.cjs` 验收，不把 `npm run preview` 的旧版画面当作新版结果
- [ ] `npm run locales:check` 通过；构建产物含 `/blog/{slug}` 与 `/en/blog/{slug}`，英文正文无需 JS 即存在，语言入口指向对应版本
- [ ] 只维护原始 HTML 和对应中英文字典，未手工复制英文镜像、未提交 `_site/`；新环境先用 Node 22.16+ 运行 `npm ci`
- [ ] 首页最新 6 篇规则正确
- [ ] 新版双语快照和 `dist/` 已构建，简介/经历/项目未被文章同步覆盖
- [ ] 新版桌面/移动端详情、目录、语言切换、首页六篇、归档搜索和专题筛选检查通过
- [ ] 列表页包含全部文章，排序和编号正确
- [ ] `blog_list_sub` 计数正确
- [ ] 没有写入 `webblog` 项目之外
- [ ] 没有修改无关文件
- [ ] 如已推送远程，已提醒用户同步 `rag-articles/{slug}.md` 到 RAG 系统
