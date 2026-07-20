import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { unidadesDoBairro, tiposEmRiscoNoBairro } from '../../data/derived.js'
import FiltroPainel from './FiltroPainel.jsx'

const RACA_LABEL = { branca: 'Branca', negra: 'Negra (preta + parda)', amarela: 'Amarela', indigena: 'Indígena' }
const RACA_CORES = ['#00a3e0', '#874a33', '#e87722', '#1a1e2c']
const TIPO_CORES = ['#e87722', '#874a33', '#00a3e0', '#007a4a', '#c98f1f', '#9aa3ab']

function FlagRisco({ label, valor }) {
  const texto = valor == null ? 'Sem dados' : valor ? 'Sim' : 'Não'
  const classe = valor === true ? 'flag--on' : valor == null ? 'flag--indisponivel' : ''
  return (
    <span className={`flag ${classe}`}>
      {label}: <strong>{texto}</strong>
    </span>
  )
}

export default function PainelBairro({ bairro, filtro, onFiltroChange }) {
  if (!bairro) {
    return (
      <aside className="painel-bairro painel-bairro--empty card">
        <span className="painel-bairro__empty-icon" aria-hidden="true">🗺️</span>
        <h3>Selecione um bairro no mapa</h3>
        <p>
          Clique em qualquer bairro para visualizar em detalhe a população, as unidades de
          saúde, os riscos ambientais e o perfil demográfico daquela região.
        </p>
      </aside>
    )
  }

  const unidades = unidadesDoBairro(bairro.id)
  const avaliadas = unidades.filter((u) => !u.semAvaliacaoRisco)
  const emRisco = unidades.filter((u) => u.riscos.length > 0)
  const percentualRisco = avaliadas.length ? Math.round((emRisco.length / avaliadas.length) * 100) : null
  const razao = bairro.populacao && bairro.qtdUnidades > 0 ? Math.round(bairro.populacao / bairro.qtdUnidades) : null
  const semCoordenadas = unidades.filter((u) => u.lat == null).length

  const dadosTipos = tiposEmRiscoNoBairro(bairro.id)
  const totalRaca = bairro.populacaoCor ? Object.values(bairro.populacaoCor).reduce((s, v) => s + v, 0) : 0
  const dadosRaca = bairro.populacaoCor
    ? Object.entries(bairro.populacaoCor).map(([k, v]) => ({
        name: RACA_LABEL[k],
        value: totalRaca ? Math.round((v / totalRaca) * 100) : 0,
      }))
    : []

  return (
    <aside className="painel-bairro card">
      <header className="painel-bairro__header">
        <span className="section-eyebrow" style={{ marginBottom: 4 }}>Bairro selecionado</span>
        <h3>{bairro.nome}</h3>
      </header>

      <div className="painel-bairro__stats">
        <div>
          <span>Habitantes</span>
          <strong>{bairro.populacao ? bairro.populacao.toLocaleString('pt-BR') : 'Sem dado censitário'}</strong>
        </div>
        <div>
          <span>Unidades de saúde</span>
          <strong>{bairro.qtdUnidades || 'Nenhuma'}</strong>
        </div>
        <div>
          <span>% em área de risco</span>
          <strong>{percentualRisco != null ? `${percentualRisco}%` : '—'}</strong>
        </div>
        <div>
          <span>Pessoas / unidade</span>
          <strong>{razao != null ? razao.toLocaleString('pt-BR') : bairro.qtdUnidades === 0 ? 'Sem unidades' : '—'}</strong>
        </div>
      </div>

      <div className="painel-bairro__flags">
        <FlagRisco label="Risco de deslizamento" valor={bairro.riscoDeslizamento} />
        <FlagRisco label="Risco de inundação" valor={bairro.riscoInundacao} />
      </div>

      {semCoordenadas > 0 && (
        <p className="painel-bairro__note">
          {semCoordenadas} unidade{semCoordenadas > 1 ? 's' : ''} deste bairro não possui coordenadas
          geográficas no cadastro (CNES) e por isso não aparece como pin no mapa.
        </p>
      )}

      <div className="painel-bairro__charts">
        <div className="painel-bairro__chart">
          <h4>Tipos de unidades em risco</h4>
          <p className="painel-bairro__chart-desc">Distribuição, por tipo, das unidades de saúde do bairro expostas a algum risco ambiental.</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dadosTipos} dataKey="value" nameKey="name" cx="50%" cy="42%" outerRadius={60} label={({ value }) => value}>
                {dadosTipos.map((_, i) => <Cell key={i} fill={TIPO_CORES[i % TIPO_CORES.length]} />)}
              </Pie>
              <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="painel-bairro__chart">
          <h4>Grupos populacionais</h4>
          <p className="painel-bairro__chart-desc">Distribuição racial autodeclarada (Censo IBGE 2022) da população do bairro, usada como leitura de vulnerabilidade social.</p>
          {dadosRaca.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={dadosRaca} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ value }) => `${value}%`}>
                  {dadosRaca.map((_, i) => <Cell key={i} fill={RACA_CORES[i % RACA_CORES.length]} />)}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="painel-bairro__chart-empty">Sem dado censitário próprio para este bairro.</p>
          )}
        </div>
      </div>

      <FiltroPainel filtro={filtro} onChange={onFiltroChange} />
    </aside>
  )
}
