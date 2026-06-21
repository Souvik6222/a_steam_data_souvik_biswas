import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleCTA = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  const features = [
    { icon: 'monitoring', title: 'Real-time Analytics', desc: 'Track gaming trends, revenue, and user engagement with live data feeds.' },
    { icon: 'stacks', title: 'Game Registry', desc: 'Browse, search, and manage a comprehensive database of Steam games.' },
    { icon: 'insights', title: 'Deep Insights', desc: 'Genre distributions, platform analytics, and revenue breakdowns.' },
  ];

  return (
    <div className="min-h-screen font-body flex flex-col relative select-none bg-canvas overflow-x-hidden">

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-light" style={{ background: 'rgba(11, 17, 32, 0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg nexus-btn-gradient flex items-center justify-center shadow-glow">
              <span className="material-symbols-outlined text-white text-lg">hub</span>
            </div>
            <span className="font-headline font-bold text-lg tracking-tight text-text-primary">NEXUS</span>
          </div>
          <nav className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium px-3 py-1.5">
                  Dashboard
                </Link>
                <Link to="/dashboard/registry" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium px-3 py-1.5">
                  Registry
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium px-3 py-1.5">
                  Sign In
                </Link>
                <Link to="/register" className="nexus-btn-gradient text-white text-sm font-headline font-semibold px-5 py-2 rounded-xl shadow-glow transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-nexus-hero overflow-hidden">
        {/* Aurora blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[700px] h-[700px] rounded-full animate-aurora-1" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', top: '-15%', right: '-10%' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full animate-aurora-2" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', bottom: '-10%', left: '-5%' }} />
          <div className="absolute w-[500px] h-[500px] rounded-full animate-aurora-3" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', top: '30%', left: '40%' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary-light px-4 py-1.5 rounded-full border border-primary/15 text-xs font-headline font-semibold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              STEAM DATA ANALYTICS PLATFORM
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-bold leading-[1.05] tracking-tight text-white">
              Unlock the
              <br />
              <span className="nexus-gradient-text">power of</span>
              <br />
              gaming data.
            </h1>

            <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
              Explore comprehensive Steam analytics, track trending games, and discover insights that drive smarter decisions in the gaming industry.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-t border-b border-border-light">
              <div>
                <div className="text-2xl md:text-3xl font-headline font-bold text-white">12K+</div>
                <div className="text-xs text-text-muted mt-1">Games Indexed</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-headline font-bold text-white">8.4</div>
                <div className="text-xs text-text-muted mt-1">Avg Rating</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-headline font-bold text-white">24/7</div>
                <div className="text-xs text-text-muted mt-1">Live Updates</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleCTA}
                className="nexus-btn-gradient text-white font-headline font-semibold px-8 py-3.5 rounded-xl shadow-glow transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center gap-2 text-sm cursor-pointer"
              >
                Explore Dashboard
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard/overview' : '/register')}
                className="text-text-secondary hover:text-text-primary font-headline font-semibold flex items-center gap-2 transition-colors text-sm cursor-pointer border border-border-light rounded-xl px-6 py-3.5 hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="material-symbols-outlined text-lg text-primary">play_circle</span>
                View Analytics
              </button>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="space-y-4">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-5 flex items-start gap-4 group hover:border-primary/25 transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">{feat.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-sm text-text-primary mb-1">{feat.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}

            {/* Live status card */}
            <div className="glass-card rounded-2xl p-5 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-headline font-semibold text-text-primary uppercase tracking-wider">Live Signal</span>
                </div>
                <span className="text-[10px] font-mono text-accent">ACTIVE</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Data Sync</span>
                    <span className="text-text-primary">94%</span>
                  </div>
                  <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent w-[94%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>API Health</span>
                    <span className="text-text-primary">99%</span>
                  </div>
                  <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-success w-[99%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-xs text-text-muted font-mono">© {new Date().getFullYear()} NEXUS — Steam Analytics Hub</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-text-muted font-mono">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
