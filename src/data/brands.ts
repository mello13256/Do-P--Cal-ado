import type { Brand } from '../types/catalog'

/**
 * Marcas comercializadas pela loja (identificadas no cartão de visita e no
 * material institucional impresso).
 *
 * Para usar o logo oficial de uma marca, coloque o arquivo em
 * `public/brands/<slug>.svg` (ou .png) e preencha o campo `logo`.
 * Sem arquivo, o componente `BrandLogo` desenha um wordmark tipográfico
 * discreto — nunca uma imitação do logotipo oficial.
 */

export interface BrandRecord extends Brand {
  /** `true` = marca parceira exibida na seção "Marcas". */
  partner: boolean
}

export const brands: BrandRecord[] = [
  {
    id: 'penalty',
    slug: 'penalty',
    name: 'Penalty',
    logo: '',
    color: '#111827',
    description: 'Chuteiras, bolas e artigos esportivos.',
    partner: true,
  },
  {
    id: 'comfortflex',
    slug: 'comfortflex',
    name: 'Comfortflex',
    logo: '',
    color: '#c8102e',
    description: 'Calçados femininos com foco em conforto.',
    partner: true,
  },
  {
    id: 'olympikus',
    slug: 'olympikus',
    name: 'Olympikus',
    logo: '',
    color: '#1b2f8a',
    description: 'Tênis esportivos e de caminhada.',
    partner: true,
  },
  {
    id: 'via-marte',
    slug: 'via-marte',
    name: 'Via Marte',
    logo: '',
    color: '#c2185b',
    description: 'Sandálias e tamancos femininos.',
    partner: true,
  },
  {
    id: 'macboot',
    slug: 'macboot',
    name: 'Macboot',
    logo: '',
    color: '#6d9b00',
    description: 'Botas e calçados para trilha e uso diário.',
    partner: true,
  },
  {
    id: 'ramarim',
    slug: 'ramarim',
    name: 'Ramarim',
    logo: '',
    color: '#141619',
    description: 'Calçados femininos para o dia a dia.',
    partner: true,
  },
  {
    id: 'umbro',
    slug: 'umbro',
    name: 'Umbro',
    logo: '',
    color: '#111111',
    description: 'Artigos esportivos e confecções.',
    partner: true,
  },
  {
    id: 'dakota',
    slug: 'dakota',
    name: 'Dakota',
    logo: '',
    color: '#e2231a',
    description: 'Calçados femininos e infantis.',
    partner: true,
  },
  {
    id: 'freeway',
    slug: 'freeway',
    name: 'Freeway',
    logo: '',
    color: '#141619',
    description: 'Calçados casuais para toda a família.',
    partner: true,
  },
  {
    id: 'outras-marcas',
    slug: 'outras-marcas',
    name: 'Outras marcas',
    color: '#545a63',
    description: 'Itens diversos disponíveis na loja.',
    partner: false,
  },
]
