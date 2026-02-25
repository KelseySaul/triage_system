import { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: ReactNode
  helper?: string
  icon?: ReactNode
  tone?: 'default' | 'info' | 'warning' | 'danger'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'border-slate-100',
  info: 'border-blue-100',
  warning: 'border-amber-100',
  danger: 'border-red-100',
}

export function StatCard({ label, value, helper, icon, tone = 'default' }: StatCardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border ${toneClasses[tone]} flex flex-col justify-between hover:shadow-md transition`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 text-3xl font-bold text-slate-800">{value}</div>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-slate-50 text-slate-700">
            {icon}
          </div>
        )}
      </div>
      {helper && (
        <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
          <span>{helper}</span>
        </div>
      )}
    </div>
  )
}

