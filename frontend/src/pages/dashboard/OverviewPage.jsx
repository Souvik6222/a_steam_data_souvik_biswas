import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import toast from 'react-hot-toast';

export const OverviewPage = () => {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Total Games', val: '511', icon: 'videogame_asset', gradient: 'from-primary/15 to-accent/10' },
    { label: 'Active Entries', val: '480', icon: 'check_circle', gradient: 'from-success/15 to-success/5' },
    { label: 'Archived', val: '31', icon: 'archive', gradient: 'from-warning/15 to-warning/5' },
    { label: 'Bookmarked', val: '12', icon: 'bookmark', gradient: 'from-accent/15 to-primary/5' },
  ];

  const categories = [
    { label: 'Action', pct: 85, color: 'from-primary to-primary-light' },
    { label: 'RPG', pct: 60, color: 'from-accent to-accent-light' },
    { label: 'Indie', pct: 95, color: 'from-primary to-accent' },
    { label: 'Strategy', pct: 40, color: 'from-primary-light to-primary' },
    { label: 'Simulation', pct: 70, color: 'from-accent-light to-accent' },
    { label: 'Adventure', pct: 50, color: 'from-primary to-primary-dark' },
  ];

  const updates = [
    { time: '08:42', text: 'New games batch imported', type: 'info' },
    { time: '07:15', text: 'Price index updated', type: 'warning' },
    { time: '04:00', text: 'System maintenance complete', type: 'success' },
  ];

  return (
    <div className="flex flex-col select-none space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight mb-2">
          System Overview
        </h1>
        <p className="text-sm text-text-muted">
          A comprehensive look at your gaming data landscape.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className={`nexus-glass rounded-2xl p-6 bg-gradient-to-br ${m.gradient} hover:shadow-glow transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-headline font-semibold text-text-muted uppercase tracking-wider">{m.label}</span>
              <div className="w-9 h-9 rounded-xl bg-surface-light border border-border-light flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-lg">{m.icon}</span>
              </div>
            </div>
            <span className="text-4xl font-headline font-bold text-text-primary">{m.val}</span>
          </div>
        ))}
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution */}
        <div className="lg:col-span-8">
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                Games by Category
              </div>
            }
          >
            <div className="space-y-4">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text-secondary">{cat.label}</span>
                    <span className="font-mono text-text-primary">{cat.pct}%</span>
                  </div>
                  <div className="h-2.5 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BrutalistCard>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Notification card */}
          <div className="nexus-glass rounded-2xl p-5 border-l-4 border-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
              </div>
              <div>
                <h3 className="font-headline font-semibold text-sm text-text-primary">New Update Available</h3>
                <p className="text-[10px] text-text-muted">Data refresh recommended</p>
              </div>
            </div>
            <BrutalistButton
              variant="primary"
              onClick={() => {
                toast.success('Data refresh initiated!');
              }}
              className="w-full"
            >
              Acknowledge & Refresh
            </BrutalistButton>
          </div>

          {/* Status Feed */}
          <BrutalistCard hoverable={false} header="Status Feed">
            <div className="space-y-3">
              {updates.map((up, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border-light/50 last:border-0 last:pb-0">
                  <span className="text-[10px] font-mono text-text-muted mt-0.5 shrink-0">{up.time}</span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    up.type === 'success' ? 'bg-success' : up.type === 'warning' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <span className="text-sm text-text-secondary">{up.text}</span>
                </div>
              ))}
            </div>
          </BrutalistCard>

          {/* Quick action */}
          <div
            onClick={() => navigate('/dashboard/registry')}
            className="nexus-glass rounded-2xl p-5 cursor-pointer group hover:border-primary/25 hover:shadow-glow transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline font-semibold text-lg text-text-primary group-hover:text-primary-light transition-colors">
                  Browse Registry
                </h3>
                <p className="text-xs text-text-muted mt-1">Explore the full game database</p>
              </div>
              <span className="material-symbols-outlined text-2xl text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
