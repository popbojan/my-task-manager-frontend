import "@/pages/tasks/create-task-modal.css";
import { useLanguage } from "@/i18n/LanguageProvider";

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
  const { t } = useLanguage();

  if (!isOpen || !taskTitle) {
    return null;
  }

  return (
    <div className="create-task-modal" role="presentation">
      <button
        type="button"
        className="create-task-modal__backdrop"
        aria-label={t("common.close")}
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
            {t("recurring.deleteTask")}
          </h2>
          <button
            type="button"
            className="create-task-modal__close"
            aria-label={t("common.close")}
            onClick={onClose}
            disabled={isPending}
          >
            ×
          </button>
        </header>

        <p className="create-task-modal__message">
          {t("recurring.deleteConfirm", { title: taskTitle })}
        </p>

        {isError && (
          <p className="create-task-modal__error">{t("recurring.deleteError")}</p>
        )}

        <div className="create-task-modal__actions">
          <button
            type="button"
            className="create-task-modal__button create-task-modal__button--secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="create-task-modal__button create-task-modal__button--danger"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? t("common.deleting") : t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
