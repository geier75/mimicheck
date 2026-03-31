import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';
import supabaseEntities from '@/api/supabaseEntities';

const UserProfileContext = createContext({
    user: null,
    isLoading: true,
    refreshUser: async () => { },
    updateUserProfile: async (data) => { },
    profileVersion: 0
});

export function UserProfileProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileVersion, setProfileVersion] = useState(0);

    const loadUser = useCallback(async () => {
        try {
            setIsLoading(true);

            // Get current user profile from Supabase
            const userProfile = await supabaseEntities.UserProfile.getCurrent();

            if (userProfile) {
                setUser(userProfile);
                setProfileVersion(prev => prev + 1);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();

        // Listen to auth state changes
        let subscription = null;
        try {
            const result = supabase.auth.onAuthStateChange(async (event) => {
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    await loadUser();
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            });
            subscription = result?.data?.subscription;
        } catch (error) {
            console.warn('Auth state change listener not available:', error);
        }

        return () => subscription?.unsubscribe();
    }, [loadUser]);

    const refreshUser = useCallback(async () => {
        await loadUser();
    }, [loadUser]);

    const updateUserProfile = useCallback(async (data) => {
        try {
            const updated = await supabaseEntities.UserProfile.update(data);
            setUser(updated);
            setProfileVersion(prev => prev + 1);
            return { success: true, user: updated };
        } catch (error) {
            console.error('Failed to update user profile:', error);
            return { success: false, error };
        }
    }, []);

    const contextValue = {
        user,
        isLoading,
        refreshUser,
        updateUserProfile,
        profileVersion
    };

    return (
        <UserProfileContext.Provider value={contextValue}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within UserProfileProvider');
    }
    return context;
}

export function useProfileUpdateListener(callback, dependencies = []) {
    // Simplified - no event emitter for now
    useEffect(() => {
        // Empty for now to avoid errors
    }, dependencies);
}