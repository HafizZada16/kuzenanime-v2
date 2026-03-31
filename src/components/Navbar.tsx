import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import SearchModal from './SearchModal';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === '/' && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [currentPath]);

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Ongoing', path: '/ongoing' },
    { name: 'Movie', path: '/movies' },
  ];

  const categoryLinks = [
    { name: 'Semua Genre', path: '/genre' },
    { name: 'Daftar Musim', path: '/season' },
    { name: 'Tokusatsu', path: '/tokusatsu' },
    { name: 'Donghua', path: '/donghua' },
    { name: 'Jadwal Rilis', path: '/schedule' },
    { name: 'Daftar Anime', path: '/list' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <Link 
            to="/"
            className="group flex items-center gap-2.5 shrink-0"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <span className="text-white text-xl font-black italic leading-none translate-x-[-1px]">K</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-black italic tracking-tighter text-xl group-hover:text-[var(--primary)] transition-colors">KUZEN ANIME</span>
              <span className="text-[var(--primary)] font-bold text-[8px] tracking-[0.3em] ml-0.5">STREAMING</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex gap-1 items-center font-bold text-sm">
            {navLinks.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-full transition-all ${
                  isActive(item.path) 
                  ? 'text-[var(--primary)]' 
                  : 'text-white/80 hover:text-[var(--primary)]'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Dropdown Kategori */}
            <div 
              className="relative ml-2"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
               <button 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className={`px-4 py-2 rounded-full transition-all flex items-center gap-1 ${
                   categoryLinks.some(l => isActive(l.path)) ? 'text-[var(--primary)]' : 'text-white/80 hover:text-[var(--primary)]'
                 }`}
               >
                 Jelajahi
                 <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
               </button>

               {isDropdownOpen && (
                 <div className="absolute top-full left-0 pt-2 w-48 z-50">
                   <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {categoryLinks.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`block px-5 py-2.5 text-xs font-bold transition-colors ${
                            isActive(item.path) ? 'text-[var(--primary)] bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                   </div>
                 </div>
               )}
            </div>

            <Link 
              to="/favorites"
              className={`px-4 py-2 rounded-full transition-all ml-2 ${
                isActive('/favorites') ? 'text-[var(--primary)]' : 'text-white/80 hover:text-[var(--primary)]'
              }`}
            >
              Koleksi
            </Link>
            
            <Link 
              to="/author"
              className={`px-4 py-2 rounded-full transition-all ${
                isActive('/author') ? 'text-[var(--primary)]' : 'text-white/80 hover:text-[var(--primary)]'
              }`}
            >
              Tim
            </Link>
          </div>

          {/* Search Trigger */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 max-w-md flex items-center gap-3 bg-white/10 border border-white/5 rounded-full py-1.5 px-4 text-white/30 hover:bg-white/15 transition-all group"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" className="group-hover:text-[var(--primary)] transition-colors" />
            <span className="text-sm flex-1 text-left">Cari anime...</span>
            <div className="hidden md:flex items-center gap-1">
               <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10">⌘ K</kbd>
            </div>
          </button>
        </div>
      </nav>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Navbar;

