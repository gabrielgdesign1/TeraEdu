'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, Sun, Moon, Settings, Sparkles, BookOpen,
  ChevronRight, ChevronDown, CheckCircle2, XCircle, RotateCcw,
  Trophy, Target, GraduationCap, Timer
} from 'lucide-react'
import { useNome } from '@/hooks/useNome'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Aba = 'ia' | 'banco'

type Questao = {
  id: number
  enunciado: string
  alternativas: { letra: string; texto: string }[]
  resposta: string
  explicacao: string
}

type EstadoQuestao = 'pendente' | 'respondida' | 'revisada'

// ─── Dados reais dos vestibulares ────────────────────────────────────────────

const VESTIBULARES = ['ENEM', 'FUVEST', 'UNICAMP', 'UNESP', 'UERJ', 'UnB', 'UFG', 'UFPR', 'ITA', 'IME']

const MATERIAS: Record<string, string[]> = {
  ENEM:   ['Português', 'Literatura', 'Artes', 'Educação Física', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Filosofia', 'Sociologia'],
  FUVEST: ['Português', 'Literatura', 'Artes', 'Educação Física', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Filosofia', 'Sociologia'],
  UNICAMP:['Português', 'Literatura', 'Matemática', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Biologia', 'Física', 'Química'],
  UNESP:  ['Português', 'Literatura', 'Artes', 'Educação Física', 'Matemática', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Biologia', 'Física', 'Química'],
  UERJ:   ['Português', 'Literatura', 'Matemática', 'História', 'Geografia', 'Biologia', 'Física', 'Química'],
  UnB:    ['Português', 'Literatura', 'Artes', 'Matemática', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Biologia', 'Física', 'Química'],
  UFG:    ['Português', 'Literatura', 'Artes', 'Educação Física', 'Matemática', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Biologia', 'Física', 'Química'],
  UFPR:   ['Português', 'Literatura Brasileira', 'Matemática', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Biologia', 'Física', 'Química'],
  ITA:    ['Português', 'Matemática', 'Física', 'Química'],
  IME:    ['Português', 'Matemática', 'Física', 'Química'],
}

// Conteúdos por vestibular > matéria
const CONTEUDOS: Record<string, Record<string, string[]>> = {
  ENEM: {
    'Português':        ['Interpretação e compreensão de textos', 'Gêneros textuais', 'Argumentação e efeitos de sentido', 'Variação linguística e norma padrão'],
    'Literatura':       ['Interpretação de textos literários', 'Gêneros literários e figuras de linguagem', 'Literatura brasileira e identidade nacional', 'Relação entre literatura, sociedade e contexto histórico'],
    'Artes':            ['Leitura e interpretação de obras de arte', 'Artes visuais, música, teatro e dança', 'Arte brasileira e cultura popular', 'Arte, identidade e diversidade cultural'],
    'Educação Física':  ['Corpo, cultura e identidade', 'Saúde, atividade física e qualidade de vida', 'Esporte e sociedade', 'Lazer, inclusão e diversidade nas práticas corporais'],
    'Matemática':       ['Razão, proporção, porcentagem e juros', 'Funções e gráficos', 'Geometria plana, espacial e trigonometria', 'Estatística, probabilidade e análise combinatória'],
    'Física':           ['Cinemática, dinâmica e leis de Newton', 'Trabalho, energia e potência', 'Eletricidade e circuitos elétricos', 'Ondulatória, óptica e termologia'],
    'Química':          ['Estequiometria e cálculo químico', 'Soluções, concentração e equilíbrio químico', 'Química orgânica', 'Termoquímica, eletroquímica e química ambiental'],
    'Biologia':         ['Ecologia', 'Genética e biotecnologia', 'Citologia e bioquímica celular', 'Fisiologia humana e evolução'],
    'História':         ['Brasil Colônia, escravidão e sociedade colonial', 'Brasil Império e formação do Estado brasileiro', 'Brasil República, ditadura militar e redemocratização', 'Revoluções, guerras mundiais, totalitarismos e Guerra Fria'],
    'Geografia':        ['Cartografia e leitura de mapas', 'Geografia física, clima, relevo e meio ambiente', 'Urbanização, industrialização e globalização', 'Agropecuária, população, migrações e geopolítica'],
    'Filosofia':        ['Ética e moral', 'Política, poder e cidadania', 'Conhecimento, verdade e ciência', 'Filosofia antiga, moderna e contemporânea'],
    'Sociologia':       ['Cultura, identidade e diversidade', 'Trabalho, classes sociais e desigualdade', 'Estado, democracia e instituições sociais', 'Movimentos sociais e globalização'],
  },
  FUVEST: {
    'Português':        ['Interpretação de textos verbais e não verbais', 'Gramática aplicada ao texto', 'Argumentação, coesão e coerência', 'Variação linguística e norma culta'],
    'Literatura':       ['Obras literárias obrigatórias', 'Escolas literárias brasileiras e portuguesas', 'Análise de poesia, prosa e teatro', 'Literatura, sociedade e contexto histórico'],
    'Artes':            ['Leitura de imagens e obras artísticas', 'Arte brasileira e movimentos artísticos', 'Arte moderna e contemporânea', 'Arte, cultura e sociedade'],
    'Educação Física':  ['Corpo, cultura e práticas corporais', 'Saúde, esporte e sociedade', 'Lazer, mídia e padrões corporais', 'Inclusão e diversidade no esporte'],
    'Matemática':       ['Funções, equações e gráficos', 'Geometria plana, espacial e analítica', 'Trigonometria', 'Probabilidade, combinatória e estatística'],
    'Física':           ['Mecânica e leis de Newton', 'Eletricidade e magnetismo', 'Termologia e termodinâmica', 'Ondas, óptica e fenômenos modernos'],
    'Química':          ['Estrutura atômica, tabela periódica e ligações', 'Estequiometria, soluções e gases', 'Equilíbrio, termoquímica e eletroquímica', 'Química orgânica'],
    'Biologia':         ['Citologia, bioquímica e metabolismo', 'Genética, evolução e biotecnologia', 'Ecologia e meio ambiente', 'Fisiologia animal, vegetal e saúde humana'],
    'História':         ['História do Brasil colonial, imperial e republicano', 'História antiga, medieval e moderna', 'Revoluções, liberalismo, socialismo e capitalismo', 'Guerras mundiais, Guerra Fria e mundo contemporâneo'],
    'Geografia':        ['Cartografia, geologia, clima e relevo', 'Urbanização, redes e industrialização', 'Espaço agrário e questão ambiental', 'População, migrações e geopolítica mundial'],
    'Filosofia':        ['Filosofia antiga e clássica', 'Ética, política e justiça', 'Racionalismo, empirismo e conhecimento', 'Filosofia contemporânea e crítica social'],
    'Sociologia':       ['Cultura, ideologia e identidade', 'Trabalho, capitalismo e desigualdade', 'Estado, poder e democracia', 'Movimentos sociais e direitos humanos'],
  },
  UNICAMP: {
    'Português':  ['Leitura e interpretação de textos', 'Gêneros discursivos e linguagem em uso', 'Argumentação e efeitos de sentido', 'Gramática aplicada, coesão e coerência'],
    'Literatura': ['Interpretação de textos literários', 'Gêneros literários e recursos expressivos', 'Literatura, história e sociedade'],
    'Matemática': ['Funções, gráficos e equações', 'Geometria plana, espacial e analítica', 'Trigonometria', 'Probabilidade, combinatória e estatística'],
    'História':   ['História do Brasil colonial, imperial e republicano', 'Escravidão, cidadania e relações sociais', 'Revoluções modernas e mundo contemporâneo', 'Guerras, ditaduras e processos políticos'],
    'Geografia':  ['Cartografia e representação do espaço', 'Clima, relevo, vegetação e meio ambiente', 'Urbanização, industrialização e redes', 'População, agricultura e geopolítica'],
    'Filosofia':  ['Ética e política', 'Conhecimento, razão e ciência', 'Filosofia antiga e moderna', 'Filosofia contemporânea e sociedade'],
    'Sociologia': ['Cultura, identidade e diversidade', 'Trabalho, capitalismo e desigualdade', 'Estado, democracia e cidadania', 'Movimentos sociais e globalização'],
    'Biologia':   ['Ecologia e evolução', 'Genética e biotecnologia', 'Citologia e metabolismo', 'Fisiologia humana, vegetal e saúde'],
    'Física':     ['Mecânica e energia', 'Eletricidade e magnetismo', 'Termologia e termodinâmica', 'Ondas e óptica'],
    'Química':    ['Estequiometria e soluções', 'Estrutura da matéria e ligações químicas', 'Equilíbrio, cinética e termoquímica', 'Química orgânica e ambiental'],
  },
  UNESP: {
    'Português':        ['Interpretação de textos', 'Gêneros textuais e discursivos', 'Gramática aplicada ao texto', 'Argumentação, coesão e coerência'],
    'Literatura':       ['Literatura brasileira e portuguesa', 'Escolas literárias e contexto histórico', 'Análise de gêneros literários', 'Figuras de linguagem e intertextualidade'],
    'Artes':            ['Leitura de obras artísticas', 'Arte brasileira e cultura popular', 'Vanguardas, modernismo e arte contemporânea', 'Arte, mídia e sociedade'],
    'Educação Física':  ['Corpo, movimento e cultura', 'Esporte, saúde e qualidade de vida', 'Jogos, lutas, danças e práticas corporais', 'Padrões corporais, mídia e inclusão'],
    'Matemática':       ['Funções, equações e gráficos', 'Geometria e trigonometria', 'Estatística e probabilidade', 'Razão, proporção, porcentagem e matemática financeira'],
    'História':         ['Brasil Colônia, Império e República', 'Escravidão, cidadania e movimentos sociais', 'Revoluções e formação do mundo moderno', 'Guerras mundiais, Guerra Fria e mundo atual'],
    'Geografia':        ['Cartografia, clima, relevo e vegetação', 'Urbanização e industrialização', 'Agropecuária, meio ambiente e sustentabilidade', 'População, migrações e geopolítica'],
    'Filosofia':        ['Ética e moral', 'Política e cidadania', 'Conhecimento e ciência', 'Filosofia antiga, moderna e contemporânea'],
    'Sociologia':       ['Cultura e identidade', 'Trabalho e desigualdade social', 'Estado, democracia e poder', 'Movimentos sociais e globalização'],
    'Biologia':         ['Ecologia', 'Genética e evolução', 'Citologia e bioquímica', 'Fisiologia humana e botânica'],
    'Física':           ['Mecânica', 'Eletricidade e magnetismo', 'Termologia', 'Ondas e óptica'],
    'Química':          ['Estequiometria, soluções e gases', 'Química orgânica', 'Equilíbrio, cinética e termoquímica', 'Eletroquímica e química ambiental'],
  },
  UERJ: {
    'Português':  ['Interpretação de textos', 'Construção de sentido e inferência', 'Coesão, coerência e argumentação', 'Gramática aplicada ao texto'],
    'Literatura': ['Leitura de textos literários', 'Gêneros literários', 'Recursos expressivos e figuras de linguagem', 'Literatura e contexto social'],
    'Matemática': ['Funções e gráficos', 'Geometria e trigonometria', 'Probabilidade e estatística', 'Porcentagem, proporção e matemática financeira'],
    'História':   ['História do Brasil e formação social brasileira', 'Escravidão, cidadania e relações de poder', 'Revoluções e mundo moderno', 'Guerras, ditaduras e mundo contemporâneo'],
    'Geografia':  ['Cartografia e análise espacial', 'Natureza, clima, relevo e meio ambiente', 'Urbanização, indústria e redes', 'População, economia e geopolítica'],
    'Biologia':   ['Ecologia e meio ambiente', 'Genética e biotecnologia', 'Citologia e metabolismo', 'Fisiologia humana e saúde'],
    'Física':     ['Mecânica', 'Energia e fenômenos térmicos', 'Eletricidade', 'Ondas e óptica'],
    'Química':    ['Estequiometria e soluções', 'Química orgânica', 'Equilíbrio químico e termoquímica', 'Eletroquímica e química ambiental'],
  },
  UnB: {
    'Português':  ['Interpretação textual', 'Gêneros textuais e discursivos', 'Argumentação, coesão e coerência', 'Gramática, norma padrão e variação linguística'],
    'Literatura': ['Literatura brasileira e portuguesa', 'Gêneros literários e recursos expressivos', 'Obras, autores e escolas literárias', 'Literatura, cultura e sociedade'],
    'Artes':      ['Leitura e análise de obras de arte', 'Arte brasileira e diversidade cultural', 'Música, teatro, dança e artes visuais', 'Arte contemporânea e crítica social'],
    'Matemática': ['Funções, equações e gráficos', 'Geometria e trigonometria', 'Probabilidade, combinatória e estatística', 'Razão, proporção, porcentagem e matemática financeira'],
    'História':   ['História do Brasil colonial, imperial e republicano', 'Escravidão, cidadania e movimentos sociais', 'Revoluções, capitalismo e mundo moderno', 'Guerras, Guerra Fria e mundo contemporâneo'],
    'Geografia':  ['Cartografia e análise territorial', 'Geografia física e meio ambiente', 'Urbanização, industrialização e redes', 'População, agropecuária e geopolítica'],
    'Filosofia':  ['Ética e política', 'Conhecimento, ciência e verdade', 'Filosofia antiga e moderna', 'Filosofia contemporânea e direitos humanos'],
    'Sociologia': ['Cultura, identidade e diversidade', 'Trabalho, capitalismo e desigualdade', 'Estado, poder e democracia', 'Movimentos sociais e globalização'],
    'Biologia':   ['Ecologia', 'Genética, evolução e biotecnologia', 'Citologia e metabolismo', 'Fisiologia humana, saúde e botânica'],
    'Física':     ['Mecânica e energia', 'Eletricidade e magnetismo', 'Termologia', 'Ondas e óptica'],
    'Química':    ['Estequiometria e soluções', 'Estrutura da matéria e ligações químicas', 'Equilíbrio, cinética e termoquímica', 'Orgânica, eletroquímica e química ambiental'],
  },
  UFG: {
    'Português':        ['Interpretação e compreensão textual', 'Gêneros textuais', 'Argumentação e efeitos de sentido', 'Variação linguística e gramática aplicada'],
    'Literatura':       ['Interpretação de textos literários', 'Literatura brasileira e contexto histórico', 'Gêneros literários e figuras de linguagem', 'Relação entre literatura e sociedade'],
    'Artes':            ['Leitura de obras de arte', 'Arte brasileira e cultura popular', 'Linguagens artísticas: música, teatro, dança e artes visuais', 'Arte, identidade e diversidade'],
    'Educação Física':  ['Corpo, cultura e práticas corporais', 'Esporte e sociedade', 'Saúde e qualidade de vida', 'Lazer, inclusão e diversidade'],
    'Matemática':       ['Razão, proporção, porcentagem e juros', 'Funções e gráficos', 'Geometria e trigonometria', 'Estatística, probabilidade e combinatória'],
    'História':         ['História do Brasil', 'Escravidão, cidadania e movimentos sociais', 'Revoluções e mundo moderno', 'Guerras, ditaduras e mundo contemporâneo'],
    'Geografia':        ['Cartografia e geografia física', 'Urbanização e industrialização', 'Agropecuária e meio ambiente', 'População, migrações e geopolítica'],
    'Filosofia':        ['Ética e moral', 'Política e cidadania', 'Conhecimento e ciência', 'Filosofia antiga, moderna e contemporânea'],
    'Sociologia':       ['Cultura e identidade', 'Trabalho e desigualdade', 'Estado, democracia e instituições sociais', 'Movimentos sociais e globalização'],
    'Biologia':         ['Ecologia', 'Genética e biotecnologia', 'Citologia e bioquímica', 'Fisiologia humana e evolução'],
    'Física':           ['Mecânica', 'Energia, trabalho e potência', 'Eletricidade', 'Ondas, óptica e termologia'],
    'Química':          ['Estequiometria e soluções', 'Química orgânica', 'Equilíbrio, cinética e termoquímica', 'Eletroquímica e química ambiental'],
  },
  UFPR: {
    'Português':             ['Interpretação de textos', 'Gêneros textuais e discursivos', 'Gramática aplicada ao texto', 'Argumentação, coesão e coerência'],
    'Literatura Brasileira': ['Obras literárias indicadas', 'Escolas literárias brasileiras', 'Análise de poesia, prosa e teatro', 'Literatura, sociedade e contexto histórico'],
    'Matemática':            ['Funções, equações e gráficos', 'Geometria plana, espacial e analítica', 'Trigonometria', 'Probabilidade, combinatória e estatística'],
    'História':              ['Brasil Colônia, Império e República', 'Escravidão, cidadania e relações sociais', 'Revoluções modernas e mundo contemporâneo', 'Guerras, ditaduras e Guerra Fria'],
    'Geografia':             ['Cartografia e geografia física', 'Urbanização, indústria e redes', 'Espaço agrário e meio ambiente', 'População, migrações e geopolítica'],
    'Filosofia':             ['Ética e política', 'Teoria do conhecimento', 'Filosofia antiga e moderna', 'Filosofia contemporânea e sociedade'],
    'Sociologia':            ['Cultura, identidade e diversidade', 'Trabalho, capitalismo e desigualdade', 'Estado, democracia e poder', 'Movimentos sociais e globalização'],
    'Biologia':              ['Ecologia e evolução', 'Genética e biotecnologia', 'Citologia e metabolismo', 'Fisiologia humana, botânica e zoologia'],
    'Física':                ['Mecânica', 'Eletricidade e magnetismo', 'Termologia e termodinâmica', 'Ondas e óptica'],
    'Química':               ['Estrutura atômica, tabela periódica e ligações', 'Estequiometria, soluções e gases', 'Equilíbrio, termoquímica e eletroquímica', 'Química orgânica e ambiental'],
  },
  ITA: {
    'Português':  ['Interpretação de textos', 'Gramática e norma padrão', 'Coesão, coerência e semântica', 'Literatura e análise textual'],
    'Matemática': ['Funções, equações e inequações', 'Geometria plana, espacial e analítica', 'Trigonometria e números complexos', 'Combinatória, probabilidade e sequências'],
    'Física':     ['Mecânica avançada', 'Eletricidade e magnetismo', 'Termodinâmica', 'Ondulatória e óptica'],
    'Química':    ['Estrutura atômica, tabela periódica e ligações', 'Estequiometria, soluções e gases', 'Equilíbrio, cinética, termoquímica e eletroquímica', 'Química orgânica'],
  },
  IME: {
    'Português':  ['Interpretação de textos', 'Gramática e norma padrão', 'Coesão, coerência e análise sintática', 'Semântica, figuras de linguagem e literatura'],
    'Matemática': ['Álgebra, funções e equações', 'Geometria plana, espacial e analítica', 'Trigonometria e números complexos', 'Combinatória, probabilidade e sequências'],
    'Física':     ['Mecânica', 'Eletricidade e magnetismo', 'Termodinâmica', 'Ondas e óptica'],
    'Química':    ['Estrutura da matéria e ligações químicas', 'Estequiometria, soluções e gases', 'Equilíbrio, cinética, termoquímica e eletroquímica', 'Química orgânica'],
  },
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Questoes() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { primeiroNome, nome } = useNome()

  const [aba, setAba] = useState<Aba>('banco')

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg border-r border-border/60 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={26} height={26} />
          <span className="text-text font-bold tracking-tight">TeraEdu</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 flex-1 pt-1">
          <SidebarLink href="/dashboard"            icon={LayoutDashboard} label="Início" />
          <SidebarLink href="/dashboard/questoes"   icon={FileQuestion}    label="Questões"   active />
          <SidebarLink href="/dashboard/flashcards" icon={Layers}          label="Flashcards" />
          <SidebarLink href="/dashboard/resumos"    icon={FileText}        label="Resumos" />
          <SidebarLink href="/dashboard/tutora"     icon={MessageCircle}   label="IA Tutora" />
          <div className="px-3 mt-8 mb-2">
            <p className="text-text-faint text-[10px] uppercase tracking-widest font-semibold">Progresso</p>
          </div>
          <SidebarLink href="/dashboard/desempenho" icon={BarChart3}  label="Desempenho" />
          <SidebarLink href="/dashboard/plano"      icon={Calendar}   label="Plano de Estudos" />
        </nav>
        <div className="px-3 py-4 border-t border-border/60">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-bg-hover text-text-muted hover:text-text text-sm transition-colors mb-1"
          >
            {mounted && theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{mounted && theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {primeiroNome ? primeiroNome[0].toUpperCase() : 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-semibold truncate">{nome ?? 'Gabriel'}</p>
            </div>
            <Settings size={13} className="text-text-faint" />
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-10 pt-8 pb-6 border-b border-border">
          <h1 className="text-text text-2xl font-bold tracking-tight mb-1">Questões</h1>
          <p className="text-text-muted text-sm">Pratique com questões do ENEM e vestibulares ou gere com IA</p>

          {/* Abas */}
          <div className="flex gap-1 mt-6 bg-bg-card border border-border rounded-xl p-1 w-fit">
            <button
              onClick={() => setAba('banco')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                aba === 'banco'
                  ? 'bg-bg shadow-sm text-text border border-border'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <BookOpen size={15} />
              Banco de Questões
            </button>
            <button
              onClick={() => setAba('ia')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                aba === 'ia'
                  ? 'bg-bg shadow-sm text-text border border-border'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Sparkles size={15} />
              Gerar com IA
            </button>
          </div>
        </div>

        {/* Conteúdo da aba */}
        <div className="flex-1 px-10 py-8">
          {aba === 'banco' ? <BancoQuestoes /> : <GerarComIA />}
        </div>
      </main>
    </div>
  )
}

// ─── Aba: Banco de Questões ───────────────────────────────────────────────────

const ANOS_ENEM = ['2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012','2011','2010','2009']

const DISCIPLINAS_ENEM = [
  { value: 'ciencias-humanas',  label: 'Ciências Humanas'     },
  { value: 'ciencias-natureza', label: 'Ciências da Natureza'  },
  { value: 'linguagens',        label: 'Linguagens e Códigos'  },
  { value: 'matematica',        label: 'Matemática'            },
]

type ApiQuestao = {
  index: number
  year: number
  context?: string
  alternativesIntroduction?: string
  alternatives: { letter: string; text: string }[]
  correctAlternative: string
}

const VESTIBULARES_BANCO = [
  { id: 'ENEM',    disponivel: true  },
  { id: 'FUVEST',  disponivel: true  },
  { id: 'UNICAMP', disponivel: true  },
  { id: 'UNESP',   disponivel: false },
  { id: 'UERJ',    disponivel: false },
  { id: 'UnB',     disponivel: false },
  { id: 'UFG',     disponivel: false },
  { id: 'UFPR',    disponivel: false },
  { id: 'ITA',     disponivel: true  },
  { id: 'IME',     disponivel: true  },
]

// Matérias reais encontradas no dataset por vestibular
const MATERIAS_VESTIBULAR: Record<string, string[]> = {
  FUVEST:  ['Biologia','Filosofia','Física','Geografia','História','Matemática','Português','Química','Sociologia'],
  UNICAMP: ['Biologia','Filosofia','Física','Geografia','História','Matemática','Português','Química','Sociologia'],
  ITA:     ['Física','Matemática','Português','Química'],
  IME:     ['Física','Matemática','Química'],
}

type DbQuestao = {
  id: number
  question_id: string
  exam_type: string
  exam_name: string
  exam_year: number | null
  subject: string | null
  question_statement: string
  correct_answer: string
  alternative_a: string | null
  alternative_b: string | null
  alternative_c: string | null
  alternative_d: string | null
  alternative_e: string | null
}

function BancoQuestoes() {
  const [vestibular, setVestibular] = useState('')
  const [materia,    setMateria   ] = useState('')   // ENEM: valor da DISCIPLINAS_ENEM; outros: 'Matemática' etc.
  const [quantidade, setQuantidade] = useState(10)
  const [loading,    setLoading   ] = useState(false)
  const [erro,       setErro      ] = useState('')
  const [aviso,      setAviso     ] = useState('')
  const [questoes,   setQuestoes  ] = useState<Questao[]>([])
  const [iniciado,   setIniciado  ] = useState(false)

  function escolherVestibular(v: string) {
    setVestibular(v); setMateria(''); setErro(''); setAviso('')
  }

  // ── ENEM: busca pela api.enem.dev ──────────────────────────────────────────
  async function buscarEnem() {
    setLoading(true); setErro(''); setAviso('')
    try {
      const numAnos = quantidade <= 10 ? 1 : quantidade <= 25 ? 2 : 3
      const anosEmbaralhados = [...ANOS_ENEM].sort(() => Math.random() - 0.5).slice(0, numAnos)
      const porAno = Math.ceil(quantidade / numAnos)

      const resultados = await Promise.all(
        anosEmbaralhados.map(async (ano) => {
          const offset = Math.floor(Math.random() * 30)
          const res = await fetch(`/api/questoes/banco?year=${ano}&discipline=${materia}&limit=${porAno}&offset=${offset}`)
          if (!res.ok) return [] as ApiQuestao[]
          const data = await res.json()
          return (data.questions ?? []) as ApiQuestao[]
        })
      )

      const todas = resultados.flat().sort(() => Math.random() - 0.5).slice(0, quantidade)
      if (!todas.length) { setErro('Não foi possível carregar as questões. Tente novamente.'); setLoading(false); return }

      const mapped: Questao[] = todas.map((q, i) => ({
        id: i + 1,
        enunciado: [q.context, q.alternativesIntroduction].filter(Boolean).join('\n\n'),
        alternativas: q.alternatives.map(a => ({ letra: a.letter, texto: a.text })),
        resposta: q.correctAlternative,
        explicacao: '',
      }))
      setQuestoes(mapped); setIniciado(true)
    } catch { setErro('Erro de conexão. Verifique sua internet e tente novamente.') }
    setLoading(false)
  }

  // ── Outros vestibulares: busca no banco interno ────────────────────────────
  async function buscarVestibular() {
    setLoading(true); setErro(''); setAviso('')
    try {
      const params = new URLSearchParams({
        vestibular: vestibular.toLowerCase(),
        subject: materia,
        quantidade: String(quantidade),
      })
      const res = await fetch(`/api/questoes/vestibular?${params}`)
      const data = await res.json()

      if (!res.ok || !data.questoes?.length) {
        setErro('Não foi possível carregar as questões. Tente outra matéria.')
        setLoading(false); return
      }

      if (data.total < quantidade) {
        setAviso(`Encontradas ${data.total} questões disponíveis para esse filtro.`)
      }

      const mapped: Questao[] = (data.questoes as DbQuestao[]).map((q, i) => ({
        id: i + 1,
        enunciado: q.question_statement,
        alternativas: [
          { letra: 'A', texto: q.alternative_a ?? '' },
          { letra: 'B', texto: q.alternative_b ?? '' },
          { letra: 'C', texto: q.alternative_c ?? '' },
          { letra: 'D', texto: q.alternative_d ?? '' },
          { letra: 'E', texto: q.alternative_e ?? '' },
        ].filter(a => a.texto),
        resposta: q.correct_answer.toUpperCase(),
        explicacao: '',
      }))
      setQuestoes(mapped); setIniciado(true)
    } catch { setErro('Erro de conexão. Verifique sua internet e tente novamente.') }
    setLoading(false)
  }

  function buscar() {
    if (!materia || loading) return
    if (vestibular === 'ENEM') buscarEnem()
    else buscarVestibular()
  }

  // ── Sessão ativa ──────────────────────────────────────────────────────────
  if (iniciado && questoes.length > 0) {
    const materiaLabel = vestibular === 'ENEM'
      ? (DISCIPLINAS_ENEM.find(d => d.value === materia)?.label ?? materia)
      : materia
    return (
      <SessaoQuestoes
        vestibular={vestibular}
        materia={materiaLabel}
        conteudo={vestibular === 'ENEM' ? 'Questões de múltiplos anos' : `${vestibular} — múltiplos anos`}
        questoes={questoes}
        onVoltar={() => { setIniciado(false); setQuestoes([]) }}
      />
    )
  }

  // ── Seletores ──────────────────────────────────────────────────────────────
  const materiasDisponiveis = vestibular === 'ENEM' ? null : (MATERIAS_VESTIBULAR[vestibular] ?? [])
  const prontoParaBuscar   = !!materia

  return (
    <div className="max-w-lg">
      <h2 className="text-text font-semibold text-lg mb-1">Banco de Questões</h2>
      <p className="text-text-muted text-sm mb-8">Escolha o vestibular e pratique com questões reais.</p>

      {/* Passo 1 — Vestibular */}
      <div className="mb-7">
        <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Vestibular</label>
        <div className="flex flex-wrap gap-2">
          {VESTIBULARES_BANCO.map(v => (
            <button
              key={v.id}
              onClick={() => v.disponivel && escolherVestibular(v.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                vestibular === v.id
                  ? 'bg-brand text-white border-brand'
                  : v.disponivel
                  ? 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                  : 'bg-bg-card border-border text-text-faint cursor-not-allowed opacity-40'
              }`}
            >
              {v.id}
              {!v.disponivel && <span className="ml-1.5 text-[10px] opacity-70">em breve</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Passo 2 — Área / Matéria */}
      {vestibular === 'ENEM' && (
        <div className="mb-6">
          <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Área de Conhecimento</label>
          <div className="grid grid-cols-2 gap-2">
            {DISCIPLINAS_ENEM.map(d => (
              <button
                key={d.value}
                onClick={() => setMateria(d.value)}
                className={`py-3 px-4 rounded-full text-sm font-medium border transition-all ${
                  materia === d.value ? 'bg-brand text-white border-brand' : 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {materiasDisponiveis && materiasDisponiveis.length > 0 && (
        <div className="mb-6">
          <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Matéria</label>
          <div className="flex flex-wrap gap-2">
            {materiasDisponiveis.map(m => (
              <button
                key={m}
                onClick={() => setMateria(m)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  materia === m ? 'bg-brand text-white border-brand' : 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Passo 3 — Quantidade */}
      {vestibular && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-text-muted text-xs font-medium uppercase tracking-wider">Quantidade de questões</label>
            <span className="text-brand font-bold text-xl tabular-nums">{quantidade}</span>
          </div>
          <input
            type="range" min={5} max={50} step={5} value={quantidade}
            onChange={e => setQuantidade(Number(e.target.value))}
            style={{ accentColor: 'var(--brand)' }}
            className="w-full h-1.5 cursor-pointer"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-text-faint text-xs">5</span>
            <span className="text-text-faint text-xs">50</span>
          </div>
        </div>
      )}

      {aviso && <p className="text-amber-500 text-sm mb-3">{aviso}</p>}
      {erro   && <p className="text-red-500  text-sm mb-4">{erro}</p>}

      {vestibular && (
        <button
          onClick={buscar}
          disabled={!prontoParaBuscar || loading}
          className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full transition-colors text-sm"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Buscando questões...</>
            : <><BookOpen size={15} /> Começar com {quantidade} questões</>
          }
        </button>
      )}

      {vestibular && !materia && (
        <p className="text-text-faint text-xs text-center mt-4">
          {vestibular === 'ENEM' ? 'Selecione uma área de conhecimento' : 'Selecione uma matéria'} para continuar
        </p>
      )}

      {!vestibular && (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center">
          <GraduationCap size={28} className="text-text-faint mx-auto mb-3" />
          <p className="text-text-muted text-sm">Selecione um vestibular acima para começar</p>
        </div>
      )}
    </div>
  )
}

// ─── Sessão de questões ───────────────────────────────────────────────────────

function SessaoQuestoes({
  vestibular, materia, conteudo, questoes, onVoltar
}: {
  vestibular: string; materia: string; conteudo: string; questoes: Questao[]; onVoltar: () => void
}) {
  const quantidade = questoes.length

  const [atual,       setAtual      ] = useState(0)
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [revelada,    setRevelada   ] = useState(false)
  const [respostas,   setRespostas  ] = useState<Record<number, string>>({})
  const [finalizado,  setFinalizado ] = useState(false)
  const [tempoAtual,  setTempoAtual ] = useState(0)
  const [tempos,      setTempos     ] = useState<number[]>([])

  const questao   = questoes[atual]
  const acertos   = Object.entries(respostas).filter(([i, r]) => r === questoes[Number(i)].resposta).length
  const progresso = (atual / quantidade) * 100

  // Cronômetro: reinicia a cada questão, para quando revelada
  useEffect(() => { setTempoAtual(0) }, [atual])
  useEffect(() => {
    if (revelada) return
    const id = setInterval(() => setTempoAtual(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [atual, revelada])

  function fmt(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  }

  function responder(letra: string) {
    if (revelada) return
    setSelecionada(letra)
  }

  function confirmar() {
    if (!selecionada) return
    setTempos(prev => [...prev, tempoAtual])
    setRespostas(prev => ({ ...prev, [atual]: selecionada }))
    setRevelada(true)
  }

  function proxima() {
    if (atual + 1 >= quantidade) {
      setFinalizado(true)
    } else {
      setAtual(atual + 1)
      setSelecionada(null)
      setRevelada(false)
    }
  }

  function reiniciar() {
    setAtual(0); setSelecionada(null); setRevelada(false)
    setRespostas({}); setFinalizado(false)
    setTempos([]); setTempoAtual(0)
  }

  // Tela de resultado final
  if (finalizado) {
    const pct = Math.round((acertos / quantidade) * 100)
    const tempoTotal = tempos.reduce((a, b) => a + b, 0)
    const tempoMedio = tempos.length ? Math.round(tempoTotal / tempos.length) : 0
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-20 h-20 bg-brand-soft rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trophy size={36} className="text-brand" />
        </div>
        <h2 className="text-text text-2xl font-bold mb-2">Sessão concluída!</h2>
        <p className="text-text-muted text-sm mb-8">{vestibular} · {materia} · {conteudo}</p>

        <div className="bg-bg-card border border-border rounded-2xl p-6 mb-4">
          <p className="text-[4rem] font-black text-brand leading-none">{pct}%</p>
          <p className="text-text-muted text-sm mt-2">{acertos} de {quantidade} questões certas</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-center gap-1.5 text-text-faint mb-1">
              <Timer size={13} />
              <span className="text-xs uppercase tracking-wider">Tempo total</span>
            </div>
            <p className="text-text text-2xl font-bold tabular-nums">{fmt(tempoTotal)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-center gap-1.5 text-text-faint mb-1">
              <Timer size={13} />
              <span className="text-xs uppercase tracking-wider">Média/questão</span>
            </div>
            <p className="text-text text-2xl font-bold tabular-nums">{fmt(tempoMedio)}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={reiniciar} className="flex items-center gap-2 border border-border text-text-muted hover:text-text px-5 py-2.5 rounded-full text-sm transition-colors">
            <RotateCcw size={14} /> Refazer
          </button>
          <button onClick={onVoltar} className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
            Nova sessão
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header da sessão */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onVoltar} className="text-text-muted hover:text-text text-sm flex items-center gap-1.5 transition-colors">
          ← Voltar
        </button>
        <div className="flex items-center gap-3">
          {/* Cronômetro */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm tabular-nums font-medium transition-colors ${
            revelada
              ? 'border-border text-text-faint bg-bg-card'
              : tempoAtual >= 60
              ? 'border-brand/40 text-brand bg-brand-soft'
              : 'border-border text-text-muted bg-bg-card'
          }`}>
            <Timer size={13} />
            {fmt(tempoAtual)}
          </div>
          <div className="text-right">
            <p className="text-text text-sm font-medium">{vestibular} · {conteudo}</p>
            <p className="text-text-faint text-xs mt-0.5">Questão {atual + 1} de {quantidade}</p>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 bg-bg-card rounded-full mb-8 overflow-hidden border border-border">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Questão */}
      <div className="bg-bg-card border border-border rounded-2xl p-7 mb-4">
        <p className="text-text text-sm leading-relaxed">{questao.enunciado}</p>
      </div>

      {/* Alternativas */}
      <div className="flex flex-col gap-2 mb-6">
        {questao.alternativas.map(alt => {
          const isSelecionada = selecionada === alt.letra
          const isCorreta     = alt.letra === questao.resposta
          const isErrada      = revelada && isSelecionada && !isCorreta

          let estilo = 'bg-bg-card border-border text-text-muted hover:border-brand hover:text-text'
          if (revelada && isCorreta)  estilo = 'bg-green-500/10 border-green-500 text-text'
          else if (isErrada)          estilo = 'bg-red-500/10 border-red-500 text-text'
          else if (isSelecionada)     estilo = 'bg-brand/10 border-brand text-text'

          return (
            <button
              key={alt.letra}
              onClick={() => responder(alt.letra)}
              disabled={revelada}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${estilo}`}
            >
              <span className="w-7 h-7 rounded-lg bg-bg border border-border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {alt.letra}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">{alt.texto}</span>
              {revelada && isCorreta && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-1 ml-auto" />}
              {isErrada              && <XCircle      size={16} className="text-red-500 flex-shrink-0 mt-1 ml-auto" />}
            </button>
          )
        })}
      </div>

      {/* Explicação */}
      {revelada && questao.explicacao && (
        <div className="bg-brand-soft border border-brand/20 rounded-2xl p-5 mb-6">
          <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-2">Explicação</p>
          <p className="text-text text-sm leading-relaxed">{questao.explicacao}</p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-end gap-3">
        {!revelada ? (
          <button
            onClick={confirmar}
            disabled={!selecionada}
            className="bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-7 py-3 rounded-full text-sm font-semibold transition-colors"
          >
            Confirmar resposta
          </button>
        ) : (
          <button
            onClick={proxima}
            className="bg-brand hover:bg-brand-hover text-white px-7 py-3 rounded-full text-sm font-semibold transition-colors"
          >
            {atual + 1 >= quantidade ? 'Ver resultado' : 'Próxima questão →'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Aba: Gerar com IA ────────────────────────────────────────────────────────

function GerarComIA() {
  const [vestibular,  setVestibular ] = useState('')
  const [materia,     setMateria    ] = useState('')
  const [conteudo,    setConteudo   ] = useState('')
  const [dificuldade, setDificuldade] = useState<'facil' | 'medio' | 'dificil'>('medio')
  const [quantidade,  setQuantidade ] = useState(5)
  const [loading,     setLoading    ] = useState(false)
  const [questoes,    setQuestoes   ] = useState<Questao[]>([])

  const materias  = vestibular ? MATERIAS[vestibular]             ?? [] : []
  const conteudos = materia    ? CONTEUDOS[vestibular]?.[materia] ?? [] : []

  function handleVestibular(v: string) { setVestibular(v); setMateria(''); setConteudo('') }
  function handleMateria   (m: string) { setMateria(m);    setConteudo('') }

  const pronto = vestibular && materia && conteudo

  async function gerarQuestoes() {
    if (!pronto || loading) return
    setLoading(true)
    setQuestoes([])
    try {
      const res = await fetch('/api/questoes/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vestibular, materia, conteudo, dificuldade, quantidade }),
      })
      const dados = await res.json()
      setQuestoes(dados.questoes ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (questoes.length > 0) {
    return (
      <SessaoQuestoes
        vestibular={vestibular}
        materia={materia}
        conteudo={conteudo}
        questoes={questoes}
        onVoltar={() => setQuestoes([])}
      />
    )
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-text font-semibold text-lg mb-1">Gerar questões com IA</h2>
      <p className="text-text-muted text-sm mb-8">A IA cria questões no estilo do vestibular escolhido, com gabarito e explicação.</p>

      <div className="flex flex-col gap-6">

        {/* Vestibular */}
        <div>
          <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">Vestibular</label>
          <div className="flex flex-wrap gap-2">
            {VESTIBULARES.map(v => (
              <button
                key={v}
                onClick={() => handleVestibular(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  vestibular === v
                    ? 'bg-brand text-white border-brand'
                    : 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Matéria */}
        {vestibular && (
          <div>
            <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">
              Matéria <ChevronRight size={12} className="inline" />
            </label>
            <div className="flex flex-wrap gap-2">
              {materias.map(m => (
                <button
                  key={m}
                  onClick={() => handleMateria(m)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    materia === m
                      ? 'bg-brand text-white border-brand'
                      : 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo */}
        {materia && (
          <div>
            <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">
              Conteúdo <ChevronRight size={12} className="inline" />
            </label>
            <div className="flex flex-wrap gap-2">
              {conteudos.map(c => (
                <button
                  key={c}
                  onClick={() => setConteudo(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    conteudo === c
                      ? 'bg-brand text-white border-brand'
                      : 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dificuldade + quantidade */}
        {pronto && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">Dificuldade</label>
              <div className="flex gap-2">
                {(['facil', 'medio', 'dificil'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDificuldade(d)}
                    className={`flex-1 py-2 rounded-full text-xs font-medium border transition-all capitalize ${
                      dificuldade === d
                        ? 'bg-brand text-white border-brand'
                        : 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                    }`}
                  >
                    {d === 'facil' ? 'Fácil' : d === 'medio' ? 'Médio' : 'Difícil'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">Quantidade</label>
              <div className="flex gap-2">
                {[3, 5, 10].map(q => (
                  <button
                    key={q}
                    onClick={() => setQuantidade(q)}
                    className={`flex-1 py-2 rounded-full text-xs font-medium border transition-all ${
                      quantidade === q
                        ? 'bg-brand text-white border-brand'
                        : 'bg-bg-card border-border text-text-muted hover:text-text hover:border-brand'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botão gerar */}
        {pronto && (
          <button
            onClick={gerarQuestoes}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold py-3.5 rounded-full transition-colors text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gerando questões com IA...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Gerar {quantidade} questões de {conteudo}
              </>
            )}
          </button>
        )}

        {/* Empty state */}
        {!vestibular && (
          <div className="border border-dashed border-border rounded-2xl p-10 text-center">
            <Sparkles size={32} className="text-text-faint mx-auto mb-3" />
            <p className="text-text-muted text-sm">Selecione o vestibular para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sidebar link ─────────────────────────────────────────────────────────────

function SidebarLink({ href, icon: Icon, label, active }: {
  href: string; icon: React.ElementType; label: string; active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? 'bg-bg-hover text-text font-semibold'
          : 'text-text-muted hover:text-text hover:bg-bg-hover'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  )
}
