import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Reports() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => {
    axios.get('/api/stats/dashboard')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;

  const vehiculosTotal = stats?.vehiculos?.total || 0;
  const porcentajeDisponible = vehiculosTotal ? Math.round((stats?.vehiculos?.disponibles / vehiculosTotal) * 100) : 0;
  const porcentajeVendido    = vehiculosTotal ? Math.round((stats?.vehiculos?.vendidos / vehiculosTotal) * 100) : 0;
  const porcentajeReservado  = vehiculosTotal ? Math.round((stats?.vehiculos?.reservados / vehiculosTotal) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div><h1 className="page-title">Informes</h1><p className="page-subtitle">Resumen del negocio</p></div>
      </div>

      {/* KPIs principales */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }} className="fade-in fade-in-1">
        {[
          { label:'Ventas este mes', valor: `${(stats?.ventasMes||0).toLocaleString('es-ES',{maximumFractionDigits:0})} EUR`, color:'var(--navy)', bg:'var(--navy)', textColor:'white' },
          { label:'Pedidos completados', valor: stats?.pedidos?.completados || 0, color:'#2e7d32', bg:'#e8f5e9', textColor:'#2e7d32' },
          { label:'Pedidos activos', valor: stats?.pedidos?.pendientes || 0, color:'#f57f17', bg:'#fff8e1', textColor:'#f57f17' },
          { label:'Total clientes', valor: stats?.clientes?.total || 0, color:'#1565c0', bg:'#e3f2fd', textColor:'#1565c0' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'16px', background: k.bg === 'var(--navy)' ? 'var(--navy)' : k.bg }}>
            <p style={{ fontSize:11, fontFamily:'var(--font-display)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', color: k.bg === 'var(--navy)' ? 'rgba(255,255,255,0.55)' : k.textColor, marginBottom:4 }}>{k.label}</p>
            <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color: k.bg === 'var(--navy)' ? 'white' : k.textColor, lineHeight:1 }}>{k.valor}</p>
          </div>
        ))}
      </div>

      {/* Stock */}
      <div className="card fade-in fade-in-2" style={{ padding:20, marginBottom:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Estado del stock de vehiculos</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { label:'Disponibles', val: stats?.vehiculos?.disponibles||0, pct: porcentajeDisponible, color:'#2e7d32' },
            { label:'Vendidos',    val: stats?.vehiculos?.vendidos||0,    pct: porcentajeVendido,    color:'var(--red)' },
            { label:'Reservados',  val: stats?.vehiculos?.reservados||0,  pct: porcentajeReservado,  color:'#f57f17' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, color:'var(--navy)', fontWeight:600 }}>{item.label}</span>
                <span style={{ fontSize:13, color:'var(--grey-500)' }}>{item.val} ({item.pct}%)</span>
              </div>
              <div style={{ height:8, background:'var(--grey-100)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:4, transition:'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:16 }}>
          {[
            { label:'Total en cartera', val: vehiculosTotal },
            { label:'Disponibles', val: stats?.vehiculos?.disponibles||0 },
            { label:'Reservados', val: stats?.vehiculos?.reservados||0 },
            { label:'Vendidos', val: stats?.vehiculos?.vendidos||0 },
          ].map(x => (
            <div key={x.label} style={{ textAlign:'center', padding:'10px 8px', background:'var(--grey-50)', borderRadius:'var(--radius-md)' }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)' }}>{x.val}</p>
              <p style={{ fontSize:11, color:'var(--grey-500)', marginTop:2 }}>{x.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ultimos pedidos completados */}
      <div className="card fade-in fade-in-3" style={{ padding:20, marginBottom:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Ultimos pedidos recientes</h2>
        {stats?.ultimosPedidos?.length === 0 ? (
          <p style={{ fontSize:13, color:'var(--grey-500)', textAlign:'center', padding:'20px 0' }}>Sin pedidos recientes</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {stats?.ultimosPedidos?.map(o => (
              <div key={o._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--grey-100)' }}>
                <div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--navy)' }}>{o.vehiculo?.marca} {o.vehiculo?.modelo}</p>
                  <p style={{ fontSize:11, color:'var(--grey-500)' }}>{o.cliente?.nombre} {o.cliente?.apellidos||''}</p>
                </div>
                <p style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--navy)' }}>{o.precioFinal?.toLocaleString('es-ES')} EUR</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentacion y consejos */}
      <div className="card fade-in fade-in-4" style={{ padding:20 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Informacion util</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { titulo:'Impuesto de Matriculacion', desc:'Los vehiculos con mas de 120 g/km CO2 tributan entre el 4.5% y el 14.5% segun emisiones.' },
            { titulo:'IVA intracomunitario', desc:'Las operaciones entre empresas de la UE con NIF intracomunitario estan exentas de IVA. Los particulares deben pagar el 21%.' },
            { titulo:'Homologacion y COC', desc:'El Certificado de Conformidad (COC) es obligatorio para la matriculacion en Espana de vehiculos importados.' },
            { titulo:'Transporte Alemania - Espana', desc:'El coste estimado de transporte por carretera es de 700 a 1.100 EUR segun el tipo de vehiculo.' },
          ].map(info => (
            <div key={info.titulo} style={{ padding:'12px 14px', background:'var(--grey-50)', borderRadius:'var(--radius-md)', borderLeft:'3px solid var(--red)' }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>{info.titulo}</p>
              <p style={{ fontSize:12, color:'var(--grey-700)', lineHeight:1.5 }}>{info.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
