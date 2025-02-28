import api from ".";

export type VoteOutcome = "WIN" | "LOSS" | "SKIP";

export const vote = (duelId: string, outcome: VoteOutcome): Promise<{}> => {
  return api.post(`/duels/${duelId}/vote`, { outcome });
};
