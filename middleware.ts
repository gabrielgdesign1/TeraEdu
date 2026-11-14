import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getUserComLimite } from './src/lib/authComLimite'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { user, indisponivel } = await getUserComLimite(supabase)

  // Se não está logado e tenta acessar o dashboard, redireciona pro login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const destino = new URL('/login', request.url)
    if (indisponivel) destino.searchParams.set('erro', 'indisponivel')
    return NextResponse.redirect(destino)
  }

  // Se está logado e tenta acessar o login, redireciona pro dashboard
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}