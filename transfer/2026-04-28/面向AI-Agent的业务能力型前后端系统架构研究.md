# 面向 AI Agent 的业务能力型前后端系统架构研究

## ——从 CRUD 模式到智能业务系统

## 摘要

在 Web 应用和企业信息系统开发中，CRUD，即 Create、Read、Update、Delete，长期作为数据管理系统的基础开发范式。该模式以数据对象的创建、读取、更新和删除为核心，具有实现简单、开发效率高、结构清晰和适合代码生成等优点。CRUD 本身是软件系统中不可回避的底层能力，而不是一种应被简单否定的技术模式。

然而，随着业务复杂度提升，传统 CRUD 系统暴露出明显局限：系统设计容易围绕数据库表展开，而不是围绕业务目标展开；接口设计容易停留在增删改查层面，而缺少业务动作语义；前端页面容易演化为“表格 + 表单 + 按钮”的集合，而不能有效支持复杂任务流；后端服务容易堆积流程判断、状态判断和权限判断，导致系统可维护性下降。特别是在 AI Agent、RAG、自动化工作流和事件驱动架构逐渐进入业务系统的背景下，前后端系统不应只承担数据录入与查询功能，而应进一步成为承载业务能力、业务流程、知识沉淀和智能协同的平台。

本文首先分析传统 CRUD 系统的基本形态、优势与局限；随后从领域建模、业务动作接口、任务中心交互、状态机、工作流、事件驱动和数据资产沉淀等角度，提出跳出 CRUD 的系统设计方法；进一步结合 RAG 和 AI Agent 的技术特征，构建面向智能业务系统的分层架构模型。本文认为，CRUD 是业务系统的基础能力，但不应成为系统设计的中心。面向复杂业务和智能化场景的前后端系统，应从“数据表中心”转向“业务能力中心”，从“页面操作中心”转向“任务完成中心”，从“接口调用中心”转向“流程与事件协同中心”，最终形成具备可解释、可追踪、可扩展、可智能协同能力的现代业务系统。

**关键词：** CRUD；前后端系统；业务能力；领域驱动设计；事件驱动架构；工作流；RAG；AI Agent；智能业务系统

## Abstract

CRUD, namely Create, Read, Update and Delete, has long been a foundational development pattern in web applications and enterprise information systems. It provides a straightforward and efficient way to manage persistent data. However, as business systems become more complex, traditional CRUD-oriented architectures show significant limitations. They tend to organize systems around database tables rather than business goals, expose low-level data operations rather than semantic business capabilities, and produce user interfaces dominated by forms, tables and buttons rather than task-oriented workflows.

With the emergence of event-driven architecture, workflow engines, retrieval-augmented generation and AI agents, modern frontend and backend systems need to evolve from data management tools into intelligent business platforms. This paper analyzes the strengths and limitations of traditional CRUD systems, proposes a business-capability-oriented design approach, and presents a reference architecture for intelligent business systems. The proposed architecture integrates domain modeling, state machines, workflow orchestration, event-driven collaboration, knowledge bases, observability and AI-agent tool invocation. The paper argues that CRUD remains a necessary foundation, but it should not be the architectural center of complex business systems. Instead, business capabilities, processes, events, knowledge and human-AI collaboration should become the core of modern system design.

**Keywords:** CRUD; frontend and backend systems; business capability; domain-driven design; event-driven architecture; workflow; RAG; AI Agent; intelligent business system

---

# 第 1 章 绪论

## 1.1 研究背景

在企业管理系统、后台管理平台、项目协作系统、电商系统、工单系统、审批系统和内容管理系统中，CRUD 模式是最常见的开发起点。一个典型需求往往被拆解为“建表、写接口、做页面、加权限、加搜索、加导入导出”。在前端层面，系统表现为列表页、详情页、编辑页、搜索筛选区和操作按钮；在后端层面，系统表现为 Controller、Service、Repository 或 Mapper、Entity、DTO 等分层结构；在数据库层面，系统表现为业务表、关联表、状态字段和操作日志表。

这种模式具有较高的工程效率。对于低复杂度的信息管理场景，CRUD 能够快速满足数据维护、数据查询和后台管理需求。例如用户管理、角色管理、字典管理、基础档案管理等模块，通常确实可以通过标准 CRUD 实现。因此，本文并不主张否定 CRUD，而是关注一个更具体的问题：当系统从“数据维护工具”升级为“复杂业务系统”甚至“智能业务系统”时，继续以 CRUD 作为核心设计范式是否仍然合适。

从 Web 架构历史来看，REST 是影响现代 API 设计的重要架构风格。Roy Fielding 在其博士论文中提出 REST，用以描述分布式超媒体系统的架构约束；REST 并不等同于 CRUD，但在大量工程实践中，HTTP 方法常被映射到资源的增删改查操作。这使得许多开发团队在设计业务接口时，容易将业务系统简化为资源对象的操作集合。例如，订单系统被设计成 `/orders/create`、`/orders/update`、`/orders/delete`、`/orders/list`；项目系统被设计成 `/projects/add`、`/projects/edit`、`/projects/remove`、`/projects/query`。这种设计在早期阶段易于实现，但在复杂业务场景下容易暴露问题。

现代业务系统面对的不再只是“维护数据”，而是“完成任务”。用户真正需要的通常不是新增一条记录，而是完成一次审批、推进一个项目、处理一个异常、生成一份报告、完成一次客户跟进或降低一次业务风险。系统如果只提供数据操作能力，就会把大量业务理解、流程判断和决策负担转移给用户。随着 AI Agent 技术的发展，系统还需要支持自然语言交互、工具调用、知识检索、任务分解、人类确认和执行追踪。RAG 研究表明，将参数化模型能力与外部非参数化知识源结合，有助于改进知识密集型任务中的事实性和可追溯性。这进一步说明，未来业务系统不仅要管理数据，还要管理知识、上下文和行动能力。

因此，前后端系统的设计重心需要发生变化：从数据表中心转向业务能力中心，从页面中心转向任务中心，从同步接口调用转向流程与事件协同，从静态数据管理转向动态知识沉淀，从被动响应用户操作转向主动辅助用户完成业务目标。

## 1.2 研究意义

本文的研究意义主要体现在两个方面。

首先，在理论层面，本文尝试将传统 CRUD 系统、领域驱动设计、事件驱动架构、工作流建模、RAG 和 AI Agent 放在同一条系统演进路径中进行讨论。领域驱动设计强调通过模型表达复杂业务，并通过限界上下文、实体、值对象、聚合和领域服务等概念组织软件结构。模型只有在特定上下文中才具有意义，因此应当显式定义模型适用的边界。这与本文反对“直接从数据库表出发设计系统”的观点一致。

其次，在实践层面，本文为前后端开发者提供一种从“接口开发思维”转向“业务能力设计思维”的方法。许多开发者具备实现页面、接口和数据库操作的能力，但在面对复杂业务时，容易陷入页面堆叠、接口堆叠和 Service 层逻辑堆叠。本文提出的架构模型可以帮助开发者重新识别业务动作、业务状态、业务流程、业务事件、知识资产和 Agent 工具边界，从而提高系统的可维护性、扩展性和智能化能力。

## 1.3 国内外研究与实践现状

从软件工程实践看，CRUD 长期存在于数据库应用、后台管理系统和 REST API 设计中。CRUD 是数据系统的基础抽象，但它主要描述的是数据操作，而不是完整业务语义。

在复杂业务建模方面，领域驱动设计提供了重要方法。领域驱动设计中的重要概念包括实体、值对象、服务对象、聚合和限界上下文等，这些概念有助于在复杂领域中组织模型。贫血领域模型则是一个常见反例，即模型对象只包含数据而缺少行为，导致系统虽然采用了领域对象的形式，却没有获得领域模型组织复杂逻辑的收益。这对传统 CRUD 系统具有直接启示：如果 Entity 只是数据库表的映射，Service 只是增删改查的包装，那么系统并没有真正表达业务。

在流程建模方面，工作流研究提供了对业务过程的抽象。工作流模式研究将顺序、并行、选择、同步、取消、异常处理等流程结构抽象为可复用模式，有助于理解复杂业务流程不应仅通过简单条件判断实现。

在系统协同方面，事件驱动架构逐渐成为处理复杂系统解耦和实时响应的重要方式。事件驱动架构围绕事件的发布、捕获、处理和存储而构建，事件溯源进一步指出，系统状态的变化可以被记录为一系列事件，事件日志不仅可以用于查询历史，还可以用于重建过去状态。这为业务过程追踪、审计和智能分析提供了基础。

在智能化系统方面，RAG、工具调用和 AI Agent 成为重要研究方向。RAG 将预训练模型的参数化记忆与外部知识索引结合，用于知识密集型生成任务。Toolformer 研究提出语言模型可以学习在合适时机调用外部工具，例如计算器、检索系统、搜索引擎、翻译系统和日历等。ReAct 方法则将推理与行动交替组织，使语言模型能够一边生成推理轨迹，一边调用外部知识库或环境执行动作。这些研究共同说明，AI Agent 不是简单的聊天窗口，而是一种能够理解意图、调用工具、处理上下文和参与任务执行的新型系统交互层。

## 1.4 研究内容与方法

本文围绕以下问题展开研究：

第一，传统 CRUD 系统的基本结构、优势和局限是什么？

第二，复杂业务系统为什么需要从数据表中心转向业务能力中心？

第三，领域建模、状态机、工作流、事件驱动和任务中心前端如何帮助系统跳出 CRUD？

第四，RAG 和 AI Agent 如何与前后端业务系统结合？

第五，如何构建一种面向智能业务系统的前后端参考架构？

本文主要采用文献分析、架构归纳和案例抽象的方法。文献分析用于梳理 CRUD、REST、DDD、工作流、事件驱动、RAG 和 AI Agent 的相关理论；架构归纳用于总结传统前后端系统的典型结构及其演进方向；案例抽象用于构建一个项目协作类系统的参考设计，说明如何将 CRUD 系统升级为业务能力型系统。

## 1.5 本文创新点

本文的创新点主要体现在以下三个方面。

第一，提出“从 CRUD 到业务能力”的前后端系统演进框架。本文不是简单讨论 CRUD 的好坏，而是将其放在系统复杂度演进过程中分析，指出 CRUD 适合作为基础能力，但不适合作为复杂业务系统的核心组织方式。

第二，提出面向 AI Agent 的业务能力型系统架构。本文将业务接口、状态机、工作流、事件驱动、知识库、RAG、工具调用和可观测性整合为统一架构，说明 AI Agent 要真正进入业务系统，必须依赖清晰的工具边界、权限控制、业务语义和执行追踪。

第三，强调前端系统也需要跳出 CRUD。许多架构讨论集中在后端，但本文认为前端同样需要从“菜单 + 页面 + 表单”转向“任务工作台 + 流程状态 + 智能辅助 + 人机确认”，否则系统仍然只是数据操作界面。

---

# 第 2 章 传统 CRUD 系统分析

## 2.1 CRUD 模式的基本概念

CRUD 是 Create、Read、Update 和 Delete 的缩写，分别对应创建、读取、更新和删除。它最初用于描述持久化数据的基础操作，后来被广泛用于数据库系统、后台管理系统和 REST API 设计中。虽然 CRUD 经常与 HTTP 方法对应，例如 GET 用于读取、POST 用于创建、PUT 或 PATCH 用于更新、DELETE 用于删除，但这种对应关系并不代表 REST 架构本身等同于 CRUD。

在工程实践中，CRUD 通常被具体实现为以下结构：

前端层面包括列表页、详情页、新增页、编辑页、删除按钮、分页组件、搜索条件、导入导出按钮等。

后端层面包括创建接口、查询接口、更新接口、删除接口、批量操作接口、分页查询接口和权限校验逻辑。

数据库层面包括主表、关联表、字典表、状态字段、创建时间、更新时间、创建人、更新人、逻辑删除字段等。

这种结构清晰、易于标准化，因此大量后台系统可以通过脚手架或低代码平台快速生成基础功能。

## 2.2 传统 CRUD 系统的典型架构

传统 CRUD 系统一般采用分层架构：

```text
前端页面层
  ├─ 列表页
  ├─ 表单页
  ├─ 详情页
  └─ 搜索与操作组件

后端接口层
  ├─ Controller
  ├─ Service
  ├─ Repository / Mapper
  └─ DTO / Entity / VO

数据持久层
  ├─ 业务表
  ├─ 关联表
  ├─ 字典表
  └─ 日志表
```

这种架构的设计顺序通常是：先根据需求抽取数据字段，再建立数据库表，然后生成实体类和接口，最后制作前端页面。它的优势是实现路径明确，开发人员可以快速完成从数据结构到页面功能的映射。

例如，一个“项目管理”模块在 CRUD 思维下可能被设计为：

```text
POST   /project/create        创建项目
GET    /project/list          查询项目列表
GET    /project/{id}          查询项目详情
PUT    /project/update        更新项目
DELETE /project/delete/{id}   删除项目
```

前端则对应：

```text
项目列表页
项目新增弹窗
项目编辑弹窗
项目详情页
项目删除确认框
```

这种设计对基础信息维护足够有效，但当项目管理涉及任务拆解、风险识别、进度跟踪、跨角色协同、自动周报和智能提醒时，CRUD 接口就难以表达完整业务过程。

## 2.3 CRUD 模式的优势

传统 CRUD 模式具有不可忽视的优势。

第一，开发效率高。CRUD 模式可以与数据库表直接对应，许多代码生成器可以根据表结构自动生成实体类、接口、页面和基础校验逻辑。

第二，学习成本低。开发者只需要理解数据对象、字段含义、接口路径和页面交互，就可以完成基础模块开发。

第三，结构清晰。对于单对象、低复杂度、少流程的模块，CRUD 能够保持系统结构简单，避免过度设计。

第四，便于管理基础数据。用户、角色、菜单、字典、组织、产品分类、标签、公告等模块，本身就更接近数据维护场景，使用 CRUD 是合理的。

第五，适合 MVP 阶段。在产品早期，快速验证业务需求比设计复杂架构更重要。此时通过 CRUD 快速搭建原型，有利于降低试错成本。

因此，本文并不将 CRUD 视为落后模式，而是将其视为基础模式。问题不在于系统是否需要 CRUD，而在于系统是否只停留在 CRUD。

## 2.4 CRUD 模式的局限

### 2.4.1 以数据表为中心，而非以业务目标为中心

CRUD 模式最常见的问题是从数据库表出发设计系统。开发者容易将需求理解为字段集合，将业务对象理解为表结构，将用户操作理解为接口调用。这种设计在需求简单时没有问题，但在复杂业务中会削弱系统对业务规则的表达能力。

例如，“审批”不是简单地修改一条记录的 `status` 字段，而是涉及提交人、审批人、审批顺序、审批意见、回退规则、超时处理、权限判断、通知机制和审计记录。若仍然将审批视为 `updateStatus`，系统就会把复杂业务规则隐藏在 Service 层条件判断中，导致后续维护困难。

### 2.4.2 接口缺少业务语义

CRUD 接口通常围绕对象操作命名，如 create、update、delete、list。但复杂业务动作往往不是简单更新。例如订单的“支付”“取消”“发货”“确认收货”“申请退款”都可能改变订单状态，但它们代表不同业务动作、触发不同规则和副作用。

较弱的接口设计是：

```text
PUT /orders/update
```

较好的接口设计是：

```text
POST /orders/{id}/pay
POST /orders/{id}/cancel
POST /orders/{id}/ship
POST /orders/{id}/apply-refund
POST /orders/{id}/confirm-receipt
```

前者只表达“修改订单”，后者表达明确业务动作。业务动作接口不仅更容易理解，也更适合作为 AI Agent 的工具，因为 Agent 需要调用具有明确语义和边界的能力，而不是模糊的底层更新接口。

### 2.4.3 状态管理薄弱

传统 CRUD 系统常用一个 `status` 字段表示业务状态。例如：

```text
0 草稿
1 待审批
2 已通过
3 已驳回
4 已归档
```

但很多系统并没有定义状态之间的合法转移关系，导致状态字段可以被任意修改。例如，从“已归档”重新变为“待审批”，从“已取消”变为“已完成”，都可能造成业务数据异常。

状态字段只描述“当前是什么状态”，状态机则描述“状态如何变化”。对于订单、审批、工单、项目任务、合同、售后等模块，状态机比简单 status 字段更适合表达业务规则。

### 2.4.4 复杂流程被压入 Service 层

在 CRUD 系统中，复杂流程常常通过 Service 方法中的条件判断实现。例如：

```text
if 当前用户是负责人:
    if 当前状态是待处理:
        if 附件已上传:
            更新状态
            发送通知
            写日志
```

随着需求增长，Service 层可能不断堆积权限判断、流程判断、通知逻辑、日志逻辑、异常处理和第三方系统调用。结果是单个方法越来越长，分支越来越多，测试越来越困难，业务规则也越来越难被产品、测试和开发共同理解。

工作流和流程模式研究表明，业务过程包含顺序、分支、并行、同步、取消和异常处理等多种模式。因此，对于复杂流程，仅依赖 CRUD Service 层并不是良好的长期方案。

### 2.4.5 前端页面以数据操作为中心

传统后台前端通常由菜单驱动。用户进入某个菜单后，看到列表、搜索条件、操作按钮和弹窗表单。这种方式适合管理数据，但不一定适合完成任务。

用户真实关心的往往是：

```text
今天有哪些任务需要处理？
哪些项目存在延期风险？
哪些审批快超时？
哪些客户需要跟进？
系统建议我下一步做什么？
哪些内容可以自动生成？
```

因此，前端系统也需要从“页面中心”转向“任务中心”。

### 2.4.6 难以自然接入 AI Agent

AI Agent 需要理解用户意图、检索上下文、调用工具、执行多步任务并返回结果。如果系统只暴露底层 CRUD 接口，Agent 就很难安全、稳定地完成复杂任务。

例如，用户说：“帮我检查这个项目本周有没有延期风险，并生成一份周报。”这个任务需要：

```text
查询项目计划
查询任务完成情况
识别延期任务
分析负责人和截止时间
生成风险摘要
生成周报
等待用户确认
保存或发送周报
```

如果系统只有 `/task/list`、`/task/update`、`/report/save` 这样的接口，Agent 需要自行拼装大量业务逻辑，风险较高。更合理的方式是系统提供语义化工具：

```text
analyzeProjectRisk(projectId)
generateWeeklyReport(projectId, weekRange)
submitReportForReview(reportId)
```

这说明 AI Agent 时代的业务系统需要把底层 CRUD 封装为清晰、受控、可审计的业务能力。

---

# 第 3 章 跳出 CRUD 的系统设计方法

## 3.1 从数据表中心转向领域模型中心

跳出 CRUD 的第一步，是改变系统设计起点。传统方式通常是：

```text
需求文档 → 字段 → 数据库表 → 接口 → 页面
```

更适合复杂业务的方式是：

```text
业务目标 → 角色 → 领域对象 → 业务动作 → 状态变化 → 业务规则 → 数据结构 → 接口与页面
```

领域模型不是数据库表的简单映射，而是对业务概念、业务关系和业务行为的抽象。以项目协作系统为例，系统中的核心领域对象不只是 `Project` 表和 `Task` 表，还包括：

```text
项目 Project
任务 Task
里程碑 Milestone
风险 Risk
成员 Member
周报 WeeklyReport
审批 Approval
通知 Notification
项目事件 ProjectEvent
```

这些对象之间存在业务关系。例如项目包含任务，任务归属于负责人，任务可能产生延期风险，风险可能触发通知，项目事件可以用于生成周报。若系统只建表而不建模，就很难表达这些关系背后的业务规则。

在 DDD 中，聚合用于维护业务一致性边界，限界上下文用于划分模型适用范围。对前后端系统而言，这意味着系统不应只有“模块菜单划分”，还应有“业务上下文划分”。例如项目上下文、审批上下文、通知上下文、知识库上下文和 Agent 上下文应具有不同模型边界。

## 3.2 从数据操作接口转向业务动作接口

CRUD 接口以对象为中心，业务动作接口以行为为中心。两者的区别如下：

| 维度 | CRUD 接口 | 业务动作接口 |
|---|---|---|
| 命名方式 | create、update、delete、list | submit、approve、reject、assign、archive |
| 关注点 | 数据是否被修改 | 业务动作是否完成 |
| 状态控制 | 常被隐藏在 update 中 | 明确绑定状态迁移 |
| 权限判断 | 通常较分散 | 可与动作边界绑定 |
| Agent 调用 | 语义模糊 | 语义明确 |
| 审计追踪 | 只知道修改了数据 | 知道发生了什么业务事件 |

例如任务模块不应只提供：

```text
POST /tasks/create
PUT /tasks/update
DELETE /tasks/delete
GET /tasks/list
```

还应提供：

```text
POST /tasks/{id}/assign
POST /tasks/{id}/start
POST /tasks/{id}/submit
POST /tasks/{id}/review
POST /tasks/{id}/reopen
POST /tasks/{id}/close
POST /tasks/{id}/mark-risk
```

这些接口代表清晰的业务动作。后端可以围绕这些动作组织权限校验、状态校验、副作用处理和事件发布。前端也可以围绕这些动作设计按钮、提示、流程状态和用户确认。

## 3.3 从状态字段转向状态机

状态机的核心不是记录状态，而是定义状态迁移规则。以任务状态为例：

```text
草稿 → 已分配 → 进行中 → 待验收 → 已完成
                    ↓
                  已延期
                    ↓
                  已关闭
```

每一次状态变化都应回答以下问题：

```text
当前状态是什么？
目标状态是什么？
谁可以触发？
触发条件是什么？
是否需要输入参数？
是否产生领域事件？
是否需要通知其他人？
是否需要写审计日志？
失败后如何处理？
```

例如，“任务提交验收”可以定义为：

```text
动作：submitForReview
当前状态：进行中
目标状态：待验收
触发角色：任务负责人
前置条件：任务产出物已上传
副作用：通知验收人；写入 TaskSubmittedEvent；记录操作日志
```

这样系统的复杂度不再隐藏在 `updateStatus` 中，而是显式表达为状态迁移模型。

## 3.4 从同步调用转向事件驱动

传统 CRUD 系统通常采用同步请求-响应模式。用户点击按钮，前端请求后端，后端更新数据库，返回结果。这个模式适合简单场景，但在复杂业务中，一个动作往往会引发多个后续动作。

例如任务被标记为延期后，可能需要：

```text
记录延期事件
通知项目经理
更新项目风险等级
刷新项目看板
生成风险分析数据
触发 Agent 总结
写入审计日志
```

如果这些逻辑全部写在一个 Service 方法中，系统会高度耦合。事件驱动架构可以将其拆解：

```text
TaskDelayedEvent
  ├─ NotificationService 发送通知
  ├─ RiskService 更新风险等级
  ├─ AnalyticsService 记录分析数据
  ├─ ReportService 更新周报素材
  └─ AgentService 生成风险摘要
```

对业务系统而言，事件可以成为连接业务操作、数据分析、通知、自动化和 AI 能力的桥梁。

## 3.5 从页面中心转向任务中心

跳出 CRUD 不只是后端架构问题，也是前端交互问题。传统后台前端通常按照资源对象组织菜单：

```text
项目管理
任务管理
成员管理
周报管理
审批管理
```

任务中心设计则围绕用户要完成的工作组织界面：

```text
我的待办
我负责的风险
即将超时的任务
需要我审批的内容
本周项目进展
系统建议操作
智能生成周报
```

这类设计的核心是让用户少找页面、多处理任务。前端不再只是接口的展示层，而是业务流程的表达层、任务上下文的聚合层和人机协同的确认层。

任务中心前端通常包含以下能力：

```text
待办列表
流程状态图
上下文摘要
推荐操作
风险提示
批量处理
智能生成
操作确认
结果追踪
```

与传统 CRUD 页面相比，任务中心前端更适合承载 AI Agent。Agent 可以在页面中提供解释、建议、摘要和自动化操作，但关键动作仍可通过人类确认完成。

## 3.6 从单一模型转向读写分离与视图模型

传统 CRUD 系统常用同一个模型处理新增、修改、查询和展示。但复杂系统中，写操作和读操作关注点不同。写操作关注业务规则、一致性和状态迁移；读操作关注查询效率、展示结构和聚合视图。

CQRS，即命令查询职责分离，强调可以使用不同模型更新信息和读取信息。但大多数系统完整采用 CQRS 会增加复杂度，因此不应盲目采用。

在本文语境中，不需要所有系统都完整采用 CQRS，但可以吸收其思想：不要强迫写模型和读模型完全一致。例如项目系统中：

写模型关注：

```text
创建项目
分配任务
提交验收
修改里程碑
关闭风险
```

读模型关注：

```text
项目首页看板
个人待办列表
风险排行榜
周报素材视图
项目进度统计
```

这有助于前端摆脱单表列表页，构建更贴近任务和决策的业务视图。

---

# 第 4 章 面向 AI Agent 的业务能力型前后端系统架构

## 4.1 架构总体设计

本文提出一种“业务能力型智能系统架构”，其核心思想是：系统底层仍然保留 CRUD 能力，但在其上构建领域模型、业务能力、流程事件、知识检索和 Agent 协同层。总体结构如下：

```text
┌──────────────────────────────────────┐
│          表现交互层                   │
│ Web 前端 / 移动端 / 任务工作台 / 对话 UI │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│          业务能力层                   │
│ 领域服务 / 应用服务 / 状态机 / 权限控制 │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│          流程与事件层                 │
│ 工作流 / 领域事件 / 消息队列 / 调度任务 │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│          数据与知识层                 │
│ 数据库 / 缓存 / 对象存储 / 日志 / 向量库 │
└──────────────────────────────────────┘
                  ↑
┌──────────────────────────────────────┐
│          智能 Agent 层                │
│ 意图理解 / RAG / 工具调用 / 任务规划 / 审计 │
└──────────────────────────────────────┘
```

该架构不是简单地在系统旁边增加一个聊天机器人，而是将 AI Agent 作为业务能力的调用者、知识层的使用者和任务流程的辅助者。Agent 不直接操作数据库，而是通过受控工具调用业务能力；Agent 不直接决定高风险操作，而是通过人类确认机制执行；Agent 不凭空生成业务结论，而是通过 RAG 获取可追溯上下文。

## 4.2 表现交互层设计

表现交互层包括 Web 前端、移动端、管理后台、数据看板、任务工作台和对话式助手。其设计目标是让用户围绕任务工作，而不是围绕菜单找功能。

传统前端页面强调：

```text
数据列表
新增按钮
编辑按钮
删除按钮
详情弹窗
```

业务能力型前端强调：

```text
当前任务
业务状态
下一步动作
风险提示
上下文摘要
智能建议
人类确认
执行反馈
```

以项目协作系统为例，首页不应只是项目列表，而应是项目工作台：

```text
我的待办：8 个
即将延期任务：3 个
需要审批事项：2 个
本周风险项目：1 个
Agent 建议：生成本周项目周报
```

用户点击某个任务后，系统展示的不只是任务字段，还包括任务背景、关联项目、历史事件、当前状态、可执行动作和智能建议。

## 4.3 业务能力层设计

业务能力层是跳出 CRUD 的核心。它负责将底层数据操作封装为具有明确语义的业务能力。例如：

```text
ProjectService
  ├─ createProjectPlan()
  ├─ assignProjectOwner()
  ├─ evaluateProjectRisk()
  ├─ archiveProject()

TaskService
  ├─ assignTask()
  ├─ startTask()
  ├─ submitTask()
  ├─ reviewTask()
  ├─ reopenTask()
  ├─ closeTask()

ReportService
  ├─ collectWeeklyMaterial()
  ├─ generateWeeklyReport()
  ├─ submitReport()
  ├─ publishReport()
```

业务能力层应具备以下特征：

第一，输入输出明确。每个业务能力都应有清晰参数、返回值和错误类型。

第二，权限边界明确。谁可以调用，在哪些状态下可以调用，都应显式定义。

第三，状态迁移明确。业务动作应绑定合法状态迁移。

第四，副作用明确。是否发送通知、发布事件、写日志、触发工作流，都应可追踪。

第五，可被 Agent 安全调用。Agent 调用的工具应优先是业务能力，而不是底层 CRUD 接口。

## 4.4 流程与事件层设计

流程与事件层用于解决复杂业务协同问题。它包括工作流引擎、领域事件、消息队列、任务调度、Webhook 和异步任务。

工作流适合处理显式流程，例如：

```text
提交申请 → 主管审批 → 财务审批 → 归档
```

事件驱动适合处理动作之后的松耦合副作用，例如：

```text
任务延期 → 更新风险 → 发送通知 → 记录分析数据
```

两者并不冲突。工作流强调“流程应该如何走”，事件强调“发生了什么以及谁要响应”。

例如项目风险处理流程可以设计为：

```text
1. 系统检测到任务延期
2. 发布 TaskDelayedEvent
3. RiskService 更新项目风险等级
4. NotificationService 通知项目经理
5. AgentService 生成风险摘要
6. 前端工作台展示风险处理待办
7. 项目经理确认处理方案
8. 系统记录 RiskHandledEvent
```

这种设计比在一个 Service 方法中连续调用多个服务更清晰，也更便于扩展。

## 4.5 数据与知识层设计

传统 CRUD 系统的数据层主要包括关系型数据库和缓存。但智能业务系统需要进一步建设知识层和行为数据层。

数据与知识层可以包括：

```text
关系型数据库：存储核心业务数据
Redis：缓存热点数据和会话状态
对象存储：存储附件、文档和图片
Elasticsearch：支持全文检索
向量数据库：支持语义检索
操作日志：记录用户操作
领域事件表：记录业务事件
Agent 调用日志：记录工具调用和执行链路
知识库：存储文档、规则、FAQ、会议纪要、项目资料
```

RAG 的价值在于将模型生成能力与外部知识结合，使系统能够基于企业文档、历史记录和业务规则回答问题或生成内容。在业务系统中，这意味着 Agent 不应只依赖模型自身知识，而应从系统知识库中检索项目文档、任务历史、审批记录和业务规则。

## 4.6 智能 Agent 层设计

智能 Agent 层负责理解用户意图、规划任务步骤、检索知识、调用工具、生成结果和接受反馈。其基本结构如下：

```text
用户输入
  ↓
意图识别
  ↓
上下文检索
  ↓
任务规划
  ↓
工具调用
  ↓
结果生成
  ↓
人类确认
  ↓
执行记录与反馈
```

Agent 可调用的工具应来自业务能力层，例如：

```text
getProjectOverview(projectId)
analyzeProjectRisk(projectId)
generateWeeklyReport(projectId, weekRange)
createTaskFromMeetingNote(projectId, noteId)
submitReportForApproval(reportId)
```

工具设计应遵循以下原则：

第一，工具命名应具有业务语义，而不是技术语义。

第二，工具参数应结构化，避免让 Agent 自行拼接 SQL 或直接操作数据库。

第三，高风险操作必须有人类确认，例如删除数据、发送邮件、提交审批、修改关键状态。

第四，工具调用必须记录日志，包括调用时间、调用者、输入参数、输出结果和执行状态。

第五，Agent 生成内容应保留引用来源，特别是使用 RAG 生成报告、总结或业务判断时。

语言模型调用工具、与外部环境交互并结合推理轨迹，是构建 Agent 能力的重要方向。但在真实业务系统中，工具调用不仅是模型能力问题，更是系统工程问题，需要权限、幂等、审计、失败处理和人机协同机制。

## 4.7 可观测性与审计机制

当系统引入事件驱动、工作流和 Agent 后，系统行为会变得更复杂。传统日志只能回答“某接口是否报错”，但智能业务系统还需要回答：

```text
这个业务动作是谁触发的？
状态为什么发生变化？
Agent 使用了哪些知识来源？
Agent 调用了哪些工具？
哪个步骤失败了？
用户是否确认了 Agent 建议？
生成内容是否被修改？
系统在哪些环节耗时最高？
```

可观测性不仅用于排查故障，也用于持续优化业务流程和 Agent 能力。除传统技术指标外，智能业务系统还应关注业务与 Agent 相关指标：

```text
业务动作成功率
状态迁移失败率
工作流平均处理时间
事件消费延迟
Agent 工具调用成功率
RAG 检索命中率
用户采纳率
人工修改率
高风险操作确认率
```

---

# 第 5 章 参考案例：项目协作系统的非 CRUD 化改造

## 5.1 案例背景

假设存在一个传统项目协作系统，其初始功能包括：

```text
项目管理
任务管理
成员管理
文件管理
周报管理
审批管理
```

在传统 CRUD 模式下，每个模块都有列表、新增、编辑、删除和详情功能。系统可以记录项目和任务，但用户仍然需要自己判断任务是否延期、项目是否存在风险、周报应如何撰写、审批应如何推进。

系统的主要问题包括：

```text
项目数据分散在多个页面
任务延期风险需要人工判断
周报需要手工整理
审批状态不够透明
项目经理难以及时发现异常
历史资料难以检索
AI 功能无法安全介入业务动作
```

因此，需要将其从传统 CRUD 系统改造为业务能力型智能系统。

## 5.2 传统 CRUD 设计

传统任务模块可能采用如下接口：

```text
POST   /tasks/create
GET    /tasks/list
GET    /tasks/{id}
PUT    /tasks/update
DELETE /tasks/{id}
```

任务表结构可能为：

```text
task
  id
  project_id
  title
  description
  owner_id
  status
  deadline
  created_at
  updated_at
  deleted
```

这种设计可以完成数据维护，但无法表达任务的完整生命周期。`status` 字段只是一个值，无法说明谁在什么条件下可以改变状态，也无法说明状态变化后应触发哪些业务行为。

## 5.3 业务能力型设计

改造后，任务模块应围绕业务动作设计：

```text
POST /tasks/{id}/assign
POST /tasks/{id}/start
POST /tasks/{id}/submit
POST /tasks/{id}/review-pass
POST /tasks/{id}/review-reject
POST /tasks/{id}/mark-risk
POST /tasks/{id}/close
```

任务状态机可以设计为：

```text
待分配 → 已分配 → 进行中 → 待验收 → 已完成
             ↓          ↓
           已取消      已延期
                         ↓
                       已关闭
```

其中，“提交验收”动作定义为：

```text
动作名称：submitTask
允许状态：进行中、已延期
目标状态：待验收
触发角色：任务负责人
前置条件：任务说明或产出物不为空
副作用：
  1. 发布 TaskSubmittedEvent
  2. 通知验收人
  3. 写入任务操作日志
  4. 更新项目活动时间
```

“标记风险”动作定义为：

```text
动作名称：markTaskRisk
允许状态：已分配、进行中、已延期
目标状态：保持原状态或进入已延期
触发角色：任务负责人、项目经理、系统 Agent
前置条件：存在延期、阻塞或依赖异常
副作用：
  1. 发布 TaskRiskMarkedEvent
  2. 更新项目风险等级
  3. 通知项目经理
  4. 将风险写入周报素材
```

这样，系统不再只是修改任务记录，而是明确表达任务在业务流程中的行为。

## 5.4 项目工作台设计

传统项目列表页只展示：

```text
项目名称
负责人
开始时间
结束时间
状态
操作按钮
```

改造后的项目工作台展示：

```text
项目总体进度
本周完成任务
延期任务
阻塞任务
高风险事项
待审批事项
成员负载
最近事件
Agent 建议
```

页面结构可以设计为：

```text
项目工作台
  ├─ 项目摘要卡片
  ├─ 进度与风险看板
  ├─ 我的待办
  ├─ 任务状态流
  ├─ 最近项目事件
  ├─ 周报素材
  └─ AI 助手侧栏
```

AI 助手侧栏可以支持：

```text
总结本周进展
分析延期原因
生成周报草稿
根据会议纪要创建任务
查询某任务历史
推荐风险处理方案
```

但所有关键操作都应经过人类确认。例如，Agent 可以生成周报草稿，但发布周报需要项目经理确认；Agent 可以建议调整任务负责人，但实际分配需要负责人或项目经理确认。

## 5.5 事件驱动设计

项目协作系统中的关键领域事件包括：

```text
ProjectCreatedEvent
TaskAssignedEvent
TaskStartedEvent
TaskSubmittedEvent
TaskDelayedEvent
TaskRiskMarkedEvent
ReportGeneratedEvent
ReportSubmittedEvent
ApprovalPassedEvent
ApprovalRejectedEvent
```

以任务延期为例，事件流如下：

```text
任务截止时间检查任务执行
  ↓
发现任务未完成且超过 deadline
  ↓
发布 TaskDelayedEvent
  ↓
RiskService 更新项目风险
  ↓
NotificationService 通知项目经理
  ↓
ReportService 写入周报素材
  ↓
AgentService 生成延期原因摘要
  ↓
前端工作台展示风险待办
```

这种方式使得“延期”从一个简单状态变化升级为一个可追踪的业务事件。

## 5.6 RAG 知识库设计

项目协作系统中的知识来源可以包括：

```text
项目需求文档
会议纪要
任务评论
历史周报
审批意见
风险记录
项目复盘
产品文档
技术方案
用户反馈
```

RAG 流程可以设计为：

```text
用户提问或任务触发
  ↓
系统识别项目、时间范围、相关对象
  ↓
从知识库检索相关文档和事件
  ↓
将检索内容与业务数据组合为上下文
  ↓
Agent 生成总结、建议或报告
  ↓
展示引用来源
  ↓
用户确认或修改
```

例如用户输入：

```text
帮我生成 A 项目本周周报。
```

系统应执行：

```text
1. 查询本周任务完成情况
2. 查询延期和风险事件
3. 检索本周会议纪要
4. 检索任务评论和审批记录
5. 生成周报草稿
6. 标注信息来源
7. 等待项目经理确认
```

这样生成的周报不是单纯由模型自由发挥，而是基于业务数据和知识库生成。

## 5.7 Agent 工具设计

Agent 工具层可以定义为：

```text
工具一：getProjectSummary(projectId)
功能：查询项目概况、进度、成员、任务数量和风险数量

工具二：analyzeProjectRisk(projectId, dateRange)
功能：分析指定时间范围内的延期任务、阻塞任务和风险事件

工具三：generateWeeklyReport(projectId, weekRange)
功能：基于任务、事件、会议纪要和历史周报生成周报草稿

工具四：createTaskFromMeetingNote(projectId, noteId)
功能：从会议纪要中提取待办事项并生成任务候选列表

工具五：submitReportForApproval(reportId)
功能：将确认后的周报提交审批
```

其中，`generateWeeklyReport` 属于低风险生成类工具，可以直接生成草稿；`submitReportForApproval` 属于业务状态变更工具，必须要求用户确认。

## 5.8 改造效果分析

传统 CRUD 系统和业务能力型系统的差异如下：

| 维度 | 传统 CRUD 项目系统 | 业务能力型智能项目系统 |
|---|---|---|
| 设计中心 | 项目表、任务表 | 项目目标、任务流程、风险处理 |
| 前端入口 | 菜单与列表 | 项目工作台与待办中心 |
| 后端接口 | 增删改查 | 分配、提交、验收、标记风险、生成周报 |
| 状态管理 | status 字段 | 状态机与合法迁移 |
| 流程处理 | Service 条件判断 | 工作流与领域事件 |
| 数据价值 | 保存最终结果 | 沉淀过程、事件、知识和复盘材料 |
| AI 接入 | 外挂聊天框 | 通过业务工具参与任务 |
| 用户角色 | 数据操作员 | 决策者、监督者、确认者 |
| 系统目标 | 管理数据 | 推进项目、识别风险、辅助决策 |

该案例说明，跳出 CRUD 并不是取消增删改查，而是在 CRUD 之上建立更具业务表达力的系统结构。

---

# 第 6 章 架构实施中的关键问题

## 6.1 避免过度设计

并非所有系统都需要完整引入 DDD、工作流、事件驱动、RAG 和 Agent。对于基础字典、简单档案、低频维护数据，CRUD 是最合适的方案。跳出 CRUD 的前提是业务复杂度已经超过简单数据维护。

可以根据以下标准判断是否需要非 CRUD 化设计：

```text
是否存在复杂状态流转？
是否涉及多角色协作？
是否存在审批、回退、超时、异常处理？
是否需要生成报告、总结或建议？
是否需要长期沉淀过程数据？
是否需要 AI Agent 调用业务能力？
是否存在高风险操作和审计要求？
```

如果答案大多为“否”，则不应盲目引入复杂架构。

## 6.2 业务能力边界设计

业务能力边界过细，会导致工具数量膨胀；边界过粗，又会导致能力模糊。合理的业务能力应满足：

```text
能被业务人员理解
能对应明确业务动作
有清晰输入输出
有明确权限边界
有可测试的业务规则
能被前端和 Agent 复用
```

例如 `updateTask` 太模糊，`submitTaskForReview` 更合适；`operateProject` 太宽泛，`archiveProject`、`evaluateProjectRisk`、`generateProjectReport` 更清晰。

## 6.3 Agent 安全与权限控制

Agent 进入业务系统后，权限控制更加重要。系统不能因为 Agent 是“智能助手”就赋予其无限权限。Agent 应继承用户权限，并受到额外限制。

高风险操作包括：

```text
删除数据
提交审批
发送外部通知
修改负责人
修改金额
关闭项目
导出敏感数据
```

这些操作应采用确认机制：

```text
Agent 生成操作建议
  ↓
系统展示影响范围
  ↓
用户确认
  ↓
后端执行业务能力
  ↓
记录审计日志
```

## 6.4 知识库质量控制

RAG 的效果取决于知识库质量。若知识库文档过期、权限混乱、切分不合理或缺少来源标注，Agent 生成结果就可能不可靠。

知识库建设应关注：

```text
文档权限
文档版本
来源标注
更新时间
语义切分
检索召回
引用展示
人工反馈
```

尤其在企业业务系统中，权限是核心问题。不同项目、部门、角色能够访问的文档不同，RAG 检索也必须遵守权限边界。

## 6.5 可观测性与持续优化

智能业务系统上线后，需要持续观察以下指标：

```text
用户是否使用任务工作台？
哪些业务动作失败率高？
哪些流程节点耗时最长？
Agent 建议是否被采纳？
生成内容是否被频繁修改？
RAG 检索是否命中有效文档？
哪些工具调用经常失败？
哪些高风险操作被拦截？
```

这些数据不仅用于技术运维，也用于产品优化和业务流程优化。

---

# 第 7 章 总结与展望

## 7.1 研究总结

本文围绕“跳出传统 CRUD”这一问题，分析了前后端系统从数据管理工具向智能业务系统演进的必要性和方法。CRUD 作为持久化数据的基础操作，具有开发效率高、结构清晰、学习成本低和适合基础管理模块等优势。但当业务系统涉及复杂流程、多角色协作、状态流转、风险识别、知识沉淀和 AI Agent 协同时，传统 CRUD 模式容易暴露出数据表中心、接口语义不足、状态管理薄弱、流程逻辑堆积、前端交互低效和智能化接入困难等问题。

本文提出，应将系统设计中心从数据表转向业务能力，从页面操作转向任务完成，从同步调用转向事件协同，从状态字段转向状态机，从单纯数据存储转向数据与知识资产沉淀。进一步，本文构建了面向 AI Agent 的业务能力型前后端系统架构，包括表现交互层、业务能力层、流程与事件层、数据与知识层、智能 Agent 层以及可观测性与审计机制。

通过项目协作系统案例，本文说明了如何将传统 CRUD 模块改造为具有业务动作接口、任务工作台、状态机、领域事件、RAG 知识库和 Agent 工具调用能力的智能业务系统。该案例表明，跳出 CRUD 并不是抛弃 CRUD，而是在 CRUD 之上建立更强的业务表达能力、流程协同能力和智能辅助能力。

## 7.2 不足之处

本文主要采用理论分析和架构设计方法，尚未基于真实生产系统进行定量实验验证。对于不同业务场景下业务能力边界如何划分、Agent 工具粒度如何控制、RAG 检索质量如何评估、任务工作台对用户效率提升多少等问题，还需要进一步结合实际项目进行测试和验证。

此外，AI Agent 在真实业务系统中的安全性、稳定性和责任边界仍然需要深入研究。Agent 可能生成错误建议、调用错误工具或误解用户意图，因此系统必须保留人类确认、权限控制、审计追踪和失败回滚机制。

## 7.3 未来展望

未来，前后端系统可能进一步向以下方向发展。

第一，业务系统将从“功能菜单型”转向“任务工作台型”。用户不再主要通过菜单查找功能，而是通过待办、提醒、风险、建议和智能助手完成工作。

第二，后端系统将从“接口集合”转向“业务能力平台”。系统能力将以结构化、可授权、可审计、可编排的方式暴露，不仅供前端调用，也供 Agent 和自动化流程调用。

第三，数据系统将从“结果存储”转向“过程沉淀”。业务事件、操作日志、审批意见、会议纪要和用户反馈将成为智能分析和自动化决策的重要基础。

第四，AI Agent 将从“外挂问答工具”转向“业务协同参与者”。Agent 不只是回答问题，而是能够检索上下文、生成方案、调用工具、辅助执行和接受反馈。

第五，可观测性将从技术监控扩展到业务与智能行为监控。系统不仅要监控接口延迟和错误率，还要监控业务流程效率、Agent 工具调用、用户采纳率和知识命中率。

综上所述，CRUD 仍然是前后端系统的基础，但未来具有竞争力的业务系统不会止步于 CRUD。真正有价值的系统，应当能够理解业务过程、沉淀业务知识、支持任务协同，并在可控边界内引入 AI Agent，从而帮助用户更高效、更可靠地完成复杂业务目标。

---

# 参考文献

[1] MDN Web Docs. CRUD Glossary. https://developer.mozilla.org/en-US/docs/Glossary/CRUD

[2] IBM Documentation. Reading and writing records: CRUD functions. https://www.ibm.com/docs/en/rbd/9.7?topic=tasks-reading-writing-records

[3] Roy T. Fielding. Architectural Styles and the Design of Network-based Software Architectures: Chapter 5 REST. https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm

[4] MDN Web Docs. HTTP request methods. https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods

[5] Eric Evans. Domain-Driven Design Reference. https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf

[6] Martin Fowler. Domain-Driven Design. https://martinfowler.com/bliki/DomainDrivenDesign.html

[7] Martin Fowler. Anemic Domain Model. https://martinfowler.com/bliki/AnemicDomainModel.html

[8] Workflow Patterns Initiative. Workflow Patterns. https://www.workflowpatterns.com/

[9] W. M. P. van der Aalst et al. Workflow Patterns. https://www.vdaalst.com/publications/p108.pdf

[10] IBM. What Is Event-Driven Architecture? https://www.ibm.com/think/topics/event-driven-architecture

[11] Martin Fowler. Event Sourcing. https://martinfowler.com/eaaDev/EventSourcing.html

[12] Martin Fowler. CQRS. https://martinfowler.com/bliki/CQRS.html

[13] Patrick Lewis et al. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. https://arxiv.org/abs/2005.11401

[14] Timo Schick et al. Toolformer: Language Models Can Teach Themselves to Use Tools. https://arxiv.org/abs/2302.04761

[15] Shunyu Yao et al. ReAct: Synergizing Reasoning and Acting in Language Models. https://arxiv.org/abs/2210.03629

[16] Lei Wang et al. A Survey on Large Language Model based Autonomous Agents. https://arxiv.org/abs/2308.11432

[17] Nielsen Norman Group. Task Analysis: Support Users in Achieving Their Goals. https://www.nngroup.com/articles/task-analysis/

[18] OpenTelemetry. OpenTelemetry Documentation. https://opentelemetry.io/

[19] Google SRE. Monitoring Distributed Systems. https://sre.google/sre-book/monitoring-distributed-systems/
