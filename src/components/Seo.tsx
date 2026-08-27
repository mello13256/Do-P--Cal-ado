import { useEffect } from 'react'
import { siteConfig } from '../config/site'

interface SeoProps {
  /** Título específico da página; o nome da loja é acrescentado. */
  title?: string
  description?: string
  /** Caminho canônico, ex.: '/produtos'. */
  path?: string
  image?: string
  noindex?: boolean
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/**
 * SEO por página em uma SPA: atualiza título, descrição, canônica e Open Graph
 * a cada navegação. (Para pré-renderização/SSR, o passo natural é migrar para
 * Next.js ou adicionar um pré-render no build.)
 */
export function Seo({ title, description, path, image, noindex = false }: SeoProps) {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.seo.title
  const finalDescription = description ?? siteConfig.seo.description
  const url = `${siteConfig.seo.url}${path ?? ''}`
  const finalImage = image ?? siteConfig.seo.ogImage

  useEffect(() => {
    document.title = fullTitle

    setMeta('meta[name="description"]', 'name', 'description', finalDescription)
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', finalDescription)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:image"]', 'property', 'og:image', finalImage)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', finalDescription)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.name = 'robots'
        document.head.appendChild(robots)
      }
      robots.content = 'noindex'
    } else if (robots) {
      robots.remove()
    }
  }, [fullTitle, finalDescription, url, finalImage, noindex])

  return null
}
