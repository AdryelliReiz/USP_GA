const ITEMS = [
  { cor: 'var(--cc-marrom)', label: 'Zona crítica', desc: 'inundação + proximidade (≤300m) a ponto de deslizamento mapeado' },
  { cor: 'var(--cc-azul)', label: 'Risco de inundação', desc: 'unidades em área suscetível a inundação (classe IPT/CPRM)' },
  { cor: 'var(--cc-laranja)', label: 'Risco de deslizamento', desc: 'proximidade a ponto de deslizamento, sem risco de inundação' },
  { cor: '#b9c0c6', label: 'Sem unidades de saúde', desc: 'bairro com população, mas nenhuma unidade no CNES' },
]

export default function MapLegend() {
  return (
    <div className="svmap-legend" aria-label="Legenda do mapa">
      {ITEMS.map((it) => (
        <div className="svmap-legend__item" key={it.label}>
          <span className="svmap-legend__swatch" style={{ background: it.cor }} />
          <div>
            <strong>{it.label}</strong>
            <span>{it.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
