const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** R$ 249,90 */
export function formatPrice(value: number): string {
  return currencyFormatter.format(value)
}

/** Lista legível: "38, 39 e 40". */
export function formatList(items: (string | number)[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return String(items[0])
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
}
