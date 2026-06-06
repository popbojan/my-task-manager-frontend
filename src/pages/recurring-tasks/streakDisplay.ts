export type StreakTier = "none" | "warm" | "good" | "great" | "legend";

export type StreakDisplay = {
  tier: StreakTier;
  tagLabel: string;
  valueLabel: string;
};

export function getStreakDisplay(streakCount: number): StreakDisplay {
  const value = String(Math.max(0, streakCount));

  if (streakCount <= 0) {
    return {
      tier: "none",
      tagLabel: "Streak",
      valueLabel: "0",
    };
  }

  if (streakCount < 4) {
    return {
      tier: "warm",
      tagLabel: "Streak",
      valueLabel: value,
    };
  }

  if (streakCount < 10) {
    return {
      tier: "good",
      tagLabel: "Streak",
      valueLabel: value,
    };
  }

  if (streakCount < 30) {
    return {
      tier: "great",
      tagLabel: "Streak",
      valueLabel: value,
    };
  }

  return {
    tier: "legend",
    tagLabel: "Streak",
    valueLabel: value,
  };
}

export function getGlobalScoreTier(score: number): StreakTier {
  if (score <= 0) {
    return "none";
  }

  if (score < 4) {
    return "warm";
  }

  if (score < 10) {
    return "good";
  }

  if (score < 30) {
    return "great";
  }

  return "legend";
}
