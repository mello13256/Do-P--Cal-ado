import { useState } from 'react'
import type { ProductImage } from '../../types/catalog'
import { MediaPlaceholder } from '../brand/MediaPlaceholder'
import { cn } from '../../lib/cn'
import { assetUrl } from '../../lib/assets'

interface ProductGalleryProps {
  images: ProductImage[]
  /** Nome do produto — usado no texto alternativo quando não houver um. */
  productName: string
  categoryName: string
}

export function ProductGallery({ images, productName, categoryName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]
  const withFiles = images.filter((image) => image.src)

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-50">
        <div className="aspect-4/5 sm:aspect-square lg:aspect-4/5">
          {active?.src ? (
            <img
              src={assetUrl(active.src)}
              alt={active.alt || productName}
              className="h-full w-full object-cover"
              decoding="async"
            />
          ) : (
            <MediaPlaceholder label={categoryName} />
          )}
        </div>
      </div>

      {withFiles.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <li key={image.src ?? index}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver foto ${index + 1} de ${productName}`}
                aria-current={index === activeIndex}
                className={cn(
                  'aspect-square w-full overflow-hidden rounded-xl border transition-colors',
                  index === activeIndex
                    ? 'border-brand-500 ring-2 ring-brand-100'
                    : 'border-ink-100 hover:border-ink-300',
                )}
              >
                {image.src ? (
                  <img src={assetUrl(image.src)} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <MediaPlaceholder />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
