import type { SVGProps } from 'react'

/**
 * Ícones em SVG inline — sem dependência externa e sem custo de rede.
 * Todos herdam a cor do texto (`currentColor`) e são decorativos por padrão.
 */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width="1em"
      height="1em"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconSearch = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
)

export const IconCart = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 4h2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L21 8H6" />
    <circle cx="10" cy="20" r="1.3" />
    <circle cx="18" cy="20" r="1.3" />
  </Icon>
)

export const IconMenu = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const IconClose = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
)

export const IconFilter = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Icon>
)

export const IconChevronDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)

export const IconChevronRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
)

export const IconChevronLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="m15 6-6 6 6 6" />
  </Icon>
)

export const IconArrowRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 12h15m0 0-6-6m6 6-6 6" />
  </Icon>
)

export const IconPlus = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const IconMinus = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12h14" />
  </Icon>
)

export const IconTrash = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </Icon>
)

export const IconCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 13 4 4 10-10" />
  </Icon>
)

export const IconPhone = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />
  </Icon>
)

export const IconMail = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Icon>
)

export const IconMapPin = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
)

export const IconClock = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const IconWhatsApp = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.34 4.95L2 22l5.22-1.37a9.9 9.9 0 0 0 4.82 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.16 8.16 0 0 1-1.25-4.34c0-4.55 3.7-8.25 8.26-8.25a8.25 8.25 0 0 1 0 16.5Zm4.53-6.18c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
)

export const IconCamera = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
)

export const IconInstagram = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17 7h.01" />
  </Icon>
)

export const IconFacebook = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V3h-2.2A4.3 4.3 0 0 0 10.5 7.3v1.2H8V12h2.5v9h3.5v-9h2.4l.6-3.5H14Z" />
  </Icon>
)
