import React from 'react';

const EmptyState = ({ message = 'No items found', icon = 'inbox', action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-surface-light border border-border-light flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-4xl text-text-muted/40">{icon}</span>
      </div>
      <p className="font-headline text-lg font-semibold text-text-secondary mb-2">{message}</p>
      <p className="text-sm text-text-muted mb-6">Try adjusting your filters or creating a new entry.</p>
      {action && action}
    </div>
  );
};

export default EmptyState;
