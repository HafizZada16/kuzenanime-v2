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
  download_url: string;
  file_size: number;
}

interface VideoPlayerProps {
  src: string | undefined;
  title?: string;
  onEnded?: () => void;
  qualities?: StreamData[];
  currentQuality?: string;
  onQualityChange?: (stream: StreamData) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onEnded,
  qualities = [],
  currentQuality,
  onQualityChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [useIframe, setUseIframe] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (though unlikely here)
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
        case '?':
          setShowShortcutInfo(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen]);

  useEffect(() => {
    if (!src) return;
    setHasError(false);

    // Save current state before switching
    if (videoRef.current && videoRef.current.currentTime > 0) {
      lastTimeRef.current = videoRef.current.currentTime;
      wasPlayingRef.current = !videoRef.current.paused;
      isSwitchingSource.current = true;
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
  }, [src]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && isSwitchingSource.current) {
      videoRef.current.currentTime = lastTimeRef.current;
      if (wasPlayingRef.current) {
        videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
      }
      isSwitchingSource.current = false;
    }
  };

  // Video Events
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  if (!src) return <div className="w-full h-full bg-black flex items-center justify-center text-white font-black oswald">NO SIGNAL</div>;

  if (useIframe || hasError) {
    return (
      <iframe
        src={src}
        className="w-full h-full relative z-10"
        allowFullScreen
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group overflow-hidden flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
        onError={() => setHasError(true)}
        playsInline
      />

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 md:p-6 transition-transform duration-300 z-30 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Progress Bar - Thicker on mobile for easier touch */}
        <div className="relative w-full h-8 mb-2 md:mb-4 flex items-center group/progress">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleProgressChange}
            className="absolute w-full h-2 md:h-2 bg-gray-700 appearance-none cursor-pointer outline-none border-2 border-black accent-[var(--neo-yellow)]"
            style={{
              background: `linear-gradient(to right, var(--neo-yellow) ${progress}%, #374151 ${progress}%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={togglePlay} className="text-[var(--neo-yellow)] hover:scale-110 transition-transform cursor-pointer p-1">
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size={window.innerWidth < 768 ? "sm" : "lg"} />
            </button>
            
            <div className="flex items-center gap-2 md:gap-4">
               <button onClick={() => skip(-10)} className="text-white hover:text-[var(--neo-yellow)] transition-colors cursor-pointer p-1">
                 <FontAwesomeIcon icon={faBackward} size="sm" />
               </button>
               <button onClick={() => skip(10)} className="text-white hover:text-[var(--neo-yellow)] transition-colors cursor-pointer p-1">
                 <FontAwesomeIcon icon={faForward} size="sm" />
               </button>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <button onClick={toggleMute} className="text-white cursor-pointer">
                <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (videoRef.current) videoRef.current.volume = val;
                  setIsMuted(val === 0);
                }}
                className="w-16 md:w-20 h-1 bg-gray-600 appearance-none accent-white cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <span className="text-white mono text-[9px] md:text-xs font-bold bg-black/50 px-2 py-1 border border-white/20 whitespace-nowrap">
              {videoRef.current ? 
                `${Math.floor(videoRef.current.currentTime / 60)}:${Math.floor(videoRef.current.currentTime % 60).toString().padStart(2, '0')}` : 
                '0:00'
              } <span className="hidden xs:inline">/ {videoRef.current ? 
                `${Math.floor(videoRef.current.duration / 60)}:${Math.floor(videoRef.current.duration % 60).toString().padStart(2, '0')}` : 
                '0:00'
              }</span>
            </span>
            
            <div className="flex items-center gap-2">
               {/* Quality Selector */}
               <div className="relative">
                 <button 
                   onClick={() => setShowQualityMenu(!showQualityMenu)}
                   className="bg-black text-white border-2 border-white px-2 py-0.5 mono text-[9px] md:text-[10px] font-bold hover:bg-[var(--neo-yellow)] hover:text-black transition-all cursor-pointer"
                 >
                   {currentQuality || 'AUTO'}
                 </button>
                 
                 {showQualityMenu && qualities.length > 0 && (
                   <div className="absolute bottom-full right-0 mb-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_black] min-w-[100px] md:min-w-[120px] overflow-hidden">
                     <div className="bg-black text-white px-3 py-1 text-[8px] md:text-[9px] heading-font italic">SELECT_RES</div>
                     {qualities.map((q) => (
                       <button
                         key={q.id}
                         onClick={() => {
                           if (onQualityChange) onQualityChange(q);
                           setShowQualityMenu(false);
                         }}
                         className={`w-full text-left px-3 py-2 text-[9px] md:text-[10px] mono font-bold border-b-2 border-black last:border-0 transition-colors hover:bg-[var(--neo-yellow)] ${
                           currentQuality === q.quality ? 'bg-[var(--neo-coral)] text-white' : 'bg-white text-black'
                         }`}
                       >
                         {q.quality}
                       </button>
                     ))}
                   </div>
                 )}
               </div>

               <button onClick={toggleFullscreen} className="text-white hover:text-[var(--neo-yellow)] transition-colors cursor-pointer p-1">
                 <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} size="sm" />
               </button>
               
               <button 
                 onClick={() => setShowShortcutInfo(!showShortcutInfo)}
                 className="hidden md:flex w-6 h-6 rounded-full border-2 border-white text-white items-center justify-center text-[10px] font-bold hover:bg-white hover:text-black transition-all cursor-pointer"
               >
                 ?
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcut Info Overlay */}
      {showShortcutInfo && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--neo-yellow)] border-8 border-black p-8 shadow-[16px_16px_0px_0px_black] max-w-md w-full relative">
            <button 
              onClick={() => setShowShortcutInfo(false)}
              className="absolute top-2 right-2 bg-black text-white w-10 h-10 flex items-center justify-center font-bold border-2 border-black hover:bg-red-500 transition-colors cursor-pointer"
            >
              X
            </button>
            <h3 className="heading-font text-2xl text-black mb-6 border-b-4 border-black pb-2 italic">SHORTCUT_LOGS</h3>
            <div className="space-y-4 mono text-black font-bold">
              <div className="flex justify-between border-b-2 border-black/10 pb-1">
                <span>PLAY/PAUSE</span>
                <span className="bg-black text-[var(--neo-yellow)] px-2">SPACE / K</span>
              </div>
              <div className="flex justify-between border-b-2 border-black/10 pb-1">
                <span>FULLSCREEN</span>
                <span className="bg-black text-[var(--neo-yellow)] px-2">F</span>
              </div>
              <div className="flex justify-between border-b-2 border-black/10 pb-1">
                <span>MUTE</span>
                <span className="bg-black text-[var(--neo-yellow)] px-2">M</span>
              </div>
              <div className="flex justify-between border-b-2 border-black/10 pb-1">
                <span>FORWARD/BACK</span>
                <span className="bg-black text-[var(--neo-yellow)] px-2">← / →</span>
              </div>
              <div className="flex justify-between border-b-2 border-black/10 pb-1">
                <span>VOLUME</span>
                <span className="bg-black text-[var(--neo-yellow)] px-2">↑ / ↓</span>
              </div>
              <div className="flex justify-between">
                <span>HELP</span>
                <span className="bg-black text-[var(--neo-yellow)] px-2">?</span>
              </div>
            </div>
            <p className="mt-8 text-[10px] text-center uppercase font-black italic opacity-50">System: Encryption Stable // User Authorized</p>
          </div>
        </div>
      )}

      {/* Big Play Button on Hover/Pause */}
      {(!isPlaying || showControls) && (
        <button 
          onClick={togglePlay}
          className="absolute z-20 w-20 h-20 bg-[var(--neo-yellow)] border-4 border-black shadow-[8px_8px_0px_0px_black] rounded-none flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all"
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="2x" className={isPlaying ? "" : "ml-2"} />
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;