'use client'

import { useEffect, useRef } from 'react'
import { FallingPattern } from '@/components/ui/falling-pattern'

export function LandingPatternBackground() {
  const lensRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    function handleMove(e: MouseEvent) {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const lens = lensRef.current
        if (!lens) return
        const mask = `radial-gradient(180px circle at ${e.clientX}px ${e.clientY}px, black, transparent)`
        lens.style.maskImage = mask
        lens.style.webkitMaskImage = mask
        lens.style.opacity = '1'
      })
    }
    function handleLeave() {
      const lens = lensRef.current
      if (lens) lens.style.opacity = '0'
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
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="75" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Base pattern layer */}
      <FallingPattern
        color="var(--brand)"
        backgroundColor="var(--bg)"
        density={0.6}
        blurIntensity="0.35em"
        duration={140}
        className="h-full w-full opacity-60"
      />

      {/* Warped duplicate, only revealed in a circle that follows the cursor */}
      <div
        ref={lensRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{ filter: 'url(#pattern-warp)' }}
      >
        <FallingPattern
          color="var(--brand)"
          backgroundColor="var(--bg)"
          density={0.6}
          blurIntensity="0.35em"
          duration={140}
          className="h-full w-full opacity-90"
        />
      </div>
    </div>
  )
}
