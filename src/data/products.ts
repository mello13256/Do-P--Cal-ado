import type { Product } from '../types/catalog'

/**
 * Catálogo local de produtos.
 *
 * Está vazio de propósito: os produtos reais da loja ficam no banco de dados e
 * são cadastrados pelo painel administrativo (`/admin`).
 *
 * Este arquivo tem duas utilidades:
 *
 * 1. **Reserva.** Se o banco ficar indisponível, o site lê daqui em vez de
 *    quebrar (ver `src/services/resilientCatalogService.ts`). Com a lista
 *    vazia, a loja continua no ar — categorias, marcas, história e contato —
 *    e o catálogo mostra um aviso convidando a falar pelo WhatsApp.
 *
 * 2. **Carga inicial.** Produtos escritos aqui viram SQL com `npm run seed:sql`,
 *    útil para popular um banco novo de uma vez só.
 *
 * Formato de um produto, para quando for útil:
 *
 * {
 *   id: 'p-001',
 *   slug: 'tenis-olympikus-corrida',      // vira a URL /produtos/<slug>
 *   name: 'Tênis Olympikus Corrida',
 *   brandId: 'olympikus',                  // precisa existir em data/brands.ts
 *   categoryId: 'tenis',                   // precisa existir em data/categories.ts
 *   gender: 'masculino',                   // masculino | feminino | infantil | unissex
 *   sizes: sizeRange(38, 44),              // ou [38, 40, 42]
 *   price: 249.9,
 *   availability: 'em-estoque',            // ou 'indisponivel'
 *   description: 'Descrição do produto.',
 *   highlights: ['Solado antiderrapante'],
 *   images: [{ src: '/produtos/foto.jpg', alt: 'Descrição da foto' }],
 *   featured: true,
 *   sku: 'OLY-001',
 *   createdAt: '2026-08-28',
 * }
 */
export const products: Product[] = []
