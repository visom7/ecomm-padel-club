export default function EcommLogo({ height = 34, className = '' }) {
  const radius = Math.max(6, Math.round(height * 0.22))
  return (
    <img
      src="/logo.png"
      alt="ecomm pädel club"
      className={className}
      style={{
        height,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        borderRadius: radius,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)',
      }}
    />
  )
}
