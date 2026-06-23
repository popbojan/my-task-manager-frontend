type RecurringTaskStreakProps = {
  streakCount: number;
  tagLabel: string;
};

export default function RecurringTaskStreak({
  streakCount,
  tagLabel,
}: RecurringTaskStreakProps) {
  const tier = getStreakTier(streakCount);
  const valueLabel = String(Math.max(0, streakCount));

  return (
    <span
      className={`recurring-card__streak recurring-card__streak--${tier}`}
    >
      <span className="recurring-card__streak-tag">{tagLabel}</span>
      <span className="recurring-card__streak-value">{valueLabel}</span>
    </span>
  );
}

function getStreakTier(streakCount: number) {
  if (streakCount <= 0) {
    return "none";
  }

  if (streakCount < 4) {
    return "warm";
  }

  if (streakCount < 10) {
    return "good";
  }

  if (streakCount < 30) {
    return "great";
  }

  return "legend";
}
