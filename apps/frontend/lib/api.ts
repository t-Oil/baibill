/**
 * API utility for making authenticated requests with automatic header injection.
 * Automatically includes Authorization token and x-organization-id header.
 */

/**
 * Gets the current organization UID from cookie.
 * @returns Organization UID or null
 */
function getOrgIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )x-organization-id=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Custom fetch wrapper that automatically adds authentication and organization headers.
 * @param url Request URL
 * @param options Fetch options
 * @returns Fetch response
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const orgId = getOrgIdFromCookie();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add organization ID header if it exists
  if (orgId) {
    headers['x-organization-id'] = orgId;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * GET request with automatic header injection.
 * @param url Request URL
 * @param options Additional fetch options
 * @returns Fetch response
 */
export async function apiGet(url: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request with automatic header injection.
 * @param url Request URL
 * @param body Request body (will be JSON stringified if not FormData)
 * @param options Additional fetch options
 * @returns Fetch response
 */
export async function apiPost(
  url: string,
  body?: any,
  options: RequestInit = {},
): Promise<Response> {
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  return apiFetch(url, {
    ...options,
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
    headers,
  });
}

/**
 * PUT request with automatic header injection.
 * @param url Request URL
 * @param body Request body (will be JSON stringified)
 * @param options Additional fetch options
 * @returns Fetch response
 */
export async function apiPut(
  url: string,
  body?: any,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  return apiFetch(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
    headers,
  });
}

/**
 * DELETE request with automatic header injection.
 * @param url Request URL
 * @param options Additional fetch options
 * @returns Fetch response
 */
export async function apiDelete(url: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'DELETE',
  });
}
