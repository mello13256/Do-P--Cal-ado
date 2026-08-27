import { siteConfig } from '../../config/site'
import { generalContactMessage, whatsappLink } from '../../lib/whatsapp'
import { IconWhatsApp } from '../ui/icons'

/** Botão flutuante de WhatsApp — sempre ao alcance do polegar no celular. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(generalContactMessage())}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-[#1faa54] px-4 text-white shadow-lg transition-all duration-200 hover:bg-[#178c45] hover:shadow-xl sm:right-6"
      aria-label={`Falar com a ${siteConfig.name} no WhatsApp`}
    >
      <IconWhatsApp className="text-2xl" aria-hidden="true" />
      <span className="hidden text-sm font-semibold sm:inline">Fale conosco</span>
    </a>
  )
}
