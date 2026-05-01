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

每次用户给新文章草稿时，按这个顺序执行：

1. 选定 slug 和文章主题。
2. 写入或更新 `rag-articles/{slug}.md`。
3. 基于 RAG Markdown 浓缩成 `blog-drafts/{slug}.md`。
4. 按 `NEW_BLOG_POST.md` 生成 `blog/{slug}.html`。
5. 更新 `js/i18n/articles/{slug}.js` 和 `js/i18n/blog-list.js`。
6. 更新 `index.html` 最新 6 篇。
7. 更新 `blog/index.html` 全量列表和计数。
8. 更新 `BLOG_TOPIC_POOL.md` 使用日期。
9. 运行必要校验。
10. 默认只留在工作区，除非用户明确要求提交或推送。
11. 如果用户明确要求提交并推送远程，推送完成后必须提醒用户：把本次新增或更新的 `rag-articles/{slug}.md` 放入实际 RAG 系统。

---

## 7. 校验清单

- [ ] `rag-articles/{slug}.md` 存在
- [ ] Markdown front matter 符合标准
- [ ] Markdown 标题和正文结构清晰
- [ ] 博客 HTML 已按站点模板创建
- [ ] 对应 i18n 分块中英文 key 齐全
- [ ] `node tools/check_i18n.js` 严格项通过
- [ ] 首页最新 6 篇规则正确
- [ ] 列表页包含全部文章，排序和编号正确
- [ ] `blog_list_sub` 计数正确
- [ ] 没有写入 `webblog` 项目之外
- [ ] 没有修改无关文件
- [ ] 如已推送远程，已提醒用户同步 `rag-articles/{slug}.md` 到 RAG 系统
