const CLASS_BY_LEVEL = {
  Alto: 'badge--alto',
  Médio: 'badge--medio',
  Baixo: 'badge--baixo',
  Crítico: 'badge--critico',
}

export default function RiskBadge({ level }) {
  return <span className={`badge ${CLASS_BY_LEVEL[level] || 'badge--baixo'}`}>Risco {level}</span>
}
