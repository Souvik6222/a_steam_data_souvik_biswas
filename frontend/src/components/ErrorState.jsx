import React from 'react';
import BrutalistButton from './BrutalistButton';

const ErrorState = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-4xl text-danger/60">cloud_off</span>
      </div>
      <h3 className="font-headline text-lg font-semibold text-text-primary mb-2">Connection Error</h3>
      <p className="text-sm text-text-muted mb-6 text-center max-w-sm">{message}</p>
      {onRetry && (
        <BrutalistButton onClick={onRetry} icon="refresh">
          Retry
        </BrutalistButton>
      )}
    </div>
  );
};

export default ErrorState;
