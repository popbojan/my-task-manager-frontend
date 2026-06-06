import "@/pages/tasks/create-task-modal.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { authApi } from "@/api/authClient";
import {
  RecurringFrequency,
  RecurringTaskStatus,
} from "@/api/generated";
import {
  FREQUENCY_SECTIONS,
  STATUS_COLUMNS,
} from "./recurringBoardConfig";
import { recurringTaskToFormState } from "./recurringTaskFormUtils";

type RecurringTaskFormModalProps = {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  status: RecurringTaskStatus;
  frequency: RecurringFrequency;
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  status: RecurringTaskStatus.Todo,
  frequency: RecurringFrequency.Daily,
};

export default function RecurringTaskFormModal({
  isOpen,
  taskId,
  onClose,
  onSaved,
}: RecurringTaskFormModalProps) {
  const isEditMode = taskId !== null;
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const taskQuery = useQuery({
    queryKey: ["recurring-task", taskId],
    queryFn: () => authApi.getRecurringTask({ recurringTaskId: taskId! }),
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
      setForm(recurringTaskToFormState(taskQuery.data));
    }
  }, [isOpen, isEditMode, taskQuery.data]);

  const saveTaskMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        frequency: form.frequency,
        ...(isEditMode ? { status: form.status } : {}),
      };

      if (isEditMode) {
        return authApi.updateRecurringTask({
          recurringTaskId: taskId!,
          updateRecurringTaskRequest: payload,
        });
      }

      return authApi.createRecurringTask({
        createRecurringTaskRequest: payload,
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
        aria-labelledby="recurring-task-form-title"
      >
        <header className="create-task-modal__header">
          <h2 id="recurring-task-form-title" className="create-task-modal__title">
            {isEditMode
              ? "Wiederholende Aufgabe bearbeiten"
              : "Neue wiederholende Aufgabe"}
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
              <label htmlFor="recurring-task-title">Titel *</label>
              <input
                id="recurring-task-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Was soll regelmäßig erledigt werden?"
                autoFocus
                required
              />
            </div>

            <div className="create-task-modal__field">
              <label htmlFor="recurring-task-description">Beschreibung</label>
              <textarea
                id="recurring-task-description"
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
                <label htmlFor="recurring-task-frequency">Wiederholung *</label>
                <select
                  id="recurring-task-frequency"
                  value={form.frequency}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      frequency: event.target.value as RecurringFrequency,
                    }))
                  }
                >
                  {FREQUENCY_SECTIONS.map(({ frequency, label }) => (
                    <option key={frequency} value={frequency}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <div className="create-task-modal__field">
                  <label htmlFor="recurring-task-status">Status</label>
                  <select
                    id="recurring-task-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as RecurringTaskStatus,
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
              )}
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
