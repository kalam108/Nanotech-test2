import { useState, useEffect } from 'react';

export function usePathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : ''
  );

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return pathname;
}

export function useRouter() {
  return {
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        if (url === '/' || url === '/login' || url.startsWith('http')) {
          window.location.href = url;
        }
      }
    },
    replace: (url: string) => {
      if (typeof window !== 'undefined') {
        window.location.replace(url);
      }
    },
    back: () => {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    },
    refresh: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-state-change'));
        window.dispatchEvent(new CustomEvent('supabase-auth-refresh'));
      }
    },
  };
}

export function useSearchParams(): URLSearchParams {
  const [searchParams, setSearchParams] = useState(() =>
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  );

  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return searchParams;
}
