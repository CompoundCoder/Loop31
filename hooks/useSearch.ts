import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface UseSearchProps<T> {
  items: T[];
  searchableFields: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T>({ 
  items, 
  searchableFields, 
  debounceMs = 250 
}: UseSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredItems(items);
        return;
      }

      const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
      
      const filtered = items.filter(item => {
        return searchTerms.every(term => {
          return searchableFields.some(field => {
            const value = item[field];
            if (typeof value === 'string') {
              return value.toLowerCase().includes(term);
            }
            return false;
          });
        });
      });

      setFilteredItems(filtered);
    },
    [items, searchableFields]
  );

  const debouncedSearch = useCallback(
    debounce(performSearch, debounceMs),
    [performSearch, debounceMs]
  );

  useEffect(() => {
    if (!isSearching) {
      setFilteredItems(items);
    }
  }, [items, isSearching]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(!!query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  return {
    searchQuery,
    isSearching,
    filteredItems,
    handleSearch,
    setIsSearching
  };
} 