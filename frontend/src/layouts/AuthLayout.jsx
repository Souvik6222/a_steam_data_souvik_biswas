import React from 'react';
import AuroraBackground from '../components/LuminaBackground';

export const AuthLayout = ({ children, headline = "Welcome to NEXUS" }) => {
  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-canvas font-body select-none relative">
      {/* Left Panel: Aurora Gradient */}
      <section className="relative w-full md:w-1/2 lg:w-3/5 flex flex-col justify-end p-8 md:p-16 overflow-hidden min-h-[300px] md:min-h-screen bg-nexus-hero">
        <AuroraBackground />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Bottom gradient fade */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-70" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/15 text-primary-light px-4 py-1.5 mb-6 font-headline font-semibold text-xs tracking-widest rounded-full border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            SYSTEM ACTIVE
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-[0.9] text-white tracking-tight max-w-2xl">
            {headline.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-[3px] w-20 rounded-full bg-gradient-to-r from-primary to-accent" />
            <p className="font-body text-text-secondary text-sm max-w-xs leading-relaxed">
              Your centralized hub for Steam gaming data, analytics, and insights.
            </p>
          </div>
        </div>
      </section>

      {/* Right Panel: Form */}
      <section className="relative w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-canvas z-10">
        <AuroraBackground />
        <div className="w-full max-w-md mx-auto z-10 nexus-glass rounded-2xl p-8">
          {children}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
