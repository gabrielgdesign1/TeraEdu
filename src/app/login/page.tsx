'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
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
      if (error) {
        setErro('E-mail ou senha incorretos.')
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } }
      })
      if (error) {
        setErro('Erro ao criar conta. Tente novamente.')
      } else {
        setMensagem('Conta criada! Verifique seu e-mail para confirmar.')
      }
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={36} height={36} />
          <span className="text-white font-semibold text-2xl">TeraEdu</span>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
          <h1 className="text-white text-2xl font-semibold mb-1">
            {isLogin ? 'Bem-vindo de volta' : 'Criar conta grátis'}
          </h1>
          <p className="text-[#8b8fa8] text-sm mb-6">
            {isLogin ? 'Entre na sua conta para continuar estudando' : 'Comece a estudar com IA hoje mesmo'}
          </p>

          <div className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="text-[#8b8fa8] text-sm mb-1.5 block">Nome completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>
            )}
            <div>
              <label className="text-[#8b8fa8] text-sm mb-1.5 block">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div>
              <label className="text-[#8b8fa8] text-sm mb-1.5 block">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-[#2563eb] w-4 h-4" />
                  <span className="text-[#8b8fa8] text-sm">Lembrar de mim</span>
                </label>
                <a href="#" className="text-[#2563eb] text-sm hover:underline">Esqueci a senha</a>
              </div>
            )}

            {erro && <p className="text-red-400 text-sm">{erro}</p>}
            {mensagem && <p className="text-green-400 text-sm">{mensagem}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-1"
            >
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
            </button>
          </div>

          <p className="text-center text-[#8b8fa8] text-sm mt-6">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setErro(''); setMensagem('') }}
              className="text-[#2563eb] hover:underline font-medium"
            >
              {isLogin ? 'Criar conta grátis' : 'Entrar'}
            </button>
          </p>
        </div>

        <p className="text-center text-[#4a4d5e] text-xs mt-6">
          © 2025 TeraEdu · Todos os direitos reservados
        </p>
      </div>
    </main>
  )
}