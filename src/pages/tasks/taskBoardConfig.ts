import { TaskPriority, TaskStatus, type Task } from "@/api/generated";
import type { TranslationKey } from "@/i18n/locales";
import type { ComponentType } from "react";
import {
  RowIconBolt,
  RowIconFlame,
  RowIconFolder,
  RowIconStar,
} from "@/pages/recurring-tasks/recurringPremiumIcons";

export type PriorityIcon = ComponentType<{ className?: string }>;

export const PRIORITY_SECTIONS: {
  priority: TaskPriority;
  labelKey: TranslationKey;
  Icon: PriorityIcon;
}[] = [
  {
    priority: TaskPriority.ImportantUrgent,
    labelKey: "tasks.priority.importantUrgent",
    Icon: RowIconFlame,
  },
  {
    priority: TaskPriority.Important,
    labelKey: "tasks.priority.important",
    Icon: RowIconStar,
  },
  {
    priority: TaskPriority.Urgent,
    labelKey: "tasks.priority.urgent",
    Icon: RowIconBolt,
  },
  {
    priority: TaskPriority.None,
    labelKey: "tasks.priority.none",
    Icon: RowIconFolder,
  },
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
