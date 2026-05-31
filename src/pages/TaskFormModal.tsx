import "./create-task-modal.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { authApi } from "../api/authClient";
import { TaskPriority, TaskStatus } from "../api/generated";
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
        aria-label="Dialog schließen"
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
            {isEditMode ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
          </h2>
          <button
            type="button"
            className="create-task-modal__close"
            aria-label="Schließen"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {isLoadingTask && (
          <p className="create-task-modal__state">Lade Aufgabe…</p>
        )}

        {isLoadError && (
          <p className="create-task-modal__error">
            Aufgabe konnte nicht geladen werden.
          </p>
        )}

        {!isLoadingTask && !isLoadError && (
          <form className="create-task-modal__form" onSubmit={handleSubmit}>
            <div className="create-task-modal__field">
              <label htmlFor="task-title">Titel *</label>
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
                placeholder="Was soll erledigt werden?"
                autoFocus
                required
              />
            </div>

            <div className="create-task-modal__field">
              <label htmlFor="task-description">Beschreibung</label>
              <textarea
                id="task-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Optionale Details…"
                rows={4}
              />
            </div>

            <div className="create-task-modal__row">
              <div className="create-task-modal__field">
                <label htmlFor="task-status">Status</label>
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
                  {STATUS_COLUMNS.map(({ status, label }) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-task-modal__field">
                <label htmlFor="task-priority">Priorität</label>
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
                  {PRIORITY_SECTIONS.map(({ priority, label }) => (
                    <option key={priority} value={priority}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="create-task-modal__field">
              <label htmlFor="task-deadline">Deadline *</label>
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
                {isEditMode
                  ? "Aufgabe konnte nicht gespeichert werden."
                  : "Aufgabe konnte nicht erstellt werden."}
              </p>
            )}

            <div className="create-task-modal__actions">
              <button
                type="button"
                className="create-task-modal__button create-task-modal__button--secondary"
                onClick={onClose}
                disabled={saveTaskMutation.isPending}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="create-task-modal__button create-task-modal__button--primary"
                disabled={!canSubmit}
              >
                {saveTaskMutation.isPending ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
