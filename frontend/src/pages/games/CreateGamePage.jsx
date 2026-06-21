import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useGames from '../../hooks/useGames';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import BrutalistInput from '../../components/BrutalistInput';
import toast from 'react-hot-toast';

export const CreateGamePage = () => {
  const navigate = useNavigate();
  const { addNewGame } = useGames();

  const formik = useFormik({
    initialValues: {
      appid: '', title: '', genres: '', price: 0, isFreeToPlay: false, rating: 8.0,
      downloads: 1000, developer: '', publisher: '', releaseDate: new Date().toISOString().slice(0, 10),
      description: '', windows: true, mac: false, linux: false,
      ram: '8 GB', cpu: 'Intel Core i5', gpu: 'NVIDIA GTX 1060', storage: '50 GB Available',
    },
    validationSchema: Yup.object({
      appid: Yup.number().typeError('Must be a number').integer().positive().required('App ID is required'),
      title: Yup.string().required('Title is required'),
      genres: Yup.string().required('At least one genre is required'),
      price: Yup.number().min(0).typeError('Must be a number'),
      rating: Yup.number().min(0).max(10).typeError('Must be a number'),
      downloads: Yup.number().min(0).integer().typeError('Must be a number'),
      developer: Yup.string().required('Developer is required'),
      publisher: Yup.string().required('Publisher is required'),
      releaseDate: Yup.date().required('Release date is required'),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      const payload = {
        appid: Number(values.appid), title: values.title, description: values.description,
        genres: values.genres.split(',').map((g) => g.trim().toUpperCase()),
        price: values.isFreeToPlay ? 0 : Number(values.price), isFreeToPlay: values.isFreeToPlay,
        rating: Number(values.rating), downloads: Number(values.downloads),
        developer: values.developer, publisher: values.publisher,
        releaseDate: new Date(values.releaseDate).toISOString(),
        platforms: { windows: values.windows, mac: values.mac, linux: values.linux },
        systemRequirements: { ram: values.ram, cpu: values.cpu, gpu: values.gpu, storage: values.storage },
        screenshots: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDV-93ifWZJgxJ4ySPjb7Efwjb9x9y3Jv2CPBOYjdljBRVSRDdsqYBRQEI6rPVjQ9F3kvlhYleigqqxjpfAMr7RiR8MreIoBoq9FOJjnmVU0c7LyWOITvpoGpHznymu11S7PzOLrxjYoD7YGUIzTDbdT_5lRfVdUKqBjW7mdHwiXoSydD7XzqTJllQNu2G4dfMrr9TPkdA0y_inSfRSlqYHGvCXaMWExXMgVRIoWA7bvZ9HyDe8xik2Siq-jPdb3_yuHvoTTBIpNWQ"],
      };
      toast.loading('Creating game...', { id: 'create-loading' });
      const result = await addNewGame(payload);
      toast.dismiss('create-loading');
      if (result) {
        toast.success('Game created successfully!');
        navigate(`/dashboard/game/${values.appid}`);
      } else {
        toast.error('Failed to create game. App ID may already exist.');
      }
    },
  });

  return (
    <div className="flex flex-col select-none space-y-6">
      <div>
        <p className="text-xs font-headline font-semibold text-primary-light uppercase tracking-widest mb-2">New Entry</p>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight">Create Game</h1>
      </div>

      <BrutalistCard hoverable={false} className="max-w-4xl mx-auto w-full">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Section 1: Identity */}
          <div>
            <h3 className="text-sm font-headline font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-accent" /> Game Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BrutalistInput label="App ID" name="appid" placeholder="e.g. 104200" icon="tag" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.appid} error={formik.touched.appid && formik.errors.appid} />
              <BrutalistInput label="Game Title" name="title" placeholder="e.g. Elden Ring" icon="videogame_asset" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.title} error={formik.touched.title && formik.errors.title} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <BrutalistInput label="Genres (comma separated)" name="genres" placeholder="RPG, Action" icon="category" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.genres} error={formik.touched.genres && formik.errors.genres} />
              <div>
                <BrutalistInput label="Price ($)" name="price" type="number" icon="payments" disabled={formik.values.isFreeToPlay} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.isFreeToPlay ? 0 : formik.values.price} error={formik.touched.price && formik.errors.price} />
                <label className="flex items-center gap-2 text-xs text-text-muted mt-2 cursor-pointer">
                  <input name="isFreeToPlay" type="checkbox" checked={formik.values.isFreeToPlay} onChange={formik.handleChange} className="rounded border-border-light accent-primary cursor-pointer" />
                  Free to Play
                </label>
              </div>
              <BrutalistInput label="Rating (0-10)" name="rating" type="number" icon="star" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.rating} error={formik.touched.rating && formik.errors.rating} />
            </div>
          </div>

          {/* Section 2: Metadata */}
          <div>
            <h3 className="text-sm font-headline font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-accent to-primary" /> Metadata & Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BrutalistInput label="Developer" name="developer" placeholder="e.g. FromSoftware" icon="code" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.developer} error={formik.touched.developer && formik.errors.developer} />
              <BrutalistInput label="Publisher" name="publisher" placeholder="e.g. Bandai Namco" icon="business" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.publisher} error={formik.touched.publisher && formik.errors.publisher} />
              <BrutalistInput label="Release Date" name="releaseDate" type="date" icon="calendar_today" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.releaseDate} error={formik.touched.releaseDate && formik.errors.releaseDate} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <BrutalistInput label="Downloads" name="downloads" type="number" icon="download" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.downloads} error={formik.touched.downloads && formik.errors.downloads} />
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

          {/* Section 3: System Req */}
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
            <textarea name="description" rows="4" placeholder="Enter game description..." onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.description}
              className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border-light">
            <BrutalistButton variant="ghost" onClick={() => navigate('/dashboard/registry')}>Cancel</BrutalistButton>
            <BrutalistButton variant="primary" type="submit" icon="add_circle">Create Game</BrutalistButton>
          </div>
        </form>
      </BrutalistCard>
    </div>
  );
};

export default CreateGamePage;
