import toast from 'react-hot-toast';

interface Props {
  suggestions: string[];
}

export default function ResumeSuggestions({ suggestions }: Props) {
  if (!suggestions || suggestions.length === 0) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
        </svg>
        Resume Suggestions
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl group dark:bg-amber-900/20 dark:border-amber-800/30"
          >
            <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{suggestion}</p>
            <button
              onClick={() => copyToClipboard(suggestion)}
              className="flex-shrink-0 text-xs text-teal-600 dark:text-teal-400 font-medium px-2 py-1 rounded-lg hover:bg-teal-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
