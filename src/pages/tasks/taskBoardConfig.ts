import { TaskPriority, TaskStatus, type Task } from "@/api/generated";

export const PRIORITY_SECTIONS: { priority: TaskPriority; label: string }[] = [
  { priority: TaskPriority.ImportantUrgent, label: "Wichtig & Dringend" },
  { priority: TaskPriority.Important, label: "Wichtig" },
  { priority: TaskPriority.Urgent, label: "Dringend" },
  { priority: TaskPriority.None, label: "Andere" },
];

export const STATUS_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: TaskStatus.Todo, label: "To Do" },
  { status: TaskStatus.InProgress, label: "In Bearbeitung" },
  { status: TaskStatus.Review, label: "Review" },
  { status: TaskStatus.Done, label: "Fertig" },
];

export function compareTasksByDeadline(a: Task, b: Task): number {
  const aTime = a.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
  const bTime = b.deadline?.getTime() ?? Number.POSITIVE_INFINITY;

  return aTime - bTime;
}
