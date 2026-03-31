import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getGigs, getGigById, getSellerGigs, createGig, getBuyerOrders, getSellerOrders, createOrder, getGigReviews, createReview } from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  gigs: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => getGigs(input.limit, input.offset)),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => getGigById(input.id)),

    myGigs: protectedProcedure
      .query(({ ctx }) => getSellerGigs(ctx.user.id)),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(5).max(255),
        description: z.string().min(20),
        category: z.string(),
        price: z.number().min(100).max(25000),
        deliveryDays: z.number().default(3),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = `gig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createGig({
          id,
          sellerId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          price: input.price,
          deliveryDays: input.deliveryDays,
          imageUrl: input.imageUrl,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().min(5).max(255).optional(),
        description: z.string().min(20).optional(),
        category: z.string().optional(),
        price: z.number().min(100).max(25000).optional(),
        deliveryDays: z.number().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateGig } = await import('./db');
        const { id, ...updates } = input;
        await updateGig(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteGig } = await import('./db');
        await deleteGig(input.id);
        return { success: true };
      }),

    saveDraft: protectedProcedure
      .input(z.object({
        title: z.string().min(5).max(255),
        description: z.string().min(20),
        category: z.string(),
        price: z.number().min(100).max(25000),
        deliveryDays: z.number().default(3),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createGig } = await import('./db');
        const id = `gig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createGig({
          id,
          sellerId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          price: input.price,
          deliveryDays: input.deliveryDays,
          imageUrl: input.imageUrl,
          status: "draft",
        });
        return { id };
      }),

    getDrafts: protectedProcedure
      .query(async ({ ctx }) => {
        const { getSellerDrafts } = await import('./db');
        return getSellerDrafts(ctx.user.id);
      }),

    publish: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { publishGig } = await import('./db');
        await publishGig(input.id);
        return { success: true };
      }),
  }),

  orders: router({
    myPurchases: protectedProcedure
      .query(({ ctx }) => getBuyerOrders(ctx.user.id)),

    mySales: protectedProcedure
      .query(({ ctx }) => getSellerOrders(ctx.user.id)),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const orders = await getBuyerOrders("");
        return orders.find(o => o.id === input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        gigId: z.string(),
        buyerMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const gig = await getGigById(input.gigId);
        if (!gig) throw new Error("Gig not found");

        const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createOrder({
          id,
          gigId: input.gigId,
          buyerId: ctx.user.id,
          sellerId: gig.sellerId,
          totalPrice: gig.price,
          buyerMessage: input.buyerMessage,
        });
        return { id };
      }),

    acceptDelivery: protectedProcedure
      .input(z.object({ orderId: z.string() }))
      .mutation(async ({ input }) => {
        // TODO: Update order status to completed
        return { success: true };
      }),

    requestRevision: protectedProcedure
      .input(z.object({ orderId: z.string(), reason: z.string() }))
      .mutation(async ({ input }) => {
        // TODO: Update order status to revision
        return { success: true };
      }),

    openDispute: protectedProcedure
      .input(z.object({ orderId: z.string(), reason: z.string() }))
      .mutation(async ({ input }) => {
        // TODO: Update order status to disputed
        return { success: true };
      }),
  }),

  reviews: router({
    getGigReviews: publicProcedure
      .input(z.object({ gigId: z.string() }))
      .query(({ input }) => getGigReviews(input.gigId)),

    create: protectedProcedure
      .input(z.object({
        orderId: z.string(),
        gigId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createReview({
          id,
          orderId: input.orderId,
          gigId: input.gigId,
          reviewerId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
        });
        return { id };
      }),
  }),

  payment: router({
    createIntent: protectedProcedure
      .input(z.object({ 
        orderId: z.string(),
        paymentMethod: z.enum(['card', 'sepa', 'klarna', 'twint']).default('card'),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createPaymentIntent } = await import('./payment');
        const { getGigById, createTransaction } = await import('./db');
        
        // Get order details
        const orders = await import('./db').then(m => m.getBuyerOrders(ctx.user.id));
        const order = orders.find(o => o.id === input.orderId);
        if (!order) throw new Error("Order not found");

        // Create payment intent
        const paymentIntent = await createPaymentIntent({
          amount: order.totalPrice,
          orderId: input.orderId,
          buyerId: ctx.user.id,
          sellerId: order.sellerId,
          paymentMethod: input.paymentMethod,
        });

        // Create transaction record
        await createTransaction({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          orderId: input.orderId,
          buyerId: ctx.user.id,
          sellerId: order.sellerId,
          amount: order.totalPrice,
          currency: 'EUR',
          paymentMethod: input.paymentMethod,
          paymentIntentId: paymentIntent.id,
          status: 'pending',
        });

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      }),

    confirmPayment: protectedProcedure
      .input(z.object({ paymentIntentId: z.string() }))
      .mutation(async ({ input }) => {
        const { confirmPaymentIntent } = await import('./payment');
        const { updateTransactionStatus } = await import('./db');
        
        const paymentIntent = await confirmPaymentIntent(input.paymentIntentId);
        
        // Update transaction status
        await updateTransactionStatus(input.paymentIntentId, 'authorized');

        return { success: true, status: paymentIntent.status };
      }),

    capturePayment: protectedProcedure
      .input(z.object({ orderId: z.string() }))
      .mutation(async ({ input }) => {
        const { capturePayment } = await import('./payment');
        const { getTransactionByOrderId, updateTransactionStatus } = await import('./db');
        
        const transaction = await getTransactionByOrderId(input.orderId);
        if (!transaction || !transaction.paymentIntentId) {
          throw new Error("Transaction not found");
        }

        await capturePayment(transaction.paymentIntentId);
        await updateTransactionStatus(transaction.id, 'captured');

        return { success: true };
      }),

    refundPayment: protectedProcedure
      .input(z.object({ orderId: z.string(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const { refundPayment } = await import('./payment');
        const { getTransactionByOrderId, updateTransactionStatus } = await import('./db');
        
        const transaction = await getTransactionByOrderId(input.orderId);
        if (!transaction || !transaction.paymentIntentId) {
          throw new Error("Transaction not found");
        }

        await refundPayment(transaction.paymentIntentId);
        await updateTransactionStatus(transaction.id, 'refunded');

        return { success: true };
      }),
  }),

  payout: router({
    getEarnings: protectedProcedure
      .query(async ({ ctx }) => {
        const { getSellerEarnings } = await import('./db');
        return await getSellerEarnings(ctx.user.id);
      }),

    requestPayout: protectedProcedure
      .input(z.object({ amount: z.number().min(2000) })) // Minimum 20€
      .mutation(async ({ ctx, input }) => {
        const { createPayout: createPayoutStripe } = await import('./payment');
        const { createPayout, getSellerEarnings } = await import('./db');
        
        // Check available balance
        const earnings = await getSellerEarnings(ctx.user.id);
        if (earnings.available < input.amount) {
          throw new Error("Insufficient balance");
        }

        // Create payout via Stripe
        const stripePayout = await createPayoutStripe({
          sellerId: ctx.user.id,
          amount: input.amount,
        });

        // Create payout record
        const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createPayout({
          id: payoutId,
          sellerId: ctx.user.id,
          amount: input.amount,
          currency: 'EUR',
          status: 'pending',
          stripePayoutId: stripePayout.id,
          transactionIds: '[]', // TODO: Track which transactions are included
        });

        return { success: true, payoutId };
      }),

    getHistory: protectedProcedure
      .query(async ({ ctx }) => {
        const { getSellerPayouts } = await import('./db');
        return await getSellerPayouts(ctx.user.id);
      }),
  }),

  invoice: router({
    generate: protectedProcedure
      .input(z.object({ orderId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { calculateVAT } = await import('./payment');
        const { createInvoice, getBuyerOrders } = await import('./db');
        
        // Get order details
        const orders = await getBuyerOrders(ctx.user.id);
        const order = orders.find(o => o.id === input.orderId);
        if (!order) throw new Error("Order not found");

        // Calculate VAT (assume DE for now)
        const vatAmount = calculateVAT(order.totalPrice, 'DE');
        const totalAmount = order.totalPrice + vatAmount;

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}`;

        // Create invoice record
        const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createInvoice({
          id: invoiceId,
          orderId: input.orderId,
          buyerId: ctx.user.id,
          sellerId: order.sellerId,
          invoiceNumber,
          amount: order.totalPrice,
          vatAmount,
          totalAmount,
          status: 'draft',
        });

        // TODO: Generate PDF and upload to S3

        return { success: true, invoiceId, invoiceNumber };
      }),

    getByOrder: protectedProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        const { getInvoiceByOrderId } = await import('./db');
        return await getInvoiceByOrderId(input.orderId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

