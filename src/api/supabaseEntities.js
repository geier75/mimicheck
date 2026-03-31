/**
 * Supabase Entities - API Client für MimiCheck Backend
 * 
 * Features:
 * - Type-safe CRUD Operations
 * - Automatic user_id injection
 * - Error handling
 * - RLS-compliant
 * 
 * @author Cascade AI
 * @date 2025-11-14
 */

import { supabase } from './supabaseClient';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current user's profile ID (creates profile if not exists)
 */
async function getCurrentUserProfileId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try to find existing profile
  const { data: profile, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  // If profile exists, return it
  if (profile) return profile.id;

  // Profile not found - create one automatically
  console.log('Creating new user profile for:', user.email);
  const { data: newProfile, error: insertError } = await supabase
    .from('users')
    .insert({
      auth_id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      created_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Failed to create user profile:', insertError);
    throw new Error('Could not create user profile');
  }

  return newProfile.id;
}

/**
 * Handle Supabase errors
 */
function handleError(error, operation) {
  console.error(`${operation} failed:`, error);
  throw new Error(error.message || `${operation} failed`);
}

// ============================================
// USER PROFILES
// ============================================

export const UserProfile = {
  /**
   * Get current user's profile
   */
  // Cache for user profile
  _profileCache: null,
  _profileCacheTime: 0,
  _CACHE_TTL: 60000, // 1 minute

  /**
   * Get current user's profile (with caching)
   */
  async getCurrent(forceRefresh = false) {
    try {
      // Check cache
      const now = Date.now();
      if (!forceRefresh && this._profileCache && (now - this._profileCacheTime < this._CACHE_TTL)) {
        return this._profileCache;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (error) throw error;

      // Update cache
      this._profileCache = data;
      this._profileCacheTime = now;

      return data;
    } catch (error) {
      handleError(error, 'Get user profile');
    }
  },

  /**
   * Alias for getCurrent (legacy support)
   */
  async me() {
    return this.getCurrent();
  },

  /**
   * Alias for update (legacy support)
   */
  async updateProfile(updates) {
    return this.update(updates);
  },

  /**
   * Alias for update (legacy support)
   */
  async updateMyUserData(updates) {
    return this.update(updates);
  },

  /**
   * Update current user's profile
   */
  async update(updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this._profileCache = data;
      this._profileCacheTime = Date.now();

      return data;
    } catch (error) {
      handleError(error, 'Update user profile');
    }
  }
};

// ============================================
// ABRECHNUNGEN
// ============================================

export const Abrechnung = {
  /**
   * List all abrechnungen for current user
   */
  async list(options = {}) {
    try {
      const userId = await getCurrentUserProfileId();

      let query = supabase
        .from('abrechnungen')
        .select('*')
        .eq('user_id', userId);

      // Sorting
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? false });
      } else {
        query = query.order('created_date', { ascending: false });
      }

      // Limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'List abrechnungen');
    }
  },

  /**
   * Get single abrechnung by ID
   */
  async get(id) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('abrechnungen')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Get abrechnung');
    }
  },

  /**
   * Create new abrechnung
   */
  async create(abrechnungData) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('abrechnungen')
        .insert({
          ...abrechnungData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create abrechnung');
    }
  },

  /**
   * Update abrechnung
   */
  async update(id, updates) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('abrechnungen')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Update abrechnung');
    }
  },

  /**
   * Delete abrechnung
   */
  async delete(id) {
    try {
      const userId = await getCurrentUserProfileId();

      const { error } = await supabase
        .from('abrechnungen')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      handleError(error, 'Delete abrechnung');
    }
  }
};

// ============================================
// FÖRDERLEISTUNGEN
// ============================================

export const Foerderleistung = {
  /**
   * List all förderleistungen (including global ones)
   */
  async list(options = {}) {
    try {
      const userId = await getCurrentUserProfileId();

      let query = supabase
        .from('foerderleistungen')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`);

      // Filter by type
      if (options.typ) {
        query = query.eq('typ', options.typ);
      }

      // Filter by status
      if (options.status) {
        query = query.eq('status', options.status);
      }

      // Sorting
      query = query.order('created_date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'List förderleistungen');
    }
  },

  /**
   * Get single förderleistung
   */
  async get(id) {
    try {
      const { data, error } = await supabase
        .from('foerderleistungen')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Get förderleistung');
    }
  },

  /**
   * Create new förderleistung
   */
  async create(foerderleistungData) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('foerderleistungen')
        .insert({
          ...foerderleistungData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create förderleistung');
    }
  },

  /**
   * Update förderleistung
   */
  async update(id, updates) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('foerderleistungen')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Update förderleistung');
    }
  }
};

// ============================================
// ANTRÄGE
// ============================================

export const Antrag = {
  /**
   * List all anträge for current user
   */
  async list(options = {}) {
    try {
      const userId = await getCurrentUserProfileId();

      let query = supabase
        .from('antraege')
        .select('*, foerderleistungen(*)')
        .eq('user_id', userId);

      // Filter by status
      if (options.status) {
        query = query.eq('status', options.status);
      }

      // Sorting
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'List anträge');
    }
  },

  /**
   * Get single antrag
   */
  async get(id) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('antraege')
        .select('*, foerderleistungen(*)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Get antrag');
    }
  },

  /**
   * Create new antrag
   */
  async create(antragData) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('antraege')
        .insert({
          ...antragData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Create antrag');
    }
  },

  /**
   * Update antrag
   */
  async update(id, updates) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('antraege')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Update antrag');
    }
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const Notification = {
  /**
   * List all notifications for current user
   */
  async list(options = {}) {
    try {
      const userId = await getCurrentUserProfileId();

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      // Filter unread
      if (options.unreadOnly) {
        query = query.eq('gelesen', false);
      }

      // Sorting
      query = query.order('created_at', { ascending: false });

      // Limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'List notifications');
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    try {
      const userId = await getCurrentUserProfileId();

      const { data, error } = await supabase
        .from('notifications')
        .update({
          gelesen: true,
          gelesen_am: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const userId = await getCurrentUserProfileId();

      const { error } = await supabase
        .from('notifications')
        .update({
          gelesen: true,
          gelesen_am: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('gelesen', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      handleError(error, 'Mark all notifications as read');
    }
  }
};

// ============================================
// STORAGE (File Uploads)
// ============================================

export const Storage = {
  /**
   * Upload file to storage
   */
  async uploadFile(bucket, file, path) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Construct path: user_id/filename
      const filePath = path || `${user.id}/${file.name}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        path: data.path,
        url: publicUrl,
        key: filePath
      };
    } catch (error) {
      handleError(error, 'Upload file');
    }
  },

  /**
   * Delete file from storage
   */
  async deleteFile(bucket, path) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      handleError(error, 'Delete file');
    }
  },

  /**
   * Get file URL
   */
  getFileUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
};

// ============================================
// AUTH (Wrapper)
// ============================================

export const Auth = {
  /**
   * Get current user
   */
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Sign in with email/password
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign up with email/password
   */
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Reset password
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  UserProfile,
  Abrechnung,
  Foerderleistung,
  Antrag,
  Notification,
  Storage,
  Auth
};
