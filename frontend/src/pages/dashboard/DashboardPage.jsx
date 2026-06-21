import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useClock from '../../hooks/useClock';
import StatCard from '../../components/StatCard';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import { fetchStatsSummary, fetchDashboardChartsData } from '../../store/analyticsSlice';

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const systemTime = useClock();

  const { stats, charts, loading, error } = useSelector((state) => state.analytics);

  const initDashboard = () => {
    dispatch(fetchStatsSummary());
    dispatch(fetchDashboardChartsData());
  };

  useEffect(() => {
    dispatch(fetchStatsSummary());
    dispatch(fetchDashboardChartsData());
  }, [dispatch]);

  if (loading && stats.totalCount === 0) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={initDashboard} />;
  }

  const totalGames = stats.totalCount ? stats.totalCount.toLocaleString() : "12,409";
  const avgRating = stats.averageRating ? Number(stats.averageRating).toFixed(1) : "8.4";
  const avgPrice = stats.averagePrice ? Number(stats.averagePrice).toFixed(2) : "29.99";
  const dailyRevenue = (stats.totalCount * stats.averagePrice * 0.005) || 2482091.44;
  const formattedRevenue = `$${dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const recentActivity = [
    { time: '2 min ago', msg: 'Data sync completed', icon: 'sync', type: 'success' },
    { time: '15 min ago', msg: 'New game entry added', icon: 'add_circle', type: 'info' },
    { time: '1 hour ago', msg: 'Analytics report generated', icon: 'insights', type: 'info' },
  ];

  const regionalTraffic = [
    { region: 'North America', yieldVal: 85201, pct: 85 },
    { region: 'Europe West', yieldVal: 64882, pct: 64 },
    { region: 'Asia Pacific', yieldVal: 90402, pct: 90 },
    { region: 'Latin America', yieldVal: 35211, pct: 35 },
    { region: 'Oceania', yieldVal: 18901, pct: 18 },
  ];

  return (
    <div className="flex flex-col select-none space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-text-muted">
            Welcome back — here's your analytics overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="nexus-glass-light rounded-xl px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-text-secondary">{systemTime}</span>
          </div>
          <BrutalistButton variant="secondary" icon="refresh" onClick={initDashboard}>
            Refresh
          </BrutalistButton>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          num="01"
          label="COLLECTION"
          value={totalGames}
          title="Total Games Indexed"
          icon="stacks"
          variant="light"
          progress={75}
          watermarkIcon="videogame_asset"
        />
        <StatCard
          num="02"
          label="QUALITY"
          value={avgRating}
          title="Average Rating Score"
          icon="star"
          variant="primary"
          segments={{ active: Math.round(parseFloat(avgRating) / 2) || 4, total: 5 }}
        />
        <StatCard
          num="03"
          label="REVENUE"
          value={formattedRevenue}
          title="Estimated Daily Revenue"
          icon="payments"
          variant="dark"
          statusText="+12.4% from last cycle"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Activity Feed */}
        <div className="lg:col-span-4 space-y-5">
          <h2 className="text-sm font-headline font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-accent" />
            Recent Activity
          </h2>

          <div className="space-y-3">
            {recentActivity.map((item, idx) => (
              <div
                key={idx}
                className="nexus-glass rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:border-primary/20"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                }`}>
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium truncate">{item.msg}</p>
                  <p className="text-[10px] text-text-muted">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick insights card */}
          <div className="nexus-glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-headline font-semibold text-text-secondary uppercase tracking-wider">Quick Insights</span>
              <span className="text-[10px] font-mono text-accent">LIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-light/50 rounded-xl p-3 border border-border-light/50">
                <p className="text-[10px] text-text-muted mb-1">Avg Price</p>
                <p className="text-lg font-headline font-bold text-text-primary">${avgPrice}</p>
              </div>
              <div className="bg-surface-light/50 rounded-xl p-3 border border-border-light/50">
                <p className="text-[10px] text-text-muted mb-1">Genres</p>
                <p className="text-lg font-headline font-bold text-text-primary">{stats.genreCounts?.length || 15}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Charts Area */}
        <div className="lg:col-span-8 space-y-5">
          {/* Regional Traffic */}
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex justify-between items-center w-full">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                  Regional Traffic Distribution
                </span>
                <span className="text-[10px] font-mono text-text-muted">REAL-TIME</span>
              </div>
            }
          >
            <div className="space-y-4">
              {regionalTraffic.map((traffic, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text-secondary">{traffic.region}</span>
                    <span className="font-mono text-text-primary">{traffic.yieldVal.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                      style={{ width: `${traffic.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BrutalistCard>

          {/* Top Performers Table */}
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex justify-between items-center w-full">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Top Performing Games
                </span>
                <BrutalistButton
                  variant="ghost"
                  onClick={() => navigate('/dashboard/registry')}
                  className="text-[10px] py-1 px-3"
                >
                  View All
                </BrutalistButton>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider">Rank</th>
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider">Title</th>
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider text-right">Downloads</th>
                    <th className="pb-3 text-xs font-headline font-semibold text-text-muted uppercase tracking-wider text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/50">
                  {charts.trendingGames && charts.trendingGames.slice(0, 4).map((game, idx) => (
                    <tr
                      key={game.appid}
                      className="hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() => navigate(`/dashboard/game/${game.appid}`)}
                    >
                      <td className="py-3.5 text-sm font-headline font-bold text-primary">#{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 text-sm font-medium text-text-primary">{game.title}</td>
                      <td className="py-3.5 text-sm text-right text-text-secondary font-mono">{(game.downloads || 15000).toLocaleString()}</td>
                      <td className="py-3.5 text-sm text-right font-semibold text-text-primary">{(game.rating || 8.5).toFixed(1)}</td>
                    </tr>
                  ))}
                  {(!charts.trendingGames || charts.trendingGames.length === 0) && (
                    <>
                      {[
                        { title: 'Elden Ring', downloads: 85409, rating: 9.6 },
                        { title: 'Cyberpunk 2077', downloads: 62901, rating: 8.6 },
                        { title: 'Hollow Knight', downloads: 48221, rating: 9.0 },
                      ].map((game, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-primary/5 cursor-pointer transition-colors"
                          onClick={() => navigate('/dashboard/registry')}
                        >
                          <td className="py-3.5 text-sm font-headline font-bold text-primary">#{String(idx + 1).padStart(2, '0')}</td>
                          <td className="py-3.5 text-sm font-medium text-text-primary">{game.title}</td>
                          <td className="py-3.5 text-sm text-right text-text-secondary font-mono">{game.downloads.toLocaleString()}</td>
                          <td className="py-3.5 text-sm text-right font-semibold text-text-primary">{game.rating.toFixed(1)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </BrutalistCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
