# Eric — Chromatic Ink

已将原站的中英文内容填入这套设计，并于 2026-10-16 发布至 [erichz.site](https://erichz.site/)。源文件改动均位于本文件夹，原主站源码未修改。

2026-11-02 隐私更新已上线：学校名称已泛化，4张项目照片的定位、时间及设备元数据已清除，联系表单改用 `https://contact.erichz.site`，收件人仍是 AgentMail。部署 `fe0853a4-9e97-4635-bcbe-dbd467a1153c` 已完成128页、16个静态文件及图片元数据的线上核验；上一版 `a6c2900b-26dd-4b78-9578-af1531f084f8` 保留作回退。其他可关联身份的内容按要求保留，见 `PRIVACY-REVIEW.md`。

## 预览

```sh
cd templates/webblog-reimagined
python3 -m http.server 4191 --bind 127.0.0.1
```

- 英文：<http://127.0.0.1:4191/>
- 中文：<http://127.0.0.1:4191/zh/>
- 桌面、平板导航中的「中文 / EN」和手机菜单内的语言链接可切换当前页面的对应版本，并保留文章章节、文章列表的专题筛选和搜索词。

也可以直接打开 `index.html` 或 `zh/index.html`。

当前本地构建每种语言均包含 1 个首页、1 个项目列表、15 个项目页、1 个文章列表、42 篇文章和 6 个专题页，共 **132 页**。最新稿《模型出错，为什么总想着重新训练？》已完成双语内容和新版构建，仍留本地待审。

上一发布版本于 2026-11-03 新增《模型装得下，为什么还是跑不快？》，130页正文、22个静态资源及双语文章入口已完成正式域名核验。当前本地构建与最近六篇的口气修订尚未发布。

## 设计与内容

原设计的 `css/ink.css` 保持不变：保留水墨流体、纸张纹理、日夜主题、文字动效、经历叠卡、技术球、项目预览和文章滚动标题。`js/ink-fluid.js` 仅加入下述参考播放器已有的音乐强度联动。

内容适配放在 `css/languages.css`：中文标题用 [Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc)，中文正文用 [Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)。英文继续使用 Instrument Serif、Inter Tight 和 JetBrains Mono。字体按当前内容做了本地子集，许可证随附，不依赖远程字体服务。中英文文字动画的遮罩增加不可见留白，并用负边距抵消，避免衬线笔画和斜体边角被切掉；字符位置、字号、间距与换行不变。增加中文内容后，如新增生僻字不在子集中，会使用系统字体回退；可重新生成子集。

中英文长标题的滚动层按完整标题块的高度移入移出，避免换行后在静止状态露出红色副本。正常状态显示黑色标题，悬停或键盘聚焦时切换为红色斜体滚动标题；保留原有字号、换行、配色和动画时长。

经历卡片超过视口可用高度时，按已确认的方案改为随页面正常滚动，保留字号和卡片外观；其余卡片继续叠放。窗口尺寸或字体加载变化后会重新判断。手机横屏菜单可以滚动，打开菜单时键盘焦点留在导航内，关闭后恢复；短屏也能访问全部菜单项和语言入口。

关闭动效或开启系统「减少动态效果」时，标题保留完整静态文字，代码立即显示全文，评价暂停自动轮播，装饰动画和过渡停止。恢复系统设置时仍保留之前手动选择的动效偏好。

项目、文章、经历、技能、评价和媒体均取自现有站点。ML-SHARP的chair、corridor、temple、street照片已移除EXIF/XMP、IPTC和注释元数据，压缩图像内容、尺寸和颜色配置保持不变。项目正文、表格、代码和说明保留完整内容。原站未注明的项目年份显示「—」，没有补造年份。开源统计沿用原站静态数值，水墨点阵是装饰动画。

图片与视频使用原文件的真实宽高预留空间，首页代码动画也预留全文高度，避免加载和打字时推动页面。项目指标复用设计现有的指标组件，技术标签只显示一组；长代码和表格在各自容器内横向滚动，长函数名可在正文列内换行。

简介保留软件工程本科毕业、人工智能硕士在读的经历，校名改为「华南地区某985」「香港前三某大学」，英文使用对应的概括表述。项目计数按当前 15 个项目更新。

联系表单复用原站现有接口。它只会在访客主动提交时发送消息，本次验证使用拦截请求检查成功、失败状态，没有发送真实留言。本地预览的跨域权限以原接口实际配置为准。

## 背景音乐

播放器从 `../未命名文件夹/webblog-reimagined/` 提取，保留原来的顶栏水墨波形、手机菜单开关、页脚开关与音量滑杆。视觉样式独立放在 `css/sound.css`，播放逻辑在 `js/ink-sound.js`，所有中英文页面和 404 页面均可使用。个人内容未从无信息模板重新生成。

- 日间：Paper Drift，`assets/audio/paper-drift.mp3`，完整时长约 122.68 秒。
- 夜间：Diffusing Ink，`assets/audio/diffusing-ink.mp3`，完整时长约 122.53 秒。

两首音乐分别由用户提供的同名 WAV 转为 48 kHz 立体声 VBR MP3，约 2.8 MB／首，未裁切。首次访问默认尝试自动播放；访客手动关闭后，下次访问保留关闭选择。日夜切换时渐变切歌，音量与开关偏好保存在本机。跨页按保存的进度恢复，整页导航有重新加载的间隙；若浏览器阻止有声自动播放，控件提示点击恢复，点击或按键后再启动，不会假报正在播放。两首曲子分别按自己的完整长度循环，不要求同长。开启减少动态效果时，音乐继续播放，波形和水墨联动静止。

HTTP(S) 优先使用 Web Audio 缓冲播放和分析；不可用或直接打开本地文件时回退到循环音频元素。恢复、播放失败和重试均依据实际播放状态更新。浏览器的手势与自动播放限制参考 [MDN Web Audio 指南](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices#autoplay_policy)。

## 更新与构建

页面内容保存在 `content/en.json` 和 `content/zh.json`，媒体在 `assets/projects/`。修改内容后执行：

```sh
python3 tools/build.py
```

构建只写入本模板内的英文页面与 `zh/` 中文页面。只需 Python 标准库，不需要启动主站构建或安装前端运行依赖。

需要从主站现有 `_site/` 重新读取内容时，在原仓库环境执行：

```sh
node tools/import-content.cjs
python3 tools/build.py
```

导入器使用原仓库已有的 `cheerio`，只读取主站、只写入本模板。`tools/layout.py` 保存原设计的页面生成组件，不是构建入口。

日常发文使用文章同步模式，避免从旧站覆盖本模板已经编辑的个人简介、经历和项目内容。在仓库根目录先完成 `NEW_BLOG_POST.md` 的源内容构建，然后运行：

```sh
node templates/webblog-reimagined/tools/import-content.cjs --articles-only
node templates/webblog-reimagined/tools/release.cjs
node --test templates/webblog-reimagined/tools/release.test.cjs
```

该模式更新双语文章、专题、文章 SEO、来源文章索引和 RSS，保留 `content/{en,zh}.json` 中的 `home`、`projects` 及已有媒体。新文章引入的媒体会补入。不要把不带参数的全量导入当作日常发文命令；它会重新导入个人和项目快照。`release.cjs` 仅在本地构建生产包，不会提交、推送或上传。

`tools/content-privacy.cjs` 在重新导入时保留学校名称的泛化，避免原站校名再次出现在个人简介、经历、教育和评价署名中。文章的引用来源不经过此替换。

`tools/image-privacy.cjs` 在重新导入这4张照片时自动移除隐私元数据，避免重新带入定位信息；若未来照片格式或方向改变，需先核对再导入。该处理不重新编码图像。

可选字体维护工具：`tools/subset-fonts.py`。需本地安装 fontTools，并传入完整的 Noto Serif SC、Noto Sans SC TTF 文件路径；普通页面构建不需要它。

## 生产发布包

生成与检查命令均在本模板目录运行，使用原仓库已安装的 `cheerio` 和 Python 3：

```sh
node tools/release.cjs
node --test tools/release.test.cjs
python3 tools/package.py
node tools/preview-production.cjs
```

生产包只写入本目录的 `dist/`，ZIP 为 `webblog-reimagined-production.zip`，校验清单为 `release-manifest.json`。发布只上传 `dist/` 的内容或该 ZIP；源码、内容快照、工具和本说明不进入公开目录。六个 CSS/JS 文件使用内容哈希，媒体与字体保留共享路径，字体许可证一并打包。

生产包沿用当前主站网址：英文首页 `/en/`，中文首页 `/zh/`，英文文章 `/en/blog/原slug`，中文文章 `/blog/原slug`，项目对应 `/en/projects/原slug` 与 `/projects/原slug`，专题同样保留原 slug。根路径继续以 302 转到英文首页。旧的 `.html`、尾斜线及本地预览的编号地址统一转到对应的正式地址，保留查询参数；首页的旧章节锚点也可继续访问。

生产页面使用自引用 canonical、完整双向 hreflang、Open Graph、Twitter 与原站结构化数据。原发布日期、修改日期、RSS 的 20 条最新订阅项目及 GUID 沿用原站；不会将此次换版日期填成文章更新时间。原站分享 SVG 保留，并附相同画面的 PNG 供分享预览使用。`sitemap.xml` 只列正式页面。全局英文 404 和中文路径下的 404 使用现有版式，返回真实 404，不把缺失地址当成首页。

4191 的设计预览继续禁止收录；4192 的生产包预览可检查正式路径。Cloudflare 的 `pages.dev` 域名通过 `_headers` 禁止收录，正式域名页面可索引。静态跳转和头部配置分别依据 [Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/) 与 [Headers](https://developers.cloudflare.com/pages/configuration/headers/)，多语言声明依据 [Google hreflang 文档](https://developers.google.com/search/docs/specialty/international/localized-versions)。本地服务器模拟这些路由用于验收，实际 CDN 行为仍需发布后检查。

首次换版时将验收后的 `dist/` 直接上传至既有 Cloudflare Pages 项目 `powerpan-github-io`，当时没有提交、推送或合并 Git。2026-11-03 已将正在使用的新版必要源码提交并推送，仍使用验收后的生产包直接发布。英文正式入口为 <https://erichz.site/en/>，中文为 <https://erichz.site/zh/>。

旧构建的 Git 自动生产部署仍暂停，防止后续推送再次发布旧设计；原主站构建命令 `node tools/build_site.js` 和输出目录 `_site` 保留，预览分支规则不变。后续内容更新需在本模板中重新构建并发布。新版源码现已纳入仓库；若以后恢复 Git 自动生产部署，还需修改构建命令与输出目录、完成验收后另行开启，本次未改变此设置。推荐的仓库根目录构建命令如下；只有构建和检查都成功才继续发布：

```sh
npm ci --include=dev && node templates/webblog-reimagined/tools/release.cjs && node --test templates/webblog-reimagined/tools/release.test.cjs
```

输出目录为 `templates/webblog-reimagined/dist`。运行时沿用仓库的 Node 22 设置，构建还需要 Python 3；当前 [Pages 构建镜像](https://developers.cloudflare.com/pages/configuration/build-image/)提供这两种运行时。该步骤不需要改页面设计，也不需要用新文件覆盖原主站源码。

默认尝试自动播放的生产部署为 `a6c2900b-26dd-4b78-9578-af1531f084f8`，可回退至手动开启音乐的 `dad8a948-dda4-4f47-90c5-3e63c94390db`；更新音乐前的 `6878733d-70f1-4059-9d3b-1880290fe930` 和首次换版前的旧站部署 `bda8c504-0feb-4267-9b72-10c954c03cff` 也保留。原配置与发布包校验值记录在本地忽略文件 `deployment-state.json`。Cloudflare 控制面已确认部署成功，正式域名完成访问验收；`pages.dev` 预览子域目前存在 TLS 握手问题，未通过该域名验收。

地铁项目页的 `mAP@0.5` 会被 CDN 的邮箱保护误识别。生产构建按 [Cloudflare 的局部排除方式](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/#prevent-cloudflare-from-obfuscating-email)加入不可见注释，保留指标文字与布局；正式域名会移除这些控制注释，不再替换指标或插入解码脚本。

联系表单沿用正式接口。已检查正式域名的跨域预检，并通过本地拦截请求核验成功、失败与防重复提交；没有发送真实留言。Safari／iOS 真机尚未验收，浏览器模拟不能代替真机结果。
