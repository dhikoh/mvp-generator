'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan!</h2>
        <p className="text-sm">Maaf, sistem admin mengalami kendala teknis.</p>
      </div>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[var(--accent)] text-white rounded-xl neu-flat hover:opacity-90 transition font-semibold"
      >
        Coba Lagi
      </button>
    </div>
  );
}
