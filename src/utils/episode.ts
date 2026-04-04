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
