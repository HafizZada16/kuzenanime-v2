import { ANIMEPLAY_API_BASE_URL } from '../constants';
import { Anime } from '../types';

export const getAuthHeaders = () => {
  const saved = localStorage.getItem('animeplay_auth');
  if (!saved) return {};
  
  try {
    const auth = JSON.parse(saved);
    return {
      'Authorization': `Bearer ${auth.auth_token}`,
      'x-token-ajaib': auth.token_ajaib,
      'x-fid': auth.fid
    };
  } catch (e) {
    return {};
  }
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  let response = await fetch(url, {
    ...options,
    headers
  });

  // Automatic refresh on 401
  if (response.status === 401) {
    const saved = localStorage.getItem('animeplay_auth');
    if (saved) {
      const auth = JSON.parse(saved);
      try {
        const refreshRes = await fetch(`${ANIMEPLAY_API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: auth.refresh_token, fid: auth.fid })
        });
        
        const refreshJson = await refreshRes.json();
        if (refreshJson.status === 'success' && refreshJson.data) {
          localStorage.setItem('animeplay_auth', JSON.stringify(refreshJson.data));
          
          // Retry original request with new tokens
          const newHeaders = {
            ...getAuthHeaders(),
            ...(options.headers || {})
          };
          response = await fetch(url, {
            ...options,
            headers: newHeaders
          });
        }
      } catch (e) {
        console.error('Auto-refresh failed', e);
      }
    }
  }

  return response;
};

/**
 * Standardized mapping for Anime objects from various API responses
 */
export const mapAnimeData = (item: any): Anime => {
  // Use the slug/id provided by the API.
  const id = item.seriesSlug || item.anime_id || item.anime_slug || item.series_slug || item.slug || item.id || '';
  const episode = item.latest_episode || item.episode || item.episode_title || item.ep || '';
  
  const isMovie = item.type?.toLowerCase().includes('movie') || 
                  (item.title || item.anime_title)?.toLowerCase().includes('movie') ||
                  (item.type?.toLowerCase() === 'series' && !episode);
  
  // Parse rating string like "Rating 7.50"
  let rating = 0;
  if (typeof item.rating === 'string') {
    const match = item.rating.match(/(\d+(\.\d+)?)/);
    if (match) rating = parseFloat(match[0]);
  } else if (typeof item.rating === 'number') {
    rating = item.rating;
  }

  const thumb = item.thumb || item.image_url || item.thumbnail || item.poster || '';
  
  return {
    id: id,
    title: item.anime_title || item.title || 'Untitled',
    thumbnail: thumb,
    banner: item.banner || thumb,
    episode: episode ? (episode.toString().startsWith('EP') ? episode.toString() : `EP ${episode}`) : (isMovie ? 'MOVIE' : '??'),
    status: (item.status?.toUpperCase() === 'COMPLETED' || item.status?.toUpperCase() === 'TAMAT') ? 'COMPLETED' : 'ONGOING',
    year: item.year || (item.release_date ? new Date(item.release_date).getFullYear() : new Date().getFullYear()),
    rating: rating,
    genre: item.genre || (item.genres?.map((g: any) => g.name || g.genre?.name)) || ['Anime'],
    synopsis: item.synopsis || `Watch ${item.anime_title || item.title} on KuzenAnime V2.`,
    likes: item.likes || '0',
    type: item.type
  };
};

/**
 * Standardizes API responses that may use different keys for lists
 */
export const normalizeApiResponse = (data: any) => {
  if (!data) return data;
  
  return {
    ...data,
    episodeList: data.episodeList || data.episodes || data.episode_list || [],
    serverList: data.serverList || data.streams || data.server_list || [],
    downloadList: data.downloadList || data.downloads || data.download_list || [],
    recommendationList: data.recommendationList || data.recommendations || data.recommended || data.recommended_anime || []
  };
};
