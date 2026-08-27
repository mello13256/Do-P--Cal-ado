import type { Category } from '../types/catalog'

/**
 * Categorias do catálogo.
 *
 * Para usar fotos reais nos cards, coloque as imagens em `public/categorias/`
 * e preencha o campo `image` (ex.: '/categorias/tenis.jpg'). Sem imagem, o
 * site desenha um placeholder com a identidade da loja.
 */
export const categories: Category[] = [
  {
    id: 'tenis',
    slug: 'tenis',
    name: 'Tênis',
    tagline: 'Confira nossos modelos',
    description:
      'Tênis esportivos, casuais e de caminhada para adultos e crianças, das marcas que a loja trabalha há décadas.',
    image: '',
    order: 1,
  },
  {
    id: 'chuteira',
    slug: 'chuteira',
    name: 'Chuteira',
    tagline: 'Para quem leva o jogo a sério',
    description: 'Chuteiras de campo, society e futsal em numerações adulto e infantil.',
    image: '',
    order: 2,
  },
  {
    id: 'sandalia',
    slug: 'sandalia',
    name: 'Sandália',
    tagline: 'Conforto para o dia a dia',
    description: 'Sandálias femininas, masculinas e infantis para todos os momentos.',
    image: '',
    order: 3,
  },
  {
    id: 'tamanco',
    slug: 'tamanco',
    name: 'Tamanco',
    tagline: 'Leveza e estilo',
    description: 'Tamancos confortáveis, do modelo básico ao salto bloco.',
    image: '',
    order: 4,
  },
  {
    id: 'calcado',
    slug: 'calcado',
    name: 'Calçado',
    tagline: 'Do trabalho ao passeio',
    description: 'Sapatos, botas, sapatilhas e mocassins para o dia a dia.',
    image: '',
    order: 5,
  },
  {
    id: 'artigos-esportivos',
    slug: 'artigos-esportivos',
    name: 'Artigos esportivos',
    tagline: 'Bolas, meiões e acessórios',
    description: 'Tudo para treinar e jogar: bolas, caneleiras, meiões e acessórios.',
    image: '',
    order: 6,
  },
  {
    id: 'confeccoes',
    slug: 'confeccoes',
    name: 'Confecções',
    tagline: 'Roupas para toda a família',
    description: 'Camisetas, shorts, agasalhos e conjuntos esportivos.',
    image: '',
    order: 7,
  },
  {
    id: 'brinquedos',
    slug: 'brinquedos',
    name: 'Brinquedos',
    tagline: 'Diversão para a criançada',
    description: 'Bolas, brinquedos de praia e itens para brincar dentro e fora de casa.',
    image: '',
    order: 8,
  },
  {
    id: 'diversos',
    slug: 'diversos',
    name: 'Diversos',
    tagline: 'Um pouco de tudo na loja',
    description: 'Palmilhas, cadarços, produtos de limpeza e cuidado para calçados.',
    image: '',
    order: 9,
  },
]
