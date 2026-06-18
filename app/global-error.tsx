'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-100">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Krytyczny błąd systemu</h2>
          <p className="text-red-700 mb-6">{error.message}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-700 text-white rounded-lg font-bold"
          >
            Spróbuj załadować ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
