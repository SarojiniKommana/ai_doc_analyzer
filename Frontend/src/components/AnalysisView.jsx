const STAGES = [
  {
    key: 'problem',
    label: 'Problem',
    mark: '§1',
    color: '#3B4A8C',
    bg: '#EEF0F9',
  },
  {
    key: 'method',
    label: 'Method',
    mark: '§2',
    color: '#7C5CBF',
    bg: '#F2EEFA',
  },
  {
    key: 'results',
    label: 'Results',
    mark: '§3',
    color: '#1E8A6E',
    bg: '#E9F6F1',
  },
  {
    key: 'limitations',
    label: 'Limitations',
    mark: '§4',
    color: '#B4622A',
    bg: '#FBF0E7',
  },
]

export default function AnalysisView({ rawText, parsed, isStreaming }) {
  if (!parsed) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 sm:p-7">
        <p className="font-sans text-xs uppercase tracking-wide text-muted mb-3">
          {isStreaming ? 'Reading the document…' : 'Analysis'}
        </p>
        <pre className="font-sans text-sm text-ink whitespace-pre-wrap break-words leading-relaxed">
          {rawText}
          {isStreaming && <span className="animate-pulse">▍</span>}
        </pre>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 sm:p-9">
      <div className="flex flex-col gap-8">
        {STAGES.map(({ key, label, mark, color, bg }) => (
          <div key={key} className="grid grid-cols-[auto_1fr] gap-4 sm:gap-5">
            <span
              className="font-serif text-sm font-semibold rounded-md w-9 h-9 flex items-center justify-center shrink-0"
              style={{ color, backgroundColor: bg }}
            >
              {mark}
            </span>
            <div className="min-w-0 pt-1">
              <p
                className="font-sans text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color }}
              >
                {label}
              </p>
              <p className="font-serif text-[16px] text-ink leading-[1.7]">
                {parsed[key]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
