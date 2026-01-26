[English](README.md) | [中文](README_zh.md)

# Obsidian Synapse 🧠

**Synapse** 是一款集成在 [Obsidian](https://obsidian.md) 中的强大 AI 助手。它将上下文感知的 AI 能力直接带到您的光标处，弥合了您的思维与知识库之间的鸿沟。

![Synapse Demo](https://via.placeholder.com/800x400?text=Obsidian+Synapse+Demo)

## ✨ 主要功能

### 1. 🫧 上下文感知悬浮球 (Floating Bubble)
选中编辑器中的任意文本即可触发 **悬浮球**。它提供即时的 AI 操作，而不会打断您的心流：

*   **✨ 润色 (Polish)**：提高写作的清晰度、流畅度和简洁性。
*   **🌐 翻译 (Translate)**：在您配置的语言之间进行智能双向翻译（例如：英语 ↔ 中文）。
*   **📝 摘要 (Summarize)**：获取长段落的一句话摘要。

**🛡️ 安全第一：** Synapse 对所有文本修改使用 **预览模式 (Preview Mode)**。
*   **预览 (Preview)**：在修改您的笔记之前先查看 AI 的建议。
*   **替换 (Replace)**：覆盖选中的文本。
*   **追加 (Append)**：将结果添加到选中内容之后。
*   **丢弃 (Discard)**：不喜欢？直接点击丢弃。

### 2. ⚡ Synapse 全能栏 (Omni-Bar)
按 `Cmd+Shift+Space`（或您配置的热键）打开 **全能栏**。
*   **与 AI 对话**：即时提问、头脑风暴或起草内容。
*   **流式响应**：在 AI 思考时获取实时反馈。
*   **键盘优先**：专为速度设计——双手无需离开键盘。

### 3. ⚙️ 灵活的 AI 配置文件
*   **多提供商支持**：配置多个 AI 配置文件（例如，“工作 API”、“个人 API”）。
*   **模型支持**：兼容 OpenAI 的最新模型，包括 **GPT-4o** 和 **O 系列 (o1, o4-mini)**，并支持自动参数适配。
*   **自定义**：为每个配置文件设置独特的系统提示词和默认模型。

### 4. 🌍 智能翻译
*   **双向支持**：在设置中配置您的首选语言对（例如，日语 ↔ 英语）。
*   **自动检测**：“翻译”操作会自动检测源语言并将其翻译成您的目标语言。

## 🚀 安装

### 手动安装
1.  从最新的 [Release](https://github.com/your-repo/synapse/releases) 下载 `main.js`、`manifest.json` 和 `styles.css` 文件。
2.  在您的仓库插件目录中创建一个名为 `obsidian-synapse` 的文件夹：`.obsidian/plugins/obsidian-synapse/`。
3.  将下载的文件放入该文件夹中。
4.  重新加载 Obsidian，转到 **设置 > 第三方插件 (Community Plugins)**，并启用 **Synapse**。

### 开发构建
1.  克隆此仓库。
2.  运行 `npm install` 安装依赖项。
3.  运行 `npm run build` 构建插件。
4.  将输出文件复制到您的 Obsidian 插件文件夹（如果已配置，也可以使用提供的 `scripts/deploy.mjs`）。

## 🛠️ 配置

1.  打开 **Obsidian 设置 > Synapse**。
2.  **提供商 (Providers)**：点击“创建新配置文件 (Create New Profile)”以添加您的 OpenAI API 密钥。
3.  **激活配置文件 (Active Profile)**：选择默认使用的配置文件。
4.  **翻译对 (Translation Pair)**：选择“翻译”操作的主要语言（默认：英语 ↔ 中文）。

## 🗺️ 路线图与进展

### ✅ 已完成功能 (v0.1.0)
- **核心架构**：健壮的依赖注入 (DI) 系统、事件总线和内部服务管理。
- **上下文感知悬浮球**：
    - “润色”、“翻译”和“摘要”操作。
    - **流式打字机效果**：实时视觉反馈。
    - **安全防护预览**：应用更改前进行审核。
- **下一代全能栏**：
    - **非阻塞窗口**：工作时保持打开的悬浮助手。
    - **对话历史**：自动保存对话、切换会话和清除历史记录。
    - **快速控制**：从页脚即时切换 AI 模型/提供商。
- **智能翻译**：用于自动检测翻译的双下拉语言选择。

### 🚧 进行中 / 计划中
- **本地 LLM 支持**：连接到 Ollama/LM Studio。
- **提示词库**：创建并分享自定义系统提示词。
- **上下文感知**：在聊天中自动“查看”当前文件内容的能力。
- **斜杠命令**：`/image`、`/table` 和更多高级编辑命令。

## 🤝 贡献
欢迎贡献！请随意提交 Pull Request。

## 📄 许可证

MIT License
