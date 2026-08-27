import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'info' | 'success' | 'error' | 'warning'

const tones: Record<Tone, string> = {
  info: 'bg-ink-50 text-ink-700 ring-ink-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  error: 'bg-brand-50 text-brand-700 ring-brand-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
}

export function AdminNotice({
  tone = 'info',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-xl px-4 py-3 text-sm ring-1', tones[tone], className)}
    >
      {children}
    </div>
  )
}
