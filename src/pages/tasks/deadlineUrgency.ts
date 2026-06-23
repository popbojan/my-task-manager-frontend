export type DeadlineTier = "green" | "yellow" | "orange" | "red";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_IN_MONTH = 30;
const DAYS_IN_TWO_WEEKS = 14;
const DAYS_IN_ONE_DAY = 1;

export type DeadlineLabels = {
  overdue: string;
  today: string;
  thisWeek: string;
  twoWeeks: string;
  oneMonth: string;
};

export function getDeadlineTier(deadline: Date): DeadlineTier {
  const daysRemaining = (deadline.getTime() - Date.now()) / MS_PER_DAY;

  if (daysRemaining <= DAYS_IN_ONE_DAY) {
    return "red";
  }

  if (daysRemaining < DAYS_IN_TWO_WEEKS) {
    return "orange";
  }

  if (daysRemaining < DAYS_IN_MONTH) {
    return "yellow";
  }

  return "green";
}

export function formatDeadline(deadline: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(deadline);
}

export function getDeadlineDisplay(
  deadline: Date | null | undefined,
  labels: DeadlineLabels,
  locale: string,
) {
  if (!deadline) {
    return null;
  }

  const tier = getDeadlineTier(deadline);
  const formatted = formatDeadline(deadline, locale);
  const isOverdue = deadline.getTime() < Date.now();

  return {
    tier,
    urgencyLabel: getUrgencyLabel(tier, isOverdue, labels),
    dateLabel: formatted,
  };
}

function getUrgencyLabel(
  tier: DeadlineTier,
  isOverdue: boolean,
  labels: DeadlineLabels,
): string {
  if (isOverdue) {
    return labels.overdue;
  }

  switch (tier) {
    case "red":
      return labels.today;
    case "orange":
      return labels.thisWeek;
    case "yellow":
      return labels.twoWeeks;
    case "green":
      return labels.oneMonth;
  }
}
