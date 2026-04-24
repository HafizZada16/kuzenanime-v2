import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause, 
  faVolumeUp, 
  faVolumeMute, 
  faExpand, 
  faCompress,
  faForward,
  faBackward
} from '@fortawesome/free-solid-svg-icons';

interface StreamData {
  id: string;
  quality: string;
  streaming_url: string;
  ads?: string;
}

interface VideoPlayerProps {
  src: string | undefined;
  title?: string;
  onEnded?: () => void;
  qualities?: StreamData[];
  currentQuality?: string;
  onQualityChange?: (stream: StreamData) => void;
  episodeId?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onEnded,
  qualities = [],
  currentQuality,
  onQualityChange,
  episodeId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [useIframe, setUseIframe] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showShortcutInfo, setShowShortcutInfo] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [hasError, setHasError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);
  const isSwitchingSource = useRef(false);
  const lastEpisodeIdRef = useRef(episodeId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          skip(10);
          break;
        case 'arrowleft':
          skip(-10);
          break;
        case 'arrowup':
          e.preventDefault();
          const volUp = Math.min(1, volume + 0.1);
          setVolume(volUp);
          if (videoRef.current) videoRef.current.volume = volUp;
          break;
        case 'arrowdown':
          e.preventDefault();
          const volDown = Math.max(0, volume - 0.1);
          setVolume(volDown);
          if (videoRef.current) videoRef.current.volume = volDown;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen]);

  useEffect(() => {
    if (!src) return;
    setHasError(false);

    const isEpisodeChange = lastEpisodeIdRef.current !== episodeId;
    lastEpisodeIdRef.current = episodeId;

    if (!isEpisodeChange && videoRef.current && videoRef.current.currentTime > 0) {
      lastTimeRef.current = videoRef.current.currentTime;
      wasPlayingRef.current = !videoRef.current.paused;
      isSwitchingSource.current = true;
    } else {
      lastTimeRef.current = 0;
      isSwitchingSource.current = false;
      if (isEpisodeChange) {
        setProgress(0);
        setCurrentTime(0);
      }
    }

    const isHls = src.includes('.m3u8');
    const isDirectVideo = src.match(/\.(mp4|webm|ogg)(\?|$)/i) !== null || 
                         src.includes('cloudflarestorage.com') || 
                         src.includes('storage.googleapis.com');

    if (isHls || isDirectVideo) {
      setUseIframe(false);
      
      if (isHls && videoRef.current) {
        const video = videoRef.current;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isSwitchingSource.current) {
              video.currentTime = lastTimeRef.current;
              if (wasPlayingRef.current) video.play().catch(() => {});
              isSwitchingSource.current = false;
            }
          });

          return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        }
      } else if (isDirectVideo && videoRef.current) {
        videoRef.current.src = src;
      }
    } else {
      setUseIframe(true);
    }
  }, [src, episodeId]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (isSwitchingSource.current) {
        videoRef.current.currentTime = lastTimeRef.current;
        if (wasPlayingRef.current) {
          videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
        }
        isSwitchingSource.current = false;
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(prog);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      const newTime = (Number(e.target.value) / 100) * videoRef.current.duration;
      if (isFinite(newTime)) {
        videoRef.current.currentTime = newTime;
        setProgress(Number(e.target.value));
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) await containerRef.current.requestFullscreen();
        else if ((containerRef.current as any).webkitRequestFullscreen) await (containerRef.current as any).webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsWithTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  if (!src) return <div className="w-full h-full bg-black flex items-center justify-center text-white/20 font-bold">NO SIGNAL</div>;

  if (useIframe || hasError) {
    return (
      <iframe 
        src={src} 
        className="w-full h-full rounded-2xl" 
        allowFullScreen 
        title={title} 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      ></iframe>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black group overflow-hidden flex items-center justify-center rounded-2xl ${!showControls && isPlaying ? 'cursor-none' : ''}`}
      onMouseMove={showControlsWithTimeout}
      onTouchStart={showControlsWithTimeout}
      onClick={showControlsWithTimeout}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
        onError={() => setHasError(true)}
        playsInline
      />

      {/* Center Play Button (Large) */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${!isPlaying || showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-16 h-16 md:w-20 md:h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-(--primary) hover:scale-110 transition-all">
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="2x" className={!isPlaying ? "ml-1" : ""} />
        </button>
      </div>

      {/* Modern Controls Overlay */}
      <div className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/20 to-transparent px-4 md:px-8 pb-4 md:pb-6 transition-all duration-500 z-30 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        
        {/* Progress Bar Container */}
        <div className="relative w-full group/progress mb-4">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-(--primary) transition-all duration-100" style={{ width: `${progress}%` }}></div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleProgressChange}
            className="relative w-full h-4 bg-transparent appearance-none cursor-pointer outline-none opacity-0 group-hover/progress:opacity-100 transition-opacity accent-(--primary)"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={togglePlay} className="text-white hover:text-(--primary) transition-colors">
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="lg" />
            </button>
            
            <div className="flex items-center gap-4">
               <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors"><FontAwesomeIcon icon={faBackward} /></button>
               <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors"><FontAwesomeIcon icon={faForward} /></button>
            </div>

            <div className="hidden sm:flex items-center gap-3 group/volume">
              <button onClick={toggleMute} className="text-white/80 hover:text-white"><FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} /></button>
              <input type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume} onChange={(e) => { const val = Number(e.target.value); setVolume(val); if (videoRef.current) videoRef.current.volume = val; setIsMuted(val === 0); }} className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 appearance-none rounded-full accent-white" />
            </div>

            <span className="text-white/60 font-medium text-xs md:text-sm tabular-nums">
              {formatTime(currentTime)} <span className="mx-1">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); }}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10"
              >
                {currentQuality || 'AUTO'}
              </button>
              
              {showQualityMenu && qualities.length > 0 && (
                <div className="absolute bottom-full right-0 mb-4 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl min-w-[120px] py-2">
                  {qualities.map((q) => (
                    <button key={q.id} onClick={() => { if (onQualityChange) onQualityChange(q); setShowQualityMenu(false); }} className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-white/5 ${currentQuality === q.quality ? 'text-(--primary)' : 'text-white/60'}`}>
                      {q.quality}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;