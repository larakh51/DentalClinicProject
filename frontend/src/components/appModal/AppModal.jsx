import { useEffect } from "react";
import styles from "./appModal.module.css";

function AppModal({
  open,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onCancel?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel?.();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
      >
        <h2 id="app-modal-title">{title}</h2>

        <p>{message}</p>

        <div className={styles.actions}>
          {showCancel && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className={`${styles.confirmButton} ${
              danger ? styles.dangerButton : ""
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppModal;
