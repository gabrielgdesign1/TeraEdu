import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// Origens externas que o NAVEGADOR acessa: Supabase (auth, dados, avatares) e as
// imagens das questões do ENEM. Links <a href> para sites de vestibular não contam.
// 'unsafe-inline' em script-src: o Next injeta scripts inline sem nonce nas páginas
// estáticas; o ganho da CSP aqui é bloquear script/conexão de qualquer outro domínio
// (um XSS não consegue carregar código de fora nem mandar a sessão para fora).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://enem.dev https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
