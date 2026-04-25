/* ================================================================
   i18n — Internationalization (zh-CN / en)
   ================================================================ */

const I18N = {
  zh: {
    // Nav
    nav_about: '// 关于',
    nav_projects: '// 项目',
    nav_blog: '// 博客',
    nav_contact: '// 联系',
    nav_status: 'Open to work',
    nav_lang: 'EN',

    // Hero
    hero_badge: 'Full-Stack & AI Vision Developer',
    hero_scroll: 'SCROLL',
    typing_roles: [
      '视觉模型开发者',
      '全栈工程师',
      'AI 应用研究者',
      '开源爱好者',
      '系统架构师',
    ],

    // About
    about_label: '// ABOUT ME',
    about_heading: '用代码构建智能系统，<br>以算法<span class="hl">洞察视觉世界</span>',
    about_text: '华南理工大学软件工程专业在读，专注于视觉模型开发与 AI 应用落地。从前端交互到后端服务，从模型训练到边缘部署，享受跨越技术栈全链路创造价值的过程。曾在实际项目中应用 YOLO、SAM、LLM、Stable Diffusion 等模型，热衷于将前沿 AI 技术转化为可落地的产品方案。',
    stat_projects: '完成项目',
    stat_years: '年学习',
    stat_repos: '开源仓库',
    stat_stars: 'GitHub Stars',
    terminal_cmd: 'neofetch --short',
    terminal_output_1: 'Eric — Full-Stack & AI Vision Developer',
    terminal_output_2: '📍 广州 · 华南理工大学',
    terminal_output_3: '🧠 Computer Vision · LLM · Stable Diffusion',
    terminal_output_4: '⚡ C++ / Python / Java / JavaScript',
    terminal_output_5: '🔥 Vue · PyTorch · Flink · Docker',
    terminal_output_6: '🌱 Currently: 视觉模型开发与应用',
    terminal_output_7: '📦 Tech: YOLO · SAM · LLM · NLP',
    terminal_output_8: '💬 "Code is poetry, bugs are typos"',

    // Timeline
    timeline_label: '// EXPERIENCE',
    timeline_title: '成长<span class="outline">历程</span>',
    timeline_subtitle: '从课堂到实战，持续进化中',
    tl1_year: '2026 — 至今',
    tl1_role: '视觉模型开发实习生',
    tl1_company: '@ 本地某龙头科技公司',
    tl1_desc: '参与视觉检测模型的研发与落地，基于 YOLO、SAM 等模型进行工业视觉场景的算法设计与优化，验证并落地项目模型的工程化部署，推动视觉模型在实际项目生产场景中的应用。',
    tl2_year: '2025 — 2026',
    tl2_role: '全栈开发实训',
    tl2_company: '@ 华南理工大学某实验室',
    tl2_desc: '负责 Web 应用的前后端开发，使用 Vue + Spring Boot 技术栈完成多个业务模块的开发与迭代，参与系统架构优化和 API 设计。',
    tl3_year: '2024 — 2025',
    tl3_role: '大数据与后端学习',
    tl3_company: '@ 华南理工大学',
    tl3_desc: '系统学习大数据技术栈（Flink、Kafka）和后端开发（Java、Python），完成多个课程项目，深入理解分布式系统与数据处理架构。',
    tl4_year: '2022 — 2024',
    tl4_role: '编程入门 · 软件工程',
    tl4_company: '@ 华南理工大学',
    tl4_desc: '进入软件工程专业学习，掌握 C++、数据结构与算法基础，开始接触 Web 开发和 AI 领域，奠定了扎实的计算机科学基础。',

    // Tech
    tech_label: '// TECH STACK',
    tech_title: '技术<span class="outline">栈</span>',
    tech_subtitle: '从 AI 模型到全栈应用 —— 多领域技术能力',

    // Skills
    skills_label: '// SKILLS',
    skills_title: '技能<span class="outline">矩阵</span>',
    skills_subtitle: '持续学习，持续精进',
    skill_cat_frontend: '前端',
    skill_cat_backend: '后端',
    skill_cat_ai: 'AI / ML',
    skill_cat_bigdata: '大数据 / DevOps',
    skill_wxapp: '微信小程序 (WXML/WXSS)',
    code_c1: '# 1. 初始化权重 — 我们生来就带着某些天赋（随机初始化）',
    code_c2: '# 输出 10 个类别的概率分布',
    code_c3: '# 2. 前向传播 — 用现有知识理解世界',
    code_c4: '# 3. 计算损失 — 认识到自己的不足',
    code_c5: '# 与真实标签对比',
    code_c6: '# 4. 反向传播 — 从错误中学习，计算每个权重的梯度',
    code_c7: '# 5. 更新权重 — 成长和改变，沿梯度方向微调参数',
    code_c8: '# 清空梯度，准备下一轮',
    code_c9: '# 最终，我们不是要完美复制过去，而是要学会泛化到未来',

    // --- metro-gate ---
    metro_p1: '地铁闸机翻越（或钻越）是城市轨道交通中最常见的违规行为之一，不仅造成票务损失，更存在严重的人身安全隐患。传统方案依赖人工监控，效率低、漏检率高。本项目基于 <strong>YOLOv5</strong> 目标检测模型，训练了一个专门识别闸机翻越行为的检测器，并将其部署到 <strong>Rockchip RK3588</strong> 边缘设备上，实现了从视频流输入到违规告警输出的全链路实时推理。',
    metro_p2: '地铁闸机场景的视觉检测面临多重挑战：',
    metro_p3: '基于 YOLOv5s 架构进行定制化改造。首先对 Backbone 进行轻量化，将 C3 模块中的标准卷积替换为 <strong>深度可分离卷积</strong>（Depthwise Separable Conv），在保持特征提取能力的同时将参数量从 7.2M 降低到 4.1M。',
    metro_p4: '数据集方面，我们从地铁站监控视频中采集了 <strong>8,000+ 帧</strong>图像，标注了三类目标：<code>normal_pass</code>（正常通行）、<code>climb_over</code>（翻越闸机）和 <code>crawl_under</code>（钻越闸机）。采用 Mosaic + MixUp + 随机裁剪增强策略，并针对翻越动作的时序特性，引入了相邻帧的光流特征作为辅助输入。',
    metro_p5: '<strong>Rockchip RK3588</strong> 是目前国产边缘 AI 芯片中性能最强的 SoC 之一，集成了四核 Cortex-A76 + 四核 Cortex-A55 CPU、Mali-G610 GPU 以及独立的 <strong>6 TOPS NPU</strong>（Neural Processing Unit）。其 NPU 支持 INT8/INT16/FP16 混合精度推理，特别适合部署量化后的 YOLO 系列模型。',
    metro_p6: '我们选用的开发板配备了 <strong>8GB LPDDR5</strong> 内存和独立的 NPU 加速单元。相比 GPU 方案（如 Jetson Orin Nano），RK3588 的优势在于更低的功耗（典型 5-8W vs 15W）和更高的性价比，非常适合地铁站这种需要大规模部署的场景。NPU 的 6 TOPS 算力对于 YOLOv5s 级别的模型绰绰有余，实测推理速度可达 <strong>60+ FPS</strong>。',
    metro_p7: '从 PyTorch 模型到 RK3588 NPU 部署，需要经过以下关键步骤：',
    metro_p8: '在 RK3588 上部署时，我们进行了多维度的推理优化：',
    metro_p9: '系统在 RK3588 上实现了 62 FPS 的推理速度，端到端延迟（含预处理和后处理）低于 20ms，完全满足地铁站实时监控的需求。INT8 量化后模型仅 <strong>3.8MB</strong>，在 6W 功耗下即可稳定运行，适合大规模部署到各站点的闸机通道。',
    metro_f1: '<strong>遮挡严重</strong> — 闸机通道狭窄，人体经常被闸机挡板、其他乘客遮挡，需要模型具备较强的遮挡推理能力',
    metro_f2: '<strong>动作多样</strong> — 翻越动作包括跨栏式翻越、撑手翻越、钻越等多种形态，且持续时间短（通常 1-3 秒），对检测的实时性要求高',
    metro_f3: '<strong>光照复杂</strong> — 地下站台光照条件多变，存在逆光、侧光、荧光灯频闪等问题',
    metro_f4: '<strong>边缘部署</strong> — 需要在功耗受限的嵌入式设备上运行，模型必须足够轻量',
    metro_f5: '<strong>Step 1: 导出 ONNX</strong> — 将 PyTorch 模型导出为 ONNX 格式，固定输入尺寸为 640×640',
    metro_f6: '<strong>Step 2: RKNN 转换</strong> — 使用 Rockchip 提供的 <code>rknn-toolkit2</code> 将 ONNX 模型转换为 RKNN 格式，进行 INT8 量化（校准集 500 张）',
    metro_f7: '<strong>Step 3: NPU 部署</strong> — 在 RK3588 上使用 <code>rknn-lite2</code> 运行时加载 RKNN 模型，通过 NPU 加速推理',
    metro_f8: '<strong>Step 4: 视频流对接</strong> — 使用 OpenCV 采集 RTSP 视频流，逐帧送入模型推理，结果通过 WebSocket 推送至告警系统',
    metro_f9: '<strong>INT8 量化</strong> — 使用 rknn-toolkit2 的量化功能，将 FP32 模型量化为 INT8，模型体积缩小 4 倍，推理速度提升 2.5 倍，mAP 仅下降 1.2%',
    metro_f10: '<strong>多核 NPU 并行</strong> — RK3588 的 NPU 支持 3 核并行推理，通过设置 <code>core_mask=RKNN.NPU_CORE_0_1_2</code> 充分利用算力',
    metro_f11: '<strong>零拷贝优化</strong> — 使用 DMA buffer 实现视频帧到 NPU 的零拷贝传输，减少内存拷贝开销',
    metro_f12: '<strong>异步流水线</strong> — 视频采集、预处理、推理、后处理四个阶段采用异步流水线，最大化吞吐量',

    // --- yolo26-multimodal ---
    yolo26_p1: '在实际视觉检测场景中，我们往往需要同时获取目标的<strong>位置</strong>（检测框）、<strong>形态</strong>（关键点）和<strong>轮廓</strong>（分割掩码）。传统方案通常需要为每种任务单独训练一个模型，再通过多模型级联或集成的方式组合输出——这不仅增加了系统复杂度，也带来了不可忽视的推理延迟。',
    yolo26_p2: 'YOLO26 Multimodal 项目的核心思路是：利用 YOLO26 的<strong>可复用 Backbone 和 Neck</strong> 提取统一的多尺度特征，然后设计三个独立的 Detection Head、Keypoint Head 和 Segmentation Head，分别指向各自的损失函数和输出格式。整个系统在<strong>单次前向推理</strong>中同时输出三类结果，实现了「一次计算，多重感知」。',
    yolo26_p3: '整体架构遵循 YOLO 系列的 One-Stage 设计哲学，但在 Head 层做了关键创新。传统 YOLO 的 Head 通常只负责单一的检测任务（bounding box + class），而我们将 Head 拆分为三个功能独立的分支，每个分支有自己的输出通道数、激活函数和损失计算逻辑。',
    yolo26_p4: '这种设计的最大优势在于<strong>特征复用</strong>——Backbone 和 Neck 提取的特征被三个 Head 共享，避免了重复计算。同时，每个 Head 可以独立训练和微调，互不干扰。当只需要其中某一类输出时，可以单独关闭其他 Head，实现灵活的功能裁剪。',
    yolo26_p5: 'YOLO26 的 Backbone 基于 CSP（Cross Stage Partial）架构，采用 CBS（Conv + BN + SiLU）模块作为基础构建单元，通过 C2f 模块实现跨阶段的特征融合。Neck 部分使用 PAN-FPN（Path Aggregation Network + Feature Pyramid Network）结构，实现自顶向下和自底向上的双向特征聚合。',
    yolo26_p6: '关键设计：我们在 Neck 的输出端增加了<strong>通道分离机制</strong>（Channel Split），将融合后的特征图按通道维度拆分为三组，分别送入 Detection Head、Keypoint Head 和 Segmentation Head。这种轻量级的分离方式比直接复制特征图更高效，参数量仅增加 0.3%，但能有效减少不同任务之间的梯度冲突。',
    yolo26_p7: '三个 Head 各自拥有独立的损失函数，总损失为加权和：',
    yolo26_p8: '其中 <strong>L_det</strong> 包括 CIoU 定位损失、分类 BCE 损失和 objectness BCE 损失；<strong>L_kpt</strong> 使用关键点热力图的 MSE 损失加上可见性分类损失；<strong>L_seg</strong> 采用 Dice Loss + BCE Loss 的组合，对前景/背景不平衡更鲁棒。',
    yolo26_p9: '权重系数通过实验调优确定：λ₁=1.0, λ₂=0.5, λ₃=0.8。我们还引入了<strong>动态权重调整</strong>策略——在训练初期增大 L_det 的权重让模型先学会定位，中后期逐步提升 L_kpt 和 L_seg 的权重让模型精细化形态输出。',
    yolo26_p10: '数据集方面，我们收集并标注了约 <strong>12,000 张</strong>多任务标注图像，每张图像同时包含检测框、关键点坐标和分割掩码三类标注。数据增强采用 Mosaic + MixUp + Random HSV + 水平翻转的组合策略，并针对关键点任务做了特殊的几何变换（确保关键点坐标同步变换）。',
    yolo26_p11: '训练采用 AdamW 优化器，初始学习率 1e-3，余弦退火调度。Batch size 为 32（4×8 GPU），总训练 epoch 为 300。前 50 epoch 使用 Warmup + 冻结 Backbone 策略，仅训练 Neck 和三个 Head，加速收敛并避免早期的梯度震荡。',
    yolo26_p12: '多头推理的前向传播流程',
    yolo26_p13: '与三模型级联方案相比，多头架构在检测 mAP 仅下降 0.8 的情况下，推理速度提升了 <strong>2.3 倍</strong>（18ms vs 42ms），参数量减少了 <strong>37%</strong>。这证明了特征共享 + 通道分离策略的有效性——在多任务学习中，共享特征提取器不仅能减少计算量，还能通过任务间的正则化效应提升泛化能力。',
    yolo26_f1: '负责目标检测任务，输出 bounding box 坐标 (x, y, w, h)、objectness score 和类别概率。采用 Decoupled Head 设计，分类和回归分支独立，使用 CIoU Loss 作为定位损失。Anchor-free 模式，直接回归中心点偏移和宽高，支持 NMS 后处理。',
    yolo26_f2: '负责关键点检测任务，输出预定义的 K 个关键点坐标及其可见性标签。采用 Heatmap-based 方案，每个关键点生成 H×W 的高斯热力图，使用 MSE Loss 训练。支持可变关键点数量（如人体 17 点、面部 68 点、手部 21 点），通过配置文件灵活定义。',
    yolo26_f3: '负责实例分割任务，为每个检测到的目标生成像素级掩码。采用 Mask Prototype + Coefficients 方案（类似 YOLACT），轻量级掩码解码器仅需 1ms。输出 128×128 的掩码原型，通过检测头的系数向量线性组合生成最终掩码，兼顾精度与速度。',

    // --- neural-vision ---
    nv_p1: 'NeuralVision Pro 是一个面向<strong>工业质检场景</strong>的视觉检测系统，基于 YOLOv8 实现高速目标检测，结合 SAM（Segment Anything Model）实现像素级缺陷分割。系统支持多种工业场景的缺陷识别，包括表面划痕、异物混入、尺寸偏差等常见质检问题。',
    nv_p2: '通过 YOLO 的快速检测与 SAM 的精准分割级联推理，系统在保证检测精度的同时实现了<strong>亚 20ms</strong> 的端到端推理延迟。项目采用 Python + PyTorch 技术栈，后端服务基于 Flask 构建，数据存储使用 MySQL，支持 Docker 容器化部署，已成功应用于多个实际质检场景的验证测试。',
    nv_p3: '从模型训练到服务部署，端到端技术选型',
    nv_p4: 'YOLO 检测 + SAM 分割的级联推理管道',
    nv_f1: '基于 YOLOv8 的实时目标检测，单帧推理延迟低至 15ms，满足产线实时检测需求',
    nv_f2: '利用 SAM 对检测区域进行像素级分割，精确标注缺陷边界，支持自动与 Prompt 两种分割模式',
    nv_f3: '支持表面划痕、异物混入、尺寸偏差等多种工业质检场景，可通过配置文件快速切换检测策略',
    nv_f4: '完整 Docker 部署方案，支持单机与集群部署，一键启动推理服务，方便在不同产线环境快速落地',

    // --- dataflow ---
    df_p1: 'DataFlow Pipeline 是一个基于 <strong>Apache Flink + Kafka</strong> 的实时数据处理流水线平台。用户可以通过 Vue 前端界面配置数据处理任务，系统将任务编排为 DAG 图形，由 Flink 引擎执行流式计算，Kafka 作为消息中间件实现数据的高效流转。',
    df_p2: '平台支持多种数据源接入（MySQL、Redis、Kafka Topic），内置常用的数据清洗、聚合、窗口计算等算子。后端采用 Java 开发，提供 RESTful API 供前端调用，配合 Redis 缓存实现任务状态的实时查询。项目作为大数据课程的核心实践，成功处理了<strong>日均百万级</strong>的模拟数据流。',
    df_p3: '流式计算 + 可视化监控的全栈大数据方案',
    df_p4: '核心 Flink 作业定义，实现 Kafka 数据流的实时处理',
    df_f1: '基于 Flink 的高性能流处理引擎，支持窗口计算、状态管理、Exactly-Once 语义保证',
    df_f2: 'Vue 前端实时展示任务运行状态、吞吐量、延迟等关键指标，支持任务的启停与配置管理',
    df_f3: '基于 Flink Checkpoint 机制实现任务故障自动恢复，配合 Kafka 的持久化消息保证数据不丢失',
    df_f4: '内置聚合、过滤、Join、窗口等多种数据处理算子，支持自定义 UDF 扩展处理逻辑',

    // --- pixelmind ---
    pm_p1: 'PixelMind SDK 是一个为边缘设备和资源受限环境设计的<strong>视觉模型推理引擎</strong>。支持 PyTorch 和 ONNX 两种推理后端，通过 Docker 容器化部署，可以快速将训练好的视觉模型部署到各类硬件平台上。',
    pm_p2: 'SDK 提供统一的 Python API，内置模型格式转换工具（PyTorch → ONNX），支持 YOLO、SAM 等主流视觉模型的推理加速。配合 Flask/FastAPI 可快速搭建推理服务，单帧推理延迟低至 <strong>8ms</strong>。',
    pm_f1: '统一 Python API，支持 PyTorch 和 ONNX Runtime 两种推理后端，根据硬件自动选择最优方案。',
    pm_f2: '内置 Dockerfile 和 docker-compose 配置，一键构建推理服务镜像，支持 GPU 和 CPU 两种运行模式。',
    pm_f3: '三行代码即可完成模型加载、推理、结果解析。提供 RESTful API 接口，方便前后端集成。',
    pm_f4: '内置 PyTorch → ONNX 转换工具，支持 YOLO、SAM 等主流视觉模型的格式转换与验证。',

    // --- stackforge ---
    sf_p1: '每个新项目都要重新搭建脚手架——选择框架、配置 ESLint、设置 CI/CD、编写 Dockerfile、配置环境变量……这些重复劳动消耗了大量宝贵时间。',
    sf_p2: '<strong>StackForge CLI</strong> 将这些最佳实践封装成可组合的模板，一条命令即可生成生产级项目骨架。支持 <strong>Vue + PHP/Python</strong> 技术栈，自动生成前端项目结构、后端 API 模板、Docker 配置和 CI/CD 流水线。',
    sf_p3: '内置 20+ 种项目模板，覆盖 Vue + Flask、Vue + Spring Boot、Vue + PHP Laravel 等主流开发场景。核心引擎用 Python 编写，模板系统基于 YAML 配置，保持灵活性和可扩展性。',
    sf_p4: 'StackForge 采用 Python 核心 + Shell 辅助的轻量架构，模板系统基于 YAML 配置，支持自定义模板扩展。',
    sf_p5: '只需一条命令，即可初始化一个 Vue + PHP 全栈项目。StackForge 会交互式引导你选择技术栈，并自动生成所有配置文件。',
    sf_f1: '内置 Vue 2/3 项目模板，自动生成组件结构、路由配置、状态管理、TypeScript 支持等，开箱即用。',
    sf_f2: '支持 PHP Laravel、Python Flask/FastAPI、Java Spring Boot 等后端模板，自动生成 RESTful API 骨架和数据库模型。',
    sf_f3: '自动生成 Dockerfile 和 docker-compose.yml，支持开发环境和生产环境两套配置，内置健康检查和资源限制。',
    sf_f4: '内置 GitHub Actions 和 GitLab CI 模板，自动生成测试、构建、部署流水线，支持多环境配置。',

    // Listing pages
    blog_back: '← 返回首页',
    blog_list_title: '// 全部文章',
    blog_list_sub: 'All Posts — 7 articles and counting',
    proj_back: '← 返回首页',
    proj_list_title: '// 全部项目',
    proj_list_sub: 'All Projects — 6 projects and counting',
    blog_card1_title: 'AI Agent：重塑工作流的变革者，还是新一轮泡沫？',
    blog_card1_desc: '从个人开发者到企业级应用，AI Agent 正在改变我们的工作方式。但热潮之下，哪些是真实的变革，哪些又是过度的期待？',
    blog_card2_title: '开源项目的「三个月定律」：从爆火到无人问津',
    blog_card2_desc: '为什么很多开源项目发布时万人空巷，几个月后却悄无声息？从 OpenClaw 等现象级项目谈起，分析开源社区的热度周期。',
    blog_card3_title: '从 DETR 到 YOLOv8：Transformer 在目标检测中的演进',
    blog_card3_desc: '深入解析 Transformer 架构如何革新目标检测范式，从 DETR 的端到端检测到 YOLOv8 的实时优化，覆盖注意力机制、训练策略与工程部署实践。',
    blog_card4_title: '实时数据流架构：Flink + Kafka 构建毫秒级计算管道',
    blog_card4_desc: '从零搭建一套 Flink + Kafka 的实时流式计算系统，覆盖 Exactly-Once 语义、窗口聚合、状态管理与生产级容错设计。',
    blog_card5_title: 'WebGPU 浏览器端深度学习：从 WebNN 到实时推理',
    blog_card5_desc: '探索 WebGPU 在浏览器端运行深度学习模型的可能性，从 API 设计到 Shader 优化，实现浏览器内的实时推理引擎。',
    blog_card6_title: '图像处理流水线设计：从像素到决策的全链路优化',
    blog_card6_desc: '设计一套高性能图像处理流水线，覆盖预处理、增强、推理、后处理全链路，实现工业级视觉检测系统的端到端优化。',
    blog_card7_title: 'SAM2 工业质检实战：交互式分割在缺陷检测中的应用',
    blog_card7_desc: '将 SAM2 引入工业质检场景，实现交互式缺陷分割与标注，结合 YOLO 检测器构建半自动标注流水线。',
    proj_card1_desc: '基于 YOLO26 的多模态视觉检测系统，单模型同时输出检测、关键点、分割三类结果，可复用 backbone 与 neck 的多头架构设计。',
    proj_card2_desc: '基于 YOLOv5 的地铁闸机翻越检测系统，部署至 RK3588 边缘设备，RKNN 推理加速，实时识别违规行为。',
    proj_card3_desc: '基于 YOLO 与 SAM 的实时目标检测与分割系统，面向工业质检场景，支持多类缺陷的自动识别与像素级分割。',
    proj_card4_desc: '基于 Flink + Kafka 的实时流式计算引擎，支持 Exactly-Once 语义与毫秒级窗口聚合，面向大数据场景。',
    proj_card5_desc: '轻量级视觉模型推理引擎，支持模型量化与剪枝优化，面向边缘设备部署场景。',
    proj_card6_desc: '基于 Vue + PHP 的全栈脚手架工具，一键生成前后端项目模板，集成权限管理与数据可视化。',

    // Projects
    projects_label: '// PROJECTS',
    projects_title: '精选<span class="outline">项目</span>',
    projects_count: '04 / 精选项目',
    proj1_tag: 'AI Vision · YOLO · SAM',
    proj1_title: 'NeuralVision Pro',
    proj1_desc: '基于 YOLO 与 SAM 的实时目标检测与分割系统，支持多场景视觉推理与工业质检应用',
    proj2_tag: 'Big Data · Flink · Kafka',
    proj2_title: 'DataFlow Pipeline',
    proj2_desc: '基于 Flink 与 Kafka 的实时数据处理流水线，支持百万级 TPS 流式计算与可视化编排',
    proj3_tag: 'AI SDK · Edge · Model Deploy',
    proj3_title: 'PixelMind SDK',
    proj3_desc: '面向边缘设备的轻量级视觉模型推理引擎，支持 PyTorch / ONNX 多后端与 Docker 容器化部署',
    proj4_tag: 'DevTools · PHP · Vue',
    proj4_title: 'StackForge CLI',
    proj4_desc: '全栈项目脚手架工具，一键生成 Vue 前端 + 后端 API + CI/CD 配置，提升团队开发效率',
    proj5_tag: 'AI Vision · YOLO26 · Multi-head',
    proj5_title: 'YOLO26 Multimodal',
    proj5_desc: '基于 YOLO26 的多模态视觉检测系统，单模型同时输出检测、关键点、分割三类结果',
    proj6_tag: 'Edge AI · YOLOv5 · RK3588',
    proj6_title: 'Metro Gate Detection',
    proj6_desc: '基于 YOLOv5 的地铁闸机翻越检测，部署至 RK3588 边缘设备实时推理',

    // Featured Code
    code_label: '// FEATURED CODE',
    code_heading: '好的代码，是写给机器的<span class="hl">诗</span>',
    code_text: '训练一个神经网络，就像人类学习的过程——从无知到感知，从犯错到成长。每一次反向传播，都是一次自我认知的迭代。',

    // Blog
    blog_label: '// BLOG',
    blog_title: '最新<span class="outline">文章</span>',
    blog_viewall: '查看全部 →',
    blog1_title: '从 DETR 到 YOLOv8：Transformer 在目标检测中的演进与工程实践',
    blog2_title: '实时数据处理架构设计：Flink + Kafka 的流式计算最佳实践',
    blog3_title: 'WebGPU 入门：在浏览器中运行深度学习推理的性能优化指南',
    blog4_title: '设计可扩展的图像处理流水线：从 Python 脚本到 Kubernetes 集群',
    blog5_title: 'SAM 2 在工业质检中的落地实践：从 Prompt Engineering 到产线部署',
    blog6_title: 'AI Agent：重塑工作流的变革者，还是新一轮泡沫？',
    blog7_title: '开源项目的「三个月定律」：从爆火到无人问津',

    // GitHub
    github_label: '// GITHUB',
    github_title: '开源<span class="outline">活动</span>',
    github_subtitle: '代码是最好的简历',
    gh_contributions: 'Contributions',
    gh_repos: 'Repositories',
    gh_stars: 'Stars',
    gh_prs: 'PRs Merged',
    gh_less: 'Less',
    gh_more: 'More',

    // Testimonials
    testimonials_label: '// TESTIMONIALS',
    testimonials_title: '他人<span class="outline">评价</span>',
    testimonials_subtitle: '来自合作伙伴和同学的真实评价',
    test1_text: 'Eric 是我见过最有工程直觉的同学之一。他不仅能快速理解复杂的技术问题，还能给出优雅且高效的解决方案，在视觉检测项目中的表现尤为突出。',
    test2_text: '和 Eric 一起做课程项目是一段很棒的经历。他对实用技术的执着以及把知识落到实处的态度让我们整个小组都受益匪浅，尤其是在大数据课程相关技术的实践上。',
    test3_text: 'Eric 的全栈能力令人印象深刻，从前端 Vue 到后端 Python/Java，再到 AI 模型训练，他都能游刃有余地驾驭。强烈推荐！',
    test1_role: '带队导师 @ AI 科技公司',
    test2_role: '项目组长 @ 华南理工大学',
    test3_role: '实习同事 @ 互联网公司',

    // Next Chapter
    next_label: '// 下一站',
    next_title: 'System <span class="outline">Upgrade</span>',
    next_subtitle: '已获 HKUST Offer — Fall 2026 入学',
    next_badge_current: '已完成',
    next_badge_future: 'OFFER 已拿',
    next_current_title: '华南理工大学',
    next_current_sub: '软件工程 · 本科',
    next_current_desc: '全栈开发 & AI 视觉模型应用',
    next_future_title: 'HKUST',
    next_future_sub: '人工智能 · 硕士',
    next_future_desc: 'Fall 2026 · 深度学习 & AI 研究',
    next_progress_label: '系统升级进度',
    next_m1: '✓ 本科在读',
    next_m2: '✓ 项目实战',
    next_m3: '✓ 已获 Offer',
    next_m4: '◉ Fall 2026 入学',
    next_stat_year: '入学年份',
    next_stat_school: '录取院校',
    next_stat_field: '研究方向',

    // Contact
    contact_heading: '有想法？<br>让我们一起<span class="hl">实现它</span>',
    contact_subtitle: '无论是项目合作还是技术交流，随时欢迎联系',
    contact_name: '你的名字',
    contact_email: '你的邮箱',
    contact_subject: '主题',
    contact_message: '想聊些什么？',
    contact_submit: '发送消息 →',

    // Footer
    footer_copy: '&copy; 2026 Eric. Built with kk\'s <span class="heart">♥</span> love and too much coffee.',

    // Command Palette
    cmdk_placeholder: '输入命令或搜索...',
    cmdk_toggle_theme: '切换主题',
    cmdk_goto_about: '关于我',
    cmdk_goto_projects: '查看项目',
    cmdk_goto_blog: '阅读博客',
    cmdk_goto_contact: '联系我',
    cmdk_toggle_lang: 'Switch to English',
    cmdk_github: '打开 GitHub',
    cmdk_copy_email: '复制邮箱',
    cmdk_back_top: '回到顶部',
    cmdk_view_source: '查看源码',
    cmdk_toggle_cursor: '切换光标样式',
    cmdk_toggle_particles: '切换粒子效果',
    cmdk_toggle_sound: '切换音效',
    cmdk_group_nav: '导航',
    cmdk_group_action: '操作',
    cmdk_group_social: '社交',

    // Back to top
    back_to_top: '回到顶部',

    // Detail: Metro Gate
    metro_title: 'Metro <span class="hl">Gate</span> Detection',
    metro_s1: '地铁安全的 AI 守门人',
    metro_s2: '场景挑战',
    metro_s3: '模型设计',
    metro_s4: 'RK3588 硬件平台',
    metro_s5: '部署流程',
    metro_s6: '推理优化',
    metro_s7: 'RKNN 推理代码',
    metro_s8: '部署效果',

    // Detail: YOLO26 Multimodal
    yolo26_title: 'YOLO26 <span class="hl">Multimodal</span>',
    yolo26_s1: '一个模型，三重感知',
    yolo26_s2: '多头架构设计',
    yolo26_s3: '三头设计详解',
    yolo26_s4: '多任务损失函数设计',
    yolo26_s5: '训练策略',
    yolo26_s6: '核心推理代码',
    yolo26_s7: '实验结果',

    // Detail: NeuralVision Pro
    nv_title: 'Neural<span class="hl">Vision</span> Pro',
    nv_s1: 'YOLO + SAM 驱动的工业质检系统',
    nv_s2: '技术架构',
    nv_s3: '核心能力',
    nv_s4: '性能指标',
    nv_s5: '核心推理流程',

    // Detail: DataFlow Pipeline
    df_title: 'Data<span class="hl">Flow</span> Pipeline',
    df_s1: '实时流式数据处理平台',
    df_s2: '技术架构',
    df_s3: '核心能力',
    df_s4: '性能指标',
    df_s5: 'Flink 流处理作业',

    // Detail: PixelMind SDK
    pm_title: 'PixelMind <span class="hl">SDK</span>',
    pm_s1: '轻量级视觉推理引擎',
    pm_s2: '技术选型',
    pm_s3: '核心能力',
    pm_s4: '性能指标',
    pm_s5: 'Python 推理示例',

    // Detail: StackForge CLI
    sf_title: 'Stack<span class="hl">Forge</span> CLI',
    sf_s1: '为什么需要 StackForge？',
    sf_s2: '核心技术',
    sf_s3: '设计哲学',
    sf_s4: '影响力',
    sf_s5: '快速上手',

    // Detail Blog: AI Agent
    ba_title: 'AI Agent：重塑工作流的变革者，还是新一轮泡沫？',
    ba_s1: '引言',
    ba_s2: '什么是 AI Agent？',
    ba_s3: '对个人开发者的影响',
    ba_s4: '对企业的机遇与挑战',
    ba_s5: '未来展望',

    // Detail Blog: Open Source Hype
    bo_title: '开源项目的「三个月定律」：从爆火到无人问津',
    bo_s1: '引言',
    bo_s2: '「三个月定律」的典型轨迹',
    bo_s3: 'OpenClaw 现象分析',
    bo_s4: '社区心理与从众效应',
    bo_s5: '我们应该学到什么？',
    bo_s6: '结语',

    // Detail Blog: Transformer Detection
    bt_title: '从 DETR 到 YOLOv8：Transformer 在目标检测中的演进与工程实践',
    bt_s1: '引言',
    bt_s2: 'DETR 架构解析',
    bt_s3: '注意力机制的工程优化',
    bt_s4: '模型优化：TensorRT 与 ONNX',
    bt_s5: 'PyTorch 推理代码',
    bt_s6: '基准测试结果',
    bt_s7: '工程部署实践',
    bt_s8: '总结与展望',

    // Detail Blog: Flink + Kafka
    bf_title: '实时数据处理架构设计：Flink + Kafka 的流式计算最佳实践',
    bf_s1: '为什么要用流式计算',
    bf_s2: '整体架构设计',
    bf_s3: 'Kafka Topic 设计与配置',
    bf_s4: 'Flink 核心概念',
    bf_s5: 'Flink 实时聚合示例',
    bf_s6: 'Exactly-Once 语义实现',
    bf_s7: '状态管理与优化',
    bf_s8: '性能调优实践',
    bf_s9: '总结',

    // Detail Blog: WebGPU
    bw_title: 'WebGPU 入门：在浏览器中运行深度学习推理的性能优化指南',
    bw_s1: '概述',
    bw_s2: 'WebGPU 核心概念',
    bw_s3: 'Compute Pipeline 搭建',
    bw_s4: 'WGSL 着色器编程',
    bw_s5: '在浏览器中运行 ONNX 模型',
    bw_s6: 'GPU 内存管理策略',
    bw_s7: '性能基准测试',
    bw_s8: '实战建议与最佳实践',

    // Detail Blog: Image Pipeline
    bi_title: '设计可扩展的图像处理流水线：从 Python 脚本到 Kubernetes 集群',
    bi_s1: '架构概述',
    bi_s2: '流水线阶段设计',
    bi_s3: 'Kafka 流式架构',
    bi_s4: 'Worker 并发模型',
    bi_s5: 'Kubernetes 部署配置',
    bi_s6: '监控与可观测性',
    bi_s7: '扩展策略',
    bi_s8: '总结与经验',

    // Detail Blog: SAM2 Inspection
    bs_title: 'SAM 2 在工业质检中的落地实践：从 Prompt Engineering 到产线部署',
    bs_s1: '引言',
    bs_s2: 'SAM 2 架构解析',
    bs_s3: 'Prompt Engineering 策略',
    bs_s4: '缺陷检测工作流',
    bs_s5: 'Python 推理代码',
    bs_s6: '领域微调策略',
    bs_s7: '边缘设备部署优化',
    bs_s8: '实际产线效果',
    bs_s9: '总结与展望',
  },

  en: {
    // Nav
    nav_about: '// About',
    nav_projects: '// Projects',
    nav_blog: '// Blog',
    nav_contact: '// Contact',
    nav_status: 'Open to work',
    nav_lang: '中',

    // Hero
    hero_badge: 'Full-Stack & AI Vision Developer',
    hero_scroll: 'SCROLL',
    typing_roles: [
      'Vision Model Developer',
      'Full-Stack Engineer',
      'AI Application Researcher',
      'Open Source Enthusiast',
      'System Architect',
    ],

    // About
    about_label: '// ABOUT ME',
    about_heading: 'Building intelligent systems<br>with code, <span class="hl">decoding the visual world</span>',
    about_text: 'Studying Software Engineering at South China University of Technology. Focused on vision model development and AI application. From frontend interfaces to backend services, from model training to edge deployment — I thrive on creating value across the entire tech stack. Experienced with YOLO, SAM, LLM, and Stable Diffusion in real-world projects.',
    stat_projects: 'Projects',
    stat_years: 'Years Study',
    stat_repos: 'OSS Repos',
    stat_stars: 'GitHub Stars',
    terminal_cmd: 'neofetch --short',
    terminal_output_1: 'Eric — Full-Stack & AI Vision Developer',
    terminal_output_2: '📍 Guangzhou · SCUT',
    terminal_output_3: '🧠 Computer Vision · LLM · Stable Diffusion',
    terminal_output_4: '⚡ C++ / Python / Java / JavaScript',
    terminal_output_5: '🔥 Vue · PyTorch · Flink · Docker',
    terminal_output_6: '🌱 Currently: Vision Model Dev & Applications',
    terminal_output_7: '📦 Tech: YOLO · SAM · LLM · NLP',
    terminal_output_8: '💬 "Code is poetry, bugs are typos"',

    // Timeline
    timeline_label: '// EXPERIENCE',
    timeline_title: 'My <span class="outline">Journey</span>',
    timeline_subtitle: 'From classroom to practice, constantly evolving',
    tl1_year: '2026 — Present',
    tl1_role: 'Vision Model Dev Intern',
    tl1_company: '@ Leading local tech company',
    tl1_desc: 'Participated in R&D and delivery of visual detection models, designing and optimizing algorithms with YOLO, SAM, and similar models for industrial vision; validated and shipped engineering deployments of project models, driving visual models into real project production settings.',
    tl2_year: '2025 — 2026',
    tl2_role: 'Full-Stack Development Training',
    tl2_company: '@ SCUT Research Lab',
    tl2_desc: 'Responsible for full-stack web development using Vue + Spring Boot, completing multiple business modules and participating in system architecture optimization and API design.',
    tl3_year: '2024 — 2025',
    tl3_role: 'Big Data & Backend Learning',
    tl3_company: '@ South China University of Technology',
    tl3_desc: 'Systematically studied big data stack (Flink, Kafka) and backend development (Java, Python), completed multiple course projects, gained deep understanding of distributed systems.',
    tl4_year: '2022 — 2024',
    tl4_role: 'Programming Foundations · SE',
    tl4_company: '@ South China University of Technology',
    tl4_desc: 'Entered Software Engineering program, mastered C++ and data structures & algorithms, started exploring Web development and AI, building a solid CS foundation.',

    // Tech
    tech_label: '// TECH STACK',
    tech_title: 'Tech <span class="outline">Stack</span>',
    tech_subtitle: 'From AI models to full-stack apps — multi-domain capabilities',

    // Skills
    skills_label: '// SKILLS',
    skills_title: 'Skills <span class="outline">Matrix</span>',
    skills_subtitle: 'Always learning, always improving',
    skill_cat_frontend: 'Frontend',
    skill_cat_backend: 'Backend',
    skill_cat_ai: 'AI / ML',
    skill_cat_bigdata: 'Big Data / DevOps',
    skill_wxapp: 'WeChat Mini Program (WXML/WXSS)',
    code_c1: '# 1. Initialize weights — Born with certain talents (random init)',
    code_c2: '# Output probability distribution for 10 classes',
    code_c3: '# 2. Forward pass — Understanding the world with existing knowledge',
    code_c4: '# 3. Compute loss — Recognizing our shortcomings',
    code_c5: '# Compare with ground truth labels',
    code_c6: '# 4. Backpropagation — Learning from mistakes, computing gradients',
    code_c7: '# 5. Update weights — Growth and change, fine-tuning along gradients',
    code_c8: '# Clear gradients, prepare for next iteration',
    code_c9: '# Ultimately, we learn not to replicate the past, but to generalize to the future',

    // --- metro-gate ---
    metro_p1: 'Metro gate vaulting (or crawling under) is one of the most common violations in urban rail transit, causing both fare losses and serious safety hazards. Traditional approaches rely on manual monitoring, which is inefficient and prone to missed detections. This project uses a <strong>YOLOv5</strong> object detection model trained specifically to identify gate vaulting behavior, deployed on a <strong>Rockchip RK3588</strong> edge device for end-to-end real-time inference from video stream input to violation alerts.',
    metro_p2: 'Visual detection in metro gate scenarios faces multiple challenges:',
    metro_p3: 'Customized modifications based on the YOLOv5s architecture. First, we lightweight the Backbone by replacing standard convolutions in C3 modules with <strong>Depthwise Separable Convolutions</strong>, reducing parameters from 7.2M to 4.1M while maintaining feature extraction capability.',
    metro_p4: 'For the dataset, we collected <strong>8,000+ frames</strong> from metro station surveillance videos, annotating three target classes: <code>normal_pass</code>, <code>climb_over</code>, and <code>crawl_under</code>. We used Mosaic + MixUp + random cropping augmentation, and introduced optical flow features from adjacent frames as auxiliary input to capture the temporal characteristics of vaulting actions.',
    metro_p5: '<strong>Rockchip RK3588</strong> is one of the most powerful domestic edge AI SoCs, integrating quad-core Cortex-A76 + quad-core Cortex-A55 CPU, Mali-G610 GPU, and a dedicated <strong>6 TOPS NPU</strong> (Neural Processing Unit). Its NPU supports INT8/INT16/FP16 mixed-precision inference, making it ideal for deploying quantized YOLO models.',
    metro_p6: 'Our development board features <strong>8GB LPDDR5</strong> memory and a dedicated NPU accelerator. Compared to GPU solutions (like Jetson Orin Nano), RK3588 offers lower power consumption (typically 5-8W vs 15W) and better cost-effectiveness, making it ideal for large-scale metro station deployments. The 6 TOPS NPU is more than sufficient for YOLOv5s-level models, achieving <strong>60+ FPS</strong> in real-world testing.',
    metro_p7: 'Deploying from PyTorch model to RK3588 NPU requires the following key steps:',
    metro_p8: 'When deploying on RK3588, we performed multi-dimensional inference optimization:',
    metro_p9: 'The system achieves 62 FPS inference speed on RK3588 with end-to-end latency (including pre/post-processing) under 20ms, fully meeting real-time metro monitoring requirements. The INT8 quantized model is only <strong>3.8MB</strong>, running stably at 6W power consumption, suitable for large-scale deployment across station gates.',
    metro_f1: '<strong>Severe Occlusion</strong> — Narrow gate channels frequently occlude subjects via barriers and other passengers, requiring strong occlusion reasoning capability',
    metro_f2: '<strong>Diverse Actions</strong> — Vaulting includes hurdle-style, hand-support, and crawl-under variants, lasting only 1-3 seconds, demanding high real-time detection performance',
    metro_f3: '<strong>Complex Lighting</strong> — Underground platforms have variable lighting with backlighting, sidelighting, and fluorescent flicker',
    metro_f4: '<strong>Edge Deployment</strong> — Must run on power-constrained embedded devices, requiring a sufficiently lightweight model',
    metro_f5: '<strong>Step 1: Export ONNX</strong> — Export PyTorch model to ONNX format with fixed 640×640 input size',
    metro_f6: '<strong>Step 2: RKNN Conversion</strong> — Use Rockchip\'s <code>rknn-toolkit2</code> to convert ONNX model to RKNN format with INT8 quantization (500-image calibration set)',
    metro_f7: '<strong>Step 3: NPU Deployment</strong> — Load RKNN model on RK3588 using <code>rknn-lite2</code> runtime with NPU-accelerated inference',
    metro_f8: '<strong>Step 4: Video Stream Integration</strong> — Capture RTSP video stream with OpenCV, feed frames to the model, and push results to the alert system via WebSocket',
    metro_f9: '<strong>INT8 Quantization</strong> — Using rknn-toolkit2 quantization, FP32 model is quantized to INT8, reducing model size 4x and improving inference speed 2.5x with only 1.2% mAP drop',
    metro_f10: '<strong>Multi-core NPU Parallelism</strong> — RK3588 NPU supports 3-core parallel inference via <code>core_mask=RKNN.NPU_CORE_0_1_2</code> for maximum throughput',
    metro_f11: '<strong>Zero-copy Optimization</strong> — DMA buffer enables zero-copy transfer from video frames to NPU, reducing memory copy overhead',
    metro_f12: '<strong>Async Pipeline</strong> — Video capture, preprocessing, inference, and post-processing run as an async pipeline to maximize throughput',

    // --- yolo26-multimodal ---
    yolo26_p1: 'In real-world visual detection scenarios, we often need to simultaneously obtain an object\'s <strong>location</strong> (bounding box), <strong>shape</strong> (keypoints), and <strong>contour</strong> (segmentation mask). Traditional approaches typically require training a separate model for each task, then combining outputs via multi-model cascading or ensembling — adding system complexity and non-trivial inference latency.',
    yolo26_p2: 'The core idea of YOLO26 Multimodal is: leverage YOLO26\'s <strong>reusable Backbone and Neck</strong> to extract unified multi-scale features, then design three independent Detection Head, Keypoint Head, and Segmentation Head, each with its own loss function and output format. The entire system outputs all three result types in a <strong>single forward pass</strong>, achieving "one computation, triple perception."',
    yolo26_p3: 'The architecture follows YOLO\'s One-Stage design philosophy with key innovations at the Head layer. While traditional YOLO Heads handle only single detection tasks (bounding box + class), we split the Head into three functionally independent branches, each with its own output channels, activation functions, and loss computation logic.',
    yolo26_p4: 'The key advantage is <strong>feature reuse</strong> — Backbone and Neck features are shared across three Heads, avoiding redundant computation. Each Head can be independently trained and fine-tuned without interference. When only one output type is needed, other Heads can be individually disabled for flexible capability trimming.',
    yolo26_p5: 'YOLO26\'s Backbone is based on CSP (Cross Stage Partial) architecture, using CBS (Conv + BN + SiLU) modules as building blocks, with C2f modules for cross-stage feature fusion. The Neck uses PAN-FPN (Path Aggregation Network + Feature Pyramid Network) for bidirectional top-down and bottom-up feature aggregation.',
    yolo26_p6: 'Key design: We added a <strong>Channel Split mechanism</strong> at the Neck output, splitting the fused feature map along the channel dimension into three groups for the Detection, Keypoint, and Segmentation Heads. This lightweight separation is more efficient than feature map copying, adding only 0.3% parameters while effectively reducing gradient conflicts between tasks.',
    yolo26_p7: 'Each Head has its own loss function, with the total loss as a weighted sum:',
    yolo26_p8: 'Where <strong>L_det</strong> includes CIoU localization loss, classification BCE loss, and objectness BCE loss; <strong>L_kpt</strong> uses keypoint heatmap MSE loss plus visibility classification loss; <strong>L_seg</strong> combines Dice Loss + BCE Loss for better foreground/background imbalance robustness.',
    yolo26_p9: 'Weight coefficients were determined through experimental tuning: λ₁=1.0, λ₂=0.5, λ₃=0.8. We also introduced <strong>dynamic weight adjustment</strong> — increasing L_det weight early in training for localization learning, then gradually raising L_kpt and L_seg weights for refined shape output.',
    yolo26_p10: 'For the dataset, we collected and annotated approximately <strong>12,000 images</strong> with multi-task labels, each containing bounding boxes, keypoint coordinates, and segmentation masks. Data augmentation uses Mosaic + MixUp + Random HSV + horizontal flip, with special geometric transforms for keypoints to ensure synchronized coordinate transformation.',
    yolo26_p11: 'Training uses AdamW optimizer with initial learning rate 1e-3 and cosine annealing schedule. Batch size is 32 (4×8 GPU) over 300 epochs. The first 50 epochs use Warmup + frozen Backbone, training only the Neck and three Heads to accelerate convergence and avoid early gradient oscillation.',
    yolo26_p12: 'Multi-head inference forward pass flow',
    yolo26_p13: 'Compared to the three-model cascading approach, the multi-head architecture achieves only 0.8 mAP drop in detection while improving inference speed by <strong>2.3×</strong> (18ms vs 42ms) and reducing parameters by <strong>37%</strong>. This validates the effectiveness of feature sharing + channel separation — in multi-task learning, shared feature extractors not only reduce computation but also improve generalization through inter-task regularization.',
    yolo26_f1: 'Handles object detection, outputting bounding box coordinates (x, y, w, h), objectness score, and class probabilities. Uses Decoupled Head design with independent classification and regression branches, CIoU Loss for localization. Anchor-free mode with direct center offset and dimension regression, supporting NMS post-processing.',
    yolo26_f2: 'Handles keypoint detection, outputting K predefined keypoint coordinates with visibility labels. Uses Heatmap-based approach generating H×W Gaussian heatmaps per keypoint, trained with MSE Loss. Supports variable keypoint counts (e.g., 17 for human body, 68 for face, 21 for hand) via flexible configuration.',
    yolo26_f3: 'Handles instance segmentation, generating pixel-level masks for each detected object. Uses Mask Prototype + Coefficients approach (similar to YOLACT), with a lightweight mask decoder requiring only 1ms. Outputs 128×128 mask prototypes, linearly combined via detection head coefficient vectors for final masks, balancing accuracy and speed.',

    // --- neural-vision ---
    nv_p1: 'NeuralVision Pro is a visual inspection system for <strong>industrial quality control</strong>, using YOLOv8 for high-speed object detection combined with SAM (Segment Anything Model) for pixel-level defect segmentation. The system supports multiple industrial inspection scenarios including surface scratches, foreign object contamination, and dimensional deviations.',
    nv_p2: 'Through YOLO\'s rapid detection cascaded with SAM\'s precise segmentation, the system achieves <strong>sub-20ms</strong> end-to-end inference latency while maintaining detection accuracy. Built with Python + PyTorch, Flask backend, MySQL storage, and Docker containerization, it has been successfully validated across multiple real-world inspection scenarios.',
    nv_p3: 'End-to-end technology selection from model training to service deployment',
    nv_p4: 'YOLO detection + SAM segmentation cascaded inference pipeline',
    nv_f1: 'Real-time object detection based on YOLOv8 with single-frame inference latency as low as 15ms, meeting production line real-time inspection requirements',
    nv_f2: 'Pixel-level segmentation of detected regions using SAM, precisely annotating defect boundaries with both automatic and Prompt-based segmentation modes',
    nv_f3: 'Supports multiple industrial inspection scenarios including surface scratches, foreign objects, and dimensional deviations, with quick strategy switching via configuration files',
    nv_f4: 'Complete Docker deployment solution supporting standalone and cluster deployment, one-click inference service startup for rapid rollout across different production environments',

    // --- dataflow ---
    df_p1: 'DataFlow Pipeline is a real-time data processing platform built on <strong>Apache Flink + Kafka</strong>. Users configure data processing tasks through a Vue frontend, which are orchestrated into DAG graphs and executed by the Flink engine, with Kafka as the message middleware for efficient data flow.',
    df_p2: 'The platform supports multiple data source integrations (MySQL, Redis, Kafka Topics) with built-in operators for data cleaning, aggregation, and window computation. The Java backend provides RESTful APIs for the frontend, with Redis caching for real-time task status queries. As a core big data course project, it successfully processed <strong>million-level daily</strong> simulated data streams.',
    df_p3: 'Full-stack big data solution with stream computing + visual monitoring',
    df_p4: 'Core Flink job definition for real-time Kafka data stream processing',
    df_f1: 'High-performance stream processing engine based on Flink, supporting window computation, state management, and Exactly-Once semantic guarantees',
    df_f2: 'Vue frontend displaying real-time task status, throughput, and latency metrics with task start/stop and configuration management',
    df_f3: 'Automatic task failure recovery based on Flink Checkpoint mechanism, with Kafka persistent messaging ensuring zero data loss',
    df_f4: 'Built-in aggregation, filtering, Join, window and other data processing operators with custom UDF extension support',

    // --- pixelmind ---
    pm_p1: 'PixelMind SDK is a <strong>vision model inference engine</strong> designed for edge devices and resource-constrained environments. Supporting PyTorch and ONNX inference backends with Docker containerization, it enables rapid deployment of trained vision models across diverse hardware platforms.',
    pm_p2: 'The SDK provides a unified Python API with built-in model format conversion (PyTorch → ONNX), supporting inference acceleration for YOLO, SAM and other mainstream vision models. Paired with Flask/FastAPI for quick inference service setup, achieving single-frame latency as low as <strong>8ms</strong>.',
    pm_f1: 'Unified Python API supporting both PyTorch and ONNX Runtime backends with automatic optimal backend selection based on hardware.',
    pm_f2: 'Built-in Dockerfile and docker-compose configuration for one-click inference service image building, supporting both GPU and CPU runtime modes.',
    pm_f3: 'Three lines of code for model loading, inference, and result parsing. RESTful API interface for easy frontend-backend integration.',
    pm_f4: 'Built-in PyTorch → ONNX conversion tool supporting format conversion and validation for YOLO, SAM and other mainstream vision models.',

    // --- stackforge ---
    sf_p1: 'Every new project requires scaffolding from scratch — choosing frameworks, configuring ESLint, setting up CI/CD, writing Dockerfiles, managing environment variables... This repetitive work consumes valuable development time.',
    sf_p2: '<strong>StackForge CLI</strong> encapsulates these best practices into composable templates, generating production-grade project skeletons with a single command. Supporting <strong>Vue + PHP/Python</strong> tech stacks, it auto-generates frontend project structure, backend API templates, Docker configuration, and CI/CD pipelines.',
    sf_p3: 'With 20+ built-in project templates covering Vue + Flask, Vue + Spring Boot, Vue + PHP Laravel and other mainstream development scenarios. The core engine is written in Python with a YAML-based template system for flexibility and extensibility.',
    sf_p4: 'StackForge uses a lightweight architecture with Python core + Shell helpers, YAML-based template system, and support for custom template extensions.',
    sf_p5: 'A single command initializes a complete Vue + PHP full-stack project. StackForge interactively guides you through tech stack selection and automatically generates all configuration files.',
    sf_f1: 'Built-in Vue 2/3 project templates with auto-generated component structure, routing, state management, and TypeScript support — ready to use out of the box.',
    sf_f2: 'Supports PHP Laravel, Python Flask/FastAPI, Java Spring Boot and other backend templates, auto-generating RESTful API skeletons and database models.',
    sf_f3: 'Auto-generates Dockerfile and docker-compose.yml with separate dev and prod configurations, built-in health checks and resource limits.',
    sf_f4: 'Built-in GitHub Actions and GitLab CI templates for auto-generated test, build, and deployment pipelines with multi-environment support.',

    // Listing pages
    blog_back: '← Back to Home',
    blog_list_title: '// All Posts',
    blog_list_sub: 'All Posts — 7 articles and counting',
    proj_back: '← Back to Home',
    proj_list_title: '// All Projects',
    proj_list_sub: 'All Projects — 6 projects and counting',
    blog_card1_title: 'AI Agent: Workflow Revolution or Another Bubble?',
    blog_card1_desc: 'From solo developers to enterprise applications, AI Agent is transforming how we work. But beneath the hype, what\'s real change and what\'s overhyped?',
    blog_card2_title: 'The "Three-Month Rule" of Open Source: From Viral to Forgotten',
    blog_card2_desc: 'Why do so many open source projects launch to massive fanfare, then fade into obscurity months later? Analyzing the hype cycle through projects like OpenClaw.',
    blog_card3_title: 'From DETR to YOLOv8: The Evolution of Transformers in Object Detection',
    blog_card3_desc: 'Deep dive into how Transformer architecture revolutionized object detection — from DETR\'s end-to-end detection to YOLOv8\'s real-time optimization, covering attention mechanisms, training strategies, and production deployment.',
    blog_card4_title: 'Real-Time Data Streaming: Building Sub-Second Pipelines with Flink + Kafka',
    blog_card4_desc: 'Building a real-time streaming system from scratch with Flink + Kafka, covering Exactly-Once semantics, window aggregation, state management, and production-grade fault tolerance.',
    blog_card5_title: 'WebGPU Deep Learning in the Browser: From WebNN to Real-Time Inference',
    blog_card5_desc: 'Exploring WebGPU\'s potential for running deep learning models in the browser — from API design to shader optimization, building a real-time inference engine.',
    blog_card6_title: 'Image Processing Pipeline: End-to-End Optimization from Pixels to Decisions',
    blog_card6_desc: 'Designing a high-performance image processing pipeline covering preprocessing, enhancement, inference, and post-processing for industrial-grade visual inspection.',
    blog_card7_title: 'SAM2 in Industrial Inspection: Interactive Segmentation for Defect Detection',
    blog_card7_desc: 'Bringing SAM2 to industrial quality inspection — interactive defect segmentation and annotation with YOLO detectors for semi-automated labeling pipelines.',
    proj_card1_desc: 'Multi-modal visual detection system based on YOLO26, outputting detection, keypoints, and segmentation in a single forward pass with reusable backbone and neck architecture.',
    proj_card2_desc: 'Metro gate vaulting detection system based on YOLOv5, deployed on RK3588 edge device with RKNN inference acceleration for real-time violation detection.',
    proj_card3_desc: 'Real-time object detection and segmentation system based on YOLO and SAM, designed for industrial quality inspection with multi-class defect identification.',
    proj_card4_desc: 'Real-time streaming engine based on Flink + Kafka, supporting Exactly-Once semantics and sub-second window aggregation for big data scenarios.',
    proj_card5_desc: 'Lightweight vision model inference engine with model quantization and pruning optimization, designed for edge device deployment.',
    proj_card6_desc: 'Full-stack scaffolding tool based on Vue + PHP, generating frontend and backend project templates with built-in auth management and data visualization.',

    // Projects
    projects_label: '// PROJECTS',
    projects_title: 'Selected <span class="outline">Works</span>',
    projects_count: '04 / Featured Projects',
    proj1_tag: 'AI Vision · YOLO · SAM',
    proj1_title: 'NeuralVision Pro',
    proj1_desc: 'Real-time object detection and segmentation system based on YOLO and SAM, supporting multi-scenario visual inference and industrial inspection',
    proj2_tag: 'Big Data · Flink · Kafka',
    proj2_title: 'DataFlow Pipeline',
    proj2_desc: 'Real-time data processing pipeline based on Flink and Kafka, supporting million-level TPS streaming computation with visual orchestration',
    proj3_tag: 'AI SDK · Edge · Model Deploy',
    proj3_title: 'PixelMind SDK',
    proj3_desc: 'Lightweight visual model inference engine for edge devices, supporting PyTorch / ONNX multi-backend with Docker containerized deployment',
    proj4_tag: 'DevTools · PHP · Vue',
    proj4_title: 'StackForge CLI',
    proj4_desc: 'Full-stack project scaffolding tool, generating Vue frontend + backend API + CI/CD configuration in one click to boost team productivity',
    proj5_tag: 'AI Vision · YOLO26 · Multi-head',
    proj5_title: 'YOLO26 Multimodal',
    proj5_desc: 'Multimodal vision detection system based on YOLO26, outputting detection, keypoints, and segmentation from a single model',
    proj6_tag: 'Edge AI · YOLOv5 · RK3588',
    proj6_title: 'Metro Gate Detection',
    proj6_desc: 'Metro gate vaulting detection based on YOLOv5, deployed on RK3588 edge device for real-time inference',

    // Featured Code
    code_label: '// FEATURED CODE',
    code_heading: 'Good code is <span class="hl">poetry</span> written for machines',
    code_text: 'Training a neural network is like the human journey — from ignorance to perception, from mistakes to growth. Every backpropagation is an iteration of self-awareness.',

    // Blog
    blog_label: '// BLOG',
    blog_title: 'Latest <span class="outline">Posts</span>',
    blog_viewall: 'View All →',
    blog1_title: 'From DETR to YOLOv8: The Evolution of Transformer in Object Detection and Engineering Practice',
    blog2_title: 'Real-Time Data Processing Architecture: Best Practices for Flink + Kafka Streaming',
    blog3_title: 'WebGPU Intro: A Performance Optimization Guide for Running Deep Learning Inference in the Browser',
    blog4_title: 'Designing a Scalable Image Processing Pipeline: From Python Scripts to Kubernetes Clusters',
    blog5_title: 'SAM 2 in Industrial Inspection: From Prompt Engineering to Production Line Deployment',
    blog6_title: 'AI Agents: Reshaping Workflows or the Next Bubble?',
    blog7_title: 'The "Three-Month Law" of Open Source: From Hype to Abandonment',

    // GitHub
    github_label: '// GITHUB',
    github_title: 'Open Source <span class="outline">Activity</span>',
    github_subtitle: 'Code is the best resume',
    gh_contributions: 'Contributions',
    gh_repos: 'Repositories',
    gh_stars: 'Stars',
    gh_prs: 'PRs Merged',
    gh_less: 'Less',
    gh_more: 'More',

    // Testimonials
    testimonials_label: '// TESTIMONIALS',
    testimonials_title: 'What People <span class="outline">Say</span>',
    testimonials_subtitle: 'Real feedback from collaborators and classmates',
    test1_text: 'Eric is one of the most engineering-intuitive classmates I\'ve ever met. He quickly grasps complex technical problems and delivers elegant, efficient solutions, especially impressive in vision detection projects.',
    test2_text: 'Working with Eric on course projects was a great experience. His dedication to practical technologies and turning ideas into working solutions benefited our whole group, especially in hands-on work around big-data coursework.',
    test3_text: 'Eric\'s full-stack capabilities are impressive — from Vue frontends to Python/Java backends to AI model training, he handles it all with ease. Highly recommended!',
    test1_role: 'Mentor @ AI Tech Company',
    test2_role: 'Project Lead @ SCUT',
    test3_role: 'Intern Colleague @ Internet Company',

    // Next Chapter
    next_label: '// NEXT CHAPTER',
    next_title: 'System <span class="outline">Upgrade</span>',
    next_subtitle: 'HKUST Offer Received — Starting Fall 2026',
    next_badge_current: 'COMPLETED',
    next_badge_future: 'OFFER SECURED',
    next_current_title: 'South China Univ. of Tech.',
    next_current_sub: 'Software Engineering · BSc',
    next_current_desc: 'Full-Stack Dev & AI Vision Applications',
    next_future_title: 'HKUST',
    next_future_sub: 'Artificial Intelligence · MSc',
    next_future_desc: 'Fall 2026 · Deep Learning & AI Research',
    next_progress_label: 'SYSTEM UPGRADE',
    next_m1: '✓ BSc in Progress',
    next_m2: '✓ Project Experience',
    next_m3: '✓ Offer Secured',
    next_m4: '◉ Fall 2026 Enrollment',
    next_stat_year: 'Enrollment Year',
    next_stat_school: 'Admitted To',
    next_stat_field: 'Research Focus',

    // Contact
    contact_heading: 'Got an idea?<br>Let\'s <span class="hl">build it</span> together',
    contact_subtitle: 'Whether it\'s project collaboration or tech discussion, feel free to reach out',
    contact_name: 'Your name',
    contact_email: 'Your email',
    contact_subject: 'Subject',
    contact_message: 'What\'s on your mind?',
    contact_submit: 'Send Message →',

    // Footer
    footer_copy: '&copy; 2026 Eric. Built with kk\'s <span class="heart">♥</span> love and too much coffee.',

    // Command Palette
    cmdk_placeholder: 'Type a command or search...',
    cmdk_toggle_theme: 'Toggle Theme',
    cmdk_goto_about: 'About Me',
    cmdk_goto_projects: 'View Projects',
    cmdk_goto_blog: 'Read Blog',
    cmdk_goto_contact: 'Contact Me',
    cmdk_toggle_lang: '切换到中文',
    cmdk_github: 'Open GitHub',
    cmdk_copy_email: 'Copy Email',
    cmdk_back_top: 'Back to Top',
    cmdk_view_source: 'View Source',
    cmdk_toggle_cursor: 'Toggle Cursor Style',
    cmdk_toggle_particles: 'Toggle Particles',
    cmdk_toggle_sound: 'Toggle Sound',
    cmdk_group_nav: 'Navigation',
    cmdk_group_action: 'Actions',
    cmdk_group_social: 'Social',

    // Back to top
    back_to_top: 'Back to top',

    // Detail: Metro Gate
    metro_title: 'Metro <span class="hl">Gate</span> Detection',
    metro_s1: 'AI Gatekeeper for Metro Safety',
    metro_s2: 'Scene Challenges',
    metro_s3: 'Model Design',
    metro_s4: 'RK3588 Hardware Platform',
    metro_s5: 'Deployment Pipeline',
    metro_s6: 'Inference Optimization',
    metro_s7: 'RKNN Inference Code',
    metro_s8: 'Deployment Results',

    // Detail: YOLO26 Multimodal
    yolo26_title: 'YOLO26 <span class="hl">Multimodal</span>',
    yolo26_s1: 'One Model, Triple Perception',
    yolo26_s2: 'Multi-Head Architecture',
    yolo26_s3: 'Three-Head Design Details',
    yolo26_s4: 'Multi-Task Loss Design',
    yolo26_s5: 'Training Strategy',
    yolo26_s6: 'Core Inference Code',
    yolo26_s7: 'Experimental Results',

    // Detail: NeuralVision Pro
    nv_title: 'Neural<span class="hl">Vision</span> Pro',
    nv_s1: 'YOLO + SAM Industrial Inspection System',
    nv_s2: 'Architecture',
    nv_s3: 'Core Capabilities',
    nv_s4: 'Performance Metrics',
    nv_s5: 'Inference Pipeline',

    // Detail: DataFlow Pipeline
    df_title: 'Data<span class="hl">Flow</span> Pipeline',
    df_s1: 'Real-Time Streaming Data Platform',
    df_s2: 'Architecture',
    df_s3: 'Core Capabilities',
    df_s4: 'Performance Metrics',
    df_s5: 'Flink Streaming Job',

    // Detail: PixelMind SDK
    pm_title: 'PixelMind <span class="hl">SDK</span>',
    pm_s1: 'Lightweight Vision Inference Engine',
    pm_s2: 'Tech Stack',
    pm_s3: 'Core Capabilities',
    pm_s4: 'Performance Metrics',
    pm_s5: 'Python Inference Example',

    // Detail: StackForge CLI
    sf_title: 'Stack<span class="hl">Forge</span> CLI',
    sf_s1: 'Why StackForge?',
    sf_s2: 'Core Technology',
    sf_s3: 'Design Philosophy',
    sf_s4: 'Impact',
    sf_s5: 'Quick Start',

    // Detail Blog: AI Agent
    ba_title: 'AI Agents: Reshaping Workflows or the Next Bubble?',
    ba_s1: 'Introduction',
    ba_s2: 'What is an AI Agent?',
    ba_s3: 'Impact on Individual Developers',
    ba_s4: 'Opportunities & Challenges for Enterprises',
    ba_s5: 'Future Outlook',

    // Detail Blog: Open Source Hype
    bo_title: 'The "Three-Month Law" of Open Source: From Hype to Abandonment',
    bo_s1: 'Introduction',
    bo_s2: 'The Typical Trajectory',
    bo_s3: 'OpenClaw Phenomenon Analysis',
    bo_s4: 'Community Psychology & Herd Mentality',
    bo_s5: 'What Should We Learn?',
    bo_s6: 'Conclusion',

    // Detail Blog: Transformer Detection
    bt_title: 'From DETR to YOLOv8: Transformer Evolution in Object Detection',
    bt_s1: 'Introduction',
    bt_s2: 'DETR Architecture Analysis',
    bt_s3: 'Attention Mechanism Optimization',
    bt_s4: 'Model Optimization: TensorRT & ONNX',
    bt_s5: 'PyTorch Inference Code',
    bt_s6: 'Benchmark Results',
    bt_s7: 'Engineering Deployment',
    bt_s8: 'Summary & Outlook',

    // Detail Blog: Flink + Kafka
    bf_title: 'Real-Time Data Processing: Flink + Kafka Best Practices',
    bf_s1: 'Why Streaming?',
    bf_s2: 'Overall Architecture',
    bf_s3: 'Kafka Topic Design',
    bf_s4: 'Flink Core Concepts',
    bf_s5: 'Flink Real-Time Aggregation',
    bf_s6: 'Exactly-Once Semantics',
    bf_s7: 'State Management',
    bf_s8: 'Performance Tuning',
    bf_s9: 'Summary',

    // Detail Blog: WebGPU
    bw_title: 'WebGPU: Running Deep Learning Inference in the Browser',
    bw_s1: 'Overview',
    bw_s2: 'WebGPU Core Concepts',
    bw_s3: 'Compute Pipeline Setup',
    bw_s4: 'WGSL Shader Programming',
    bw_s5: 'Running ONNX Models in Browser',
    bw_s6: 'GPU Memory Management',
    bw_s7: 'Performance Benchmarks',
    bw_s8: 'Best Practices',

    // Detail Blog: Image Pipeline
    bi_title: 'Scalable Image Processing Pipeline: From Python to Kubernetes',
    bi_s1: 'Architecture Overview',
    bi_s2: 'Pipeline Stage Design',
    bi_s3: 'Kafka Streaming Architecture',
    bi_s4: 'Worker Concurrency Model',
    bi_s5: 'Kubernetes Deployment',
    bi_s6: 'Monitoring & Observability',
    bi_s7: 'Scaling Strategies',
    bi_s8: 'Summary & Lessons',

    // Detail Blog: SAM2 Inspection
    bs_title: 'SAM 2 in Industrial Inspection: From Prompt Engineering to Production',
    bs_s1: 'Introduction',
    bs_s2: 'SAM 2 Architecture',
    bs_s3: 'Prompt Engineering Strategy',
    bs_s4: 'Defect Detection Workflow',
    bs_s5: 'Python Inference Code',
    bs_s6: 'Domain Fine-Tuning',
    bs_s7: 'Edge Deployment Optimization',
    bs_s8: 'Production Line Results',
    bs_s9: 'Summary & Outlook',
  },
};

/* ---------- State ---------- */
let currentLang = localStorage.getItem('lang') || 'zh';

/* ---------- Core switch ---------- */
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  const t = I18N[lang];

  // Simple text replacements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // HTML replacements (for elements with <br>, <span> etc.)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // Placeholder replacements
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Title attribute replacements
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key] !== undefined) el.title = t[key];
  });

  // Update lang toggle button text
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = t.nav_lang;

  // Re-render command palette if open
  if (typeof renderCommands === 'function') renderCommands('');

  // Re-start typing with current language
  if (typeof restartTyping === 'function') restartTyping();
}

function toggleLang() {
  setLang(currentLang === 'zh' ? 'en' : 'zh');
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Create lang toggle button in nav
  const nav = document.getElementById('nav');
  if (nav) {
    const langBtn = document.createElement('button');
    langBtn.id = 'langToggle';
    langBtn.className = 'lang-toggle magnetic';
    langBtn.setAttribute('data-hover', '');
    langBtn.textContent = I18N[currentLang].nav_lang;
    langBtn.addEventListener('click', toggleLang);
    // Insert before nav-status
    const navStatus = nav.querySelector('.nav-status');
    if (navStatus) {
      nav.insertBefore(langBtn, navStatus);
    } else {
      nav.appendChild(langBtn);
    }
  }

  // Apply initial language
  setLang(currentLang);
});
