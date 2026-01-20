产品需求文档 (PRD): Obsidian Synapse

| **版本** | **日期** | **状态** | **撰写人**   |
| -------------- | -------------- | -------------- | ------------------ |
| v0.1           | 2026-01-20     | Draft          | Gemini (协助 User) |

## 1. 产品概述 (Executive Summary)

### 1.1 产品愿景

打造 Obsidian 生态中首款**“行动导向 (Action-Oriented)”**而非单纯“对话导向”的 AI 智能体。它不仅能回答问题，更能通过语音和文字指令，直接对知识库进行检索 (RAG)、操作 (CRUD) 和内容生成，同时摒弃传统的 Sidebar 交互，采用更沉浸的 Spotlight 和 Floating UI 模式。

### 1.2 核心价值主张

* **Flow (心流):** 通过“呼之即来，挥之即去”的 UI 设计，减少写作时的视线跳动。
* **Action (行动):** 通过 Function Calling，让 AI 具备操作文件系统的能力（增删改查）。
* **Capture (捕获):** 通过语音转录，实现随时随地的闪念记录与自动归档。

---

## 2. 用户角色 (User Personas)

* **学术研究员 (The Researcher):** 需要处理大量文献，进行跨文档的知识聚合，并快速翻译/润色内容。
* **知识工作者 (The Power User):** 依赖 Obsidian 管理项目，需要通过自然语言指令快速整理文件结构。
* **移动/灵感型用户 (The Mobile Thinker):** 经常产生闪念，需要通过语音快速记录并自动分类到对应的笔记中。

---

## 3. 功能模块详解 (Functional Requirements)

### 3.1 模块一：全局智能中枢 (The Omni-Bar)

*对应 UI 形态：类 macOS Spotlight / Raycast / Notion AI*

* **功能描述：** 屏幕中央的全局悬浮指令框。
* **触发方式：** 全局快捷键 (如 `Cmd+K` 或 `Cmd+Space`)。
* **核心能力：**
  * **全局对话 (Global Chat):** 与 AI 进行通用对话。
  * **知识库问答 (Vault QA):** 基于 RAG (检索增强生成) 回答关于库中笔记的问题 (e.g., "总结一下我过去关于 LLM Agent 的笔记")。
  * **指令执行 (Command Execution):** 识别自然语言意图并调用 Obsidian API (e.g., "新建一个名为 'PRD Draft' 的笔记，并放入 Projects 文件夹")。
* **交互细节：**
  * 支持**语音输入**按钮。
  * 结果展示支持 **卡片式 (Result Card)** ，而非单纯文本流。
  * 按 `Esc` 立即关闭，按 `Enter` 插入结果或执行操作。

### 3.2 模块二：沉浸式编辑助手 (The Floating Bubble)

*对应 UI 形态：类 Medium / Notion 选中文本后的浮窗*

* **功能描述：** 基于当前选中文本 (Selection Context) 的微型操作栏。
* **触发方式：** 鼠标选中文本后自动悬浮 icon，或快捷键触发。
* **核心能力：**
  * **智能润色：** 翻译、扩写、精简、纠错、改变语气。
  * **内容插入：** 生成的内容以 **Diff View (差异视图)** 或 **Ghost Text (灰色幽灵字)** 形式展示。
  * **一键采纳：** 接受修改 (Replace) 或 追加 (Append)。

### 3.3 模块三：语音与自动化 (Voice & Auto-Filing)

*对应场景：闪念胶囊 / 语音指令*

* **功能描述：** 高精度语音转录配合意图识别。
* **技术支撑：** Whisper (ASR) + LLM Intent Classification。
* **核心流程：**
  1. 用户按下语音键说话："把这个想法记录到今天的日记里，标记为 todo。"
  2. 插件转录文本。
  3. 插件分析意图 -> 识别目标文件 (`Daily Note`) -> 识别操作 (`Append`) -> 识别格式 (`- [ ] content`).
  4. 后台静默执行，并在 Omni-Bar 提示“已保存”。

### 3.4 模块四：知识库管理 Agent (The Vault Manager)

*对应能力：增删改查*

* **功能描述：** AI 具备文件系统级操作权限。
* **支持操作：** `Create`, `Rename`, `Move`, `Append`, `Read`, `List Directory`.
* **安全机制 (Safety Guardrails):**
  * **Human-in-the-loop:** 涉及修改或删除现有内容的操作，必须弹出  **Diff 确认框** 。
  * **Undo Stack:** 所有 AI 操作必须可撤销 (Ctrl+Z)。
  * **禁止项:** 初始版本禁止 AI 物理删除文件 (只能移动到 `Trash` 或 `Archive` 文件夹)。

---

## 4. 非功能性需求 (Non-Functional Requirements)

### 4.1 性能与响应

* **Omni-Bar 启动速度:** < 200ms。
* **语音转录延迟:** 若使用 Cloud Whisper，目标 < 2s；若本地，取决于硬件。
* **RAG 检索速度:** 千篇笔记库规模下，检索耗时 < 1s。

### 4.2 隐私与模型

* **模型灵活性:** 必须支持自定义 Base URL 和 API Key (OpenAI, Anthropic, DeepSeek)。
* **本地优先:** 必须支持对接 Ollama (针对本地 LLM 用户)。
* **索引存储:** 向量索引 (Vector Index) 必须存储在用户本地库的 `.obsidian/plugins/synapse/` 目录下，严禁上传云端。

---

## 5. UI/UX 设计规范 (Design Guidelines)

* **视觉风格:** 极简主义，适配 Obsidian 当前主题 (跟随 Light/Dark 模式)。
* **去噪:** 尽量减少常驻 UI 元素。没有 Sidebar，没有底部状态栏常驻图标，只有在需要时才出现。
* **动画:** 使用流畅的微交互（如语音输入的波纹动画、思考时的脉冲效果）来掩盖 LLM 的延迟感。

---

## 6. 开发路线图 (Roadmap)

### Phase 1: MVP (The "Smart Spotlight")

* 实现 Omni-Bar UI (Spotlight 风格)。
* 实现基础 LLM 对话功能。
* 实现 Floating Bubble 划词翻译/润色功能。

### Phase 2: Knowledge (The "Brain")

* 集成 RAG 引擎 (Voy + Transformers.js)。
* 实现“Chat with Vault”功能（只读模式）。

### Phase 3: Action & Voice (The "Agent")

* 集成 Whisper 语音转录。
* 实现 Function Calling 框架。
* 实现基础文件操作 (Create, Append)。
* 上线 Diff 确认安全机制。

---

## 7. 附录：技术栈选型对比 (Appendix: Tech Stack Comparison)

### 7.1 前端 UI 框架 (The View Layer)

*挑战：Omni-Bar 和 Floating Bubble 需要复杂的状态管理（对话历史、流式输出、Diff 视图）。*

| **特性**            | **Option A: Svelte (推荐)**                                                        | **Option B: React**                                   | **Option C: Vanilla JS / Native**                    |
| ------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| **描述**            | 编译型框架，无虚拟 DOM，生成的代码极小。                                                 | 工业界标准，生态最丰富，但对插件来说略重。                  | 直接操作 DOM，使用 Obsidian 原生 API。                     |
| **开发体验**        | ⭐⭐⭐⭐⭐``写起来像 HTML/JS，非常适合个人开发者快速构建。                        | ⭐⭐⭐⭐``组件库多，但配置 Webpack/Vite 较繁琐。     | ⭐⭐``状态管理极其痛苦，手写 DOM 操作容易产生 Bug。 |
| **性能**            | **极高** 。Bundle 体积小，启动快。                                                 | 中等。React Runtime 会增加插件体积。                        | 高。无额外开销。                                           |
| **Obsidian 适配性** | **完美** 。目前大多数现代且复杂的 Obsidian 插件（如 Image Toolkit）都转向 Svelte。 | 良好。Obsidian 官方部分 UI 基于 React，但这不影响插件选型。 | 原生。适合极简插件，不适合本项目的复杂 UI。                |
| **结论**            | **Winner** 。兼顾开发效率与运行性能。                                              | 备选。如果您已经是 React 专家，也可以用。                   | 不推荐。维护成本太高。                                     |

### 7.2 向量数据库与 RAG (The Memory Layer)

*挑战：在用户本地（Electron 环境）高效进行向量存储与检索，不依赖外部 Python 服务。*

| **特性**     | **Option A: Voy (基于 WASM)**                | **Option B: Orama**                                 | **Option C: LangChain.js (MemoryVectorStore)** |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| **原理**     | 专为浏览器设计的 Rust -> WASM 向量数据库。         | 全文搜索引擎，支持混合检索（Hybrid Search）。             | 纯 JS 数组存储，无持久化优化。                       |
| **检索速度** | **极快** 。底层是 Rust，适合 10k+ 笔记规模。 | 快。擅长关键词+语义混合检索。                             | 慢。笔记多了会卡顿。                                 |
| **依赖性**   | 需要处理 WASM 加载，但现有 Obsidian 插件有先例。   | 纯 JS 生态，集成最简单。                                  | 简单，适合原型。                                     |
| **持久化**   | 支持序列化到 IndexedDB 或本地文件。                | 支持。                                                    | 较差，通常需要每次启动重新加载。                     |
| **结论**     | **Winner (性能派)** 。如果追求极致速度。     | **Winner (平衡派)** 。如果需要关键词+向量混合检索。 | 仅用于 MVP 验证。                                    |

### 7.3 语音识别 ASR (The Hearing Layer)

*挑战：在准确率、隐私和延迟之间做权衡。*

| **特性**     | **Option A: OpenAI Whisper API (Cloud)** | **Option B: Whisper.wasm (Local)**                 | **Option C: Local Server Bridge (Python)** |
| ------------------ | ---------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| **准确率**   | ⭐⭐⭐⭐⭐ (极致)                              | ⭐⭐⭐ (一般，受限于模型大小)                            | ⭐⭐⭐⭐⭐ (取决于本地显卡)                      |
| **隐私**     | 数据需上传。                                   | **100% 本地** 。                                   | **100% 本地** 。                           |
| **资源消耗** | 极低（仅网络请求）。                           | **高** 。会占用用户 CPU/内存，导致 Obsidian 卡顿。 | 高，但与 Obsidian 进程分离。                     |
| **实现难度** | 简单。                                         | 困难。需要管理 WASM 资源包（几百 MB）。                  | 中等。需要用户懂配置 Python 环境。               |
| **结论**     | **推荐默认项** 。用户体验最好。          | 备选。作为“隐私模式”的高级选项。                       | **极客选项** （见下文架构分析）。          |

---

### 7.4 关键架构决策：纯插件 vs. CS 架构

这是作为开发者最重要的决策。鉴于您的背景，您可能会倾向于 Python，但 Obsidian 插件必须是 JS。

#### 架构一：Pure Plugin (纯插件模式) - **大众商业化路线**

* **技术栈：** TS + Svelte + OpenAI API + Voy (WASM)。
* **优点：** 用户 **开箱即用** ，安装插件即可，无需配置环境。
* **缺点：** 严重依赖 API Key，本地模型能力受限于浏览器环境（无法跑 70B 模型）。
* **适用：** 发布到 Obsidian Community list，给普通用户使用。

#### 架构二：Client-Server Bridge (极客路线) - **您的个人/科研路线**

* **技术栈：**
  * **Server (Python):** FastAPI + PyTorch/HuggingFace (跑本地 LLM/Whisper/ChromaDB)。
  * **Client (Obsidian Plugin):** 仅负责 UI 和发 HTTP 请求给 `localhost:8000`。
* **优点：** 可以利用 **最强大的 Python 生态** （更强的 RAG 切分算法、本地大模型、复杂的 Agent 逻辑）。
* **缺点：**  **分发困难** 。普通用户不会安装 Python 依赖。
* **适用：** 您自己使用，或者面向开发者群体。

---

### 💡 最终方案 (The "Synapse" Stack)

为了让产品既具有强大的功能，又具备良好的分发性（能上架商店），我建议采用 **"Hybrid (混合)"** 策略：

1. **Frontend:** **TypeScript + Svelte** (保证 UI 开发效率和性能)。
2. **Core Logic:** 使用 **LangChain.js** 处理链式调用。
3. **Local RAG:** 使用 **Voy** (WASM) + **Transformers.js** (运行量化版的 `all-MiniLM-L6-v2` embedding 模型，约 40MB，可在插件内跑)。
4. **LLM/ASR:**
   * **默认：** 调用 OpenAI/Anthropic API (云端)。
   * **进阶：** 允许用户填入 `Localhost` 地址，对接 **Ollama** 或 **LM Studio** (这样您既不需要维护 Python 后端，又能让硬核用户用上本地模型)。
