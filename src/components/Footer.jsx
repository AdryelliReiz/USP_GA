import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© {new Date().getFullYear()} CoopClima São Vicente. Protótipo acadêmico — dados reais (CNES 2019 / IBGE 2022).</span>
        <span>Feito com dados públicos abertos e cooperação comunitária.</span>
      </div>
    </footer>
  )
}
