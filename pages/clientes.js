import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { fetchAPI } from '../lib/api'

const SEGMENTS = [
  {name:'Campeões',color:'rgba(255,195,60,0.95)',bg:'rgba(255,195,60,0.08)',ibg:'rgba(255,195,60,0.16)',desc:'Alta frequência e valor recente',pct:85},
  {name:'Fiéis',color:'rgba(80,165,255,0.95)',bg:'rgba(80,165,255,0.08)',ibg:'rgba(80,165,255,0.16)',desc:'Compram regularmente',pct:70},
  {name:'Promissores',color:'rgba(37,211,102,0.95)',bg:'rgba(37,211,102,0.08)',ibg:'rgba(37,211,102,0.16)',desc:'Recentes com bom potencial',pct:50},
  {name:'Em risco',color:'rgba(255,100,80,0.95)',bg:'rgba(255,100,80,0.08)',ibg:'rgba(255,100,80,0.16)',desc:'Costumavam comprar mais',pct:35},
  {name:'Dormentes',color:'rgba(175,105,255,0.95)',bg:'rgba(175,105,255,0.08)',ibg:'rgba(175,105,255,0.16)',desc:'Sem compra há 90+ dias',pct:25},
  {name:'Perdidos',color:'rgba(180,180,180,0.75)',bg:'rgba(180,180,180,0.06)',ibg:'rgba(180,180,180,0.12)',desc:'Sem compra há 180+ dias',pct:10},
]
const SEG_ICO = {'Campeões':'★','Fiéis':'♥','Promissores':'◆','Em risco':'!','Dormentes':'◌','Perdidos':'○'}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [segCounts, setSegCounts] = useState({})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [selected])

  async function loadData() {
    setLoading(true)
    const [cli, segs] = await Promise.all([
      fetchAPI(`/api/clientes${selected?`?segmento=${encodeURIComponent(selected)}`:''}`) ,
      fetchAPI('/api/clientes/segmentos'),
    ])
    if (cli) setClientes(cli.data || [])
    if (segs) setSegCounts(segs.data || {})
    setLoading(false)
  }

  return (
    <Layout>
      <p style={{marginBottom:16,fontSize:13,color:'var(--text-hint)'}}>
        Segmentação automática por Recência, Frequência e Valor monetário. Clique em um segmento para filtrar.
      </p>

      <div style={s.segmentsGrid}>
        {SEGMENTS.map((seg,i)=>(
          <GlassCard key={i} onClick={()=>setSelected(selected===seg.name?null:seg.name)} style={{padding:'15px 16px',cursor:'pointer',borderColor:selected===seg.name?seg.color:undefined,background:selected===seg.name?seg.bg:undefined}}>
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
          <span style={s.tableHeaderTitle}>{selected?`Clientes — ${selected}`:'Todos os clientes'}</span>
          <button style={s.btnPrimary}>Criar campanha para segmento</button>
        </div>
        {loading ? (
          <div style={{padding:24,textAlign:'center',color:'var(--text-hint)',fontSize:13}}>Carregando...</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['Nome','Telefone','Último pedido','Compras','Valor total','Segmento','Ação'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {clientes.map((c,i)=>{
                const sg=SEGMENTS.find(s=>s.name===c.segmento)||{}
                return (
                  <tr key={i}>
                    <td style={{...s.td,...s.tdName}}>{c.contatos?.nome||'—'}</td>
                    <td style={s.td}>{c.contatos?.telefone||'—'}</td>
                    <td style={s.td}>{c.ultima_compra?new Date(c.ultima_compra).toLocaleDateString('pt-BR'):'—'}</td>
                    <td style={s.td}>{c.total_compras}</td>
                    <td style={s.td}>R${Number(c.valor_total).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                    <td style={s.td}><span style={{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:500,background:sg.bg,color:sg.color}}>{c.segmento}</span></td>
                    <td style={s.td}><button style={s.btnSm}>Enviar msg</button></td>
                  </tr>
                )
              })}
              {clientes.length===0&&<tr><td colSpan={7} style={{...s.td,textAlign:'center',color:'var(--text-hint)'}}>Nenhum cliente neste segmento</td></tr>}
            </tbody>
          </table>
        )}
      </GlassCard>
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
}
