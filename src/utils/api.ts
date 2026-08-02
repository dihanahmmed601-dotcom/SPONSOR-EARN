/**
 * Safe fetch utility that prevents "Unexpected token '<', <!doctype..." JSON parse errors
 * and gracefully handles network errors ("Failed to fetch").
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return {
        ok: res.ok,
        status: res.status,
        data,
        error: !res.ok ? (data?.error || data?.message || `Request failed with status ${res.status}`) : undefined
      };
    } else {
      // Non-JSON response (e.g., HTML error page, 502/504 Bad Gateway, etc.)
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        status: res.status,
        data: null,
        error: res.ok
          ? 'Unexpected non-JSON response from server.'
          : `Server error (${res.status}). Please try again.`
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || 'Network connection issue. Please check your internet connection.'
    };
  }
}
