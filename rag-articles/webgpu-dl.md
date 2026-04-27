---
type: article
source: blog
original_file: webgpu-dl.html
---

# WebGPU 入门：在浏览器中运行深度学习推理的性能优化指南

## 概述

WebGPU 正在彻底改变浏览器中高性能计算的格局。作为 WebGL 的继任者，它不仅提供了更现代的图形 API，更重要的是暴露了强大的 Compute Shader 能力——这意味着我们终于可以在浏览器中高效地运行深度学习推理，而无需依赖 WebAssembly 的 workaround。

作为一名在学习视觉模型开发的学生，我对"能否在浏览器中跑模型"这个问题特别感兴趣。本文将从零开始，带你了解 WebGPU 的核心概念，并通过实际的 ML 推理案例，展示如何在浏览器中获得接近原生 GPU 的性能。

> WebGPU 的出现标志着浏览器从 "图形渲染工具" 升级为 "通用 GPU 计算平台"，这是 Web 平台能力的一次质的飞跃。

## WebGPU 核心概念

WebGPU 是由 W3C GPU Working Group 开发的全新 Web API，设计灵感来自 Vulkan、Metal 和 Direct3D 12。与 WebGL 相比，它提供了更底层的 GPU 访问能力，同时保持了 Web 平台的安全性和可移植性。

WebGPU 的核心抽象包括：

- GPUDevice — 逻辑设备，所有 GPU 资源的创建者和计算命令的提交者
- GPUBuffer — GPU 可见的内存块，用于存储输入输出数据
- GPUShaderModule — 编译后的 WGSL 着色器程序
- GPUComputePipeline — 计算管线，定义了着色器和绑定布局
- GPUCommandEncoder — 命令录制器，将多个 GPU 操作打包为 command buffer

最关键的区别在于：WebGPU 原生支持 Compute Shader，这是一个通用的 GPU 并行计算接口。在 WebGL 时代，我们只能通过 "将计算伪装成渲染" 的 hack 来利用 GPU 的并行能力，而 WebGPU 让这一切变得自然而高效。

## Compute Pipeline 搭建

WebGPU 的使用流程遵循一个清晰的模式：请求适配器 - 请求设备 - 创建 Buffer - 编写 Shader - 构建 Pipeline - 提交执行。每一步都是显式的，给你最大的控制权。

与 WebGL 的状态机模型不同，WebGPU 采用命令缓冲区（Command Buffer）模式：先录制所有 GPU 命令，然后一次性提交。这种设计天然适合 ML 推理的批处理场景。

在 ML 推理场景中，典型的工作流程是：

- 模型加载 — 将 ONNX 模型解析为计算图，为每个算子创建对应的 compute pipeline
- 权重上传 — 将模型权重一次性写入 GPU storage buffer
- 推理执行 — 逐层 dispatch compute shader，通过 buffer 传递中间结果
- 结果读回 — 使用 mapAsync 异步读取最终输出 tensor

## WGSL 着色器编程

WGSL（WebGPU Shading Language）是 WebGPU 的着色器语言，语法类似 Rust，支持向量化操作和共享内存。对于 ML 推理，我们需要将矩阵乘法、激活函数等操作翻译为 WGSL compute shader。

以下是一个使用 Shared Memory Tiling 优化的矩阵乘法 shader，这是 Transformer 模型中最核心的计算操作：

这个 tiled 版本利用了 workgroup shared memory，将全局内存访问次数减少了 TILE 倍。在实际测试中，tiled 版本比朴素实现快 8-12 倍。

## 在浏览器中运行 ONNX 模型

ONNX Runtime Web 是连接 WebGPU 和深度学习模型的桥梁。它将 ONNX 模型中的每个算子映射为 WebGPU compute shader，实现了端到端的浏览器内推理。

核心工作流程包括：

- 模型加载 — 通过 fetch 加载.onnx 模型文件，解析计算图结构
- 后端选择 — 使用 `ort.env.webgpu` 启用 WebGPU 后端，自动检测设备能力
- 算子映射 — ONNX 算子（Conv、MatMul、Softmax 等）自动编译为 WGSL shader
- 内存管理 — ORT Web 自动管理 GPU buffer 的分配和回收，支持 tensor 数据的零拷贝传输

对于 Transformer 模型，ORT Web 还支持 KV Cache 优化，将自注意力的计算复杂度从 O(n²) 降低到 O(n)，显著提升长序列推理效率。

## GPU 内存管理策略

WebGPU 的内存模型与原生 GPU API 非常相似。Buffer 是 GPU 可见的内存块，关键的优化点在于最小化 CPU 与 GPU 之间的数据传输。

对于 ML 推理场景，推荐以下最佳实践：

- Staging Buffer 模式 — 使用 staging buffer 作为 CPU/GPU 的桥梁，避免直接映射 storage buffer 带来的性能损失
- Buffer 复用 — 对于相同形状的 tensor，复用已分配的 buffer 减少 GC 压力
- 异步 Map — 使用 mapAsync 避免阻塞主线程，保持 UI 响应性
- 精度选择 — 在精度允许的情况下使用 f16，将显存占用减半，推理速度提升 40-60%

模型权重应该在初始化时一次性上传到 GPU，推理过程中只传输输入 tensor。对于 MobileNetV3 级别的模型（约 15MB 权重），初始化上传耗时约 50ms，之后的每次推理只需传输输入图像数据（约 0.6MB）。

> 内存优化的核心原则：让数据尽可能留在 GPU 上，减少跨设备传输。每一次 CPU-GPU 数据拷贝都是潜在的性能瓶颈。

## 性能基准测试

我们在三种方案上跑了一系列基准测试，使用相同的 MobileNetV3 模型处理 224x224 的输入图像。测试环境为 MacBook Pro M3 Max + Chrome 125。

- WebGPU Compute Shader — 8ms / inference, GPU 利用率 92%
- WebGL (ONNX Runtime) — 45ms / inference, GPU 利用率 35%
- WebAssembly (WASM) — 120ms / inference, CPU 单线程

WebGPU 的推理速度是 WebGL 的 5.6 倍，是纯 WebAssembly 的 15 倍。更重要的是，WebGPU 的性能在处理更大模型时优势更加明显——对于 BERT-base 级别的模型，差距可以拉大到 20 倍以上。

当然，WebGPU 也有其局限性：浏览器支持尚未完全普及（目前约 78% 的桌面浏览器支持），以及某些旧设备的驱动兼容性问题。但对于面向现代浏览器的 Web 应用来说，WebGPU 已经是 ML 推理的最佳选择。

## 实战建议与最佳实践

基于我们在生产环境中的经验，总结以下 WebGPU ML 推理的最佳实践：

- 渐进增强 — 首选 WebGPU，fallback 到 WebGL，最后 fallback 到 WASM，确保最大兼容性
- 模型量化 — 使用 INT8 量化将模型大小减小 4 倍，推理速度提升 2-3 倍，精度损失通常在 1% 以内
- 预热推理 — 页面加载后立即执行一次 dummy 推理，触发 shader 编译和 GPU buffer 分配
- Worker 线程 — 将推理放在 Web Worker 中执行，避免阻塞主线程导致 UI 卡顿

WebGPU 生态正在快速发展，W3C 规范仍在持续迭代。建议持续关注 Chrome DevRel 博客和 WebGPU Explainer，及时跟进 API 变更和新特性。
