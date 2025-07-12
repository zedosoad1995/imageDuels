import api from ".";

export type VoteOutcome = "WIN" | "LOSS" | "SKIP";

export const feed = (): Promise<
  {
    token: string | undefined;
    image1: string;
    image2: string;
    collectionId: string;
    collectionName: string;
  }[]
> => {
  return api.get("/duels/feed");
};

export const vote = (token: string, outcome: VoteOutcome): Promise<null> => {
  return api.post("/duels/vote", { outcome, token });
};
