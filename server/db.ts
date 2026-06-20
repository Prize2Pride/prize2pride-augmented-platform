import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, knowledgeSessions, knowledgeEntries, KnowledgeSession, KnowledgeEntry } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserAvatar(userId: number, cityAvatar: "berlin" | "moscow" | "london") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ cityAvatar }).where(eq(users.id, userId));
}

// Knowledge Sessions
export async function createKnowledgeSession(userId: number, title: string, isPublic = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(knowledgeSessions).values({ userId, title, isPublic, language: "all" });
  return result[0];
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeSessions).where(eq(knowledgeSessions.userId, userId)).orderBy(desc(knowledgeSessions.updatedAt)).limit(50);
}

export async function getSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(knowledgeSessions).where(eq(knowledgeSessions.id, sessionId)).limit(1);
  return result[0];
}

export async function updateSessionTitle(sessionId: number, title: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(knowledgeSessions).set({ title }).where(eq(knowledgeSessions.id, sessionId));
}

export async function updateSessionPublic(sessionId: number, isPublic: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(knowledgeSessions).set({ isPublic }).where(eq(knowledgeSessions.id, sessionId));
}

export async function deleteSession(sessionId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(knowledgeEntries).where(eq(knowledgeEntries.sessionId, sessionId));
  await db.delete(knowledgeSessions).where(eq(knowledgeSessions.id, sessionId));
}

// Knowledge Entries
export async function createKnowledgeEntry(data: {
  sessionId: number;
  userId: number;
  prompt: string;
  outputType: "text" | "poster" | "scientific" | "creative" | "song";
  contentEn?: string;
  contentDe?: string;
  contentRu?: string;
  imageUrl?: string;
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(knowledgeEntries).values({
    ...data,
    isPublic: data.isPublic ?? false,
  });
  return result[0];
}

export async function getSessionEntries(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeEntries).where(eq(knowledgeEntries.sessionId, sessionId)).orderBy(knowledgeEntries.createdAt);
}

export async function getPublicEntries(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeEntries).where(eq(knowledgeEntries.isPublic, true)).orderBy(desc(knowledgeEntries.createdAt)).limit(limit);
}

export async function getPublicSessions(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeSessions).where(eq(knowledgeSessions.isPublic, true)).orderBy(desc(knowledgeSessions.updatedAt)).limit(limit);
}
