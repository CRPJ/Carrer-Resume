"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

// Profile 데이터 타입
interface ProfileData {
  data: any;
  practicalCounts: { competency: number; experience: number; info: number; career: number } | null;
  reliabilityRate: number | null;
  completionRate: number | null;
  badges: { stars: number; lightnings: number; shields: number } | null;
  seasonHistories: any[] | null;
  growthInfo: any | null;
  gradeStats: any | null;
  growthPeriodStats: any | null;
  activityWeekIds: string[];
  restWeekIds: string[];
  approvedActivities: any[];
  activityRecords: any[];
  activityDetails: any[];
  activityPoints: any[];
  userRoleHistory: any[];
  teams: any[];
  parts: any[];
  userTeamParts: any[];
  onboardingWeekId: string | null;
}

interface ProfileContextType {
  profileData: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId?: string) => Promise<ProfileData | null>;
  clearCache: () => void;
  lastFetchedUserId: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);

  // 캐시 유효 시간 (5분)
  const CACHE_TTL = 5 * 60 * 1000;

  const fetchProfile = useCallback(async (userId?: string): Promise<ProfileData | null> => {
    const targetUserId = userId || null;
    const now = Date.now();

    // 캐시된 데이터가 있고, 같은 userId이고, 캐시가 유효하면 재사용
    if (
      profileData &&
      lastFetchedUserId === targetUserId &&
      now - cacheTimestamp < CACHE_TTL
    ) {
      return profileData;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = targetUserId ? `/api/profile?userId=${targetUserId}` : '/api/profile';
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to fetch profile');
        setIsLoading(false);
        return null;
      }

      const newProfileData: ProfileData = {
        data: result.data,
        practicalCounts: result.practicalCounts || null,
        reliabilityRate: result.reliabilityRate ?? null,
        completionRate: result.completionRate ?? null,
        badges: result.badges || null,
        seasonHistories: result.seasonHistories || null,
        growthInfo: result.growthInfo || null,
        gradeStats: result.gradeStats || null,
        growthPeriodStats: result.growthPeriodStats || null,
        activityWeekIds: result.activityWeekIds || [],
        restWeekIds: result.restWeekIds || [],
        approvedActivities: result.approvedActivities || [],
        activityRecords: result.activityRecords || [],
        activityDetails: result.activityDetails || [],
        activityPoints: result.activityPoints || [],
        userRoleHistory: result.userRoleHistory || [],
        teams: result.teams || [],
        parts: result.parts || [],
        userTeamParts: result.userTeamParts || [],
        onboardingWeekId: result.onboardingWeekId || null,
      };

      setProfileData(newProfileData);
      setLastFetchedUserId(targetUserId);
      setCacheTimestamp(now);
      setIsLoading(false);

      return newProfileData;
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to fetch profile');
      setIsLoading(false);
      return null;
    }
  }, [profileData, lastFetchedUserId, cacheTimestamp]);

  const clearCache = useCallback(() => {
    setProfileData(null);
    setLastFetchedUserId(null);
    setCacheTimestamp(0);
  }, []);

  // 세션 변경 시 캐시 초기화
  useEffect(() => {
    if (session?.user?.id !== lastFetchedUserId) {
      clearCache();
    }
  }, [session?.user?.id]);

  return (
    <ProfileContext.Provider value={{
      profileData,
      isLoading,
      error,
      fetchProfile,
      clearCache,
      lastFetchedUserId,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
