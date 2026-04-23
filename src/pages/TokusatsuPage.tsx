import React, { useEffect, useState } from 'react';
import { Anime } from '../types';
import Loader from '../components/Loader';
import AnimeCard from '../components/AnimeCard';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const TokusatsuPage = () => {
  const [list, setList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const mapApiData = (data: any[]): Anime[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.image_url || '',
      banner: item.image_url || '',
      episode: item.latest_episode ? `EP ${item.latest_episode}` : 'FULL',
      status: 'COMPLETED',
      year: item.date_created ? new Date(item.date_created).getFullYear() : 2026,
      rating: item.rating ? parseFloat(item.rating) : 0,
      genre: ['Tokusatsu'],
      synopsis: `Watch ${item.title} on KuzenAnime V2.`,
      likes: '0'
    }));
  };

  useEffect(() => {
    const fetchTokusatsu = async () => {
      try {
        setLoading(true);
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/tokusatsu?page=${page}`);
        const json = await res.json();
        
        if (json.status === 'success' && json.data) {
          const list = json.data.data || json.data;
          setList(mapApiData(list));
          setHasNextPage(!!json.data.hasNextPage);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokusatsu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  if (loading) return <Loader message="Memuat koleksi tokusatsu..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">
      <header className="space-y-4 pt-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
          Koleksi Tokusatsu
        </h1>
        <p className="text-white/40 text-sm md:text-base font-medium">Koleksi lengkap Kamen Rider, Super Sentai, dan Ultraman.</p>
      </header>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {list.map((anime, index) => (
            <div key={anime.id} className="animate-reveal" style={{ animationDelay: `${index * 0.05}s` }}>
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      </section>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-8 pb-10">
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

export default TokusatsuPage;
