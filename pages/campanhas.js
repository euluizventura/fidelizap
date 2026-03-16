import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { fetchAPI, postAPI } from '../lib/api'

const SEGMENTS = ['Campeões','Fiéis','Promissores','Em risco','Dormentes','Perdidos','Todos']
const SEG_COLORS = {
  'Campeões':'rgba(255,195,60,0.95)','Fiéis':'rgba(80,165,255,0.95)',
  'Promissores':'rgba(37,211,102,0.95)','Em risco':'rgba(255,100,80,0.95)',
  'Dormentes':'rgba(175,105,255,0.95)','Perdidos':'rgba(180,180,180,0.75)','Todos':'rgba(37,211,102,0.95)'
}
const SEG_BG = {
  'Campeões':'rgba(255,195,60,0.1)','Fiéis':'rgba(80,165,255,0.1)',
  'Promissores':'rgba(37,211,102,0.08)','Em risco':'rgba(255,100,80,0.1)',
  'Dormentes':'rgba(175,105,255,0.08)','Perdidos':'rgba(180,180,180,0.06)','Todos':'rgba(37,211,102,0.08)'
}

const SUGESTOES = {
  'Dormentes':[{t:'Sentimos sua falta!',m:'Olá {{nome}}, faz um tempo que não te vemos. Temos um presente especial para você voltar!'},{t:'Cupom de retorno 15% off',m:'Oi {{nome}}! Preparamos um desconto exclusivo para te receber de volta.'}],
  'Campeões':[{t:'Benefício VIP exclusivo',m:'{{nome}}, você é um dos nossos clientes especiais. Tem uma surpresa para você!'},{t:'Acesso antecipado',m:'{{nome}}, antes de todo mundo: nossa promoção começa agora só para você.'}],
  'Perdidos':[{t:'Está tudo bem?',m:'{{nome}}, sentimos muito sua falta. Gostaríamos de te receber de volta.'},{t:'Cupom de reativação 20%',m:'{{nome}}, um desconto de 20% para te dar as boas-vindas de volta!'}],
  'default':[{t:'Promoção especial',m:'{{nome}}, hoje temos uma oferta incrível esperando por você!'},{t:'Novidade para você',m:'Oi {{nome}}! Chegou algo que você vai adorar.'}]
}

const STEPS = ['Público','Sugestão IA','Template','Agendamento']

export default function Campanhas() {
  const [campanhas, setCampanhas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(0)
  const [selSeg, setSelSeg] = useState('Dormentes')
  const [selSug, setSelSug] = useState(0)
  const [dataEnvio, setDataEnvio] = useState('')
  const [hora, setHora] = useState('10:00')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { loadCampanhas(); const h=()=>setShowModal(true); window.addEventListener("openNovaCampanha",h); return ()=>window.removeEventListener("openNovaCampanha",h) }, [])

  async function loadCampanhas() {
    setLoading(true)
    const res = await fetchAPI('/api/campanhas')
    if (res) setCampanhas(res.data || [])
    setLoading(false)
  }

  const sugs = SUGESTOES[selSeg] || SUGESTOES.default
  const sug = sugs[selSug] || sugs[0]

  async function handleAgendar() {
    if (!dataEnvio) return showToast('Escolha uma data de envio')
    setSaving(true)
    const res = await postAPI('/api/campanhas', {
      nome: sug.t,
      segmento: selSeg,
      template: 'custom',
      mensagem: sug.m,
      data_envio: `${dataEnvio}T${hora}:00`,
    })
    setSaving(false)
    if (res?.data) {
      showToast('Campanha agendada!')
      setShowModal(false)
      setStep(0)
      loadCampanhas()
    } else {
      showToast('Erro ao agendar campanha')
    }
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''), 3000) }

  const agendadas = campanhas.filter(c=>c.status==='Agendada')
  const enviadas = campanhas.filter(c=>c.status==='Enviada')
  const CAL_DAYS_WITH_CAMP = [...new Set(campanhas.map(c=>new Date(c.data_envio).getDate()))]

  return (
    <Layout>
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={s.twoCol}>
        <div>
          <div style={s.sectionTitle}>Calendário — {new Date().toLocaleString('pt-BR',{month:'long',year:'numeric'})}</div>
          <GlassCard style={{padding:16,marginBottom:16}}>
            <div style={s.calGrid}>
              {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=><div key={d} style={s.calHeader}>{d}</div>)}
              {Array.from({length:new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate()},(_,i)=>i+1).map(d=>(
                <div key={d} style={{...s.calDay,...(d===new Date().getDate()?s.calDayToday:{})}}>
                  {d}
                  {CAL_DAYS_WITH_CAMP.includes(d)&&<div style={s.calDot}/>}
                </div>
              ))}
            </div>
          </GlassCard>

          <div style={s.sectionTitle}>Agendadas ({agendadas.length})</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {agendadas.map((c,i)=>(
              <GlassCard key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px'}}>
                <div style={{...s.campDate,background:SEG_BG[c.segmento]||'rgba(255,255,255,0.06)',color:SEG_COLORS[c.segmento]||'var(--text-primary)'}}>
                  <div style={s.campDateNum}>{new Date(c.data_envio).getDate()}</div>
                  <div style={{fontSize:9}}>{new Date(c.data_envio).toLocaleString('pt-BR',{month:'short'})}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={s.campName}>{c.nome}</div>
                  <div style={s.campMeta}><span style={{color:SEG_COLORS[c.segmento]}}>{c.segmento}</span><span>·</span><span>{new Date(c.data_envio).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div>
                </div>
                <span style={s.statusScheduled}>Agendado</span>
              </GlassCard>
            ))}
            {agendadas.length===0&&<div style={{fontSize:13,color:'var(--text-hint)',padding:'12px 0'}}>Nenhuma campanha agendada.</div>}
          </div>
        </div>

        <div>
          <div style={s.sectionTitle}>Enviadas ({enviadas.length})</div>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
            {enviadas.map((c,i)=>(
              <GlassCard key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px'}}>
                <div style={{...s.campDate,background:SEG_BG[c.segmento]||'rgba(255,255,255,0.06)',color:SEG_COLORS[c.segmento]||'var(--text-primary)'}}>
                  <div style={s.campDateNum}>{new Date(c.data_envio).getDate()}</div>
                  <div style={{fontSize:9}}>{new Date(c.data_envio).toLocaleString('pt-BR',{month:'short'})}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={s.campName}>{c.nome}</div>
                  <div style={s.campMeta}><span style={{color:SEG_COLORS[c.segmento]}}>{c.segmento}</span><span>·</span><span>{c.total_enviadas} enviados</span>{c.total_abertas>0&&<><span>·</span><span>{Math.round(c.total_abertas/c.total_enviadas*100)}% abertura</span></>}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:13,fontWeight:600,color:'rgba(80,220,130,.9)'}}>R${Number(c.receita_gerada).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
                  <div style={{fontSize:10,color:'var(--text-hint)'}}>receita</div>
                </div>
              </GlassCard>
            ))}
            {enviadas.length===0&&<div style={{fontSize:13,color:'var(--text-hint)',padding:'12px 0'}}>Nenhuma campanha enviada ainda.</div>}
          </div>

          <div style={s.sectionTitle}>Performance do mês</div>
          <div style={s.threeCol}>
            {[
              {label:'Msgs enviadas',value:campanhas.reduce((s,c)=>s+c.total_enviadas,0).toLocaleString('pt-BR')},
              {label:'Abertura média',value:`${campanhas.filter(c=>c.total_enviadas>0).reduce((s,c)=>s+Math.round(c.total_abertas/c.total_enviadas*100),0)/Math.max(campanhas.filter(c=>c.total_enviadas>0).length,1)||0}%`},
              {label:'Receita gerada',value:`R$${campanhas.reduce((s,c)=>s+Number(c.receita_gerada),0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`},
            ].map((m,i)=>(
              <GlassCard key={i} style={{padding:'14px 16px'}}>
                <div style={s.metricLabel}>{m.label}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700}}>{loading?'...':m.value}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Nova Campanha</span>
              <button style={s.closeBtn} onClick={()=>{setShowModal(false);setStep(0)}}>✕</button>
            </div>
            <div style={s.modalBody}>
              {/* Steps */}
              <div style={{display:'flex',gap:0,marginBottom:22}}>
                {STEPS.map((l,i)=>(
                  <div key={i} style={{flex:1,textAlign:'center',position:'relative'}}>
                    <div style={{position:'absolute',top:13,left:'50%',width:'100%',height:1,background:i<step?'#25D366':'rgba(255,255,255,0.1)',zIndex:0}}/>
                    <div style={{width:26,height:26,borderRadius:'50%',border:`1px solid ${i<=step?'#25D366':'rgba(255,255,255,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,margin:'0 auto 5px',background:i<step?'#25D366':i===step?'rgba(37,211,102,0.1)':'rgba(255,255,255,0.05)',color:i<step?'#fff':i===step?'#25D366':'rgba(255,255,255,0.5)',position:'relative',zIndex:1}}>{i<step?'✓':i+1}</div>
                    <div style={{fontSize:10,color:i<=step?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.3)'}}>{l}</div>
                  </div>
                ))}
              </div>

              {step===0&&(
                <div>
                  <div style={s.formLabel}>Escolha o segmento de público</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                    {SEGMENTS.map(sg=>(
                      <div key={sg} onClick={()=>{setSelSeg(sg);setSelSug(0)}} style={{padding:'5px 13px',borderRadius:20,fontSize:12,fontWeight:500,border:`1.5px solid ${selSeg===sg?'rgba(37,211,102,0.4)':'rgba(255,255,255,0.12)'}`,cursor:'pointer',background:selSeg===sg?'rgba(37,211,102,0.12)':'rgba(255,255,255,0.04)',color:selSeg===sg?'rgba(80,220,130,.95)':'rgba(255,255,255,0.6)'}}>
                        {sg}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step===1&&(
                <div>
                  <div style={{fontSize:12,color:'var(--text-hint)',marginBottom:10}}>Sugestões da IA para <span style={{color:'rgba(80,220,130,.9)',fontWeight:500}}>{selSeg}</span></div>
                  {(SUGESTOES[selSeg]||SUGESTOES.default).map((sg,i)=>(
                    <div key={i} onClick={()=>setSelSug(i)} style={{border:`0.5px solid ${selSug===i?'rgba(37,211,102,0.38)':'rgba(255,255,255,0.1)'}`,borderRadius:10,padding:'11px 13px',cursor:'pointer',marginBottom:7,background:selSug===i?'rgba(37,211,102,0.06)':'rgba(255,255,255,0.03)'}}>
                      <div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{sg.t}</div>
                      <div style={{fontSize:11,color:'var(--text-hint)'}}>{sg.m}</div>
                    </div>
                  ))}
                </div>
              )}

              {step===2&&(
                <div>
                  <div style={s.formLabel}>Template aprovado pelo WhatsApp</div>
                  <div style={{background:'rgba(37,211,102,0.07)',border:'0.5px solid rgba(37,211,102,0.2)',borderRadius:12,padding:16,fontSize:13,color:'var(--text-primary)',lineHeight:1.8,marginTop:8}}>
                    {sug.m}<br/><br/>
                    <span style={{fontSize:11,color:'var(--text-hint)'}}>Template aprovado pela Meta API ✓</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--text-hint)',marginTop:10}}>{'{{nome}}'} será preenchido automaticamente para cada contato do segmento.</div>
                </div>
              )}

              {step===3&&(
                <div>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Data de envio</label>
                    <input type="date" style={s.formInput} value={dataEnvio} onChange={e=>setDataEnvio(e.target.value)}/>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Horário</label>
                    <input type="time" style={s.formInput} value={hora} onChange={e=>setHora(e.target.value)}/>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:10,padding:13,fontSize:12.5,lineHeight:2,color:'var(--text-secondary)'}}>
                    <b style={{color:'var(--text-primary)'}}>Segmento:</b> {selSeg}<br/>
                    <b style={{color:'var(--text-primary)'}}>Campanha:</b> {sug.t}<br/>
                    <b style={{color:'var(--text-primary)'}}>Envio:</b> {dataEnvio?new Date(`${dataEnvio}T${hora}`).toLocaleString('pt-BR'):'—'}
                  </div>
                </div>
              )}
            </div>
            <div style={s.modalFooter}>
              {step>0&&<button style={s.btn} onClick={()=>setStep(s=>s-1)}>Voltar</button>}
              <button style={s.btnPrimary} onClick={()=>step<3?setStep(s=>s+1):handleAgendar()} disabled={saving}>
                {step===3?(saving?'Agendando...':'Agendar campanha'):'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

const s = {
  twoCol:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24},
  threeCol:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10},
  sectionTitle:{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:600,marginBottom:14},
  metricLabel:{fontSize:11,color:'var(--text-hint)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em'},
  calGrid:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3},
  calHeader:{textAlign:'center',fontSize:10,color:'var(--text-hint)',padding:'4px 0'},
  calDay:{aspectRatio:'1',borderRadius:7,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontSize:12,cursor:'pointer',position:'relative',color:'var(--text-secondary)',minHeight:34},
  calDayToday:{background:'rgba(37,211,102,0.15)',color:'rgba(80,220,130,.95)',fontWeight:700},
  calDot:{width:4,height:4,borderRadius:'50%',background:'#25D366',position:'absolute',bottom:4,boxShadow:'0 0 5px rgba(37,211,102,0.5)'},
  campDate:{width:42,height:42,borderRadius:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0},
  campDateNum:{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,lineHeight:1},
  campName:{fontSize:13,fontWeight:500,marginBottom:2},
  campMeta:{fontSize:11,color:'var(--text-hint)',display:'flex',alignItems:'center',gap:6},
  statusScheduled:{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:500,background:'rgba(255,195,60,0.1)',color:'rgba(255,195,60,.9)',flexShrink:0},
  toast:{position:'fixed',bottom:24,right:24,zIndex:200,background:'rgba(16,16,24,0.96)',color:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',border:'0.5px solid rgba(255,255,255,0.15)',padding:'10px 18px',borderRadius:11,fontSize:13},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100},
  modal:{background:'rgba(14,14,22,0.95)',backdropFilter:'blur(30px)',border:'0.5px solid rgba(255,255,255,0.15)',borderRadius:20,width:520,maxWidth:'95vw',overflow:'hidden'},
  modalHeader:{padding:'18px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'},
  modalTitle:{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:600},
  closeBtn:{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:18,cursor:'pointer',padding:'4px 8px',borderRadius:6},
  modalBody:{padding:20,maxHeight:'60vh',overflowY:'auto'},
  modalFooter:{padding:'14px 20px',borderTop:'0.5px solid rgba(255,255,255,0.15)',display:'flex',justifyContent:'flex-end',gap:8},
  formGroup:{marginBottom:14},
  formLabel:{fontSize:11,color:'var(--text-hint)',marginBottom:7,display:'block',letterSpacing:'.04em',textTransform:'uppercase'},
  formInput:{width:'100%',padding:'9px 13px',border:'0.5px solid rgba(255,255,255,0.15)',borderRadius:9,fontSize:13,background:'rgba(255,255,255,0.05)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif",outline:'none'},
  btn:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'rgba(255,255,255,0.07)',border:'0.5px solid rgba(255,255,255,0.15)',color:'var(--text-primary)',fontFamily:"'Inter',sans-serif"},
  btnPrimary:{display:'inline-flex',alignItems:'center',padding:'7px 14px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'linear-gradient(135deg,rgba(37,211,102,0.88),rgba(15,140,60,0.88))',border:'0.5px solid rgba(37,211,102,0.5)',color:'#fff',fontFamily:"'Inter',sans-serif"},
}
