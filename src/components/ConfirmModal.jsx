import { useEffect } from "react";

export default function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onCancel, danger = true }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: "420px" }}>
        <div className="modal-header" style={{ borderBottom: danger ? "1px solid rgba(239,68,68,0.3)" : "1px solid var(--border)" }}>
          <h3 style={{ color: danger ? "#fca5a5" : "var(--white)" }}>{title}</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text)", fontSize: "15px", lineHeight: 1.6, marginBottom: "24px" }}>
            {message}
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button
              className="btn"
              style={danger
                ? { background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)" }
                : { background: "var(--blue)", color: "var(--deep)" }
              }
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}