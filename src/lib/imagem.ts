/**
 * Preparo das fotos antes do envio.
 *
 * Foto de celular costuma ter 4 a 8 MB e 4000 px de largura — peso demais para
 * o site e para o pacote de dados de quem visita. Aqui a imagem é reduzida a no
 * máximo 1400 px e recomprimida, o que costuma deixar o arquivo em 200-400 KB
 * sem perda visível na tela.
 */
const LARGURA_MAXIMA = 1400
const QUALIDADE = 0.82

export async function prepararFoto(arquivo: File): Promise<File> {
  // PNG com transparência e formatos que o navegador não decodifica seguem
  // como estão.
  if (!/^image\/(jpe?g|png|webp)$/i.test(arquivo.type)) return arquivo

  try {
    const bitmap = await createImageBitmap(arquivo)
    const escala = Math.min(1, LARGURA_MAXIMA / Math.max(bitmap.width, bitmap.height))

    // Já é pequena o bastante: não vale recomprimir e perder qualidade.
    if (escala === 1 && arquivo.size < 600_000) {
      bitmap.close()
      return arquivo
    }

    const largura = Math.round(bitmap.width * escala)
    const altura = Math.round(bitmap.height * escala)
    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura

    const contexto = canvas.getContext('2d')
    if (!contexto) return arquivo
    contexto.drawImage(bitmap, 0, 0, largura, altura)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolver) =>
      canvas.toBlob(resolver, 'image/jpeg', QUALIDADE),
    )
    if (!blob || blob.size >= arquivo.size) return arquivo

    const nome = arquivo.name.replace(/\.[^.]+$/, '') || 'foto'
    return new File([blob], `${nome}.jpg`, { type: 'image/jpeg' })
  } catch {
    // Qualquer imprevisto: envia o arquivo original.
    return arquivo
  }
}

/** "2,4 MB", para mostrar o que foi economizado. */
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
