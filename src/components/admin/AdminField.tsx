import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '../../lib/cn'

const controlClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-400'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: (id: string) => ReactNode
  className?: string
}

/** Rótulo + campo + ajuda/erro, com os ids ligados corretamente. */
export function Field({ label, hint, error, children, className }: FieldProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-800">
        {label}
      </label>
      {children(id)}
      {hint && !error ? <p className="text-xs text-ink-500">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-brand-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, 'min-h-24 resize-y', className)} {...props} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClass, 'pr-8', className)} {...props} />
}

export function Checkbox({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-3 transition-colors hover:bg-ink-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4.5 w-4.5 cursor-pointer rounded border-ink-300 accent-brand-500"
      />
      <span>
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>
  )
}
