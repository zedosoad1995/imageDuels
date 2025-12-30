import api from ".";

export type VoteOutcome = "WIN" | "LOSS" | "SKIP";

export const feed = (
  cursor?: string | null
): Promise<{
  duels: {
    token: string | undefined;
    image1: string;
    image2: string;
    collectionId: string;
    collectionName: string;
  }[];
  nextCursor: string | null;
}> => {
  return api.get("/duels/feed", {
    params: cursor ? { cursor } : {},
  });
};

export const vote = (token: string, outcome: VoteOutcome): Promise<null> => {
  return api.post("/duels/vote", { outcome, token });
};
