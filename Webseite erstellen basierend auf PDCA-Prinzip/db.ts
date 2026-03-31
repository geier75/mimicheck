import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, gigs, orders, reviews, InsertGig, InsertOrder, InsertReview } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Gig queries
export async function getGigs(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gigs).where(eq(gigs.active, true)).limit(limit).offset(offset);
}

export async function getGigById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gigs).where(eq(gigs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSellerGigs(sellerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gigs).where(eq(gigs.sellerId, sellerId));
}

export async function getSellerDrafts(sellerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gigs).where(
    and(eq(gigs.sellerId, sellerId), eq(gigs.status, "draft"))
  );
}

export async function getSellerPublishedGigs(sellerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gigs).where(
    and(eq(gigs.sellerId, sellerId), eq(gigs.status, "published"), eq(gigs.active, true))
  );
}

export async function publishGig(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(gigs).set({ status: "published", active: true, updatedAt: new Date() }).where(eq(gigs.id, id));
}

export async function createGig(gig: InsertGig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(gigs).values(gig);
}

export async function updateGig(id: string, updates: Partial<InsertGig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(gigs).set({ ...updates, updatedAt: new Date() }).where(eq(gigs.id, id));
}

export async function deleteGig(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Soft delete by setting active to false
  await db.update(gigs).set({ active: false, updatedAt: new Date() }).where(eq(gigs.id, id));
}

// Order queries
export async function getOrderById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBuyerOrders(buyerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.buyerId, buyerId));
}

export async function getSellerOrders(sellerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.sellerId, sellerId));
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(order);
}

// Review queries
export async function getGigReviews(gigId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.gigId, gigId));
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reviews).values(review);
}



// ============================================
// PAYMENT & TRANSACTION FUNCTIONS
// ============================================

import { transactions, payouts, invoices, InsertTransaction, InsertPayout, InsertInvoice } from "../drizzle/schema";

/**
 * Create a transaction record
 */
export async function createTransaction(transaction: InsertTransaction): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create transaction: database not available");
    return;
  }

  try {
    await db.insert(transactions).values(transaction);
  } catch (error) {
    console.error("[Database] Failed to create transaction:", error);
    throw error;
  }
}

/**
 * Get transaction by order ID
 */
export async function getTransactionByOrderId(orderId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transaction: database not available");
    return undefined;
  }

  const result = await db.select().from(transactions).where(eq(transactions.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(transactionId: string, status: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update transaction: database not available");
    return;
  }

  try {
    await db.update(transactions)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(transactions.id, transactionId));
  } catch (error) {
    console.error("[Database] Failed to update transaction:", error);
    throw error;
  }
}

/**
 * Create a payout record
 */
export async function createPayout(payout: InsertPayout): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create payout: database not available");
    return;
  }

  try {
    await db.insert(payouts).values(payout);
  } catch (error) {
    console.error("[Database] Failed to create payout:", error);
    throw error;
  }
}

/**
 * Get seller payouts
 */
export async function getSellerPayouts(sellerId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payouts: database not available");
    return [];
  }

  return await db.select().from(payouts).where(eq(payouts.sellerId, sellerId));
}

/**
 * Get seller earnings summary
 */
export async function getSellerEarnings(sellerId: string): Promise<{
  available: number;
  pending: number;
  total: number;
}> {
  const db = await getDb();
  if (!db) {
    return { available: 0, pending: 0, total: 0 };
  }

  // Get all completed transactions for seller
  const sellerTransactions = await db.select()
    .from(transactions)
    .where(eq(transactions.sellerId, sellerId));

  const captured = sellerTransactions.filter(t => t.status === 'captured');
  const authorized = sellerTransactions.filter(t => t.status === 'authorized');

  const totalCaptured = captured.reduce((sum, t) => sum + t.amount, 0);
  const totalAuthorized = authorized.reduce((sum, t) => sum + t.amount, 0);

  // Get already paid out amount
  const sellerPayouts = await getSellerPayouts(sellerId);
  const paidOut = sellerPayouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    available: totalCaptured - paidOut,
    pending: totalAuthorized,
    total: totalCaptured,
  };
}

/**
 * Create an invoice
 */
export async function createInvoice(invoice: InsertInvoice): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create invoice: database not available");
    return;
  }

  try {
    await db.insert(invoices).values(invoice);
  } catch (error) {
    console.error("[Database] Failed to create invoice:", error);
    throw error;
  }
}

/**
 * Get invoice by order ID
 */
export async function getInvoiceByOrderId(orderId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get invoice: database not available");
    return undefined;
  }

  const result = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

