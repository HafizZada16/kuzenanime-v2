import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Anime } from '../types';
import Loader from '../components/Loader';
import AnimeCard from '../components/AnimeCard';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const GenreDetailPage = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const navigate = useNavigate();

  const mapApiData = (data: any[]): Anime[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.image_url || '',
      banner: item.image_url || '',
      episode: item.latest_episode ? `EP ${item.latest_episode}` : '??',
      status: 'ONGOING', // Default
      year: item.date_created ? new Date(item.date_created).getFullYear() : 2026,
      rating: item.rating ? parseFloat(item.rating) : 0,
      genre: [item.type || 'Anime'],
      synopsis: item.broadcast ? `Broadcast: ${item.broadcast}` : `Added: ${item.date_created ? new Date(item.date_created).toLocaleDateString() : 'Recently'}`,
      likes: `${Math.floor(Math.random() * 50) + 1}K`
    }));
  };

  useEffect(() => {
    const fetchGenreDetail = async () => {
      if (!genreId) return;
      try {
        setLoading(true);
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/genre/${genreId}?page=${page}`);
        const json = await res.json();
        
        if (json.status === 'success' && json.data?.data) {
          const list = json.data.data;
          setAnimeList(mapApiData(list));
          setHasNextPage(!!json.data.hasNextPage);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [genreId, page]);

  if (loading) return <Loader message="Menyaring database..." />;

  const genreName = genreId?.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">
      <header className="space-y-6 pt-8">
        <button 
          onClick={() => navigate('/genre')}
          className="iq-btn-secondary px-4 py-2 text-sm flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Semua Genre
        </button>
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
            Genre: {genreName}
          </h1>
          <p className="text-white/40 text-sm md:text-base font-medium">Menampilkan koleksi anime dalam kategori {genreName}.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {animeList.map((anime, index) => (
          <div key={anime.id} className="animate-reveal" style={{ animationDelay: `${index * 0.05}s` }}>
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-8 py-10">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:bg-[var(--primary)] hover:text-white transition-all disabled:opacity-10 disabled:pointer-events-none"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        
        <div className="flex flex-col items-center">
           <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Halaman</span>
           <span className="text-white font-black text-2xl tabular-nums">{page}</span>
        </div>

        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={!hasNextPage}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:bg-[var(--primary)] hover:text-white transition-all disabled:opacity-10 disabled:pointer-events-none"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default GenreDetailPage;
