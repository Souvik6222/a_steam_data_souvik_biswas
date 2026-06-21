import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGames from '../../hooks/useGames';
import useAuth from '../../hooks/useAuth';
import BrutalistButton from '../../components/BrutalistButton';
import BrutalistTable from '../../components/BrutalistTable';
import Pagination from '../../components/Pagination';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import toast from 'react-hot-toast';

export const RegistryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    games,
    totalCount,
    totalPages,
    currentPage,
    limit,
    filters,
    loading,
    error,
    loadGames,
    updateFilters,
    changePage,
  } = useGames();

  useEffect(() => {
    loadGames();
  }, [currentPage, filters.genre, filters.sort, filters.platform, filters.search]);

  const handleGenreSelect = (genre) => {
    const nextGenre = filters.genre === genre ? '' : genre;
    updateFilters({ genre: nextGenre });
  };

  const handlePlatformSelect = (e) => {
    const plat = e.target.value === 'all' ? '' : e.target.value.toLowerCase();
    updateFilters({ platform: plat });
  };

  const handleRefresh = () => {
    toast.success('Data refreshed successfully');
    loadGames();
  };

  const genresList = ['Action', 'Indie', 'RPG', 'Simulation', 'Adventure', 'Strategy'];

  const columns = [
    {
      key: 'appid',
      label: 'ID',
      render: (row) => (
        <span className="font-mono text-text-muted text-xs">#{row.appid}</span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <span
          className="font-medium text-text-primary hover:text-primary transition-colors cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/game/${row.appid}`); }}
        >
          {row.title}
        </span>
      ),
    },
    {
      key: 'genres',
      label: 'Genre',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary-light border border-primary/15">
          {Array.isArray(row.genres) ? row.genres[0] : row.genres || 'N/A'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-sm">
          {row.isFreeToPlay ? (
            <span className="text-success font-semibold">Free</span>
          ) : (
            `$${(row.price || 0).toFixed(2)}`
          )}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      align: 'right',
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <span className="material-symbols-outlined text-warning text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="font-semibold text-sm">{row.rating ? `${Math.round(row.rating * 10)}%` : 'N/A'}</span>
        </div>
      ),
    },
  ];

  if (user && user.role === 'admin') {
    columns.push({
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/dashboard/game/${row.appid}/edit`)}
            className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
      ),
    });
  }

  return (
    <div className="flex flex-col select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight mb-2">
            Game Registry
          </h1>
          <p className="text-sm text-text-muted">
            Browse and manage the complete game database.
          </p>
        </div>
        <div className="flex gap-3">
          {user && user.role === 'admin' && (
            <BrutalistButton
              variant="primary"
              icon="add"
              onClick={() => navigate('/dashboard/game/create')}
            >
              Add Game
            </BrutalistButton>
          )}
          <BrutalistButton variant="secondary" icon="refresh" onClick={handleRefresh}>
            Refresh
          </BrutalistButton>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Genre filter */}
        <div className="nexus-glass rounded-2xl p-5 md:col-span-2">
          <h3 className="text-xs font-headline font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Filter by Genre
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilters({ genre: '' })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-semibold transition-all duration-200 cursor-pointer border ${
                !filters.genre
                  ? 'nexus-btn-gradient text-white shadow-glow border-primary/30'
                  : 'bg-surface-light text-text-secondary border-border-light hover:border-primary/30 hover:text-primary'
              }`}
            >
              All
            </button>
            {genresList.map((g) => {
              const isActive = filters.genre.toLowerCase() === g.toLowerCase();
              return (
                <button
                  key={g}
                  onClick={() => handleGenreSelect(g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-semibold transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'nexus-btn-gradient text-white shadow-glow border-primary/30'
                      : 'bg-surface-light text-text-secondary border-border-light hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {filters.search && (
            <div className="mt-3 flex items-center justify-between bg-primary/5 border border-primary/15 rounded-xl px-3 py-2">
              <span className="text-xs text-primary font-medium truncate">Search: "{filters.search}"</span>
              <button
                onClick={() => updateFilters({ search: '' })}
                className="text-text-muted hover:text-primary transition-colors ml-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
        </div>

        {/* Platform filter + stats */}
        <div className="nexus-glass rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-headline font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Platform
          </h3>
          <select
            value={filters.platform || 'all'}
            onChange={handlePlatformSelect}
            className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="windows">Windows</option>
            <option value="mac">macOS</option>
            <option value="linux">Linux</option>
          </select>

          <div className="flex items-center justify-between pt-2 border-t border-border-light/50">
            <span className="text-xs text-text-muted">Total entries</span>
            <span className="text-lg font-headline font-bold text-text-primary">{totalCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState message={error} onRetry={loadGames} />
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton type="row" count={5} />}

      {/* Table */}
      {!loading && (
        <BrutalistTable
          columns={columns}
          data={games}
          onRowClick={(row) => navigate(`/dashboard/game/${row.appid}`)}
          emptyMessage="No games found matching your criteria."
        />
      )}

      {/* Pagination */}
      {!loading && games.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      )}
    </div>
  );
};

export default RegistryPage;
