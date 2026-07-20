import './Transparencia.css'

const ARQUIVOS = [
  {
    nome: 'Unidades de saúde — base completa',
    descricao: '427 unidades do CNES 2019: tipo, endereço, coordenadas e risco ambiental.',
    arquivo: 'unidades-saude-sao-vicente.csv',
    tamanho: '81 KB',
  },
  {
    nome: 'Bairros e indicadores de risco',
    descricao: '31 bairros: população por raça (Censo IBGE 2022), unidades de saúde e riscos.',
    arquivo: 'bairros-sao-vicente.csv',
    tamanho: '3 KB',
  },
]

export default function Transparencia() {
  return (
    <section id="transparencia" className="section transparencia">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Transparência</span>
          <h2 className="section-title">Dados abertos para a comunidade</h2>
          <p className="section-subtitle">
            As bases usadas em todo este painel — geradas a partir do Cadastro Nacional de
            Estabelecimentos de Saúde (CNES 2019) e do Censo Demográfico do IBGE (2022) — estão
            disponíveis abaixo para consulta, auditoria e reuso por pesquisadores, gestores
            públicos e moradores.
          </p>
        </div>

        <div className="transparencia__grid">
          {ARQUIVOS.map((a) => (
            <div className="transparencia__item card" key={a.arquivo}>
              <div className="transparencia__icon" data-formato="CSV" aria-hidden="true">CSV</div>
              <div className="transparencia__info">
                <strong>{a.nome}</strong>
                <span>{a.descricao}</span>
                <span className="transparencia__meta">CSV · {a.tamanho}</span>
              </div>
              <a className="btn btn--outline" href={`/downloads/${a.arquivo}`} download>
                Baixar
              </a>
            </div>
          ))}
        </div>

        <p className="transparencia__footnote">
          Arquivos gerados diretamente a partir da mesma base de dados usada nos gráficos e no
          mapa deste painel (pasta <code>src/planilhas</code>), em formato CSV separado por
          ponto e vírgula (compatível com Excel/Google Sheets).
        </p>
      </div>
    </section>
  )
}
