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
      '全栈开发工程师',
      'AI 视觉算法专家',
      '开源爱好者',
      '性能优化狂人',
      '架构设计师',
    ],

    // About
    about_label: '// ABOUT ME',
    about_heading: '用代码构建智能系统，<br>以算法<span class="hl">洞察视觉世界</span>',
    about_text: '我是一名全栈开发工程师兼 AI 视觉算法开发者，专注于将前沿的人工智能技术落地为可交互的数字产品。从前端界面到后端架构，从模型训练到边缘部署，我享受跨越技术栈全链路创造价值的过程。热衷于开源，相信技术的力量在于共享。',
    stat_projects: '完成项目',
    stat_years: '年经验',
    stat_repos: '开源仓库',
    terminal_cmd: 'neofetch --short',
    terminal_output_1: 'Eric — Full-Stack & AI Vision Developer',
    terminal_output_2: '📍 Shanghai, CN',
    terminal_output_3: '🧠 Deep Learning · Computer Vision · LLM',
    terminal_output_4: '⚡ TypeScript / Python / Rust / Go',
    terminal_output_5: '🔥 React · Next.js · FastAPI · PyTorch',
    terminal_output_6: '🌱 Currently building: NeuralVision Engine',
    terminal_output_7: '📦 Open Source: 15 repos · 3.2k stars',
    terminal_output_8: '💬 "Code is poetry, bugs are typos"',

    // Timeline
    timeline_label: '// EXPERIENCE',
    timeline_title: 'My Journey',
    timeline_subtitle: '从校园到职场，持续进化中',
    tl1_year: '2024 — 至今',
    tl1_role: 'Senior AI Engineer',
    tl1_company: '@ ByteVision Tech',
    tl1_desc: '主导多模态视觉大模型的研发与落地，搭建公司核心 CV 推理平台，日均处理千万级图像请求。',
    tl2_year: '2022 — 2024',
    tl2_role: 'Full-Stack Developer',
    tl2_company: '@ DataFlow Inc.',
    tl2_desc: '负责实时数据处理平台的前后端架构设计与开发，将系统吞吐量提升 300%，支撑百万级 TPS 流式计算。',
    tl3_year: '2020 — 2022',
    tl3_role: 'Backend Engineer',
    tl3_company: '@ CloudNative Labs',
    tl3_desc: '参与微服务架构迁移，设计高可用 API 网关，将服务可用性从 99.5% 提升至 99.99%。',
    tl4_year: '2018 — 2020',
    tl4_role: 'Junior Developer',
    tl4_company: '@ Startup Garage',
    tl4_desc: '全栈开发多个 To B 产品，从前端交互到数据库优化全链路参与，积累了扎实的工程基础。',

    // Tech
    tech_label: '// TECH STACK',
    tech_title: 'Tools I Build With',
    tech_subtitle: '从前端到后端，从训练到部署 —— 全栈技术能力',

    // Skills
    skills_label: '// SKILLS',
    skills_title: 'Proficiency Matrix',
    skills_subtitle: '持续学习，持续精进',

    // Projects
    projects_label: '// PROJECTS',
    projects_title: 'Selected Works',
    projects_count: '04 / 精选项目',
    proj1_tag: 'AI Vision · Full-Stack · 2024',
    proj1_title: 'NeuralVision Pro',
    proj1_desc: '基于 Transformer 的实时目标检测与分割平台，支持多路视频流并发推理',
    proj2_tag: 'Full-Stack · DevOps · 2024',
    proj2_title: 'DataFlow Pipeline',
    proj2_desc: '实时数据处理流水线可视化管理平台，支持百万级 TPS 的流式计算编排',
    proj3_tag: 'AI SDK · Edge Computing · 2023',
    proj3_title: 'PixelMind SDK',
    proj3_desc: '面向边缘设备的轻量级计算机视觉推理引擎，支持 ONNX/TensorRT 多后端',
    proj4_tag: 'Open Source · CLI · 2023',
    proj4_title: 'StackForge CLI',
    proj4_desc: '下一代全栈项目脚手架工具，一键生成前后端 + CI/CD + 容器化配置',

    // Featured Code
    code_label: '// FEATURED CODE',
    code_heading: '写代码不只是工作，<br>更是一种<span class="hl">表达</span>',
    code_text: '这是我最近在做的一个高性能推理引擎的核心模块，基于 Rust + CUDA 实现了零拷贝的 Tensor 调度器，将端到端推理延迟降低了 40%。',

    // Blog
    blog_label: '// BLOG',
    blog_title: 'Latest Posts',
    blog_viewall: '查看全部 →',
    blog1_title: '基于 Transformer 的实时目标检测：从 DETR 到工程落地的完整路径',
    blog2_title: '构建高性能全栈应用：Turborepo + tRPC + Next.js 的 Monorepo 实践',
    blog3_title: 'WebGPU 入门：在浏览器中运行深度学习推理的性能优化指南',
    blog4_title: '设计一个可扩展的实时图像处理流水线：从架构到 Kubernetes 部署',
    blog5_title: 'SAM 2 在工业质检中的落地实践：从 Prompt Engineering 到产线部署',

    // GitHub
    github_label: '// GITHUB',
    github_title: 'Open Source Activity',
    github_subtitle: '代码是最好的简历',
    gh_contributions: 'Contributions',
    gh_repos: 'Repositories',
    gh_stars: 'Stars',
    gh_prs: 'PRs Merged',
    gh_less: 'Less',
    gh_more: 'More',

    // Testimonials
    testimonials_label: '// TESTIMONIALS',
    testimonials_title: 'What People Say',
    testimonials_subtitle: '来自合作伙伴和同事的真实评价',
    test1_text: 'Eric 是我见过最有工程直觉的开发者之一。他不仅能快速理解复杂的技术问题，还能给出优雅且高效的解决方案。',
    test2_text: '和 Eric 合作开发推理引擎是一段很棒的经历。他对性能优化的执着和对代码质量的追求让整个项目受益匪浅。',
    test3_text: 'Eric 的全栈能力令人印象深刻，从 React 前端到 CUDA 内核，他都能游刃有余地驾驭。强烈推荐！',

    // Contact
    contact_heading: '有想法？<br>让我们一起<span class="hl">实现它</span>',
    contact_subtitle: '无论是项目合作还是技术交流，随时欢迎联系',
    contact_name: '你的名字',
    contact_email: '你的邮箱',
    contact_subject: '主题',
    contact_message: '想聊些什么？',
    contact_submit: '发送消息 →',

    // Footer
    footer_copy: '&copy; 2024 Eric. Built with <span class="heart">♥</span> and too much coffee.',

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
      'Full-Stack Engineer',
      'AI Vision Specialist',
      'Open Source Enthusiast',
      'Performance Maniac',
      'System Architect',
    ],

    // About
    about_label: '// ABOUT ME',
    about_heading: 'Building intelligent systems<br>with code, <span class="hl">decoding the visual world</span>',
    about_text: 'I\'m a full-stack developer and AI vision engineer, focused on transforming cutting-edge AI technology into interactive digital products. From frontend interfaces to backend architectures, from model training to edge deployment — I thrive on creating value across the entire tech stack. Passionate about open source, believing in the power of shared knowledge.',
    stat_projects: 'Projects',
    stat_years: 'Years Exp.',
    stat_repos: 'OSS Repos',
    terminal_cmd: 'neofetch --short',
    terminal_output_1: 'Eric — Full-Stack & AI Vision Developer',
    terminal_output_2: '📍 Shanghai, CN',
    terminal_output_3: '🧠 Deep Learning · Computer Vision · LLM',
    terminal_output_4: '⚡ TypeScript / Python / Rust / Go',
    terminal_output_5: '🔥 React · Next.js · FastAPI · PyTorch',
    terminal_output_6: '🌱 Currently building: NeuralVision Engine',
    terminal_output_7: '📦 Open Source: 15 repos · 3.2k stars',
    terminal_output_8: '💬 "Code is poetry, bugs are typos"',

    // Timeline
    timeline_label: '// EXPERIENCE',
    timeline_title: 'My Journey',
    timeline_subtitle: 'From campus to career, constantly evolving',
    tl1_year: '2024 — Present',
    tl1_role: 'Senior AI Engineer',
    tl1_company: '@ ByteVision Tech',
    tl1_desc: 'Leading multimodal vision LLM R&D and deployment, building the core CV inference platform processing tens of millions of images daily.',
    tl2_year: '2022 — 2024',
    tl2_role: 'Full-Stack Developer',
    tl2_company: '@ DataFlow Inc.',
    tl2_desc: 'Led frontend/backend architecture design for real-time data processing platform, boosting throughput by 300% to support million-level TPS streaming.',
    tl3_year: '2020 — 2022',
    tl3_role: 'Backend Engineer',
    tl3_company: '@ CloudNative Labs',
    tl3_desc: 'Participated in microservice migration, designed high-availability API gateway, raising service availability from 99.5% to 99.99%.',
    tl4_year: '2018 — 2020',
    tl4_role: 'Junior Developer',
    tl4_company: '@ Startup Garage',
    tl4_desc: 'Full-stack development of multiple B2B products, involved in everything from frontend UX to database optimization, building a solid engineering foundation.',

    // Tech
    tech_label: '// TECH STACK',
    tech_title: 'Tools I Build With',
    tech_subtitle: 'From frontend to backend, training to deployment — full-stack capabilities',

    // Skills
    skills_label: '// SKILLS',
    skills_title: 'Proficiency Matrix',
    skills_subtitle: 'Always learning, always improving',

    // Projects
    projects_label: '// PROJECTS',
    projects_title: 'Selected Works',
    projects_count: '04 / Featured Projects',
    proj1_tag: 'AI Vision · Full-Stack · 2024',
    proj1_title: 'NeuralVision Pro',
    proj1_desc: 'Real-time object detection and segmentation platform based on Transformer, supporting concurrent multi-stream inference',
    proj2_tag: 'Full-Stack · DevOps · 2024',
    proj2_title: 'DataFlow Pipeline',
    proj2_desc: 'Visual management platform for real-time data processing pipelines, supporting million-level TPS streaming computation',
    proj3_tag: 'AI SDK · Edge Computing · 2023',
    proj3_title: 'PixelMind SDK',
    proj3_desc: 'Lightweight computer vision inference engine for edge devices, supporting ONNX/TensorRT multi-backend',
    proj4_tag: 'Open Source · CLI · 2023',
    proj4_title: 'StackForge CLI',
    proj4_desc: 'Next-generation full-stack project scaffolding tool, generating frontend + backend + CI/CD + containerization in one click',

    // Featured Code
    code_label: '// FEATURED CODE',
    code_heading: 'Code is not just work,<br>it\'s a form of <span class="hl">expression</span>',
    code_text: 'A core module of a high-performance inference engine I\'ve been working on — a zero-copy Tensor scheduler built with Rust + CUDA, reducing end-to-end inference latency by 40%.',

    // Blog
    blog_label: '// BLOG',
    blog_title: 'Latest Posts',
    blog_viewall: 'View All →',
    blog1_title: 'Real-Time Object Detection with Transformer: From DETR to Production',
    blog2_title: 'Building High-Performance Full-Stack Apps: Turborepo + tRPC + Next.js Monorepo Practice',
    blog3_title: 'WebGPU Intro: A Performance Optimization Guide for Running Deep Learning Inference in the Browser',
    blog4_title: 'Designing a Scalable Real-Time Image Processing Pipeline: From Architecture to Kubernetes Deployment',
    blog5_title: 'SAM 2 in Industrial Inspection: From Prompt Engineering to Production Line Deployment',

    // GitHub
    github_label: '// GITHUB',
    github_title: 'Open Source Activity',
    github_subtitle: 'Code is the best resume',
    gh_contributions: 'Contributions',
    gh_repos: 'Repositories',
    gh_stars: 'Stars',
    gh_prs: 'PRs Merged',
    gh_less: 'Less',
    gh_more: 'More',

    // Testimonials
    testimonials_label: '// TESTIMONIALS',
    testimonials_title: 'What People Say',
    testimonials_subtitle: 'Real feedback from collaborators and colleagues',
    test1_text: 'Eric is one of the most engineering-intuitive developers I\'ve ever met. He quickly grasps complex technical problems and delivers elegant, efficient solutions.',
    test2_text: 'Working with Eric on the inference engine was a great experience. His dedication to performance optimization and code quality elevated the entire project.',
    test3_text: 'Eric\'s full-stack capabilities are impressive — from React frontends to CUDA kernels, he handles it all with ease. Highly recommended!',

    // Contact
    contact_heading: 'Got an idea?<br>Let\'s <span class="hl">build it</span> together',
    contact_subtitle: 'Whether it\'s project collaboration or tech discussion, feel free to reach out',
    contact_name: 'Your name',
    contact_email: 'Your email',
    contact_subject: 'Subject',
    contact_message: 'What\'s on your mind?',
    contact_submit: 'Send Message →',

    // Footer
    footer_copy: '&copy; 2024 Eric. Built with <span class="heart">♥</span> and too much coffee.',

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
