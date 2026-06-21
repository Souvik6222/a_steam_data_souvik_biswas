import React from 'react';

const BrutalistButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  icon,
  iconRight,
  loading = false,
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-headline font-semibold text-sm tracking-wide rounded-xl px-5 py-2.5 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-canvas';

  const variants = {
    primary:
      'nexus-btn-gradient text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]',
    secondary:
      'bg-surface-light text-text-primary border border-border hover:bg-primary/10 hover:border-primary/30',
    danger:
      'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/40',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-light border border-transparent hover:border-border-light',
    accent:
      'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 hover:border-accent/40',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {loading && (
        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
      )}
      {!loading && icon && (
        <span className="material-symbols-outlined text-base">{icon}</span>
      )}
      {children}
      {!loading && iconRight && (
        <span className="material-symbols-outlined text-base">{iconRight}</span>
      )}
    </button>
  );
};

export default BrutalistButton;
