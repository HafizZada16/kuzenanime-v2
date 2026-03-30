/// <reference types="vite/client" />

import { Anime, Episode } from './types';

const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const VITE_API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

export const API_BASE_URL = `${VITE_API_URL}/api/sanka`;
export const ANIMEPLAY_API_BASE_URL = `${VITE_API_URL}/api/animeplay`;
export const STREAM_API_BASE_URL = `${VITE_API_URL}/api/ryzumi`;

export const MOCK_ANIME: Anime[] = [
  {
    id: 'shadow-nexus',
    title: 'Shadow Nexus',
    thumbnail: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=400&h=600',
    banner: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=1200&h=600',
    episode: 'EP 1',
    status: 'ONGOING',
    year: 2024,
    rating: 8.9,
    genre: ['ACTION', 'FANTASY', 'SCI-FI'],
    synopsis: 'Kenji Kurezaki awakens to his hidden powers after a deadly encounter with a shadowy creature, thrusting him into the battle for humanity\'s survival.',
    likes: '28K'
  },
  {
    id: 'cyber-knight',
    title: 'Cyber Knight',
    thumbnail: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400&h=600',
    banner: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200&h=600',
    episode: 'EP 7',
    status: 'ONGOING',
    year: 2023,
    rating: 8.5,
    genre: ['SCI-FI', 'ACTION'],
    synopsis: 'In a neon-drenched future, a rogue AI hunter discovers a conspiracy that could end all digital life.',
    likes: '12K'
  },
  {
    id: 'echo-quest',
    title: 'Echo Quest',
    thumbnail: 'https://images.unsplash.com/photo-1578632738981-4330ce122822?auto=format&fit=crop&q=80&w=400&h=600',
    banner: 'https://images.unsplash.com/photo-1578632738981-4330ce122822?auto=format&fit=crop&q=80&w=1200&h=600',
    episode: 'EP 15',
    status: 'ONGOING',
    year: 2024,
    rating: 9.1,
    genre: ['ADVENTURE', 'FANTASY'],
    synopsis: 'The search for the lost echo begins in the valley of silence.',
    likes: '45K'
  }
];

export const EPISODES: Episode[] = [
  {
    id: 1,
    title: 'Awakening Shadows',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=640&h=360',
    duration: '24 min',
    date: 'April 2024',
    description: 'The protagonist discovers a hidden realm beneath the city.'
  },
  {
    id: 2,
    title: 'Unseen Threat',
    thumbnail: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=640&h=360',
    duration: '23 min',
    date: 'April 2024',
    description: 'A mysterious figure warns of an impending doom.'
  },
  {
    id: 3,
    title: 'First Encounter',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=640&h=360',
    duration: '25 min',
    date: 'May 2024'
  },
  {
    id: 4,
    title: 'The Hidden Lab',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=640&h=360',
    duration: '22 min',
    date: 'May 2024'
  },
  {
    id: 5,
    title: 'Final Stand Pt. 1',
    thumbnail: 'https://images.unsplash.com/photo-1533972751724-9135a8410a4c?auto=format&fit=crop&q=80&w=640&h=360',
    duration: '24 min',
    date: 'June 2024'
  }
];
