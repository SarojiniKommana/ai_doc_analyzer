import { useRef, useState } from 'react'

export default function UploadPanel({ onUpload, isUploading, error }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files) {
    if (files && files[0]) onUpload(files[0])
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={`border-2 border-dashed rounded-xl p-10 sm:p-14 text-center transition-colors cursor-pointer
        ${isDragging ? 'border-accent bg-accent-light' : 'border-border bg-card'}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center gap-3">
        {/* stacked-pages mark instead of a generic upload arrow */}
        <div className="relative w-12 h-14">
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-border rounded-sm" />
          <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-accent-light border border-border rounded-sm" />
          <div className="absolute inset-0 bg-card border border-border rounded-sm flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B4A8C" strokeWidth="2">
              <path d="M12 16V6M12 6l-3.5 3.5M12 6l3.5 3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {isUploading ? (
          <p className="font-sans text-sm text-muted">Reading your document…</p>
        ) : (
          <>
            <p className="font-serif text-lg text-ink">
              Drop a paper here
            </p>
            <p className="font-sans text-sm text-muted">
              or click to browse — .pdf and .txt supported
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="font-sans text-sm text-red-600 mt-4">{error}</p>
      )}
    </div>
  )
}
