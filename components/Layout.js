import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const navItems = [
  { href:'/', label:'Dashboard', icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
  { href:'/contatos', label:'Contatos', icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href:'/clientes', label:'Clientes RFM', icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { href:'/campanhas', label:'Campanhas', icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { href:'/integracoes', label:'Integrações', icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
]

const pageTitles = { '/':'Dashboard', '/contatos':'Contatos', '/clientes':'Clientes RFM', '/campanhas':'Campanhas', '/integracoes':'Integrações' }

export default function Layout({ children }) {
  const router = useRouter()
  const [period, setPeriod] = useState('semana')
  const title = pageTitles[router.pathname] || 'FideliZap'

  function handleNovaCampanha() {
    if (router.pathname === '/campanhas') {
      window.dispatchEvent(new CustomEvent('openNovaCampanha'))
    } else {
      router.push('/campanhas')
    }
  }

  return (
    <div style={styles.app}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          </div>
          <div>
            <div style={styles.logoText}>FideliZap</div>
            <div style={styles.logoSub}>CRM via WhatsApp</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <div style={styles.navSection}>Principal</div>
          {navItems.slice(0,4).map(item=>(
            <Link key={item.href} href={item.href} style={{textDecoration:'none'}}>
              <div style={{...styles.navItem,...(router.pathname===item.href?styles.navItemActive:{})}}>
                {router.pathname===item.href&&<div style={styles.navActiveLine}/>}
                <span style={{opacity:router.pathname===item.href?1:0.65}}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
          <div style={{...styles.navSection,marginTop:8}}>Sistema</div>
          <Link href="/integracoes" style={{textDecoration:'none'}}>
            <div style={{...styles.navItem,...(router.pathname==='/integracoes'?styles.navItemActive:{})}}>
              {router.pathname==='/integracoes'&&<div style={styles.navActiveLine}/>}
              <span style={{opacity:router.pathname==='/integracoes'?1:0.65}}>{navItems[4].icon}</span>
              {navItems[4].label}
            </div>
          </Link>
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.userPill}>
            <div style={styles.avatar}>FA</div>
            <div>
              <div style={styles.userName}>Farmácia Araujo</div>
              <div style={styles.userPlan}>Plano Pro</div>
            </div>
          </div>
        </div>
      </aside>
      <div style={styles.main}>
        <header style={styles.topbar}>
          <div style={styles.pageTitle}>{title}</div>
          <div style={styles.topbarRight}>
            <div style={styles.periodPills}>
              {['dia','semana','mês'].map(p=>(
                <div key={p} style={{...styles.periodPill,...(period===p?styles.periodPillActive:{})}} onClick={()=>setPeriod(p)}>
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </div>
              ))}
            </div>
            <button style={styles.btnPrimary} onClick={handleNovaCampanha}>+ Nova Campanha</button>
          </div>
        </header>
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  )
}

const styles = {
  app:{fontFamily:"'Inter',sans-serif",minHeight:'100vh',display:'flex',color:'var(--text-primary)',background:`radial-gradient(ellipse 70% 55% at 5% 10%,rgba(37,211,102,0.13) 0%,transparent 55%),radial-gradient(ellipse 60% 50% at 95% 90%,rgba(80,100,255,0.11) 0%,transparent 55%),#090910`,position:'relative'},
  orb1:{position:'fixed',width:600,height:600,top:-200,left:-200,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,211,102,0.13),transparent 65%)',pointerEvents:'none',zIndex:0},
  orb2:{position:'fixed',width:700,height:700,bottom:-250,right:-200,borderRadius:'50%',background:'radial-gradient(circle,rgba(80,100,255,0.10),transparent 65%)',pointerEvents:'none',zIndex:0},
  orb3:{position:'fixed',width:500,height:500,top:'35%',left:'35%',borderRadius:'50%',background:'radial-gradient(circle,rgba(180,60,255,0.07),transparent 65%)',pointerEvents:'none',zIndex:0},
  sidebar:{width:224,minWidth:224,position:'sticky',top:0,height:'100vh',zIndex:10,display:'flex',flexDirection:'column',background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px) saturate(200%)',WebkitBackdropFilter:'blur(20px) saturate(200%)',borderRight:'0.5px solid rgba(255,255,255,0.15)'},
  logo:{padding:'22px 20px 20px',borderBottom:'0.5px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',gap:11},
  logoIcon:{width:36,height:36,background:'linear-gradient(135deg,#25D366,#1aab52)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(37,211,102,0.3)',flexShrink:0},
  logoText:{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:'var(--text-primary)'},
  logoSub:{fontSize:10,color:'var(--text-hint)'},
  nav:{padding:'14px 10px',flex:1},
  navSection:{fontSize:9,color:'var(--text-hint)',textTransform:'uppercase',letterSpacing:'.1em',padding:'10px 10px 5px'},
  navItem:{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:10,fontSize:13.5,cursor:'pointer',color:'var(--text-secondary)',transition:'all .18s',userSelect:'none',marginBottom:2,position:'relative',textDecoration:'none'},
  navItemActive:{background:'rgba(37,211,102,0.11)',color:'rgba(37,211,102,0.95)',fontWeight:500,border:'0.5px solid rgba(37,211,102,0.22)'},
  navActiveLine:{position:'absolute',left:-1,top:'20%',width:3,height:'60%',background:'#25D366',borderRadius:2,boxShadow:'0 0 10px rgba(37,211,102,0.3)'},
  sidebarFooter:{padding:'14px 12px',borderTop:'0.5px solid rgba(255,255,255,0.15)'},
  userPill:{display:'flex',alignItems:'center',gap:9,background:'rgba(255,255,255,0.05)',borderRadius:10,padding:'9px 11px',border:'0.5px solid rgba(255,255,255,0.15)'},
  avatar:{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#25D366,#0a7a38)',color:'#fff',fontSize:10,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center'},
  userName:{fontSize:12.5,fontWeight:500},
  userPlan:{fontSize:10,color:'var(--text-hint)'},
  main:{flex:1,overflowY:'auto',overflowX:'hidden',position:'relative',zIndex:1},
  topbar:{position:'sticky',top:0,zIndex:20,backdropFilter:'blur(12px) saturate(160%)',WebkitBackdropFilter:'blur(12px) saturate(160%)',background:'rgba(9,9,16,0.65)',borderBottom:'0.5px solid rgba(255,255,255,0.15)',padding:'0 28px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between'},
  pageTitle:{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:600},
  topbarRight:{display:'flex',alignItems:'center',gap:10},
  periodPills:{display:'flex',gap:3,background:'rgba(255,255,255,0.05)',padding:3,borderRadius:9,border:'0.5px solid rgba(255,255,255,0.15)'},
  periodPill:{padding:'4px 12px',fontSize:12,borderRadius:7,cursor:'pointer',color:'var(--text-secondary)',transition:'all .15s'},
  periodPillActive:{background:'rgba(255,255,255,0.1)',color:'var(--text-primary)',fontWeight:500},
  btnPrimary:{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 15px',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',background:'linear-gradient(135deg,rgba(37,211,102,0.88),rgba(15,140,60,0.88))',border:'0.5px solid rgba(37,211,102,0.5)',color:'#fff',boxShadow:'0 4px 18px rgba(37,211,102,0.22)',fontFamily:"'Inter',sans-serif"},
  content:{padding:'24px 28px 40px'},
}
