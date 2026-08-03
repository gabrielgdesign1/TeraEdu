export type PlanoId = 'gratuito' | 'plus' | 'premium'

export type PlanoFeature = { texto: string; ok: boolean }

export type Plano = {
  id: PlanoId
  emoji: string
  nome: string
  tagline: string
  precoMensal: number
  precoAnual: number
  /** Valor mensal equivalente do plano anual — só exibição (239,90/12 = 19,99) */
  precoMensalNoAnual: number
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
    precoMensalNoAnual: 0,
    economiaAnual: null,
    features: [
      { texto: '900 créditos de IA por mês', ok: true },
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
    precoMensal: 23.99,
    precoAnual: 239.90,
    precoMensalNoAnual: 19.99,
    economiaAnual: 17,   // 23,99x12 = 287,88 -> 239,90 economiza 16,67%
    features: [
      { texto: '8.000 créditos de IA por mês', ok: true },
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
    precoMensal: 39.99,
    precoAnual: 399.90,
    precoMensalNoAnual: 33.33,
    economiaAnual: 17,   // 39,99x12 = 479,88 -> 399,90 economiza 16,67%
    features: [
      { texto: '13.500 créditos de IA por mês', ok: true },
      { texto: '70% mais capacidade de IA que o Plus', ok: true },
      { texto: 'Mais espaço para resumos, flashcards e PDFs', ok: true },
      { texto: 'Questões ilimitadas', ok: true },
      { texto: 'Todos os recursos do Plus', ok: true },
    ],
    cta: 'Assinar Premium',
    popular: false,
    badge: 'Maior capacidade',
  },
]
