'use client'

import { useState, useEffect } from 'react'
import {
  ChevronDown, ExternalLink, Clock, DollarSign, CalendarDays, Info, ArrowRight
} from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Status =
  | 'inscricoes-abertas'
  | 'em-breve'
  | 'abrindo-em-breve'
  | 'provas-em-breve'
  | 'em-andamento'
  | 'encerrado'
  | 'aguardando-edital'

type Link_ = { label: string; url: string }

/** Etapa datada do processo seletivo. `prova` marca dias de aplicação de prova. */
type Etapa = { data: string; label: string; prova?: boolean }

type Vestibular = {
  id: string
  nome: string
  edicao: string
  instituicao: string
  /** Usado quando não há datas de inscrição (ex: edital ainda não publicado) */
  statusFallback: Status
  /** Datas no formato YYYY-MM-DD para cálculo dinâmico */
  inscricaoInicioDate: string | null
  inscricaoFimDate: string | null
  /** Todas as etapas datadas, passadas e futuras — a próxima é calculada no cliente */
  cronograma: Etapa[]
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
    id: 'enem-2026',
    nome: 'ENEM',
    edicao: '2026',
    instituicao: 'Inep / Ministério da Educação',
    statusFallback: 'em-andamento',
    inscricaoInicioDate: '2026-05-25',
    inscricaoFimDate:    '2026-06-12',
    cronograma: [
      { data: '2026-11-08', label: '1º dia de prova', prova: true },
      { data: '2026-11-15', label: '2º dia de prova', prova: true },
      { data: '2026-11-18', label: 'Gabarito oficial' },
      { data: '2027-01-18', label: 'Resultado individual (notas)' },
    ],
    taxa: 'R$ 85,00',
    inscricoes: { periodo: '25/05/2026 – 12/06/2026' },
    provas: ['08/11/2026 (1º dia — realizado)', '15/11/2026 (2º dia — realizado)'],
    fases: ['Dois domingos — sem 2ª fase'],
    destaques: [
      'Gabarito oficial: 18/11/2026 (antecipado pelo Inep)',
      'Resultado individual: 18/01/2027, na Página do Participante',
      'A nota do Enem 2026 é usada no Sisu, Prouni e Fies de 2027',
      'Treineiros: data do resultado ainda não divulgada',
    ],
    links: [
      { label: 'Página oficial', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem' },
      { label: 'Página do Participante', url: 'https://enem.inep.gov.br/participante/' },
    ],
    obs: 'A contagem de acertos no gabarito não é a nota: o Enem usa TRI, e a nota só sai no resultado oficial.',
  },
  {
    id: 'enem-2027',
    nome: 'ENEM',
    edicao: '2027',
    instituicao: 'Inep / Ministério da Educação',
    statusFallback: 'aguardando-edital',
    inscricaoInicioDate: null,
    inscricaoFimDate:    null,
    cronograma: [],
    taxa: null,
    inscricoes: null,
    provas: ['Previsão: dois domingos de novembro de 2027'],
    fases: ['Dois domingos — sem 2ª fase'],
    destaques: [
      'Edital ainda não publicado pelo Inep',
      'Previsão (padrão dos últimos anos): pedido de isenção em abril',
      'Previsão: edital em maio e inscrições do fim de maio a junho',
      'Previsão: provas em dois domingos de novembro de 2027',
    ],
    links: [
      { label: 'Página oficial', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem' },
      { label: 'Página do Participante', url: 'https://enem.inep.gov.br/participante/' },
    ],
    obs: 'Todas as datas acima são previsões baseadas nas edições anteriores, não datas oficiais. Em 2026 a taxa foi R$ 85,00. Não existe "inscrição antecipada" do Enem — inscreva-se só pelos canais oficiais, dentro do prazo do edital.',
  },
  {
    id: 'sisu-2027',
    nome: 'SISU',
    edicao: '2027',
    instituicao: 'Ministério da Educação',
    statusFallback: 'aguardando-edital',
    inscricaoInicioDate: null,
    inscricaoFimDate:    null,
    cronograma: [
      { data: '2027-01-18', label: 'Resultado do Enem 2026 (nota usada no Sisu)' },
    ],
    taxa: 'Gratuito',
    inscricoes: null,
    provas: ['Sem prova própria — usa a nota do Enem 2026'],
    fases: ['Inscrição online com a nota do Enem', 'Chamada regular', 'Lista de espera'],
    destaques: [
      'Edital ainda não publicado pelo MEC',
      'Previsão: inscrições em janeiro de 2027, após o resultado do Enem',
      'Em 2026: inscrições de 19 a 23/01 e resultado em 29/01',
      'Vagas em universidades e institutos federais de todo o país',
    ],
    links: [
      { label: 'Portal Acesso Único (MEC)', url: 'https://acessounico.mec.gov.br/sisu' },
    ],
    obs: 'Datas de inscrição são previsão baseada na edição de 2026. O calendário oficial sai no edital do MEC, publicado no Diário Oficial da União.',
  },
  {
    id: 'fuvest',
    nome: 'FUVEST / USP',
    edicao: '2027',
    instituicao: 'Fundação Universitária para o Vestibular',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-08-17',
    inscricaoFimDate:    '2026-10-09',
    cronograma: [
      { data: '2026-11-01', label: '1ª fase', prova: true },
      { data: '2026-11-23', label: 'Convocados para a 2ª fase e locais de prova' },
      { data: '2026-12-06', label: '2ª fase — Português e Redação', prova: true },
      { data: '2026-12-07', label: '2ª fase — disciplinas específicas', prova: true },
      { data: '2026-12-08', label: 'Provas de competências específicas', prova: true },
      { data: '2027-01-26', label: '1ª chamada' },
    ],
    taxa: 'R$ 228,00',
    inscricoes: { periodo: '17/08/2026 – 09/10/2026' },
    provas: ['01/11/2026 (1ª fase — realizada)', '06–07/12/2026 (2ª fase)'],
    fases: ['1ª fase — 80 questões objetivas', '2ª fase — discursiva', 'Habilidades específicas (Música, Artes Cênicas, Artes Visuais)'],
    destaques: [
      'Convocados para a 2ª fase e locais: 23/11/2026, a partir das 12h',
      '2ª fase: 06/12 (Português e Redação) e 07/12/2026 (específicas)',
      'Competências específicas: 08 a 11/12/2026',
      '1ª chamada: 26/01/2027',
    ],
    links: [
      { label: 'Página oficial', url: 'https://www.fuvest.br/vestibular-da-usp/' },
      { label: 'Área do candidato', url: 'https://app.fuvest.br/' },
      { label: 'Cronograma completo', url: 'https://www.fuvest.br/fuvest-2027-fuvest-divulga-cronograma-completo-do-vestibular-2027/' },
      { label: 'Programa do vestibular', url: 'https://www.fuvest.br/wp-content/uploads/fuvest2027-programa-vestibular.pdf' },
      { label: 'Provas anteriores', url: 'https://www.fuvest.br/acervo-vestibular/' },
    ],
  },
  {
    id: 'unicamp',
    nome: 'UNICAMP',
    edicao: '2027',
    instituicao: 'Comvest / Unicamp',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-08-03',
    inscricaoFimDate:    '2026-09-08',
    cronograma: [
      { data: '2026-10-18', label: '1ª fase', prova: true },
      { data: '2026-11-29', label: '2ª fase — 1º dia', prova: true },
      { data: '2026-11-30', label: '2ª fase — 2º dia', prova: true },
      { data: '2026-12-02', label: 'Provas de habilidades específicas', prova: true },
      { data: '2027-01-25', label: '1ª lista de convocados' },
    ],
    taxa: 'R$ 230,00',
    inscricoes: { periodo: '03/08/2026 – 08/09/2026 (prorrogado)' },
    provas: ['18/10/2026 (1ª fase — realizada)', '29–30/11/2026 (2ª fase, às 9h)'],
    fases: ['1ª fase', '2ª fase', 'Habilidades específicas (Música, Artes Cênicas, Artes Visuais, Dança)'],
    destaques: [
      '2ª fase: 29 e 30/11/2026, com início às 9h',
      'Habilidades específicas: 02 a 04/12/2026',
      '1ª lista de convocados: 25/01/2027',
    ],
    links: [
      { label: 'Página oficial', url: 'https://www.comvest.unicamp.br/' },
      { label: 'Vestibular Unicamp 2027', url: 'https://www.comvest.unicamp.br/ingresso-2027/vestibular-2027/' },
    ],
    obs: 'As inscrições, previstas até 31/08, foram prorrogadas até 08/09/2026.',
  },
  {
    id: 'unesp',
    nome: 'UNESP',
    edicao: '2027',
    instituicao: 'Fundação Vunesp / Unesp',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-09-04',
    inscricaoFimDate:    '2026-10-26',
    cronograma: [
      { data: '2026-11-22', label: '1ª fase', prova: true },
      { data: '2026-12-13', label: '2ª fase — 1º dia', prova: true },
      { data: '2026-12-14', label: '2ª fase — 2º dia', prova: true },
      { data: '2027-01-27', label: 'Resultado final e 1ª convocação' },
      { data: '2027-01-28', label: 'Matrícula virtual (até 01/02)' },
    ],
    taxa: 'R$ 225,00 (R$ 56,25 para concluintes do EM público paulista)',
    inscricoes: { periodo: '04/09/2026 – 26/10/2026 (prorrogado)' },
    provas: ['22/11/2026 (1ª fase — 90 questões)', '13–14/12/2026 (2ª fase)'],
    fases: ['1ª fase — 90 questões objetivas', '2ª fase — questões dissertativas e redação'],
    destaques: [
      '5.850 vagas em 137 cursos, em 24 cidades de SP',
      '1ª fase aplicada em 35 cidades',
      'Resultado final e 1ª convocação: 27/01/2027',
      'Unesp-Enem 2027 (usa a nota do Enem): inscrições de 23/11/2026 a 14/01/2027',
    ],
    links: [
      { label: 'Vunesp — Vestibular Unesp 2027', url: 'https://www.vunesp.com.br/VNSP2514' },
      { label: 'Portal Vestibular Unesp', url: 'https://vestibular.unesp.br/' },
      { label: 'Portal Vunesp', url: 'https://www.vunesp.com.br/' },
    ],
    obs: 'Taxa com redução de 50%: R$ 112,50. Matrícula virtual de 28/01 a 01/02/2027.',
  },
  {
    id: 'uerj',
    nome: 'UERJ',
    edicao: '2027',
    instituicao: 'Departamento de Seleção Acadêmica da UERJ',
    statusFallback: 'provas-em-breve',
    // período de inscrição do Exame Discursivo (os dois Exames de Qualificação já passaram)
    inscricaoInicioDate: '2026-09-12',
    inscricaoFimDate:    '2026-10-08',
    cronograma: [
      { data: '2026-06-07', label: '1º Exame de Qualificação', prova: true },
      { data: '2026-09-06', label: '2º Exame de Qualificação', prova: true },
      { data: '2026-11-29', label: 'Exame Discursivo', prova: true },
      { data: '2026-12-18', label: 'Listagem de notas do Exame Discursivo' },
      { data: '2027-01-14', label: 'Resultado final' },
    ],
    taxa: 'R$ 120,00 (Exame Discursivo)',
    inscricoes: { periodo: '12/09/2026 – 08/10/2026 (Exame Discursivo)' },
    provas: ['07/06 e 06/09/2026 (Exames de Qualificação — realizados)', '29/11/2026 (Exame Discursivo)'],
    fases: ['1º Exame de Qualificação', '2º Exame de Qualificação', 'Exame Discursivo (80 pts)'],
    destaques: [
      'Exame Discursivo: 29/11/2026 — redação + duas provas específicas do curso',
      'Listagem de notas: 18/12/2026',
      'Resultado final: 14/01/2027',
      'Obras: "O Cortiço" (2º EQ), "O bem-amado" (Discursivo); redação com "Luanda, Lisboa, Paraíso"',
    ],
    links: [
      { label: 'Site oficial Vestibular UERJ', url: 'https://www.vestibular.uerj.br/' },
      { label: 'Sistemas candidato', url: 'https://sistemas.vestibular.uerj.br/' },
      { label: 'Questões comentadas', url: 'https://www.revista.vestibular.uerj.br/questao/' },
    ],
    obs: 'Só faz o Exame Discursivo quem foi aprovado (acima de 40%) em pelo menos um dos Exames de Qualificação. Resultado do 2º EQ saiu em 12/09/2026.',
  },
  {
    id: 'unb',
    nome: 'UnB',
    edicao: '2027',
    instituicao: 'Cebraspe / Universidade de Brasília',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-08-28',
    inscricaoFimDate:    '2026-09-21',
    cronograma: [
      { data: '2026-11-21', label: '1º dia de prova', prova: true },
      { data: '2026-11-22', label: '2º dia de prova', prova: true },
      { data: '2026-12-16', label: 'Gabaritos oficiais definitivos' },
      { data: '2027-02-12', label: 'Resultado final e 1ª chamada' },
    ],
    taxa: 'R$ 173,00',
    inscricoes: { periodo: '28/08/2026 – 21/09/2026 (prorrogado)' },
    provas: ['21–22/11/2026'],
    fases: ['Provas em dois dias — modelo Cebraspe', 'Redação em Língua Portuguesa'],
    destaques: [
      '1.074 vagas para ingresso no 2º semestre de 2027',
      'Campi Darcy Ribeiro, Ceilândia, Gama e Planaltina',
      'Gabaritos definitivos: 16/12/2026',
      'Resultado final e 1ª chamada: 12/02/2027',
    ],
    links: [
      { label: 'Cebraspe — Vestibular UnB 2027', url: 'https://www.cebraspe.org.br/vestibulares/VESTUNB_27' },
      { label: 'Vestibulares Cebraspe', url: 'https://www.cebraspe.org.br/vestibulares/' },
    ],
    obs: 'Modelo Cebraspe: itens de certo/errado, em que a resposta errada desconta pontos. Pagamento da taxa foi prorrogado até 15/10/2026.',
  },
  {
    id: 'ufg',
    nome: 'UFG',
    edicao: '2027',
    instituicao: 'Instituto Verbena / UFG',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-06-26',
    inscricaoFimDate:    '2026-08-07',
    cronograma: [
      { data: '2026-09-27', label: 'Prova objetiva e redação', prova: true },
      { data: '2026-12-07', label: 'Resultado preliminar do processo seletivo' },
      { data: '2026-12-11', label: 'Resultado final' },
      { data: '2026-12-15', label: '1ª chamada' },
      { data: '2026-12-17', label: 'Envio de documentos da 1ª chamada (até 15/01)' },
    ],
    taxa: 'R$ 130,00',
    inscricoes: { periodo: '26/06/2026 – 07/08/2026' },
    provas: ['27/09/2026 (objetiva + redação — realizada)'],
    fases: ['Fase única — 96 questões objetivas + redação'],
    destaques: [
      'Resultado preliminar: 07/12/2026',
      'Resultado final: 11/12/2026',
      '1ª chamada: 15/12/2026',
      'Envio de documentos: 17/12/2026 a 15/01/2027',
    ],
    links: [
      { label: 'Vestibular UFG 2027', url: 'https://sistemas.institutoverbena.ufg.br/2026/vestibular-ufg/' },
      { label: 'Portal do Candidato', url: 'https://sistemas.institutoverbena.ufg.br/portal/login' },
      { label: 'Edital de abertura', url: 'https://sistemas.institutoverbena.ufg.br/2026/vestibular-ufg/sistema/arquivos/editais/VESTIBULAR_UFG_2027_EDITAL_.pdf' },
    ],
    obs: '2.357 vagas em Goiânia e cidades de GO.',
  },
  {
    id: 'ufpr',
    nome: 'UFPR',
    edicao: '2027',
    instituicao: 'Núcleo de Concursos da UFPR',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-05-18',
    inscricaoFimDate:    '2026-07-20',
    cronograma: [
      { data: '2026-11-01', label: 'Prova objetiva e discursiva', prova: true },
      { data: '2026-11-23', label: 'Gabarito definitivo (18h)' },
      { data: '2026-11-25', label: 'Lista de candidatos com a discursiva corrigida' },
      { data: '2026-12-14', label: 'Notas da prova discursiva' },
      { data: '2027-01-15', label: 'Resultado final (14h)' },
    ],
    taxa: 'R$ 180,00',
    inscricoes: { periodo: '18/05/2026 – 20/07/2026' },
    provas: ['01/11/2026 (objetiva + discursiva — realizada)', '02/11/2026 (Música — realizada)'],
    fases: ['Fase única — 80 questões objetivas + 2 discursivas'],
    destaques: [
      'Gabarito definitivo: 23/11/2026, a partir das 18h',
      'Lista de discursivas corrigidas: 25/11/2026',
      'Notas da discursiva: 14/12/2026',
      'Resultado final: 15/01/2027, a partir das 14h',
    ],
    links: [
      { label: 'Vestibular UFPR 2027', url: 'https://servicos.nc.ufpr.br/PortalNC/Concurso?concurso=PS2027' },
      { label: 'Portal do Candidato', url: 'https://servicos.nc.ufpr.br/PortalNC/Login' },
      { label: 'Núcleo de Concursos', url: 'https://www.nc.ufpr.br/' },
    ],
    obs: 'Primeira edição em fase única. Aplicada em 12 cidades: Curitiba, Londrina, Maringá, Joinville/SC e outras.',
  },
  {
    id: 'ita',
    nome: 'ITA',
    edicao: '2027',
    instituicao: 'Instituto Tecnológico de Aeronáutica',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-06-02',
    inscricaoFimDate:    '2026-07-12',
    cronograma: [
      { data: '2026-09-27', label: '1ª fase', prova: true },
      { data: '2026-10-20', label: '2ª fase — Matemática', prova: true },
      { data: '2026-10-21', label: '2ª fase — Química', prova: true },
      { data: '2026-10-22', label: '2ª fase — Física', prova: true },
      { data: '2026-10-23', label: '2ª fase — Português', prova: true },
      { data: '2026-11-18', label: 'Médias preliminares da 2ª fase' },
      { data: '2026-12-08', label: 'Classificação final e convocação para a 3ª fase' },
      { data: '2027-01-10', label: 'Apresentação para a inspeção de saúde' },
      { data: '2027-01-11', label: 'Inspeção de saúde (até 15/01)' },
      { data: '2027-01-18', label: 'Resultado da inspeção de saúde' },
    ],
    taxa: 'R$ 195,00',
    inscricoes: { periodo: '02/06/2026 – 12/07/2026' },
    provas: ['27/09/2026 (1ª fase — realizada)', '20–23/10/2026 (2ª fase — realizada)'],
    fases: ['1ª fase — exame objetivo', '2ª fase — provas dissertativas por disciplina (80% da média)', '3ª fase — inspeção de saúde'],
    destaques: [
      'Médias preliminares da 2ª fase: 18/11/2026 (recursos até 19/11)',
      'Classificação final e convocação para a 3ª fase: 08/12/2026',
      'Envio de documentos: 08/12/2026 a 07/01/2027',
      'Inspeção de saúde: 11 a 15/01/2027 (apresentação em 10/01)',
    ],
    links: [
      { label: 'Página oficial ITA', url: 'https://www.vestibular.ita.br/' },
      { label: 'Edital ITA 2027', url: 'https://vestibular.ita.br/instrucoes/edital_2027.pdf' },
      { label: 'Provas anteriores', url: 'https://vestibular.ita.br/provas.htm' },
    ],
    obs: 'A média final pesa 20% a 1ª fase e 80% a 2ª fase.',
  },
  {
    id: 'ime',
    nome: 'IME',
    edicao: '2026/2027',
    instituicao: 'Instituto Militar de Engenharia / Exército Brasileiro',
    statusFallback: 'em-breve',
    inscricaoInicioDate: '2026-05-27',
    inscricaoFimDate:    '2026-07-08',
    cronograma: [
      { data: '2026-09-20', label: '1ª fase', prova: true },
      { data: '2026-10-26', label: '2ª fase — Matemática', prova: true },
      { data: '2026-10-27', label: '2ª fase — Física', prova: true },
      { data: '2026-10-28', label: '2ª fase — Química', prova: true },
      { data: '2026-10-29', label: '2ª fase — Português e Inglês', prova: true },
      { data: '2026-12-07', label: 'Lista de aprovados (previsão)' },
      { data: '2027-02-12', label: 'Matrícula (previsão)' },
    ],
    taxa: 'R$ 140,00',
    inscricoes: { periodo: '27/05/2026 – 08/07/2026' },
    provas: ['20/09/2026 (1ª fase — realizada)', '26–29/10/2026 (2ª fase discursiva — realizada)'],
    fases: ['Exame intelectual', 'Inspeção de saúde', 'Exame de aptidão física', 'Avaliação psicológica'],
    destaques: [
      'Lista de aprovados: prevista até 07/12/2026 (lista final até 22/12)',
      'Matrícula: prevista para 12/02/2027',
      '100 vagas: 70 Ativa + 30 Reserva',
    ],
    links: [
      { label: 'Portal de inscrição IME', url: 'https://inscricoes.ime.eb.br/cfg/' },
      { label: 'Portal concursos IME', url: 'https://www.ime.eb.mil.br/component/banners/click/6' },
    ],
    obs: 'Datas de resultado e matrícula vêm de cronogramas de cursinhos — confirme no edital do IME.',
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

type Proxima = { etapa: Etapa; dias: number }

function inicioDoDia(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function diffDias(a: Date, b: Date) {
  return Math.round((inicioDoDia(b).getTime() - inicioDoDia(a).getTime()) / 86400000)
}

/** 'YYYY-MM-DD' → Date local (sem o deslocamento de fuso de `new Date('YYYY-MM-DD')`) */
function paraData(iso: string) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

function formatarData(iso: string) {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

/** "hoje", "amanhã" ou "em X dias" */
function quando(dias: number) {
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  return `em ${dias} dias`
}

/** Próxima etapa ainda por acontecer (inclui a de hoje), ou null se o cronograma acabou. */
function proximaEtapa(v: Vestibular, hoje: Date): Proxima | null {
  const futuras = v.cronograma
    .map(etapa => ({ etapa, dias: diffDias(hoje, paraData(etapa.data)) }))
    .filter(p => p.dias >= 0)
    .sort((a, b) => a.dias - b.dias)
  return futuras[0] ?? null
}

function calcularStatus(v: Vestibular, hoje: Date): StatusInfo {
  const cfg: Record<Status, { label: string; color: string; dot: string }> = {
    'inscricoes-abertas': { label: 'Inscrições abertas',  color: 'bg-green-500/10 text-green-600 border-green-500/30',     dot: 'bg-green-500'   },
    'em-breve':           { label: 'Em breve',             color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',       dot: 'bg-blue-500'    },
    'abrindo-em-breve':   { label: 'Abrindo em breve',    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',     dot: 'bg-amber-500'   },
    'provas-em-breve':    { label: 'Provas em breve',      color: 'bg-brand/10 text-brand border-brand/30',                dot: 'bg-brand'       },
    'em-andamento':       { label: 'Em andamento',         color: 'bg-sky-500/10 text-sky-600 border-sky-500/30',          dot: 'bg-sky-500'     },
    'encerrado':          { label: 'Encerrado',            color: 'bg-zinc-500/10 text-text-muted border-zinc-500/20',     dot: 'bg-zinc-400'    },
    'aguardando-edital':  { label: 'Aguardando edital',   color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', dot: 'bg-purple-500'  },
  }

  function make(s: Status, diasLabel: string | null = null): StatusInfo {
    return { status: s, diasLabel, ...cfg[s] }
  }

  const { inscricaoInicioDate, inscricaoFimDate } = v

  // Sem datas de inscrição (edital não publicado): usa fallback
  if (!inscricaoFimDate) return make(v.statusFallback)

  const fim = paraData(inscricaoFimDate)

  // Inscrições já fecharam: o status vem da próxima etapa do cronograma
  if (diffDias(hoje, fim) < 0) {
    const prox = proximaEtapa(v, hoje)
    if (!prox) return make('encerrado')
    if (prox.etapa.prova) {
      return make('provas-em-breve', prox.dias === 0 ? 'Prova hoje!' : `Prova ${quando(prox.dias)}`)
    }
    return make('em-andamento', `Próxima etapa ${quando(prox.dias)}`)
  }

  const inicio = inscricaoInicioDate ? paraData(inscricaoInicioDate) : null

  // Inscrições ainda não abriram
  if (inicio && diffDias(hoje, inicio) > 0) {
    const d = diffDias(hoje, inicio)
    if (d <= 7) return make('abrindo-em-breve', `Abre ${quando(d)}`)
    return make('em-breve', `Abre em ${d} dias`)
  }

  // Estamos dentro do período de inscrição
  const d = diffDias(hoje, fim)
  if (d === 0) return make('inscricoes-abertas', 'Fecha hoje!')
  return make('inscricoes-abertas', `Fecha ${quando(d)}`)
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

const FILTROS: { id: Status | 'todos'; label: string }[] = [
  { id: 'todos',              label: 'Todos'               },
  { id: 'inscricoes-abertas', label: 'Inscrições abertas'  },
  { id: 'abrindo-em-breve',  label: 'Abrindo em breve'    },
  { id: 'em-breve',          label: 'Em breve'             },
  { id: 'provas-em-breve',   label: 'Provas em breve'      },
  { id: 'em-andamento',      label: 'Em andamento'         },
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

  // Calcula status e próxima etapa de cada vestibular (só no cliente)
  const statusMap: Record<string, StatusInfo> = {}
  const proximaMap: Record<string, Proxima | null> = {}
  if (hoje) {
    for (const v of VESTIBULARES) {
      statusMap[v.id] = calcularStatus(v, hoje)
      proximaMap[v.id] = proximaEtapa(v, hoje)
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
      <main className="flex-1 min-w-0 ml-0 md:ml-20 px-4 md:px-10 py-6 md:py-10 pb-24 md:pb-10">
        <div className="mb-6">
          <h1 className="text-text text-2xl font-bold tracking-tight mb-1">Vestibulares</h1>
          <p className="text-text-muted text-sm">Datas, inscrições e links oficiais — atualizado em 17/11/2026</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl">
          {lista.map(v => {
            const st = hoje ? statusMap[v.id] : null
            const prox = hoje ? proximaMap[v.id] : null
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

                  {/* Próxima etapa (calculada a partir do cronograma) */}
                  {prox && (
                    <div className="flex items-start gap-2 bg-brand/5 border border-brand/15 rounded-xl px-3 py-2.5 mb-4">
                      <ArrowRight size={13} className="text-brand flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-text-faint text-[10px] uppercase tracking-widest font-semibold">Próxima etapa</p>
                        <p className="text-text text-sm font-medium leading-snug">{prox.etapa.label}</p>
                        <p className="text-text-muted text-xs">
                          {formatarData(prox.etapa.data)} · {quando(prox.dias)}
                        </p>
                      </div>
                    </div>
                  )}

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
          Fontes: sites oficiais de cada instituição (Inep, MEC, Fuvest, Comvest, Vunesp, UERJ, Cebraspe/UnB, Instituto Verbena/UFG, NC-UFPR, ITA, IME) e imprensa especializada. Atualizado em 17/11/2026.
        </p>
      </main>
    </div>
  )
}
