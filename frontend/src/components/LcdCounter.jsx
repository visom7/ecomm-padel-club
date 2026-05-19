const SIZE = {
  sm: { w: 28, h: 38, fs: 22, gap: 3, radius: 5, glow: 0.6 },
  md: { w: 56, h: 78, fs: 50, gap: 6, radius: 10, glow: 0.7 },
  lg: { w: 80, h: 110, fs: 72, gap: 8, radius: 12, glow: 0.65 },
}

function LcdDigit({ d, size = 'sm' }) {
  const s = SIZE[size]
  return (
    <div
      style={{
        background: '#0A0810',
        border: '1px solid #2A2632',
        width: s.w,
        height: s.h,
        borderRadius: s.radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: s.fs,
          fontWeight: 700,
          lineHeight: 1,
          color: '#F4B400',
          textShadow: `0 0 12px rgba(244,180,0,${s.glow})`,
        }}
      >
        {d}
      </span>
    </div>
  )
}

export default function LcdCounter({ value, size = 'sm', minDigits = 2 }) {
  const capped = Math.min(Math.max(0, Math.floor(Number(value) || 0)), 99)
  const digits = String(capped).padStart(minDigits, '0').split('')
  const gap = SIZE[size].gap
  return (
    <div style={{ display: 'flex', gap }}>
      {digits.map((d, i) => (
        <LcdDigit key={i} d={d} size={size} />
      ))}
    </div>
  )
}
