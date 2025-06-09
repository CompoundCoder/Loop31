import { useState, useMemo } from 'react';
import type { Loop } from '@/context/LoopsContext'; // Assuming Loop type is defined here

interface UseLoopSearchProps {
  initialLoops: Loop[]; // The full list of loops to be filtered
}

interface UseLoopSearchResult {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredLoops: Loop[];
  hasMatches: boolean;
}

/**
 * Custom hook to manage the search query state.
 *
 * @returns An object containing:
 *  - `searchQuery`: The current search query string.
 *  - `setSearchQuery`: Function to update the search query.
 */
export const useLoopSearch = ({ initialLoops }: UseLoopSearchProps): UseLoopSearchResult => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLoops = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialLoops; // Return all loops if search query is empty
    }
    return initialLoops.filter(loop =>
      loop.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialLoops, searchQuery]);

  const hasMatches = useMemo(() => filteredLoops.length > 0, [filteredLoops]);

  return {
    searchQuery,
    setSearchQuery,
    filteredLoops,
    hasMatches,
  };
}; 