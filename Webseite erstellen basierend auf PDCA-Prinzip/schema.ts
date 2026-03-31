import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["buyer", "seller", "both"]).default("both"),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  country: varchar("country", { length: 2 }), // DE, AT, CH
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Gigs table - Digital microservices offered by sellers
 */
export const gigs = mysqlTable("gigs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sellerId: varchar("sellerId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 64 }).notNull(), // design, writing, marketing, development, etc.
  price: int("price").notNull(), // in cents, max 25000 (250€)
  deliveryDays: int("deliveryDays").notNull().default(3),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  active: boolean("active").default(true),
  completedOrders: int("completedOrders").default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Gig = typeof gigs.$inferSelect;
export type InsertGig = typeof gigs.$inferInsert;

/**
 * Orders table - Transactions between buyers and sellers
 */
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  gigId: varchar("gigId", { length: 64 }).notNull(),
  buyerId: varchar("buyerId", { length: 64 }).notNull(),
  sellerId: varchar("sellerId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled", "disputed"]).default("pending"),
  totalPrice: int("totalPrice").notNull(), // in cents
  buyerMessage: text("buyerMessage"),
  sellerDelivery: text("sellerDelivery"),
  deliveryDate: timestamp("deliveryDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Reviews table - Ratings and feedback
 */
export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  gigId: varchar("gigId", { length: 64 }).notNull(),
  reviewerId: varchar("reviewerId", { length: 64 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;


/**
 * Transactions table - Payment records with Stripe integration
 */
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  buyerId: varchar("buyerId", { length: 64 }).notNull(),
  sellerId: varchar("sellerId", { length: 64 }).notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("EUR"),
  paymentMethod: varchar("paymentMethod", { length: 32 }), // 'klarna', 'sepa', 'card', 'twint'
  paymentIntentId: varchar("paymentIntentId", { length: 255 }), // Stripe Payment Intent ID
  status: mysqlEnum("status", ["pending", "authorized", "captured", "refunded", "failed"]).default("pending"),
  escrowReleaseDate: timestamp("escrowReleaseDate"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Payouts table - Seller earnings withdrawals
 */
export const payouts = mysqlTable("payouts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sellerId: varchar("sellerId", { length: 64 }).notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("EUR"),
  status: mysqlEnum("status", ["pending", "processing", "paid", "failed"]).default("pending"),
  payoutMethod: varchar("payoutMethod", { length: 32 }).default("bank_transfer"), // 'bank_transfer', 'sepa'
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  transactionIds: text("transactionIds"), // JSON array of transaction IDs
  createdAt: timestamp("createdAt").defaultNow(),
  paidAt: timestamp("paidAt"),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

/**
 * Invoices table - Generated invoices for orders
 */
export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  buyerId: varchar("buyerId", { length: 64 }).notNull(),
  sellerId: varchar("sellerId", { length: 64 }).notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 32 }).notNull().unique(),
  amount: int("amount").notNull(), // in cents (net)
  vatAmount: int("vatAmount").notNull(), // in cents
  totalAmount: int("totalAmount").notNull(), // in cents (gross)
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  status: mysqlEnum("status", ["draft", "sent", "paid", "cancelled"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

