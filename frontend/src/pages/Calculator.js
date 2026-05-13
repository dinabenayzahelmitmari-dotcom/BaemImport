
import React, { useState, useEffect } from 'react';
import './Calculator.css';

const TABS = [
  { id: 'import', label: 'Importación' },
  { id: 'finance', label: 'Financiación' },
  { id: 'profit', label: 'Rentabilidad' }
];

const IMPUESTO_MATRICULACION = [
  { label: '0% (≤ 120 g/km)', value: 0 },
  { label: '4.75% (121 - 160 g/km)', value: 0.0475 },
  { label: '9.75% (161 - 200 g/km)', value: 0.0975 },
  { label: '14.75% (> 200 g/km)', value: 0.1475 }
];

export default function Calculator() {
  const [activeTab, setActiveTab] = useState('import');
  
  // State for Import Calculator
  const [importForm, setImportForm] = useState({
    precioCompra: '',
    transporte: '900',
    comision: '1000',
    impuestoMatriculacion: 0,
    otrosGastos: '300'
  });
  const [importResult, setImportResult] = useState(null);

  // State for Finance Calculator
  const [financeForm, setFinanceForm] = useState({
    importe: '',
    entrada: '',
    interes: '5.99',
    plazo: '60'
  });
  const [financeResult, setFinanceResult] = useState(null);

  // State for Profit Calculator
  const [profitForm, setProfitForm] = useState({
    costeAdquisicion: '',
    gastosReacondicionamiento: '500',
    precioVenta: ''
  });
  const [profitResult, setProfitResult] = useState(null);

  // Calculations
  useEffect(() => {
    if (activeTab === 'import') {
      const pc = parseFloat(importForm.precioCompra) || 0;
      const tr = parseFloat(importForm.transporte) || 0;
      const co = parseFloat(importForm.comision) || 0;
      const im = pc * importForm.impuestoMatriculacion;
      const ot = parseFloat(importForm.otrosGastos) || 0;
      
      if (pc > 0) {
        setImportResult({
          base: pc,
          transporte: tr,
          comision: co,
          impuesto: im,
          otros: ot,
          total: pc + tr + co + im + ot
        });
      } else {
        setImportResult(null);
      }
    } else if (activeTab === 'finance') {
      const imp = parseFloat(financeForm.importe) || 0;
      const ent = parseFloat(financeForm.entrada) || 0;
      const int = parseFloat(financeForm.interes) / 100 / 12;
      const pla = parseInt(financeForm.plazo) || 0;
      
      const capital = imp - ent;
      if (capital > 0 && pla > 0 && int > 0) {
        const cuota = (capital * int) / (1 - Math.pow(1 + int, -pla));
        setFinanceResult({
          cuota: cuota,
          totalPagado: cuota * pla,
          interesesTotales: (cuota * pla) - capital,
          capitalFinanciado: capital
        });
      } else if (capital > 0 && pla > 0 && int === 0) {
        setFinanceResult({
          cuota: capital / pla,
          totalPagado: capital,
          interesesTotales: 0,
          capitalFinanciado: capital
        });
      } else {
        setFinanceResult(null);
      }
    } else if (activeTab === 'profit') {
      const ca = parseFloat(profitForm.costeAdquisicion) || 0;
      const gr = parseFloat(profitForm.gastosReacondicionamiento) || 0;
      const pv = parseFloat(profitForm.precioVenta) || 0;
      
      if (ca > 0 && pv > 0) {
        const margen = pv - (ca + gr);
        const porcentaje = (margen / pv) * 100;
        setProfitResult({
          margen: margen,
          porcentaje: porcentaje,
          inversionTotal: ca + gr
        });
      } else {
        setProfitResult(null);
      }
    }
  }, [activeTab, importForm, financeForm, profitForm]);

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Calculadora Profesional</h1>
          <p className="page-subtitle">Herramientas de análisis y costes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card fade-in" style={{ padding: '4px', marginBottom: '20px', display: 'flex', gap: '4px', background: 'var(--grey-100)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-navy' : 'btn-ghost'}`}
            style={{ flex: 1, borderRadius: 'var(--radius-md)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="fade-in fade-in-1">
        {activeTab === 'import' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--navy)' }}>Costes de Importación</h2>
              <div className="form-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Precio de Compra (EUR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={importForm.precioCompra}
                    onChange={e => setImportForm({ ...importForm, precioCompra: e.target.value })}
                    placeholder="Ej. 25000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Transporte Alemania - España</label>
                  <input
                    type="number"
                    className="form-input"
                    value={importForm.transporte}
                    onChange={e => setImportForm({ ...importForm, transporte: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Impuesto de Matriculación</label>
                  <select
                    className="form-input form-select"
                    value={importForm.impuestoMatriculacion}
                    onChange={e => setImportForm({ ...importForm, impuestoMatriculacion: parseFloat(e.target.value) })}
                  >
                    {IMPUESTO_MATRICULACION.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comisión de Gestión</label>
                  <input
                    type="number"
                    className="form-input"
                    value={importForm.comision}
                    onChange={e => setImportForm({ ...importForm, comision: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Otros Gastos (ITV, Gestoría)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={importForm.otrosGastos}
                    onChange={e => setImportForm({ ...importForm, otrosGastos: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'var(--navy)', color: 'white' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>Resumen de Costes</h2>
              {importResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Base del Vehículo</span>
                    <span style={{ fontWeight: '700' }}>{importResult.base.toLocaleString()} €</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Transporte</span>
                    <span style={{ fontWeight: '700' }}>{importResult.transporte.toLocaleString()} €</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Impuesto Matriculación</span>
                    <span style={{ fontWeight: '700' }}>{importResult.impuesto.toLocaleString()} €</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Gestión y Otros</span>
                    <span style={{ fontWeight: '700' }}>{(importResult.comision + importResult.otros).toLocaleString()} €</span>
                  </div>
                  <div style={{ marginTop: '10px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Puesto en España</p>
                    <p style={{ fontSize: '32px', fontWeight: '800', marginTop: '4px' }}>{importResult.total.toLocaleString()} €</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '40px', opacity: 0.5 }}>
                  <p>Introduce el precio de compra para ver el desglose</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--navy)' }}>Simulador de Financiación</h2>
              <div className="form-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Importe del Vehículo</label>
                  <input
                    type="number"
                    className="form-input"
                    value={financeForm.importe}
                    onChange={e => setFinanceForm({ ...financeForm, importe: e.target.value })}
                    placeholder="Ej. 30000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Entrada Inicial</label>
                  <input
                    type="number"
                    className="form-input"
                    value={financeForm.entrada}
                    onChange={e => setFinanceForm({ ...financeForm, entrada: e.target.value })}
                    placeholder="Ej. 5000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Plazo (meses)</label>
                  <select
                    className="form-input form-select"
                    value={financeForm.plazo}
                    onChange={e => setFinanceForm({ ...financeForm, plazo: e.target.value })}
                  >
                    {[12, 24, 36, 48, 60, 72, 84, 96].map(m => (
                      <option key={m} value={m}>{m} meses ({m/12} años)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Interés (TIN %)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={financeForm.interes}
                    onChange={e => setFinanceForm({ ...financeForm, interes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: '#2e7d32', color: 'white' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>Detalles del Préstamo</h2>
              {financeResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Capital Financiado</span>
                    <span style={{ fontWeight: '700' }}>{financeResult.capitalFinanciado.toLocaleString()} €</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Intereses Totales</span>
                    <span style={{ fontWeight: '700' }}>{financeResult.interesesTotales.toLocaleString()} €</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Total a Pagar</span>
                    <span style={{ fontWeight: '700' }}>{financeResult.totalPagado.toLocaleString()} €</span>
                  </div>
                  <div style={{ marginTop: '10px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Cuota Mensual Estimada</p>
                    <p style={{ fontSize: '32px', fontWeight: '800', marginTop: '4px' }}>{financeResult.cuota.toLocaleString(undefined, { maximumFractionDigits: 2 })} €</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '40px', opacity: 0.5 }}>
                  <p>Introduce los datos financieros para ver la cuota</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profit' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--navy)' }}>Cálculo de Beneficio</h2>
              <div className="form-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Coste de Adquisición (Total)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profitForm.costeAdquisicion}
                    onChange={e => setProfitForm({ ...profitForm, costeAdquisicion: e.target.value })}
                    placeholder="Ej. 27500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gastos de Reacondicionamiento</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profitForm.gastosReacondicionamiento}
                    onChange={e => setProfitForm({ ...profitForm, gastosReacondicionamiento: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio de Venta (PVP)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profitForm.precioVenta}
                    onChange={e => setProfitForm({ ...profitForm, precioVenta: e.target.value })}
                    placeholder="Ej. 32000"
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'var(--red)', color: 'white' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>Análisis de Margen</h2>
              {profitResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Inversión Total</span>
                    <span style={{ fontWeight: '700' }}>{profitResult.inversionTotal.toLocaleString()} €</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <span>Precio de Venta</span>
                    <span style={{ fontWeight: '700' }}>{parseFloat(profitForm.precioVenta).toLocaleString()} €</span>
                  </div>
                  <div style={{ marginTop: '10px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Beneficio Estimado</p>
                    <p style={{ fontSize: '32px', fontWeight: '800', marginTop: '4px' }}>{profitResult.margen.toLocaleString()} €</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px', opacity: 0.9 }}>Margen: {profitResult.porcentaje.toFixed(2)} %</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '40px', opacity: 0.5 }}>
                  <p>Introduce costes y precio de venta para calcular el margen</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card fade-in" style={{ marginTop: '20px', padding: '16px', borderLeft: '4px solid var(--navy)' }}>
        <p style={{ fontSize: '13px', color: 'var(--grey-700)', lineHeight: '1.6' }}>
          <strong>Nota Informativa:</strong> Estas calculadoras proporcionan estimaciones basadas en los datos introducidos. 
          Los costes reales de importación pueden variar según la comunidad autónoma, el valor venal del vehículo en tablas de Hacienda y fluctuaciones en gastos logísticos.
        </p>
      </div>
    </div>
  );
}
