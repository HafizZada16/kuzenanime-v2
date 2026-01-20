import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetailedAnime } from '../types';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useFavorites } from '../hooks/useFavorites';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlay, faBookmark, faInfoCircle, faCalendar, faFilm, faUsers, faLayerGroup, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const AnimeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<DetailedAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toggleFavorite, isFavorite } = useFavorites();
  const batchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/detail/${slug}`);
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
            episodes: d.episodes?.map((ep: any) => ({
              title: ep.title_indonesian || `Episode ${ep.number}`,
              episode: ep.number?.toString(),
              date: ep.date_created ? new Date(ep.date_created).toLocaleDateString() : 'Recently',
              slug: ep.id
            })) || [],
            recommended: d.recommendations?.map((r: any) => ({
                animeId: r.id,
                title: r.title,
                poster: r.image_url
            })) || [],
          };

          setAnime(detailed);
        }
      } catch (err) {
        console.error('Detail Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading || !anime) return <Loader message="DECRYPTING ANIME DATA..." />;

  const handleWatch = (epSlug: string) => {
      navigate(`/watch/${slug}/${epSlug}`);
  };

  const filteredEpisodes = (anime.episodes || [])
    .filter(ep => 
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ep.episode.includes(searchQuery)
    )
    .sort((a, b) => {
      const numA = parseInt(a.episode) || 0;
      const numB = parseInt(b.episode) || 0;
      return sortOrder === 'newest' ? numB - numA : numA - numB;
    });

  return (
    <div className="min-h-screen bg-[#0c0c0c] pb-20">
      {/* 1. HERO BANNER SECTION */}
      <div className="relative h-[50vh] md:h-[100vh] w-full overflow-hidden border-b-8 border-black -mt-28 pt-28">
        {/* Absolute Background Image to ensure it bleeds to the top */}
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src={anime.banner} 
            onLoad={() => setBannerLoaded(true)}
            className={`w-full h-full object-cover grayscale-[0.5] contrast-125 scale-105 transition-opacity duration-700 ${bannerLoaded ? 'opacity-40' : 'opacity-0'}`}
            alt="banner" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent"></div>
        </div>
        
        {/* Back Button Overlay - Now relative to the padded container */}
        <div className="relative z-30 px-4 md:px-8 pt-4 md:pt-8">
           <button 
             onClick={() => navigate(-1)}
             className="bg-white text-black border-4 border-black p-4 font-normal heading-font text-xs shadow-[4px_4px_0px_0px_black] hover:bg-[var(--neo-yellow)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer tracking-tighter"
           >
             ← BACK_TO_DATABASE
           </button>
        </div>

        {/* Title Overlay - Relative to padded container */}
        <div className="absolute bottom-6 md:bottom-12 left-4 md:left-8 right-4 md:right-8 z-20">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 text-center md:text-left">
              <div className="hidden md:block w-64 aspect-[3/4] border-8 border-black shadow-[12px_12px_0px_0px_var(--neo-purple)] transform rotate-2 overflow-hidden shrink-0 bg-black">
                 <img 
                    src={anime.thumbnail} 
                    onLoad={() => setThumbLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${thumbLoaded ? 'opacity-100' : 'opacity-0'}`}
                    alt={anime.title} 
                 />
              </div>
              <div className="flex-1 space-y-2 md:space-y-4">
                 <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                    <Badge className="text-[15px] md:text-[50px]" color="yellow">{anime.status}</Badge>
                    <Badge color="coral" className="text-[15px] md:text-[50px]">{anime.info?.tipe || 'TV'}</Badge>
                    <Badge className="text-[15px] md:text-[50px]" color="mint">{anime.year}</Badge>
                 </div>
                 <h1 className="text-2xl md:text-6xl lg:text-7xl font-normal heading-font text-white leading-tight md:leading-none tracking-tighter italic uppercase drop-shadow-[2px_2px_0px_black] md:drop-shadow-[4px_4px_0px_0px_black]">
                    {anime.title}
                 </h1>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-8 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-30">
        
        {/* 2. SIDEBAR - STATS & INFO */}
        <div className="lg:col-span-4 space-y-10">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[var(--neo-yellow)] border-4 border-black p-4 shadow-[6px_6px_0px_0px_black] text-black">
                <div className="flex items-center gap-2 mb-1 opacity-60">
                   <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                   <span className="text-[10px] font-bold mono uppercase">Rating</span>
                </div>
                <div className="text-3xl font-normal heading-font italic tracking-tighter">{anime.rating}</div>
             </div>
             <div className="bg-[var(--neo-mint)] border-4 border-black p-4 shadow-[6px_6px_0px_0px_black] text-black">
                <div className="flex items-center gap-2 mb-1 opacity-60">
                   <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
                   <span className="text-[10px] font-bold mono uppercase">Episodes</span>
                </div>
                <div className="text-3xl font-normal heading-font italic tracking-tighter">{anime.info?.jumlah_episode || '?'}</div>
             </div>
          </div>

          {/* Detailed Metadata Card */}
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_black] text-black">
             <h3 className="font-normal heading-font text-xl border-b-4 border-black pb-4 mb-6 italic tracking-tighter uppercase flex items-center justify-between">
                <span>INTEL_REPORT</span>
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-300" />
             </h3>
             <div className="space-y-6 mono font-bold text-xs uppercase">
                <div className="space-y-1">
                   <span className="text-gray-400 block text-[9px]">Japanese Title</span>
                   <span className="text-black break-words">{anime.info?.japanese || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <span className="text-gray-400 block text-[9px]">Studio</span>
                      <span className="text-black">{anime.info?.studio || 'N/A'}</span>
                   </div>
                   <div className="space-y-1">
                      <span className="text-gray-400 block text-[9px]">Duration</span>
                      <span className="text-black">{anime.info?.duration || 'N/A'}</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <span className="text-gray-400 block text-[9px]">Aired Date</span>
                   <span className="text-black">{anime.info?.aired || 'N/A'}</span>
                </div>
                <div className="pt-6 border-t-2 border-black/5">
                   <span className="text-gray-400 block text-[9px] mb-3">Genres</span>
                   <div className="flex flex-wrap gap-2">
                      {anime.genre?.map((g: any, idx: number) => (
                        <span key={idx} className="bg-black text-white px-2 py-1 text-[9px] border border-black hover:bg-[var(--neo-yellow)] hover:text-black transition-colors">
                           {g}
                        </span>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
             <Button 
                variant="yellow" 
                className="w-full text-xl py-6"
                onClick={() => anime.episodes && anime.episodes.length > 0 && handleWatch(anime.episodes[0].slug)}
             >
                <FontAwesomeIcon icon={faPlay} className="mr-3" /> play first episode 
             </Button>
             <Button 
                variant={isFavorite(anime.id) ? "coral" : "white"} 
                className="w-full text-lg"
                onClick={() => toggleFavorite(anime)}
             >
                <FontAwesomeIcon icon={faBookmark} className="mr-3" /> {isFavorite(anime.id) ? "SECURED_IN_LIST" : "ADD_TO_DATABASE"}
             </Button>
          </div>
        </div>

        {/* 3. MAIN CONTENT - SYNOPSIS & EPISODES */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Synopsis Section */}
          <div className="relative">
             <div className="bg-black text-white p-6 md:p-12 border-4 md:border-8 border-white shadow-[8px_8px_0px_0px_var(--neo-coral)] md:shadow-[16px_16px_0px_0px_var(--neo-coral)]">
                <h2 className="font-normal heading-font text-xl md:text-3xl mb-6 md:mb-8 italic tracking-tighter text-[var(--neo-yellow)] flex items-center gap-4">
                   <span className="w-8 md:w-12 h-1 bg-[var(--neo-yellow)]"></span>
                   OBJECTIVE_SUMMARY
                </h2>
                <p className="text-sm md:text-xl leading-relaxed italic opacity-90 first-letter:text-4xl md:first-letter:text-5xl first-letter:font-black first-letter:mr-2 md:first-letter:mr-3 first-letter:float-left first-letter:text-[var(--neo-coral)] break-words">
                   {anime.synopsis}
                </p>
             </div>
             <div className="absolute -z-10 -top-2 -left-2 md:-top-4 md:-left-4 w-full h-full border-2 md:border-4 border-[var(--neo-purple)] opacity-20"></div>
          </div>

          {/* Episode List Section - Refactored for better visibility */}
          <div className="space-y-8">
             <div className="bg-black border-8 border-white p-6 md:p-8 shadow-[16px_16px_0px_0px_var(--neo-purple)]">
                <div className="flex flex-col gap-6">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h2 className="text-4xl md:text-5xl font-normal heading-font italic tracking-tighter text-white">
                         DEPLOYMENT_LOGS
                      </h2>
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                         <button 
                            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                            className="bg-[var(--neo-mint)] text-black px-4 py-2 border-4 border-black font-normal heading-font text-[10px] uppercase shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer tracking-tighter"
                         >
                            SORT: {sortOrder.toUpperCase()}
                         </button>
                         {anime.info?.jumlah_episode && (
                            <div className="bg-white text-black px-4 py-2 border-4 border-black font-normal heading-font text-[10px] uppercase shadow-[4px_4px_0px_0px_black] tracking-tighter">
                               COUNT: {anime.info.jumlah_episode}
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Search Bar for Episodes */}
                   <div className="relative">
                      <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="FIND_SPECIFIC_EPISODE..." 
                         className="w-full bg-white border-4 border-black p-4 px-6 font-bold mono text-black placeholder:text-gray-400 outline-none focus:bg-[var(--neo-yellow)] transition-colors shadow-[8px_8px_0px_0px_var(--neo-coral)] focus:shadow-none focus:translate-x-[8px] focus:translate-y-[8px]"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none">
                         <FontAwesomeIcon icon={faMagnifyingGlass} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {filteredEpisodes.length > 0 ? (
                      filteredEpisodes.map((ep) => (
                        <button 
                           key={ep.slug}
                           onClick={() => handleWatch(ep.slug)}
                           className="group relative bg-white border-4 border-black p-6 flex items-center gap-6 shadow-[6px_6px_0px_0px_black] hover:bg-[var(--neo-yellow)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-left overflow-hidden"
                        >
                           <div className="w-16 h-16 shrink-0 bg-black text-white border-4 border-black flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform">
                              <span className="text-[10px] font-bold mono opacity-50">EP</span>
                              <span className="text-2xl font-normal heading-font tracking-tighter">{ep.episode?.padStart(2, '0')}</span>
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <h4 className="font-normal heading-font text-sm text-black truncate mb-1">
                                 {ep.title.replace(anime.title, '').replace('Subtitle Indonesia', '').trim() || `Episode ${ep.episode}`}
                              </h4>
                              <span className="mono text-[9px] font-bold text-gray-400 uppercase italic group-hover:text-black/60 transition-colors">DATE_{ep.date}</span>
                           </div>
                           <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-black text-white group-hover:bg-[var(--neo-coral)] transition-all">
                              <FontAwesomeIcon icon={faPlay} className="text-xs" />
                           </div>
                        </button>
                      ))
                   ) : (
                      <div className="col-span-full py-20 text-center bg-black/40 border-4 border-dashed border-gray-600">
                         <span className="font-normal heading-font text-xl text-gray-500 italic">NO_DATA_MATCHES_QUERY</span>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Recommendations / Related Intel */}
          {anime.recommended && anime.recommended.length > 0 && (
             <div className="pt-6 md:pt-12">
                <div className="bg-[var(--neo-purple)] border-4 border-black p-4 md:p-6 mb-8 transform -rotate-1 shadow-[4px_4px_0px_0px_black] md:shadow-[8px_8px_0px_0px_black]">
                   <h3 className="font-normal heading-font text-lg md:text-2xl text-black italic tracking-tighter uppercase text-center">
                      SIMILAR_ANOMALIES_DETECTED
                   </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                   {anime.recommended.map((rel: any) => (
                      <div 
                         key={rel.animeId}
                         onClick={() => navigate(`/detail/${rel.animeId}`)}
                         className="group cursor-pointer space-y-2 md:space-y-3"
                      >
                         <div className="aspect-[3/4] border-2 md:border-4 border-black overflow-hidden shadow-[3px_3px_0px_0px_black] md:shadow-[4px_4px_0px_0px_black] group-hover:shadow-[6px_6px_0px_0px_black] group-hover:-translate-y-1 transition-all">
                            <img src={rel.poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rel.title} />
                         </div>
                         <h5 className="font-normal heading-font text-[9px] md:text-[10px] text-white line-clamp-2 leading-none tracking-tighter uppercase">
                            {rel.title}
                         </h5>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;