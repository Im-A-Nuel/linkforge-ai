import { useState, useEffect } from 'react';
import { useUserProfile } from './useContract';

interface CachedProfileData {
  riskLevel: number;
  esgPriority: boolean;
  automationEnabled: boolean;
  lastRebalance: bigint;
  cachedAt: number;
}

const CACHE_KEY_PREFIX = 'linkforge_profile_';
const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * Hook with localStorage caching to reduce blockchain queries
 */
export function useCachedProfile(address?: `0x${string}`) {
  const [cachedData, setCachedData] = useState<CachedProfileData | null>(null);
  const { data: contractData, refetch, isLoading } = useUserProfile(address);

  // Load from cache on mount
  useEffect(() => {
    if (!address) return;

    const cacheKey = `${CACHE_KEY_PREFIX}${address}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.cachedAt;

        // Use cache if less than CACHE_DURATION old
        if (age < CACHE_DURATION) {
          setCachedData({
            ...parsed,
            lastRebalance: BigInt(parsed.lastRebalance),
          });
        } else {
          // Cache expired, remove it
          localStorage.removeItem(cacheKey);
        }
      } catch (err) {
        console.warn('Failed to parse cached profile:', err);
        localStorage.removeItem(cacheKey);
      }
    }
  }, [address]);

  // Update cache when contract data changes
  useEffect(() => {
    if (!address || !contractData) return;

    const profileData: CachedProfileData = {
      riskLevel: Number(contractData.riskLevel),
      esgPriority: Boolean(contractData.esgPriority),
      automationEnabled: Boolean(contractData.automationEnabled),
      lastRebalance: contractData.lastRebalance,
      cachedAt: Date.now(),
    };

    console.log('📊 Profile from contract:', {
      address: address.slice(0, 10),
      riskLevel: profileData.riskLevel,
      esgPriority: profileData.esgPriority,
      automationEnabled: profileData.automationEnabled,
    });

    setCachedData(profileData);

    // Save to localStorage
    const cacheKey = `${CACHE_KEY_PREFIX}${address}`;
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          ...profileData,
          lastRebalance: profileData.lastRebalance.toString(),
        })
      );
    } catch (err) {
      console.warn('Failed to cache profile:', err);
    }
  }, [address, contractData]);

  // Clear cache for specific address
  const clearCache = () => {
    if (!address) return;
    const cacheKey = `${CACHE_KEY_PREFIX}${address}`;
    localStorage.removeItem(cacheKey);
    setCachedData(null);
  };

  // Force refresh from blockchain
  const forceRefresh = async () => {
    clearCache();
    await refetch();
  };

  return {
    profile: cachedData,
    isLoading: isLoading && !cachedData, // Don't show loading if we have cache
    refetch,
    forceRefresh,
    clearCache,
    isCached: !!cachedData && !contractData,
  };
}
