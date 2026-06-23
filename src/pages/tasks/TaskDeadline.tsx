import { useLanguage } from "@/i18n/LanguageProvider";
import { getDeadlineDisplay } from "./deadlineUrgency";

type TaskDeadlineProps = {
  deadline?: Date | null;
};

export default function TaskDeadline({ deadline }: TaskDeadlineProps) {
  const { t, locale } = useLanguage();
  const display = getDeadlineDisplay(deadline, {
    overdue: t("deadline.overdue"),
    today: t("deadline.today"),
    thisWeek: t("deadline.thisWeek"),
    twoWeeks: t("deadline.twoWeeks"),
    oneMonth: t("deadline.oneMonth"),
  }, locale);

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
