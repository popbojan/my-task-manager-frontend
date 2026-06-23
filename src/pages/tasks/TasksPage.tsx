import "./tasks.css";
import { useMemo, useState, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/authClient";
import { TaskPriority, TaskStatus, type Task } from "@/api/generated";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import TaskFormModal from "./TaskFormModal";
import DeleteTaskModal from "./DeleteTaskModal";
import TaskDeadline from "./TaskDeadline";
import {
  compareTasksByDeadline,
  PRIORITY_SECTIONS,
  STATUS_COLUMNS,
} from "./taskBoardConfig";

type BoardCell = {
  priority: TaskPriority;
  status: TaskStatus;
};

type TaskBoard = Record<TaskPriority, Record<TaskStatus, Task[]>>;

function createEmptyBoard(): TaskBoard {
  return Object.fromEntries(
    PRIORITY_SECTIONS.map(({ priority }) => [
      priority,
      Object.fromEntries(
        STATUS_COLUMNS.map(({ status }) => [status, [] as Task[]]),
      ),
    ]),
  ) as TaskBoard;
}

function groupTasksForBoard(tasks: Task[]): TaskBoard {
  const board = createEmptyBoard();

  for (const task of tasks) {
    board[task.priority][task.status].push(task);
  }

  for (const { priority } of PRIORITY_SECTIONS) {
    for (const { status } of STATUS_COLUMNS) {
      board[priority][status].sort(compareTasksByDeadline);
    }
  }

  return board;
}

function isSameCell(a: BoardCell | null, b: BoardCell): boolean {
  return a?.priority === b.priority && a?.status === b.status;
}

export default function TasksPage() {
  const { accessToken } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    taskId: string | null;
  }>({ isOpen: false, taskId: null });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    task: Task | null;
  }>({ isOpen: false, task: null });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<BoardCell | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => authApi.getTasks(),
    enabled: !!accessToken,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
      priority,
    }: {
      taskId: string;
      status: TaskStatus;
      priority: TaskPriority;
    }) =>
      authApi.updateTask({
        taskId,
        updateTaskRequest: { status, priority },
      }),
    onMutate: async ({ taskId, status, priority }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((task) =>
          task.id === taskId ? { ...task, status, priority } : task,
        ),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => authApi.deleteTask({ taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeDeleteModal();
    },
  });

  const taskBoard = useMemo(
    () => groupTasksForBoard(tasksQuery.data ?? []),
    [tasksQuery.data],
  );

  function handleDragStart(event: DragEvent<HTMLElement>, taskId: string) {
    event.dataTransfer.setData("text/task-id", taskId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setDragOverCell(null);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, cell: BoardCell) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverCell(cell);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, cell: BoardCell) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/task-id");
    setDraggedTaskId(null);
    setDragOverCell(null);

    if (!taskId) {
      return;
    }

    const task = tasksQuery.data?.find((item) => item.id === taskId);
    if (
      !task ||
      (task.status === cell.status && task.priority === cell.priority)
    ) {
      return;
    }

    updateTaskMutation.mutate({
      taskId,
      status: cell.status,
      priority: cell.priority,
    });
  }

  function handleTasksChanged() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  function openCreateModal() {
    setFormModal({ isOpen: true, taskId: null });
  }

  function openEditModal(taskId: string) {
    setFormModal({ isOpen: true, taskId });
  }

  function closeFormModal() {
    setFormModal({ isOpen: false, taskId: null });
  }

  function closeDeleteModal() {
    setDeleteModal({ isOpen: false, task: null });
    deleteTaskMutation.reset();
  }

  function openDeleteModal(task: Task) {
    if (task.status === TaskStatus.Done) {
      return;
    }

    setDeleteModal({ isOpen: true, task });
  }

  function confirmDeleteTask() {
    if (!deleteModal.task || deleteTaskMutation.isPending) {
      return;
    }

    deleteTaskMutation.mutate(deleteModal.task.id);
  }

  return (
    <div className="tasks-page">
      {tasksQuery.isLoading && (
        <p className="tasks-page__state">{t("tasks.loading")}</p>
      )}

      {tasksQuery.isError && (
        <p className="tasks-page__state">{t("tasks.error")}</p>
      )}

      {tasksQuery.isSuccess && (
        <div className="task-board">
          {PRIORITY_SECTIONS.map(({ priority, labelKey }) => {
            const rowTaskCount = STATUS_COLUMNS.reduce(
              (total, { status }) => total + taskBoard[priority][status].length,
              0,
            );

            return (
              <section
                key={priority}
                className={`task-priority-row task-priority-row--${priority}`}
              >
                <header className="task-priority-row__header">
                  <h2 className="task-priority-row__title">{t(labelKey)}</h2>
                  <span className="task-priority-row__count">
                    {rowTaskCount}
                  </span>
                </header>

                <div className="task-priority-row__columns">
                  {STATUS_COLUMNS.map(({ status, labelKey }) => (
                    <div
                      key={status}
                      className={`task-column${isSameCell(dragOverCell, { priority, status }) ? " task-column--drag-over" : ""}`}
                      onDragOver={(event) =>
                        handleDragOver(event, { priority, status })
                      }
                      onDragLeave={() => setDragOverCell(null)}
                      onDrop={(event) => handleDrop(event, { priority, status })}
                    >
                      <header className="task-column__header">
                        <h3 className="task-column__title">{t(labelKey)}</h3>
                        <span className="task-column__count">
                          {taskBoard[priority][status].length}
                        </span>
                      </header>

                      <div className="task-column__cards">
                        {taskBoard[priority][status].map((task) => (
                          <article
                            key={task.id}
                            className={`task-card${draggedTaskId === task.id ? " task-card--dragging" : ""}`}
                            draggable
                            onDragStart={(event) =>
                              handleDragStart(event, task.id)
                            }
                            onDragEnd={handleDragEnd}
                          >
                            <div className="task-card__header">
                              <h4 className="task-card__title">{task.title}</h4>
                              <div className="task-card__actions">
                                <button
                                  type="button"
                                  className="task-card__action task-card__action--edit"
                                  aria-label={t("tasks.edit")}
                                  onClick={() => openEditModal(task.id)}
                                  onMouseDown={(event) =>
                                    event.stopPropagation()
                                  }
                                >
                                  <svg
                                    className="task-card__action-icon"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                  >
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                                  </svg>
                                </button>

                                {task.status !== TaskStatus.Done && (
                                  <button
                                    type="button"
                                    className="task-card__action task-card__action--delete"
                                    aria-label={t("tasks.delete")}
                                    onClick={() => openDeleteModal(task)}
                                    onMouseDown={(event) =>
                                      event.stopPropagation()
                                    }
                                    disabled={deleteTaskMutation.isPending}
                                  >
                                    <svg
                                      className="task-card__action-icon"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                    >
                                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>

                            {task.description && (
                              <p className="task-card__description">
                                {task.description}
                              </p>
                            )}

                            <TaskDeadline deadline={task.deadline} />
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <TaskFormModal
        isOpen={formModal.isOpen}
        taskId={formModal.taskId}
        onClose={closeFormModal}
        onSaved={handleTasksChanged}
      />

      <DeleteTaskModal
        isOpen={deleteModal.isOpen}
        taskTitle={deleteModal.task?.title ?? null}
        isPending={deleteTaskMutation.isPending}
        isError={deleteTaskMutation.isError}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
      />

      <button
        type="button"
        className="tasks-page__fab"
        aria-label={t("tasks.newTask")}
        title={t("tasks.newTask")}
        onClick={openCreateModal}
      >
        <svg className="tasks-page__fab-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  );
}
