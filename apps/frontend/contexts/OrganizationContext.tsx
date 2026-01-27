'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';

/**
 * Cookie name for organization UID (accessible by Next.js server).
 */
export const ORG_COOKIE_NAME = 'x-organization-id';

/**
 * Organization interface representing a user's organization membership.
 */
interface Organization {
  id: number;
  uid: string;
  name: string;
  description?: string;
  role: {
    id: number;
    name: string;
  };
}

/**
 * Organization context type definition.
 */
interface OrganizationContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  isLoading: boolean;
  switchOrg: (org: Organization) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

/**
 * Sets a cookie with the given name and value.
 * @param name Name of the cookie
 * @param value Value to store in the cookie
 * @param days Number of days until expiration (default: 365)
 */
function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Gets a cookie value by name.
 * @param name Name of the cookie to retrieve
 * @returns Value of the cookie or null if not found
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * OrganizationProvider component that manages organization state.
 * @param children Child components
 */
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  /**
   * Loads the user's organizations from the API.
   * @returns Promise resolving when organizations are loaded
   */
  const loadOrganizations = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const response = await fetch('/api/organizations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const orgs = data.data || [];

        const mappedOrgs: Organization[] = orgs.map((item: any) => ({
          id: item.organization?.id || item.organizationId,
          uid: item.organization?.uid,
          name: item.organization?.name,
          description: item.organization?.description,
          role: {
            id: item.role?.id || item.roleId,
            name: item.role?.name,
          },
        }));

        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

        setOrganizations(mappedOrgs);

        // Restore selected org from cookie/localStorage or use first one
        const savedOrgUid = getCookie(ORG_COOKIE_NAME) || localStorage.getItem('currentOrgUid');
        const savedOrg = mappedOrgs.find((o) => o.uid === savedOrgUid);

        if (savedOrg) {
          setCurrentOrg(savedOrg);
          setCookie(ORG_COOKIE_NAME, savedOrg.uid);
        } else if (mappedOrgs.length > 0) {
          setCurrentOrg(mappedOrgs[0]);
          localStorage.setItem('currentOrgUid', mappedOrgs[0].uid);
          setCookie(ORG_COOKIE_NAME, mappedOrgs[0].uid);
        }
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load organizations on mount and listen for login events
  useEffect(() => {
    isMountedRef.current = true;

    // Try loading immediately
    loadOrganizations();

    // Listen for storage events (login from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (e.newValue) {
          // Token added - user logged in
          loadOrganizations();
        } else {
          // Token removed - user logged out
          if (isMountedRef.current) {
            setOrganizations([]);
            setCurrentOrg(null);
            setIsLoading(false);
          }
        }
      }
    };

    // Listen for custom login event (same tab)
    const handleLogin = () => {
      loadOrganizations();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login', handleLogin);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', handleLogin);
    };
  }, [loadOrganizations]);

  /**
   * Switches the current active organization.
   * @param org Organization to switch to
   */
  const switchOrg = (org: Organization) => {
    setCurrentOrg(org);
    localStorage.setItem('currentOrgUid', org.uid);
    setCookie(ORG_COOKIE_NAME, org.uid);
  };

  /**
   * Refreshes the list of organizations from the server.
   * @returns Promise resolving when organizations are refreshed
   */
  const refreshOrganizations = async () => {
    setIsLoading(true);
    await loadOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        isLoading,
        switchOrg,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Hook to access organization context.
 * @returns Organization context value
 * @throws Error if used outside OrganizationProvider
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
