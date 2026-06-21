import React from 'react';

const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Aurora blob 1 — indigo */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-aurora-1"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          top: '-10%',
          right: '-5%',
        }}
      />
      {/* Aurora blob 2 — cyan */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full animate-aurora-2"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          bottom: '-15%',
          left: '-10%',
        }}
      />
      {/* Aurora blob 3 — violet */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full animate-aurora-3"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          top: '40%',
          left: '30%',
        }}
      />
    </div>
  );
};

export default AuroraBackground;
