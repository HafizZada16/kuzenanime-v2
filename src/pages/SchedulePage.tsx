import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleDay } from '../types';
import Loader from '../components/Loader';
import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { authenticatedFetch } from '../utils/api';

const SchedulePage = () => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await authenticatedFetch(`${ANIMEPLAY_API_BASE_URL}/schedule`);
        const json = await res.json();
        
        if (json.status === 'success' && Array.isArray(json.data)) {
          setSchedule(json.data);
        }
      } catch (err) {
        console.error('Schedule Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <Loader message="Memuat jadwal rilis..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">
      <header className="space-y-4 pt-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[var(--primary)] rounded-full"></span>
          Jadwal Rilis
        </h1>
        <p className="text-white/40 text-sm md:text-base font-medium">Jadwal update episode anime terbaru setiap harinya.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {schedule.map((day) => (
          <div key={day.day} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 flex flex-col h-[600px]">
            <div className="bg-white/5 p-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-[var(--primary)] uppercase tracking-wider text-center">
                {day.day}
              </h2>
            </div>
            <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {day.anime_list.map((anime) => (
                <div 
                  key={anime.slug}
                  onClick={() => navigate(`/detail/${anime.slug}`)}
                  className="group cursor-pointer flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-[var(--primary)]/20 transition-all"
                >
                   <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-black border border-white/10 shadow-lg">
                      <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <p className="font-semibold text-white/80 text-xs line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                     {anime.title}
                   </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
