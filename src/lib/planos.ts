export type PlanoId = 'gratuito' | 'plus' | 'premium'

export type PlanoFeature = { texto: string; ok: boolean }

export type Plano = {
  id: PlanoId
  emoji: string
  nome: string
  tagline: string
  precoMensal: number
  precoAnual: number
  economiaAnual: number | null
  features: PlanoFeature[]
  cta: string
  popular: boolean
}

export const PLANOS: Plano[] = [
  {
    id: 'gratuito',
    emoji: '🆓',
    nome: 'Gratuito',
    tagline: 'Para experimentar o TeraEdu',
    precoMensal: 0,
    precoAnual: 0,
    economiaAnual: null,
    features: [
      { texto: '15 mil tokens de IA', ok: true },
      { texto: '5 questões do banco por dia', ok: true },
      { texto: 'IA Tutora limitada', ok: true },
      { texto: 'Resumos e flashcards limitados', ok: true },
      { texto: 'Sem upload de PDF', ok: false },
      { texto: 'Sem histórico', ok: false },
      { texto: 'Sem reagendamento por IA', ok: false },
      { texto: 'Estatísticas básicas', ok: true },
      { texto: 'Sem estatísticas avançadas', ok: false },
      { texto: 'Sem questões personalizadas', ok: false },
      { texto: 'Sem revisão inteligente', ok: false },
      { texto: 'Suporte básico', ok: true },
    ],
    cta: 'Começar grátis',
    popular: false,
  },
  {
    id: 'plus',
    emoji: '⭐',
    nome: 'Plus',
    tagline: 'Para quem já viu valor e quer estudar sem se preocupar',
    precoMensal: 19.90,
    precoAnual: 179.90,
    economiaAnual: 25,
    features: [
      { texto: '300 mil tokens de IA', ok: true },
      { texto: 'Questões do banco ilimitadas', ok: true },
      { texto: 'IA Tutora completa', ok: true },
      { texto: 'Resumos e flashcards ilimitados', ok: true },
      { texto: 'Upload de PDF liberado', ok: true },
      { texto: 'Histórico salvo', ok: true },
      { texto: 'Reagendamento de plano por IA', ok: true },
      { texto: 'Estatísticas básicas', ok: true },
      { texto: 'Sem estatísticas avançadas', ok: false },
      { texto: 'Questões personalizadas limitadas', ok: true },
      { texto: 'Sem revisão inteligente', ok: false },
      { texto: 'Suporte por e-mail', ok: true },
    ],
    cta: 'Assinar Plus',
    popular: true,
  },
  {
    id: 'premium',
    emoji: '💎',
    nome: 'Premium',
    tagline: 'Para quem estuda pesado e quer o máximo da IA',
    precoMensal: 34.90,
    precoAnual: 299.90,
    economiaAnual: 28,
    features: [
      { texto: '600 mil tokens de IA', ok: true },
      { texto: 'Questões do banco ilimitadas', ok: true },
      { texto: 'IA Tutora completa', ok: true },
      { texto: 'Resumos e flashcards ilimitados', ok: true },
      { texto: 'Upload de PDF com limite maior', ok: true },
      { texto: 'Histórico salvo', ok: true },
      { texto: 'Reagendamento de plano por IA', ok: true },
      { texto: 'Estatísticas básicas', ok: true },
      { texto: 'Estatísticas avançadas', ok: true },
      { texto: 'Questões personalizadas ilimitadas', ok: true },
      { texto: 'Revisão inteligente', ok: true },
      { texto: 'Suporte prioritário', ok: true },
    ],
    cta: 'Assinar Premium',
    popular: false,
  },
]
