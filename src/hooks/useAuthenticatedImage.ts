import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useAuthenticatedImage(imageUrl: string | null | undefined) {
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!imageUrl) {
      setAuthenticatedUrl('');
      return;
    }

    const fetchAuthenticatedImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/images/uploads?path=${imageUrl}`, {
          headers: session?.user?.token ? {
            'Authorization': `Bearer ${session?.user?.token}`
          } : {}
        });

        if (!response.ok) {
          throw new Error('Failed to fetch authenticated image');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAuthenticatedUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setAuthenticatedUrl('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthenticatedImage();
  }, [imageUrl, session?.user?.token]);

  return { authenticatedUrl, isLoading, error };
} 