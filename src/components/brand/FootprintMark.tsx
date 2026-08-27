import type { SVGProps } from 'react'

/**
 * Pegada do logotipo da loja — o mesmo elemento que forma o "P" de "Pé" no
 * material impresso e aparece na trilha de pegadas do banner institucional.
 */
export function FootprintMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <ellipse cx="53" cy="63" rx="19" ry="25" transform="rotate(-10 53 63)" />
      <ellipse cx="32" cy="34" rx="7.6" ry="9" transform="rotate(-25 32 34)" />
      <ellipse cx="47" cy="26" rx="6" ry="7.4" transform="rotate(-12 47 26)" />
      <ellipse cx="60" cy="24" rx="5.4" ry="6.8" transform="rotate(-4 60 24)" />
      <ellipse cx="71" cy="27" rx="4.7" ry="6" transform="rotate(8 71 27)" />
      <ellipse cx="80" cy="34" rx="4" ry="5" transform="rotate(18 80 34)" />
    </svg>
  )
}
