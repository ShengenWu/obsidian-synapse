import { Plugin } from "obsidian";
import { singleton } from "tsyringe";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryData {
  sessions: ChatSession[];
  activeSessionId: string | null;
}

@singleton()
export class HistoryService {
  private plugin: Plugin;
  private data: HistoryData = {
    sessions: [],
    activeSessionId: null
  };

  constructor() { }

  public async initialize(plugin: Plugin) {
    this.plugin = plugin;
    await this.loadData();

    // Ensure at least one session exists or restore last state
    if (this.data.sessions.length === 0) {
      await this.createSession();
    } else if (!this.data.activeSessionId || !this.getSession(this.data.activeSessionId)) {
      // If active session is invalid (e.g. deleted), set to most recent
      this.data.activeSessionId = this.data.sessions[0].id;
      await this.saveData();
    }
  }

  private async loadData() {
    const loaded = await this.plugin.loadData();
    if (loaded && loaded.history) {
      this.data = loaded.history;
    }
  }

  private async saveData() {
    // We need to merge with existing settings/data to not overwrite other plugin data
    // Ideally SettingsManager handles all data, but for Separation of Concerns, 
    // we can read-modify-write or assume we are the only writer to 'history' key if we use a specific key structure.
    // However, plugin.saveData() overwrites everything.
    // IMPORTANT: To work safely with SettingsManager, we should probably coordinate or simply load-modify-save fully.

    // Safer: Load fresh, update history key, save.
    const currentData = await this.plugin.loadData() || {};
    currentData.history = this.data;
    await this.plugin.saveData(currentData);
  }

  public getSessions(): ChatSession[] {
    // Sort by updatedAt desc
    return this.data.sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getSession(id: string): ChatSession | undefined {
    return this.data.sessions.find(s => s.id === id);
  }

  public getActiveSession(): ChatSession | null {
    if (!this.data.activeSessionId) return null;
    return this.getSession(this.data.activeSessionId) || null;
  }

  public async createSession(title: string = "New Chat"): Promise<ChatSession> {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.data.sessions.unshift(newSession);
    this.data.activeSessionId = newSession.id;
    await this.saveData();
    return newSession;
  }

  public async setActiveSession(id: string) {
    if (this.getSession(id)) {
      this.data.activeSessionId = id;
      await this.saveData();
    }
  }

  public async deleteSession(id: string) {
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    if (this.data.activeSessionId === id) {
      // Fallback to first available or create new
      this.data.activeSessionId = this.data.sessions.length > 0 ? this.data.sessions[0].id : null;
      if (!this.data.activeSessionId) {
        await this.createSession();
      }
    }
    await this.saveData();
  }

  public async addMessage(sessionId: string, role: "user" | "assistant" | "system", content: string) {
    const session = this.getSession(sessionId);
    if (session) {
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: Date.now()
      };
      session.messages.push(msg);
      session.updatedAt = Date.now();

      // Auto-update title if it's the first user message and title is default
      if (role === "user" && session.messages.filter(m => m.role === "user").length === 1 && session.title === "New Chat") {
        session.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
      }

      await this.saveData();
      return msg;
    }
  }

  public async updateMessageContent(sessionId: string, messageId: string, newContent: string) {
    const session = this.getSession(sessionId);
    if (session) {
      const msg = session.messages.find(m => m.id === messageId);
      if (msg) {
        msg.content = newContent;
        session.updatedAt = Date.now();
        await this.saveData();
      }
    }
  }
}
