import { cn } from '../../lib/cn'
import { formatPrice } from '../../lib/format'
import { descontoEmPorcento, precoDeVenda, temPromocao } from '../../lib/preco'
import type { Product } from '../../types/catalog'

interface PrecoDoProdutoProps {
  produto: Pick<Product, 'price' | 'promoPrice'>
  /** 'card' na listagem, 'pagina' na página do produto. */
  tamanho?: 'card' | 'pagina'
  className?: string
}

/**
 * Preço do produto. Em promoção, o preço antigo aparece riscado e pequeno ao
 * lado, e o novo assume o lugar de destaque, em vermelho.
 */
export function PrecoDoProduto({ produto, tamanho = 'card', className }: PrecoDoProdutoProps) {
  const emPromocao = temPromocao(produto)
  const preco = precoDeVenda(produto)

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span
        className={cn(
          'font-bold',
          tamanho === 'pagina' ? 'text-3xl' : 'text-lg',
          emPromocao ? 'text-brand-600' : 'text-ink-900',
        )}
      >
        {formatPrice(preco)}
      </span>

      {emPromocao ? (
        <>
          <span
            className={cn('text-ink-400 line-through', tamanho === 'pagina' ? 'text-base' : 'text-xs')}
          >
            {formatPrice(produto.price)}
          </span>
          <span className="sr-only">
            Preço promocional, de {formatPrice(produto.price)} por {formatPrice(preco)}
          </span>
          {tamanho === 'pagina' ? (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-sm font-bold text-brand-700">
              -{descontoEmPorcento(produto)}%
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
