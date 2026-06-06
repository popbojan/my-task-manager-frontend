import { getDeadlineDisplay } from "./deadlineUrgency";

type TaskDeadlineProps = {
  deadline?: Date | null;
};

export default function TaskDeadline({ deadline }: TaskDeadlineProps) {
  const display = getDeadlineDisplay(deadline);

  if (!display) {
    return null;
  }

  return (
    <span
      className={`task-card__deadline task-card__deadline--${display.tier}`}
    >
      <span className="task-card__deadline-tag">{display.urgencyLabel}</span>
      <span className="task-card__deadline-date">{display.dateLabel}</span>
    </span>
  );
}
