import api from ".";

export type VoteOutcome = "WIN" | "LOSS" | "SKIP";

export const vote = (token: string, outcome: VoteOutcome): Promise<{}> => {
  return api.post("/duels/vote", { outcome, token });
};
