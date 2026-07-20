import './NossaMissao.css'

const equipe = [
  { nome: 'Adryelli Reis dos Santos', papel: '---' },
  { nome: 'Ana Alice Padovan', papel: '---' },
  { nome: 'André Miyazawa', papel: '---' },
  { nome: 'Catarina Macedo Scabelli', papel: '---' },
  { nome: 'Geovanny Luan Piedade', papel: '---' },
  { nome: 'Isadora de Oliveira Caetano', papel: '---' },
  { nome: 'Sara Leticia Santos Silva', papel: '---' },
]

export default function NossaMissao() {
  return (
    <section id="missao" className="section nossa-missao">
      <div className="container">
        <div className="nossa-missao__content">
          <span className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>Nossa missão</span>
          <h2 className="section-title nossa-missao__title">
            Cooperação, dados e justiça climática para São Vicente
          </h2>
          <p className="nossa-missao__text">
            A CoopClima São Vicente nasceu do compromisso de somar ferramentas de dados ao
            saber comunitário para tornar visíveis as áreas mais vulneráveis do município às
            mudanças climáticas. Ao cruzar risco ambiental, cobertura de saúde e perfil
            populacional, buscamos apoiar decisões públicas mais justas e participativas —
            ouvindo antes de falar, e colocando ferramentas e ciência a serviço de quem mais
            sofre com inundações e deslizamentos no dia a dia.
          </p>
        </div>

        <div className="nossa-missao__team">
          <h3>Integrantes do grupo</h3>
          <ul className="nossa-missao__team-list">
            {equipe.map((m) => (
              <li key={m.nome}>
                <span className="nossa-missao__avatar" aria-hidden="true">
                  {m.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <strong>{m.nome}</strong>
                  <span>{m.papel}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
