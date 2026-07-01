'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function HistoryPanel({
  title = 'Histórico',
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <aside className="fixed left-[92px] top-3 bottom-3 w-60 z-40 flex flex-col overflow-hidden rounded-2xl">
      {/* Glass background */}
      <div
        className="absolute inset-0 rounded-2xl border border-border/50"
        style={isDark ? {
          background: 'rgba(26,29,39,0.88)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.04) inset',
        } : {
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="px-4 py-4 border-b border-border/30 flex-shrink-0">
          <p className="text-text-faint text-[10px] font-semibold uppercase tracking-widest">{title}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
          {children}
        </div>
      </div>
    </aside>
  )
}
