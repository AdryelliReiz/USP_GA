import './Hero.css'

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__texture" aria-hidden="true" />
      <div className="container hero__inner">
        <span className="hero__badge">Painel de resiliência climática &amp; saúde</span>
        <h1 className="hero__title">
          Monitorando a saúde de São Vicente
          <br />
          frente às mudanças do clima
        </h1>
        <p className="hero__subtitle">
          A CoopClima São Vicente reúne dados sobre unidades de saúde, riscos ambientais
          (inundação e deslizamento) e perfil populacional dos bairros do município, para
          apoiar decisões que fortaleçam a resiliência da rede de saúde pública.
        </p>
        <p className="hero__disclaimer">
          Protótipo construído com dados reais e públicos: Cadastro Nacional de
          Estabelecimentos de Saúde (CNES 2019) e Censo Demográfico do IBGE (2022). Algumas
          agregações (bordas de bairro, índices de risco individual) são aproximações
          analíticas do grupo, não números oficiais da Prefeitura de São Vicente.
        </p>
        <div className="hero__actions">
          <a href="#visao-geral" className="btn btn--primary">Ver visão geral</a>
          <a href="#mapa" className="btn btn--outline">Explorar o mapa</a>
        </div>
      </div>
    </section>
  )
}
