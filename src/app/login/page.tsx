'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

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

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-6 right-6 w-9 h-9 rounded-lg hover:bg-bg-hover flex items-center justify-center text-text-muted hover:text-text transition-colors"
      >
        {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={32} height={32} />
          <span className="text-text font-semibold text-2xl">TeraEdu</span>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-8">
          <h1 className="text-text text-2xl font-semibold tracking-tight mb-1.5">
            {isLogin ? 'Bem-vindo de volta' : 'Criar conta grátis'}
          </h1>
          <p className="text-text-muted text-sm mb-6">
            {isLogin ? 'Entre na sua conta para continuar estudando' : 'Comece a estudar com IA hoje mesmo'}
          </p>

          <div className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="text-text-muted text-sm mb-1.5 block">Nome completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
                />
              </div>
            )}
            <div>
              <label className="text-text-muted text-sm mb-1.5 block">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="text-text-muted text-sm mb-1.5 block">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
              />
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

            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            {mensagem && <p className="text-green-500 text-sm">{mensagem}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-1"
            >
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
            </button>
          </div>

          <p className="text-center text-text-muted text-sm mt-6">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setErro(''); setMensagem('') }}
              className="text-brand hover:underline font-medium"
            >
              {isLogin ? 'Criar conta grátis' : 'Entrar'}
            </button>
          </p>
        </div>

        <p className="text-center text-text-faint text-xs mt-6">
          © 2025 TeraEdu · Todos os direitos reservados
        </p>
      </div>
    </main>
  )
}