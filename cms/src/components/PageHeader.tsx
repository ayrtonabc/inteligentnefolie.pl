import { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  icon?: ReactNode
  trailing?: ReactNode
}

export default function PageHeader({ title, subtitle, icon, trailing }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5">{icon}</div>}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {trailing && <div className="flex items-center gap-3">{trailing}</div>}
    </div>
  )
}
