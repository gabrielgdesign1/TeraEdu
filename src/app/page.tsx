export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-[#2563eb] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-white font-semibold text-2xl">TeraEdu</span>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
          <h1 className="text-white text-2xl font-semibold mb-1">Bem-vindo de volta</h1>
          <p className="text-[#8b8fa8] text-sm mb-6">Entre na sua conta para continuar estudando</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[#8b8fa8] text-sm mb-1.5 block">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div>
              <label className="text-[#8b8fa8] text-sm mb-1.5 block">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#2563eb] w-4 h-4" />
                <span className="text-[#8b8fa8] text-sm">Lembrar de mim</span>
              </label>
              <a href="#" className="text-[#2563eb] text-sm hover:underline">Esqueci a senha</a>
            </div>
            <button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium py-3 rounded-xl transition-colors mt-1">
              Entrar
            </button>
          </div>

          <p className="text-center text-[#8b8fa8] text-sm mt-6">
            Não tem conta?{" "}
            <a href="#" className="text-[#2563eb] hover:underline font-medium">Criar conta grátis</a>
          </p>
        </div>

        <p className="text-center text-[#4a4d5e] text-xs mt-6">
          © 2025 TeraEdu · Todos os direitos reservados
        </p>
      </div>
    </main>
  );
}