import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions
vi.mock("./db", () => ({
  createKnowledgeSession: vi.fn().mockResolvedValue(undefined),
  getSessionById: vi.fn().mockResolvedValue({
    id: 1, userId: 0, title: "Test Session", language: "all", isPublic: true, createdAt: new Date(), updatedAt: new Date()
  }),
  updateSessionTitle: vi.fn().mockResolvedValue(undefined),
  updateSessionPublic: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  createKnowledgeEntry: vi.fn().mockResolvedValue(undefined),
  getSessionEntries: vi.fn().mockResolvedValue([]),
  getPublicEntries: vi.fn().mockResolvedValue([
    { id: 1, sessionId: 1, userId: 0, prompt: "Test", outputType: "text", contentEn: "Test", contentDe: "Test", contentRu: "Test", isPublic: true, createdAt: new Date() }
  ]),
  getPublicSessions: vi.fn().mockResolvedValue([
    { id: 1, userId: 0, title: "Test Session", language: "all", isPublic: true, createdAt: new Date(), updatedAt: new Date() }
  ]),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: `---ENGLISH---
This is a comprehensive English response about the topic. It covers all aspects in great detail.

---GERMAN---
Dies ist eine umfassende deutsche Antwort zum Thema. Sie deckt alle Aspekte detailliert ab.

---RUSSIAN---
Это исчерпывающий русский ответ по теме. Он охватывает все аспекты подробно.`
      }
    }]
  }),
}));

// Mock image generation
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/image.png" }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Prize2Pride — Open-Access Platform (No Auth)", () => {
  it("returns null user for all requests", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("clears session cookie on logout", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("Prize2Pride — Knowledge Router (Fully Public)", () => {
  it("creates a new public knowledge session", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const session = await caller.knowledge.createSession({ title: "Quantum Physics", isPublic: true });
    expect(session).toBeDefined();
    expect(session?.isPublic).toBe(true);
  });

  it("retrieves all public sessions", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const sessions = await caller.knowledge.getSessions();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].isPublic).toBe(true);
  });

  it("generates trilingual knowledge without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.generate({
      sessionId: 1,
      prompt: "Explain quantum entanglement",
      outputType: "text",
      generateImage: false,
    });
    expect(result.contentEn).toContain("English response");
    expect(result.contentDe).toContain("deutsche");
    expect(result.contentRu).toContain("русский ответ");
    expect(result.outputType).toBe("text");
  });

  it("generates scientific paper format (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.generate({
      sessionId: 1,
      prompt: "Photosynthesis mechanisms",
      outputType: "scientific",
      generateImage: false,
    });
    expect(result.contentEn).toBeDefined();
    expect(result.outputType).toBe("scientific");
  });

  it("generates poster format with image (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.generate({
      sessionId: 1,
      prompt: "Climate change",
      outputType: "poster",
      generateImage: true,
    });
    expect(result.imageUrl).toBe("https://example.com/image.png");
  });

  it("retrieves public repository entries without auth", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const entries = await caller.knowledge.getPublicRepository({ limit: 10 });
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });

  it("updates session title (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.updateSessionTitle({ sessionId: 1, title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("toggles session public status (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.toggleSessionPublic({ sessionId: 1, isPublic: true });
    expect(result.success).toBe(true);
  });

  it("deletes a session (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.deleteSession({ sessionId: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Prize2Pride — Trilingual Parser", () => {
  it("correctly parses trilingual response format", () => {
    const raw = `---ENGLISH---
English content here with detailed information.

---GERMAN---
Deutscher Inhalt hier mit detaillierten Informationen.

---RUSSIAN---
Русский контент здесь с подробной информацией.`;

    const enMatch = raw.match(/---ENGLISH---([\s\S]*?)(?=---GERMAN---|---RUSSIAN---|$)/i);
    const deMatch = raw.match(/---GERMAN---([\s\S]*?)(?=---ENGLISH---|---RUSSIAN---|$)/i);
    const ruMatch = raw.match(/---RUSSIAN---([\s\S]*?)(?=---ENGLISH---|---GERMAN---|$)/i);

    expect(enMatch?.[1]?.trim()).toContain("English content");
    expect(deMatch?.[1]?.trim()).toContain("Deutscher Inhalt");
    expect(ruMatch?.[1]?.trim()).toContain("Русский контент");
  });

  it("handles missing language sections gracefully", () => {
    const raw = "Some content without language markers";
    const enMatch = raw.match(/---ENGLISH---([\s\S]*?)(?=---GERMAN---|---RUSSIAN---|$)/i);
    const contentEn = enMatch?.[1]?.trim() ?? raw;
    expect(contentEn).toBe("Some content without language markers");
  });
});
