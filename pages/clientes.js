import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { fetchAPI, postAPI } from '../lib/api'

const SEGMENTS = [
  {name:'Campeões',color:'rgba(255,195,60,0.95)',bg:'rgba(255,195,60,0.08)',ibg:'rgba(255,195,60,0.16)',desc:'Alta frequência e valor recente',pct:85},
  {name:'Fiéis',color:'rgba(80,165,255,0.95)',bg:'rgba(80,165,255,0.08)',ibg:'rgba(80,165,255,0.16)',desc:'Compram regularmente',pct:70},
  {name:'Promissores',color:'rgba(37,211,102,0.95)',bg:'rgba(37,211,102,0.08)',ibg:'rgba(37,211,102,0.16)',desc:'Recentes com bom potencial',pct:50},
  {name:'Em risco',color:'rgba(255,100,80,0.95)',bg:'rgba(255,100,80,0.08)',ibg:'rgba(255,100,80,0.16)',desc:'Costumavam comprar mais',pct:35},
  {name:'Dormentes',color:'rgba(175,105,255,0.95)',bg:'rgba(175,105,255,0.08)',ibg:'rgba(175,105,255,0.16)',desc:'Sem compra há 90+ dias',pct:25},
  {name:'Perdidos',color:'rgba(180,180,180,0.75)',bg:'rgba(180,180,180,0.06)',ibg:'rgba(180,180,180,0.12)',desc:'Sem compra há 180+ dias',pct:10},
]
const SEG_ICO = {'Campeões':'★','Fiéis':'♥','Promissores':'◆','Em risco':'!','Dormentes':'◌','Perdidos':'○'}

const SUGESTOES = {
  'Dormentes':[{t:'Sentimos sua falta!',m:'Olá {{nome}}, faz um tempo que não te vemos. Temos um presente especial para você voltar!'},{t:'Cupom de retorno 15% off',m:'Oi {{nome}}! Preparamos um desconto exclusivo para te receber de volta.'}],
  'Campeões':[{t:'Benefício VIP exclusivo',m:'{{nome}}, você é um dos nossos clientes especiais. Tem uma surpresa para você!'},{t:'Acesso antecipado',m:'{{nome}}, antes de todo mundo: nossa promoção começa agora só para você.'}],
  'Perdidos':[{t:'Está tudo bem?',m:'{{nome}}, sentimos muito sua falta. Gostaríamos de te receber de volta.'},{t:'Cupom de reativação 20%',m:'{{nome}}, um desconto de 20% para te dar as boas-vindas de volta!'}],
  'default':[{t:'Promoção especial',m:'{{nome}}, hoje temos uma oferta incrível esperando por você!'},{t:'Novidade para você',m:'Oi {{nome}}! Chegou algo que você vai adorar.'}],
}

export default function Clientes() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [segCounts, setSegCounts] = useState({})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msgModal, setMsgModal] = useState(null)
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { loadData() }, [selected])

  async function loadData() {
    setLoading(true)
    const [cli, segs] = await Promise.all([
      fetchAPI(`/api/clientes${selected ? `?segmento=${encodeURIComponent(selected)}` : ''}`),
      fetchAPI('/api/clientes/segmentos'),
    ])
    if (cli) setClientes(cli.data || [])
    if (segs) setSegCounts(segs.data || {})
    setLoading(false)
  }

  function handleCriarCampanha() {
    const seg = selected || 'Dormentes'
    router.push(`/campanhas?segmento=${encodeURIComponent(seg)}`)
  }

  function openMsgModal(cliente) {
    const sugs = SUGESTOES[cliente.segmento] || SUGESTOES.default
    setMsgText(sugs[0].m.replace('{{nome}}', cliente.contatos?.nome || ''))
    setMsgModal(cliente)
  }

  async function handleSendMsg() {
    if (!msgText.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 800))
    setSending(false)
    setMsgModal(null)
    showToast(`Mensagem enviada para ${msgModal.contatos?.nome}!`)
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  return (
    <Layout>
      {toast && <div style={s.toast}>{toast}</div>}

      <p style={{marginBottom:16,fontSize:13,color:'var(--text-hint)'}}>
        Segmentação automática por Recência, Frequência e Valor monetário. Clique em um segmento para filtrar.
      </p>

      <div style={s.segmentsGrid}>
        {SEGMENTS.map((seg,i) => (
          <GlassCard key={i} onClick={() => setSelected(selected === seg.name ? null : seg.name)}
            style={{padding:'15px 16px',cursor:'pointer',borderColor:selected===seg.name?seg.color:undefined,background:selected===seg.name?seg.bg:undefined}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{width:30,height:30,borderRadius:8,background:seg.ibg,color:seg.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700}}>{SEG_ICO[seg.name]}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:seg.color}}>{segCounts[seg.name]||0}</div>
            </div>
            <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{seg.name}</div>
            <div style={{fontSize:11,color:'var(--text-hint)'}}>{seg.desc}</div>
            <div style={{marginTop:9,height:3,background:'rgba(255,255,255,0.08)',borderRadius:2}}>
              <div style={{height:3,borderRadius:2,width:`${seg.pct}%`,background:seg.color}}/>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{overflow:'hidden'}}>
        <div style={s.tableHeader}>
          <span style={s.tableHeaderTitle}>{selected ? `Clientes — ${selected}` : 'Todos os clientes'}</span>
          <button style={s.btnPrimary} onClick={handleCriarCampanha}>
            Criar campanha para {selected || 'segmento'}
          </button>
        </div>
        {loading ? (
          <div style={{padding:24,textAlign:'center',color:'var(--text-hint)',fontSize:13}}>Carregando...</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['Nome','Telefone','Último pedido','Compras','Valor total','Segmento','Ação'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {clientes.map((c,i) => {
                const sg = SEGMENTS.find(s => s.name === c.segmento) || {}
                return (
                  <tr key={i}>
                    <td style={{...s.td,...s.tdName}}>{c.contatos?.nome||'—'}</td>
                    <td style={s.td}>{c.contatos?.telefone||'—'}</td>
                    <td style={s.td}>{c.ultima_compra ? new Date(c.ultima_compra).toLocaleDateString('pt-BR') : '—'}</td>
                    <td style={s.td}>{c.total_compras}</td>
                    <td style={s.td}>R${Number(c.valor_total).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                    <td style={s.td}><span style={{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:500,background:sg.bg,color:sg.color}}>{c.segmento}</span></td>
                    <td style={s.td}><button style={s.btnSm} onClick={() => openMsgModal(c)}>Enviar msg</button></td>
                  </tr>
                )
              })}
              {clientes.length===0&&<tr><td colSpan={7} style={{...s.td,textAlign:'center',color:'var(--text-hint)'}}>Nenhum cliente neste segmento</td></tr>}
            </tbody>
          </table>
        )}
      </GlassCard>

      {msgModal && (
        <div style={s.overlay} onClick={e => e.target===e.currentTarget && setMsgModal(null)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Enviar mensagem</span>
              <button style={s.closeBtn} onClick={() => setMsgModal(null)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={{fontSize:13,color:'var(--text-hint)',marginBottom:14}}>
                Para: <b style={{color:'var(--text-primary)'}}>{msgModal.contatos?.nome}</b> · {msgModal.contatos?.telefone}
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Mensagem</label>
                <textarea style={{...s.formInput,height:100,resize:'vertical'}} value={msgText} onChange={e => setMsgText(e.target.value)}/>
              </div>
              <div style={{fontSize:11,color:'var(--text-hint)'}}>
                Segmento: <span style={{color:SEGMENTS.find(s=>s.name===msgModal.segmento)?.color}}>{msgModal.segmento}</span>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btn} onClick={() => setMsgModal(null)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={handleSendMsg} disabled={sending}>
                {sending ? 'Enviando...' : '📱 Enviar via WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

const s = {
  segmentsGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20},
  tableHeader:{padding:'14px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'},
  tableHeaderTitle:{fontSize:13,fontWeight:500},
  table:{width:'100%',borderCollapse:'collapse',fontSize:12.5},
  th:{textAlign:'left',padding:'9px 20px',fontSize:10,color:'var(--text-hint)',fontWeight:500,textTransform:'uppercase',letterSpacing:'.07em',borderBottom:'0.5px solid rgba(255,255,255,0.15)'},
  td:{padding:'11px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.04)',color:'var(--text-secondary)'},
  tdName:{color:'var(--text-primary)',fontWeight:500},
  btnPrimary:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:12,fontWeight:500,cursor:'pointer',background:'linear-gradient(135deg,rgba(37,211,102,0.88),rgba(15,140,60,0.88))',border:'0.5px solid rgba(37,211,102,0.5)',color:'#fff',fontFamily:"'Inter',sans-serif"},
  btnSm:{fontSize:11,padding:'4px 10px',borderRadius:7,cursor:'pointer',background:'rgba(255,255,255,0.07)',border:'0.5px solid rgba(255,255,255,0.15)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif"},
  btn:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'rgba(255,255,255,0.07)',border:'0.5px solid rgba(255,255,255,0.15)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif"},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100},
  modal:{background:'rgba(14,14,22,0.95)',backdropFilter:'blur(30px)',border:'0.5px solid rgba(255,255,255,0.15)',borderRadius:20,width:480,maxWidth:'95vw',overflow:'hidden'},
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
