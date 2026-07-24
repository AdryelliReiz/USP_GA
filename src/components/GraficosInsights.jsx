import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  top5BairrosRiscoAmbiental,
  perfilRacialTop5Risco,
  top5UnidadesMaiorPercentualRisco,
  top5BairrosRazaoPopUnidade,
  problemaAmbientalPrevalenteEssenciais,
  distribuicaoTiposUnidade,
  totalUnidades,
} from '../data/derived.js'
import { bairros } from '../data/saoVicenteData.js'
import RiskBadge from './ui/RiskBadge.jsx'
import './GraficosInsights.css'

const RACA_LABEL = { branca: 'Branca', negra: 'Negra (preta + parda)', amarela: 'Amarela', indigena: 'Indígena' }
const RACA_CORES = { branca: '#00a3e0', negra: '#874a33', amarela: '#e87722', indigena: '#1a1e2c' }
const TIPO_CORES = ['#e87722', '#874a33', '#00a3e0', '#007a4a', '#c98f1f', '#1a1e2c', '#4a90a4', '#9aa3ab']
const PROBLEMA_CORES = { Inundação: '#00a3e0', Deslizamento: '#e87722', 'Sem risco': '#007a4a' }

function InsightCard({ eyebrow, title, desc, children, className = '' }) {
  return (
    <article className={`insight-card card ${className}`}>
      <span className="insight-card__eyebrow">{eyebrow}</span>
      <h3 className="insight-card__title">{title}</h3>
      <p className="insight-card__desc">{desc}</p>
      <div className="insight-card__body">{children}</div>
    </article>
  )
}

export default function GraficosInsights() {
  const dadosRisco = top5BairrosRiscoAmbiental()
  const dadosRacial = perfilRacialTop5Risco()
  const topUnidadesRisco = top5UnidadesMaiorPercentualRisco()
  const topRazao = top5BairrosRazaoPopUnidade()
  const problemaEssenciais = problemaAmbientalPrevalenteEssenciais()
  const tiposGeral = distribuicaoTiposUnidade()

  return (
    <section id="insights" className="section graficos-insights">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Gráficos &amp; insights</span>
          <h2 className="section-title">Análises complementares</h2>
          <p className="section-subtitle">
            Recortes analíticos que aprofundam o cenário apresentado na visão geral e no
            mapa, cruzando exposição ambiental, perfil demográfico e cobertura de saúde.
          </p>
        </div>

        <div className="insight-grid">
          <InsightCard
            eyebrow="1 · Barras agrupadas"
            title="Top 5 bairros com maior risco ambiental"
            desc="Quantidade de unidades de saúde em risco de inundação comparada às em risco de deslizamento, por bairro."
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosRisco} margin={{ left: -14 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,30,44,0.08)" />
                <XAxis dataKey="bairro" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="inundacao" name="Unidades em risco de inundação" fill="#00a3e0" radius={[6, 6, 0, 0]} />
                <Bar dataKey="deslizamento" name="Unidades em risco de deslizamento" fill="#e87722" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </InsightCard>

          <InsightCard
            eyebrow="2 · Barras demográficas"
            title="Perfil racial predominante"
            desc="Percentual do grupo racial predominante em cada um dos 5 bairros com maior risco ambiental combinado."
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosRacial.map((d) => ({ bairro: d.bairro, percentual: d[d.predominante], grupo: RACA_LABEL[d.predominante], cor: RACA_CORES[d.predominante] }))} margin={{ left: -14 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,30,44,0.08)" />
                <XAxis dataKey="bairro" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, n, p) => [`${v}%`, `Grupo ${p.payload.grupo}`]} />
                <Bar dataKey="percentual" radius={[6, 6, 0, 0]}>
                  {dadosRacial.map((d, i) => <Cell key={i} fill={RACA_CORES[d.predominante]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="insight-card__footnote">Cor da barra indica o grupo racial predominante em cada bairro (ver legenda de cores no gráfico 5).</p>
          </InsightCard>

          <InsightCard
            eyebrow="3 · Tabela"
            title="Top 5 unidades com maior % de risco individual"
            desc="Unidades de saúde com o maior percentual estimado de exposição a riscos ambientais, considerando tipo e quantidade de riscos."
          >
            <div className="table-scroll">
              <table className="insight-table">
                <thead>
                  <tr><th>Unidade</th><th>Bairro</th><th>% risco</th></tr>
                </thead>
                <tbody>
                  {topUnidadesRisco.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nome}</td>
                      <td>{bairros.find((b) => b.id === u.bairroId)?.nome}</td>
                      <td><RiskBadge level={u.nivelRisco} /> <strong>{u.percentual}%</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InsightCard>

          <InsightCard
            eyebrow="4 · Tabela"
            title="Top 5 bairros com maior sobrecarga"
            desc="Bairros com a maior razão população / unidades de saúde — alta demanda combinada a poucas unidades disponíveis."
          >
            <div className="table-scroll">
            <table className="insight-table">
              <thead>
                <tr><th>Bairro</th><th>População</th><th>Unidades</th><th>Pessoas/unidade</th></tr>
              </thead>
              <tbody>
                {topRazao.map((b) => (
                  <tr key={b.bairroId}>
                    <td>{b.bairro}</td>
                    <td>{b.populacao.toLocaleString('pt-BR')}</td>
                    <td>{b.qtdUnidades}</td>
                    <td>
                      {Number.isFinite(b.razao)
                        ? <strong>{b.razao.toLocaleString('pt-BR')}</strong>
                        : <span className="badge badge--critico">Nenhuma unidade</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </InsightCard>

          <InsightCard
            eyebrow="5 · Setores"
            title="Problema ambiental mais prevalente"
            desc="Entre Hospitais e UBS localizados em bairros de baixo volume de atendimento (até 3 unidades), qual risco ambiental predomina."
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={problemaEssenciais} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {problemaEssenciais.map((d, i) => <Cell key={i} fill={PROBLEMA_CORES[d.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </InsightCard>

          <InsightCard
            eyebrow="6 · Setores gerais"
            title="Tipos de unidades de saúde em São Vicente"
            desc={`Proporção de cada tipo de unidade de saúde no total de ${totalUnidades} unidades cadastradas no CNES para o município.`}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={tiposGeral} dataKey="value" nameKey="name" cx="50%" cy="42%" outerRadius={80} label={({ value }) => value}>
                  {tiposGeral.map((_, i) => <Cell key={i} fill={TIPO_CORES[i % TIPO_CORES.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="insight-card__footnote">Total geral: {totalUnidades} unidades cadastradas.</p>
          </InsightCard>
        </div>
      </div>
    </section>
  )
}
