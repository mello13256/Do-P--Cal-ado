# Do Pé Calçado — site institucional e catálogo

Site da **Do Pé Calçado**, loja de calçados e artigos esportivos de Contenda (PR),
em atividade desde 1989.

Inclui página inicial, catálogo com filtros funcionais, busca, página de produto,
carrinho com envio de pedido pelo WhatsApp, seção de marcas, história da loja e
contato — tudo pronto para receber os produtos reais e, mais adiante, um painel
administrativo.

---

## 1. Tecnologias utilizadas

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Interface | **React 19 + TypeScript** | Componentes reutilizáveis e tipagem em todo o catálogo |
| Build/dev | **Vite 8** | Servidor de desenvolvimento instantâneo e build otimizado |
| Estilos | **Tailwind CSS v4** | Design consistente, com as cores da loja definidas como tokens em `src/index.css` |
| Rotas | **React Router 7** | Navegação entre páginas e filtros guardados na URL |
| Estado do carrinho | **Context API + localStorage** | Simples, sem dependências extras, e o carrinho sobrevive ao recarregar |
| Ícones | SVG inline (`src/components/ui/icons.tsx`) | Sem biblioteca externa, sem custo de rede |

Nenhuma dependência além de React, React Router e Tailwind.

### Identidade visual

As cores e os elementos vieram do material impresso da loja (placa, cartão de
visita e banner institucional):

- vermelho da fachada: `--color-brand-500: #d93a28`;
- preto/cinza dos textos: escala `--color-ink-*`;
- creme dos materiais institucionais: `--color-cream`;
- a **pegada** do logotipo virou o símbolo do site (`FootprintMark`), o favicon,
  a marca d'água dos placeholders e a trilha de fundo do destaque;
- o carimbo **“Desde 1989”** foi recriado em SVG (`SinceBadge`).

O nome da loja aparece sempre como **Do Pé Calçado**.

---

## 2. Estrutura de pastas

```
public/
├── brands/             Logos das marcas (ver README lá dentro)
├── categorias/         Fotos das categorias
├── produtos/           Fotos dos produtos
├── favicon.svg         Pegada da loja sobre o vermelho da fachada
├── og-image.png        Imagem de compartilhamento (Open Graph)
├── pattern-pegadas.svg Trilha de pegadas usada como textura
├── robots.txt · sitemap.xml · _redirects

src/
├── config/site.ts            Endereço, telefones, e-mail, horários, história, SEO
├── types/catalog.ts          Modelos: Product, Category, Brand, CatalogQuery…
├── data/                     ⬅️ DADOS (hoje estáticos)
│   ├── products.ts           Produtos demonstrativos
│   ├── categories.ts         As 9 categorias
│   └── brands.ts             As 9 marcas + "Outras marcas"
├── services/                 ⬅️ FONTE DE DADOS (ponto de troca para API/banco)
│   ├── catalogService.ts     Contratos de leitura e de escrita (futuro admin)
│   ├── staticCatalogService.ts  Implementação sobre os arquivos de `data/`
│   ├── checkoutService.ts    Pedido pelo WhatsApp (troque por um gateway depois)
│   └── index.ts              Exporta o serviço ativo
├── hooks/                    useCatalog, useProductFilters, useCart, useAsync…
├── context/                  CartProvider + contrato do carrinho
├── lib/                      formatação de preço, numerações, links de WhatsApp
├── components/
│   ├── brand/                Logo, FootprintMark, SinceBadge, BrandLogo, placeholders
│   ├── layout/               Header, MobileMenu, Footer, WhatsAppFloat, Layout
│   ├── home/                 Hero, CategoryCard, CategorySection, FeaturedProducts,
│   │                         BrandSection, AboutSection, ContactSection, TrustStrip
│   ├── catalog/              SearchBar, ProductCard, ProductGrid, ProductFilters,
│   │                         PriceRangeFilter, ActiveFilters, Pagination, SortSelect
│   ├── product/              ProductGallery, SizePicker
│   ├── cart/                 CartDrawer, CartItemRow
│   └── ui/                   Button, Drawer, Badge, Section, Skeleton, Breadcrumbs, icons
└── pages/                    Home, Catálogo, Produto, Categorias, Marcas, Sobre, Contato, 404
```

Regra que orienta a arquitetura: **nenhum componente visual importa produtos
diretamente**. Tudo passa pelo `catalogService`.

---

## 3. Como executar o projeto

Requisitos: Node.js 20 ou superior.

```bash
npm install      # instala as dependências
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera a versão de produção em dist/
npm run preview  # testa localmente o build de produção
npm run lint     # verificação estática (oxlint)
```

Publicação: o conteúdo de `dist/` é estático e pode ir para Netlify, Vercel,
Cloudflare Pages, Hostinger etc. Por ser uma SPA, o servidor precisa devolver
`index.html` em qualquer rota — o arquivo `public/_redirects` já resolve isso na
Netlify; na Vercel, use um `vercel.json` com um *rewrite* de `/(.*)` para `/index.html`.

Antes de publicar, ajuste `siteConfig.seo.url` em `src/config/site.ts` e o
`sitemap.xml` para o domínio real.

---

## 4. Onde alterar os produtos

**`src/data/products.ts`** — é o único arquivo a mexer.

```ts
{
  id: 'p-001',
  slug: 'tenis-esportivo-corrida-leve',   // vira a URL /produtos/<slug>
  name: 'Tênis Esportivo Corrida Leve',
  brandId: 'olympikus',                   // precisa existir em data/brands.ts
  categoryId: 'tenis',                    // precisa existir em data/categories.ts
  gender: 'masculino',                    // masculino | feminino | infantil | unissex
  sizes: sizeRange(38, 44),               // ou [38, 40, 42]
  price: 249.9,                           // número, sem "R$"
  availability: 'em-estoque',             // ou 'indisponivel'
  description: '…',
  highlights: ['…'],                      // opcional
  images: [{ src: '/produtos/foto.jpg', alt: 'Descrição da foto' }],
  featured: true,                         // aparece nos destaques da home
  sku: 'OLY-COR-001',
  createdAt: '2025-02-10',                // usado na ordenação "Novidades"
}
```

> ⚠️ Os produtos que vêm no projeto são **demonstrativos** — nomes, preços e
> numerações são exemplos. O catálogo exibe um aviso discreto sobre isso; para
> removê-lo, apague o parágrafo indicado em `src/pages/CatalogPage.tsx`.

- **Fotos**: coloque em `public/produtos/` e informe o caminho em `images[].src`
  (proporção 4:5, ~1000 × 1250 px). Sem foto, o site desenha um placeholder da
  loja — nunca uma foto genérica de banco de imagens.
- **Categorias**: `src/data/categories.ts` (nome, frase do card, imagem, ordem).
- **Marcas**: `src/data/brands.ts`.
- A arquitetura já pagina (12 por página) e filtra em memória, então centenas de
  produtos funcionam sem mudanças.

---

## 5. Onde substituir as logos

### Logotipo da loja

O site desenha o logotipo em vetor (símbolo da pegada + nome). Para usar o
arquivo oficial em alta resolução:

1. coloque o arquivo em `public/` (ex.: `public/logo-do-pe-calcado.png`);
2. em `src/config/site.ts`, defina:

```ts
logoSrc: '/logo-do-pe-calcado.png',
```

O componente `Logo` passa a renderizar a imagem em todos os lugares (cabeçalho,
rodapé e menu). O favicon fica em `public/favicon.svg` e a imagem de
compartilhamento em `public/og-image.png`.

### Logos das marcas

1. salve o arquivo em `public/brands/<slug>.svg` (slugs em `src/data/brands.ts`);
2. preencha o campo `logo` da marca:

```ts
{ id: 'penalty', slug: 'penalty', name: 'Penalty', logo: '/brands/penalty.svg', … }
```

Enquanto não houver arquivo, o componente `BrandLogo` mostra o nome da marca em
texto — nunca uma imitação do logotipo. Use apenas material fornecido pelas
próprias marcas ou pelos representantes.

---

## 6. Como conectar um banco de dados no futuro

Todo o site consome o contrato `CatalogService` (`src/services/catalogService.ts`).
Para trocar a origem dos dados:

1. crie a implementação, por exemplo `src/services/apiCatalogService.ts`:

```ts
export const apiCatalogService: CatalogService = {
  async listProducts(query = {}) {
    const params = new URLSearchParams(/* … monta a query … */)
    const response = await fetch(`/api/produtos?${params}`)
    if (!response.ok) throw new Error('Falha ao carregar produtos')
    return response.json()   // { items, total, page, perPage, totalPages }
  },
  // … demais métodos do contrato
}
```

2. troque **uma linha** em `src/services/index.ts`:

```ts
export const catalogService: CatalogService = apiCatalogService
```

Nenhum componente visual muda. O backend pode ser o que for (Node + Postgres,
Supabase, Firebase, WordPress headless, um ERP com API): basta responder no
formato de `src/types/catalog.ts`.

Pagamento online segue o mesmo caminho: hoje `checkoutService` monta o pedido no
WhatsApp; para usar um gateway, crie outra implementação de `CheckoutService` que
devolva a URL de pagamento e troque a exportação no fim de
`src/services/checkoutService.ts`.

---

## 7. Como criar o painel administrativo no futuro

O contrato de escrita já está desenhado em `src/services/catalogService.ts`:

```ts
interface CatalogWriteService {
  createProduct, updateProduct, deleteProduct,
  updatePrice, updateAvailability, uploadProductImage,
  createBrand, createCategory
}
```

Caminho sugerido:

1. **Backend**: API REST (ou Supabase) com tabelas `products`, `categories`,
   `brands` espelhando `src/types/catalog.ts`, mais autenticação para a loja.
2. **Site público**: passa a usar o `apiCatalogService` (item 6). Nada mais muda.
3. **Painel**: aplicação separada (ou uma rota `/admin` protegida neste mesmo
   projeto) que implementa o `CatalogWriteService` — cadastro e edição de
   produtos, preço, estoque, upload de imagens, marcas e categorias.
4. Como o site lê tudo por métodos assíncronos, o estoque atualizado pelo painel
   aparece no site sem qualquer reescrita de interface.

---

## Funcionalidades implementadas

- **Catálogo** com paginação e ordenação (relevância, preço, novidades, nome).
- **Filtros funcionais** — categoria, público (masculino/feminino/infantil),
  numeração (15 ao 47, ajustada ao público escolhido), marca, disponibilidade e
  faixa de preço com controle deslizante. Tudo refletido na URL, então o link
  filtrado pode ser compartilhado.
- **Busca** por nome, marca e categoria, com sugestões no cabeçalho e filtro ao
  vivo dentro do catálogo (sem acento também encontra: “tenis” acha “Tênis”).
- **Página de produto** com galeria, numerações, disponibilidade, descrição,
  botão “Tenho interesse” (WhatsApp com mensagem pronta) e sugestões relacionadas.
- **Carrinho** com quantidade, subtotal, persistência local e envio do pedido
  pelo WhatsApp com itens, quantidades, valores e total.
- **Acessibilidade**: HTML semântico, hierarquia de headings, foco visível, menu,
  carrinho e filtros em painéis com foco preso e fechamento por `Esc`, textos
  alternativos e alvos de toque de 44 px.
- **Mobile primeiro**: menu hambúrguer, filtros em drawer, grade de 2 colunas e
  WhatsApp sempre ao alcance.
- **SEO**: título e descrição por página, Open Graph, dados estruturados
  (`ShoeStore`), `robots.txt` e `sitemap.xml`.

## Contato da loja

**Do Pé Calçado** — Av. João Franco, 123 - Centro, Contenda - Paraná
Telefone (41) 3625-1295 · WhatsApp (41) 99790-1570 · dopecalcado@gmail.com
