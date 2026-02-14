import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DetailedAnime } from '../types';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useFavorites } from '../hooks/useFavorites';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';
import { sortEpisodes } from '../utils/episode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlay, faBookmark, faInfoCircle, faCalendar, faFilm, faUsers, faLayerGroup, faMagnifyingGlass, faHeart, faHeartCircleCheck, faHeartCirclePlus } from '@fortawesome/free-solid-svg-icons';
import SEO from '../components/SEO';

const AnimeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<DetailedAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setAnime(null);
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
            status: d.season_status?.toUpperCase() === 'COMPLETED' ? "COMPLETED" : 'ONGOING',
            year: d.release_date ? new Date(d.release_date).getFullYear() : 2026,
            rating: d.rating ? parseFloat(d.rating) : 0,
            genre: d.genres?.map((g: any) => g.genre.name) || [],
            synopsis: d.synopsis || 'Tidak ada sinopsis.',
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

  if (loading || !anime) return <Loader message="Memuat detail anime..." />;

  const handleWatch = (epSlug: string) => {
      navigate(`/watch/${slug}/${epSlug}`);
  };

  const filteredEpisodes = sortEpisodes(
    (anime.episodes || []).filter(ep => 
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ep.episode.includes(searchQuery)
    ),
    sortOrder
  );

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] -mt-28">
      {anime && (
        <SEO 
          title={anime.title}
          description={anime.synopsis}
          image={anime.banner || anime.thumbnail}
          type="video.movie"
        />
      )}
      {/* Immersive Header */}      <div className="relative w-full h-[65vh] md:h-[80vh] flex items-end">
        {/* Background Banner */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={anime.banner} 
            onLoad={() => setBannerLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${bannerLoaded ? 'opacity-30' : 'opacity-0'}`}
            alt="banner" 
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
             <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-end text-center lg:text-left">
                <div className="w-44 lg:w-52 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shrink-0 border border-white/10 mx-auto lg:mx-0 bg-black/40">
                   <img src={anime.thumbnail} className="w-full h-full object-cover" alt={anime.title} />
                </div>
                <div className="flex-1 space-y-4 w-full">
                   <div className="flex items-center justify-center lg:justify-start gap-3">
                      <Badge color="primary">{anime.status}</Badge>
                      <span className="text-white/60 text-sm">{anime.year} • {anime.info?.tipe} • {anime.info?.duration}</span>
                   </div>
                   <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                      {anime.title}
                   </h1>
                   <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                      {anime.genre.map((g, i) => (
                        <span key={i} className="text-sm text-white/40 hover:text-[var(--primary)] cursor-default transition-colors">{g}{i < anime.genre.length - 1 ? ' • ' : ''}</span>
                      ))}
                   </div>
                   <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                      <button 
                        onClick={() => anime.episodes && anime.episodes.length > 0 && handleWatch(anime.episodes[0].slug)}
                        className="iq-btn-primary flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        Mulai Menonton
                      </button>
                      <button 
                        onClick={() => toggleFavorite(anime)}
                        className={`iq-btn-secondary flex items-center gap-2 ${isFavorite(anime.id) ? 'text-[var(--primary)]' : ''}`}
                      >
                        <FontAwesomeIcon icon={isFavorite(anime.id) ? faHeartCircleCheck : faHeartCirclePlus} />
                        {isFavorite(anime.id) ? 'Tersimpan':'Simpan'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Synopsis */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-1 h-5 bg-[var(--primary)] rounded-full"></span>
                Sinopsis
             </h2>
             <p className="text-white/60 leading-relaxed text-sm md:text-base">
                {anime.synopsis}
             </p>
          </section>

          {/* Episode List */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   <span className="w-1 h-5 bg-[var(--primary)] rounded-full"></span>
                   Daftar Episode
                </h2>
                <button 
                   onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                   className="text-sm text-white/40 hover:text-[var(--primary)] flex items-center gap-2"
                >
                   {sortOrder === 'newest' ? 'Terbaru' : 'Terlama'}
                   <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredEpisodes.map((ep) => (
                  <button 
                    key={ep.slug}
                    onClick={() => handleWatch(ep.slug)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left group border border-transparent hover:border-[var(--primary)]/20"
                  >
                    <div className="w-12 h-12 rounded flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)] font-bold shrink-0">
                      {ep.episode}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-[var(--primary)] transition-colors">
                        {ep.title.replace(anime.title, '').trim() || `Episode ${ep.episode}`}
                      </h4>
                      <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{ep.date}</p>
                    </div>
                    <FontAwesomeIcon icon={faPlay} className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                  </button>
                ))}
             </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
              <h3 className="font-bold text-lg">Informasi Anime</h3>
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40">Skor</span>
                    <span className="text-yellow-400 font-bold">★ {anime.rating}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40">Studio</span>
                    <span className="text-white/80">{anime.info?.studio}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40">Total Episode</span>
                    <span className="text-white/80">{anime.info?.jumlah_episode || '?'}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40">Durasi</span>
                    <span className="text-white/80">{anime.info?.duration}</span>
                 </div>
                 <div className="space-y-2">
                    <span className="text-white/40 text-xs block">Judul Jepang</span>
                    <span className="text-white/80 text-xs leading-relaxed block">{anime.info?.japanese}</span>
                 </div>
              </div>
           </section>

           {/* Recommendations */}
           {anime.recommended && anime.recommended.length > 0 && (
              <section className="space-y-4">
                 <h3 className="font-bold text-lg">Rekomendasi</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {anime.recommended.slice(0, 4).map((rel) => (
                       <Link 
                        key={rel.animeId} 
                        to={`/detail/${rel.animeId}`}
                        className="group space-y-2"
                       >
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
                             <img src={rel.poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rel.title} />
                          </div>
                          <h4 className="text-[11px] font-medium line-clamp-2 text-white/70 group-hover:text-[var(--primary)] transition-colors">{rel.title}</h4>
                       </Link>
                    ))}
                 </div>
              </section>
           )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;