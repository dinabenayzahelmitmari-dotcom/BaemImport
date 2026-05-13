
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MarketInsights() {
  const [data, setData] = useState({
    compra: 45000,
    transporte: 1200,
    impuestos: 3450,
    venta: 58000
  });

  const beneficio = data.venta - (data.compra + data.transporte + data.impuestos);
  const roi = ((beneficio / (data.compra + data.transporte + data.impuestos)) * 100).toFixed(1);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(26, 35, 126); // Navy
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("INFORME DE VIABILIDAD - BAEMIMPORT", 15, 20);
    
    // Table
    autoTable(doc, {
      startY: 40,
      head: [["Concepto", "Importe (€)"]],
      body: [
        ["Precio Compra (Neto GER)", `${data.compra.toLocaleString()} €`],
        ["Coste Transporte", `${data.transporte.toLocaleString()} €`],
        ["Impuestos Matriculación (ESP)", `${data.impuestos.toLocaleString()} €`],
        ["PRECIO VENTA OBJETIVO", `${data.venta.toLocaleString()} €`],
        ["", ""],
        ["BENEFICIO NETO ESTIMADO", `${beneficio.toLocaleString()} €`],
        ["MARGEN ROI", `${roi}%`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] },
      styles: { fontSize: 12, cellPadding: 5 }
    });
    
    doc.save(`Informe_Viabilidad_${new Date().getTime()}.pdf`);
  };

  const trends = [
    { model: 'BMW M4 (G82)', demand: 'Muy Alta', roi: '18%', source: 'Germany' },
    { model: 'Audi RS6 Avant', demand: 'Alta', roi: '14%', source: 'Germany' },
    { model: 'Porsche 911 (992)', demand: 'Media-Alta', roi: '22%', source: 'Germany/UAE' },
    { model: 'Tesla Model Y', demand: 'Alta', roi: '12%', source: 'Stock EU' },
  ];

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>Inteligencia de Mercado</h1>
        <p style={{ color: 'var(--grey-500)' }}>Datos estratégicos para optimizar tus importaciones y márgenes de beneficio.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* ROI Calculator per Vehicle */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>Calculadora de Viabilidad (ROI)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Precio Compra (Neto GER) €</label>
              <input className="form-input" type="number" value={data.compra} onChange={e => setData({...data, compra: Number(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Coste Transporte €</label>
              <input className="form-input" type="number" value={data.transporte} onChange={e => setData({...data, transporte: Number(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Impuestos Matriculación (ESP) €</label>
              <input className="form-input" type="number" value={data.impuestos} onChange={e => setData({...data, impuestos: Number(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio Venta Objetivo €</label>
              <input className="form-input" type="number" value={data.venta} onChange={e => setData({...data, venta: Number(e.target.value)})} />
            </div>
            <div style={{ marginTop: 12, padding: 16, background: 'var(--grey-50)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--grey-500)' }}>Beneficio Neto Est.</span>
                <span style={{ fontWeight: 800, color: '#2e7d32' }}>{beneficio.toLocaleString()} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--grey-500)' }}>Margen ROI</span>
                <span style={{ fontWeight: 800, color: 'var(--navy)' }}>{roi}%</span>
              </div>
            </div>
            <button className="btn btn-navy btn-full" style={{ marginTop: 12 }} onClick={generatePDF}>Generar Informe de Viabilidad</button>
          </div>
        </div>

        {/* Technical Data Utility */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>Modelos de Alta Demanda (Ocasión)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--grey-100)' }}>
                <th style={{ paddingBottom: 12, fontSize: 12, color: 'var(--grey-400)' }}>MODELO</th>
                <th style={{ paddingBottom: 12, fontSize: 12, color: 'var(--grey-400)' }}>DEMANDA</th>
                <th style={{ paddingBottom: 12, fontSize: 12, color: 'var(--grey-400)' }}>ROI EST.</th>
              </tr>
            </thead>
            <tbody>
              {trends.map(t => (
                <tr key={t.model} style={{ borderBottom: '1px solid var(--grey-50)' }}>
                  <td style={{ padding: '12px 0', fontSize: 13, fontWeight: 700 }}>{t.model}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span className="badge badge-info" style={{ fontSize: 10 }}>{t.demand}</span>
                  </td>
                  <td style={{ padding: '12px 0', fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{t.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 24, padding: 16, background: '#e3f2fd', borderRadius: 12, border: '1px solid #90caf9' }}>
            <h4 style={{ fontSize: 12, color: '#1565c0', fontWeight: 800, marginBottom: 4 }}>TIPS DE IMPORTACIÓN</h4>
            <p style={{ fontSize: 11, color: '#1565c0', lineHeight: 1.4 }}>
              Los vehículos con emisiones de CO2 menores a 120g/km están exentos del impuesto de matriculación en España. Prioriza estos modelos para maximizar tu margen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
