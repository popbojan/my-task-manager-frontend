export type DeadlineTier = "green" | "yellow" | "orange" | "red";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_IN_MONTH = 30;
const DAYS_IN_TWO_WEEKS = 14;
const DAYS_IN_ONE_DAY = 1;

export function getDeadlineTier(deadline: Date): DeadlineTier {
  const daysRemaining =
    (deadline.getTime() - Date.now()) / MS_PER_DAY;

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

export function formatDeadline(deadline: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(deadline);
}

export function getDeadlineDisplay(deadline: Date | null | undefined) {
  if (!deadline) {
    return null;
  }

  const tier = getDeadlineTier(deadline);
  const formatted = formatDeadline(deadline);
  const isOverdue = deadline.getTime() < Date.now();

  return {
    tier,
    urgencyLabel: getUrgencyLabel(tier, isOverdue),
    dateLabel: formatted,
  };
}

function getUrgencyLabel(tier: DeadlineTier, isOverdue: boolean): string {
  if (isOverdue) {
    return "Überfällig";
  }

  switch (tier) {
    case "red":
      return "Heute";
    case "orange":
      return "Diese Woche";
    case "yellow":
      return "2+ Wochen";
    case "green":
      return "1+ Monat";
  }
}
