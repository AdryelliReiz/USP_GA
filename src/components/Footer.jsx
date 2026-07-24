import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__brand-mark" aria-hidden="true" />
          <div className="footer__brand-text">
            <span className="footer__brand-name">
              CoopClima <strong>São Vicente</strong>
            </span>
            <span>© {new Date().getFullYear()} · Protótipo acadêmico — dados reais (CNES 2019 / IBGE 2022).</span>
          </div>
        </div>

        <div className="footer__meta">
          <span>Feito com dados públicos abertos e cooperação comunitária.</span>
          <a
            className="footer__social"
            href="https://www.instagram.com/coop.clima/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CoopClima no Instagram"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" />
            </svg>
            <span>@coop.clima</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
