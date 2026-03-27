# KuzenAnime V2

Platform agregator anime streaming dengan antarmuka modern bergaya premium dark-theme. Dibangun menggunakan React + Hono dengan arsitektur fullstack monorepo.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 6 (dev server & bundler)
- Tailwind CSS 4
- React Router DOM 7
- HLS.js (video streaming)
- Font Awesome 7
- react-helmet-async (SEO)

**Backend**
- Hono (lightweight web framework)
- Cheerio (HTML scraping)
- Axios (HTTP client)

**Deployment**
- Docker + Docker Compose
- Nginx (reverse proxy & static serving)

## Fitur

- Streaming anime dengan custom video player (HLS, MP4, iframe fallback)
- Pilihan kualitas video dengan persistence di localStorage
- Auto-next episode dengan countdown timer
- Keyboard shortcuts (Space/K play/pause, F fullscreen, M mute, arrow keys skip/volume)
- Pencarian global (Ctrl+K / Cmd+K)
- Browsing berdasarkan genre, season, jadwal tayang
- Kategori: Ongoing, Movie, Donghua, Tokusatsu, Batch
- Daftar A-Z seluruh anime
- Sistem favorit (localStorage, tanpa login)
- Long-press preview pada anime card
- Haptic feedback (Vibration API)
- PWA support (offline-capable, installable)
- SEO dinamis per halaman
- Responsive design (mobile bottom nav, desktop top nav)

## Menjalankan Project

### Development

```bash
npm install
npm run dev
```

Menjalankan Vite dev server (port 3000) dan Hono backend (port 3051) secara bersamaan.

### Production Build

```bash
npm run build
npm run preview
```

### Docker

```bash
docker compose up --build
```

- Frontend: Nginx pada port 8083
- Backend: Node.js pada port 3051

## Struktur Project

```
├── server/
│   ├── index.ts          # Hono API server
│   └── scraper.ts        # Web scraper (Cheerio)
├── src/
│   ├── pages/            # Halaman (Home, Watch, Detail, dll)
│   ├── components/       # UI components (VideoPlayer, SearchModal, dll)
│   ├── hooks/            # Custom hooks (useFavorites, useAuth)
│   ├── utils/            # Helper functions
│   ├── App.tsx           # Routes & layout
│   ├── types.ts          # TypeScript interfaces
│   └── index.css         # Tailwind + custom styles
├── public/
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker
├── docker-compose.yml
├── Dockerfile            # Frontend container
├── Dockerfile.server     # Backend container
└── nginx.conf
```

## API Endpoints

| Endpoint | Deskripsi |
|---|---|
| `/api/animeplay/home` | Data halaman utama |
| `/api/animeplay/trending` | Anime populer |
| `/api/animeplay/ongoing` | Anime ongoing (paginated) |
| `/api/animeplay/movies` | Film anime (paginated) |
| `/api/animeplay/donghua` | Donghua (paginated) |
| `/api/animeplay/tokusatsu` | Tokusatsu (paginated) |
| `/api/animeplay/schedule` | Jadwal tayang mingguan |
| `/api/animeplay/search?q=` | Pencarian anime |
| `/api/animeplay/detail/:slug` | Detail anime + daftar episode |
| `/api/animeplay/watch/:slug` | URL streaming episode |
| `/api/animeplay/listanime` | Daftar A-Z semua anime |
| `/api/animeplay/listgenre` | Daftar semua genre |
| `/api/animeplay/listseason` | Daftar semua season |
| `/api/animeplay/genre/:id` | Anime berdasarkan genre |
| `/api/animeplay/season/:id` | Anime berdasarkan season |

## Disclaimer

KuzenAnime adalah platform agregator konten yang melakukan crawling data secara otomatis. Kami **tidak** menyimpan, menghosting, atau mengunggah file video apa pun ke server kami.
