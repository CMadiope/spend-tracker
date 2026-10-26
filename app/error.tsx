"use client";

export default function Error({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted">This page could not be loaded.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="bg-accent px-4 py-2 font-medium text-accent-text"
      >
        Try again
      </button>
    </div>
  );
}
