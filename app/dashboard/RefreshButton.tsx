'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefreshButton({
  label = 'Refresh Matches',
  primary = false,
}: {
  label?: string;
  primary?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/match/generate', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to generate matches');
        return;
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const base =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md disabled:opacity-60';
  const style = primary
    ? 'bg-gray-900 text-white hover:bg-black'
    : 'border border-gray-300 text-gray-900 hover:bg-gray-50';

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${base} ${style}`}
      >
        {loading && (
          <span
            className={`inline-block h-4 w-4 border-2 rounded-full animate-spin ${
              primary
                ? 'border-white/30 border-t-white'
                : 'border-gray-300 border-t-gray-900'
            }`}
          />
        )}
        {loading ? 'Finding matches...' : label}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
