import React from 'react';

const BrutalistCard = ({
  children,
  header,
  hoverable = true,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`nexus-glass rounded-2xl overflow-hidden transition-all duration-300
        ${hoverable ? 'hover:border-primary/25 hover:shadow-glow cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
    >
      {header && (
        <div className="px-5 py-4 border-b border-border-light font-headline font-semibold text-xs uppercase tracking-wider text-text-secondary">
          {header}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default BrutalistCard;
