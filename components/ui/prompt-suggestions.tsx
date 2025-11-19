interface PromptSuggestionsProps {
  label: string;
  append: (message: { role: 'user'; content: string }) => void;
  suggestions: string[];
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="space-y-6 w-full max-w-full px-4">
      <h2 className="text-center text-2xl font-bold">{label}</h2>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm w-full max-w-full overflow-x-hidden">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => append({ role: 'user', content: suggestion })}
            className="h-max flex-1 rounded-xl border bg-background p-4 hover:bg-muted min-w-0 w-full sm:w-auto"
          >
            <p className="break-words">{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
