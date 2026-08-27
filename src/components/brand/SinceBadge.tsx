import { cn } from '../../lib/cn'

/**
 * Selo "Desde 1989" — releitura do carimbo presente no cartão de visita e no
 * banner da loja.
 */
export function SinceBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('h-16 w-16', className)}
      role="img"
      aria-label="Selo: desde 1989"
    >
      <circle cx="60" cy="60" r="58" fill="#ffffff" />
      <circle cx="60" cy="60" r="54" fill="#d93a28" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <text
        x="60"
        y="44"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Lora, Georgia, serif"
        fontStyle="italic"
        fontSize="15"
      >
        Desde
      </text>
      <g>
        <rect x="8" y="58" width="104" height="26" fill="#ffffff" />
        <path d="M8 58 0 63v16l8 5Z" fill="#f1f1f1" />
        <path d="M112 58l8 5v16l-8 5Z" fill="#f1f1f1" />
        <text
          x="60"
          y="78"
          textAnchor="middle"
          fill="#c22e1e"
          fontFamily="Lora, Georgia, serif"
          fontWeight="600"
          fontSize="24"
          letterSpacing="1"
        >
          1989
        </text>
      </g>
      <circle cx="34" cy="96" r="3" fill="#ffffff" />
      <circle cx="86" cy="96" r="3" fill="#ffffff" />
    </svg>
  )
}
