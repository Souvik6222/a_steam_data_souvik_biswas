import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGames from '../../hooks/useGames';
import useAuth from '../../hooks/useAuth';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import DeleteModal from '../../components/DeleteModal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import toast from 'react-hot-toast';

export const GameDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedGame, updates, loading, error,
    loadGameById, removeGame, archiveGameEntry, restoreGameEntry,
    loadGameUpdates, unloadSelectedGame, clearErrors,
  } = useGames();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadGameById(id);
    loadGameUpdates(id);
    return () => unloadSelectedGame();
  }, [id]);

  const handleDeleteConfirm = async () => {
    setDeleteModalOpen(false);
    toast.loading('Deleting game...', { id: 'delete-loading' });
    const success = await removeGame(id);
    toast.dismiss('delete-loading');
    if (success) { toast.success('Game deleted successfully'); navigate('/dashboard/registry'); }
    else { toast.error('Failed to delete game'); }
  };

  const handleArchiveToggle = async () => {
    if (selectedGame.isArchived) {
      toast.loading('Restoring...', { id: 'archive-loading' });
      const success = await restoreGameEntry(id);
      toast.dismiss('archive-loading');
      if (success) toast.success('Game restored');
    } else {
      toast.loading('Archiving...', { id: 'archive-loading' });
      const success = await archiveGameEntry(id);
      toast.dismiss('archive-loading');
      if (success) toast.success('Game archived');
    }
  };

  if (loading && !selectedGame) return <LoadingSkeleton type="detail" count={1} />;
  if (error) return <ErrorState message={error} onRetry={() => { clearErrors(); loadGameById(id); loadGameUpdates(id); }} />;
  if (!selectedGame) return (
    <div className="text-center py-16">
      <h3 className="text-lg font-headline font-semibold text-text-secondary mb-4">Game not found</h3>
      <BrutalistButton onClick={() => navigate('/dashboard/registry')}>Back to Registry</BrutalistButton>
    </div>
  );

  const releaseDate = selectedGame.releaseDate
    ? new Date(selectedGame.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="flex flex-col select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-text-muted">#{selectedGame.appid}</span>
            {selectedGame.isArchived && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/10 text-warning border border-warning/15">Archived</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight">
            {selectedGame.title}
          </h1>
        </div>
        {user && user.role === 'admin' && (
          <div className="flex flex-wrap gap-2">
            <BrutalistButton variant="secondary" icon="edit" onClick={() => navigate(`/dashboard/game/${selectedGame.appid}/edit`)}>Edit</BrutalistButton>
            <BrutalistButton variant="ghost" icon={selectedGame.isArchived ? 'unarchive' : 'archive'} onClick={handleArchiveToggle}>
              {selectedGame.isArchived ? 'Restore' : 'Archive'}
            </BrutalistButton>
            <BrutalistButton variant="danger" icon="delete" onClick={() => setDeleteModalOpen(true)}>Delete</BrutalistButton>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left */}
        <div className="lg:col-span-8 space-y-5">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="nexus-glass rounded-2xl p-5 hover:shadow-glow transition-all">
              <span className="text-[10px] font-headline font-semibold text-text-muted uppercase tracking-wider block mb-2">Genre</span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedGame.genres) ? selectedGame.genres : [selectedGame.genres || 'N/A']).map((g, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary-light border border-primary/15">{g}</span>
                ))}
              </div>
            </div>
            <div className="nexus-glass rounded-2xl p-5 hover:shadow-glow transition-all">
              <span className="text-[10px] font-headline font-semibold text-text-muted uppercase tracking-wider block mb-2">Price</span>
              <span className="text-xl font-headline font-bold text-text-primary">
                {selectedGame.isFreeToPlay ? <span className="text-success">Free</span> : `$${(selectedGame.price || 0).toFixed(2)}`}
              </span>
            </div>
            <div className="nexus-glass rounded-2xl p-5 hover:shadow-glow transition-all">
              <span className="text-[10px] font-headline font-semibold text-text-muted uppercase tracking-wider block mb-2">Rating</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-warning text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-xl font-headline font-bold text-text-primary">{selectedGame.rating ? `${Math.round(selectedGame.rating * 10)}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <BrutalistCard hoverable={false} header={<div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />About</div>}>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {selectedGame.description || 'No description available for this game.'}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light/50">
              {[
                { label: 'Developer', value: selectedGame.developer },
                { label: 'Publisher', value: selectedGame.publisher },
                { label: 'Release Date', value: releaseDate },
                { label: 'Downloads', value: `${(selectedGame.downloads || 0).toLocaleString()}` },
              ].map((item, idx) => (
                <div key={idx}>
                  <span className="text-[10px] text-text-muted block mb-0.5">{item.label}</span>
                  <span className="text-sm font-medium text-text-primary">{item.value || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </BrutalistCard>

          {/* Data Streams */}
          <BrutalistCard hoverable={false} header={<div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent" />Data Streams</div>}>
            <div className="space-y-3">
              {[
                { label: 'Core Manifest', value: 'SHA-256 Verified', color: 'text-primary-light' },
                { label: 'Telemetry Feed', value: 'Nominal (32ms)', color: 'text-accent' },
                { label: 'Binary Checksum', value: 'Verified', color: 'text-success' },
                { label: 'Integrity Lock', value: 'Secured', color: 'text-text-primary' },
              ].map((stream, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border-light/50 last:border-0">
                  <span className="text-xs text-text-muted">{stream.label}</span>
                  <span className={`text-xs font-mono font-semibold ${stream.color}`}>{stream.value}</span>
                </div>
              ))}
            </div>
          </BrutalistCard>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-5">
          {/* System Requirements */}
          <BrutalistCard hoverable={false} header="System Requirements">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-text-muted block mb-1">Platforms</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGame.platforms && Object.keys(selectedGame.platforms).filter(k => selectedGame.platforms[k]).map((p) => (
                    <span key={p} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent border border-accent/15 capitalize">{p}</span>
                  ))}
                  {(!selectedGame.platforms || Object.values(selectedGame.platforms).every(v => !v)) && <span className="text-xs text-text-muted">N/A</span>}
                </div>
              </div>
              {selectedGame.systemRequirements && (
                <div className="space-y-2 pt-2 border-t border-border-light/50">
                  {[
                    { label: 'Memory', value: selectedGame.systemRequirements.ram, icon: 'memory' },
                    { label: 'Processor', value: selectedGame.systemRequirements.cpu, icon: 'developer_board' },
                    { label: 'Graphics', value: selectedGame.systemRequirements.gpu, icon: 'monitor' },
                    { label: 'Storage', value: selectedGame.systemRequirements.storage, icon: 'hard_drive' },
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 py-1.5">
                      <span className="material-symbols-outlined text-sm text-text-muted">{req.icon}</span>
                      <div>
                        <span className="text-[10px] text-text-muted block">{req.label}</span>
                        <span className="text-xs font-medium text-text-primary">{req.value || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BrutalistCard>

          {/* Update Log */}
          <BrutalistCard hoverable={false} header="Update History">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {updates && updates.length > 0 ? (
                updates.map((up, idx) => (
                  <div key={idx} className="pb-3 border-b border-border-light/50 last:border-0">
                    <span className="text-[10px] font-mono text-primary-light block mb-0.5">
                      {new Date(up.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                    <p className="text-xs font-medium text-text-primary">{up.message || up.title}</p>
                    {up.description && <p className="text-[10px] text-text-muted mt-0.5">{up.description}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-4">No updates recorded</p>
              )}
            </div>
          </BrutalistCard>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${selectedGame.title}?`}
        message="This will permanently remove this game from the registry. This action cannot be undone."
      />
    </div>
  );
};

export default GameDetailsPage;
