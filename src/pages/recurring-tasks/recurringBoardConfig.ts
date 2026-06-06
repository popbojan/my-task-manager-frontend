import {
  RecurringFrequency,
  RecurringTaskStatus,
  type RecurringTask,
} from "@/api/generated";

export const FREQUENCY_SECTIONS: {
  frequency: RecurringFrequency;
  label: string;
}[] = [
  { frequency: RecurringFrequency.Daily, label: "Tägliche Aufgaben" },
  { frequency: RecurringFrequency.Weekly, label: "Wöchentliche Aufgaben" },
  { frequency: RecurringFrequency.Monthly, label: "Monatliche Aufgaben" },
];

export const STATUS_COLUMNS: {
  status: RecurringTaskStatus;
  label: string;
}[] = [
  { status: RecurringTaskStatus.Todo, label: "To Do" },
  { status: RecurringTaskStatus.InProgress, label: "In Bearbeitung" },
  { status: RecurringTaskStatus.Done, label: "Fertig" },
];

export function compareRecurringTasksByStreak(
  a: RecurringTask,
  b: RecurringTask,
): number {
  return b.streakCount - a.streakCount;
}
