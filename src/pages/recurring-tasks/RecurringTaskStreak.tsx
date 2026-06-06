import { getStreakDisplay } from "./streakDisplay";

type RecurringTaskStreakProps = {
  streakCount: number;
};

export default function RecurringTaskStreak({
  streakCount,
}: RecurringTaskStreakProps) {
  const display = getStreakDisplay(streakCount);

  return (
    <span
      className={`recurring-card__streak recurring-card__streak--${display.tier}`}
    >
      <span className="recurring-card__streak-tag">{display.tagLabel}</span>
      <span className="recurring-card__streak-value">{display.valueLabel}</span>
    </span>
  );
}
