'use client'

import { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

type PageHeaderProps = {
  title: string
  subtitle?: string
  kicker?: string
  actions?: ReactNode
  showBackButton?: boolean
}

export function PageHeader({ title, subtitle, kicker, actions, showBackButton }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-start gap-4">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="mt-1 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 hover:border-indigo-200 shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
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
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:pt-1">
          {actions}
        </div>
      )}
    </header>
  )
}

