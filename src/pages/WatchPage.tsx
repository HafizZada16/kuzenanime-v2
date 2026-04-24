import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Badge from '../components/Badge';
import VideoPlayer from '../components/VideoPlayer';
import { DetailedAnime } from '../types';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch, normalizeApiResponse } from '../utils/api';
import { sortEpisodes } from '../utils/episode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import SEO from '../components/SEO';

interface StreamData {
  id: string;
  quality: string;
  streaming_url: string;
  ads?: string;
}

interface ServerData {
  name: string;
  download_url: string;
}

interface QualityGroup {
  quality: string;
  size: string;
  servers: ServerData[];
}

interface DownloadFormat {
  format: string;
  qualities: QualityGroup[];
}

const WatchPage = () => {
  const { slug, episodeSlug: epSlugParam } = useParams<{ slug: string, episodeSlug: string }>();
  const episodeSlug = slug && !epSlugParam ? slug : epSlugParam; // Handle /episode/:slug case
  const navigate = useNavigate();
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [downloads, setDownloads] = useState<DownloadFormat[]>([]);
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
        
        if (epJson.status === 'success' && epJson.data) {
          const rawWatchData = epJson.data.data || epJson.data;
          const watchData = normalizeApiResponse(rawWatchData);
          const streamList = watchData.serverList || [];
          const foundSeriesSlug = watchData.series_slug || watchData.seriesSlug;
          const episodeList = watchData.episodeList || [];
          
          // Group flat downloads by format
          const rawDownloads = watchData.downloadList || [];
          const groupedDownloads: DownloadFormat[] = rawDownloads.reduce((acc: DownloadFormat[], item: any) => {
            let formatGroup = acc.find(f => f.format === item.format);
            if (!formatGroup) {
              formatGroup = { format: item.format, qualities: [] };
              acc.push(formatGroup);
            }
            formatGroup.qualities.push({
              quality: item.quality || 'Unknown',
              size: item.size || 'N/A',
              servers: (item.servers || []).map((s: any) => ({
                name: s.server || s.name || 'Server',
                download_url: s.download_url
              }))
            });
            return acc;
          }, []);

          // Add download servers as extra stream options (iframes/direct)
          const downloadStreams: StreamData[] = rawDownloads.flatMap((dl: any) => 
            (dl.servers || []).map((s: any, sIdx: number) => ({
              id: `dl-${dl.quality}-${s.server || sIdx}`,
              quality: `${dl.quality} - ${s.server || 'Mirror'}`,
              streaming_url: s.download_url,
              ads: 'External'
            }))
          );

          const allStreams = [...streamList, ...downloadStreams];

          setStreams(allStreams);
          setDownloads(groupedDownloads);
          
          // Redirect to proper watch URL if we only have episodeSlug
          if (!slug && foundSeriesSlug) {
              navigate(`/watch/${foundSeriesSlug}/${episodeSlug}`, { replace: true });
              return; // Effect will re-run with slug
          }

          if (!currentSeriesSlug) currentSeriesSlug = foundSeriesSlug;

          // Try to match saved preferred quality
          const savedQuality = localStorage.getItem('preferred_quality');
          const matchedStream = allStreams.find((s: StreamData) => s.quality === savedQuality) || allStreams[0];
          setCurrentStream(matchedStream || null);

          // Pre-populate or update animeDetail with data from watch endpoint if missing
          if (episodeList.length > 0) {
            setAnimeDetail(prev => {
              const mappedEpisodes = sortEpisodes(episodeList.map((ep: any) => ({
                title: ep.title_indonesian || ep.title || `Episode ${ep.number || ep.eps}`,
                episode: (ep.number || ep.eps)?.toString(),
                date: ep.date_created || ep.date || 'Recently',
                slug: ep.slug || ep.id || ep.episodeId
              })), 'oldest');

              if (!prev) {
                return {
                  id: currentSeriesSlug || '',
                  title: watchData.anime_title || watchData.title || 'Loading...',
                  thumbnail: watchData.thumb || watchData.image || watchData.image_url || '',
                  banner: watchData.banner || watchData.thumb || watchData.image || '',
                  episode: watchData.episode_title || '?',
                  status: (watchData.status?.toUpperCase() === 'COMPLETED' || watchData.status?.toUpperCase() === 'TAMAT') ? 'COMPLETED' : 'ONGOING',
                  year: new Date().getFullYear(),
                  rating: 0,
                  genre: watchData.genres?.map((g: any) => g.genre?.name || g.name) || [],
                  synopsis: watchData.synopsis || '',
                  info: {
                    tipe: watchData.type,
                    duration: watchData.duration,
                    studio: watchData.studio?.name || watchData.studio,
                  },
                  episodes: mappedEpisodes
                } as DetailedAnime;
              }
              return {
                ...prev,
                episodes: mappedEpisodes,
                info: {
                  ...prev.info,
                  tipe: prev.info?.tipe || watchData.type,
                  duration: prev.info?.duration || watchData.duration,
                  studio: prev.info?.studio || watchData.studio,
                }
              };
            });
          }
        }

        // 2. Fetch Detail if missing or mismatched
        if (currentSeriesSlug && (!animeDetail || animeDetail.id !== currentSeriesSlug)) {
          const detailRes = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/detail/${currentSeriesSlug}`);
          const detailJson = await detailRes.json();

          if (detailJson.status === 'success' && detailJson.data) {
            const rawDetail = detailJson.data.data || detailJson.data;
            const d = normalizeApiResponse(rawDetail);
            const detailed: DetailedAnime = {
              id: d.seriesSlug || d.slug || d.id,
              title: d.anime_title || d.title,
              thumbnail: d.thumb || d.image_url || d.thumbnail || d.poster,
              banner: d.banner || d.thumb || d.image_url || d.thumbnail || d.poster,
              episode: d.latest_episode?.toString() || d.episode_title || '?',
              status: d.season_status?.toUpperCase() === 'COMPLETED' || d.status?.toUpperCase() === 'COMPLETED' || d.status?.toUpperCase() === 'TAMAT' ? 'COMPLETED' : 'ONGOING',
              year: d.release_date || d.year ? new Date(d.release_date || d.year).getFullYear() : new Date().getFullYear(),
              rating: 0, // Will parse below
              genre: d.genres?.map((g: any) => g.name || g.genre?.name) || d.genre || [],
              synopsis: d.synopsis || 'No synopsis available.',
              info: {
                japanese: d.title_japanese || d.japanese,
                tipe: d.type,
                jumlah_episode: d.total_episode || d.episodes_count,
                studio: d.studio?.name || d.studio || 'N/A',
                score: d.rating || d.score,
                producers: d.producers || 'N/A',
                duration: d.duration,
                aired: d.release_date || d.aired ? new Date(d.release_date || d.aired).toLocaleDateString() : 'N/A',
              },
              episodes: sortEpisodes(d.episodeList?.map((ep: any) => ({
                title: ep.title_indonesian || ep.title || `Episode ${ep.number || ep.eps}`,
                episode: (ep.number || ep.eps)?.toString(),
                date: ep.date_created || ep.date ? new Date(ep.date_created || ep.date).toLocaleDateString() : 'Recently',
                slug: ep.slug || ep.id || ep.episodeId
              })) || [], 'oldest'),
            };

            // Parse rating string
            if (typeof d.rating === 'string') {
              const match = d.rating.match(/(\d+(\.\d+)?)/);
              if (match) detailed.rating = parseFloat(match[0]);
            } else if (typeof d.rating === 'number') {
              detailed.rating = d.rating;
            }

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
          title={`Nonton ${animeDetail.title || 'Anime'} ${currentEpisode.title}`}
          description={`Streaming ${animeDetail.title || 'Anime'} ${currentEpisode.title} Subtitle Indonesia gratis dengan kualitas HD di KuzenAnime V2.`}
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
              title={currentEpisode?.title}
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
                        className="text-(--primary) transition-all duration-1000 linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black tabular-nums text-white">{countdown}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Episode Selanjutnya</p>
                    <h3 className="text-xl font-bold text-white line-clamp-2">{next.title}</h3>
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
                  className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isAutoNext ? 'bg-(--primary)' : 'bg-white/10'}`}
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
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                    {currentEpisode?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-white/40 text-xs font-bold uppercase tracking-wider">
                    <span className="text-yellow-400">★ {animeDetail?.rating || '0.0'}</span>
                    <span>•</span>
                    <span>{animeDetail?.year || '????'}</span>
                    <span>•</span>
                    <span className="text-(--primary)">{animeDetail?.info?.tipe || 'TV'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                   <span>{currentEpisode?.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Status</p>
                  <p className="text-xs font-bold text-white/80">{animeDetail?.status || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Durasi</p>
                  <p className="text-xs font-bold text-white/80">{animeDetail?.info?.duration || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Studio</p>
                  <p className="text-xs font-bold text-white/80 transition-colors hover:text-(--primary) cursor-default">{animeDetail?.info?.studio || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Genre</p>
                  <div className="flex flex-wrap gap-1">
                    {animeDetail?.genre?.slice(0, 2).map((g, i) => (
                      <span key={i} className="text-[10px] font-bold text-white/60">{g}{i < 1 && animeDetail.genre.length > 1 ? ',' : ''}</span>
                    )) || <span className="text-[10px] font-bold text-white/40">N/A</span>}
                  </div>
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
                      ? 'bg-(--primary) text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {stream.quality}
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
                      className={`w-full text-left p-4 flex items-center justify-between gap-4 transition-all group ${
                      ep.slug === episodeSlug 
                      ? 'bg-(--primary)/10 text-(--primary)' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors ${
                          ep.slug === episodeSlug ? 'bg-(--primary) text-white' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'
                        }`}>
                          {ep.episode}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Episode {ep.episode}</span>
                      </div>
                      
                      {ep.slug === episodeSlug && (
                        <div className="w-1.5 h-1.5 rounded-full bg-(--primary) shadow-[0_0_8px_var(--primary)]"></div>
                      )}
                  </button>
                  ))}
              </div>
           </div>

           {/* Download Section */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
              <h3 className="font-bold text-sm">Unduh Video</h3>
              <div className="space-y-6">
                {downloads.map((format, fIdx) => (
                  <div key={fIdx} className="space-y-3">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 rounded bg-(--primary)/20 text-(--primary) text-[10px] font-black uppercase tracking-wider">{format.format}</span>
                       <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {format.qualities?.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                           <div className="flex items-center justify-between px-4 py-2 bg-white/5">
                              <span className="text-xs font-bold text-white/90">{q.quality}</span>
                              <span className="text-[10px] text-white/40 font-medium">{q.size}</span>
                           </div>
                           <div className="p-2 flex flex-wrap gap-2">
                              {q.servers?.map((server, sIdx) => (
                                <a 
                                  key={sIdx}
                                  href={server.download_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 min-w-[80px] flex items-center justify-center gap-2 bg-white/5 py-2 px-3 rounded-lg hover:bg-(--primary) hover:text-white transition-all group"
                                >
                                  <span className="text-[10px] font-bold truncate">{server.name}</span>
                                  <svg className="w-3 h-3 opacity-40 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                </a>
                              ))}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {downloads.length === 0 && (
                  <div className="text-center py-4">
                    <span className="text-xs text-white/20 italic">Tidak ada link unduhan tersedia.</span>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;