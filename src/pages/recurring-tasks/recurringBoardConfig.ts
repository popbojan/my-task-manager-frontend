import {
  RecurringFrequency,
  RecurringTaskStatus,
  type RecurringTask,
} from "@/api/generated";
import type { TranslationKey } from "@/i18n/locales";

export const FREQUENCY_SECTIONS: {
  frequency: RecurringFrequency;
  labelKey: TranslationKey;
}[] = [
  { frequency: RecurringFrequency.Daily, labelKey: "recurring.frequency.daily" },
  {
    frequency: RecurringFrequency.Weekly,
    labelKey: "recurring.frequency.weekly",
  },
  {
    frequency: RecurringFrequency.Monthly,
    labelKey: "recurring.frequency.monthly",
  },
];

export const STATUS_COLUMNS: {
  status: RecurringTaskStatus;
  labelKey: TranslationKey;
}[] = [
  { status: RecurringTaskStatus.Todo, labelKey: "recurring.status.todo" },
  {
    status: RecurringTaskStatus.InProgress,
    labelKey: "recurring.status.inProgress",
  },
  { status: RecurringTaskStatus.Done, labelKey: "recurring.status.done" },
];

export function compareRecurringTasksByStreak(
  a: RecurringTask,
  b: RecurringTask,
): number {
  return b.streakCount - a.streakCount;
}
