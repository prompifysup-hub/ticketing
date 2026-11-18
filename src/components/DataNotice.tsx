import { AlertTriangle } from 'lucide-react';

/** Shown when the data store cannot be reached (for example when the app runs outside Prompify). */
export function DataNotice({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center space-x-2 bg-yellow-500/10 text-yellow-400 rounded-lg px-4 py-3 text-sm">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{error}</span>
    </div>
  );
}
