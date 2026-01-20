import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { Anime, DetailedAnime } from '../types';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';

interface PreviewModalProps {
  anime: Anime | null;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ anime, onClose }) => {
  const [detailedData, setDetailedData] = useState<DetailedAnime | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!anime) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/detail/${anime.id}`);
        const json = await res.json();
        
        if (json.status === 'success' && json.data?.data) {
          const d = json.data.data;
          const detailed: DetailedAnime = {
            id: d.id,
            title: d.title,
            thumbnail: d.image_url,
            banner: d.image_url,
            episode: d.latest_episode?.toString() || '?',
            status: d.season_status?.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'ONGOING',
            year: d.release_date ? new Date(d.release_date).getFullYear() : 2026,
            rating: d.rating ? parseFloat(d.rating) : 0,
            genre: d.genres?.map((g: any) => g.genre.name) || [],
            synopsis: d.synopsis || 'No synopsis available.',
            info: {
              japanese: d.title_japanese,
              tipe: d.type,
              jumlah_episode: d.total_episode,
              studio: d.studio?.name || 'N/A',
              score: d.rating,
              producers: 'N/A',
              duration: d.duration,
              aired: d.release_date ? new Date(d.release_date).toLocaleDateString() : 'N/A',
            },
            episodes: [],
          };
          setDetailedData(detailed);
        }
      } catch (err) {
        console.error('Preview fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [anime]);

  if (!anime) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center pb-16 lg:pb-0">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative bg-white border-t-8 border-x-0 md:border-x-8 border-black w-full max-w-2xl shadow-[0_-8px_0_0_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-slide-up rounded-t-[2rem] md:rounded-t-none">
        {/* Handle for dragging feel */}
        <div className="w-full flex justify-center pt-4 pb-2">
           <div className="w-16 h-2 bg-black/20 rounded-full"></div>
        </div>

        <div className="flex flex-col md:flex-row h-full">
           <div className="w-full md:w-2/5 aspect-video md:aspect-[3/4] relative border-b-4 md:border-b-0 md:border-r-4 border-black flex-shrink-0 bg-black">
              <img src={anime.banner || anime.thumbnail} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-6 right-6 md:hidden">
                 <h2 className="heading-font text-xl text-white leading-tight uppercase italic drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {anime.title}
                 </h2>
              </div>
           </div>
           
           <div className="flex-1 p-6 space-y-4 text-black bg-white overflow-y-auto max-h-[50vh] md:max-h-[60vh] scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
              <h2 className="hidden md:block heading-font text-2xl text-black leading-tight uppercase italic mb-4">
                 {anime.title}
              </h2>
              
              {loading ? (
                <div className="py-12 flex flex-col items-center gap-4">
                   <div className="w-10 h-10 border-4 border-black border-t-[var(--neo-yellow)] animate-spin"></div>
                   <span className="font-normal heading-font text-[10px] italic">SCANNING_DATA...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge color="yellow" className="text-[9px] px-2 border-2 border-black">{detailedData?.status || anime.status}</Badge>
                    <Badge color="blue" className="text-[9px] px-2 border-2 border-black">★ {detailedData?.rating?.toFixed(1) || anime.rating.toFixed(1)}</Badge>
                  </div>

                  <div className="bg-black/5 p-3 border-l-4 border-black space-y-1 mono font-bold text-[9px] uppercase">
                     <div className="flex justify-between border-b border-black/5 pb-1">
                        <span className="text-gray-400">Studio</span>
                        <span className="truncate ml-4">{detailedData?.info?.studio || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span>{detailedData?.info?.duration || 'N/A'}</span>
                     </div>
                  </div>

                  <p className="text-[11px] leading-relaxed italic text-gray-800 bg-gray-50 p-3 border-2 border-black">
                    {detailedData?.synopsis || anime.synopsis}
                  </p>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to={`/detail/${anime.id}`} className="w-full">
                  <button className="w-full py-3 bg-[var(--neo-yellow)] text-black border-4 border-black font-normal heading-font text-[11px] uppercase shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer tracking-tighter italic">
                    VIEW_INTEL
                  </button>
                </Link>
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-black text-white border-4 border-black font-normal heading-font text-[11px] uppercase shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer tracking-tighter italic"
                >
                  CLOSE
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
