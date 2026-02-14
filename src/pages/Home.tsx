import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Anime } from '../types';
import { MOCK_ANIME } from '../constants';
import Loader from '../components/Loader';
import AnimeCard from '../components/AnimeCard';
import PreviewModal from '../components/PreviewModal';
import { useFavorites } from '../hooks/useFavorites';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid, faPlay } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import SEO from '../components/SEO';

const Home = ({ latest, trending, series, batch, loading }: { latest: Anime[], trending: Anime[], series: Anime[], batch: Anime[], loading: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPreview, setSelectedPreview] = useState<Anime | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Carousel logic: Prioritize trending, fallback to latest, then mock if all empty
  const trendingList = trending.length > 0 ? trending : latest.length > 0 ? latest : MOCK_ANIME;
  const latestList = latest;
  const seriesList = series;
  const batchList = batch;
  const featuredList = trendingList.slice(0, 6); 

  useEffect(() => {
    if (loading || featuredList.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000); // Slower interval for better readability
    
    return () => clearInterval(interval);
  }, [loading, featuredList.length]);

  if (loading) return <Loader />;

  const featured = featuredList[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  
  return (
    <div className="space-y-12 pb-20">
      <SEO 
        title="Beranda" 
        description="Nonton Anime Subtitle Indonesia dengan kualitas HD terbaik dan server tercepat. Update setiap hari!"
      />
      {/* Immersive Hero Carousel */}      <section className="relative w-full h-[65vh] md:h-[85vh] lg:h-[90vh] overflow-hidden group/carousel">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img 
            key={featured.id + '-banner'}
            src={featured.banner} 
            className="w-full h-full object-cover animate-reveal" 
            style={{ animationDuration: '1s' }}
            alt={featured.title} 
          />
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="absolute inset-0 hero-gradient-side hidden lg:block"></div>
        </div>

        {/* Content Layer */}
        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="max-w-3xl space-y-4 md:space-y-6">
               <div className="flex items-center gap-2">
                 <div className="px-2 py-0.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-sm uppercase tracking-wider">Pilihan Editor</div>
                 <span className="text-white/60 text-sm font-medium">{featured.year} • {featured.genre[0]}</span>
               </div>
               
               <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-2xl">
                 {featured.title}
               </h1>
               
               <p className="text-white/70 text-sm md:text-lg max-w-xl leading-relaxed">
                 {featured.synopsis}
               </p>
               
               <div className="flex items-center gap-4 pt-4">
                 <Link to={featured.type === 'episode' ? `/episode/${featured.id}` : `/detail/${featured.id}`}>
                   <button className="iq-btn-primary flex items-center gap-2 text-lg px-8 py-3">
                     <FontAwesomeIcon icon={faPlay} />
                     Nonton Sekarang
                   </button>
                 </Link>
                 <button 
                   onClick={() => toggleFavorite(featured)}
                   className="iq-btn-secondary flex items-center gap-2 text-lg px-8 py-3"
                 >
                   <FontAwesomeIcon icon={isFavorite(featured.id) ? faHeartSolid : faHeartRegular} className={isFavorite(featured.id) ? 'text-[var(--primary)]' : ''} />
                   Simpan
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Side Arrows (Hover) */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/40"
        >
          <FontAwesomeIcon icon={faPlay} className="rotate-180" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/40"
        >
          <FontAwesomeIcon icon={faPlay} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-10 right-4 md:right-8 flex gap-2">
           {featuredList.map((_, idx) => (
             <button 
               key={idx}
               onClick={() => setCurrentIndex(idx)}
               className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-[var(--primary)]' : 'w-4 bg-white/20'}`}
             />
           ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-16">
        {/* Latest Episodes Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[var(--primary)] rounded-full"></span>
              Rilisan Terbaru
            </h2>
            <Link to="/ongoing" className="text-white/40 hover:text-[var(--primary)] transition-colors text-sm font-medium">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {latestList.map((anime, index) => (
              <div key={`latest-${anime.id}-${index}`}>
                <AnimeCard anime={anime} onHold={(a) => setSelectedPreview(a)} />
              </div>
            ))}
          </div>
        </section>

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[var(--primary)] rounded-full"></span>
              🔥 Top 10 Trending
            </h2>
            <Link to="/trending" className="text-white/40 hover:text-[var(--primary)] transition-colors text-sm font-medium">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {trendingList.map((anime, index) => (
              <div key={`trending-${anime.id}-${index}`}>
                <AnimeCard anime={anime} onHold={(a) => setSelectedPreview(a)} />
              </div>
            ))}
          </div>
        </section>

        {/* New Series/Movie Section */}
        {seriesList.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[var(--primary)] rounded-full"></span>
                Series & Movie Terbaru
              </h2>
              <Link to="/movies" className="text-white/40 hover:text-[var(--primary)] transition-colors text-sm font-medium">
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {seriesList.map((anime, index) => (
                <div key={`series-${anime.id}-${index}`}>
                  <AnimeCard anime={anime} onHold={(a) => setSelectedPreview(a)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Batch Section */}
        {batchList.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[var(--primary)] rounded-full"></span>
                Daftar Anime BATCH
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {batchList.map((anime, index) => (
                <div key={`batch-${anime.id}-${index}`}>
                  <AnimeCard anime={anime} onHold={(a) => setSelectedPreview(a)} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Global Preview Modal */}
      <PreviewModal 
        anime={selectedPreview} 
        onClose={() => setSelectedPreview(null)} 
      />
    </div>
  );
};

export default Home;
