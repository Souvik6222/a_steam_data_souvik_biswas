import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useGames from '../../hooks/useGames';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import BrutalistInput from '../../components/BrutalistInput';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import toast from 'react-hot-toast';

export const EditGamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedGame, loading, error, loadGameById, editGame, clearErrors } = useGames();

  useEffect(() => { loadGameById(id); }, [id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: selectedGame?.title || '', genres: selectedGame?.genres ? (Array.isArray(selectedGame.genres) ? selectedGame.genres.join(', ') : selectedGame.genres) : '',
      price: selectedGame?.price || 0, isFreeToPlay: selectedGame?.isFreeToPlay || false, rating: selectedGame?.rating || 8.0,
      downloads: selectedGame?.downloads || 0, developer: selectedGame?.developer || '', publisher: selectedGame?.publisher || '',
      releaseDate: selectedGame?.releaseDate ? new Date(selectedGame.releaseDate).toISOString().slice(0, 10) : '',
      description: selectedGame?.description || '', windows: selectedGame?.platforms?.windows || false,
      mac: selectedGame?.platforms?.mac || false, linux: selectedGame?.platforms?.linux || false,
      ram: selectedGame?.systemRequirements?.ram || '8 GB', cpu: selectedGame?.systemRequirements?.cpu || 'Intel Core i5',
      gpu: selectedGame?.systemRequirements?.gpu || 'NVIDIA GTX 1060', storage: selectedGame?.systemRequirements?.storage || '50 GB Available',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'), genres: Yup.string().required('Genre is required'),
      price: Yup.number().min(0).typeError('Must be a number'), rating: Yup.number().min(0).max(10).typeError('Must be a number'),
      downloads: Yup.number().min(0).integer().typeError('Must be a number'),
      developer: Yup.string().required('Required'), publisher: Yup.string().required('Required'),
      releaseDate: Yup.date().required('Required'),
    }),
    onSubmit: async (values) => {
      const payload = {
        title: values.title, description: values.description,
        genres: values.genres.split(',').map((g) => g.trim().toUpperCase()),
        price: values.isFreeToPlay ? 0 : Number(values.price), isFreeToPlay: values.isFreeToPlay,
        rating: Number(values.rating), downloads: Number(values.downloads),
        developer: values.developer, publisher: values.publisher,
        releaseDate: new Date(values.releaseDate).toISOString(),
        platforms: { windows: values.windows, mac: values.mac, linux: values.linux },
        systemRequirements: { ram: values.ram, cpu: values.cpu, gpu: values.gpu, storage: values.storage },
      };
      toast.loading('Saving changes...', { id: 'update-loading' });
      const result = await editGame(id, payload);
      toast.dismiss('update-loading');
      if (result) { toast.success('Game updated successfully!'); navigate(`/dashboard/game/${id}`); }
      else { toast.error('Failed to update game.'); }
    },
  });

  if (loading && !selectedGame) return <LoadingSkeleton type="detail" count={1} />;
  if (error) return <ErrorState message={error} onRetry={() => { clearErrors(); loadGameById(id); }} />;

  return (
    <div className="flex flex-col select-none space-y-6">
      <div>
        <p className="text-xs font-headline font-semibold text-primary-light uppercase tracking-widest mb-2">Edit Entry</p>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight">Edit Game #{id}</h1>
      </div>

      <BrutalistCard hoverable={false} className="max-w-4xl mx-auto w-full">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Section 1 */}
          <div>
            <h3 className="text-sm font-headline font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-accent" /> Game Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary">App ID</span>
                <input disabled value={`#${id}`} className="w-full bg-surface-light/50 border border-border-light rounded-xl px-4 py-3.5 text-sm text-text-muted cursor-not-allowed" />
              </div>
              <BrutalistInput label="Game Title" name="title" icon="videogame_asset" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.title} error={formik.touched.title && formik.errors.title} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <BrutalistInput label="Genres" name="genres" icon="category" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.genres} error={formik.touched.genres && formik.errors.genres} />
              <div>
                <BrutalistInput label="Price ($)" name="price" type="number" icon="payments" disabled={formik.values.isFreeToPlay} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.isFreeToPlay ? 0 : formik.values.price} error={formik.touched.price && formik.errors.price} />
                <label className="flex items-center gap-2 text-xs text-text-muted mt-2 cursor-pointer">
                  <input name="isFreeToPlay" type="checkbox" checked={formik.values.isFreeToPlay} onChange={formik.handleChange} className="rounded border-border-light accent-primary cursor-pointer" /> Free to Play
                </label>
              </div>
              <BrutalistInput label="Rating (0-10)" name="rating" type="number" icon="star" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.rating} error={formik.touched.rating && formik.errors.rating} />
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-sm font-headline font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-accent to-primary" /> Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BrutalistInput label="Developer" name="developer" icon="code" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.developer} error={formik.touched.developer && formik.errors.developer} />
              <BrutalistInput label="Publisher" name="publisher" icon="business" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.publisher} error={formik.touched.publisher && formik.errors.publisher} />
              <BrutalistInput label="Release Date" name="releaseDate" type="date" icon="calendar_today" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.releaseDate} error={formik.touched.releaseDate && formik.errors.releaseDate} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <BrutalistInput label="Downloads" name="downloads" type="number" icon="download" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.downloads} />
              <div className="space-y-2">
                <span className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary">Platforms</span>
                <div className="flex gap-4 text-sm text-text-secondary">
                  {['windows', 'mac', 'linux'].map((p) => (
                    <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                      <input name={p} type="checkbox" checked={formik.values[p]} onChange={formik.handleChange} className="rounded border-border-light accent-primary cursor-pointer" />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-sm font-headline font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-primary-light" /> System Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <BrutalistInput label="RAM" name="ram" icon="memory" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.ram} />
              <BrutalistInput label="CPU" name="cpu" icon="developer_board" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.cpu} />
              <BrutalistInput label="GPU" name="gpu" icon="monitor" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.gpu} />
              <BrutalistInput label="Storage" name="storage" icon="hard_drive" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.storage} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <span className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary">Description</span>
            <textarea name="description" rows="4" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.description}
              className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border-light">
            <BrutalistButton variant="ghost" onClick={() => navigate(`/dashboard/game/${id}`)}>Cancel</BrutalistButton>
            <BrutalistButton variant="primary" type="submit" icon="save">Save Changes</BrutalistButton>
          </div>
        </form>
      </BrutalistCard>
    </div>
  );
};

export default EditGamePage;
