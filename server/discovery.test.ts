import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  getDb: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
}));

vi.mock("axios", () => ({ default: { get: mocks.axiosGet } }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { appRouter } from "./routers";

function createContext(user: NonNullable<TrpcContext["user"]> | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const user = {
  id: 7,
  openId: "creator-7",
  email: "creator@example.com",
  name: "Creator Seven",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("discovery procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes a Modrinth search hit for the marketplace UI", async () => {
    mocks.axiosGet.mockResolvedValueOnce({
      data: {
        total_hits: 1,
        hits: [{ id: "abc123", slug: "sky-tools", title: "Sky Tools", description: "Tools for sky islands", project_type: "mod", icon_url: "https://cdn.example/icon.png", downloads: 1200, author: "Sky Maker", categories: ["utility"], versions: ["1.21"], loaders: ["fabric"] }],
      },
    });
    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.discovery.search({ query: "sky", category: "", limit: 1 });
    expect(result.total).toBe(1);
    expect(result.projects[0]).toMatchObject({ id: "abc123", title: "Sky Tools", source: "Modrinth", sourceUrl: "https://modrinth.com/project/sky-tools", downloads: 1200 });
  });

  it("normalizes project releases and changelog data", async () => {
    mocks.axiosGet
      .mockResolvedValueOnce({ data: { id: "abc123", slug: "sky-tools", title: "Sky Tools", project_type: "mod", versions: ["1.21"], loaders: ["fabric"], downloads: 1200 } })
      .mockResolvedValueOnce({ data: [{ id: "release-1", name: "Sky Tools 1.2", version_number: "1.2", changelog: "Added cloud mining.", date_published: "2026-08-01T00:00:00Z", downloads: 40, game_versions: ["1.21"], loaders: ["fabric"], files: [{ filename: "sky-tools.jar", url: "https://cdn.example/sky-tools.jar", primary: true }] }] });
    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.discovery.project({ id: "abc123" });
    expect(result.releases[0]).toMatchObject({ version: "1.2", changelog: "Added cloud mining.", downloads: 40 });
  });
});

describe("creator.saveDraft", () => {
  it("persists an authenticated draft and returns its id", async () => {
    mocks.values.mockReturnValue({ $returningId: async () => [{ id: 42 }] });
    mocks.insert.mockReturnValue({ values: mocks.values });
    mocks.getDb.mockResolvedValue({ insert: mocks.insert });
    const caller = appRouter.createCaller(createContext(user));
    const result = await caller.creator.saveDraft({ name: "Sky Tools", description: "A creator draft", category: "mod", screenshotKeys: "screenshots/key.png" });
    expect(result).toEqual({ success: true, id: 42 });
    expect(mocks.insert).toHaveBeenCalled();
  });
});
