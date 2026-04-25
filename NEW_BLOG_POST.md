# 新建博客文章 — 完整流程

每次创建新博客文章时，需要按顺序完成以下步骤。

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
- 底部 `<script>` 引用：`i18n.js` → `detail.js`
- Mobile hamburger menu + `mobileLangBtn`

---

## 2. 添加 i18n 翻译到 `js/i18n.js`

在 `zh` 和 `en` 两个字典中**同时**添加以下 key：

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
- **不要删除或移除已有的卡片**

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

### 5b. `js/i18n.js` 中的计数（zh 和 en 都要改）

```js
blog_list_sub: 'All Posts — {N} articles and counting',
```

---

## 6. 验证清单

- [ ] 详情页 HTML 中所有 `data-i18n` key 在 `i18n.js` 的 zh 字典中存在
- [ ] 详情页 HTML 中所有 `data-i18n` key 在 `i18n.js` 的 en 字典中存在
- [ ] 含 HTML 标签的翻译元素使用了 `data-i18n-html`（不是 `data-i18n`）
- [ ] 主页最多 6 篇卡片，按日期倒序，reveal-d 值连续
- [ ] 列表页包含全部文章，序号连续
- [ ] `blog_list_sub` 计数 = 列表页实际卡片数
- [ ] 详情页 CSS 加载顺序正确（base → components → detail → responsive）
- [ ] 详情页包含 mobileLangBtn

---

## 7. 提交

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
