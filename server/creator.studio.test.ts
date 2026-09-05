import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("creator.saveDraft", () => {
  it("rejects draft creation when there is no authenticated user", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.creator.saveDraft({
      name: "Test project",
      description: "A test project",
      category: "mod",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
