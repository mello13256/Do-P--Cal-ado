import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Cada navegação começa no topo da página (exceto ao mudar filtros na URL). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}
