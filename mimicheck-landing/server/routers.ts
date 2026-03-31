import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  // Förderanträge (Applications)
  applications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserApplications(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getApplicationById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["wohngeld", "kindergeld", "bafoeg", "elterngeld", "other"]),
        title: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createApplication({
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          description: input.description,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "submitted", "processing", "approved", "rejected"]).optional(),
        estimatedAmount: z.number().optional(),
        aiAnalysis: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateApplication(id, ctx.user.id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteApplication(input.id, ctx.user.id);
        return { success: true };
      }),
    
    submit: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateApplication(input.id, ctx.user.id, {
          status: "submitted",
          submittedAt: new Date(),
        });
        return { success: true };
      }),
  }),
  
  // Documents
  documents: router({
    list: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getApplicationDocuments(input.applicationId, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        filename: z.string(),
        fileKey: z.string(),
        url: z.string(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createDocument({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
