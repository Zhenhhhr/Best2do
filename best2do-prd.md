# Best2do — 产品需求文档 (PRD)

**版本**：v1.0  
**更新日期**：2026-04-20  
**产品定位**：PC 端 AI 驱动的每日工作管理与自我迭代工具

---

## 一、产品概述

Best2do 是一款面向职场人的 PC 端效率工具。核心价值：AI 充当「执行教练」，每天帮你排优先级、拆任务，每周帮你照镜子、找短板。

**目标用户**：产品经理、项目经理、研发 TL 等需要管理多项目并行的知识工作者。

**核心差异**：
- 不是待办清单，而是基于 Timeboxing 的智能日程编排
- 不是笔记本，而是基于岗位角色的周期复盘引擎
- AI 不替代判断，AI 放大洞察

---

## 二、信息架构

```
Best2do
├── 左侧导航栏（固定）
│   ├── 今日（首页）
│   ├── 项目
│   ├── 复盘
│   └── Knowhow
├── 顶部栏
│   ├── 日期显示
│   ├── 角色配置入口
│   └── 设置（API Key）
└── 主内容区（随 Tab 切换）
```

---

## 三、功能规格

### 3.1 【今日】Tab — 首页

#### 3.1.1 多模态输入区

| 属性 | 说明 |
|------|------|
| 输入方式 | 文本输入 + 文件拖拽/选择 |
| 支持格式 | 纯文本、PDF、Word(.docx)、Excel(.xlsx)、图片(jpg/png) |
| 处理逻辑 | 文本直接传入；文件转 base64 通过多模态 API 解析内容 |
| 交互 | 输入后点击「添加到今日」或回车提交 |

#### 3.1.2 今日日程表

| 列字段 | 类型 | 说明 |
|--------|------|------|
| 项目 | 下拉关联 | 关联【项目】Tab 中的项目 |
| 事项 | 文本 | 具体任务描述 |
| 紧急度 | 枚举 | 紧急/重要/普通 |
| 完成时限 | 时间 | HH:MM 格式 |
| 完成情况 | 枚举 | 未开始/进行中/已完成/延期 |

#### 3.1.3 AI 日程生成（链路 1）

**触发条件**：
- 每日 9:00 自动提示（浏览器通知）
- 用户手动点击「生成今日计划」按钮

**输入上下文**：
- 用户今日输入的事项列表
- 已有项目列表及 OKR 进度
- 历史完成率数据（近 7 天）
- Timeboxing 时间管理原则

**输出**：
- 排序后的今日日程表（按优先级 + 时间块分配）
- 3-5 条执行建议（可展开查看拆解步骤）

---

### 3.2 【项目】Tab

#### 3.2.1 项目卡片

| 字段 | 类型 | 说明 |
|------|------|------|
| 项目名称 | 文本 | 必填 |
| OKR | 结构体 | Objective + 1-3 个 Key Results |
| 进度 | 百分比 | 0-100%，由 KR 完成度加权计算 |
| 风险 | 枚举 | 低/中/高，附风险描述 |
| 截止日期 | 日期 | 项目 deadline |
| 里程碑 | 列表 | 名称 + 日期 + 状态 |
| 状态 | 枚举 | 进行中/已完成/暂停 |

#### 3.2.2 AI 智能导入项目

| 属性 | 说明 |
|------|------|
| 输入方式 | 文本粘贴 + 文件上传（PDF/Word/Excel/图片/纯文本） |
| 解析逻辑 | 调用通义千问解析输入内容，自动提取项目名称、目标、KR、风险等级、截止日期 |
| 图片处理 | 使用 qwen-vl-max 多模态模型 OCR 提取文字后再解析 |
| 多项目支持 | 一次输入可解析出多个项目，逐个弹窗确认 |
| 缺失字段提示 | AI 无法识别的字段以橙色高亮标注，提示用户手动补充 |
| 交互流程 | 解析完成后自动打开项目编辑弹窗，预填 AI 解析结果，用户确认/修改后保存 |

#### 3.2.3 项目与今日联动规则

联动由 AI 判断，规则如下：
1. 今日日程中标记「已完成」的事项，AI 评估其对关联项目 KR 的贡献，自动建议更新进度
2. 项目截止日期临近（<=3天）时，AI 在今日日程中自动标注紧急度
3. 高风险项目的相关事项在日程中自动提升优先级

---

### 3.3 【复盘】Tab（链路 2）

#### 3.3.1 复盘周期

| 粒度 | 数据范围 | 触发方式 |
|------|----------|----------|
| 日复盘 | 当日日程完成数据 | 每日 18:00 提示 / 手动 |
| 周复盘 | 本周一至今的全部数据 | 每周五 17:00 提示 / 手动 |

#### 3.3.2 角色配置

- 默认角色：产品经理
- 支持切换：研发工程师、设计师、项目经理、运营等
- 角色影响：复盘分析的评估维度和问题指向

#### 3.3.3 AI 复盘报告

**输出结构**：
1. **完成率统计**：计划事项数 / 完成数 / 延期数
2. **时间偏差分析**：实际完成时间 vs 计划时限的偏差分布
3. **核心决策分析**：本周期最重要的 3 个决策及其质量评估
4. **问题诊断**：基于岗位角色指出 2-3 个核心问题
5. **优化方向**：针对每个问题给出具体改进建议
6. **Knowhow 提炼**：从本次复盘中提炼 1-2 条方法论

#### 3.3.4 导出功能

- **日报导出**：Markdown 格式，包含今日完成事项 + AI 评价
- **周报导出**：Markdown 格式，包含本周数据总览 + 复盘报告 + Knowhow
- 支持浏览器打印为 PDF

---

### 3.4 【Knowhow】Tab

| 字段 | 类型 | 说明 |
|------|------|------|
| 标题 | 文本 | 方法论名称 |
| 内容 | 富文本 | 详细描述 |
| 来源 | 枚举 | AI 提炼 / 手动添加 |
| 关联项目 | 引用 | 来源项目 |
| 创建日期 | 日期 | 自动生成 |
| 标签 | 多选 | 自定义标签分类 |

支持：搜索、按标签筛选、编辑、删除、导出为 Markdown。

---

## 四、数据模型

### 4.1 核心数据结构

```javascript
// 今日事项
interface TodoItem {
  id: string;
  projectId: string | null;    // 关联项目
  content: string;             // 事项描述
  urgency: 'urgent' | 'important' | 'normal';
  deadline: string;            // HH:MM
  status: 'pending' | 'in_progress' | 'done' | 'delayed';
  aiSuggestions: string[];     // AI 拆解建议
  createdAt: string;           // ISO 日期
  completedAt: string | null;
}

// 项目
interface Project {
  id: string;
  name: string;
  objective: string;           // OKR - O
  keyResults: KeyResult[];     // OKR - KRs
  risk: 'low' | 'medium' | 'high';
  riskDesc: string;
  deadline: string;            // ISO 日期
  milestones: Milestone[];
  status: 'active' | 'done' | 'paused';
  createdAt: string;
}

interface KeyResult {
  id: string;
  content: string;
  progress: number;            // 0-100
}

interface Milestone {
  id: string;
  name: string;
  date: string;
  done: boolean;
}

// 复盘记录
interface Review {
  id: string;
  type: 'daily' | 'weekly';
  date: string;
  role: string;                // 角色
  completionRate: number;
  totalItems: number;
  completedItems: number;
  delayedItems: number;
  report: string;              // AI 生成的复盘报告（Markdown）
  knowhowIds: string[];        // 提炼的 Knowhow
}

// Knowhow
interface Knowhow {
  id: string;
  title: string;
  content: string;
  source: 'ai' | 'manual';
  projectId: string | null;
  tags: string[];
  createdAt: string;
}
```

### 4.2 存储方案

Demo 阶段使用 `localStorage`，Key 结构：

| Key | 内容 |
|-----|------|
| `best2do_todos` | TodoItem[] — 按日期分组 |
| `best2do_projects` | Project[] |
| `best2do_reviews` | Review[] |
| `best2do_knowhow` | Knowhow[] |
| `best2do_settings` | { apiKey, role, ... } |

---

## 五、AI Prompt 设计

### 5.1 日程生成 System Prompt

```
你是 Best2do 的 AI 执行教练。你的任务是根据用户输入的工作事项，结合已有项目和 Timeboxing 时间管理原则，为用户生成今日最优工作日程。

## Timeboxing 原则
1. 每个任务分配固定时间块（30min/60min/90min），不允许无限期延伸
2. 高认知负荷任务安排在上午 9:00-12:00 黄金时段
3. 会议和协作类任务集中安排，减少上下文切换
4. 每 90 分钟安排 10-15 分钟休息缓冲
5. 预留 20% 时间应对突发紧急事项
6. 同一项目的子任务尽量连续排列

## 用户角色
{role}

## 已有项目上下文
{projects_json}

## 历史完成率
近 7 天平均完成率：{completion_rate}%
常见延期类型：{delay_patterns}

## 输出要求
请以 JSON 格式输出：
{
  "schedule": [
    {
      "time": "09:00-10:30",
      "project": "项目名",
      "task": "具体事项",
      "urgency": "urgent|important|normal",
      "tips": "执行建议"
    }
  ],
  "suggestions": ["建议1", "建议2", "建议3"]
}
```

### 5.2 复盘分析 System Prompt

```
你是 Best2do 的复盘分析师。你需要根据用户的工作完成数据，以{role}的视角进行深度复盘分析。

## 复盘框架
1. 完成率统计：量化本周期工作产出
2. 时间偏差分析：找出时间管理的系统性问题
3. 核心决策回顾：评估关键决策的质量
4. 问题诊断：基于{role}岗位能力模型，指出短板
5. 优化方向：给出可执行的改进路径
6. Knowhow 提炼：总结可复用的方法论

## {role}能力模型
- 产品经理：需求洞察、优先级判断、跨团队协调、数据驱动决策、用户同理心
- 研发工程师：技术方案设计、代码质量、交付效率、系统思维、技术债管理
- 设计师：用户体验、视觉表达、设计系统、可用性测试、设计协作
- 项目经理：进度把控、风险管理、资源协调、沟通效率、问题升级

## 本周期数据
{period_data_json}

## 输出要求
请以 Markdown 格式输出复盘报告，包含上述 6 个部分。
最后单独输出 knowhow 字段（JSON），格式：
{
  "knowhow": [
    { "title": "方法论名称", "content": "详细描述", "tags": ["标签"] }
  ]
}
```

---

## 六、API 接入规格

### 6.1 阿里云百炼（通义千问）

| 参数 | 值 |
|------|------|
| Base URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 模型 | `qwen-max`（精度优先）/ `qwen-turbo`（速度优先） |
| 协议 | OpenAI 兼容格式 |
| 认证 | `Authorization: Bearer {API_KEY}` |

### 6.2 请求格式

```javascript
const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'qwen-max',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 4096
  })
});
```

### 6.3 多模态支持（图片/文档解析）

对于图片输入，使用 `qwen-vl-max` 模型，消息格式：

```javascript
{
  role: 'user',
  content: [
    { type: 'text', text: '请解析这张图片中的工作事项' },
    { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } }
  ]
}
```

---

## 七、非功能性要求

| 维度 | 要求 |
|------|------|
| 响应速度 | AI 生成日程 < 10s，复盘报告 < 15s |
| 数据安全 | Demo 阶段数据仅存本地，API Key 不上传服务器 |
| 浏览器兼容 | Chrome 90+, Edge 90+, Safari 15+ |
| 离线能力 | 除 AI 功能外，其余功能可离线使用 |
