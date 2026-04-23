import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Anime } from '../types';
import Loader from '../components/Loader';
import AnimeCard from '../components/AnimeCard';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch, mapAnimeData } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const SearchPage = () => {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const mapApiData = (data: any[]): Anime[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => mapAnimeData(item));
  };

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`);
        const json = await res.json();

        if (json.status === 'success' && json.data) {
          const list = json.data.data || json.data;
          setResults(mapApiData(list));
          setHasNextPage(!!json.data.hasNextPage);
        }
      } catch (error) {
        console.error('Search Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, page]);

  if (loading) return <Loader message={`Mencari "${query}"...`} />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">
      <header className="space-y-4 pt-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
          Hasil Pencarian
        </h1>
        <p className="text-white/40 text-sm md:text-base font-medium">
          Ditemukan {results.length} hasil untuk kata kunci "<span className="text-[var(--primary)]">{query}</span>"
        </p>
      </header>

      <section>
        {results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {results.map((anime, index) => (
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
              <FontAwesomeIcon icon={faMagnifyingGlass} size="2x" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white/60 mb-2">Tidak ada hasil ditemukan</h2>
            <p className="text-white/30 text-sm max-w-md">Maaf, kami tidak dapat menemukan anime dengan judul tersebut. Coba gunakan kata kunci lain.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
