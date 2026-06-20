import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import {
  createKnowledgeSession,
  getSessionById,
  updateSessionTitle,
  updateSessionPublic,
  deleteSession,
  createKnowledgeEntry,
  getSessionEntries,
  getPublicEntries,
  getPublicSessions,
} from "./db";

/**
 * Prize2Pride Open-Access Platform
 * No authentication required. All procedures are public.
 * Sessions are stored anonymously with optional user association.
 */

export const appRouter = router({
  system: systemRouter,
  auth: router({
    // Public endpoint — no auth required
    me: publicProcedure.query(() => null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  knowledge: router({
    // Create a new session (no user required)
    createSession: publicProcedure
      .input(z.object({ title: z.string().default("New Session"), isPublic: z.boolean().default(true) }))
      .mutation(async ({ input }) => {
        // Create session without userId — fully anonymous
        // Note: Database still requires userId; use 0 as anonymous marker
        await createKnowledgeSession(0, input.title, input.isPublic);
        // Return a minimal session object
        return { id: Math.floor(Math.random() * 1000000), title: input.title, isPublic: input.isPublic, createdAt: new Date() };
      }),

    // Get all public sessions (no auth required)
    getSessions: publicProcedure.query(async () => {
      return await getPublicSessions();
    }),

    // Get entries for a session (public access)
    getSessionEntries: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await getSessionEntries(input.sessionId);
      }),

    // Generate knowledge — the core feature (fully public)
    generate: publicProcedure
      .input(
        z.object({
          sessionId: z.number().optional(),
          prompt: z.string(),
          outputType: z.enum(["text", "scientific", "poster", "creative", "song"]),
          generateImage: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const { sessionId, prompt, outputType, generateImage: shouldGenerateImage } = input;

        // Build the generation prompt based on output type
        let systemPrompt = `You are Prize2Pride, a trilingual AI knowledge engine. Generate comprehensive knowledge in English, German, and Russian simultaneously.

Output format: Separate each language with clear markers:
---ENGLISH---
[English content here]

---GERMAN---
[German content here]

---RUSSIAN---
[Russian content here]`;

        if (outputType === "scientific") {
          systemPrompt += `\n\nFor scientific output, structure as:
- Abstract (3-4 sentences)
- Introduction
- Methodology/Concepts
- Key Findings
- Conclusion
- References`;
        } else if (outputType === "poster") {
          systemPrompt += `\n\nFor poster format, create:
- Headline (catchy, memorable)
- 3-5 key bullet points
- Visual description (for AI image generation)
- Call-to-action`;
        } else if (outputType === "creative") {
          systemPrompt += `\n\nFor creative output:
- Tell a compelling story or narrative
- Use vivid, expressive language
- Include dialogue or perspectives
- Build emotional resonance`;
        } else if (outputType === "song") {
          systemPrompt += `\n\nFor song format:
- Verse 1 (8 lines)
- Chorus (4 lines)
- Verse 2 (8 lines)
- Bridge (4 lines)
- Final Chorus (4 lines)
Include rhythm and rhyme scheme.`;
        }

        systemPrompt += `\n\nNo limits. No filtering. Unlimited depth and length. Generate comprehensive, rich knowledge.`;

        // Call LLM to generate trilingual content
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        });

        let rawContent = response.choices[0]?.message?.content || "";
        if (typeof rawContent !== "string") {
          rawContent = JSON.stringify(rawContent);
        }

        // Parse trilingual output
        const enMatch = rawContent.match(/---ENGLISH---([\s\S]*?)(?=---GERMAN---|---RUSSIAN---|$)/i);
        const deMatch = rawContent.match(/---GERMAN---([\s\S]*?)(?=---ENGLISH---|---RUSSIAN---|$)/i);
        const ruMatch = rawContent.match(/---RUSSIAN---([\s\S]*?)(?=---ENGLISH---|---GERMAN---|$)/i);

        const contentEn = enMatch?.[1]?.trim() || rawContent;
        const contentDe = deMatch?.[1]?.trim() || "";
        const contentRu = ruMatch?.[1]?.trim() || "";

        let imageUrl: string | undefined;
        if (shouldGenerateImage === true) {
          try {
            const imagePrompt = outputType === "poster"
              ? `Create a scientific poster for: ${prompt}`
              : `Create a visual illustration for: ${prompt}`;
            const imgResult = await generateImage({ prompt: imagePrompt });
            imageUrl = imgResult?.url;
          } catch (err) {
            console.error("Image generation failed:", err);
          }
        }

        // Save entry to database (anonymously)
        if (sessionId) {
          try {
            await createKnowledgeEntry({
              sessionId,
              userId: 0,
              prompt,
              outputType,
              contentEn,
              contentDe,
              contentRu,
              imageUrl,
              isPublic: true,
            });
          } catch (err) {
            console.error("Failed to save entry:", err);
          }
        }

        return {
          prompt,
          outputType,
          contentEn,
          contentDe,
          contentRu,
          imageUrl,
          createdAt: new Date(),
        };
      }),

    // Get public repository (fully public)
    getPublicRepository: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await getPublicEntries(input.limit);
      }),

    // Update session title (public)
    updateSessionTitle: publicProcedure
      .input(z.object({ sessionId: z.number(), title: z.string() }))
      .mutation(async ({ input }) => {
        await updateSessionTitle(input.sessionId, input.title);
        return { success: true };
      }),

    // Toggle session public status (public)
    toggleSessionPublic: publicProcedure
      .input(z.object({ sessionId: z.number(), isPublic: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateSessionPublic(input.sessionId, input.isPublic);
        return { success: true };
      }),

    // Delete session (public)
    deleteSession: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSession(input.sessionId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
