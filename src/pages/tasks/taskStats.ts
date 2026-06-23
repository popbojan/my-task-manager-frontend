import { TaskStatus, type Task } from "@/api/generated";

export type TaskPageStats = {
  open: number;
  overdue: number;
  completedToday: number;
  streak: number;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function computeCompletionStreak(tasks: Task[]): number {
  const doneDays = new Set(
    tasks
      .filter((task) => task.status === TaskStatus.Done)
      .map((task) => startOfDay(task.updatedAt).getTime()),
  );

  let streak = 0;
  const cursor = startOfDay(new Date());

  while (doneDays.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function computeTaskPageStats(tasks: Task[]): TaskPageStats {
  const now = new Date();
  const today = startOfDay(now);

  const open = tasks.filter((task) => task.status !== TaskStatus.Done).length;
  const overdue = tasks.filter(
    (task) =>
      task.status !== TaskStatus.Done &&
      task.deadline != null &&
      task.deadline < now,
  ).length;
  const completedToday = tasks.filter(
    (task) =>
      task.status === TaskStatus.Done && isSameDay(task.updatedAt, today),
  ).length;

  return {
    open,
    overdue,
    completedToday,
    streak: computeCompletionStreak(tasks),
  };
}
