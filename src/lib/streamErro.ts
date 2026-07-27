/* Marcador enviado no fim do stream de /api/questoes/gerar quando o JSON
   gerado saiu inválido (quase sempre truncamento). Fica num módulo próprio
   porque servidor e cliente precisam concordar na string — duplicar o
   literal nos dois lados quebraria em silêncio se um deles mudasse.
   Não use chaves aqui: o cliente extrai o JSON com um regex guloso
   /\{[\s\S]*\}/ e engoliria a sentinela. */
export const STREAM_ERRO = '__TERAEDU_STREAM_ERRO__'
