[English](README.md) | [中文](README_zh.md)

# Obsidian Synapse 🧠

**Synapse** is a powerful AI assistant integrated directly into [Obsidian](https://obsidian.md). It bridges the gap between your thoughts and your knowledge base by bringing context-aware AI capabilities right to your cursor.

![Synapse Demo](https://via.placeholder.com/800x400?text=Obsidian+Synapse+Demo)

## ✨ Key Features

### 1. 🫧 Context-Aware Floating Bubble
Select any text in your editor to trigger the **Floating Bubble**. It offers instant AI actions without breaking your flow:

*   **✨ Polish**: Improve clarity, flow, and conciseness of your writing.
*   **🌐 Translate**: Intelligent bidirectional translation between your configured languages (e.g., English ↔ Chinese).
*   **📝 Summarize**: Get a one-sentence summary of long paragraphs.

**🛡️ Safety First:** Synapse uses a **Preview Mode** for all text modifications.
*   **Preview**: See the AI's suggestion before it touches your note.
*   **Replace**: Overwrite the selected text.
*   **Append**: Add the result after your selection.
*   **Discard**: Don't like it? Just click discard.

### 2. ⚡ Synapse Omni-Bar
Press `Cmd+Shift+Space` (or your configured hotkey) to open the **Omni-Bar**.
*   **Chat with AI**: Ask questions, brainstorm ideas, or draft content instantly.
*   **Streamed Responses**: Get real-time feedback as the AI thinks.
*   **Keyboard First**: Designed for speed—keep your hands on the keyboard.

### 3. ⚙️ Flexible AI Profiles
*   **Multi-Provider Support**: Configure multiple AI profiles (e.g., "Work API", "Personal API").
*   **Model Support**: Compatible with OpenAI's latest models, including **GPT-4o** and the **O-series (o1, o4-mini)** with automatic parameter adaptation.
*   **Customization**: Set unique system prompts and default models for each profile.

### 4. 🌍 Smart Translation
*   **Bidirectional Support**: Configure your preferred language pair (e.g., Japanese ↔ English) in settings.
*   **Auto-Detection**: The "Translate" action automatically detects the source language and translates it to your target.

## 🚀 Installation

### Manual Installation
1.  Download the `main.js`, `manifest.json`, and `styles.css` files from the latest [Release](https://github.com/your-repo/synapse/releases).
2.  Create a folder named `obsidian-synapse` in your vault's plugin directory: `.obsidian/plugins/obsidian-synapse/`.
3.  Place the downloaded files into that folder.
4.  Reload Obsidian, go to **Settings > Community Plugins**, and enable **Synapse**.

### Development Build
1.  Clone this repository.
2.  Run `npm install` to install dependencies.
3.  Run `npm run build` to build the plugin.
4.  Copy the output files to your Obsidian plugin folder (or use the provided `scripts/deploy.mjs` if configured).

## 🛠️ Configuration

1.  Open **Obsidian Settings > Synapse**.
2.  **Providers**: Click "Create New Profile" to add your OpenAI API Key.
3.  **Active Profile**: Select which profile to use by default.
4.  **Translation Pair**: Choose your primary languages for the Translate action (default: English ↔ Chinese).

## 🗺️ Roadmap & Progress

### ✅ Completed Features (v0.1.0)
- **Core Architecture**: Robust DI system, Event Bus, and internal service management.
- **Context-Aware Floating Bubble**:
    - "Polish", "Translate", and "Summarize" actions.
    - **Streaming Typewriter Effect**: Real-time visual feedback.
    - **Safe-Guard Preview**: Review changes before applying them.
- **Next-Gen Omni-Bar**:
    - **Non-blocking Window**: Floating assistant that stays open while you work.
    - **Chat History**: Auto-save conversations, switch sessions, and clear history.
    - **Quick Controls**: Switch AI Models/Providers instantly from the footer.
- **Smart Translation**: Dual-dropdown language selection for auto-detect translation.

### 🚧 Works in Progress / Planned
- **Local LLM Support**: Connect to Ollama/LM Studio.
- **Prompt Library**: Create and share custom system prompts.
- **Context Awareness**: Ability to "See" the current file content automatically in Chat.
- **Slash Commands**: `/image`, `/table`, and more advanced editing commands.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License
