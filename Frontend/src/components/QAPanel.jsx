import { useState, useRef, useEffect } from 'react'

export default function QAPanel({ onAsk }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([]) // { role: 'user'|'assistant', text }
  const [isAsking, setIsAsking] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e) {
    e.preventDefault()
    const q = question.trim()
    if (!q || isAsking) return

    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setQuestion('')
    setIsAsking(true)
    setMessages((prev) => [...prev, { role: 'assistant', text: '' }])

    try {
      await onAsk(q, (fullSoFar) => {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', text: fullSoFar }
          return copy
        })
      })
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', text: `Couldn't get an answer: ${err.message}` }
        return copy
      })
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-6 sm:px-8 pt-6 pb-2 flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
          <path d="M12 20h9" strokeLinecap="round"/>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-muted">
          Margin notes
        </p>
      </div>

      <div
        className="px-6 sm:px-8 py-4 flex flex-col gap-4 max-h-96 overflow-y-auto"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 31px, #E4E1D8 32px)',
          backgroundPosition: '0 4px',
        }}
      >
        {messages.length === 0 && (
          <p className="font-serif italic text-[15px] text-muted py-2">
            Ask a follow-up — the answer stays grounded in this document only.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'pl-4' : 'pl-0'}>
            {m.role === 'user' ? (
              <p className="font-sans text-[13px] font-medium text-accent">
                <span className="text-muted mr-1">→</span>{m.text}
              </p>
            ) : (
              <p className="font-serif text-[15px] text-ink leading-[1.7]">
                {m.text || (isAsking && i === messages.length - 1 ? '…' : '')}
              </p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 px-6 sm:px-8 py-4 border-t border-border bg-paper/40">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a follow-up question…"
          disabled={isAsking}
          className="flex-1 font-sans text-sm bg-card border border-border rounded-lg px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isAsking || !question.trim()}
          className="font-sans text-sm bg-accent text-white px-4 py-2 rounded-lg
                     disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        >
          Ask
        </button>
      </form>
    </div>
  )
}
