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
      { texto: '15.000 tokens de IA por mês', ok: true },
      { texto: '5 questões por dia', ok: true },
      { texto: '1 plano de estudos', ok: true },
      { texto: 'Acesso à IA Tutora, Resumos e Flashcards (limitado)', ok: true },
      { texto: 'Sem histórico de conversas', ok: false },
      { texto: 'Sem upload de PDF', ok: false },
      { texto: 'Sem reagendamento de plano com IA', ok: false },
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
      { texto: '300.000 tokens de IA por mês', ok: true },
      { texto: 'Questões ilimitadas do banco', ok: true },
      { texto: 'Resumos ilimitados', ok: true },
      { texto: 'Flashcards ilimitados', ok: true },
      { texto: 'Upload de PDF liberado', ok: true },
      { texto: 'Plano de estudos com reagendamento por IA', ok: true },
      { texto: 'Histórico de conversas salvo', ok: true },
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
      { texto: '600.000 tokens de IA por mês', ok: true },
      { texto: 'Tudo do plano Plus', ok: true },
      { texto: 'Geração de questões personalizadas sem limite', ok: true },
      { texto: 'Prioridade nas respostas da IA (menor tempo de espera)', ok: true },
      { texto: 'Estatísticas avançadas de desempenho', ok: true },
      { texto: 'Simulados ilimitados', ok: true },
      { texto: 'Suporte prioritário', ok: true },
    ],
    cta: 'Assinar Premium',
    popular: false,
  },
]
