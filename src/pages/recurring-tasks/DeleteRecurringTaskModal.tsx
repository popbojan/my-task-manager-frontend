import "@/pages/tasks/create-task-modal.css";

type DeleteRecurringTaskModalProps = {
  isOpen: boolean;
  taskTitle: string | null;
  isPending: boolean;
  isError: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteRecurringTaskModal({
  isOpen,
  taskTitle,
  isPending,
  isError,
  onClose,
  onConfirm,
}: DeleteRecurringTaskModalProps) {
  if (!isOpen || !taskTitle) {
    return null;
  }

  return (
    <div className="create-task-modal" role="presentation">
      <button
        type="button"
        className="create-task-modal__backdrop"
        aria-label="Dialog schließen"
        onClick={onClose}
        disabled={isPending}
      />

      <div
        className="create-task-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-recurring-task-title"
      >
        <header className="create-task-modal__header">
          <h2
            id="delete-recurring-task-title"
            className="create-task-modal__title"
          >
            Wiederholende Aufgabe löschen
          </h2>
          <button
            type="button"
            className="create-task-modal__close"
            aria-label="Schließen"
            onClick={onClose}
            disabled={isPending}
          >
            ×
          </button>
        </header>

        <p className="create-task-modal__message">
          Möchtest du die Aufgabe <strong>„{taskTitle}"</strong> wirklich
          löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>

        {isError && (
          <p className="create-task-modal__error">
            Aufgabe konnte nicht gelöscht werden.
          </p>
        )}

        <div className="create-task-modal__actions">
          <button
            type="button"
            className="create-task-modal__button create-task-modal__button--secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="create-task-modal__button create-task-modal__button--danger"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Lösche…" : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
