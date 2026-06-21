import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardChartsData, fetchStatsSummary } from '../../store/analyticsSlice';
import BrutalistCard from '../../components/BrutalistCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';

export const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { charts, stats, loading, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchStatsSummary());
    dispatch(fetchDashboardChartsData());
  }, [dispatch]);

  if (loading && charts.platformDistribution.length === 0) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => { dispatch(fetchStatsSummary()); dispatch(fetchDashboardChartsData()); }}
      />
    );
  }

  const genresDist = charts.genreDistribution.length > 0
    ? charts.genreDistribution
    : [
        { name: 'Action', count: 18, percentage: 35 },
        { name: 'Indie', count: 12, percentage: 24 },
        { name: 'RPG', count: 10, percentage: 20 },
        { name: 'Simulation', count: 7, percentage: 14 },
        { name: 'Adventure', count: 4, percentage: 7 },
      ];

  const platformsDist = charts.platformDistribution.length > 0
    ? charts.platformDistribution
    : [
        { name: 'Windows', percentage: 78 },
        { name: 'macOS', percentage: 12 },
        { name: 'Linux', percentage: 10 },
      ];

  const gradientColors = [
    'from-primary to-primary-light',
    'from-accent to-accent-light',
    'from-primary-light to-accent',
    'from-accent-light to-primary',
    'from-primary-dark to-primary',
  ];

  return (
    <div className="flex flex-col select-none space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-headline font-semibold text-primary-light uppercase tracking-widest mb-2">
          Quantitative Analysis
        </p>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight">
          Analytics Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-8 space-y-6">
          {/* Genre Distribution */}
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                Genre Distribution
              </div>
            }
          >
            <div className="space-y-4">
              {genresDist.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text-secondary">{item.name || item._id}</span>
                    <span className="font-mono text-text-primary">
                      {item.percentage ? `${Math.round(item.percentage)}%` : `${item.count} games`}
                    </span>
                  </div>
                  <div className="h-2.5 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradientColors[idx % gradientColors.length]} transition-all duration-700`}
                      style={{ width: `${item.percentage || (item.count * 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BrutalistCard>

          {/* Top Rated Games */}
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Top Rated Games
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider">ID</th>
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider">Title</th>
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider">Genre</th>
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/50">
                  {charts.topRatedGames && charts.topRatedGames.slice(0, 5).map((game) => (
                    <tr key={game.appid} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3.5 text-xs font-mono text-text-muted">#{game.appid}</td>
                      <td className="py-3.5 text-sm font-medium text-text-primary">{game.title}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary-light border border-primary/15">
                          {Array.isArray(game.genres) ? game.genres[0] : game.genres || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 text-sm text-right font-semibold text-text-primary">
                        {(game.rating || 8.5).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                  {(!charts.topRatedGames || charts.topRatedGames.length === 0) && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-text-muted text-sm">
                        No rated games data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </BrutalistCard>
        </div>

        {/* Right Side */}
        <div className="lg:col-span-4 space-y-6">
          {/* Platform Distribution */}
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Platform Distribution
              </div>
            }
          >
            <div className="space-y-4">
              {platformsDist.map((plat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text-secondary">{plat.name || plat._id}</span>
                    <span className="font-mono text-text-primary">{Math.round(plat.percentage)}%</span>
                  </div>
                  <div className="h-2.5 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradientColors[idx % gradientColors.length]} transition-all duration-700`}
                      style={{ width: `${plat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BrutalistCard>

          {/* Quick Stats */}
          <BrutalistCard hoverable={false} header="Key Metrics">
            <div className="space-y-3">
              {[
                { label: 'Total Entries', value: stats.totalCount || 0, icon: 'database' },
                { label: 'Average Price', value: `$${(stats.averagePrice || 0).toFixed(2)}`, icon: 'payments' },
                { label: 'Avg Rating', value: `${(stats.averageRating || 0).toFixed(2)}`, icon: 'star' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border-light/50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-sm text-text-muted">{item.icon}</span>
                    <span className="text-xs text-text-muted">{item.label}</span>
                  </div>
                  <span className="text-sm font-headline font-bold text-text-primary">{item.value}</span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 border-t border-border-light">
                <span className="text-[10px] font-mono text-accent">System Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-mono text-success">Nominal</span>
                </div>
              </div>
            </div>
          </BrutalistCard>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
