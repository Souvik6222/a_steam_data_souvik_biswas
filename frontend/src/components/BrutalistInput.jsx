import React from 'react';

const BrutalistInput = ({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon,
  className = '',
  ...rest
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="block font-headline text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          id={id || name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3.5 font-body text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          {...rest}
        />
        {icon && (
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/50 group-focus-within:text-primary/70 transition-colors pointer-events-none text-xl">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-danger text-xs font-mono flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default BrutalistInput;
