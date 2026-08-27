import { IconCheck, IconClock, IconMapPin, IconWhatsApp } from '../ui/icons'

const items = [
  {
    icon: IconCheck,
    title: 'Marcas conhecidas',
    description: 'Penalty, Olympikus, Dakota, Comfortflex e outras que a loja trabalha há anos.',
  },
  {
    icon: IconMapPin,
    title: 'Loja física no Centro',
    description: 'Prove antes de levar: estamos na Av. João Franco, 123, em Contenda.',
  },
  {
    icon: IconWhatsApp,
    title: 'Atendimento pelo WhatsApp',
    description: 'Tire dúvidas, confirme numeração e feche o pedido direto com a equipe.',
  },
  {
    icon: IconClock,
    title: 'Numeração completa',
    description: 'Do 15 infantil ao 47 masculino, com opções para toda a família.',
  },
]

/** Faixa de reforço de confiança logo abaixo do destaque. */
export function TrustStrip() {
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container-page py-10">
        <h2 className="sr-only">Por que comprar na Do Pé Calçados</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <item.icon className="text-lg" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
