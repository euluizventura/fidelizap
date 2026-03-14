import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'

const INTEGRATIONS = [
  { icon: '💬', name: 'WhatsApp Business', type: 'API Oficial Meta', status: 'connected', detail: '1.240 msgs este mês' },
  { icon: '🔵', name: 'Meta Ads', type: 'Facebook & Instagram Ads', status: 'connected', detail: 'R$2.120 · 87 leads gerados' },
  { icon: '🔴', name: 'Google Ads', type: 'Google Search & Display', status: 'connected', detail: 'R$1.840 · 94 leads gerados' },
  { icon: '📸', name: 'Instagram', type: 'Rede social — orgânico', status: 'connected', detail: '58 novos contatos esta semana' },
  { icon: '🌿', name: 'Tráfego Orgânico', type: 'Site, QR Code, Link direto', status: 'connected', detail: '45 novos contatos esta semana' },
  { icon: '🔗', name: 'Webhook / API', type: 'Integração personalizada', status: 'disconnected', detail: 'Para sistemas externos' },
]

export default function Integracoes() {
  return (
    <Layout>
      <p style={{ marginBottom: 18, fontSize: 13, color: 'var(--text-hint)' }}>
        Conecte os canais de aquisição e envio de mensagens.
      </p>
      <div style={s.grid}>
        {INTEGRATIONS.map((item, i) => (
          <GlassCard key={i} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={s.iconBox}>{item.icon}</div>
              <div>
                <div style={s.name}>{item.name}</div>
                <div style={s.type}>{item.type}</div>
              </div>
            </div>
            <div style={s.status}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.status === 'connected' ? '#25D366' : 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
              <span style={{ color: item.status === 'connected' ? 'rgba(80,220,130,.9)' : 'rgba(255,255,255,0.3)' }}>
                {item.status === 'connected' ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div style={s.detail}>{item.detail}</div>
            <button style={s.btn}>
              {item.status === 'connected' ? 'Configurar' : '+ Conectar'}
            </button>
          </GlassCard>
        ))}
      </div>
    </Layout>
  )
}

const s = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.15)', flexShrink: 0 },
  name: { fontSize: 13.5, fontWeight: 500 },
  type: { fontSize: 11, color: 'var(--text-hint)' },
  status: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 },
  detail: { fontSize: 11, color: 'var(--text-hint)' },
  btn: { width: '100%', display: 'flex', justifyContent: 'center', padding: '8px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', fontFamily: "'Inter',sans-serif", marginTop: 4 },
}
