import React from 'react';

export default function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  extraAction,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="actions">
          {extraAction && (
            <button className="ghost" type="button" onClick={extraAction.onClick}>
              {extraAction.label}
            </button>
          )}
          <button className="ghost" type="button" onClick={onCancel}>Cancel</button>
          <button className="primary" type="button" onClick={onConfirm}>Submit</button>
        </div>
      </div>
    </div>
  );
}
