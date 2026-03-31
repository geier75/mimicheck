import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/api/entities';

// ZEPTO STEP 2.3: Role-Based Access Control Foundation (GREEN PHASE - Implementation)
const RBACContext = createContext();

// ZEPTO STEP 2.4: Define Permission System
const PERMISSIONS = {
    // Data Access Permissions
    READ_PERSONAL_DATA: 'read_personal_data',
    WRITE_PERSONAL_DATA: 'write_personal_data',
    DELETE_PERSONAL_DATA: 'delete_personal_data',
    
    // Application Permissions  
    SUBMIT_APPLICATION: 'submit_application',
    VIEW_APPLICATION_STATUS: 'view_application_status',
    DOWNLOAD_DOCUMENTS: 'download_documents',
    
    // KI Agent Permissions
    USE_AI_ASSISTANT: 'use_ai_assistant',
    UNLIMITED_AI_QUERIES: 'unlimited_ai_queries',
    AI_AUTO_FILL: 'ai_auto_fill',
    
    // Admin Permissions
    VIEW_ALL_USERS: 'view_all_users',
    MANAGE_SYSTEM: 'manage_system',
    VIEW_ANALYTICS: 'view_analytics',
    
    // Premium Features
    PRIORITY_SUPPORT: 'priority_support',
    ADVANCED_ANALYTICS: 'advanced_analytics',
    BULK_OPERATIONS: 'bulk_operations'
};

// ZEPTO STEP 2.5: Define Role Hierarchy
const ROLES = {
    free: {
        name: 'Free User',
        permissions: [
            PERMISSIONS.READ_PERSONAL_DATA,
            PERMISSIONS.WRITE_PERSONAL_DATA,
            PERMISSIONS.SUBMIT_APPLICATION,
            PERMISSIONS.VIEW_APPLICATION_STATUS,
            PERMISSIONS.USE_AI_ASSISTANT, // Limited queries
            PERMISSIONS.DOWNLOAD_DOCUMENTS
        ],
        limits: {
            aiQueriesPerDay: 5,
            applicationsPerMonth: 3,
            storageLimit: '10MB'
        }
    },
    premium: {
        name: 'Premium User',
        permissions: [
            PERMISSIONS.READ_PERSONAL_DATA,
            PERMISSIONS.WRITE_PERSONAL_DATA,
            PERMISSIONS.DELETE_PERSONAL_DATA,
            PERMISSIONS.SUBMIT_APPLICATION,
            PERMISSIONS.VIEW_APPLICATION_STATUS,
            PERMISSIONS.USE_AI_ASSISTANT,
            PERMISSIONS.UNLIMITED_AI_QUERIES,
            PERMISSIONS.AI_AUTO_FILL,
            PERMISSIONS.DOWNLOAD_DOCUMENTS,
            PERMISSIONS.PRIORITY_SUPPORT
        ],
        limits: {
            aiQueriesPerDay: -1, // Unlimited
            applicationsPerMonth: -1, // Unlimited
            storageLimit: '100MB'
        }
    },
    pro: {
        name: 'Pro User',
        permissions: [
            ...Object.values(PERMISSIONS).filter(p => !p.includes('MANAGE_SYSTEM') && !p.includes('VIEW_ALL_USERS')),
        ],
        limits: {
            aiQueriesPerDay: -1,
            applicationsPerMonth: -1,
            storageLimit: '1GB'
        }
    },
    admin: {
        name: 'Administrator', 
        permissions: Object.values(PERMISSIONS),
        limits: {
            aiQueriesPerDay: -1,
            applicationsPerMonth: -1,
            storageLimit: 'unlimited'
        }
    }
};

// ZEPTO STEP 2.6: RBAC Hook
export const useRBAC = () => {
    const context = useContext(RBACContext);
    if (!context) {
        throw new Error('useRBAC must be used within RBACProvider');
    }
    return context;
};

// ZEPTO STEP 2.7: Permission Checker Component
export const PermissionGate = ({ permission, children, fallback = null }) => {
    const { hasPermission } = useRBAC();
    
    if (hasPermission(permission)) {
        return children;
    }
    
    return fallback;
};

// ZEPTO STEP 2.8: RBAC Provider Component  
export const RBACProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('free');
    const [permissions, setPermissions] = useState([]);
    const [limits, setLimits] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            const role = currentUser.subscription_tier || 'free';
            setUserRole(role);
            
            if (ROLES[role]) {
                setPermissions(ROLES[role].permissions);
                setLimits(ROLES[role].limits);
            } else {
                // Fallback to free tier
                setPermissions(ROLES.free.permissions);
                setLimits(ROLES.free.limits);
            }
            
            // Track RBAC initialization
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'rbac_initialized',
                    'RBACProvider',
                    { role, permissionCount: ROLES[role]?.permissions?.length || 0 }
                );
            }
        } catch (error) {
            console.warn('Failed to load user data for RBAC:', error);
            // Default to free tier for unauthenticated users
            setPermissions(ROLES.free.permissions);
            setLimits(ROLES.free.limits);
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { source: 'rbac_initialization' },
                    'medium'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionList) => {
        return permissionList.some(permission => permissions.includes(permission));
    };

    const hasAllPermissions = (permissionList) => {
        return permissionList.every(permission => permissions.includes(permission));
    };

    const getLimit = (limitType) => {
        return limits[limitType] || 0;
    };

    const checkLimit = (limitType, currentUsage) => {
        const limit = limits[limitType];
        if (limit === -1) return true; // Unlimited
        return currentUsage < limit;
    };

    const contextValue = {
        user,
        userRole,
        permissions,
        limits,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getLimit,
        checkLimit,
        PERMISSIONS,
        ROLES
    };

    return (
        <RBACContext.Provider value={contextValue}>
            {children}
        </RBACContext.Provider>
    );
};

export default { RBACProvider, useRBAC, PermissionGate, PERMISSIONS, ROLES };