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
      description: 'Developer utama KanataAnimeV2. Bertanggung jawab untuk pengembangan frontend dan UI/UX aplikasi.',
      avatar: 'https://github.com/idlanyor.png',
      website: 'https://idlanyor.web.id',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Bun', 'Elysia'],
      color: 'yellow'
    },
    {
      name: 'Fatih Firdaus',
      role: 'Penyedia API/Backend',
      github: 'https://github.com/ShirokamiRyzen',
      description: 'Developer backend dan penyedia API Ryzumi untuk KanataAnimeV2.',
      avatar: 'https://github.com/ShirokamiRyzen.png',
      website: 'https://ryzumi.vip/',
      skills: ['Node.js', 'Express', 'REST API', 'Firebase', 'React', 'DevOps'],
      color: 'coral'
    },
    {
      name: 'Sandika',
      role: 'Penyedia API/Backend',
      github: 'https://github.com/SankaVollereii',
      description: 'Penyedia API Sankanime untuk KanataAnimeV2',
      avatar: 'https://github.com/SankaVollereii.png',
      website: 'https://sankavollerei.com/',
      skills: ['Node.js', 'Express', 'Scraping', 'etc'],
      color: 'purple'
    },
    {
      name: 'Antidonasi Member',
      role: 'Supporter Project',
      github: 'https://github.com/AntiDonasi',
      description: 'Pendukung setia Project KanataAnimeV2',
      avatar: 'https://github.com/AntiDonasi.png',
      website: 'https://antidonasi.web.id/',
      skills: ['Rebahan', 'Tidur', 'Nonton Anime', 'etc'],
      color: 'mint'
    }
  ];

  if (loading) return <Loader message="DECRYPTING_AUTHOR_INTEL..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-8xl font-black oswald italic tracking-tighter uppercase inline-block bg-white text-black border-8 border-black p-4 shadow-[12px_12px_0px_0px_var(--neo-yellow)] transform -rotate-2">
          MEET_THE_SQUAD
        </h1>
        <p className="text-xl md:text-2xl font-bold mono text-[var(--neo-coral)] uppercase italic tracking-widest">
           // ARCHITECTS OF THE ANIME REVOLUTION
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {authors.map((author, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white border-8 border-black p-8 shadow-[16px_16px_0px_0px_black] hover:shadow-[24px_24px_0px_0px_black] hover:-translate-x-2 hover:-translate-y-2 transition-all"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="shrink-0 w-32 h-32 border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden transform group-hover:rotate-3 transition-transform">
                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <Badge color={author.color} className="text-xs mb-2">
                    {author.role}
                  </Badge>
                  <h2 className="text-4xl font-black oswald uppercase italic leading-none tracking-tighter text-black">
                    {author.name}
                  </h2>
                </div>
                
                <p className="text-black font-bold italic opacity-80 border-l-4 border-black pl-4">
                  "{author.description}"
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black mono text-black/40 uppercase">
                    <FontAwesomeIcon icon={faCode} /> skills_matrix
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {author.skills.map(skill => (
                      <Badge key={skill} color="black" className="text-[9px]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <a href={author.github} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px]">
                    <Button variant="black" className="w-full text-[10px] flex items-center justify-center gap-2 py-2">
                      <FontAwesomeIcon icon={faGithub} /> GITHUB_PROFILE
                    </Button>
                  </a>
                  <a href={author.website} target="_blank" rel="noreferrer" className="flex-1 min-w-[140px]">
                    <Button variant={author.color} className="w-full text-[10px] flex items-center justify-center gap-2 py-2">
                      <FontAwesomeIcon icon={faGlobe} /> WEBSITE
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className={`absolute -bottom-4 -right-4 w-12 h-12 border-4 border-black -z-10 bg-[var(--neo-${author.color})]`}></div>
          </div>
        ))}
      </div>

      <div className="bg-black text-white p-12 border-8 border-[#FF3B30] shadow-[20px_20px_0px_0px_#FF3B30] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <FontAwesomeIcon icon={faCode} className="text-[120px]" />
         </div>
         <div className="relative z-10 space-y-6 text-center">
            <h3 className="text-3xl md:text-5xl font-black oswald italic uppercase text-[#FFCC00]">MISSION_STATEMENT</h3>
            <p className="text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed">
              KANATANIME V3 ADALAH PLATFORM STREAMING ANIME YANG DIKEMBANGKAN DENGAN ❤️ OLEH ROY ANTIDONASI DKK. KAMI BERKOMITMEN UNTUK MEMBERIKAN PENGALAMAN MENONTON TERBAIK TANPA GANGGUAN.
            </p>
            <div className="pt-8">
              <span className="bg-[#FF3B30] text-white px-8 py-4 font-black oswald text-2xl border-4 border-white shadow-[8px_8px_0px_0px_white] inline-block transform rotate-1">
                POWERED_BY_ANTIDONASI_TEAM
              </span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuthorPage;
