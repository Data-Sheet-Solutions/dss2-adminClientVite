import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useGet } from '../hooks/useGet';
import keycloak from '../keycloak';
import Cookies from 'js-cookie';

const UserContext = createContext();

// Cookie configuration
const COOKIE_NAME = 'userId';
const COOKIE_OPTIONS = {
  expires: 1 / 24, // 1 hour
  secure: true,
  sameSite: 'strict',
};

/**
 * Custom hook for accessing user permissions and information.
 * @returns {Object} An object containing user permissions and information
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * Provider component that makes user permissions and information available to its children.
 */
export const UserProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(new Set());
  const [userInfo, setUserInfo] = useState({
    email: '',
    _id: '',
    locations: [],
    firstName: '',
    lastName: '',
    groups: [],
    status: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const permissionsRequest = useGet();

  const fetchPermissions = useCallback(async () => {
    try {
      console.log('Fetching user permissions and info...');
      const response = await permissionsRequest.getData('/users/permissions');
      console.log('API Response:', response);

      if (response) {
        // Set permissions
        const userPermissions = response.permissions || [];
        console.log('Setting permissions:', userPermissions);
        setPermissions(new Set(userPermissions));

        // Set additional user info
        const userInfoData = {
          email: response.email || '',
          _id: response.userId || '',
          locations: response.locations || [],
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          groups: response.groups || [],
          status: response.status || '',
        };
        console.log('Setting user info:', userInfoData);
        setUserInfo(userInfoData);

        // Set user ID cookie if we have one
        if (response.userId) {
          console.log('Setting user ID cookie to', response.userId);
          Cookies.set(COOKIE_NAME, response.userId, COOKIE_OPTIONS);
        }
      } else {
        console.error('Frontend - Missing response data:', response);
      }
    } catch (error) {
      console.error('Frontend - Failed to fetch user permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to force a permissions refresh
  const refreshPermissions = useCallback(async () => {
    setIsLoading(true);
    console.log('Manually refreshing permissions');
    await fetchPermissions();
  }, [fetchPermissions]);

  // Fetch permissions on initial load and token refresh
  useEffect(() => {
    if (keycloak.authenticated) {
      console.log('User is authenticated, fetching permissions...');
      fetchPermissions();

      // Set up token refresh listener
      const refreshListener = () => {
        console.log('Token refreshed, updating permissions');
        fetchPermissions();
      };

      keycloak.onTokenExpired = refreshListener;

      return () => {
        keycloak.onTokenExpired = null;
      };
    } else {
      console.log('User is not authenticated, clearing permissions and cookie...');
      setIsLoading(false);
      setPermissions(new Set());
      setUserInfo({
        email: '',
        _id: '',
        locations: [],
        firstName: '',
        lastName: '',
        groups: [],
        status: '',
      });
      Cookies.remove(COOKIE_NAME);
    }
  }, [keycloak.authenticated, fetchPermissions]);

  const hasPermission = useCallback((permission) => permissions.has(permission), [permissions]);
  const hasAnyPermission = useCallback((permissionArray) => permissionArray.some((permission) => permissions.has(permission)), [permissions]);

  // Memoize the context value
  const value = useMemo(
    () => ({
      hasPermission,
      hasAnyPermission,
      permissions: Array.from(permissions),
      ...userInfo,
      refreshPermissions,
      isLoading,
    }),
    [hasPermission, hasAnyPermission, permissions, userInfo, refreshPermissions, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
