'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react'

export default function RedefinirSenha() {
  const router = useRouter()
  const supabase = createClient()

  const [pronto,   setPronto  ] = useState(false)  // sessão do link válida?
  const [senha,    setSenha   ] = useState('')
  const [confirma, setConfirma] = useState('')
  const [show,     setShow    ] = useState(false)
  const [loading,  setLoading ] = useState(false)
  const [erro,     setErro    ] = useState('')
  const [ok,       setOk      ] = useState(false)

  // O link de redefinição do Supabase cria uma sessão de recuperação ao abrir.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setPronto(true)
    })
    // Se a sessão já existir (link processado), libera também
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function salvar() {
    setErro('')
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (senha !== confirma) { setErro('As senhas não coincidem.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setLoading(false)
    if (error) { setErro('Não foi possível redefinir. O link pode ter expirado — peça um novo.'); return }
    setOk(true)
    setTimeout(() => router.push('/dashboard'), 1800)
  }

  const inputCls = "w-full bg-bg border border-border rounded-xl pl-11 pr-12 py-3.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand/70 focus:ring-4 focus:ring-brand/10 transition-all"

  return (
    <main className="min-h-dvh bg-bg flex items-center justify-center px-5 app-atmosphere">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={30} height={30} />
          <span className="text-text font-bold text-xl tracking-tight">TeraEdu</span>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-8">
          <h1 className="text-text text-2xl font-black tracking-tight mb-1.5">Redefinir senha</h1>
          <p className="text-text-muted text-sm mb-7">Defina uma nova senha para a sua conta.</p>

          {!pronto ? (
            <p className="text-text-muted text-sm bg-bg-hover rounded-xl px-4 py-3">
              Abra esta página pelo link enviado ao seu e-mail. Se você chegou aqui direto,{' '}
              <Link href="/login" className="text-brand hover:underline">volte ao login</Link> e use “Esqueci a senha”.
            </p>
          ) : ok ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <Check size={16} /> Senha redefinida! Redirecionando…
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                <input
                  type={show ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  autoComplete="new-password"
                  className={inputCls}
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-text-faint hover:text-text transition-colors">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                <input
                  type={show ? 'text' : 'password'}
                  value={confirma}
                  onChange={e => setConfirma(e.target.value)}
                  placeholder="Confirmar nova senha"
                  autoComplete="new-password"
                  className={inputCls}
                />
              </div>
              {erro && <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{erro}</p>}
              <button
                onClick={salvar}
                disabled={loading || !senha || !confirma}
                className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_12px_28px_-10px_rgba(249,115,22,0.55)]"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
                  : <>Redefinir senha <ArrowRight size={15} /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
