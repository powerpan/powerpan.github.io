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
