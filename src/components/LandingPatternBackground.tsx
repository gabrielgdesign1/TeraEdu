'use client'

import { useEffect, useRef } from 'react'
import { FallingPattern } from '@/components/ui/falling-pattern'

const LENS_RADIUS = 170

export function LandingPatternBackground() {
  const baseRef = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    function handleMove(e: MouseEvent) {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const base = baseRef.current
        const lens = lensRef.current
        if (!base || !lens) return
        const { clientX: x, clientY: y } = e
        // Lens: visible only inside the circle (the deformed copy)
        const lensMask = `radial-gradient(${LENS_RADIUS}px circle at ${x}px ${y}px, black, transparent)`
        lens.style.maskImage = lensMask
        lens.style.webkitMaskImage = lensMask
        lens.style.opacity = '1'
        // Base: hidden inside the circle so it doesn't stack with the lens
        const baseMask = `radial-gradient(${LENS_RADIUS}px circle at ${x}px ${y}px, transparent, black)`
        base.style.maskImage = baseMask
        base.style.webkitMaskImage = baseMask
      })
    }
    function handleLeave() {
      const base = baseRef.current
      const lens = lensRef.current
      if (lens) lens.style.opacity = '0'
      if (base) { base.style.maskImage = 'none'; base.style.webkitMaskImage = 'none' }
    }
    window.addEventListener('mousemove', handleMove)
    document.documentElement.addEventListener('mouseleave', handleLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', handleMove)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* SVG warp filter definition (invisible) */}
      <svg className="absolute w-0 h-0" aria-hidden>
        <defs>
          <filter id="pattern-warp" x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.02" numOctaves="2" seed="7" result="turb" />
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Base pattern layer (hole cut where the cursor lens is) */}
      <div ref={baseRef} className="absolute inset-0">
        <FallingPattern
          color="var(--brand)"
          backgroundColor="var(--bg)"
          density={0.9}
          blurIntensity="0.4em"
          duration={140}
          className="h-full w-full opacity-[0.32]"
        />
      </div>

      {/* Warped duplicate, only revealed inside the lens circle that follows the cursor */}
      <div
        ref={lensRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{ filter: 'url(#pattern-warp)' }}
      >
        <FallingPattern
          color="var(--brand)"
          backgroundColor="var(--bg)"
          density={0.9}
          blurIntensity="0.4em"
          duration={140}
          className="h-full w-full opacity-[0.32]"
        />
      </div>
    </div>
  )
}
