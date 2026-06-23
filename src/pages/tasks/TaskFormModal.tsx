import "./create-task-modal.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { authApi } from "@/api/authClient";
import { TaskPriority, TaskStatus } from "@/api/generated";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PRIORITY_SECTIONS, STATUS_COLUMNS } from "./taskBoardConfig";
import { taskToFormState } from "./taskFormUtils";

type TaskFormModalProps = {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  status: TaskStatus.Todo,
  priority: TaskPriority.None,
  deadline: "",
};

export default function TaskFormModal({
  isOpen,
  taskId,
  onClose,
  onSaved,
}: TaskFormModalProps) {
  const { t } = useLanguage();
  const isEditMode = taskId !== null;
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const taskQuery = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => authApi.getTask({ taskId: taskId! }),
    enabled: isOpen && isEditMode,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!isEditMode) {
      setForm(INITIAL_FORM);
      return;
    }

    if (taskQuery.data) {
      setForm(taskToFormState(taskQuery.data));
    }
  }, [isOpen, isEditMode, taskQuery.data]);

  const saveTaskMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        deadline: new Date(form.deadline),
      };

      if (isEditMode) {
        return authApi.updateTask({
          taskId: taskId!,
          updateTaskRequest: payload,
        });
      }

      return authApi.createTask({
        createTaskRequest: payload,
      });
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  if (!isOpen) {
    return null;
  }

  const isLoadingTask = isEditMode && taskQuery.isLoading;
  const isLoadError = isEditMode && taskQuery.isError;
  const canSubmit =
    form.title.trim() &&
    form.deadline &&
    !saveTaskMutation.isPending &&
    !isLoadingTask &&
    !isLoadError;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    saveTaskMutation.mutate();
  }

  return (
    <div className="create-task-modal" role="presentation">
      <button
        type="button"
        className="create-task-modal__backdrop"
        aria-label={t("common.close")}
        onClick={onClose}
      />

      <div
        className="create-task-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <header className="create-task-modal__header">
          <h2 id="task-form-title" className="create-task-modal__title">
            {isEditMode ? t("tasks.editTask") : t("tasks.createTask")}
          </h2>
          <button
            type="button"
            className="create-task-modal__close"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {isLoadingTask && (
          <p className="create-task-modal__state">{t("tasks.loadingTask")}</p>
        )}

        {isLoadError && (
          <p className="create-task-modal__error">{t("tasks.loadError")}</p>
        )}

        {!isLoadingTask && !isLoadError && (
          <form className="create-task-modal__form" onSubmit={handleSubmit}>
            <div className="create-task-modal__field">
              <label htmlFor="task-title">{t("tasks.title")} *</label>
              <input
                id="task-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder={t("tasks.titlePlaceholder")}
                autoFocus
                required
              />
            </div>

            <div className="create-task-modal__field">
              <label htmlFor="task-description">{t("tasks.description")}</label>
              <textarea
                id="task-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder={t("tasks.descriptionPlaceholder")}
                rows={4}
              />
            </div>

            <div className="create-task-modal__row">
              <div className="create-task-modal__field">
                <label htmlFor="task-status">{t("tasks.status")}</label>
                <select
                  id="task-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as TaskStatus,
                    }))
                  }
                >
                  {STATUS_COLUMNS.map(({ status, labelKey }) => (
                    <option key={status} value={status}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-task-modal__field">
                <label htmlFor="task-priority">{t("tasks.priority")}</label>
                <select
                  id="task-priority"
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as TaskPriority,
                    }))
                  }
                >
                  {PRIORITY_SECTIONS.map(({ priority, labelKey }) => (
                    <option key={priority} value={priority}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="create-task-modal__field">
              <label htmlFor="task-deadline">{t("tasks.deadline")} *</label>
              <input
                id="task-deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deadline: event.target.value,
                  }))
                }
                required
              />
            </div>

            {saveTaskMutation.isError && (
              <p className="create-task-modal__error">
                {isEditMode ? t("tasks.saveError") : t("tasks.createError")}
              </p>
            )}

            <div className="create-task-modal__actions">
              <button
                type="button"
                className="create-task-modal__button create-task-modal__button--secondary"
                onClick={onClose}
                disabled={saveTaskMutation.isPending}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="create-task-modal__button create-task-modal__button--primary"
                disabled={!canSubmit}
              >
                {saveTaskMutation.isPending
                  ? t("common.saving")
                  : t("common.save")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
