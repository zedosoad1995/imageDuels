export type MatchResult = 'P1_WIN' | 'P2_WIN';

export interface IRatingSystem<TState> {
  // Initial rating state for a fresh player
  createInitialState(): TState;

  // Value used for ordering / ranking (e.g., rating, mu, etc.)
  getComparableRating(state: TState): number;

  // Update both players after a match
  updateAfterMatch(
    p1: TState,
    p2: TState,
    result: MatchResult,
  ): [TState, TState];
}

export interface SimPlayer<TState> {
  id: number;
  trueRating: number; // ground-truth only used by the simulator
  state: TState; // rating system-specific state
  numVotes: number;
}

export interface IMatchmaker {
  // Returns indices into the players array
  pickPair<TState>(players: SimPlayer<TState>[]): [number, number];
}

export interface PlayerRankError {
  id: number;
  trueRating: number;
  estRating: number;
  trueRank: number;
  estRank: number;
  absDiff: number;
}

export interface SimulationResult {
  players: PlayerRankError[];
  avgAbsRankError: number;
  maxAbsRankError: number;
  fractionWithin1: number;
  fractionWithin2: number;
  fractionWithin3: number;
  fractionWithin5: number;
  fractionWithin10: number;
}

export interface RunSimulationParams {
  numPlayers: number;
  numRounds: number;
  trueMin?: number;
  trueMax?: number;
}
