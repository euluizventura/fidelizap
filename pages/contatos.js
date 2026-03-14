import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { fetchAPI, postAPI } from '../lib/api'

const SOURCE_STYLE = {
  'Google Ads':{background:'rgba(66,133,244,0.18)',color:'rgba(140,185,255,0.95)'},
  'Meta Ads':{background:'rgba(24,119,242,0.18)',color:'rgba(110,165,255,0.95)'},
  'Instagram':{background:'rgba(225,48,108,0.18)',color:'rgba(255,130,160,0.95)'},
  'Orgânico':{background:'rgba(170,100,255,0.18)',color:'rgba(205,165,255,0.95)'},
  'Base de Clientes':{background:'rgba(37,211,102,0.18)',color:'rgba(100,220,145,0.95)'},
}
const STATUS_STYLE = {
  'Ativo':{background:'rgba(37,211,102,0.12)',color:'rgba(80,220,130,.9)',dot:'#25D366'},
  'Prospect':{background:'rgba(80,165,255,0.1)',color:'rgba(120,185,255,.9)',dot:'#50a5ff'},
  'Novo':{background:'rgba(255,195,60,0.1)',color:'rgba(255,195,60,.9)',dot:'#f59e0b'},
  'VIP':{background:'rgba(175,105,255,0.12)',color:'rgba(205,165,255,.9)',dot:'#af69ff'},
}

export default function Contatos() {
  const [contatos, setContatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({nome:'',telefone:'',origem:'Google Ads'})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { loadContatos() }, [])

  async function loadContatos() {
    setLoading(true)
    const res = await fetchAPI('/api/contatos')
    if (res) setContatos(res.data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.nome || !form.telefone) return showToast('Preencha nome e telefone')
    setSaving(true)
    const res = await postAPI('/api/contatos', form)
    setSaving(false)
    if (res?.data) {
      showToast('Contato adicionado!')
      setShowModal(false)
      setForm({nome:'',telefone:'',origem:'Google Ads'})
      loadContatos()
    } else {
      showToast('Erro ao salvar. Verifique se o telefone já existe.')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = contatos.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()))
  const total = contatos.length
  const compraram = contatos.filter(c => c.clientes && c.clientes.length > 0).length
  const novos = contatos.filter(c => {
    const d = new Date(c.created_at)
    const diff = (new Date() - d) / (1000*60*60*24)
    return diff <= 7
  }).length

  return (
    <Layout>
      {toast && (
        <div style={s.toast}>{toast}</div>
      )}

      <div style={s.metricsGrid}>
        {[
          {label:'Total de contatos',value:total,badge:`+${novos} esta semana`,type:'up'},
          {label:'Já compraram',value:compraram,badge:`${total>0?Math.round(compraram/total*100):0}% da base`,type:'neutral'},
          {label:'Novos esta semana',value:novos,badge:'últimos 7 dias',type:'up'},
          {label:'Sem compra',value:total-compraram,badge:`${total>0?Math.round((total-compraram)/total*100):0}% da base`,type:'down'},
        ].map((m,i)=>(
          <GlassCard key={i} style={{padding:'16px 18px'}}>
            <div style={s.metricLabel}>{m.label}</div>
            <div style={s.metricValue}>{loading?'...':m.value}</div>
            <div style={{marginTop:5}}>
              <span style={{...s.badge,...(m.type==='up'?s.badgeUp:m.type==='down'?s.badgeDown:s.badgeNeutral)}}>{m.badge}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{overflow:'hidden'}}>
        <div style={s.tableHeader}>
          <span style={s.tableHeaderTitle}>Todos os contatos</span>
          <div style={{display:'flex',gap:8}}>
            <input style={s.searchInput} placeholder="Buscar contato..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <button style={s.btnPrimary} onClick={()=>setShowModal(true)}>+ Novo contato</button>
          </div>
        </div>
        {loading ? (
          <div style={{padding:24,textAlign:'center',color:'var(--text-hint)',fontSize:13}}>Carregando...</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['Nome','Telefone','Origem','Entrada','Compras','Total gasto','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((c,i)=>{
                const ss=SOURCE_STYLE[c.origem]||{}
                const st=STATUS_STYLE[c.status]||{}
                const cliente=c.clientes?.[0]
                return (
                  <tr key={i}>
                    <td style={{...s.td,...s.tdName}}>{c.nome}</td>
                    <td style={s.td}>{c.telefone}</td>
                    <td style={s.td}><span style={{...s.tag,...ss}}>{c.origem}</span></td>
                    <td style={s.td}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={s.td}>{cliente?.total_compras||0}</td>
                    <td style={s.td}>{cliente?.valor_total?`R$${Number(cliente.valor_total).toLocaleString('pt-BR',{minimumFractionDigits:2})}`:'—'}</td>
                    <td style={s.td}><span style={{...s.statusPill,background:st.background,color:st.color}}><span style={{width:5,height:5,borderRadius:'50%',background:st.dot,flexShrink:0}}/>{c.status}</span></td>
                  </tr>
                )
              })}
              {filtered.length===0&&<tr><td colSpan={7} style={{...s.td,textAlign:'center',color:'var(--text-hint)'}}>Nenhum contato encontrado</td></tr>}
            </tbody>
          </table>
        )}
      </GlassCard>

      {showModal && (
        <div style={s.overlay} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Novo contato</span>
              <button style={s.closeBtn} onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Nome</label>
                <input style={s.formInput} placeholder="Nome completo" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Telefone</label>
                <input style={s.formInput} placeholder="61999990000" value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})}/>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Origem</label>
                <select style={s.formInput} value={form.origem} onChange={e=>setForm({...form,origem:e.target.value})}>
                  {['Google Ads','Meta Ads','Instagram','Orgânico','Base de Clientes'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btn} onClick={()=>setShowModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>{saving?'Salvando...':'Salvar contato'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

const s = {
  metricsGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20},
  metricLabel:{fontSize:11,color:'var(--text-hint)',marginBottom:7,letterSpacing:'.04em',textTransform:'uppercase'},
  metricValue:{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,letterSpacing:'-.02em'},
  badge:{display:'inline-flex',fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:500},
  badgeUp:{background:'rgba(37,211,102,0.14)',color:'rgba(80,220,130,.95)',border:'0.5px solid rgba(37,211,102,0.22)'},
  badgeDown:{background:'rgba(255,80,80,0.12)',color:'rgba(255,110,110,.9)',border:'0.5px solid rgba(255,80,80,0.2)'},
  badgeNeutral:{background:'rgba(80,160,255,0.12)',color:'rgba(120,185,255,.9)',border:'0.5px solid rgba(80,160,255,0.2)'},
  tableHeader:{padding:'14px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'},
  tableHeaderTitle:{fontSize:13,fontWeight:500},
  searchInput:{padding:'7px 12px',borderRadius:8,fontSize:12.5,background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.15)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif",width:200,outline:'none'},
  btn:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'rgba(255,255,255,0.07)',border:'0.5px solid rgba(255,255,255,0.15)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif"},
  btnPrimary:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'linear-gradient(135deg,rgba(37,211,102,0.88),rgba(15,140,60,0.88))',border:'0.5px solid rgba(37,211,102,0.5)',color:'#fff',fontFamily:"'Inter',sans-serif"},
  table:{width:'100%',borderCollapse:'collapse',fontSize:12.5},
  th:{textAlign:'left',padding:'9px 20px',fontSize:10,color:'var(--text-hint)',fontWeight:500,textTransform:'uppercase',letterSpacing:'.07em',borderBottom:'0.5px solid rgba(255,255,255,0.15)'},
  td:{padding:'11px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.04)',color:'var(--text-secondary)'},
  tdName:{color:'var(--text-primary)',fontWeight:500},
  tag:{fontSize:10,padding:'2px 9px',borderRadius:5,fontWeight:500},
  statusPill:{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:500},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100},
  modal:{background:'rgba(14,14,22,0.95)',backdropFilter:'blur(30px)',border:'0.5px solid rgba(255,255,255,0.15)',borderRadius:20,width:480,maxWidth:'95vw',overflow:'hidden'},
  modalHeader:{padding:'18px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'},
  modalTitle:{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:600},
  closeBtn:{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:18,cursor:'pointer',padding:'4px 8px',borderRadius:6},
  modalBody:{padding:20},
  modalFooter:{padding:'14px 20px',borderTop:'0.5px solid rgba(255,255,255,0.15)',display:'flex',justifyContent:'flex-end',gap:8},
  formGroup:{marginBottom:14},
  formLabel:{fontSize:11,color:'var(--text-hint)',marginBottom:7,display:'block',letterSpacing:'.04em',textTransform:'uppercase'},
  formInput:{width:'100%',padding:'9px 13px',border:'0.5px solid rgba(255,255,255,0.15)',borderRadius:9,fontSize:13,background:'rgba(255,255,255,0.05)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif",outline:'none'},
  toast:{position:'fixed',bottom:24,right:24,zIndex:200,background:'rgba(16,16,24,0.96)',color:'var(--text-primary)',backdropFilter:'blur(20px)',border:'0.5px solid rgba(255,255,255,0.15)',padding:'10px 18px',borderRadius:11,fontSize:13,boxShadow:'0 8px 32px rgba(0,0,0,0.45)'},
}
