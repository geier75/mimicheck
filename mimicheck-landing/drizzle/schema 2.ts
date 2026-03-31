import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Förderanträge (Applications) - Stores user applications for government benefits
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  type: mysqlEnum("type", ["wohngeld", "kindergeld", "bafoeg", "elterngeld", "other"]).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "processing", "approved", "rejected"]).default("draft").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // Document URLs (stored in S3)
  documents: text("documents"), // JSON array of {url, filename, mimeType}
  // AI Analysis Results
  aiAnalysis: text("aiAnalysis"), // JSON object with AI suggestions
  // Estimated benefit amount
  estimatedAmount: int("estimatedAmount"), // in cents (e.g., 84700 = 847€)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  submittedAt: timestamp("submittedAt"),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Documents - Stores uploaded documents for applications
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(), // Foreign key to applications
  userId: int("userId").notNull(), // Foreign key to users
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 key
  url: text("url").notNull(), // S3 URL
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"), // in bytes
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;