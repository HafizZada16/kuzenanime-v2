import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, 
  faClock, 
  faDragon, 
  faLayerGroup, 
  faFilm, 
  faHeart,
  faBars,
  faXmark,
  faCalendar,
  faUsers,
  faTags
} from '@fortawesome/free-solid-svg-icons';

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: 'Beranda', path: '/', icon: faHouse },
    { name: 'Ongoing', path: '/ongoing', icon: faClock },
    { name: 'Movie', path: '/movies', icon: faFilm },
    { name: 'Koleksi', path: '/favorites', icon: faHeart },
  ];

  const moreItems = [
    { name: 'Genre', path: '/genre', icon: faTags },
    { name: 'Musim', path: '/season', icon: faCalendar },
    { name: 'Donghua', path: '/donghua', icon: faDragon },
    { name: 'Tokusatsu', path: '/tokusatsu', icon: faLayerGroup },
    { name: 'Jadwal', path: '/schedule', icon: faCalendar },
    { name: 'Indeks', path: '/list', icon: faLayerGroup },
    { name: 'Tim', path: '/author', icon: faUsers },
  ];

  return (
    <>
      {/* More Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[2050] flex items-end justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <div className="relative -top-15 w-full max-w-sm bg-[#161618] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden p-6 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold uppercase tracking-widest text-xs opacity-40">Menu Lainnya</h3>
              <button onClick={() => setIsMenuOpen(false)} className="text-white/20 hover:text-white">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {moreItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-[var(--primary)]/20"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive(item.path) ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-white/5 text-white/40'}`}>
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <span className={`text-[10px] font-bold ${isActive(item.path) ? 'text-[var(--primary)]' : 'text-white/40'}`}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 z-[2100] w-full h-16 bg-black/60 backdrop-blur-2xl border-t border-white/5">
        <div className="grid h-full grid-cols-5 mx-auto font-medium">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`inline-flex flex-col items-center justify-center transition-all ${isActive(item.path)
                  ? 'text-[var(--primary)]'
                  : 'text-white/40 hover:text-white/60'
                }`}
            >
              <div className={`mb-1 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'scale-90'}`}>
                <FontAwesomeIcon icon={item.icon} className="text-lg" />
              </div>
              <span className="text-[9px] tracking-tight">{item.name}</span>
            </Link>
          ))}
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`inline-flex flex-col items-center justify-center transition-all ${isMenuOpen
                ? 'text-[var(--primary)]'
                : 'text-white/40'
              }`}
          >
            <div className={`mb-1 transition-transform duration-300 ${isMenuOpen ? 'scale-110' : 'scale-90'}`}>
              <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} className="text-lg" />
            </div>
            <span className="text-[9px] tracking-tight">Menu</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
