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
  badge?: string
}

export const PLANOS: Plano[] = [
  {
    id: 'gratuito',
    emoji: '🆓',
    nome: 'Gratuito',
    tagline: 'Para começar',
    precoMensal: 0,
    precoAnual: 0,
    economiaAnual: null,
    features: [
      { texto: '15.000 tokens de IA por mês', ok: true },
      { texto: '5 questões por dia', ok: true },
      { texto: 'IA Tutora, resumos e flashcards', ok: true },
      { texto: '1 plano de estudos', ok: true },
      { texto: 'Estatísticas básicas', ok: true },
    ],
    cta: 'Começar grátis',
    popular: false,
  },
  {
    id: 'plus',
    emoji: '⭐',
    nome: 'Plus',
    tagline: 'Para estudar todos os dias',
    precoMensal: 19.90,
    precoAnual: 179.90,
    economiaAnual: 25,
    features: [
      { texto: '300.000 tokens de IA por mês', ok: true },
      { texto: 'Questões ilimitadas', ok: true },
      { texto: 'IA Tutora completa', ok: true },
      { texto: 'Upload e análise de PDFs', ok: true },
      { texto: 'Histórico e planos de estudos completos', ok: true },
    ],
    cta: 'Assinar Plus',
    popular: true,
    badge: 'Mais popular',
  },
  {
    id: 'premium',
    emoji: '💎',
    nome: 'Premium',
    tagline: 'Para uma preparação intensiva',
    precoMensal: 34.90,
    precoAnual: 299.90,
    economiaAnual: 28,
    features: [
      { texto: '600.000 tokens de IA por mês', ok: true },
      { texto: '2× mais capacidade de IA que o Plus', ok: true },
      { texto: 'Mais espaço para resumos, flashcards e PDFs', ok: true },
      { texto: 'Questões ilimitadas', ok: true },
      { texto: 'Todos os recursos do Plus', ok: true },
    ],
    cta: 'Assinar Premium',
    popular: false,
    badge: 'Maior capacidade',
  },
]
