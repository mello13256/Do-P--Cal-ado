/**
 * Resolve o caminho de um arquivo de `public/`.
 *
 * O site pode ser servido na raiz (domínio próprio, Netlify, Vercel) ou numa
 * subpasta (GitHub Pages: /Do-P--Cal-ado/). Esta função ajusta os caminhos que
 * vêm do cadastro — fotos de produtos, imagens de categorias, logos de marcas —
 * para funcionarem nos dois casos.
 *
 * Endereços completos (http://, https://, data:) passam intactos.
 */
export function assetUrl(path?: string): string | undefined {
  if (!path) return undefined
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
