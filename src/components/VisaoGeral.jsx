import {
  totalUnidades,
  totalUnidadesEmRisco,
  gravidadeMajoritaria,
  populacaoEmRisco,
  razaoPopulacaoUnidade,
  perfilPopulacaoMaisAfetada,
  topUnidadesMaiorRisco,
  topUnidadesMenorRisco,
} from '../data/derived.js'
import { bairros, unidades } from '../data/saoVicenteData.js'
import RiskBadge from './ui/RiskBadge.jsx'
import './VisaoGeral.css'

function formataMil(n) {
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`
}

function nomeBairro(id) {
  return bairros.find((b) => b.id === id)?.nome ?? id
}

export default function VisaoGeral() {
  const gravidade = gravidadeMajoritaria()
  const perfil = perfilPopulacaoMaisAfetada()
  const grupoPredominante = Object.entries(perfil).sort((a, b) => b[1] - a[1])[0]
  const nomesGrupo = { branca: 'branca', negra: 'negra (preta + parda)', amarela: 'amarela', indigena: 'indígena' }

  const maiorRisco = topUnidadesMaiorRisco(3)
  const menorRisco = topUnidadesMenorRisco(3)

  return (
    <section id="visao-geral" className="section visao-geral">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Visão geral</span>
          <h2 className="section-title">O cenário municipal em números</h2>
          <p className="section-subtitle">
            Resumo consolidado das unidades de saúde de São Vicente, dos bairros em maior
            exposição a riscos ambientais e do perfil da população mais impactada.
          </p>
        </div>

        <div className="vg-grid">
          <article className="card vg-stat">
            <span className="vg-stat__label">Total de unidades de saúde</span>
            <strong className="vg-stat__value">{totalUnidades}</strong>
            <span className="vg-stat__hint">em {bairros.length} bairros mapeados no município</span>
          </article>

          <article className="card vg-stat">
            <span className="vg-stat__label">Unidades em área de risco</span>
            <strong className="vg-stat__value">{totalUnidadesEmRisco}</strong>
            <span className="vg-stat__hint">
              gravidade majoritária: <RiskBadge level={gravidade} />
            </span>
          </article>

          <article className="card vg-stat vg-stat--highlight">
            <span className="vg-stat__label">População em risco</span>
            <strong className="vg-stat__value">{formataMil(populacaoEmRisco)}</strong>
            <span className="vg-stat__hint">pessoas impactadas (estimativa dos bairros em zona crítica)</span>
          </article>

          <article className="card vg-stat">
            <span className="vg-stat__label">Relação população / unidade</span>
            <strong className="vg-stat__value">{razaoPopulacaoUnidade.toLocaleString('pt-BR')}</strong>
            <span className="vg-stat__hint">habitantes atendidos, em média, por unidade física</span>
          </article>
        </div>

        <div className="vg-profile card">
          <div className="vg-profile__icon" aria-hidden="true">◆</div>
          <div>
            <h3 className="vg-profile__title">Perfil da população mais afetada</h3>
            <p className="vg-profile__text">
              Nos bairros em zona crítica — que enfrentam risco simultâneo de inundação e
              deslizamento — a população se concentra majoritariamente no grupo{' '}
              <strong>{nomesGrupo[grupoPredominante[0]]}</strong> ({grupoPredominante[1]}%),
              reforçando o recorte de vulnerabilidade social somado à exposição ambiental.
            </p>
          </div>
        </div>

        <div className="vg-rankings">
          <article className="card vg-ranking">
            <header className="vg-ranking__header">
              <h3>Maior risco ambiental</h3>
              <span>Top 3 unidades de saúde</span>
            </header>

            <div className="vg-ranking__main">
              <div className="vg-ranking__rank vg-ranking__rank--1">#1</div>
              <div>
                <p className="vg-ranking__name">{maiorRisco[0].nome}</p>
                <p className="vg-ranking__meta">{nomeBairro(maiorRisco[0].bairroId)} · {maiorRisco[0].riscos.join(' + ') || 'Sem risco'}</p>
              </div>
              <RiskBadge level={maiorRisco[0].nivelRisco} />
            </div>

            <ul className="vg-ranking__list">
              {maiorRisco.slice(1).map((u, i) => (
                <li key={u.id}>
                  <span className="vg-ranking__rank-sm">#{i + 2}</span>
                  <div>
                    <p className="vg-ranking__name">{u.nome}</p>
                    <p className="vg-ranking__meta">{nomeBairro(u.bairroId)} · {u.riscos.join(' + ') || 'Sem risco'}</p>
                  </div>
                  <RiskBadge level={u.nivelRisco} />
                </li>
              ))}
            </ul>
          </article>

          <article className="card vg-ranking vg-ranking--safe">
            <header className="vg-ranking__header">
              <h3>Menor risco ambiental</h3>
              <span>Top 3 unidades de saúde</span>
            </header>

            <div className="vg-ranking__main">
              <div className="vg-ranking__rank vg-ranking__rank--safe">#1</div>
              <div>
                <p className="vg-ranking__name">{menorRisco[0].nome}</p>
                <p className="vg-ranking__meta">{nomeBairro(menorRisco[0].bairroId)} · {menorRisco[0].riscos.join(' + ') || 'Sem risco identificado'}</p>
              </div>
              <RiskBadge level={menorRisco[0].nivelRisco} />
            </div>

            <ul className="vg-ranking__list">
              {menorRisco.slice(1).map((u, i) => (
                <li key={u.id}>
                  <span className="vg-ranking__rank-sm">#{i + 2}</span>
                  <div>
                    <p className="vg-ranking__name">{u.nome}</p>
                    <p className="vg-ranking__meta">{nomeBairro(u.bairroId)} · {u.riscos.join(' + ') || 'Sem risco identificado'}</p>
                  </div>
                  <RiskBadge level={u.nivelRisco} />
                </li>
              ))}
            </ul>
          </article>
        </div>

        <p className="vg-footnote">
          Ranking calculado a partir da classe de suscetibilidade a inundação e da proximidade
          a pontos de deslizamento mapeados, dentre as {unidades.length} unidades de saúde do
          Cadastro Nacional de Estabelecimentos de Saúde (CNES 2019) de São Vicente.
        </p>
      </div>
    </section>
  )
}
