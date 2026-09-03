# Do Pé Calçados — site institucional e catálogo

Site da **Do Pé Calçados**, loja de calçados e artigos esportivos de Contenda (PR),
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
| Banco de dados | **Supabase (Postgres)** | SQL gerenciado, com autenticação e armazenamento de fotos inclusos |
| Estado do carrinho | **Context API + localStorage** | Simples, sem dependências extras, e o carrinho sobrevive ao recarregar |
| Ícones | SVG inline (`src/components/ui/icons.tsx`) | Sem biblioteca externa, sem custo de rede |

Dependências: React, React Router, Tailwind e o cliente do Supabase.

O site funciona nos dois modos:

- **com Supabase configurado** → catálogo lido e gravado no banco Postgres, e o
  painel administrativo em `/admin` exige login;
- **sem Supabase** → catálogo lido de `src/data`, e o painel abre em modo
  demonstração (as alterações ficam no navegador). Útil para desenvolver e como
  rede de segurança se o banco estiver indisponível.

### Identidade visual

As cores e os elementos vieram do material impresso da loja (placa, cartão de
visita e banner institucional):

- vermelho da fachada: `--color-brand-500: #d93a28`;
- preto/cinza dos textos: escala `--color-ink-*`;
- creme dos materiais institucionais: `--color-cream`;
- a **pegada** do logotipo virou o símbolo do site (`FootprintMark`), o favicon,
  a marca d'água dos placeholders e a trilha de fundo do destaque;
- o carimbo **“Desde 1989”** foi recriado em SVG (`SinceBadge`).

O nome da loja aparece sempre como **Do Pé Calçados**.

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
├── services/                 ⬅️ FONTE DE DADOS
│   ├── catalogService.ts     Contrato de leitura do catálogo
│   ├── admin/adminService.ts Contrato de escrita (usado pelo painel)
│   ├── staticCatalogService.ts  Leitura do catálogo local (`src/data`)
│   ├── local/                Catálogo local + escrita em modo demonstração
│   ├── supabase/             Cliente, leitura e escrita no Postgres
│   ├── auth.ts               Login do painel (Supabase Auth)
│   ├── checkoutService.ts    Pedido pelo WhatsApp (troque por um gateway depois)
│   └── index.ts              Escolhe Supabase ou catálogo local
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
├── pages/                    Home, Catálogo, Produto, Categorias, Marcas, Sobre, Contato, 404
│   └── admin/                Painel: login, produtos, formulário, marcas, categorias
└── components/admin/         Campos de formulário e avisos do painel

supabase/
├── instalacao-completa.sql   Tudo em um arquivo só, para colar no SQL Editor
├── migrations/               Schema, políticas de acesso e armazenamento
├── seed.sql                  Catálogo atual em SQL (gerado por `npm run seed:sql`)
└── README.md                 Passo a passo para criar o banco

scripts/gerar-seed.mjs        Gera o seed.sql a partir de src/data
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
npm run seed:sql # regera supabase/seed.sql a partir de src/data
```

Para ligar o banco de dados, copie `.env.example` para `.env` e preencha as duas
variáveis do Supabase — o passo a passo completo está em
[`supabase/README.md`](supabase/README.md).

Publicação: o conteúdo de `dist/` é estático e pode ir para Netlify, Vercel,
Cloudflare Pages, Hostinger etc. Por ser uma SPA, o servidor precisa devolver
`index.html` em qualquer rota — o arquivo `public/_redirects` já resolve isso na
Netlify; na Vercel, use um `vercel.json` com um *rewrite* de `/(.*)` para `/index.html`.

Antes de publicar, ajuste `siteConfig.seo.url` em `src/config/site.ts` e o
`sitemap.xml` para o domínio real.

---

## 4. Onde alterar os produtos

Depende de como o site está rodando:

- **Com o Supabase configurado** (recomendado): pelo **painel administrativo** em
  `/admin`. Os arquivos de `src/data` deixam de alimentar o site e passam a ser
  apenas a semente inicial do banco.
- **Sem o Supabase**: editando **`src/data/products.ts`** — é o único arquivo a mexer.

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

## 6. Banco de dados (Supabase / Postgres)

O catálogo vive em seis tabelas — `brands`, `categories`, `products`,
`product_images`, `product_sizes` e `admins`. O schema, as políticas de acesso e
o armazenamento das fotos estão em `supabase/migrations/`, e o passo a passo de
instalação em **[`supabase/README.md`](supabase/README.md)**.

Resumo:

1. crie o projeto no Supabase;
2. cole `supabase/instalacao-completa.sql` no SQL Editor e rode — cria tudo e já
   carrega o catálogo;
3. crie o usuário do painel em *Authentication → Users* e cadastre o UID dele na
   tabela `admins`;
4. preencha `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

Duas coisas que o banco resolve sozinho:

- **estoque por numeração** — `product_sizes` guarda quantos pares há de cada
  numeração, e um gatilho tira do site as numerações que zeraram;
- **busca sem acento** — a coluna gerada `search_text` faz “tenis” encontrar
  “Tênis” dentro do próprio Postgres.

Filtros, busca, ordenação e paginação são executados no banco (`supabaseCatalogService`),
então a página carrega apenas os 12 produtos que vai mostrar — o catálogo pode
crescer bastante sem ficar lento.

O projeto Supabase da loja já vem configurado em
`src/services/supabase/client.ts` (a chave `anon` é pública por natureza — quem
protege os dados são as políticas de RLS). As variáveis `VITE_SUPABASE_*` do
`.env` continuam valendo e têm preferência, úteis para apontar para outro
projeto.

Se o banco estiver fora do ar, a leitura cai automaticamente no catálogo de
`src/data` (`resilientCatalogService`) — o cliente vê a loja funcionando em vez
de uma página vazia, e o aviso fica no console do navegador.

A escolha da origem acontece em `src/services/index.ts`; para usar outro backend
no futuro, basta escrever novas implementações de `CatalogService` (leitura) e
`CatalogAdminService` (escrita) e trocar duas linhas ali.

Pagamento online segue o mesmo desenho: hoje o `checkoutService` monta o pedido
no WhatsApp; para usar um gateway, crie outra implementação de `CheckoutService`
que devolva a URL de pagamento.

---

## 7. Painel administrativo

Fica em **`/admin`** (e `/admin/entrar` para o login). Permite:

- cadastrar, editar e excluir produtos;
- alterar preço e disponibilidade direto na listagem;
- controlar o **estoque por numeração**;
- enviar fotos (vão para o armazenamento do Supabase) ou informar o caminho —
  ao enviar, uma tela mostra o quadro 4:5 usado no site para escolher o
  enquadramento antes de subir, ou encaixar a foto inteira sobre fundo branco;
- marcar produto como destaque ou escondê-lo do site sem excluir;
- cadastrar e editar marcas e categorias.

**Acesso.** Com o Supabase configurado, é preciso entrar com uma conta criada em
*Authentication → Users* **e** cadastrada na tabela `admins`. As políticas de RLS
recusam gravações de qualquer outro usuário — mesmo que alguém use a chave
pública do site. Sem Supabase, o painel abre em modo demonstração, avisando na
tela que as alterações ficam só naquele navegador.

O painel não é indexado pelos buscadores (`noindex` e `Disallow` no `robots.txt`)
e o código dele só é baixado por quem acessa `/admin`.

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
- **Painel administrativo** em `/admin`, com login, cadastro de produtos, marcas
  e categorias, controle de estoque por numeração e envio de fotos.

## Contato da loja

**Do Pé Calçados** — Av. João Franco, 123 - Centro, Contenda - Paraná
Telefone (41) 3625-1295 · WhatsApp (41) 98425-7093 · dopecalcado@hotmail.com
