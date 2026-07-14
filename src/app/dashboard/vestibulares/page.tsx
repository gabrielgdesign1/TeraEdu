'use client'

import { useState, useEffect } from 'react'
import {
  ChevronDown, ExternalLink, Clock, DollarSign, CalendarDays, Info
} from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Status =
  | 'inscricoes-abertas'
  | 'em-breve'
  | 'abrindo-em-breve'
  | 'provas-em-breve'
  | 'encerrado'
  | 'aguardando-edital'

type Link_ = { label: string; url: string }

type Vestibular = {
  id: string
  nome: string
  edicao: string
  instituicao: string
  /** Fallback quando não há datas suficientes para calcular dinamicamente */
  statusFallback: Status
  /** Datas no formato YYYY-MM-DD para cálculo dinâmico */
  inscricaoInicioDate: string | null
  inscricaoFimDate: string | null
  primeiraProvaDate: string | null
  taxa: string | null
  inscricoes: { periodo: string } | null
  provas: string[]
  fases: string[]
  destaques: string[]
  links: Link_[]
  obs?: string
}

// ─── Dados dos vestibulares ───────────────────────────────────────────────────

const VESTIBULARES: Vestibular[] = [
  {
    id: 'enem',
    nome: 'ENEM',
    edicao: '2026',
    instituicao: 'Inep / Ministério da Educação',
    statusFallback: 'provas-em-breve',
    inscricaoInicioDate: '2026-05-25',
    inscricaoFimDate:    '2026-06-12',
    primeiraProvaDate:   '2026-11-08',
    taxa: 'R$ 85,00',
    inscricoes: { periodo: '25/05/2026 – 12/06/2026' },
    provas: ['08/11/2026 (1º dia)', '15/11/2026 (2º dia)'],
    fases: ['Dois domingos — sem 2ª fase'],
    destaques: [
      'Linguagens, Códigos e suas Tecnologias',
      'Ciências Humanas e suas Tecnologias',
      'Ciências da Natureza e suas Tecnologias',
      'Matemática e suas Tecnologias',
    ],
    links: [
      { label: 'Página oficial', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem' },
      { label: 'Página do Participante', url: 'https://enem.inep.gov.br/participante/' },
    ],
    obs: 'Inscrições encerradas em 12/06/2026.',
  },
  {
    id: 'fuvest',
    nome: 'FUVEST / USP',
    edicao: '2027',
    instituicao: 'Fundação Universitária para o Vestibular',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-08-17',
    inscricaoFimDate:    '2026-10-09',
    primeiraProvaDate:   '2026-11-01',
    taxa: 'R$ 228,00',
    inscricoes: { periodo: '17/08/2026 – 09/10/2026' },
    provas: ['01/11/2026 (1ª fase)', '06–07/12/2026 (2ª fase)'],
    fases: ['1ª fase — 80 questões objetivas', '2ª fase — discursiva', 'Habilidades específicas (Música, Artes, Teatro)'],
    destaques: [
      '1ª fase: 01/11/2026',
      'Divulgação convocados 2ª fase: 23/11/2026',
      '2ª fase: 06 e 07/12/2026',
      '1ª chamada: 26/01/2027',
    ],
    links: [
      { label: 'Página oficial', url: 'https://www.fuvest.br/vestibular-da-usp/' },
      { label: 'Área do candidato', url: 'https://app.fuvest.br/' },
      { label: 'Cronograma completo', url: 'https://www.fuvest.br/fuvest-2027-fuvest-divulga-cronograma-completo-do-vestibular-2027/' },
      { label: 'Programa do vestibular', url: 'https://www.fuvest.br/wp-content/uploads/fuvest2027-programa-vestibular.pdf' },
      { label: 'Provas anteriores', url: 'https://www.fuvest.br/acervo-vestibular/' },
    ],
    obs: 'Isenção: 11/05/2026 – 10/07/2026.',
  },
  {
    id: 'unicamp',
    nome: 'UNICAMP',
    edicao: '2027',
    instituicao: 'Comvest / Unicamp',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-08-03',
    inscricaoFimDate:    '2026-08-31',
    primeiraProvaDate:   '2026-10-18',
    taxa: 'A confirmar no edital',
    inscricoes: { periodo: '03/08/2026 – 31/08/2026' },
    provas: ['18/10/2026 (1ª fase)', '29–30/11/2026 (2ª fase)'],
    fases: ['1ª fase', '2ª fase', 'Habilidades específicas (Música, Artes Cênicas, Artes Visuais, Dança)'],
    destaques: [
      '1ª fase: 18/10/2026',
      '2ª fase: 29 e 30/11/2026',
      'Habilidades específicas: 02–04/12/2026',
      '1ª chamada: 25/01/2027',
    ],
    links: [
      { label: 'Página oficial', url: 'https://www.comvest.unicamp.br/' },
      { label: 'Vestibular Unicamp 2027', url: 'https://www.comvest.unicamp.br/ingresso-2027/vestibular-2027/' },
    ],
    obs: 'Taxa da edição 2027 ainda a confirmar no edital oficial.',
  },
  {
    id: 'unesp',
    nome: 'UNESP',
    edicao: '2027',
    instituicao: 'Fundação Vunesp / Unesp',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-09-04',
    inscricaoFimDate:    '2026-10-20',
    primeiraProvaDate:   '2026-11-22',
    taxa: 'A confirmar no manual',
    inscricoes: { periodo: '04/09/2026 – 20/10/2026' },
    provas: ['22/11/2026 (1ª fase)', '13–14/12/2026 (2ª fase)'],
    fases: ['1ª fase', '2ª fase'],
    destaques: [
      '1ª fase: 22/11/2026',
      '2ª fase: 13 e 14/12/2026',
      'Resultado final / 1ª chamada: 29/01/2027',
      '24 cidades com cursos da Unesp em SP',
    ],
    links: [
      { label: 'Vunesp — Vestibular Unesp 2027', url: 'https://www.vunesp.com.br/VNSP2514' },
      { label: 'Portal Vestibular Unesp', url: 'https://vestibular.unesp.br/' },
      { label: 'Portal Vunesp', url: 'https://www.vunesp.com.br/' },
    ],
    obs: 'Taxa e manual completo a confirmar quando publicados pela Vunesp.',
  },
  {
    id: 'uerj',
    nome: 'UERJ',
    edicao: '2027',
    instituicao: 'Departamento de Seleção Acadêmica da UERJ',
    statusFallback: 'provas-em-breve',
    // 1º EQ já ocorreu; 2º EQ previsto para 2º sem 2026 — sem data exata publicada
    inscricaoInicioDate: null,
    inscricaoFimDate:    '2026-05-07',
    primeiraProvaDate:   '2026-06-07',
    taxa: 'R$ 100,00 (1º EQ)',
    inscricoes: { periodo: 'Até 07/05/2026 (1º EQ — encerrado)' },
    provas: ['07/06/2026 (1º EQ — realizado)', '2º EQ — 2º sem. 2026', 'Exame Discursivo — a confirmar'],
    fases: ['1º Exame de Qualificação', '2º Exame de Qualificação', 'Exame Discursivo (80 pts)'],
    destaques: [
      '1º EQ realizado em 07/06/2026 — Livro: "Ainda estou aqui"',
      '2º EQ: 2º semestre de 2026 — Livro: "O Cortiço"',
      'Exame Discursivo: obra "O bem-amado"',
      'Redação usa "Luanda, Lisboa, Paraíso"',
    ],
    links: [
      { label: 'Site oficial Vestibular UERJ', url: 'https://www.vestibular.uerj.br/' },
      { label: 'Sistemas candidato', url: 'https://sistemas.vestibular.uerj.br/' },
      { label: 'Questões comentadas', url: 'https://www.revista.vestibular.uerj.br/questao/' },
    ],
    obs: '2º EQ e Exame Discursivo com datas a confirmar no site oficial.',
  },
  {
    id: 'unb',
    nome: 'UnB',
    edicao: '2026',
    instituicao: 'Cebraspe / Universidade de Brasília',
    statusFallback: 'aguardando-edital',
    inscricaoInicioDate: '2025-08-15',
    inscricaoFimDate:    '2025-09-05',
    primeiraProvaDate:   '2025-11-22',
    taxa: 'R$ 173,00 (edição 2026)',
    inscricoes: { periodo: '15/08/2025 – 05/09/2025 (edição 2026)' },
    provas: ['22–23/11/2025 (edição 2026)'],
    fases: ['Provas em dois dias — modelo Cebraspe', 'Redação em Língua Portuguesa'],
    destaques: [
      'Edição 2027 ainda sem edital publicado',
      '2.102 vagas na edição 2026',
      'Modelo Cebraspe — não é A/B/C/D/E tradicional',
      'Aplicação no DF e cidades próximas',
    ],
    links: [
      { label: 'Cebraspe — Vestibular UnB 2026', url: 'https://www.cebraspe.org.br/vestibulares/VESTUNB_26' },
      { label: 'Vestibulares Cebraspe', url: 'https://www.cebraspe.org.br/vestibulares/' },
    ],
    obs: 'Dados da edição 2026 como referência. Edital 2027 ainda não publicado.',
  },
  {
    id: 'ufg',
    nome: 'UFG',
    edicao: '2027',
    instituicao: 'Instituto Verbena / UFG',
    statusFallback: 'inscricoes-abertas',
    inscricaoInicioDate: '2026-06-26',
    inscricaoFimDate:    '2026-08-07',
    primeiraProvaDate:   '2026-09-27',
    taxa: 'R$ 130,00',
    inscricoes: { periodo: '26/06/2026 – 07/08/2026' },
    provas: ['27/09/2026 (objetiva + redação)'],
    fases: ['Fase única — 96 questões objetivas + redação'],
    destaques: [
      'Gabarito preliminar: 28/09/2026',
      'Resultado final: 11/12/2026',
      '1ª chamada: 15/12/2026',
      '2.357 vagas — Goiânia e cidades GO',
    ],
    links: [
      { label: 'Vestibular UFG 2027', url: 'https://sistemas.institutoverbena.ufg.br/2026/vestibular-ufg/' },
      { label: 'Portal do Candidato', url: 'https://sistemas.institutoverbena.ufg.br/portal/login' },
      { label: 'Edital de abertura', url: 'https://sistemas.institutoverbena.ufg.br/2026/vestibular-ufg/sistema/arquivos/editais/VESTIBULAR_UFG_2027_EDITAL_.pdf' },
    ],
  },
  {
    id: 'ufpr',
    nome: 'UFPR',
    edicao: '2027',
    instituicao: 'Núcleo de Concursos da UFPR',
    statusFallback: 'inscricoes-abertas',
    inscricaoInicioDate: '2026-05-18',
    inscricaoFimDate:    '2026-07-20',
    primeiraProvaDate:   '2026-11-01',
    taxa: 'R$ 180,00',
    inscricoes: { periodo: '18/05/2026 – 20/07/2026' },
    provas: ['01/11/2026 (objetiva + discursiva)', '02/11/2026 (Música)'],
    fases: ['Fase única — 80 questões objetivas + 2 discursivas'],
    destaques: [
      'Aplicação em 12 cidades: Curitiba, Londrina, Maringá, Joinville/SC…',
      'Resultado preliminar das inscrições: 14/08/2026',
      'Isenção: até 15/06/2026',
      'Atendimento especializado: até 21/07/2026',
    ],
    links: [
      { label: 'Vestibular UFPR 2027', url: 'https://servicos.nc.ufpr.br/PortalNC/Concurso?concurso=PS2027' },
      { label: 'Portal do Candidato', url: 'https://servicos.nc.ufpr.br/PortalNC/Login' },
      { label: 'Núcleo de Concursos', url: 'https://www.nc.ufpr.br/' },
    ],
  },
  {
    id: 'ita',
    nome: 'ITA',
    edicao: '2027',
    instituicao: 'Instituto Tecnológico de Aeronáutica',
    statusFallback: 'inscricoes-abertas',
    inscricaoInicioDate: '2026-06-02',
    inscricaoFimDate:    '2026-07-12',
    primeiraProvaDate:   '2026-09-27',
    taxa: 'R$ 195,00',
    inscricoes: { periodo: '02/06/2026 – 12/07/2026' },
    provas: ['27/09/2026 (1ª fase)', '20–23/10/2026 (2ª fase)'],
    fases: ['1ª fase — exame objetivo (13h–18h)', '2ª fase — provas dissertativas por disciplina', '3ª fase — inspeção de saúde'],
    destaques: [
      '2ª fase: 20/10 Matemática, 21/10 Química, 22/10 Física, 23/10 Português',
      'Cartão/local divulgado: 21/09/2026',
      'Pagamento via PagTesouro (PIX ou cartão)',
    ],
    links: [
      { label: 'Página oficial ITA', url: 'https://www.vestibular.ita.br/' },
      { label: 'Edital ITA 2027', url: 'https://vestibular.ita.br/instrucoes/edital_2027.pdf' },
      { label: 'Provas anteriores', url: 'https://vestibular.ita.br/provas.htm' },
    ],
  },
  {
    id: 'ime',
    nome: 'IME',
    edicao: '2026/2027',
    instituicao: 'Instituto Militar de Engenharia / Exército Brasileiro',
    statusFallback: 'inscricoes-abertas',
    inscricaoInicioDate: '2026-05-27',
    inscricaoFimDate:    '2026-07-08',
    primeiraProvaDate:   '2026-09-20',
    taxa: 'R$ 140,00',
    inscricoes: { periodo: '27/05/2026 – 08/07/2026' },
    provas: ['20/09/2026 (1ª fase)', '26–29/10/2026 (2ª fase discursiva)'],
    fases: ['Exame intelectual', 'Inspeção de saúde', 'Exame de aptidão física', 'Avaliação psicológica'],
    destaques: [
      '100 vagas: 70 Ativa + 30 Reserva',
      'Isenção: 01/06 – 05/06/2026',
      'Pagamento: até 09/07/2026',
    ],
    links: [
      { label: 'Portal de inscrição IME', url: 'https://inscricoes.ime.eb.br/cfg/' },
      { label: 'Portal concursos IME', url: 'https://www.ime.eb.mil.br/component/banners/click/6' },
    ],
  },
]

// ─── Status dinâmico ──────────────────────────────────────────────────────────

type StatusInfo = {
  status: Status
  label: string
  diasLabel: string | null
  color: string
  dot: string
}

function calcularStatus(v: Vestibular, hoje: Date): StatusInfo {
  const cfg: Record<Status, { label: string; color: string; dot: string }> = {
    'inscricoes-abertas': { label: 'Inscrições abertas',  color: 'bg-green-500/10 text-green-600 border-green-500/30',     dot: 'bg-green-500'   },
    'em-breve':           { label: 'Em breve',             color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',       dot: 'bg-blue-500'    },
    'abrindo-em-breve':   { label: 'Abrindo em breve',    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',     dot: 'bg-amber-500'   },
    'provas-em-breve':    { label: 'Provas em breve',      color: 'bg-brand/10 text-brand border-brand/30',                dot: 'bg-brand'       },
    'encerrado':          { label: 'Encerrado',            color: 'bg-zinc-500/10 text-text-muted border-zinc-500/20',     dot: 'bg-zinc-400'    },
    'aguardando-edital':  { label: 'Aguardando edital',   color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', dot: 'bg-purple-500'  },
  }

  function make(s: Status, diasLabel: string | null = null): StatusInfo {
    return { status: s, diasLabel, ...cfg[s] }
  }

  function diffDias(a: Date, b: Date) {
    return Math.ceil((b.getTime() - a.getTime()) / 86400000)
  }

  const { inscricaoInicioDate, inscricaoFimDate, primeiraProvaDate } = v

  // Sem datas suficientes: usa fallback
  if (!inscricaoFimDate) return make(v.statusFallback)

  const fim   = new Date(inscricaoFimDate + 'T23:59:59')
  const prova = primeiraProvaDate ? new Date(primeiraProvaDate + 'T08:00:00') : null

  // Inscrições já fecharam
  if (hoje > fim) {
    // Se tem prova futura: "provas em breve"
    if (prova && hoje < prova) {
      const d = diffDias(hoje, prova)
      return make('provas-em-breve', `Prova em ${d} dia${d !== 1 ? 's' : ''}`)
    }
    // UERJ/UnB com fallback especial
    if (v.statusFallback === 'aguardando-edital') return make('aguardando-edital')
    if (v.statusFallback === 'provas-em-breve')   return make('provas-em-breve', '2º EQ a confirmar')
    return make('encerrado')
  }

  const inicio = inscricaoInicioDate ? new Date(inscricaoInicioDate + 'T00:00:00') : null

  // Inscrições ainda não abriram
  if (inicio && hoje < inicio) {
    const d = diffDias(hoje, inicio)
    if (d <= 7) return make('abrindo-em-breve', `Abre em ${d} dia${d !== 1 ? 's' : ''}`)
    return make('em-breve', `Abre em ${d} dias`)
  }

  // Estamos dentro do período de inscrição
  const d = diffDias(hoje, fim)
  if (d === 0) return make('inscricoes-abertas', 'Fecha hoje!')
  return make('inscricoes-abertas', `Fecha em ${d} dia${d !== 1 ? 's' : ''}`)
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

const FILTROS: { id: Status | 'todos'; label: string }[] = [
  { id: 'todos',              label: 'Todos'               },
  { id: 'inscricoes-abertas', label: 'Inscrições abertas'  },
  { id: 'abrindo-em-breve',  label: 'Abrindo em breve'    },
  { id: 'em-breve',          label: 'Em breve'             },
  { id: 'provas-em-breve',   label: 'Provas em breve'      },
  { id: 'encerrado',         label: 'Encerradas'           },
  { id: 'aguardando-edital', label: 'Aguardando edital'    },
]

// ─── Página ────────────────────────────────────────────────────────────────────

export default function Vestibulares() {
  // hoje é null no server/hydration, setado no cliente para evitar mismatch
  const [hoje, setHoje] = useState<Date | null>(null)

  useEffect(() => {
    setHoje(new Date())
  }, [])

  const [filtro,    setFiltro   ] = useState<Status | 'todos'>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)

  // Calcula status de cada vestibular (só no cliente)
  const statusMap: Record<string, StatusInfo> = {}
  if (hoje) {
    for (const v of VESTIBULARES) {
      statusMap[v.id] = calcularStatus(v, hoje)
    }
  }

  const lista = VESTIBULARES.filter(v => {
    if (filtro === 'todos') return true
    if (!hoje) return true  // durante hydration mostra tudo
    return statusMap[v.id]?.status === filtro
  })

  return (
    <div className="min-h-screen bg-bg flex app-atmosphere">

      <DashboardSidebar />

      {/* ── Main ── */}
      <main className="flex-1 ml-20 px-10 py-10">
        <div className="mb-6">
          <h1 className="text-text text-2xl font-bold tracking-tight mb-1">Vestibulares</h1>
          <p className="text-text-muted text-sm">Datas, inscrições e links oficiais — atualizado em 30/06/2026</p>
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 mb-7 max-w-3xl">
          <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
            Sempre confirme datas e taxas nos sites oficiais antes de se inscrever. Algumas informações podem ser atualizadas pelos organizadores após a publicação.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTROS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                filtro === f.id
                  ? 'bg-brand text-white border-brand'
                  : 'border-border text-text-muted hover:border-brand hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 max-w-5xl">
          {lista.map(v => {
            const st = hoje ? statusMap[v.id] : null
            const aberto = expandido === v.id

            return (
              <div key={v.id} className="bg-bg-card border border-border rounded-2xl overflow-hidden">

                {/* Header do card */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <h2 className="text-text text-lg font-bold">{v.nome}</h2>
                        <span className="text-text-faint text-xs">{v.edicao}</span>
                      </div>
                      <p className="text-text-faint text-xs">{v.instituicao}</p>
                    </div>

                    {/* Badge dinâmico */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {st ? (
                        <>
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                            {st.label}
                          </span>
                          {st.diasLabel && (
                            <span className="text-[10px] text-text-faint font-medium">{st.diasLabel}</span>
                          )}
                        </>
                      ) : (
                        <span className="w-28 h-6 bg-bg-hover rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Info rápida */}
                  <div className="flex flex-col gap-2">
                    {v.taxa && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={13} className="text-text-faint flex-shrink-0" />
                        <span className="text-text-muted">{v.taxa}</span>
                      </div>
                    )}
                    {v.inscricoes && (
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays size={13} className="text-text-faint flex-shrink-0" />
                        <span className="text-text-muted">Inscrições: {v.inscricoes.periodo}</span>
                      </div>
                    )}
                    {v.provas.slice(0, 2).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Clock size={13} className="text-text-faint flex-shrink-0" />
                        <span className="text-text-muted">{p}</span>
                      </div>
                    ))}
                    {v.provas.length > 2 && !aberto && (
                      <p className="text-text-faint text-xs ml-5">+{v.provas.length - 2} data{v.provas.length - 2 > 1 ? 's' : ''}</p>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandido(aberto ? null : v.id)}
                    className="flex items-center gap-1 text-brand text-xs font-medium mt-4 hover:opacity-75 transition-opacity"
                  >
                    {aberto ? 'Ver menos' : 'Ver detalhes'}
                    <ChevronDown size={12} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Expandido */}
                {aberto && (
                  <div className="border-t border-border px-6 pb-6 pt-5 flex flex-col gap-5">

                    <div>
                      <p className="text-text-faint text-[10px] uppercase tracking-widest font-semibold mb-2">Datas chave</p>
                      <ul className="flex flex-col gap-1">
                        {v.destaques.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                            <span className="w-1 h-1 rounded-full bg-brand mt-2 flex-shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-text-faint text-[10px] uppercase tracking-widest font-semibold mb-2">Fases</p>
                      <ul className="flex flex-col gap-1">
                        {v.fases.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                            <span className="text-brand font-semibold flex-shrink-0">{i + 1}.</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {v.obs && (
                      <div className="bg-bg border border-border rounded-xl px-4 py-3">
                        <p className="text-text-muted text-xs leading-relaxed">{v.obs}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-text-faint text-[10px] uppercase tracking-widest font-semibold mb-2">Links oficiais</p>
                      <div className="flex flex-col gap-1.5">
                        {v.links.map((l, i) => (
                          <a
                            key={i}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-brand hover:opacity-75 transition-opacity"
                          >
                            <ExternalLink size={12} className="flex-shrink-0" />
                            {l.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-text-faint text-xs mt-10 max-w-3xl">
          Fontes: sites oficiais de cada instituição (Inep, Fuvest, Comvest, Vunesp, UERJ, Cebraspe/UnB, Instituto Verbena/UFG, NC-UFPR, ITA, IME). Atualizado em 30/06/2026.
        </p>
      </main>
    </div>
  )
}
