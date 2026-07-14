'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, GraduationCap, Settings, Sun, Moon, Sparkles, LucideIcon,
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

/* ── Dimensões (o ícone fica sempre centralizado no estado recolhido) ── */
const COLLAPSED = 68           // largura recolhida da sidebar
const EXPANDED  = 224          // largura expandida
const ICON_SLOT = COLLAPSED - 16 // = 52px — largura do slot do ícone (nav tem px-2 → 8+8)

const NAV_ITEMS = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Início'       },
  { href: '/dashboard/questoes',     icon: FileQuestion,    label: 'Questões'     },
  { href: '/dashboard/flashcards',   icon: Layers,          label: 'Flashcards'   },
  { href: '/dashboard/resumos',      icon: FileText,        label: 'Resumos'      },
  { href: '/dashboard/tutora',       icon: MessageCircle,   label: 'IA Tutora'    },
  { href: '/dashboard/vestibulares', icon: GraduationCap,   label: 'Vestibulares' },
]

const PROGRESS_ITEMS = [
  { href: '/dashboard/desempenho', icon: BarChart3, label: 'Desempenho'     },
  { href: '/dashboard/plano',      icon: Calendar,  label: 'Plano de Estudo' },
]

/* Label do item — sempre montado, fade coordenado com a largura:
   ao expandir, espera a largura crescer (delay); ao recolher, some primeiro. */
function SideLabel({ expanded, className = '', children }: {
  expanded: boolean; className?: string; children: React.ReactNode
}) {
  return (
    <span
      className={`motion-safe-ui relative z-10 whitespace-nowrap pr-3 will-change-[opacity] ${className}`}
      style={{
        opacity: expanded ? 1 : 0,
        transition: `opacity 180ms ease ${expanded ? '90ms' : '0ms'}`,
      }}
      aria-hidden={!expanded}
    >
      {children}
    </span>
  )
}

function IconSlot({ children, width = ICON_SLOT }: { children: React.ReactNode; width?: number }) {
  return (
    <span
      className="relative z-10 flex items-center justify-center flex-shrink-0"
      style={{ width }}
    >
      {children}
    </span>
  )
}

function NavItem({
  href, icon: Icon, label, active, expanded,
}: {
  href: string; icon: LucideIcon; label: string; active: boolean; expanded: boolean
}) {
  return (
    <Link
      href={href}
      title={label}
      className={`relative flex items-center h-11 rounded-xl transition-colors duration-150 overflow-hidden ${
        active ? 'text-brand' : 'text-text-muted hover:text-text'
      }`}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand/15 to-brand/5 shadow-[inset_0_1px_0_rgba(249,115,22,0.15),0_4px_14px_-6px_rgba(249,115,22,0.35)]"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand rounded-r-full" />
        </motion.div>
      )}
      <IconSlot><Icon size={17} /></IconSlot>
      <SideLabel expanded={expanded} className="text-sm font-medium">{label}</SideLabel>
    </Link>
  )
}

export function DashboardSidebar() {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { profile } = useProfile()

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : (pathname === href || pathname.startsWith(href + '/'))

  const primeiroNome = profile?.nome?.split(' ')[0] ?? null

  return (
    <aside
      className="motion-safe-ui fixed left-3 top-3 bottom-3 z-50 flex flex-col overflow-hidden"
      style={{
        width: expanded ? EXPANDED : COLLAPSED,
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* ── Glass background ── */}
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

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Logo — logo no mesmo eixo central dos ícones (34px) */}
        <div className="flex items-center h-[68px] flex-shrink-0 overflow-hidden border-b border-border/30">
          <IconSlot width={ICON_SLOT + 8}>
            <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={26} height={26} className="flex-shrink-0" />
          </IconSlot>
          <SideLabel expanded={expanded} className="text-text font-bold tracking-tight text-base">
            TeraEdu
          </SideLabel>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-hidden">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} expanded={expanded} />
          ))}

          {/* Divider */}
          <div className="my-2 mx-3 h-px bg-border/40" />

          {/* Label "Progresso" — altura reservada sempre (só a opacidade muda) */}
          <p
            className="motion-safe-ui h-4 px-3 pb-1 text-[9px] uppercase tracking-widest text-text-faint font-semibold whitespace-nowrap overflow-hidden"
            style={{ opacity: expanded ? 1 : 0, transition: `opacity 180ms ease ${expanded ? '90ms' : '0ms'}` }}
          >
            Progresso
          </p>

          {PROGRESS_ITEMS.map(item => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} expanded={expanded} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-3 border-t border-border/30 pt-2 flex flex-col gap-0.5 flex-shrink-0">

          {/* Fazer upgrade */}
          <Link
            href="/dashboard/planos"
            title="Fazer upgrade"
            className={`relative flex items-center h-11 rounded-xl transition-colors overflow-hidden w-full ${
              isActive('/dashboard/planos') ? 'text-brand' : 'text-brand/90 hover:bg-bg-hover'
            }`}
          >
            <IconSlot><Sparkles size={17} /></IconSlot>
            <SideLabel expanded={expanded} className="text-sm font-medium">Fazer upgrade</SideLabel>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
            className="relative flex items-center h-11 rounded-xl transition-colors overflow-hidden w-full text-text-muted hover:text-text hover:bg-bg-hover"
          >
            <IconSlot>{isDark ? <Sun size={17} /> : <Moon size={17} />}</IconSlot>
            <SideLabel expanded={expanded} className="text-sm font-medium">
              {isDark ? 'Modo claro' : 'Modo escuro'}
            </SideLabel>
          </button>

          {/* User */}
          <Link
            href="/dashboard/configuracoes"
            title="Configurações"
            className="relative flex items-center h-12 rounded-xl hover:bg-bg-hover transition-colors overflow-hidden w-full"
          >
            <IconSlot>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden bg-brand">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  primeiroNome?.[0]?.toUpperCase() ?? '?'
                )}
              </span>
            </IconSlot>
            <span
              className="motion-safe-ui relative z-10 flex-1 min-w-0 flex items-center justify-between pr-3 will-change-[opacity]"
              style={{ opacity: expanded ? 1 : 0, transition: `opacity 180ms ease ${expanded ? '90ms' : '0ms'}` }}
              aria-hidden={!expanded}
            >
              <span className="min-w-0 block">
                <span className="text-text text-sm font-semibold truncate block">{profile?.nome ?? '...'}</span>
                {profile?.universidade && (
                  <span className="text-text-faint text-[10px] truncate block">{profile.universidade}</span>
                )}
              </span>
              <Settings size={12} className="text-text-faint flex-shrink-0 ml-2" />
            </span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
