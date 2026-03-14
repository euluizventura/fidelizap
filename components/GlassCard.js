export default function GlassCard({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.052)',
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        border: '0.5px solid rgba(255,255,255,0.15)',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* shine line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  )
}
