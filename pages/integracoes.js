import { useState } from 'react'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'

const INTEGRACOES = [
  { id:'whatsapp', name:'WhatsApp Business API', desc:'Envio de mensagens em massa via Meta API oficial', icon:'📱', connected:false, color:'rgba(37,211,102,0.9)' },
  { id:'meta', name:'Meta Ads', desc:'Sincronize leads do Facebook e Instagram automaticamente', icon:'📘', connected:false, color:'rgba(24,119,242,0.9)' },
  { id:'google', name:'Google Ads', desc:'Importe leads e conversões do Google Ads', icon:'🔵', connected:false, color:'rgba(66,133,244,0.9)' },
  { id:'sheets', name:'Google Sheets', desc:'Exporte contatos e relatórios para planilhas', icon:'📊', connected:false, color:'rgba(52,168,83,0.9)' },
  { id:'shopify', name:'Shopify', desc:'Sincronize pedidos e clientes da sua loja', icon:'🛍️', connected:false, color:'rgba(150,191,71,0.9)' },
  { id:'webhook', name:'Webhook / API', desc:'Integre qualquer sistema via webhook personalizado', icon:'🔗', connected:false, color:'rgba(175,105,255,0.9)' },
]

export default function Integracoes() {
  const [integracoes, setIntegracoes] = useState(INTEGRACOES)
  const [modal, setModal] = useState(null)
  const [apiKey, setApiKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [toast, setToast] = useState('')

  async function handleConnect(integ) {
    if (integ.connected) {
      setIntegracoes(prev => prev.map(i => i.id === integ.id ? {...i, connected:false} : i))
      showToast(`${integ.name} desconectado`)
      return
    }
    setModal(integ)
    setApiKey('')
  }

  async function handleSaveConnection() {
    if (!apiKey.trim()) return showToast('Informe a chave de API')
    setConnecting(true)
    await new Promise(r => setTimeout(r, 1200))
    setConnecting(false)
    setIntegracoes(prev => prev.map(i => i.id === modal.id ? {...i, connected:true} : i))
    showToast(`${modal.name} conectado com sucesso!`)
    setModal(null)
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const connected = integracoes.filter(i => i.connected).length

  return (
    <Layout>
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={{marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <p style={{fontSize:13,color:'var(--text-hint)',margin:0}}>
          Conecte suas ferramentas para automatizar o fluxo de dados.
        </p>
        <span style={{fontSize:12,color:'rgba(80,220,130,.9)',background:'rgba(37,211,102,0.1)',padding:'4px 12px',borderRadius:20,border:'0.5px solid rgba(37,211,102,0.2)'}}>
          {connected}/{integracoes.length} conectadas
        </span>
      </div>

      <div style={s.grid}>
        {integracoes.map((integ,i) => (
          <GlassCard key={i} style={{padding:'18px 20px'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontSize:22}}>{integ.icon}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{integ.name}</div>
                  <div style={{fontSize:11,color:'var(--text-hint)',marginTop:2}}>{integ.desc}</div>
                </div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
              <span style={{fontSize:11,display:'flex',alignItems:'center',gap:5,color:integ.connected?'rgba(80,220,130,.9)':'rgba(255,255,255,0.3)'}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:integ.connected?'#25D366':'rgba(255,255,255,0.2)'}}/>
                {integ.connected ? 'Conectado' : 'Desconectado'}
              </span>
              <button
                style={{...s.btn,...(integ.connected?s.btnDanger:s.btnConnect)}}
                onClick={() => handleConnect(integ)}
              >
                {integ.connected ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {modal && (
        <div style={s.overlay} onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>{modal.icon} Conectar {modal.name}</span>
              <button style={s.closeBtn} onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={{fontSize:13,color:'var(--text-hint)',marginBottom:16}}>{modal.desc}</div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Chave de API / Token</label>
                <input style={s.formInput} placeholder="Cole sua chave de API aqui..." value={apiKey} onChange={e => setApiKey(e.target.value)}/>
              </div>
              <div style={{fontSize:11,color:'var(--text-hint)',background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:8,padding:10}}>
                💡 Você encontra a chave de API no painel de desenvolvedor da plataforma.
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setModal(null)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={handleSaveConnection} disabled={connecting}>
                {connecting ? 'Conectando...' : 'Salvar conexão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

const s = {
  grid:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12},
  btn:{fontSize:12,padding:'5px 12px',borderRadius:8,cursor:'pointer',fontFamily:"'Inter',sans-serif",fontWeight:500},
  btnConnect:{background:'rgba(37,211,102,0.12)',border:'0.5px solid rgba(37,211,102,0.3)',color:'rgba(80,220,130,.9)'},
  btnDanger:{background:'rgba(255,80,80,0.1)',border:'0.5px solid rgba(255,80,80,0.2)',color:'rgba(255,110,110,.9)'},
  btnCancel:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'rgba(255,255,255,0.07)',border:'0.5px solid rgba(255,255,255,0.15)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif"},
  btnPrimary:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'linear-gradient(135deg,rgba(37,211,102,0.88),rgba(15,140,60,0.88))',border:'0.5px solid rgba(37,211,102,0.5)',color:'#fff',fontFamily:"'Inter',sans-serif"},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100},
  modal:{background:'rgba(14,14,22,0.95)',backdropFilter:'blur(30px)',border:'0.5px solid rgba(255,255,255,0.15)',borderRadius:20,width:460,maxWidth:'95vw',overflow:'hidden'},
  modalHeader:{padding:'18px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'},
  modalTitle:{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:600},
  closeBtn:{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:18,cursor:'pointer',padding:'4px 8px',borderRadius:6},
  modalBody:{padding:20},
  modalFooter:{padding:'14px 20px',borderTop:'0.5px solid rgba(255,255,255,0.15)',display:'flex',justifyContent:'flex-end',gap:8},
  formGroup:{marginBottom:14},
  formLabel:{fontSize:11,color:'var(--text-hint)',marginBottom:7,display:'block',letterSpacing:'.04em',textTransform:'uppercase'},
  formInput:{width:'100%',padding:'9px 13px',border:'0.5px solid rgba(255,255,255,0.15)',borderRadius:9,fontSize:13,background:'rgba(255,255,255,0.05)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif",outline:'none',boxSizing:'border-box'},
  toast:{position:'fixed',bottom:24,right:24,zIndex:200,background:'rgba(16,16,24,0.96)',color:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',border:'0.5px solid rgba(255,255,255,0.15)',padding:'10px 18px',borderRadius:11,fontSize:13},
}
