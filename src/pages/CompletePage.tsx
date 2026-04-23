import React, { useEffect, useState } from 'react';
import { Anime } from '../types';
import Loader from '../components/Loader';
import AnimeCard from '../components/AnimeCard';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch, mapAnimeData } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const CompletePage = () => {
  const [completeList, setCompleteList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const mapApiData = (data: any[]): Anime[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => mapAnimeData(item));
  };

  useEffect(() => {
    const fetchComplete = async () => {
      try {
        setLoading(true);
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/complete?page=${page}`);
        const json = await res.json();

        if (json.status === 'success' && json.data) {
          const list = json.data.data || json.data;
          setCompleteList(mapApiData(list));
          setHasNextPage(!!json.data.hasNextPage);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplete();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  if (loading) return <Loader message="Memuat anime complete..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">
      <header className="space-y-4 pt-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
          Anime Complete
        </h1>
        <p className="text-white/40 text-sm md:text-base font-medium">Daftar anime yang telah selesai tayang dan dapat ditonton secara lengkap.</p>
      </header>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {completeList.map((anime, index) => (
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

export default CompletePage;
