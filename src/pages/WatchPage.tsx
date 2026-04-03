import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Badge from '../components/Badge';
import VideoPlayer from '../components/VideoPlayer';
import { DetailedAnime } from '../types';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';
import { sortEpisodes, formatEpisodeTitle } from '../utils/episode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import SEO from '../components/SEO';

interface StreamData {
  id: string;
  quality: string;
  streaming_url: string;
  download_url: string;
  file_size: number;
}

const WatchPage = () => {
  const { slug, episodeSlug: epSlugParam } = useParams<{ slug: string, episodeSlug: string }>();
  const episodeSlug = slug && !epSlugParam ? slug : epSlugParam; // Handle /episode/:slug case
  const navigate = useNavigate();
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [animeDetail, setAnimeDetail] = useState<DetailedAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingEpisode, setFetchingEpisode] = useState(false);
  const [isAutoNext, setIsAutoNext] = useState(true);
  const [showAutoNextOverlay, setShowAutoNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentStream, setCurrentStream] = useState<StreamData | null>(null);
  const activeEpisodeRef = useRef<HTMLButtonElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load preference
    const saved = localStorage.getItem('kanata_auto_next');
    if (saved !== null) setIsAutoNext(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('kanata_auto_next', isAutoNext.toString());
  }, [isAutoNext]);

  const getAdjacentEpisodes = () => {
    if (!animeDetail || !animeDetail.episodes || !episodeSlug) return { prev: null, next: null };
    const list = animeDetail.episodes; 
    const currentIndex = list.findIndex(ep => ep.slug === episodeSlug);
    if (currentIndex === -1) return { prev: null, next: null };
    return {
      prev: currentIndex > 0 ? list[currentIndex - 1] : null,
      next: currentIndex < list.length - 1 ? list[currentIndex + 1] : null
    };
  };

  const { prev, next } = getAdjacentEpisodes();

  const startAutoNextCountdown = () => {
    if (!next || !isAutoNext) return;
    setShowAutoNextOverlay(true);
    setCountdown(5);
    
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          navigate(`/watch/${slug}/${next.slug}`);
          setShowAutoNextOverlay(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelAutoNext = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowAutoNextOverlay(false);
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!episodeSlug) return;
      
      let currentSeriesSlug = slug;

      // Reset states if changing series
      if (animeDetail && slug && animeDetail.id !== slug) {
          setAnimeDetail(null);
          setLoading(true);
          setStreams([]);
          setCurrentStream(null);
      } else if (!animeDetail) {
          setLoading(true);
      } else {
          setFetchingEpisode(true);
      }

      try {
        // 1. Fetch Episode Stream Data
        const epRes = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/watch/${episodeSlug}`);
        const epJson = await epRes.json();
        
        if (epJson.status === 'success' && epJson.data?.data) {
          const streamList = epJson.data.data;
          const foundSeriesSlug = epJson.data.seriesSlug;
          setStreams(streamList);
          
          // Redirect to proper watch URL if we only have episodeSlug
          if (!slug && foundSeriesSlug) {
              navigate(`/watch/${foundSeriesSlug}/${episodeSlug}`, { replace: true });
              return; // Effect will re-run with slug
          }

          if (!currentSeriesSlug) currentSeriesSlug = foundSeriesSlug;

          // Try to match saved preferred quality
          const savedQuality = localStorage.getItem('preferred_quality');
          const matchedStream = streamList.find((s: any) => s.quality === savedQuality) || streamList[0];
          setCurrentStream(matchedStream || null);
        }

        // 2. Fetch Detail if missing or mismatched
        if (currentSeriesSlug && (!animeDetail || animeDetail.id !== currentSeriesSlug)) {
          const detailRes = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/detail/${currentSeriesSlug}`);
          const detailJson = await detailRes.json();

          if (detailJson.status === 'success' && detailJson.data?.data) {
            const d = detailJson.data.data;
            const detailed: DetailedAnime = {
              id: d.slug || d.id,
              title: d.title,
              thumbnail: d.image_url,
              banner: d.image_url,
              episode: d.latest_episode?.toString() || '?',
              status: d.season_status?.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'ONGOING',
              year: d.release_date ? new Date(d.release_date).getFullYear() : new Date().getFullYear(),
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
              episodes: sortEpisodes(d.episodes?.map((ep: any) => ({
                title: ep.title_indonesian || `Episode ${ep.number}`,
                episode: ep.number?.toString(),
                date: ep.date_created ? new Date(ep.date_created).toLocaleDateString() : 'Recently',
                slug: ep.slug || ep.id
              })) || [], 'oldest'),
            };
            setAnimeDetail(detailed);
          }
        }
      } catch (err) {
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
        setFetchingEpisode(false);
      }
    };

    fetchAllData();
    window.scrollTo(0, 0);
  }, [slug, episodeSlug]);


  if (loading && !animeDetail) return <Loader message="Menyiapkan video..." />;

  const currentEpisode = animeDetail?.episodes.find(ep => ep.slug === episodeSlug);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 pb-20">
      {animeDetail && currentEpisode && (
        <SEO 
          title={`Nonton ${animeDetail.title} ${currentEpisode.title}`}
          description={`Streaming ${animeDetail.title} ${currentEpisode.title} Subtitle Indonesia gratis dengan kualitas HD di KuzenAnime V2.`}
          image={animeDetail.banner || animeDetail.thumbnail}
          type="video.episode"
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Video Player Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
            <VideoPlayer 
              episodeId={episodeSlug}
              src={currentStream?.streaming_url} 
              title={animeDetail?.title}
              qualities={streams}
              currentQuality={currentStream?.quality}
              onQualityChange={(stream) => {
                setCurrentStream(stream);
                localStorage.setItem('preferred_quality', stream.quality);
              }}
              onEnded={() => {
                if (next) {
                  if (isAutoNext) {
                    startAutoNextCountdown();
                  } else {
                    // Just stay or manual
                  }
                }
              }}
            />

            {/* Auto Next Overlay */}
            {showAutoNextOverlay && next && (
              <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-reveal">
                <div className="space-y-6 max-w-sm">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-white/10"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * countdown) / 5}
                        className="text-[var(--primary)] transition-all duration-1000 linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black tabular-nums text-white">{countdown}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Episode Selanjutnya</p>
                    <h3 className="text-xl font-bold text-white line-clamp-2">{formatEpisodeTitle(next.title, animeDetail?.title || '', next.episode)}</h3>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => navigate(`/watch/${slug}/${next.slug}`)}
                      className="iq-btn-primary flex-1"
                    >
                      Putar Sekarang
                    </button>
                    <button 
                      onClick={cancelAutoNext}
                      className="iq-btn-secondary flex-1"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {fetchingEpisode && !showAutoNextOverlay && (
              <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white/60 text-sm font-medium">Memuat Episode Selanjutnya...</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => prev && navigate(`/watch/${slug}/${prev.slug}`)}
                disabled={!prev}
                className="iq-btn-secondary flex-1 sm:flex-none px-4 py-2 text-sm disabled:opacity-20 disabled:pointer-events-none"
              >
                <FontAwesomeIcon icon={faPlay} className="rotate-180 mr-2" />
                Sebelumnya
              </button>
              <button 
                onClick={() => next && navigate(`/watch/${slug}/${next.slug}`)}
                disabled={!next}
                className="iq-btn-primary flex-1 sm:flex-none px-4 py-2 text-sm disabled:opacity-20 disabled:pointer-events-none"
              >
                Selanjutnya
                <FontAwesomeIcon icon={faPlay} className="ml-2" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">Auto Next</span>
                <div 
                  onClick={() => setIsAutoNext(!isAutoNext)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isAutoNext ? 'bg-[var(--primary)]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isAutoNext ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>

              <button 
                onClick={() => navigate(`/detail/${slug}`)}
                className="iq-btn-secondary px-4 py-2 text-sm"
              >
                Info Anime
              </button>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="bg-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
               <h1 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                 {formatEpisodeTitle(currentEpisode?.title || '', animeDetail?.title || '', currentEpisode?.episode || '') || currentEpisode?.title}
               </h1>
               <div className="flex items-center gap-3 text-white/40 text-xs">
                  <span className="text-yellow-400 font-bold">★ {animeDetail?.rating}</span>
                  <span>•</span>
                  <span>{animeDetail?.year}</span>
                  <span>•</span>
                  <span>{currentEpisode?.date}</span>
               </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider">Kualitas Video</h3>
              <div className="flex flex-wrap gap-2">
                {streams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setCurrentStream(stream)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      currentStream?.id === stream.id 
                      ? 'bg-[var(--primary)] text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {stream.quality} <span className="text-[9px] opacity-40 ml-1">({stream.file_size}MB)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-4 space-y-6">
           {/* Episode List Sidebar */}
           <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <div className="p-4 border-b border-white/5">
                 <h3 className="font-bold text-sm">Daftar Episode</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {animeDetail?.episodes?.map((ep, idx) => (
                  <button
                      key={idx}
                      ref={ep.slug === episodeSlug ? activeEpisodeRef : null}
                      onClick={() => navigate(`/watch/${slug}/${ep.slug}`)}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                      ep.slug === episodeSlug 
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                      <span className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-white/5 text-[10px] font-bold">{ep.episode}</span>
                      <span className="text-xs truncate font-medium">{formatEpisodeTitle(ep.title, animeDetail.title, ep.episode)}</span>
                  </button>
                  ))}
              </div>
           </div>

           {/* Download Section */}
           <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
              <h3 className="font-bold text-sm">Unduh Video</h3>
              <div className="space-y-2">
                {streams.map((stream) => (
                  <a 
                    key={stream.id}
                    href={stream.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white/80">{stream.quality}</span>
                      <span className="text-[10px] text-white/40">{stream.file_size}MB</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </div>
                  </a>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;