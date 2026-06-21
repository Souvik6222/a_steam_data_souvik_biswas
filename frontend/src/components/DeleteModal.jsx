import React from 'react';
import BrutalistButton from './BrutalistButton';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDuration: '0.2s' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative nexus-glass rounded-2xl p-6 w-full max-w-md animate-fade-in-up"
        style={{ animationDuration: '0.3s' }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-danger text-xl">warning</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-text-primary">
              {title || 'Confirm Deletion'}
            </h3>
            <p className="text-sm text-text-muted mt-1">
              {message || 'This action cannot be undone. Are you sure you want to proceed?'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <BrutalistButton variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </BrutalistButton>
          <BrutalistButton variant="danger" onClick={onConfirm} loading={loading}>
            Delete
          </BrutalistButton>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
