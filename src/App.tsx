import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faInstagram, faFacebook, faGithub, faThreads } from '@fortawesome/free-brands-svg-icons';
import { MOCK_ANIME } from './constants';
import { Anime } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OngoingPage from './pages/OngoingPage';
import MoviesPage from './pages/MoviesPage';
import DonghuaPage from './pages/DonghuaPage';
import SearchPage from './pages/SearchPage';
import AnimeDetail from './pages/AnimeDetail';
import WatchPage from './pages/WatchPage';
import SchedulePage from './pages/SchedulePage';
import TrendingPage from './pages/TrendingPage';
import SeriesListPage from './pages/SeriesListPage';
import TokusatsuPage from './pages/TokusatsuPage';
import BottomNav from './components/BottomNav';
import GenrePage from './pages/GenrePage';
import GenreDetailPage from './pages/GenreDetailPage';
import SeasonPage from './pages/SeasonPage';
import SeasonDetailPage from './pages/SeasonDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import SocialMediaPopup from './components/SocialMediaPopup';
import ContextMenu from './components/ContextMenu';
import FavoritesPage from './pages/FavoritesPage';
import AuthorPage from './pages/AuthorPage';
import ScrollToTop from './utils/ScrollToTop';
import { API_BASE_URL, ANIMEPLAY_API_BASE_URL } from './constants';
import { authenticatedFetch } from './utils/api';

export default function App() {
  const [latestEpisodes, setLatestEpisodes] = useState<Anime[]>([]);
  const [trendingList, setTrendingList] = useState<Anime[]>([]);
  const [newSeries, setNewSeries] = useState<Anime[]>([]);
  const [latestBatch, setLatestBatch] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  const mapApiData = (data: any[]): Anime[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail || item.image_url || '',
      banner: item.banner || item.thumbnail || item.image_url || '',
      episode: item.episode ? `EP ${item.episode}` : '??',
      status: item.status || 'ONGOING',
      year: item.year || new Date().getFullYear(),
      rating: item.rating ? parseFloat(item.rating) : 0,
      genre: item.genre || ['Anime'], 
      synopsis: item.synopsis || `Watch ${item.title} on KuzenAnime V2.`,
      likes: '0',
      type: item.type
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/home`);
        const json = await res.json();

        if (json.status === 'success' && json.data) {
          const latest = json.data.find((d: any) => d.type === 'latest_episodes')?.data || [];
          const trending = json.data.find((d: any) => d.type === 'trending')?.data || [];
          const series = json.data.find((d: any) => d.type === 'new_series')?.data || [];
          const batch = json.data.find((d: any) => d.type === 'latest_batch')?.data || [];
          
          setLatestEpisodes(mapApiData(latest));
          setTrendingList(mapApiData(trending));
          setNewSeries(mapApiData(series));
          setLatestBatch(mapApiData(batch));
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        setLatestEpisodes(MOCK_ANIME);
        setTrendingList(MOCK_ANIME);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[var(--primary)] selection:text-white overflow-x-hidden">
      <ScrollToTop />
      <SocialMediaPopup />
      {/* <ContextMenu /> */}
      <Navbar />
      <main className="pt-20 pb-24 md:pb-20 lg:pb-20">
        <Routes>
          <Route path="/" element={
            <Home 
              latest={latestEpisodes}
              trending={trendingList} 
              series={newSeries} 
              batch={latestBatch} 
              loading={loading} 
            />
          } />
          <Route path="/ongoing" element={<OngoingPage />} />
          <Route path="/tokusatsu" element={<TokusatsuPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/donghua" element={<DonghuaPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/list" element={<SeriesListPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/genre" element={<GenrePage />} />
          <Route path="/genre/:genreId" element={<GenreDetailPage />} />
          <Route path="/season" element={<SeasonPage />} />
          <Route path="/season/:seasonId" element={<SeasonDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/author" element={<AuthorPage />} />
          <Route path="/search/:query" element={<SearchPage />} />
          <Route path="/detail/:slug" element={<AnimeDetail />} />
          <Route path="/watch/:slug/:episodeSlug" element={<WatchPage />} />
          <Route path="/episode/:episodeSlug" element={<WatchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <BottomNav />

      <footer className="mt-20 bg-[#0a0a0c] border-t border-white/5 pt-16 pb-32 lg:pb-16 relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Section */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-white font-black italic text-2xl">K</span>
                </div>
                <span className="text-white font-black italic tracking-tighter text-2xl group-hover:text-[var(--primary)] transition-colors">KUZEN ANIME</span>
              </Link>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                Platform streaming anime paling imersif dengan koleksi terlengkap dan kualitas terbaik. Dibuat oleh fans, untuk fans.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: faWhatsapp, href: "#", color: "hover:bg-[#25D366]" },
                  { icon: faInstagram, href: "#", color: "hover:bg-[#E4405F]" },
                  { icon: faGithub, href: "#", color: "hover:bg-white hover:text-black" }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 transition-all duration-300 ${social.color} hover:text-white hover:-translate-y-1`}
                  >
                    <FontAwesomeIcon icon={social.icon} size="sm" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--primary)] rounded-full"></span>
                Menu Utama
              </h4>
              <ul className="grid grid-cols-2 gap-4 text-sm">
                <li><Link to="/" className="text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-2">Beranda</Link></li>
                <li><Link to="/ongoing" className="text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-2">Ongoing</Link></li>
                <li><Link to="/movies" className="text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-2">Movies</Link></li>
                <li><Link to="/donghua" className="text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-2">Donghua</Link></li>
                <li><Link to="/tokusatsu" className="text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-2">Tokusatsu</Link></li>
                <li><Link to="/schedule" className="text-white/40 hover:text-[var(--primary)] transition-colors flex items-center gap-2">Jadwal</Link></li>
              </ul>
            </div>

            {/* Discover */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--primary)] rounded-full"></span>
                Jelajahi
              </h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/genre" className="text-white/40 hover:text-[var(--primary)] transition-colors">Semua Genre</Link></li>
                <li><Link to="/season" className="text-white/40 hover:text-[var(--primary)] transition-colors">Daftar Musim</Link></li>
                <li><Link to="/list" className="text-white/40 hover:text-[var(--primary)] transition-colors">Indeks Anime</Link></li>
                <li><Link to="/author" className="text-white/40 hover:text-[var(--primary)] transition-colors">Meet the Team</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--primary)] rounded-full"></span>
                Berlangganan
              </h4>
              <p className="text-xs text-white/30 leading-relaxed">
                Dapatkan notifikasi rilis anime terbaru langsung ke email Anda.
              </p>
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 focus-within:border-[var(--primary)]/50 focus-within:ring-4 focus-within:ring-[var(--primary)]/10 transition-all">
                <input 
                  type="email" 
                  className="bg-transparent px-4 py-2 w-full outline-none text-sm text-white placeholder:text-white/20" 
                  placeholder="email@anda.com" 
                />
                <button className="bg-[var(--primary)] text-white px-5 rounded-lg font-bold text-xs uppercase hover:bg-[var(--primary-hover)] transition-colors">
                  Gabung
                </button>
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div className="mt-20 pt-10 border-t border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-12">
              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Disclaimer</h5>
                <p className="text-[11px] text-white/30 leading-relaxed text-justify">
                  KuzenAnime V2 adalah platform agregator konten yang melakukan crawling data secara otomatis. Kami TIDAK menyimpan, menghosting, atau mengunggah file video apa pun ke server kami. Seluruh konten disediakan oleh pihak ketiga yang tidak memiliki hubungan kerjasama dengan kami. Kami tidak bertanggung jawab atas legalitas atau keakuratan isi konten tersebut.
                </p>
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">DMCA Notice</h5>
                <p className="text-[11px] text-white/30 leading-relaxed text-justify">
                  Kami sangat menghormati hak kekayaan intelektual orang lain. Jika Anda adalah pemegang hak cipta dan menemukan materi Anda ditautkan di sini tanpa izin, silakan hubungi penyedia layanan hosting tempat file tersebut berada. Penghapusan file di sumber asli akan secara otomatis menghapus tautan dari indeks kami.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              <p>© 2023 - {new Date().getFullYear()} KUZENANIME V2 • BEYOND STREAMING</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}