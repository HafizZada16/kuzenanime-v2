import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';

interface GroupedList {
  letter: string;
  items: { id: string; title: string }[];
}

const SeriesListPage = () => {
  const [groupedList, setGroupedList] = useState<GroupedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/list-mode`);
        const json = await res.json();
        
        if (json.status === 'success' && Array.isArray(json.data)) {
          setGroupedList(json.data);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
    window.scrollTo(0, 0);
  }, []);

  const filteredList = groupedList.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  if (loading) return <Loader message="Memuat daftar anime..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">
      <header className="space-y-8 pt-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
            Indeks Anime
          </h1>
          <p className="text-white/40 text-sm md:text-base font-medium">Temukan koleksi anime kami berdasarkan urutan abjad.</p>
        </div>
        
        <div className="relative max-w-xl group">
          <input 
            type="text" 
            placeholder="Cari judul anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 pl-12 text-sm text-white placeholder:text-white/20 outline-none focus:bg-white/10 focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/10 transition-all"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--primary)] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </header>

      {/* A-Z Quick Jump */}
      <div className="flex flex-wrap items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm sticky top-24 z-20">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mr-2">Lompat ke:</span>
        {groupedList.map((group, idx) => (
          <a 
            key={`${group.letter}-${idx}`} 
            href={`#letter-${group.letter}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all text-white/40 hover:bg-[var(--primary)] hover:text-white"
          >
            {group.letter}
          </a>
        ))}
      </div>

      <section className="space-y-16">
        {filteredList.length > 0 ? (
          filteredList.map((group, gIdx) => (
            <div key={`${group.letter}-${gIdx}`} id={`letter-${group.letter}`} className="scroll-mt-40 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-white/10 select-none">{group.letter}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item, iIdx) => (
                  <div 
                    key={`${item.id}-${gIdx}-${iIdx}`}
                    onClick={() => navigate(`/detail/${item.id}`)}
                    className="group cursor-pointer bg-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 border border-transparent hover:border-[var(--primary)]/20 transition-all"
                  >
                    <div className="w-1 h-4 bg-white/10 group-hover:bg-[var(--primary)] rounded-full transition-colors"></div>
                    <span className="text-sm font-medium text-white/70 group-hover:text-white truncate">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 rounded-3xl bg-white/5 border border-dashed border-white/10">
             <div className="text-white/20 mb-4 flex justify-center">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 0112.728 0M12 14V14.01M5.636 5.636a9 9 0 1112.728 0M12 7V12"></path></svg>
             </div>
             <h2 className="text-xl font-bold text-white/40">Tidak ada judul yang ditemukan</h2>
             <p className="text-white/20 text-sm mt-2">Coba kata kunci lain atau periksa filter Anda.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SeriesListPage;

