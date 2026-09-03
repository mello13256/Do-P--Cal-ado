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

/**
 * Enquadramento das fotos.
 *
 * No site a foto do produto sempre aparece num quadro 4 x 5 (retrato). Antes,
 * a imagem enviada era simplesmente cortada pelo navegador — e o corte caía
 * onde caísse, às vezes fatiando o calçado. Agora o painel abre um recorte
 * antes do envio: quem cadastra escolhe o pedaço que fica visível e o arquivo
 * já sobe no formato certo — no mesmo limite de tamanho usado acima, para não
 * recomprimir a foto duas vezes.
 */
export const SAIDA_DO_RECORTE = { largura: 1120, altura: LARGURA_MAXIMA }
export const ASPECTO_DA_FOTO = SAIDA_DO_RECORTE.largura / SAIDA_DO_RECORTE.altura

/** Foto de celular tem 4000 px; para escolher o corte 1600 px bastam. */
const FONTE_MAXIMA = 1600

export interface FonteDaFoto {
  /** Foto já com a orientação do celular aplicada e reduzida. */
  canvas: HTMLCanvasElement
  /** Endereço temporário da mesma imagem, para mostrar na tela. */
  url: string
  largura: number
  altura: number
}

/** Pedaço escolhido da foto, em pixels da fonte. */
export interface AreaDeRecorte {
  x: number
  y: number
  largura: number
  altura: number
}

interface ImagemCarregada {
  fonte: CanvasImageSource
  largura: number
  altura: number
  liberar: () => void
}

async function carregarImagem(arquivo: File): Promise<ImagemCarregada> {
  if (typeof createImageBitmap === 'function') {
    try {
      // `from-image` respeita o giro gravado pela câmera — sem isso a foto
      // do celular chega deitada.
      const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
      return {
        fonte: bitmap,
        largura: bitmap.width,
        altura: bitmap.height,
        liberar: () => bitmap.close(),
      }
    } catch {
      // Navegador antigo ou formato exótico: tenta pelo <img>.
    }
  }

  const url = URL.createObjectURL(arquivo)
  try {
    const imagem = await new Promise<HTMLImageElement>((resolver, rejeitar) => {
      const elemento = new Image()
      elemento.onload = () => resolver(elemento)
      elemento.onerror = () => rejeitar(new Error('Não foi possível abrir esta foto.'))
      elemento.src = url
    })
    return {
      fonte: imagem,
      largura: imagem.naturalWidth,
      altura: imagem.naturalHeight,
      liberar: () => URL.revokeObjectURL(url),
    }
  } catch (erro) {
    URL.revokeObjectURL(url)
    throw erro
  }
}

async function urlDaImagem(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob | null>((resolver) =>
    canvas.toBlob(resolver, 'image/jpeg', 0.9),
  )
  return blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/jpeg', 0.9)
}

/** Prepara a foto escolhida para ser enquadrada na tela. */
export async function abrirFotoParaRecorte(arquivo: File): Promise<FonteDaFoto> {
  const imagem = await carregarImagem(arquivo)
  try {
    const escala = Math.min(1, FONTE_MAXIMA / Math.max(imagem.largura, imagem.altura))
    const largura = Math.max(1, Math.round(imagem.largura * escala))
    const altura = Math.max(1, Math.round(imagem.altura * escala))

    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    const contexto = canvas.getContext('2d')
    if (!contexto) throw new Error('Este navegador não conseguiu preparar a foto.')
    contexto.imageSmoothingQuality = 'high'
    contexto.drawImage(imagem.fonte, 0, 0, largura, altura)

    return { canvas, url: await urlDaImagem(canvas), largura, altura }
  } finally {
    imagem.liberar()
  }
}

/**
 * Monta o arquivo final no formato em que o site mostra as fotos.
 * `area` é o pedaço escolhido; `null` significa "imagem inteira", encaixada
 * no quadro sobre fundo branco, sem cortar nada.
 */
export async function gerarFotoRecortada(
  fonte: FonteDaFoto,
  area: AreaDeRecorte | null,
  nomeOriginal: string,
): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = SAIDA_DO_RECORTE.largura
  canvas.height = SAIDA_DO_RECORTE.altura

  const contexto = canvas.getContext('2d')
  if (!contexto) throw new Error('Este navegador não conseguiu recortar a foto.')
  contexto.imageSmoothingQuality = 'high'
  contexto.fillStyle = '#ffffff'
  contexto.fillRect(0, 0, canvas.width, canvas.height)

  if (area) {
    contexto.drawImage(
      fonte.canvas,
      area.x,
      area.y,
      area.largura,
      area.altura,
      0,
      0,
      canvas.width,
      canvas.height,
    )
  } else {
    const escala = Math.min(canvas.width / fonte.largura, canvas.height / fonte.altura)
    const largura = fonte.largura * escala
    const altura = fonte.altura * escala
    contexto.drawImage(
      fonte.canvas,
      (canvas.width - largura) / 2,
      (canvas.height - altura) / 2,
      largura,
      altura,
    )
  }

  const blob = await new Promise<Blob | null>((resolver) =>
    canvas.toBlob(resolver, 'image/jpeg', QUALIDADE),
  )
  if (!blob) throw new Error('Não foi possível salvar a foto recortada.')

  const nome = nomeOriginal.replace(/\.[^.]+$/, '') || 'foto'
  return new File([blob], `${nome}.jpg`, { type: 'image/jpeg' })
}
