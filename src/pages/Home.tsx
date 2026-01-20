import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Anime } from '../types';
import { MOCK_ANIME } from '../constants';
import Loader from '../components/Loader';
import Badge from '../components/Badge';
import Button from '../components/Button';
import AnimeCard from '../components/AnimeCard';
import PreviewModal from '../components/PreviewModal';
import { useFavorites } from '../hooks/useFavorites';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const Home = ({ trending, movies, completed, loading }: { trending: Anime[], movies: Anime[], completed: Anime[], loading: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPreview, setSelectedPreview] = useState<Anime | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const trendingList = trending.length > 0 ? trending : MOCK_ANIME;
  const movieList = movies;
  const completedList = completed;
  const featuredList = trendingList.slice(0, 5); // Use top 5 for carousel

  useEffect(() => {
    if (loading || featuredList.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [loading, featuredList.length]);

  if (loading) return <Loader />;

  const featured = featuredList[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-20">
      {/* Hero Carousel Section - Redesigned to Industrial Dossier Style */}
      <section className="relative min-h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden bg-[#0c0c0c] border-8 border-black shadow-[20px_20px_0px_0px_black] group">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--neo-yellow) 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_45%,var(--neo-purple)_45%,var(--neo-purple)_55%,transparent_55%)] bg-[length:100px_100px] opacity-5"></div>

        {/* Big Background Text */}
        <div className="absolute -top-6 md:-top-10 -left-6 md:-left-10 font-black text-[5rem] md:text-[15rem] text-white opacity-[0.03] select-none pointer-events-none italic tracking-tighter">
           TRENDING
        </div>

        {/* Main Visual Card - Tilted & Wrapped in Link */}
        <div className="relative w-[85%] md:w-[80%] h-[300px] md:h-[400px] lg:h-[500px] z-10 transition-transform duration-700 group-hover:scale-[1.02]">
           <Link to={`/detail/${featured.id}`} className="absolute inset-0 z-10 block">
              <div className="absolute inset-0 bg-black transform rotate-1 shadow-[8px_8px_0px_0px_var(--neo-coral)] md:shadow-[15px_15px_0px_0px_var(--neo-coral)]"></div>
              <div className="absolute inset-0 border-4 md:border-8 border-black overflow-hidden transform -rotate-1 bg-gray-900 shadow-[6px_6px_0px_0px_white] md:shadow-[10px_10px_0px_0px_white]">
                 <img 
                   key={featured.id + '-img'}
                   src={featured.banner} 
                   className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 animate-in fade-in zoom-in duration-500" 
                   alt="Hero" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60"></div>
              </div>
           </Link>

           {/* Floating Info Dossier */}
           <div className="absolute -bottom-10 left-4 right-4 md:bottom-10 md:-left-10 md:right-auto z-20 max-w-sm md:max-w-xl pointer-events-none">
              <div className="bg-[var(--neo-yellow)] border-4 border-black p-4 md:p-10 shadow-[8px_8px_0px_0px_black] md:shadow-[12px_12px_0px_0px_black] transform md:rotate-1 animate-in slide-in-from-left-8 duration-500 pointer-events-auto">
                 <div className="flex gap-2 mb-2 md:mb-4">
                    <Badge color="black" className="text-[8px] md:text-[10px] italic">TOP_INTEL</Badge>
                    <Badge color="coral" className="text-[8px] md:text-[10px]">EP_{featured.episode}</Badge>
                 </div>
                 <h1 className="text-xl md:text-5xl lg:text-6xl font-normal heading-font text-black leading-none mb-3 md:mb-6 italic uppercase tracking-tighter drop-shadow-[1px_1px_0px_white] md:drop-shadow-[2px_2px_0px_white] line-clamp-1 md:line-clamp-none">
                    {featured.title}
                 </h1>
                 <div className="hidden md:block bg-black text-white p-4 border-l-8 border-[var(--neo-coral)] mb-6 shadow-[4px_4px_0px_0px_white]">
                    <p className="text-xs md:text-sm font-bold italic line-clamp-2 mono leading-tight">
                       {featured.synopsis}
                    </p>
                 </div>
                 <div className="flex gap-2 md:gap-4">
                    <button 
                       onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(featured);
                       }}
                       className={`p-3 md:p-5 border-2 md:border-4 border-black shadow-[4px_4px_0px_0px_black] md:shadow-[6px_6px_0px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
                          isFavorite(featured.id) ? 'bg-[var(--neo-coral)] text-white' : 'bg-white text-black'
                       }`}
                    >
                       <FontAwesomeIcon icon={isFavorite(featured.id) ? faHeartSolid : faHeartRegular} className="text-xs md:text-base" />
                    </button>
                    <div className="flex-1 bg-black text-white px-4 flex items-center justify-center font-normal heading-font text-[10px] md:text-xs italic uppercase tracking-widest border-2 md:border-4 border-black">
                       CLICK_ANYWHERE_TO_DECODE
                    </div>
                 </div>
              </div>
           </div>

           {/* Floating Metadata Tags */}
           <div className="absolute -top-6 -right-4 md:top-10 md:-right-10 z-20 flex flex-col gap-3">
              <div className="bg-[var(--neo-purple)] border-4 border-black px-6 py-2 shadow-[8px_8px_0px_0px_black] transform -rotate-3">
                 <span className="font-normal heading-font text-white text-sm italic">★ {featured.rating}</span>
              </div>
              <div className="bg-white border-4 border-black px-6 py-2 shadow-[8px_8px_0px_0px_black] transform rotate-2">
                 <span className="font-normal heading-font text-black text-[10px] italic uppercase tracking-widest">{featured.year}</span>
              </div>
           </div>
        </div>

        {/* Industrial Carousel Controls - Centered Sides */}
        <div className="absolute inset-y-0 left-0 md:left-4 z-[50] flex items-center px-2">
           <button 
             onClick={prevSlide}
             className="w-10 h-10 md:w-16 md:h-16 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:bg-[var(--neo-yellow)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer group/nav"
           >
             <span className="font-black text-2xl md:text-4xl leading-none">←</span>
           </button>
        </div>
        <div className="absolute inset-y-0 right-0 md:right-4 z-[50] flex items-center px-2">
           <button 
             onClick={nextSlide}
             className="w-10 h-10 md:w-16 md:h-16 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:bg-[var(--neo-yellow)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer group/nav"
           >
             <span className="font-black text-2xl md:text-4xl leading-none">→</span>
           </button>
        </div>

        {/* Frame ID Indicator */}
        <div className="absolute top-4 right-4 z-30 bg-black text-white px-3 py-1 border-2 border-white mono text-[10px] font-bold">
           FRAME_ID: {currentIndex + 1}/05
        </div>

        {/* Status Indicators Side */}
        <div className="absolute left-8 bottom-8 z-30 hidden md:flex flex-col gap-3">
           {featuredList.map((_, idx) => (
             <div 
               key={idx} 
               className={`h-1 transition-all duration-500 border border-black ${idx === currentIndex ? 'w-16 bg-[var(--neo-coral)]' : 'w-8 bg-white/30'}`}
             ></div>
           ))}
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF3B30] text-white px-6 py-3 border-4 border-black transform -rotate-1 shadow-[8px_8px_0px_0px_black]">
              <h2 className="text-4xl md:text-5xl font-black syne italic uppercase">Sedang Populer</h2>
            </div>
            <div className="hidden md:block flex-1 h-2 bg-black min-w-[50px]"></div>
          </div>
          <Link to="/trending">
            <button className="px-6 py-2 bg-[#FFCC00] text-black font-black syne border-4 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer uppercase text-sm md:text-lg">
              See All →
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10">
          {trendingList.map((anime, index) => (
            <div 
              key={anime.id} 
              className="animate-reveal" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AnimeCard anime={anime} onHold={(a) => setSelectedPreview(a)} />
            </div>
          ))}
        </div>
      </section>

      {/* Movies Section */}
      {movieList.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#FFCC00] text-black px-6 py-3 border-4 border-black transform rotate-1 shadow-[8px_8px_0px_0px_black]">
                <h2 className="text-4xl md:text-5xl font-black syne italic uppercase">Film Layar Lebar</h2>
              </div>
              <div className="hidden md:block flex-1 h-2 bg-black min-w-[50px]"></div>
            </div>
            <Link to="/movies">
              <button className="px-6 py-2 bg-black text-white font-black syne border-4 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer uppercase text-sm md:text-lg">
                See All →
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10">
            {movieList.map((anime, index) => (
              <div 
                key={anime.id} 
                className="animate-reveal" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AnimeCard anime={anime} onHold={(a) => setSelectedPreview(a)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Section */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#007AFF] text-white px-6 py-3 border-4 border-black transform rotate-1 shadow-[8px_8px_0px_0px_black]">
              <h2 className="text-4xl md:text-5xl font-black syne italic uppercase">Selesai Ditayangkan</h2>
            </div>
            <div className="hidden md:block flex-1 h-2 bg-black min-w-[50px]"></div>
          </div>
          <Link to="/complete">
            <button className="px-6 py-2 bg-[#4CD964] text-black font-black syne border-4 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer uppercase text-sm md:text-lg">
              See All →
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10">
          {completedList.map((anime, index) => (
            <div 
              key={anime.id} 
              className="animate-reveal" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AnimeCard anime={anime} onHold={(a) => setSelectedPreview(a)} />
            </div>
          ))}
        </div>
      </section>

      {/* Global Preview Modal */}
      <PreviewModal 
        anime={selectedPreview} 
        onClose={() => setSelectedPreview(null)} 
      />
    </div>
  );
};

export default Home;
