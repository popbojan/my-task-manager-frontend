import { TaskPriority, TaskStatus, type Task } from "@/api/generated";
import type { TranslationKey } from "@/i18n/locales";

export const PRIORITY_SECTIONS: {
  priority: TaskPriority;
  labelKey: TranslationKey;
}[] = [
  {
    priority: TaskPriority.ImportantUrgent,
    labelKey: "tasks.priority.importantUrgent",
  },
  { priority: TaskPriority.Important, labelKey: "tasks.priority.important" },
  { priority: TaskPriority.Urgent, labelKey: "tasks.priority.urgent" },
  { priority: TaskPriority.None, labelKey: "tasks.priority.none" },
];

export const STATUS_COLUMNS: {
  status: TaskStatus;
  labelKey: TranslationKey;
}[] = [
  { status: TaskStatus.Todo, labelKey: "tasks.status.todo" },
  { status: TaskStatus.InProgress, labelKey: "tasks.status.inProgress" },
  { status: TaskStatus.Review, labelKey: "tasks.status.review" },
  { status: TaskStatus.Done, labelKey: "tasks.status.done" },
];

export function compareTasksByDeadline(a: Task, b: Task): number {
  const aTime = a.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
  const bTime = b.deadline?.getTime() ?? Number.POSITIVE_INFINITY;

  return aTime - bTime;
}
