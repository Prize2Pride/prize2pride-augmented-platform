import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions
vi.mock("./db", () => ({
  createKnowledgeSession: vi.fn().mockResolvedValue(undefined),
  getUserSessions: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, title: "Test Session", language: "all", isPublic: false, createdAt: new Date(), updatedAt: new Date() }
  ]),
  getSessionById: vi.fn().mockResolvedValue({
    id: 1, userId: 1, title: "Test Session", language: "all", isPublic: false, createdAt: new Date(), updatedAt: new Date()
  }),
  updateSessionTitle: vi.fn().mockResolvedValue(undefined),
  updateSessionPublic: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  createKnowledgeEntry: vi.fn().mockResolvedValue(undefined),
  getSessionEntries: vi.fn().mockResolvedValue([]),
  getPublicEntries: vi.fn().mockResolvedValue([]),
  getPublicSessions: vi.fn().mockResolvedValue([]),
  updateUserAvatar: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
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

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-123",
      email: "test@prize2pride.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      cityAvatar: "london",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Prize2Pride — Auth Router", () => {
  it("returns null user for unauthenticated requests", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user object for authenticated requests", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Test User");
    expect(user?.email).toBe("test@prize2pride.com");
  });

  it("clears session cookie on logout", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });

  it("updates city avatar for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.updateAvatar({ cityAvatar: "berlin" });
    expect(result.success).toBe(true);
  });
});

describe("Prize2Pride — Knowledge Router", () => {
  it("creates a new knowledge session", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const session = await caller.knowledge.createSession({ title: "Quantum Physics", isPublic: false });
    // Session is the first item from getUserSessions mock
    expect(session).toBeDefined();
    expect(session?.id).toBe(1);
  });

  it("retrieves user sessions", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const sessions = await caller.knowledge.getSessions();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].title).toBe("Test Session");
  });

  it("generates trilingual knowledge with correct structure", async () => {
    const ctx = createAuthContext();
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

  it("generates scientific paper format", async () => {
    const ctx = createAuthContext();
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

  it("generates poster format with image", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.generate({
      sessionId: 1,
      prompt: "Climate change",
      outputType: "poster",
      generateImage: true,
    });
    expect(result.imageUrl).toBe("https://example.com/image.png");
  });

  it("retrieves public repository entries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const entries = await caller.knowledge.getPublicRepository({ limit: 10 });
    expect(Array.isArray(entries)).toBe(true);
  });

  it("updates session title", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.updateSessionTitle({ sessionId: 1, title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("toggles session public status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.toggleSessionPublic({ sessionId: 1, isPublic: true });
    expect(result.success).toBe(true);
  });

  it("deletes a session", async () => {
    const ctx = createAuthContext();
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

    // Test the parsing logic directly
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
    // Falls back to raw content
    const contentEn = enMatch?.[1]?.trim() ?? raw;
    expect(contentEn).toBe("Some content without language markers");
  });
});
