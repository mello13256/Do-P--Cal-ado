/**
 * Dados institucionais da loja.
 *
 * Este é o único lugar onde endereço, telefones, e-mail e textos fixos ficam
 * definidos — alterar aqui reflete em todo o site (header, footer, contato,
 * mensagens de WhatsApp e dados estruturados).
 */

export const siteConfig = {
  /** Nome oficial da loja. Não usar variações. */
  name: 'Do Pé Calçado',
  shortName: 'Do Pé',
  foundedYear: 1989,
  tagline: 'Tradição desde 1989',
  subtitle: 'Calçados, artigos esportivos e muito mais para toda a família.',
  segment: 'Calçados e Artigos Esportivos',

  seo: {
    title: 'Do Pé Calçado | Calçados e Artigos Esportivos',
    description:
      'Do Pé Calçado — tradição desde 1989 em calçados, artigos esportivos, confecções e muito mais. Encontre produtos para toda a família em Contenda, Paraná.',
    url: 'https://dopecalcado.com.br',
    ogImage: '/og-image.png',
  },

  contact: {
    /** Telefone fixo da loja. */
    phone: '(41) 3625-1295',
    phoneHref: 'tel:+554136251295',
    /** WhatsApp comercial. */
    whatsapp: '(41) 99790-1570',
    /** Formato internacional, sem símbolos — usado nos links wa.me. */
    whatsappNumber: '5541997901570',
    email: 'dopecalcado@gmail.com',
  },

  address: {
    street: 'Av. João Franco, 123',
    district: 'Centro',
    city: 'Contenda',
    state: 'Paraná',
    stateCode: 'PR',
    country: 'Brasil',
    full: 'Av. João Franco, 123 - Centro, Contenda - Paraná',
    /** Consulta usada no mapa incorporado e no link "como chegar". */
    mapsQuery: 'Av. João Franco, 123 - Centro, Contenda - PR',
  },

  hours: [
    { days: 'Segunda a sexta', time: '09h00 às 18h00' },
    { days: 'Sábado', time: '09h00 às 13h00' },
    { days: 'Domingo e feriados', time: 'Fechado' },
  ],

  /**
   * Logotipo. Deixe `null` para usar o logotipo vetorial embutido
   * (componente `Logo`). Para usar o arquivo oficial em alta resolução,
   * coloque-o em `public/` e aponte aqui, ex.: '/logo-do-pe-calcado.png'.
   */
  logoSrc: null as string | null,

  /**
   * Redes sociais — adicione a URL quando a loja tiver perfil.
   * Itens sem `url` simplesmente não aparecem no site.
   */
  social: [
    { id: 'instagram', label: 'Instagram', url: '' },
    { id: 'facebook', label: 'Facebook', url: '' },
  ],

  /** História da loja, conforme o material institucional impresso. */
  history: {
    paragraphs: [
      'A Do Pé Calçado iniciou suas atividades em fevereiro de 1989, comercializando inicialmente uma pequena linha de calçados.',
      'Os anos foram passando e o volume de vendas foi aumentando. Em 1998 a empresa passou por uma renovação, consolidando-se no mercado contendense através da sua seriedade, competência e transparência nos negócios.',
      'Sendo assim, só nos resta agradecer a Deus, aos nossos clientes, amigos, colaboradores e parceiros por todas essas glórias. Muito obrigado a todos.',
    ],
    verse: {
      text: 'Quanto ao mais, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude, e se há algum louvor, nisso pensai.',
      reference: 'Filipenses 4:8',
    },
  },
} as const

/** Faixas de numeração praticadas pela loja, por público. */
export const sizeRanges = {
  masculino: { min: 33, max: 47 },
  feminino: { min: 33, max: 40 },
  infantil: { min: 15, max: 32 },
} as const

export const genderLabels = {
  masculino: 'Masculinos',
  feminino: 'Femininos',
  infantil: 'Infantis',
  unissex: 'Unissex',
} as const

export const availabilityLabels = {
  'em-estoque': 'Em estoque',
  indisponivel: 'Indisponível',
} as const

export const sortLabels = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  novidades: 'Novidades',
  nome: 'Nome (A-Z)',
} as const
