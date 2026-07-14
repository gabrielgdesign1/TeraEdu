'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { History, X } from 'lucide-react'

export function HistoryPanel({
  title = 'Histórico',
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  const glassBg = isDark ? {
    background: 'rgba(26,29,39,0.88)',
    backdropFilter: 'blur(20px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.04) inset',
  } : {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
  }

  return (
    <>
      {/* ── Desktop: painel lateral fixo (inalterado) ── */}
      <aside className="hidden md:flex fixed left-[92px] top-3 bottom-3 w-60 z-40 flex-col overflow-hidden rounded-2xl">
        <div className="absolute inset-0 rounded-2xl border border-border/50" style={glassBg} />
        <div className="relative z-10 flex flex-col h-full">
          <div className="px-4 py-4 border-b border-border/30 flex-shrink-0">
            <p className="text-text-faint text-[10px] font-semibold uppercase tracking-widest">{title}</p>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
            {children}
          </div>
        </div>
      </aside>

      {/* ── Mobile: botão flutuante + drawer lateral ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label={title}
        className="motion-safe-ui md:hidden fixed right-4 top-4 z-40 w-10 h-10 rounded-full flex items-center justify-center border border-border/50 text-text-muted transition-transform active:scale-95"
        style={glassBg}
      >
        <History size={16} />
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`motion-safe-ui md:hidden fixed inset-0 z-[65] bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className="motion-safe-ui md:hidden fixed left-0 top-0 bottom-0 z-[75] w-72 max-w-[82vw] transition-transform duration-300 ease-out"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
        aria-hidden={!open}
      >
        <div className="relative flex flex-col h-full">
          <div className="absolute inset-0" style={glassBg} />
          <div className="relative z-10 flex flex-col h-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="px-4 py-4 border-b border-border/30 flex-shrink-0 flex items-center justify-between">
              <p className="text-text-faint text-[10px] font-semibold uppercase tracking-widest">{title}</p>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-hover text-text-muted"
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
