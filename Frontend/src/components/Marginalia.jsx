export default function Marginalia({ items }) {
  if (!items || items.length === 0) return null

  return (
    <div className="lg:sticky lg:top-8">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
        Know before you read
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="relative pl-3">
            <span
              className="absolute left-0 top-0.5 bottom-0.5 w-[2px] rounded-full"
              style={{ backgroundColor: '#D9A83B' }}
            />
            <p className="font-sans text-[13px] text-ink leading-snug">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}