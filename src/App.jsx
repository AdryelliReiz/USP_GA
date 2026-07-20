import NavBar from './components/NavBar.jsx'
import Hero from './components/Hero.jsx'
import VisaoGeral from './components/VisaoGeral.jsx'
import MapaInterativo from './components/map/MapaInterativo.jsx'
import GraficosInsights from './components/GraficosInsights.jsx'
import Transparencia from './components/Transparencia.jsx'
import NossaMissao from './components/NossaMissao.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <VisaoGeral />
        <MapaInterativo />
        <GraficosInsights />
        <Transparencia />
        <NossaMissao />
      </main>
      <Footer />
    </>
  )
}
