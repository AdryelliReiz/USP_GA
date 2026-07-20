const OPCOES = [
  { id: 'todas', label: 'Mostrar todas as unidades do bairro selecionado' },
  { id: 'inundacao', label: 'Filtrar apenas unidades em área de Inundação' },
  { id: 'deslizamento', label: 'Filtrar apenas unidades em área de Deslizamento' },
]

export default function FiltroPainel({ filtro, onChange }) {
  return (
    <fieldset className="filtro-painel">
      <legend>Filtrar unidades exibidas no mapa</legend>
      {OPCOES.map((op) => (
        <label key={op.id} className="filtro-painel__opcao">
          <input
            type="checkbox"
            checked={filtro === op.id}
            onChange={() => onChange(op.id)}
          />
          <span>{op.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
