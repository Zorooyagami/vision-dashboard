import { useId } from 'react'

// Pre-computed donut segment paths — viewBox "0 0 100 100", cx=50 cy=50
// outerR=47, innerR=30, angles measured clockwise from 12 o'clock
// Large arc: 133°→357° (224°, teal-to-indigo gradient, covers left ¾)
// Blue:      5°→32°   (indigo, upper-right)
// Purple:    37°→83°  (violet, right)
// Orange:    88°→128° (coral, lower-right)

const P = {
  large:  'M 84.37 82.05 A 47 47 0 1 1 47.54 3.07 L 48.43 20.04 A 30 30 0 1 0 71.94 70.46 Z',
  blue:   'M 54.10 3.12 A 47 47 0 0 1 74.91 10.14 L 65.90 24.56 A 30 30 0 0 0 52.61 20.11 Z',
  purple: 'M 78.29 12.44 A 47 47 0 0 1 96.65 44.27 L 79.78 46.34 A 30 30 0 0 0 68.05 26.04 Z',
  orange: 'M 96.97 48.36 A 47 47 0 0 1 87.04 78.94 L 73.64 68.47 A 30 30 0 0 0 79.98 48.95 Z',
}


export function VisionMark({ size = 32, theme = 'color' }) {
  const uid = useId().replace(/:/g, 'm')

  if (theme === 'muted') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d={P.large}  fill="#CBD5E1" opacity={0.5} />
        <path d={P.blue}   fill="#CBD5E1" opacity={0.5} />
        <path d={P.purple} fill="#CBD5E1" opacity={0.5} />
        <path d={P.orange} fill="#CBD5E1" opacity={0.5} />
        <circle cx="50" cy="50" r="22" fill="#E2E8F0" opacity={0.5} />
      </svg>
    )
  }

  if (theme === 'white') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d={P.large}  fill="rgba(255,255,255,0.9)" />
        <path d={P.blue}   fill="rgba(255,255,255,0.7)" />
        <path d={P.purple} fill="rgba(255,255,255,0.6)" />
        <path d={P.orange} fill="rgba(255,255,255,0.55)" />
        <circle cx="50" cy="50" r="22" fill="rgba(255,255,255,0.15)" />
        <circle cx="55" cy="46" r="4.5" fill="white" />
      </svg>
    )
  }

  // color (default)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`vg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#22D3EE" />
          <stop offset="48%"  stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <path d={P.large}  fill={`url(#vg-${uid})`} />
      <path d={P.blue}   fill="#6366F1" />
      <path d={P.purple} fill="#A855F7" />
      <path d={P.orange} fill="#F97316" />
      <circle cx="50" cy="50" r="22" fill="#0F1117" />
      <circle cx="55" cy="46" r="4.5" fill="white" />
    </svg>
  )
}


export default function VisionLogo({
  size = 32,
  theme = 'color',
  showWordmark = false,
  wordmarkColor,
}) {
  const textCol = wordmarkColor ?? (theme === 'white' ? '#fff' : theme === 'muted' ? '#94A3B8' : '#0F172A')

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.28) }}>
      <VisionMark size={size} theme={theme} />
      {showWordmark && (
        <span style={{
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: Math.round(size * 0.5),
          color: textCol,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          Vision
        </span>
      )}
    </span>
  )
}
