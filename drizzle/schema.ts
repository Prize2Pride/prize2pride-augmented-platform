import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  cityAvatar: mysqlEnum("cityAvatar", ["berlin", "moscow", "london"]).default("london"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const knowledgeSessions = mysqlTable("knowledge_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }).notNull().default("Untitled Session"),
  language: mysqlEnum("language", ["en", "de", "ru", "all"]).default("all").notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const knowledgeEntries = mysqlTable("knowledge_entries", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(),
  outputType: mysqlEnum("outputType", ["text", "poster", "scientific", "creative", "song"]).default("text").notNull(),
  contentEn: text("contentEn"),
  contentDe: text("contentDe"),
  contentRu: text("contentRu"),
  imageUrl: text("imageUrl"),
  isPublic: boolean("isPublic").default(false).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type KnowledgeSession = typeof knowledgeSessions.$inferSelect;
export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
