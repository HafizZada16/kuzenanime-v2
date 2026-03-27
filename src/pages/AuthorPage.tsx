import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faDatabase, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import Loader from '../components/Loader';
import Badge from '../components/Badge';
import Button from '../components/Button';

interface Author {
  name: string;
  role: string;
  github: string;
  description: string;
  avatar: string;
  skills: string[];
  website: string;
  color: 'yellow' | 'coral' | 'purple' | 'mint';
}

const AuthorPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const authors: Author[] = [
    {
      name: 'Roynaldi',
      role: 'Owner & Author Utama',
      github: 'https://github.com/idlanyor',
      description: 'Developer utama KuzenAnime V2. Bertanggung jawab untuk pengembangan frontend dan UI/UX aplikasi.',
      avatar: 'https://github.com/idlanyor.png',
      website: 'https://idlanyor.web.id',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Bun', 'Elysia'],
      color: 'yellow'
    },
    {
      name: 'Fatih Firdaus',
      role: 'Penyedia API/Backend',
      github: 'https://github.com/ShirokamiRyzen',
      description: 'Developer backend dan penyedia API Ryzumi untuk KuzenAnime V2.',
      avatar: 'https://github.com/ShirokamiRyzen.png',
      website: 'https://ryzumi.vip/',
      skills: ['Node.js', 'Express', 'REST API', 'Firebase', 'React', 'DevOps'],
      color: 'coral'
    },
    {
      name: 'Sandika',
      role: 'Penyedia API/Backend',
      github: 'https://github.com/SankaVollereii',
      description: 'Penyedia API Sankanime untuk KuzenAnime V2',
      avatar: 'https://github.com/SankaVollereii.png',
      website: 'https://sankavollerei.com/',
      skills: ['Node.js', 'Express', 'Scraping', 'etc'],
      color: 'purple'
    },
    {
      name: 'Antidonasi Member',
      role: 'Supporter Project',
      github: 'https://github.com/AntiDonasi',
      description: 'Pendukung setia Project KuzenAnime V2',
      avatar: 'https://github.com/AntiDonasi.png',
      website: 'https://antidonasi.web.id/',
      skills: ['Rebahan', 'Tidur', 'Nonton Anime', 'etc'],
      color: 'mint'
    }
  ];

  if (loading) return <Loader message="DECRYPTING_AUTHOR_INTEL..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16 pb-20">
      <header className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter uppercase">
          Meet The <span className="text-[var(--primary)]">Squad</span>
        </h1>
        <p className="text-white/40 text-sm md:text-lg font-medium max-w-2xl mx-auto uppercase tracking-[0.2em]">
           Architects of the anime revolution
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {authors.map((author, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white/5 border border-white/5 p-8 rounded-3xl backdrop-blur-sm transition-all duration-500 hover:bg-white/10 hover:border-[var(--primary)]/20 animate-reveal"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="shrink-0 w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500">
                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <div className="inline-block px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider mb-2">
                    {author.role}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-none">
                    {author.name}
                  </h2>
                </div>
                
                <p className="text-white/60 text-sm leading-relaxed italic">
                  "{author.description}"
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <FontAwesomeIcon icon={faCode} /> skills_matrix
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {author.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium text-white/40">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <a href={author.github} target="_blank" rel="noreferrer" className="flex-1">
                    <button className="iq-btn-secondary w-full text-[10px] py-2 flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faGithub} /> GITHUB
                    </button>
                  </a>
                  <a href={author.website} target="_blank" rel="noreferrer" className="flex-1">
                    <button className="iq-btn-primary w-full text-[10px] py-2 flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faGlobe} /> WEBSITE
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 rounded-3xl p-8 md:p-16 border border-white/5 relative overflow-hidden text-center space-y-8">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <FontAwesomeIcon icon={faCode} className="text-[150px]" />
         </div>
         <div className="relative z-10 space-y-6">
            <h3 className="text-2xl md:text-4xl font-bold text-[var(--primary)] uppercase tracking-tight">Mission Statement</h3>
            <p className="text-lg md:text-2xl font-medium text-white/60 max-w-3xl mx-auto leading-relaxed italic">
              "Platform streaming anime yang dikembangkan dengan ❤️ untuk memberikan pengalaman menonton terbaik tanpa gangguan bagi seluruh penggemar anime di Indonesia."
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-lg font-bold border border-[var(--primary)]/20 shadow-lg shadow-green-500/10">
                <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></span>
                Powered by AntiDonasi Team
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuthorPage;
