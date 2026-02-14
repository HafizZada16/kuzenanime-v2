import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';

interface Season {
  id: string;
  name: string;
}

const SeasonPage = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/listseason`);
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          setSeasons(json.data);
        }
      } catch (err) {
        console.error('Season Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasons();
  }, []);

  if (loading) return <Loader message="Mengurutkan daftar musim..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">
      <header className="space-y-4 pt-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
          Daftar Musim
        </h1>
        <p className="text-white/40 text-sm md:text-base font-medium">Jelajahi anime berdasarkan musim rilisnya.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {seasons.map((season, index) => (
          <div 
            key={season.id}
            onClick={() => navigate(`/season/${season.id}`)}
            className="group cursor-pointer bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-[var(--primary)]/30 transition-all animate-reveal"
            style={{ animationDelay: `${index * 0.01}s` }}
          >
            <h3 className="font-bold text-white/80 text-lg md:text-xl group-hover:text-[var(--primary)] transition-colors text-center">
              {season.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonPage;
