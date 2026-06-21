import React from 'react';

const StatCard = ({
  num,
  label,
  value,
  title,
  icon,
  variant = 'default',
  progress,
  segments,
  statusText,
  watermarkIcon,
}) => {
  const gradients = {
    light: 'from-primary/10 to-accent/5 border-primary/15',
    primary: 'from-primary/15 to-primary/5 border-primary/20',
    dark: 'from-surface-light to-surface border-border-light',
    default: 'from-surface-light to-surface border-border-light',
  };

  const iconColors = {
    light: 'text-primary',
    primary: 'text-primary-light',
    dark: 'text-accent',
    default: 'text-text-muted',
  };

  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br ${gradients[variant]} p-6 overflow-hidden transition-all duration-300 hover:shadow-glow group`}
      style={{ backdropFilter: 'blur(16px)' }}
    >
      {/* Watermark icon */}
      {watermarkIcon && (
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[80px] text-primary/5 pointer-events-none select-none">
          {watermarkIcon}
        </span>
      )}

      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {num && (
            <span className="text-[10px] font-mono text-text-muted bg-surface-light px-2 py-0.5 rounded-full border border-border-light">
              {num}
            </span>
          )}
          {label && (
            <span className="text-[10px] font-headline font-semibold uppercase tracking-widest text-text-muted">
              {label}
            </span>
          )}
        </div>
        <div className={`w-9 h-9 rounded-xl bg-surface-light border border-border-light flex items-center justify-center ${iconColors[variant]} group-hover:border-primary/30 transition-colors`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-1">
        <h3 className="text-3xl font-headline font-bold text-text-primary tracking-tight">{value}</h3>
      </div>

      {/* Title */}
      {title && (
        <p className="text-xs font-body text-text-muted mb-3">{title}</p>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Segments */}
      {segments && (
        <div className="flex gap-1.5 mt-3">
          {Array.from({ length: segments.total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i < segments.active
                  ? 'bg-gradient-to-r from-primary to-primary-light'
                  : 'bg-surface-light'
              }`}
            />
          ))}
        </div>
      )}

      {/* Status text */}
      {statusText && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className="material-symbols-outlined text-sm text-success">trending_up</span>
          <span className="text-[10px] font-mono text-success">{statusText}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
