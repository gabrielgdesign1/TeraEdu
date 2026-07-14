'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  Sun, Moon, Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Sparkles, MessageCircle, Flame, Trophy,
} from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

export default function Login() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    setLoading(true)
    setErro('')
    setMensagem('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErro('E-mail ou senha incorretos.')
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { nome } }
      })
      if (error) setErro('Erro ao criar conta. Tente novamente.')
      else setMensagem('Conta criada! Verifique seu e-mail para confirmar.')
    }
    setLoading(false)
  }

  const inputCls = "w-full bg-bg border border-border rounded-xl pl-11 pr-4 py-3.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand/70 focus:ring-4 focus:ring-brand/10 transition-all"

  return (
    <main className="min-h-dvh bg-bg flex app-atmosphere">

      {/* ══════════ Coluna do formulário ══════════ */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 py-10">

        {/* toggle de tema */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Alternar tema"
          className="absolute top-5 right-5 w-10 h-10 rounded-xl border border-border/60 bg-bg-card/60 backdrop-blur-sm hover:bg-bg-hover flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          {mounted && theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/40 blur-lg rounded-full" />
              <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={34} height={34} className="relative" />
            </div>
            <span className="text-text font-bold text-xl tracking-tight">TeraEdu</span>
          </div>

          {/* título */}
          <h1 className="text-text text-[2rem] font-black tracking-tight leading-tight mb-2">
            {isLogin ? (
              <>Bem-vindo <span className="text-gradient-brand">de volta</span></>
            ) : (
              <>Crie sua conta <span className="text-gradient-brand">grátis</span></>
            )}
          </h1>
          <p className="text-text-muted text-sm mb-9">
            {isLogin ? 'Entre na sua conta para continuar estudando.' : 'Comece a estudar com IA hoje mesmo.'}
          </p>

          <div className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">Nome completo</label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    className={inputCls}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-text-faint hover:text-text transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-brand w-4 h-4" />
                  <span className="text-text-muted text-sm">Lembrar de mim</span>
                </label>
                <a href="#" className="text-brand text-sm hover:underline">Esqueci a senha</a>
              </div>
            )}

            {erro && <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{erro}</p>}
            {mensagem && <p className="text-green-600 dark:text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">{mensagem}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-all mt-1 flex items-center justify-center gap-2 shadow-[0_12px_28px_-10px_rgba(249,115,22,0.55)] hover:shadow-[0_16px_36px_-10px_rgba(249,115,22,0.65)] cursor-pointer"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Aguarde...</>
              ) : (
                <>{isLogin ? 'Entrar' : 'Criar conta'} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </div>

          <p className="text-center text-text-muted text-sm mt-8">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setErro(''); setMensagem('') }}
              className="text-brand hover:underline font-semibold cursor-pointer"
            >
              {isLogin ? 'Criar conta grátis' : 'Entrar'}
            </button>
          </p>

          <p className="text-center text-text-faint text-xs mt-10">
            © 2026 TeraEdu · Todos os direitos reservados
          </p>
        </motion.div>
      </div>

      {/* ══════════ Painel de arte (lg+) ══════════ */}
      <div className="hidden lg:block flex-1 p-4">
        <motion.div
          className="relative h-full min-h-[calc(100dvh-2rem)] rounded-[2rem] overflow-hidden"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        >
          {/* arte gerada */}
          <Image
            src="/login-art.jpg"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          {/* véu para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />

          {/* logo marca d'água */}
          <div className="absolute top-7 left-7 flex items-center gap-2">
            <Image src="/TeraEdu-logo-orange.png" alt="" width={22} height={22} />
            <span className="text-white/90 font-semibold text-sm tracking-tight">TeraEdu</span>
          </div>

          {/* chips de vidro flutuantes */}
          <motion.div
            className="absolute top-[18%] right-[10%] rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center"><MessageCircle size={14} className="text-white" /></div>
            <div>
              <p className="text-white text-xs font-semibold leading-tight">IA Tutora</p>
              <p className="text-white/60 text-[10px]">Dúvidas em segundos</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-[38%] left-[8%] rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl"
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center"><Flame size={14} className="text-brand" /></div>
            <div>
              <p className="text-white text-xs font-semibold leading-tight">7 dias seguidos</p>
              <p className="text-white/60 text-[10px]">Sequência de estudos</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-[30%] right-[14%] rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
          >
            <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center"><Trophy size={14} className="text-brand" /></div>
            <div>
              <p className="text-white text-xs font-semibold leading-tight">+80 pts no ENEM</p>
              <p className="text-white/60 text-[10px]">Média dos alunos</p>
            </div>
          </motion.div>

          {/* citação inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-9">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={13} className="text-brand" />
              <span className="text-white/60 text-[11px] tracking-widest uppercase">IA para o ENEM e vestibulares</span>
            </div>
            <p className="text-white text-2xl xl:text-3xl font-black tracking-tight leading-tight max-w-md mb-5">
              Estude mais inteligente,<br />
              <span className="text-brand">não mais difícil.</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['A', 'M', 'E', 'D'].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-brand/90 border-2 border-black/40 flex items-center justify-center text-white text-[10px] font-bold">{l}</div>
                ))}
              </div>
              <p className="text-white/60 text-xs">Milhares de estudantes já estudam com o TeraEdu</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
