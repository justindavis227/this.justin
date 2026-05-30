export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const label = slug.charAt(0).toUpperCase() + slug.slice(1)

  return (
    <div className="content-inner">
      <div className="section">
        <div className="section-head">
          <span className="section-eyebrow">{label}</span>
        </div>
        <div className="empty">
          {label} space dashboard — Phase 3 KPI views coming soon.
        </div>
      </div>
    </div>
  )
}
