'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

/*
 * Texto de questão (enunciado e alternativas) com a FONTE em destaque discreto.
 *
 * A fonte vem quase sempre num parágrafo/linha própria, então a detecção é por linha
 * (ehFonte). Para textos em que a fonte vem colada no meio do parágrafo (comum no
 * banco interno da Fuvest/Unicamp), há um segundo passe que recorta o trecho
 * "... Disponível em: ... Acesso em: ..." dentro da linha (dividirCitacoes).
 *
 * `markdown` só deve ser ligado para o ENEM (api.enem.dev), que manda markdown de
 * verdade — imagens como ![](url) e negrito com **. No banco interno, "*" e "**"
 * são nota de rodapé ou carga de íon ("Fe**+"), e não podem virar formatação.
 */

/** Estilo da fonte/citação: menor e mais apagada que o texto da questão. */
export const CLASSE_FONTE = 'text-[11px] leading-snug text-text-muted opacity-70'

const RE_DISPONIVEL = /Dispon[íi]vel em/i
const RE_ACESSO = /Acess(?:o|ad[oa]) em/i
// "SOBRENOME, X." / "SOBRENOME SOBRENOME, X. Y.;" — autor no padrão ABNT abrindo a linha
const RE_AUTOR_ABNT = /^[A-ZÀ-Ý][A-ZÀ-Ý'’-]+(?:\s+[A-ZÀ-Ý'’-]+)*[,.]\s*[A-ZÀ-Ý]{1,2}\./
const RE_FECHO = /(?:\((?:adaptad[oa]|fragmento|inédito|trecho)\)|\b(?:adaptad[oa]|fragmento))\.?$/i
const RE_ANO = /\b(?:1[5-9]\d{2}|20\d{2})\b/
// imprenta "Cidade: Editora, 2004"
const RE_IMPRENTA = /[A-ZÀ-Ý][\wÀ-ú .]*:\s*[^,:]+,\s*(?:1[5-9]|20)\d{2}/
// periódico "Revista, n. 99, 2011" / "v. 8, n. 2"
const RE_PERIODICO = /\b(?:n|v)\.\s*\d+/
// termina em data: ", 2011." / ", 15 nov. 1989." / "06/08/2010." / "15 de abril de 1972." / "Abril/2019."
const RE_FIM_DATA = /(?:,\s*(?:\d{1,2}\s+)?(?:[a-zç]{3,4}\.?(?:-[a-zç]{3,4}\.?)?\s+)?(?:1[5-9]|20)\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2} de [a-zç]+ de (?:1[5-9]|20)\d{2}|[A-Za-zç]+\/(?:1[5-9]|20)\d{2})\.?$/
// termina em página ou ano original: "..., p.115." / "p.28-29, 1993 [1942]."
const RE_FIM_PAGINA = /(?:\bp\.\s*\d+(?:[-–]\d+)?|\[(?:1[5-9]|20)\d{2}\])\.?$/

/** Remove as marcações de negrito/itálico do markdown, só para testar os padrões. */
function semMarcacao(linha: string): string {
  return linha.replace(/\*\*|__|(^|\s)_|_(\s|$)/g, '$1$2').trim()
}

/** A linha inteira é uma referência de fonte (bibliográfica ou "Disponível em"). */
export function ehFonte(linha: string): boolean {
  const t = semMarcacao(linha)
  if (!t || t.length > 400 || t.startsWith('![')) return false
  if (RE_DISPONIVEL.test(t) || RE_ACESSO.test(t)) return true
  if (/^[[(]?Fonte:/i.test(t) && t.length < 250) return true
  if (/^\(.*\)\.?$/.test(t) && RE_ANO.test(t)) return true // "(Autor, Obra. Editora, 1998.)"
  if (t.length > 300) return false
  if (RE_AUTOR_ABNT.test(t) && (RE_ANO.test(t) || RE_FECHO.test(t))) return true
  if (RE_FECHO.test(t) && RE_ANO.test(t)) return true
  if (t.length < 250 && RE_PERIODICO.test(t) && RE_ANO.test(t)) return true
  if (t.length < 250 && RE_FIM_PAGINA.test(t) && (RE_ANO.test(t) || /\bs\.d\./.test(t))) return true
  if (t.length < 300 && /\bIn:\s/.test(t) && RE_ANO.test(t)) return true
  if (t.length < 160 && RE_FIM_DATA.test(t)) return true
  return t.length < 200 && RE_IMPRENTA.test(t)
}

/** Primeira linha de uma referência que continua na linha seguinte
 *  ("MELO NETO, J. C. **Título**" + "Rio de Janeiro: Nova Fronteira, 1997."). */
function ehInicioDeFonte(linha: string): boolean {
  const t = semMarcacao(linha)
  return t.length < 250 && RE_AUTOR_ABNT.test(t)
}

/** Divide uma linha em trechos normais e trechos de citação colados no meio do texto
 *  (ex: "... BILAC, O. Disponível em: ... Acesso em: 29 out. 2021. ..."). */
function dividirCitacoes(texto: string): { texto: string; citacao: boolean }[] {
  const regexDisponivel = /Dispon[íi]vel em:?/gi
  const partes: { texto: string; citacao: boolean }[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  // Janela de segurança: nunca busca limite de frase além disso, evitando "vazar"
  // para trás/frente por causa de espaços não-padrão (nbsp, quebras de linha etc.)
  const JANELA_MAX = 200

  while ((match = regexDisponivel.exec(texto))) {
    const idxDisp = match.index
    if (idxDisp < cursor) continue

    // início: tenta capturar "SOBRENOME, X." (autor) logo antes de "Disponível em";
    // evita parar em iniciais abreviadas ("O.") ao procurar só o último "."
    const janelaAutor = texto.slice(Math.max(0, idxDisp - 60), idxDisp)
    const autorMatch = janelaAutor.match(/[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]{2,})*,\s*[A-Z]\.\s*$/)
    let inicio: number
    if (autorMatch) {
      inicio = Math.max(0, idxDisp - 60) + janelaAutor.lastIndexOf(autorMatch[0])
    } else {
      // \s cobre espaço comum, nbsp, quebra de linha etc. (diferente de um "." literal seguido de " ")
      const limiteBusca = Math.max(0, idxDisp - JANELA_MAX)
      const trecho = texto.slice(limiteBusca, idxDisp)
      const fronteiras = [...trecho.matchAll(/\.\s+/g)]
      const ultima = fronteiras[fronteiras.length - 1]
      inicio = ultima ? limiteBusca + ultima.index! + ultima[0].length : idxDisp
    }
    if (inicio < cursor) inicio = cursor

    // fim: procura "Acesso em <data completa>" (com ou sem ":"; também "Acessado em"),
    // sem parar no "." de mês abreviado ("out.")
    const acesso = RE_ACESSO.exec(texto.slice(idxDisp))
    const idxAcesso = acesso ? idxDisp + acesso.index : -1
    let fim: number
    if (idxAcesso === -1) {
      const trecho = texto.slice(idxDisp, idxDisp + JANELA_MAX)
      const fronteira = trecho.match(/\.\s+/)
      fim = fronteira ? idxDisp + fronteira.index! + fronteira[0].length : texto.length
    } else {
      const restante = texto.slice(idxAcesso, idxAcesso + 100)
      const dataMatch =
        restante.match(/Acess(?:o|ad[oa]) em:?\s*\d{1,2}\s*[a-zà-ú]+\.?\s*(?:de\s*)?\d{4}(?:\s*\((?:adaptad[oa]|fragmento)\))?\.?\)?/i) ??
        restante.match(/Acess(?:o|ad[oa]) em:?\s*\d{1,2}\/\d{1,2}\/\d{2,4}\.?\)?/i)
      if (dataMatch) {
        fim = idxAcesso + dataMatch[0].length
      } else {
        const trecho = texto.slice(idxAcesso, idxAcesso + JANELA_MAX)
        const fronteira = trecho.match(/\.\s+/)
        fim = fronteira ? idxAcesso + fronteira.index! + fronteira[0].length : texto.length
      }
    }

    if (inicio > cursor) partes.push({ texto: texto.slice(cursor, inicio), citacao: false })
    partes.push({ texto: texto.slice(inicio, fim), citacao: true })
    cursor = fim
    regexDisponivel.lastIndex = fim
  }
  if (cursor < texto.length) partes.push({ texto: texto.slice(cursor), citacao: false })
  return partes.length ? partes : [{ texto, citacao: false }]
}

// ─── Renderização ────────────────────────────────────────────────────────────

const componentesMd: Components = {
  p: ({ children }) => <p className="whitespace-pre-line">{children}</p>,
  img: ({ src, alt }) =>
    typeof src === 'string' ? (
      // next/image exigiria width/height e remotePatterns para o domínio externo (enem.dev);
      // as imagens vêm com tamanho variado, então <img> com lazy loading é o adequado aqui
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || 'Imagem da questão'}
        loading="lazy"
        className="block max-w-full h-auto mx-auto my-1 rounded-lg bg-white p-1.5"
      />
    ) : null,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl border border-border text-xs">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="bg-bg px-3 py-2 text-left font-semibold border border-border">{children}</th>,
  td: ({ children }) => <td className="px-3 py-1.5 border border-border">{children}</td>,
  ul: ({ children }) => <ul className="list-disc pl-5 flex flex-col gap-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 flex flex-col gap-1">{children}</ol>,
}

// Dentro de uma linha (citação recortada, alternativa) o <p> do markdown não pode
// quebrar o fluxo: vira fragmento
const componentesMdInline: Components = { ...componentesMd, p: ({ children }) => <>{children}</> }

function Markdown({ texto, inline = false }: { texto: string; inline?: boolean }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={inline ? componentesMdInline : componentesMd}>
      {texto}
    </ReactMarkdown>
  )
}

function Trecho({ texto, markdown }: { texto: string; markdown: boolean }) {
  return markdown ? <Markdown texto={texto} inline /> : <>{texto}</>
}

function GrupoNormal({ texto, markdown }: { texto: string; markdown: boolean }) {
  const partes = dividirCitacoes(texto)
  if (partes.length === 1) {
    return markdown ? <Markdown texto={texto} /> : <p className="whitespace-pre-line">{texto}</p>
  }
  return (
    <p className="whitespace-pre-line">
      {partes.map((p, i) =>
        p.citacao
          ? <span key={i} className={CLASSE_FONTE}><Trecho texto={p.texto} markdown={markdown} /></span>
          : <Trecho key={i} texto={p.texto} markdown={markdown} />
      )}
    </p>
  )
}

export function QuestaoTexto({ texto, markdown = false, className = '' }: {
  texto: string
  markdown?: boolean
  className?: string
}) {
  // Linhas consecutivas do mesmo tipo (fonte / texto) viram um bloco só, para não
  // quebrar parágrafos de poema ou tabelas em markdown.
  const grupos: { fonte: boolean; linhas: string[] }[] = []
  for (const bloco of texto.split(/\n\s*\n/)) {
    const linhas = bloco.split('\n').filter(l => l.trim())
    const fontes = linhas.map(ehFonte)
    // referência quebrada em duas linhas: a de cima (autor/título) também é fonte,
    // e um resto de linha com só a data ("19/04/2019).") também
    fontes.forEach((f, i) => { if (f && i > 0 && !fontes[i - 1] && ehInicioDeFonte(linhas[i - 1])) fontes[i - 1] = true })
    fontes.forEach((f, i) => { if (!f && i > 0 && fontes[i - 1] && /^[\s\d/().,:–-]*\d{4}[\s).]*$/.test(linhas[i])) fontes[i] = true })
    linhas.forEach((linha, i) => {
      const fonte = fontes[i]
      const ultimo = grupos[grupos.length - 1]
      // i === 0: começo de outro parágrafo — não emenda com o anterior
      if (ultimo && i > 0 && ultimo.fonte === fonte) ultimo.linhas.push(linha)
      else grupos.push({ fonte, linhas: [linha] })
    })
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {grupos.map((g, i) =>
        g.fonte
          ? <p key={i} className={`${CLASSE_FONTE} -mt-1.5`}><Trecho texto={g.linhas.join('\n')} markdown={markdown} /></p>
          : <GrupoNormal key={i} texto={g.linhas.join('\n')} markdown={markdown} />
      )}
    </div>
  )
}

/** Conteúdo de uma alternativa: texto e/ou imagem (no ENEM, algumas são só imagem). */
export function AlternativaConteudo({ texto, imagem, markdown = false }: {
  texto: string
  imagem?: string | null
  markdown?: boolean
}) {
  return (
    <span className="flex flex-col gap-2 min-w-0">
      {texto && <span><Trecho texto={texto} markdown={markdown} /></span>}
      {imagem && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagem} alt="" loading="lazy" className="block max-w-full h-auto rounded-lg bg-white p-1.5" />
      )}
    </span>
  )
}

/** Versão em texto corrido para prévias (line-clamp): sem imagens nem marcações. */
export function textoResumo(texto: string): string {
  return texto
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
