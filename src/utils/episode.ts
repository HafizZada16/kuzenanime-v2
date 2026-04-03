import { DetailedEpisode } from '../types';

/**
 * Extracts a numeric value from an episode string.
 * Handles cases like "1", "1.5", "Episode 1", etc.
 */
export const parseEpisodeNumber = (epStr: string): number => {
  if (!epStr) return 0;
  
  // Try to find the first sequence of numbers (including decimals)
  const match = epStr.match(/(\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[0]);
  }
  
  return 0;
};

/**
 * Sorts episodes by their number.
 */
export const sortEpisodes = (episodes: DetailedEpisode[], order: 'newest' | 'oldest' = 'oldest'): DetailedEpisode[] => {
  return [...episodes].sort((a, b) => {
    const numA = parseEpisodeNumber(a.episode);
    const numB = parseEpisodeNumber(b.episode);
    
    if (numA === numB) {
      // Fallback to title comparison if numbers are same (or both 0)
      return a.title.localeCompare(b.title);
    }
    
    return order === 'newest' ? numB - numA : numA - numB;
  });
};

/**
 * Formats an episode title by removing the anime title prefix and ensuring a meaningful result.
 */
export const formatEpisodeTitle = (epTitle: string, animeTitle: string, epNumber: string): string => {
  if (!epTitle) return `Episode ${epNumber}`;
  
  // Remove the anime title from the episode title
  let clean = epTitle.replace(animeTitle, '').trim();
  
  // Remove common starting separators like "-", ":", etc.
  clean = clean.replace(/^[-\s:|]+/, '').trim();
  
  // If the result is just a number or empty, fallback to "Episode [number]"
  // This prevents cases where the residual title is just "1", "2", etc.
  if (!clean || /^\d+$/.test(clean)) {
    return `Episode ${epNumber}`;
  }
  
  return clean;
};
