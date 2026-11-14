import type { CSSProperties } from 'react'

/**
 * Parâmetros da animação `.flutuar` (globals.css): vai de (0, 0, r0) até (x, y, r1)
 * na metade do ciclo e volta. Use no `style` de um elemento com `className="flutuar"`.
 *
 * O elemento animado não pode ter outro `transform` próprio (ex: translateZ numa cena
 * 3D) — a animação o sobrescreveria. Nesses casos, envolva num wrapper.
 */
export function flutuar({ x = 0, y = 0, r0 = 0, r1 = 0, dur, delay = 0 }: {
  x?: number; y?: number; r0?: number; r1?: number; dur: number; delay?: number
}): CSSProperties {
  return {
    '--fx': `${x}px`,
    '--fy': `${y}px`,
    '--fr0': `${r0}deg`,
    '--fr1': `${r1}deg`,
    '--fdur': `${dur}s`,
    '--fdelay': `${delay}s`,
  } as CSSProperties
}
