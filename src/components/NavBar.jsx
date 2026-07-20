import { useEffect, useState } from 'react'
import './NavBar.css'

const LINKS = [
  { href: '#visao-geral', label: 'Visão geral' },
  { href: '#mapa', label: 'Mapa interativo' },
  { href: '#insights', label: 'Gráficos & insights' },
  { href: '#transparencia', label: 'Transparência' },
  { href: '#missao', label: 'Nossa missão' },
]

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a href="#top" className="navbar__brand">
          <span className="navbar__brand-mark" aria-hidden="true" />
          <span>
            CoopClima <strong>São Vicente</strong>
          </span>
        </a>

        <nav className="navbar__links" aria-label="Navegação principal">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <button
          className="navbar__toggle"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <nav className="navbar__mobile" aria-label="Navegação mobile">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
      )}
    </header>
  )
}
