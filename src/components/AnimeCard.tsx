import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { Anime } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid, faPlay } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { triggerHaptic } from '../utils/haptics';

interface AnimeCardProps {
  anime: Anime;
  onHold?: (anime: Anime) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onHold }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [imgLoaded, setImgLoaded] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressActivated = useRef(false);
  const isFav = isFavorite(anime.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic([10, 50, 10]);
    toggleFavorite(anime);
  };

  const handleTouchStart = () => {
    longPressActivated.current = false;
    holdTimer.current = setTimeout(() => {
      triggerHaptic(30);
      longPressActivated.current = true;
      if (onHold) onHold(anime);
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }
    if (longPressActivated.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressActivated.current = false;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (longPressActivated.current) {
      e.preventDefault();
    } else {
      triggerHaptic(15);
    }
  };

  return (
    <Link 
      to={anime.type === 'episode' ? `/episode/${anime.id}` : `/detail/${anime.id}`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      className="group relative block transition-all duration-300 hover:scale-105"
    >
      <div className="aspect-[2/3] overflow-hidden relative rounded-xl bg-white/5">
        <img 
          src={anime.thumbnail} 
          alt={anime.title} 
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`} 
        />
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
             <div className="w-5 h-5 border-2 border-white/10 border-t-[var(--primary)] rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10">
          <Badge color="primary">{anime.episode || anime.year}</Badge>
        </div>

        {/* Favorite Toggle Button */}
        <button 
          onClick={handleFavorite}
          className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
            isFav ? 'bg-[var(--primary)] text-white' : 'bg-black/40 text-white/70 hover:bg-black/60'
          }`}
        >
          <FontAwesomeIcon icon={isFav ? faHeartSolid : faHeartRegular} size="sm" />
        </button>

        {/* Bottom Metadata Gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-white/80">{anime.status}</span>
              <span className="text-[10px] font-bold text-yellow-400">★ {anime.rating.toFixed(1)}</span>
           </div>
        </div>
      </div>
      
      <div className="mt-2 px-1">
        <h3 className="font-semibold text-sm text-white/90 group-hover:text-[var(--primary)] transition-colors">
          {anime.title}
        </h3>
        <p className="text-[10px] text-white/40 mt-0.5">{anime.genre.slice(0, 1).join(' • ')}</p>
      </div>
    </Link>
  );
};

export default AnimeCard;