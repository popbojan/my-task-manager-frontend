import type { RecurringTask } from "@/api/generated";

export function recurringTaskToFormState(task: RecurringTask) {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    frequency: task.frequency,
  };
}
