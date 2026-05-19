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
线上站点：https://erickk.site/
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

浓缩要求：

- 保留一个清晰主论点。
- 控制小节数量，通常 4 到 6 个。
- 每个小节只保留最关键的 2 到 4 段。
- 列表只保留能帮助读者理解结构的要点。
- 技术文章优先保留工程判断、踩坑、权衡和可执行经验。
- 评论文章优先保留观点递进、现实例子和结论边界。
- 避免把 Markdown 草稿机械搬进 HTML。

推荐最终文章结构：

```markdown
# 标题

## 引子 / 问题

## 核心机制 / 背景

## 工程影响 / 现实风险

## 应对方式 / 实践建议

## 写在最后
```

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
9. 同步 SEO 生成内容和 `_site/` 发布目录。
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
```

---

## 7. 校验清单

- [ ] `rag-articles/{slug}.md` 存在
- [ ] Markdown front matter 符合标准
- [ ] Markdown 标题和正文结构清晰
- [ ] 博客 HTML 已按站点模板创建
- [ ] 对应 i18n 分块中英文 key 齐全
- [ ] `node tools/update_seo.js` 已同步 sitemap、RSS、SEO meta、专题页和相关文章
- [ ] `node tools/update_seo.js --check` 通过
- [ ] `node tools/check_i18n.js` 严格项通过
- [ ] `node tools/build_site.js` 已生成 `_site/` 发布目录
- [ ] `node tools/build_site.js --check` 通过
- [ ] 首页最新 6 篇规则正确
- [ ] 列表页包含全部文章，排序和编号正确
- [ ] `blog_list_sub` 计数正确
- [ ] 没有写入 `webblog` 项目之外
- [ ] 没有修改无关文件
- [ ] 如已推送远程，已提醒用户同步 `rag-articles/{slug}.md` 到 RAG 系统
