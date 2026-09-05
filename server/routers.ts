import axios from "axios";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { creatorDrafts, creatorProfiles, favorites, publishedProjects } from "../drizzle/schema";
import { storagePut } from "./storage";

const categorySchema = z.string().optional().default("");
const modrinthHeaders = { "User-Agent": "BlockForge/1.0 (community marketplace)" };

function normalizeProject(project: any) {
  return {
    id: project.id ?? project.project_id,
    title: project.title ?? project.name ?? "Untitled project",
    slug: project.slug,
    description: project.description ?? "Community-made Minecraft content.",
    category: project.project_type ?? "mod",
    icon: project.icon_url ?? undefined,
    downloads: project.downloads ?? 0,
    author: project.author ?? "Modrinth creator",
    source: "Modrinth" as const,
    sourceUrl: `https://modrinth.com/project/${project.slug ?? project.id}`,
    versions: project.versions ?? [],
    loaders: project.loaders ?? [],
    tags: (project.categories ?? project.keywords ?? []).slice(0, 5),
    gallery: (project.gallery ?? []).map((image: any) => image.url).filter(Boolean).slice(0, 4),
    accent: "#73e7f7",
  };
}

function normalizeRelease(release: any) {
  return {
    id: release.id,
    name: release.name ?? release.version_number ?? "Release",
    version: release.version_number ?? "",
    date: release.date_published ?? release.date_created ?? null,
    changelog: release.changelog ?? "No changelog was provided for this release.",
    gameVersions: release.game_versions ?? [],
    loaders: release.loaders ?? [],
    downloads: release.downloads ?? 0,
    files: (release.files ?? []).map((file: any) => ({ filename: file.filename, url: file.url, primary: file.primary })).slice(0, 3),
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  discovery: router({
    search: publicProcedure
      .input(z.object({ query: z.string().optional().default(""), category: categorySchema, limit: z.number().min(1).max(100).optional().default(24) }))
      .query(async ({ input }) => {
        const params = new URLSearchParams({ limit: String(input.limit), index: "relevance" });
        const facets: string[][] = [];
        if (input.query) params.set("query", input.query);
        if (input.category) facets.push(["project_type:" + input.category]);
        if (facets.length) params.set("facets", JSON.stringify(facets));
        const response = await axios.get(`https://api.modrinth.com/v2/search?${params.toString()}`, { timeout: 7000, headers: modrinthHeaders });
        return { total: response.data.total_hits ?? 0, projects: (response.data.hits ?? []).map(normalizeProject) };
      }),
    project: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ input }) => {
      const [projectResponse, releasesResponse] = await Promise.all([
        axios.get(`https://api.modrinth.com/v2/project/${encodeURIComponent(input.id)}`, { timeout: 7000, headers: modrinthHeaders }),
        axios.get(`https://api.modrinth.com/v2/project/${encodeURIComponent(input.id)}/version?limit=6`, { timeout: 7000, headers: modrinthHeaders }),
      ]);
      return { project: normalizeProject(projectResponse.data), releases: (releasesResponse.data ?? []).map(normalizeRelease) };
    }),
  }),
  favorites: router({
    get: protectedProcedure.input(z.object({ projectId: z.string(), source: z.string().default("Modrinth") })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { favorited: false };
      const rows = await db.select({ id: favorites.id }).from(favorites).where(and(eq(favorites.ownerId, ctx.user.id), eq(favorites.projectId, input.projectId), eq(favorites.source, input.source))).limit(1);
      return { favorited: rows.length > 0 };
    }),
    toggle: protectedProcedure.input(z.object({ projectId: z.string(), source: z.string().default("Modrinth") })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database is not configured");
      const rows = await db.select({ id: favorites.id }).from(favorites).where(and(eq(favorites.ownerId, ctx.user.id), eq(favorites.projectId, input.projectId), eq(favorites.source, input.source))).limit(1);
      if (rows[0]) {
        await db.delete(favorites).where(eq(favorites.id, rows[0].id));
        return { favorited: false };
      }
      await db.insert(favorites).values({ ownerId: ctx.user.id, projectId: input.projectId, source: input.source });
      return { favorited: true };
    }),
  }),
  creator: router({
    profile: publicProcedure.input(z.object({ handle: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(creatorProfiles).where(eq(creatorProfiles.handle, input.handle)).limit(1);
      return rows[0] ?? null;
    }),
    published: publicProcedure.input(z.object({ ownerId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(publishedProjects).where(and(eq(publishedProjects.ownerId, input.ownerId), eq(publishedProjects.status, "published"))).orderBy(desc(publishedProjects.updatedAt));
    }),
    uploadScreenshot: protectedProcedure.input(z.object({ fileName: z.string().min(1).max(180), contentType: z.string().regex(/^image\/(png|jpeg|webp|gif)$/), base64: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      const content = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
      if (content.byteLength > 8 * 1024 * 1024) throw new Error("Screenshots must be 8 MB or smaller");
      const stored = await storagePut(`creator-${ctx.user.id}/screenshots/${input.fileName}`, content, input.contentType);
      return stored;
    }),
    saveDraft: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(160), description: z.string().min(1), category: z.string(), versions: z.string().optional(), loaders: z.string().optional(), changelog: z.string().optional(), downloadUrl: z.string().url().optional(), screenshotKeys: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database is not configured");
        const [draft] = await db.insert(creatorDrafts).values({ ...input, ownerId: ctx.user.id }).$returningId();
        return { success: true, id: draft.id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
