import React from 'react'

export default function KpiRow({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
      marginBottom: 14,
    }}>
      {children}
    </div>
  )
}
