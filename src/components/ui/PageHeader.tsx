import { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  kicker?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, kicker, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        {kicker && (
          <p className="text-xs font-semibold tracking-[0.18em] text-indigo-500 uppercase mb-1">
            {kicker}
          </p>
        )}
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-slate-500 mt-1 text-sm max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:pt-1">
          {actions}
        </div>
      )}
    </header>
  )
}

