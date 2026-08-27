import type { ProductView } from '../../types/catalog'
import { ProductCardSkeleton } from '../ui/Skeleton'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: ProductView[]
  loading?: boolean
  skeletonCount?: number
  emptyState?: React.ReactNode
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  emptyState,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (products.length === 0) return <>{emptyState}</>

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  )
}
