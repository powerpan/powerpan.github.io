# 新建博客文章 — 完整流程

每次创建新博客文章时，需要按顺序完成以下步骤。

正文编辑先遵守 `RAG_BLOG_WORKFLOW.md` 第 4 节：深度稿不能只剩提纲式摘要。详情页应保留关键案例的经过、出处与适用配置，中文与英文要承载同一组事实；小节标题用具体内容命名，阅读时长按最终正文重新核对。

以后每篇文章都按观点写作来编辑：从我们自己的视角明确表达判断，用事实、过程和推导支撑；标题要抓人，小节要具体。删掉“我没有／我避免／没有声称”“这不是我编造的”等自证，以及开头、结尾的模板式免责段。把必要条件写进对应实验或事件，把核验日期、复现状态等编辑记录留在 RAG 底稿。中英文同样执行，发文前逐段检查有没有反复退让、对称式澄清和审查报告口气。

详情页不单列文末参考资料清单。必要来源直接链接在正文对应语句中；完整资料保留在 RAG 底稿。移除旧清单时，要同步博客稿、双语文本和目录项，并把指向 `#ref-*` 的编号引用改为直接链接。

## 当前前端与内容入口

现行前端是 `templates/webblog-reimagined/`，生产目录是其中的 `dist/`。根目录的 `blog/`、`js/i18n/`、`index.html` 和 `blog/index.html` 仍作为双语内容源及兼容层维护，`_site/` 是它的中间构建，不能把它当作新版生产包发布。

下面的 HTML 模板和 i18n 步骤用于维护内容源，不代表要给新版复制旧导航、CSS 或动画。源内容校验完成后，必须再同步新版，命令见第 6.5 节。新版文章由 `content/en.json`、`content/zh.json` 经现有构建器生成，不手工复制编号页；正式网址继续使用原 slug。

---

## 1. 创建详情页 HTML

复制任意已有博客文章作为模板（如 `blog/context-rot.html`），保存为 `blog/{slug}.html`。

需要修改的部分：

| 位置 | 修改内容 |
|------|----------|
| `<title>` | `{文章标题} — Eric` |
| `<meta name="description">` | 文章摘要（中英文皆可） |
| `.detail-tags span` | 标签、日期、阅读时间 |
| `h1` 的 `data-i18n-html` | 指向新的 `_title` key |
| `.detail-subtitle` 的 `data-i18n` | 指向新的 `_sub` key |
| 各 `h2` 的 `data-i18n` | 指向新的 `_s1` ~ `_sN` key |
| 各 `p` 的 `data-i18n` 或 `data-i18n-html` | 指向新的 `_p1` ~ `_pN` key |
| 各 `li` 的 `data-i18n-html` | 指向新的 `_f1` ~ `_fN` key（含 `<strong>` 的必须用 `data-i18n-html`） |
| `<code>` 块中的注释 | 如需 i18n，用 `data-i18n` 指向对应 key |

**不要修改的部分**（保持模板原样）：
- `<head>` 中的 CSS 引用顺序：`base.css` → `components.css` → `detail.css` → `responsive.css`
- Nav 结构、scroll progress、cursor、particle canvas
- Footer（`.detail-footer`）、back-to-top 按钮
- 底部 `<script>` 引用：`i18n.js` → `i18n/core.js` → `i18n/blog-list.js` → `i18n/articles/{slug}.js` → `motion.js` → `cursor.js` → `detail.js`。详情页与首页共用动效偏好和按需光标，不要另写持续运行的光标动画循环。
- Mobile hamburger menu + `mobileLangBtn`

---

## 1.5 先从主题池里选题

每次发文前，先查看 [`/Users/ericpan/game_project/webblog/BLOG_TOPIC_POOL.md`](/Users/ericpan/game_project/webblog/BLOG_TOPIC_POOL.md)。

使用规则如下：

- 处理用户提供或线上中转的稿件时，按文章内容确定分类；只有原创选题才从主题池挑选方向
- 这一行只代表“大主题”，不要直接照抄成具体小标题
- 具体内容仍然由当前文章情况、近期技术趋势和站点已有内容共同决定
- 站点当前使用 6 个主分类：`AI 工程`、`Agent 自动化`、`视觉多模态`、`系统架构`、`技术观察`、`社会随笔`
- `技术观察` 和 `社会随笔` 都是独立分类，不要强行并入技术实现方向
- 如果某个主题已经使用过，就在同一行后面追加使用日期，格式为 `| 2026-04-26`
- 同一主题可以再次使用，但要优先避免连续重复
- 如果某一行后面已经有多个日期，表示这个主题历史上多次被使用过
- 自动化每次发文前，应优先挑选没有日期或较久未使用的主题

示例：

```text
AI 工程
技术观察 | 2026-04-26
```

站点筛选分类与 key 对应关系：

| 主分类 | `data-category` | 筛选 key | 标签 key |
|--------|-----------------|----------|----------|
| AI 工程 | `ai` | `blog_filter_ai` | `blog_tag_ai` |
| Agent 自动化 | `agent` | `blog_filter_agent` | `blog_tag_agent` |
| 视觉多模态 | `vision` | `blog_filter_vision` | `blog_tag_vision` |
| 系统架构 | `architecture` | `blog_filter_architecture` | `blog_tag_architecture` |
| 技术观察 | `observation` | `blog_filter_observation` | `blog_tag_observation` |
| 社会随笔 | `essay` | `blog_filter_essay` | `blog_tag_essay` |

---

## 2. 添加 i18n 翻译到分块文件

i18n 运行逻辑保留在 `js/i18n.js`，不要把新翻译继续塞回这个文件。

新文章需要改两个数据文件：

| 内容 | 文件 | 说明 |
|------|------|------|
| 文章正文、标题、小节 | `js/i18n/articles/{slug}.js` | 每篇文章一个文件，只放 `{prefix}_*` |
| 首页/归档卡片 | `js/i18n/blog-list.js` | 放 `blog{N}_title`、`blog_card{N}_title`、`blog_card{N}_desc`、计数文案 |

所有新增 key 都必须在 `zh` 和 `en` 两个字典中**同时**添加。

### Key 命名规范

| Key | 用途 | 示例 |
|-----|------|------|
| `{prefix}_title` | 文章 h1 标题（`data-i18n-html`，可含 `<span class="hl">`） | `bcrot_title` |
| `{prefix}_sub` | 副标题 / 一句话摘要 | `bcrot_sub` |
| `{prefix}_s1` ~ `{prefix}_sN` | 各 section 的 h2 标题 | `bcrot_s1` |
| `{prefix}_p1` ~ `{prefix}_pN` | 各段落文本 | `bcrot_p1` |
| `{prefix}_f1` ~ `{prefix}_fN` | 列表项（通常含 `<strong>`，必须用 `data-i18n-html`） | `bcrot_f1` |
| `{prefix}_l1` ~ `{prefix}_lN` | 代码块中的注释行（可选） | `bcrot_l1` |
| `blog{N}_title` | 主页卡片标题 | `blog11_title` |
| `blog_card{N}_title` | 列表页卡片标题 | `blog_card11_title` |
| `blog_card{N}_desc` | 列表页卡片描述 | `blog_card11_desc` |

**前缀（prefix）选择**：取文章英文名缩写，如：
- Context Rot → `bcrot`
- Token Economy → `btk`
- AI Agent → `ba`
- Transformer Detection → `bt`
- Flink+Kafka → `bf`
- WebGPU → `bw`
- Image Pipeline → `bi`
- SAM2 → `bs`
- Feminism → `bfem`
- Involution → `bchoice`

### ⚠️ data-i18n vs data-i18n-html 规则

- 翻译值包含 `<strong>`、`<code>`、`<em>`、`<br>`、`<span>`、`<a>` → HTML 元素**必须**用 `data-i18n-html`
- 翻译值是纯文本 → 用 `data-i18n`
- 用错会导致 HTML 标签被转义显示为纯文本

---

## 3. 添加卡片到主页 `index.html`（仅最新 6 篇）

主页 blog section 只显示**最新的 6 篇**文章，按日期倒序排列。

在 `index.html` 的 `.blog-list` 中，按日期插入新卡片：

```html
<a href="blog/{slug}.html" class="blog-item reveal reveal-d{N}" data-hover>
    <div class="blog-date">{YYYY.MM}</div>
    <div class="blog-item-title" data-i18n="blog{N}_title">{中文标题}</div>
    <div class="blog-item-meta">
        <span class="blog-item-tag">{标签}</span>
        <span class="blog-item-time">{N} min</span>
        <span class="blog-item-arrow">→</span>
    </div>
</a>
```

**注意**：
- `reveal-d{N}` 从 `d0` 开始递增（第一篇无 class，第二篇 `d1`，以此类推）
- 如果新文章是最新的，插入到第一位，原有卡片的 `d` 值全部 +1
- 如果新文章不是最新的（不应该出现在主页），不要添加到主页
- 新文章进入最新 6 篇时，将原第 6 篇从首页移出；它仍保留在归档页和详情页，不删除文章

---

## 4. 添加卡片到列表页 `blog/index.html`

列表页显示**全部**文章，按日期倒序排列。

在 `blog/index.html` 的 `.blog-listing-grid` 中，按日期插入新卡片：

```html
<!-- {序号} -->
<a href="{slug}.html" class="blog-list-card reveal" data-hover>
    <div class="blog-list-left">
        <div class="blog-list-num">{序号，两位数}</div>
        <div class="blog-list-title" data-i18n="blog_card{N}_title">{中文标题}</div>
        <div class="blog-list-desc" data-i18n="blog_card{N}_desc">{中文描述}</div>
        <div class="blog-list-meta">
            <span class="blog-list-tag">{标签}</span>
            <span class="blog-list-date">{YYYY.MM.DD}</span>
            <span class="blog-list-readtime">{N} min</span>
        </div>
    </div>
    <div class="blog-list-right">
        <span class="blog-list-arrow">→</span>
    </div>
</a>
```

**注意**：
- 插入后，所有卡片的序号（`blog-list-num` 和注释编号）需要**重新排列**为 01, 02, 03...
- **不要删除或移除已有的卡片**

---

## 5. 更新文章计数

### 5a. `blog/index.html` 中的计数

```html
<p data-i18n="blog_list_sub">All Posts — {N} articles and counting</p>
```

### 5b. `js/i18n/blog-list.js` 中的计数（zh 和 en 都要改）

```js
blog_list_sub: 'All Posts — {N} articles and counting',
```

---

## 6. 验证清单

- [ ] 详情页底部引用了 `../js/i18n/articles/{slug}.js`
- [ ] 详情页 HTML 中所有 `data-i18n` key 在对应 i18n 分块的 zh 字典中存在
- [ ] 详情页 HTML 中所有 `data-i18n` key 在对应 i18n 分块的 en 字典中存在
- [ ] 含 HTML 标签的翻译元素使用了 `data-i18n-html`（不是 `data-i18n`）
- [ ] 主页最多 6 篇卡片，按日期倒序，reveal-d 值连续
- [ ] 列表页包含全部文章，序号连续
- [ ] `blog_list_sub` 计数 = 列表页实际卡片数
- [ ] 详情页 CSS 加载顺序正确（base → components → detail → responsive）
- [ ] 详情页包含 mobileLangBtn
- [ ] 正文不是提纲式缩写，案例过程、出处和证据限制完整
- [ ] 中英文观点直接、标题具体，已删去自我辩护和通用免责段；关键条件写在对应事实中
- [ ] 中英文译文事实对齐，标题自然，阅读时长在详情页与卡片一致
- [ ] 已运行 `node tools/update_seo.js`
- [ ] 已运行 `node tools/update_seo.js --check`
- [ ] 已运行 `node tools/check_i18n.js`
- [ ] 已运行 `node tools/build_site.js`
- [ ] 已运行 `node tools/build_site.js --check`

---

## 6.5. 同步 SEO 生成内容和发布目录

每次新增或调整文章后，都要在发布前运行：

```bash
cd /Users/ericpan/game_project/webblog
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

`tools/update_seo.js` 会根据 `blog/index.html` 的文章列表同步以下内容：

- `robots.txt`
- `sitemap.xml`
- `feed.xml`
- 文章页、项目页、首页和归档页的 SEO meta / canonical / JSON-LD
- `blog/topics/*.html` 专题归档页
- 文章底部的相关文章模块

`tools/build_site.js` 会把公开资源复制到 `_site/`，并根据页面实际加载的 i18n 字典生成中英文静态 HTML，供新版导入器读取。首次使用先以 Node 22.16+ 运行 `npm ci`。不要直接发布仓库根目录；`tools/`、`admin/`、`transfer/`、`rag-articles/`、`blog-drafts/` 和根目录 Markdown 文档都不应进入线上静态文件。

`_site/` 现仅作为内容中间产物。当前生产发布必须使用 `templates/webblog-reimagined/dist/`；旧 Git 自动生产部署已暂停，不得在发文时擅自恢复或上传旧版 `_site/`。`import-content.cjs --articles-only` 保留新版简介、经历、项目和已有媒体，只同步文章、专题、文章 SEO、来源索引、RSS 及新增媒体。不要用全量导入覆盖新版独立编辑的内容。

新版的固定输出为 `content/{en,zh,source,seo}.json`、`public/feed.xml`、构建器生成的首页、`journal/`、`zh/journal/` 以及 `dist/`。编号页随归档排序生成，检查正式 slug、双语链接、首页最新六篇、归档/专题计数和前后篇，不依赖 `article-01.html` 的编号标识文章。动态数量文案不能硬编码为上一次文章数。预览新版使用 `node templates/webblog-reimagined/tools/preview-production.cjs`，不是旧版 `npm run preview`；在桌面和移动端检查两种语言的标题、正文、公式/表格、目录、搜索和筛选。

中文稿增加生僻字或技术用字时，检查现有 Noto 字体子集是否覆盖，避免正文混入系统补字。需要扩充时沿用 `templates/webblog-reimagined/tools/subset-fonts.py` 和同版本的完整字体，并保留子集已有字符；工具需要已有的 fontTools 环境。原始字体缓存和截图仍留在项目内，位置见 `RAG_BLOG_WORKFLOW.md` 的固定目录表，不把缓存打包上线。

生产包构建不等于上线。发文任务默认仅留本地；明确要求“推送”时才提交并推送，Cloudflare 上传仍须获得上线授权。`dist/` 和发布清单/ZIP 属于忽略的构建产物，不提交。

源码文件和文章卡片链接仍使用 `.html`，供编辑器、导入工具及直接打开文件预览使用。发布时构建脚本会把指向公开 HTML 页面的链接转换为无扩展名网址，目录首页则使用尾部 `/`；canonical、sitemap、RSS 链接及 JSON-LD 使用相同规范。不要手工重命名文章文件，也不要添加把无扩展名网址跳回 `.html` 的规则。RSS 的 GUID 保留既有标识，不当作访问网址修改。

内容中间产物可用 `npm run preview` 在 `http://127.0.0.1:4173/` 检查无扩展名访问，但新版发布验收必须使用上面的 `preview-production.cjs`。完成源内容构建后运行 `npm run check`，再运行新版发布测试，确认公开页的 canonical、站内链接、sitemap、RSS 及网址兼容测试通过。

每篇文章会自动生成 `/blog/{slug}` 和 `/en/blog/{slug}` 两个独立网址，英文正文直接存在于初始 HTML。只维护原始文章和中英文字典，不手工创建英文 HTML 镜像，也不提交 `_site/`。标题、摘要、正文、引用和代码注释都要有对应翻译，且字典必须由当前页面实际加载。构建会同步两种语言的 canonical、SEO、双向 hreflang、站内链接和 sitemap；中文 RSS 的条目 ID 不变。

发布前同时检查两种语言的详情页、列表与相关推荐，运行 `npm run locales:check`；确认 EN/中 链接跳转到同一篇文章，刷新不会被旧 localStorage 偏好切回另一种语言。源码直接打开时仍保留原地切换，正式预览应使用 `npm run preview`。

不要手工维护这些生成内容；如果页面展示或 SEO 信息不对，先修正文章详情页和 `blog/index.html` 的标题、摘要、日期、分类，再重新运行脚本。

---

## 7. 提交

默认留在工作区供审阅。只有用户明确要求提交或推送时，才执行 Git 操作；新文章成功推送后，按 `RAG_BLOG_WORKFLOW.md` 提醒用户将 `rag-articles/{slug}.md` 放入实际 RAG 系统。

```bash
git add -A
git commit -m "feat: add blog post '{文章标题}'"
git push origin main
```

---

## 快速参考：现有文章前缀表

| 文章 | 前缀 | slug | 主页卡片 key |
|------|------|------|-------------|
| 上下文腐烂 | `bcrot` | `context-rot` | `blog11_title` |
| Token 经济学 | `btk` | `token-economy` | `blog10_title` |
| AI Agent | `ba` | `ai-agent-thoughts` | `blog6_title` |
| 开源三个月定律 | `bo` | `open-source-hype` | `blog7_title` |
| Transformer 检测 | `bt` | `transformer-detection` | `blog1_title` |
| Flink+Kafka | `bf` | `turborepo-trpc` | `blog2_title` |
| WebGPU | `bw` | `webgpu-dl` | `blog3_title` |
| 图像处理流水线 | `bi` | `image-pipeline` | — (不在主页) |
| SAM2 质检 | `bs` | `sam2-inspection` | — (不在主页) |
| 女权主义 | `bfem` | `feminism-thoughts` | — (不在主页) |
| 内卷与躺平 | `bchoice` | `involution-choice` | — (不在主页) |
