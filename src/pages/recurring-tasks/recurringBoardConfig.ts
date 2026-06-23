import {
  RecurringFrequency,
  RecurringTaskStatus,
  type RecurringTask,
} from "@/api/generated";
import type { TranslationKey } from "@/i18n/locales";
import type { ComponentType } from "react";
import {
  RowIconBolt,
  RowIconFlame,
  RowIconStar,
} from "./recurringPremiumIcons";

export type FrequencyIcon = ComponentType<{ className?: string }>;

export const FREQUENCY_SECTIONS: {
  frequency: RecurringFrequency;
  labelKey: TranslationKey;
  Icon: FrequencyIcon;
}[] = [
  {
    frequency: RecurringFrequency.Daily,
    labelKey: "recurring.frequency.daily",
    Icon: RowIconFlame,
  },
  {
    frequency: RecurringFrequency.Weekly,
    labelKey: "recurring.frequency.weekly",
    Icon: RowIconStar,
  },
  {
    frequency: RecurringFrequency.Monthly,
    labelKey: "recurring.frequency.monthly",
    Icon: RowIconBolt,
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
