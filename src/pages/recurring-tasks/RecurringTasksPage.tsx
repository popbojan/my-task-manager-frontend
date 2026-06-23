import "./recurring-tasks.css";
import { useMemo, useState, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/authClient";
import {
  RecurringFrequency,
  RecurringTaskStatus,
  type RecurringTask,
} from "@/api/generated";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/i18n/LanguageProvider";
import RecurringTaskFormModal from "./RecurringTaskFormModal";
import DeleteRecurringTaskModal from "./DeleteRecurringTaskModal";
import RecurringTaskStreak from "./RecurringTaskStreak";
import {
  compareRecurringTasksByStreak,
  FREQUENCY_SECTIONS,
  STATUS_COLUMNS,
} from "./recurringBoardConfig";
import {
  StatIconChart,
  StatIconCheck,
  StatIconFlame,
  StatIconStar,
  RowIconBolt,
} from "./recurringPremiumIcons";
import { getGlobalScoreTier } from "./streakDisplay";

type BoardCell = {
  frequency: RecurringFrequency;
  status: RecurringTaskStatus;
};

type RecurringBoard = Record<
  RecurringFrequency,
  Record<RecurringTaskStatus, RecurringTask[]>
>;

function createEmptyBoard(): RecurringBoard {
  return Object.fromEntries(
    FREQUENCY_SECTIONS.map(({ frequency }) => [
      frequency,
      Object.fromEntries(
        STATUS_COLUMNS.map(({ status }) => [status, [] as RecurringTask[]]),
      ),
    ]),
  ) as RecurringBoard;
}

function groupRecurringTasksForBoard(tasks: RecurringTask[]): RecurringBoard {
  const board = createEmptyBoard();

  for (const task of tasks) {
    board[task.frequency][task.status].push(task);
  }

  for (const { frequency } of FREQUENCY_SECTIONS) {
    for (const { status } of STATUS_COLUMNS) {
      board[frequency][status].sort(compareRecurringTasksByStreak);
    }
  }

  return board;
}

function isSameCell(a: BoardCell | null, b: BoardCell): boolean {
  return a?.frequency === b.frequency && a?.status === b.status;
}

function formatResetDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function RecurringTasksPage() {
  const { accessToken } = useAuth();
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    taskId: string | null;
  }>({ isOpen: false, taskId: null });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    task: RecurringTask | null;
  }>({ isOpen: false, task: null });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<BoardCell | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["recurring-tasks"],
    queryFn: () => authApi.getRecurringTasks(),
    enabled: !!accessToken,
  });

  const progressQuery = useQuery({
    queryKey: ["recurring-task-progress"],
    queryFn: () => authApi.getRecurringTaskProgress(),
    enabled: !!accessToken,
  });

  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!accessToken,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      recurringTaskId,
      status,
    }: {
      recurringTaskId: string;
      status: RecurringTaskStatus;
    }) =>
      authApi.updateRecurringTask({
        recurringTaskId,
        updateRecurringTaskRequest: { status },
      }),
    onMutate: async ({ recurringTaskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["recurring-tasks"] });
      const previous = queryClient.getQueryData<RecurringTask[]>([
        "recurring-tasks",
      ]);

      queryClient.setQueryData<RecurringTask[]>(
        ["recurring-tasks"],
        (old = []) =>
          old.map((task) =>
            task.id === recurringTaskId ? { ...task, status } : task,
          ),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["recurring-tasks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-task-progress"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (recurringTaskId: string) =>
      authApi.deleteRecurringTask({ recurringTaskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-task-progress"] });
      closeDeleteModal();
    },
  });

  const taskBoard = useMemo(
    () => groupRecurringTasksForBoard(tasksQuery.data ?? []),
    [tasksQuery.data],
  );

  const frequencyCounts = useMemo(() => {
    const counts = Object.fromEntries(
      FREQUENCY_SECTIONS.map(({ frequency }) => [frequency, 0]),
    ) as Record<RecurringFrequency, number>;

    for (const task of tasksQuery.data ?? []) {
      counts[task.frequency] += 1;
    }

    return counts;
  }, [tasksQuery.data]);

  const globalScore = progressQuery.data?.allTasksStreak ?? 0;
  const globalScoreTier = getGlobalScoreTier(globalScore);
  const totalTasks = tasksQuery.data?.length ?? 0;
  const userEmail = userQuery.data?.email ?? "…";

  function handleDragStart(event: DragEvent<HTMLElement>, taskId: string) {
    event.dataTransfer.setData("text/recurring-task-id", taskId);
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

    const taskId = event.dataTransfer.getData("text/recurring-task-id");
    setDraggedTaskId(null);
    setDragOverCell(null);

    if (!taskId) {
      return;
    }

    const task = tasksQuery.data?.find((item) => item.id === taskId);
    if (!task || task.status === cell.status || task.frequency !== cell.frequency) {
      return;
    }

    updateTaskMutation.mutate({
      recurringTaskId: taskId,
      status: cell.status,
    });
  }

  function handleTasksChanged() {
    queryClient.invalidateQueries({ queryKey: ["recurring-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["recurring-task-progress"] });
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

  function openDeleteModal(task: RecurringTask) {
    setDeleteModal({ isOpen: true, task });
  }

  function confirmDeleteTask() {
    if (!deleteModal.task || deleteTaskMutation.isPending) {
      return;
    }

    deleteTaskMutation.mutate(deleteModal.task.id);
  }

  const isLoading = tasksQuery.isLoading || progressQuery.isLoading;
  const isError = tasksQuery.isError || progressQuery.isError;
  const isSuccess = tasksQuery.isSuccess && progressQuery.isSuccess;

  return (
    <div className="recurring-tasks-page">
      <section className="recurring-hero">
        <div className="recurring-hero__overlay" aria-hidden="true" />
        <div className="recurring-hero__content">
          <div className="recurring-hero__welcome">
            <h1 className="recurring-hero__greeting">
              {t("recurring.hello", { email: userEmail })}
            </h1>
            <p className="recurring-hero__summary">
              {t("recurring.summary", {
                total: String(totalTasks),
                streak: String(globalScore),
              })}
            </p>
            <p className="recurring-hero__tagline">{t("recurring.tagline")}</p>
          </div>
        </div>
      </section>

      <div className="recurring-tasks-page__body">
        {isSuccess && (
          <div className="recurring-page__stats">
            <article
              className={`recurring-stat-card recurring-stat-card--score recurring-stat-card--${globalScoreTier}`}
            >
              <div
                className="recurring-stat-card__icon-wrap recurring-stat-card__icon-wrap--orange"
                aria-hidden="true"
              >
                <StatIconFlame className="recurring-stat-card__icon" />
              </div>
              <span className="recurring-stat-card__label">
                {t("recurring.score.total")}
              </span>
              <strong className="recurring-stat-card__value">{globalScore}</strong>
              <span className="recurring-stat-card__hint">
                {t("recurring.score.subtitle")}
              </span>
            </article>
            <article className="recurring-stat-card recurring-stat-card--daily">
              <div
                className="recurring-stat-card__icon-wrap recurring-stat-card__icon-wrap--green"
                aria-hidden="true"
              >
                <StatIconChart className="recurring-stat-card__icon" />
              </div>
              <span className="recurring-stat-card__label">
                {t("recurring.score.daily")}
              </span>
              <strong className="recurring-stat-card__value">
                {frequencyCounts[RecurringFrequency.Daily]}
              </strong>
              <span className="recurring-stat-card__hint">
                {t("recurring.stats.dailyHint")}
              </span>
            </article>
            <article className="recurring-stat-card recurring-stat-card--weekly">
              <div
                className="recurring-stat-card__icon-wrap recurring-stat-card__icon-wrap--blue"
                aria-hidden="true"
              >
                <StatIconStar className="recurring-stat-card__icon" />
              </div>
              <span className="recurring-stat-card__label">
                {t("recurring.score.weekly")}
              </span>
              <strong className="recurring-stat-card__value">
                {frequencyCounts[RecurringFrequency.Weekly]}
              </strong>
              <span className="recurring-stat-card__hint">
                {t("recurring.stats.weeklyHint")}
              </span>
            </article>
            <article className="recurring-stat-card recurring-stat-card--monthly">
              <div
                className="recurring-stat-card__icon-wrap recurring-stat-card__icon-wrap--yellow"
                aria-hidden="true"
              >
                <RowIconBolt className="recurring-stat-card__icon" />
              </div>
              <span className="recurring-stat-card__label">
                {t("recurring.score.monthly")}
              </span>
              <strong className="recurring-stat-card__value">
                {frequencyCounts[RecurringFrequency.Monthly]}
              </strong>
              <span className="recurring-stat-card__hint">
                {t("recurring.stats.monthlyHint")}
              </span>
            </article>
          </div>
        )}

        {isLoading && (
          <p className="recurring-tasks-page__state">{t("recurring.loading")}</p>
        )}

        {isError && (
          <p className="recurring-tasks-page__state">{t("recurring.error")}</p>
        )}

        {isSuccess && (
          <div className="recurring-board">
          {FREQUENCY_SECTIONS.map(({ frequency, labelKey, Icon }) => {
            const rowTaskCount = STATUS_COLUMNS.reduce(
              (total, { status }) =>
                total + taskBoard[frequency][status].length,
              0,
            );

            return (
              <section
                key={frequency}
                className={`recurring-frequency-row recurring-frequency-row--${frequency}`}
              >
                <header className="recurring-frequency-row__header">
                  <div className="recurring-frequency-row__title-wrap">
                    <span
                      className="recurring-frequency-row__icon"
                      aria-hidden="true"
                    >
                      <Icon className="recurring-frequency-row__icon-svg" />
                    </span>
                    <h2 className="recurring-frequency-row__title">
                      {t(labelKey)}
                    </h2>
                  </div>
                  <span className="recurring-frequency-row__count">
                    {rowTaskCount}
                  </span>
                </header>

                <div className="recurring-frequency-row__columns">
                  {STATUS_COLUMNS.map(({ status, labelKey }) => (
                    <div
                      key={status}
                      className={`recurring-column${isSameCell(dragOverCell, { frequency, status }) ? " recurring-column--drag-over" : ""}`}
                      onDragOver={(event) =>
                        handleDragOver(event, { frequency, status })
                      }
                      onDragLeave={() => setDragOverCell(null)}
                      onDrop={(event) =>
                        handleDrop(event, { frequency, status })
                      }
                    >
                      <header className="recurring-column__header">
                        <h3 className="recurring-column__title">
                          {t(labelKey)}
                        </h3>
                        <span className="recurring-column__count">
                          {taskBoard[frequency][status].length}
                        </span>
                      </header>

                      <div className="recurring-column__cards">
                        {taskBoard[frequency][status].length === 0 ? (
                          <p className="recurring-column__empty">
                            {t("recurring.noTasks")}
                          </p>
                        ) : (
                          taskBoard[frequency][status].map((task) => (
                            <article
                              key={task.id}
                              className={`recurring-card${draggedTaskId === task.id ? " recurring-card--dragging" : ""}`}
                              draggable
                              onDragStart={(event) =>
                                handleDragStart(event, task.id)
                              }
                              onDragEnd={handleDragEnd}
                            >
                              <div className="recurring-card__header">
                                <h4 className="recurring-card__title">
                                  {task.title}
                                </h4>
                                <div className="recurring-card__actions">
                                  <button
                                    type="button"
                                    className="recurring-card__action recurring-card__action--edit"
                                    aria-label={t("recurring.edit")}
                                    onClick={() => openEditModal(task.id)}
                                    onMouseDown={(event) =>
                                      event.stopPropagation()
                                    }
                                  >
                                    <svg
                                      className="recurring-card__action-icon"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                    >
                                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                                    </svg>
                                  </button>

                                  <button
                                    type="button"
                                    className="recurring-card__action recurring-card__action--delete"
                                    aria-label={t("recurring.delete")}
                                    onClick={() => openDeleteModal(task)}
                                    onMouseDown={(event) =>
                                      event.stopPropagation()
                                    }
                                    disabled={deleteTaskMutation.isPending}
                                  >
                                    <svg
                                      className="recurring-card__action-icon"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                    >
                                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {task.description && (
                                <p className="recurring-card__description">
                                  {task.description}
                                </p>
                              )}

                              <RecurringTaskStreak
                                streakCount={task.streakCount}
                                tagLabel={t("recurring.streak.label")}
                              />

                              <p className="recurring-card__reset">
                                <svg
                                  className="recurring-card__reset-icon"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
                                </svg>
                                {t("recurring.nextReset", {
                                  date: formatResetDate(task.nextResetAt, locale),
                                })}
                              </p>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      </div>

      <RecurringTaskFormModal
        isOpen={formModal.isOpen}
        taskId={formModal.taskId}
        onClose={closeFormModal}
        onSaved={handleTasksChanged}
      />

      <DeleteRecurringTaskModal
        isOpen={deleteModal.isOpen}
        taskTitle={deleteModal.task?.title ?? null}
        isPending={deleteTaskMutation.isPending}
        isError={deleteTaskMutation.isError}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
      />

      <button
        type="button"
        className="recurring-tasks-page__fab"
        aria-label={t("recurring.newTask")}
        title={t("recurring.newTask")}
        onClick={openCreateModal}
      >
        <svg
          className="recurring-tasks-page__fab-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  );
}
