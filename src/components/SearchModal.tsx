import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark, faPlay, faClock, faStar } from '@fortawesome/free-solid-svg-icons';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';
import { Anime } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') onClose();
      
      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          handleNavigate(results[selectedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=1`);
          const json = await res.json();
          if (json.status === 'success' && json.data?.data) {
            setResults(json.data.data.slice(0, 8)); // Limit to top 8
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (id: string) => {
    navigate(`/detail/${id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-[#161618] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Search Input Area */}
        <div className="flex items-center p-4 border-b border-white/5 bg-white/5">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/20 mr-4" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik judul anime..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/20"
          />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Mencari...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">Hasil Pencarian</div>
              {results.map((anime, index) => (
                <button
                  key={anime.id}
                  onClick={() => handleNavigate(anime.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                    selectedIndex === index ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/20' : 'bg-transparent border border-transparent'
                  }`}
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/10">
                    <img src={anime.image_url || anime.thumbnail} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${selectedIndex === index ? 'text-[var(--primary)]' : 'text-white/90'}`}>
                      {anime.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] text-white/40 flex items-center gap-1 font-bold italic uppercase tracking-tighter">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                          {anime.rating || '0.0'}
                       </span>
                       <span className="text-[10px] text-white/40 flex items-center gap-1 font-bold italic uppercase tracking-tighter">
                          <FontAwesomeIcon icon={faClock} />
                          {anime.latest_episode ? `EP ${anime.latest_episode}` : '??'}
                       </span>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faPlay} className={`text-xs transition-opacity ${selectedIndex === index ? 'opacity-100 text-[var(--primary)]' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="py-12 text-center text-white/20 space-y-2">
              <FontAwesomeIcon icon={faMagnifyingGlass} size="2x" className="mb-2" />
              <p className="text-sm font-bold uppercase tracking-widest">Tidak ada hasil ditemukan</p>
            </div>
          ) : (
            <div className="py-12 text-center text-white/20">
              <p className="text-sm font-medium italic">Masukkan kata kunci untuk mulai mencari...</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 px-4">
                 {['One Piece', 'Solo Leveling', 'Naruto', 'Bleach'].map(s => (
                   <span key={s} onClick={() => setQuery(s)} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-colors">{s}</span>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-white/5 border-t border-white/5 flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="bg-white/10 px-1 rounded">ENTER</span> untuk pilih</span>
            <span className="flex items-center gap-1"><span className="bg-white/10 px-1 rounded">↑↓</span> untuk navigasi</span>
          </div>
          <span>Esc untuk tutup</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
