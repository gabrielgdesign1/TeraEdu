'use client'

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  Save, LogOut, User, GraduationCap, CreditCard, Camera,
  Lock, Trash2, AlertTriangle, Check, Crown, Zap,
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type Aba = 'conta' | 'estudos' | 'assinatura'

const VESTIBULARES = ['ENEM', 'FUVEST', 'UNICAMP', 'UNESP', 'UERJ', 'UnB', 'UFG', 'UFPR', 'ITA', 'IME']
const ANOS_PROVA = ['2026', '2027', '2028', '2029']
const MATERIAS = [
  'Português', 'Literatura', 'Matemática', 'Física', 'Química',
  'Biologia', 'História', 'Geografia', 'Filosofia', 'Sociologia',
  'Artes', 'Educação Física', 'Inglês',
]

const PLANOS = [
  { id: 'gratuito' as const, nome: 'Gratuito', preco: 'R$ 0',          limite: 150,      desc: '5 questões de IA por dia' },
  { id: 'plus'     as const, nome: 'Plus',     preco: 'R$ 19,90/mês',  limite: 1000,     desc: 'Uso amplo de IA por mês' },
  { id: 'premium'  as const, nome: 'Premium',  preco: 'R$ 34,90/mês',  limite: Infinity, desc: 'Gerações de IA ilimitadas' },
]

export default function Configuracoes() {
  const { profile, loading, salvarProfile, reload } = useProfile()
  const router = useRouter()
  const [aba, setAba] = useState<Aba>('conta')

  return (
    <div className="min-h-screen bg-bg flex app-atmosphere">
      <DashboardSidebar />

      <main className="flex-1 min-w-0 ml-0 md:ml-20 px-4 md:px-10 py-6 md:py-10 pb-24 md:pb-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-text text-2xl font-bold tracking-tight mb-1">Configurações</h1>
          <p className="text-text-muted text-sm">Sua conta, seus estudos e sua assinatura.</p>
        </div>

        {/* Abas */}
        <div className="flex gap-1 mb-8 bg-bg-card border border-border rounded-xl p-1 w-fit max-w-full overflow-x-auto">
          {([
            { id: 'conta'       as Aba, label: 'Minha Conta',  icon: User         },
            { id: 'estudos'     as Aba, label: 'Meus Estudos', icon: GraduationCap },
            { id: 'assinatura'  as Aba, label: 'Assinatura',   icon: CreditCard    },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 px-3.5 md:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                aba === t.id
                  ? 'bg-bg shadow-sm text-text border border-border'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <>
            {aba === 'conta'      && <MinhaConta      profile={profile} salvarProfile={salvarProfile} router={router} />}
            {aba === 'estudos'    && <MeusEstudos     profile={profile} salvarProfile={salvarProfile} />}
            {aba === 'assinatura' && <Assinatura       profile={profile} salvarProfile={salvarProfile} reload={reload} />}
          </>
        )}
      </main>
    </div>
  )
}

// ─── Aba: Minha Conta ──────────────────────────────────────────────────────────

function MinhaConta({ profile, salvarProfile, router }: {
  profile: ReturnType<typeof useProfile>['profile']
  salvarProfile: ReturnType<typeof useProfile>['salvarProfile']
  router: ReturnType<typeof useRouter>
}) {
  const [nome,      setNome     ] = useState('')
  const [email,     setEmail    ] = useState('')
  const [salvando,  setSalvando ] = useState(false)
  const [salvo,     setSalvo    ] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [erroFoto,  setErroFoto ] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [salvandoSenha,setSalvandoSenha] = useState(false)
  const [erroSenha,    setErroSenha   ] = useState('')
  const [senhaOk,      setSenhaOk     ] = useState(false)

  const [showExcluir,  setShowExcluir ] = useState(false)
  const [excluindo,    setExcluindo   ] = useState(false)

  useEffect(() => {
    if (profile) setNome(profile.nome ?? '')
  }, [profile])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
  }, [])

  async function salvarNome() {
    setSalvando(true)
    await salvarProfile({ nome })
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  async function trocarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (!file.type.startsWith('image/')) { setErroFoto('Selecione uma imagem.'); return }
    if (file.size > 3 * 1024 * 1024) { setErroFoto('A imagem deve ter até 3MB.'); return }

    setErroFoto('')
    setEnviandoFoto(true)
    try {
      const sb = createClient()
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `${profile.id}/avatar.${ext}`
      const { error: erroUpload } = await sb.storage.from('avatars').upload(path, file, { upsert: true })
      if (erroUpload) throw erroUpload
      const { data } = sb.storage.from('avatars').getPublicUrl(path)
      await salvarProfile({ avatar_url: `${data.publicUrl}?t=${Date.now()}` })
    } catch {
      setErroFoto('Erro ao enviar a foto. Tente novamente.')
    }
    setEnviandoFoto(false)
  }

  async function enviarResetSenha() {
    setErroSenha('')
    if (!email) { setErroSenha('E-mail não carregado. Recarregue a página.'); return }
    setSalvandoSenha(true)
    const sb = createClient()
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    setSalvandoSenha(false)
    if (error) { setErroSenha('Não foi possível enviar o e-mail. Tente novamente.'); return }
    setSenhaOk(true)
    setTimeout(() => setSenhaOk(false), 5000)
  }

  async function excluirConta() {
    if (!profile) return
    setExcluindo(true)
    const sb = createClient()
    const uid = profile.id
    await Promise.all([
      sb.from('user_stats').delete().eq('id', uid),
      sb.from('user_activities').delete().eq('user_id', uid),
      sb.from('sessoes_tutora').delete().eq('user_id', uid),
      sb.from('sessoes_resumos').delete().eq('user_id', uid),
      sb.from('sessoes_flashcards').delete().eq('user_id', uid),
      sb.from('questoes_salvas').delete().eq('user_id', uid),
      sb.from('desempenho_questoes').delete().eq('user_id', uid),
      sb.from('planos_estudo').delete().eq('user_id', uid),
    ])
    await sb.from('user_profiles').delete().eq('id', uid)
    await sb.auth.signOut()
    router.push('/login')
  }

  const primeiroNome = nome?.split(' ')[0] ?? null

  return (
    <div className="flex flex-col gap-6">

      {/* Foto + nome */}
      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-brand" />
          <h2 className="text-text font-semibold">Foto de perfil</h2>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={enviandoFoto}
            className="relative w-20 h-20 rounded-full overflow-hidden bg-brand flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 group"
          >
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              primeiroNome?.[0]?.toUpperCase() ?? '?'
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {enviandoFoto
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Camera size={18} className="text-white" />}
            </div>
          </button>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={enviandoFoto}
              className="text-brand text-sm font-medium hover:opacity-75 transition-opacity"
            >
              Alterar foto
            </button>
            <p className="text-text-faint text-xs mt-1">JPG, PNG ou GIF. Máximo 3MB.</p>
            {erroFoto && <p className="text-red-500 text-xs mt-1">{erroFoto}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={trocarFoto} className="hidden" />
        </div>
      </section>

      {/* Informações pessoais */}
      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-brand" />
          <h2 className="text-text font-semibold">Informações pessoais</h2>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Nome completo</span>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome"
              className="bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">E-mail</span>
            <input
              value={email}
              readOnly
              className="bg-bg-hover border border-border rounded-xl px-4 py-2.5 text-text-muted text-sm cursor-not-allowed"
            />
          </label>
          <button
            onClick={salvarNome}
            disabled={salvando}
            className="self-start flex items-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            {salvando
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
              : salvo
              ? <><Check size={14} /> Salvo!</>
              : <><Save size={14} /> Salvar nome</>
            }
          </button>
        </div>
      </section>

      {/* Alterar senha — fluxo seguro por e-mail */}
      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={16} className="text-brand" />
          <h2 className="text-text font-semibold">Senha e segurança</h2>
        </div>
        <p className="text-text-muted text-sm mb-5 max-w-md">
          Por segurança, a troca de senha é feita por e-mail. Enviaremos um link seguro para{' '}
          {email ? <span className="text-text font-medium">{email}</span> : 'o seu endereço'}; abra o link
          e defina a nova senha. Ninguém consegue alterar sua senha sem acesso ao seu e-mail.
        </p>
        {erroSenha && <p className="text-red-500 text-sm mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 max-w-md">{erroSenha}</p>}
        {senhaOk && (
          <p className="text-green-600 dark:text-green-400 text-sm mb-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 max-w-md flex items-center gap-2">
            <Check size={14} /> Link enviado! Verifique sua caixa de entrada.
          </p>
        )}
        <button
          onClick={enviarResetSenha}
          disabled={salvandoSenha}
          className="flex items-center gap-2 border border-border hover:border-brand text-text-muted hover:text-text disabled:opacity-50 font-medium px-5 py-2.5 rounded-full text-sm transition-colors"
        >
          {salvandoSenha
            ? <><div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" /> Enviando...</>
            : <><Lock size={14} /> Enviar link de redefinição</>
          }
        </button>
      </section>

      {/* Excluir conta */}
      <section className="bg-bg-card rounded-2xl p-6 border border-red-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 size={16} className="text-red-500" />
          <h2 className="text-text font-semibold">Excluir conta</h2>
        </div>
        <p className="text-text-muted text-sm mb-4">
          Essa ação apaga permanentemente seus dados (perfil, progresso, histórico e planos). Não é possível desfazer.
        </p>
        <button
          onClick={() => setShowExcluir(true)}
          className="flex items-center gap-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          <Trash2 size={14} /> Excluir minha conta
        </button>
      </section>

      {/* Modal de confirmação */}
      {showExcluir && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-sm w-full">
            <div className="w-11 h-11 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-text font-bold text-lg mb-2">Excluir conta permanentemente?</h3>
            <p className="text-text-muted text-sm mb-6">
              Todos os seus dados serão apagados e você será desconectado. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExcluir(false)}
                disabled={excluindo}
                className="flex-1 border border-border text-text-muted hover:text-text py-2.5 rounded-full text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={excluirConta}
                disabled={excluindo}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-full text-sm font-medium transition-colors"
              >
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sair */}
      <div>
        <button
          onClick={async () => { const sb = createClient(); await sb.auth.signOut(); router.push('/login') }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-text-muted hover:text-red-500 hover:border-red-400 text-sm transition-colors"
        >
          <LogOut size={14} /> Sair da conta
        </button>
      </div>
    </div>
  )
}

// ─── Aba: Meus Estudos ─────────────────────────────────────────────────────────

function MeusEstudos({ profile, salvarProfile }: {
  profile: ReturnType<typeof useProfile>['profile']
  salvarProfile: ReturnType<typeof useProfile>['salvarProfile']
}) {
  const [vestibular, setVestibular] = useState('')
  const [ano,        setAno       ] = useState('')
  const [materias,   setMaterias  ] = useState<string[]>([])
  const [salvando,   setSalvando  ] = useState(false)
  const [salvo,      setSalvo     ] = useState(false)

  useEffect(() => {
    if (profile) {
      setVestibular(profile.vestibular_principal ?? '')
      setAno(profile.ano_prova ?? '')
      setMaterias(profile.materias_prioritarias ?? [])
    }
  }, [profile])

  function toggleMateria(m: string) {
    setMaterias(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  async function salvar() {
    setSalvando(true)
    await salvarProfile({
      vestibular_principal: vestibular,
      ano_prova: ano,
      materias_prioritarias: materias,
    })
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <GraduationCap size={16} className="text-brand" />
          <h2 className="text-text font-semibold">Vestibular principal</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {VESTIBULARES.map(v => (
            <button
              key={v}
              onClick={() => setVestibular(vestibular === v ? '' : v)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                vestibular === v
                  ? 'bg-brand text-white border-brand'
                  : 'border-border text-text-muted hover:border-brand hover:text-text'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {!VESTIBULARES.includes(vestibular) && (
          <input
            value={vestibular}
            onChange={e => setVestibular(e.target.value)}
            placeholder="Ou escreva outro vestibular..."
            className="mt-3 w-full max-w-sm bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
          />
        )}
        {!VESTIBULARES.includes(vestibular) && vestibular && (
          <p className="text-brand text-xs mt-2">Personalizado: {vestibular}</p>
        )}
      </section>

      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <GraduationCap size={16} className="text-brand" />
          <h2 className="text-text font-semibold">Ano previsto da prova</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {ANOS_PROVA.map(a => (
            <button
              key={a}
              onClick={() => setAno(ano === a ? '' : a)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                ano === a
                  ? 'bg-brand text-white border-brand'
                  : 'border-border text-text-muted hover:border-brand hover:text-text'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={16} className="text-brand" />
          <h2 className="text-text font-semibold">Matérias prioritárias</h2>
        </div>
        <p className="text-text-faint text-xs mb-4">Selecione as matérias em que quer focar mais.</p>
        <div className="flex flex-wrap gap-2">
          {MATERIAS.map(m => {
            const on = materias.includes(m)
            return (
              <button
                key={m}
                onClick={() => toggleMateria(m)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                  on
                    ? 'bg-brand text-white border-brand'
                    : 'border-border text-text-muted hover:border-brand hover:text-text'
                }`}
              >
                {on && <Check size={12} />}
                {m}
              </button>
            )
          })}
        </div>
      </section>

      <button
        onClick={salvar}
        disabled={salvando}
        className="self-start flex items-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
      >
        {salvando
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
          : salvo
          ? <><Check size={14} /> Salvo!</>
          : <><Save size={14} /> Salvar alterações</>
        }
      </button>
    </div>
  )
}

// ─── Aba: Assinatura ───────────────────────────────────────────────────────────

function Assinatura({ profile, salvarProfile, reload }: {
  profile: ReturnType<typeof useProfile>['profile']
  salvarProfile: ReturnType<typeof useProfile>['salvarProfile']
  reload: () => void
}) {
  const [usoMes,      setUsoMes     ] = useState<number | null>(null)
  const [showCancelar,setShowCancelar] = useState(false)

  const carregarUso = useCallback(async () => {
    if (!profile) return
    const sb = createClient()
    const inicioMes = new Date()
    inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)
    const { count } = await sb
      .from('user_activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .gte('criado_em', inicioMes.toISOString())
    setUsoMes(count ?? 0)
  }, [profile])

  useEffect(() => { carregarUso() }, [carregarUso])

  const planoAtual = PLANOS.find(p => p.id === profile?.plano) ?? PLANOS[0]
  const pct = usoMes === null || planoAtual.limite === Infinity
    ? 0
    : Math.min(100, Math.round((usoMes / planoAtual.limite) * 100))

  async function cancelarAssinatura() {
    await salvarProfile({ plano: 'gratuito' })
    setShowCancelar(false)
    reload()
  }

  const PlanoIcon = planoAtual.id === 'premium' ? Crown : planoAtual.id === 'plus' ? Zap : CreditCard

  return (
    <div className="flex flex-col gap-6">

      {/* Plano atual */}
      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard size={16} className="text-brand" />
          <h2 className="text-text font-semibold">Plano atual</h2>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-soft rounded-2xl flex items-center justify-center flex-shrink-0">
              <PlanoIcon size={20} className="text-brand" />
            </div>
            <div>
              <p className="text-text font-bold text-lg leading-tight">{planoAtual.nome}</p>
              <p className="text-text-muted text-sm">{planoAtual.preco === 'R$ 0' ? 'Gratuito' : planoAtual.preco}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/planos"
              className="bg-brand hover:bg-brand-hover text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              Ver planos
            </Link>
            {planoAtual.id !== 'gratuito' && (
              <button
                onClick={() => setShowCancelar(true)}
                className="border border-border text-text-muted hover:text-red-500 hover:border-red-400 px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                Cancelar assinatura
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Uso do mês */}
      <section className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text font-semibold">Uso de IA este mês</h2>
          <span className="text-text-muted text-sm tabular-nums">
            {usoMes === null ? '—' : usoMes} / {planoAtual.limite === Infinity ? '∞' : planoAtual.limite}
          </span>
        </div>
        <div className="h-2.5 bg-bg-hover rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-brand'}`}
            style={{ width: `${planoAtual.limite === Infinity ? 8 : pct}%` }}
          />
        </div>
        <p className="text-text-faint text-xs mt-2.5">
          {planoAtual.limite === Infinity
            ? 'Seu plano tem gerações ilimitadas.'
            : `Contabiliza resumos, flashcards, questões e conversas com a IA Tutora geradas neste mês.`}
        </p>
      </section>

      {/* Modal cancelar */}
      {showCancelar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-text font-bold text-lg mb-2">Cancelar assinatura?</h3>
            <p className="text-text-muted text-sm mb-6">
              Você voltará para o plano Gratuito imediatamente e perderá os benefícios do plano {planoAtual.nome}.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelar(false)} className="flex-1 border border-border text-text-muted hover:text-text py-2.5 rounded-full text-sm transition-colors">
                Manter plano
              </button>
              <button onClick={cancelarAssinatura} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full text-sm font-medium transition-colors">
                Cancelar assinatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
