import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import AnimeCard from '../components/AnimeCard';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20 min-h-[70vh]">
      <header className="space-y-4 pt-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
          Koleksi Saya
        </h1>
        <p className="text-white/40 text-sm md:text-base font-medium">Daftar anime yang telah Anda simpan untuk ditonton nanti.</p>
      </header>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
            <FontAwesomeIcon icon={faHeart} size="2x" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white/60 mb-2">Koleksi Anda masih kosong</h2>
          <p className="text-white/30 text-sm max-w-md mb-10">Belum ada anime yang ditambahkan. Jelajahi katalog kami dan simpan anime favorit Anda di sini.</p>
          <button 
            onClick={() => navigate('/')}
            className="iq-btn-primary"
          >
            Mulai Jelajah
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {favorites.map((anime, index) => (
            <div key={anime.id} className="animate-reveal" style={{ animationDelay: `${index * 0.05}s` }}>
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
