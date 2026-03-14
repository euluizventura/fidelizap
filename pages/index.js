import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { fetchAPI } from '../lib/api'

const barDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const barData = [6200, 8400, 7100, 9800, 11200, 7800, 10400]
const maxBar = Math.max(...barData)

const origins = [
  { label: 'Google Ads', pct: 30, color: '#4285f4' },
  { label: 'Meta Ads', pct: 22, color: '#1877f2' },
  { label: 'Instagram', pct: 16, color: '#e1306c' },
  { label: 'Base de Clientes', pct: 14, color: '#25D366' },
  { label: 'Orgânico', pct: 8, color: 'rgba(170,100,255,0.85)' },
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [campanhas, setCampanhas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [dash, camps] = await Promise.all([
        fetchAPI('/api/dashboard'),
        fetchAPI('/api/campanhas'),
      ])
      if (dash) setData(dash.data)
      if (camps) setCampanhas(camps.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const metrics = [
    { label: 'Faturamento total', value: loading ? '...' : `R$${Number(data?.faturamento||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`, badge: '+12%', type: 'up', sub: 'acumulado' },
    { label: 'Msgs enviadas', value: loading ? '...' : (data?.msgs_enviadas||0).toLocaleString('pt-BR'), badge: `${data?.campanhas_enviadas||0} camp.`, type: 'neutral', sub: 'total' },
    { label: 'Total de contatos', value: loading ? '...' : (data?.total_contatos||0).toLocaleString('pt-BR'), badge: '+127', type: 'up', sub: 'esta semana' },
    { label: 'Receita campanhas', value: loading ? '...' : `R$${Number(data?.receita_campanhas||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`, badge: '+18%', type: 'up', sub: 'este mês' },
  ]

  return (
    <Layout>
      <div style={s.metricsGrid}>
        {metrics.map((m,i) => (
          <GlassCard key={i} style={{padding:'16px 18px'}}>
            <div style={s.metricLabel}>{m.label}</div>
            <div style={s.metricValue}>{m.value}</div>
            <div style={s.metricSub}>
              <span style={{...s.badge,...(m.type==='up'?s.badgeUp:m.type==='down'?s.badgeDown:s.badgeNeutral)}}>{m.badge}</span>
              {m.sub}
            </div>
          </GlassCard>
        ))}
      </div>

      <div style={s.twoCol}>
        <GlassCard style={{padding:'18px 20px'}}>
          <div style={s.sectionTitle}>Faturamento por dia <span style={{fontSize:11,color:'var(--text-hint)',fontWeight:400}}>Esta semana</span></div>
          <div style={s.miniBars}>
            {barData.map((v,i) => (
              <div key={i} title={`${barDays[i]}: R$${v.toLocaleString('pt-BR')}`} style={{...s.miniBar,height:`${Math.round(v/maxBar*100)}%`,background:i===4?'linear-gradient(180deg,rgba(37,211,102,0.85),rgba(37,211,102,0.3))':'rgba(37,211,102,0.18)'}}/>
            ))}
          </div>
          <div style={s.barLabels}>{barDays.map(d=><span key={d} style={s.barLabel}>{d}</span>)}</div>
        </GlassCard>

        <GlassCard style={{padding:'18px 20px'}}>
          <div style={s.sectionTitle}>Origem dos contatos</div>
          <div style={s.donutWrap}>
            <svg width="90" height="90" viewBox="0 0 90 90" style={{flexShrink:0}}>
              <circle cx="45" cy="45" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>
              <circle cx="45" cy="45" r="32" fill="none" stroke="#4285f4" strokeWidth="14" strokeDasharray="60 141" strokeDashoffset="-16" transform="rotate(-90 45 45)"/>
              <circle cx="45" cy="45" r="32" fill="none" stroke="#1877f2" strokeWidth="14" strokeDasharray="44 157" strokeDashoffset="-76" transform="rotate(-90 45 45)"/>
              <circle cx="45" cy="45" r="32" fill="none" stroke="#e1306c" strokeWidth="14" strokeDasharray="32 169" strokeDashoffset="-120" transform="rotate(-90 45 45)"/>
              <circle cx="45" cy="45" r="32" fill="none" stroke="#25D366" strokeWidth="14" strokeDasharray="28 173" strokeDashoffset="-152" transform="rotate(-90 45 45)"/>
              <circle cx="45" cy="45" r="32" fill="none" stroke="rgba(170,100,255,0.85)" strokeWidth="14" strokeDasharray="17 184" strokeDashoffset="-180" transform="rotate(-90 45 45)"/>
              <text x="45" y="48" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.9)" fontFamily="Syne,sans-serif">{loading?'...':data?.total_contatos||0}</text>
            </svg>
            <div style={{fontSize:12,color:'var(--text-secondary)'}}>
              {origins.map((o,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:o.color,flexShrink:0}}/>
                  <span>{o.label} <b style={{color:'var(--text-primary)'}}>{o.pct}%</b></span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {data?.segmentos && Object.keys(data.segmentos).length > 0 && (
        <div style={s.threeCol}>
          {Object.entries(data.segmentos).map(([seg,count],i)=>(
            <GlassCard key={i} style={{padding:'14px 18px'}}>
              <div style={s.metricLabel}>{seg}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700}}>{count}</div>
              <div style={{fontSize:11,color:'var(--text-hint)',marginTop:4}}>clientes no segmento</div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassCard style={{overflow:'hidden'}}>
        <div style={s.tableHeader}>
          <span style={s.tableHeaderTitle}>Campanhas recentes</span>
          <span style={{fontSize:11,color:'var(--text-hint)'}}>{campanhas.length} campanhas</span>
        </div>
        {loading ? (
          <div style={{padding:24,textAlign:'center',color:'var(--text-hint)',fontSize:13}}>Carregando...</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['Campanha','Segmento','Enviadas','Abertura','Receita','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {campanhas.map((c,i)=>(
                <tr key={i}>
                  <td style={{...s.td,...s.tdName}}>{c.nome}</td>
                  <td style={s.td}>{c.segmento}</td>
                  <td style={s.td}>{c.total_enviadas}</td>
                  <td style={s.td}>{c.total_abertas>0?`${Math.round(c.total_abertas/c.total_enviadas*100)}%`:'—'}</td>
                  <td style={s.td}>R${Number(c.receita_gerada).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                  <td style={s.td}>
                    <span style={{...s.statusPill,...(c.status==='Enviada'?s.statusSent:c.status==='Agendada'?s.statusScheduled:s.statusCancelled)}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:c.status==='Enviada'?'#25D366':c.status==='Agendada'?'#f59e0b':'#ef4444',flexShrink:0}}/>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {campanhas.length===0&&<tr><td colSpan={6} style={{...s.td,textAlign:'center',color:'var(--text-hint)'}}>Nenhuma campanha ainda</td></tr>}
            </tbody>
          </table>
        )}
      </GlassCard>
    </Layout>
  )
}

const s = {
  metricsGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20},
  metricLabel:{fontSize:11,color:'var(--text-hint)',marginBottom:7,letterSpacing:'.04em',textTransform:'uppercase'},
  metricValue:{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:700,letterSpacing:'-.02em'},
  metricSub:{fontSize:11,color:'var(--text-hint)',marginTop:5,display:'flex',alignItems:'center',gap:6},
  badge:{display:'inline-flex',alignItems:'center',gap:3,fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:500},
  badgeUp:{background:'rgba(37,211,102,0.14)',color:'rgba(80,220,130,.95)',border:'0.5px solid rgba(37,211,102,0.22)'},
  badgeDown:{background:'rgba(255,80,80,0.12)',color:'rgba(255,110,110,.9)',border:'0.5px solid rgba(255,80,80,0.2)'},
  badgeNeutral:{background:'rgba(80,160,255,0.12)',color:'rgba(120,185,255,.9)',border:'0.5px solid rgba(80,160,255,0.2)'},
  twoCol:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20},
  threeCol:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20},
  sectionTitle:{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'},
  miniBars:{display:'flex',alignItems:'flex-end',gap:5,height:80,marginBottom:5},
  miniBar:{flex:1,borderRadius:'4px 4px 0 0',transition:'all .18s',cursor:'pointer'},
  barLabels:{display:'flex',gap:5},
  barLabel:{flex:1,textAlign:'center',fontSize:10,color:'var(--text-hint)'},
  donutWrap:{display:'flex',alignItems:'center',gap:16,marginTop:10},
  tableHeader:{padding:'14px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'},
  tableHeaderTitle:{fontSize:13,fontWeight:500},
  table:{width:'100%',borderCollapse:'collapse',fontSize:12.5},
  th:{textAlign:'left',padding:'9px 20px',fontSize:10,color:'var(--text-hint)',fontWeight:500,textTransform:'uppercase',letterSpacing:'.07em',borderBottom:'0.5px solid rgba(255,255,255,0.15)'},
  td:{padding:'11px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.04)',color:'var(--text-secondary)'},
  tdName:{color:'var(--text-primary)',fontWeight:500},
  statusPill:{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:500},
  statusSent:{background:'rgba(37,211,102,0.12)',color:'rgba(80,220,130,.9)'},
  statusScheduled:{background:'rgba(255,190,60,0.12)',color:'rgba(255,190,60,.9)'},
  statusCancelled:{background:'rgba(255,80,80,0.12)',color:'rgba(255,110,110,.9)'},
}
