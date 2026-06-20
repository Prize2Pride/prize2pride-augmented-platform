import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import {
  createKnowledgeSession,
  getUserSessions,
  getSessionById,
  updateSessionTitle,
  updateSessionPublic,
  deleteSession,
  createKnowledgeEntry,
  getSessionEntries,
  getPublicEntries,
  getPublicSessions,
  updateUserAvatar,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateAvatar: protectedProcedure
      .input(z.object({ cityAvatar: z.enum(["berlin", "moscow", "london"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateUserAvatar(ctx.user.id, input.cityAvatar);
        return { success: true };
      }),
  }),

  knowledge: router({
    // Create a new session
    createSession: protectedProcedure
      .input(z.object({ title: z.string().default("New Session"), isPublic: z.boolean().default(false) }))
      .mutation(async ({ ctx, input }) => {
        await createKnowledgeSession(ctx.user.id, input.title, input.isPublic);
        const sessions = await getUserSessions(ctx.user.id);
        return sessions[0];
      }),

    // Get user's sessions
    getSessions: protectedProcedure.query(async ({ ctx }) => {
      return getUserSessions(ctx.user.id);
    }),

    // Get session entries
    getSessionEntries: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");
        return getSessionEntries(input.sessionId);
      }),

    // Update session title
    updateSessionTitle: protectedProcedure
      .input(z.object({ sessionId: z.number(), title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");
        await updateSessionTitle(input.sessionId, input.title);
        return { success: true };
      }),

    // Toggle session public
    toggleSessionPublic: protectedProcedure
      .input(z.object({ sessionId: z.number(), isPublic: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");
        await updateSessionPublic(input.sessionId, input.isPublic);
        return { success: true };
      }),

    // Delete session
    deleteSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");
        await deleteSession(input.sessionId);
        return { success: true };
      }),

    // Generate knowledge — the core engine
    generate: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        prompt: z.string().min(1).max(10000),
        outputType: z.enum(["text", "poster", "scientific", "creative", "song"]).default("text"),
        generateImage: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");

        const systemPrompt = buildSystemPrompt(input.outputType);
        const userPrompt = buildUserPrompt(input.prompt, input.outputType);

        // Generate trilingual content
        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const rawContent = (typeof llmResponse.choices[0]?.message?.content === 'string' ? llmResponse.choices[0].message.content : "") ?? "";
        const { contentEn, contentDe, contentRu } = parseTrilingualResponse(rawContent);

        // Optionally generate image
        let imageUrl: string | undefined;
        if (input.generateImage || input.outputType === "poster") {
          try {
            const imgPrompt = `Prize2Pride scientific knowledge poster: ${input.prompt}. Elegant, dark premium aesthetic, trilingual, Berlin Moscow London city avatars, sophisticated design.`;
            const imgResult = await generateImage({ prompt: imgPrompt });
            imageUrl = imgResult.url;
          } catch (e) {
            console.error("[ImageGen] Failed:", e);
          }
        }

        // Save entry
        await createKnowledgeEntry({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          prompt: input.prompt,
          outputType: input.outputType,
          contentEn,
          contentDe,
          contentRu,
          imageUrl,
          isPublic: session.isPublic,
        });

        // Auto-update session title from first prompt
        const entries = await getSessionEntries(input.sessionId);
        if (entries.length === 1) {
          const shortTitle = input.prompt.slice(0, 80);
          await updateSessionTitle(input.sessionId, shortTitle);
        }

        return { contentEn, contentDe, contentRu, imageUrl, outputType: input.outputType };
      }),

    // Public repository
    getPublicRepository: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return getPublicEntries(input.limit);
      }),

    getPublicSessions: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return getPublicSessions(input.limit);
      }),
  }),
});

function buildSystemPrompt(outputType: string): string {
  const base = `You are the Prize2Pride Knowledge Engine — an omniscient AI system operating in the year 2300, after the preservation of human civilization's greatest knowledge. You generate unlimited, deep, comprehensive knowledge across all scientific, creative, and cultural domains.

CRITICAL RULE: You MUST always respond with content in THREE languages simultaneously: English, German, and Russian. Structure your response EXACTLY as follows:

---ENGLISH---
[Full English content here — comprehensive, detailed, unlimited length]

---GERMAN---
[Vollständiger deutscher Inhalt hier — umfassend, detailliert, unbegrenzte Länge]

---RUSSIAN---
[Полный русский контент здесь — исчерпывающий, подробный, неограниченная длина]

Each language section must be complete and standalone — not a translation summary but a full, rich response in that language.`;

  const typeInstructions: Record<string, string> = {
    text: `Generate comprehensive long-form knowledge content. Minimum 1000 lines of detailed, structured scientific or educational content. Use headers, subheaders, detailed explanations, examples, and deep analysis.`,
    scientific: `Generate a complete scientific paper or research document. Include: Abstract, Introduction, Methodology, Results, Discussion, Conclusion, References. Use proper academic language. Minimum 1500 lines.`,
    poster: `Generate a structured knowledge poster script with: Title, Key Concepts, Visual Descriptions, Data Points, Infographic Elements, Citations. Format for visual presentation.`,
    creative: `Generate rich creative content — poetry, narrative, philosophical treatise, or artistic exploration of the topic. Unlimited depth and expression.`,
    song: `Generate complete song lyrics with: Title, Verse 1, Chorus, Verse 2, Bridge, Final Chorus, Outro. Include musical notes and style directions. Make it profound and meaningful.`,
  };

  return `${base}\n\n${typeInstructions[outputType] ?? typeInstructions.text}`;
}

function buildUserPrompt(prompt: string, outputType: string): string {
  return `Generate ${outputType} knowledge about: ${prompt}

Remember: Respond in ALL THREE LANGUAGES (English, German, Russian) simultaneously using the exact format with ---ENGLISH---, ---GERMAN---, ---RUSSIAN--- separators. Each section must be complete, comprehensive, and detailed. No limits on length or depth.`;
}

function parseTrilingualResponse(raw: string): { contentEn: string; contentDe: string; contentRu: string } {
  const enMatch = raw.match(/---ENGLISH---([\s\S]*?)(?=---GERMAN---|---RUSSIAN---|$)/i);
  const deMatch = raw.match(/---GERMAN---([\s\S]*?)(?=---ENGLISH---|---RUSSIAN---|$)/i);
  const ruMatch = raw.match(/---RUSSIAN---([\s\S]*?)(?=---ENGLISH---|---GERMAN---|$)/i);

  return {
    contentEn: enMatch?.[1]?.trim() ?? raw,
    contentDe: deMatch?.[1]?.trim() ?? "",
    contentRu: ruMatch?.[1]?.trim() ?? "",
  };
}

export type AppRouter = typeof appRouter;
