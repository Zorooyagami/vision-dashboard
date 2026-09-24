import { PERSONAS } from '../data/personas'


export default function PersonaChip({ id, size = 'md', showIcon = true }) {
  const persona = PERSONAS.find(p => p.id === id)
  if (!persona) return null

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-tight ${sizeClasses[size]}`}
      style={{ background: persona.lightBg, color: persona.textColor }}
    >
      {showIcon && (
        <span style={{ fontSize: size === 'sm' ? '9px' : size === 'lg' ? '13px' : '11px' }}>
          {persona.icon}
        </span>
      )}
      {persona.name}
    </span>
  )
}
