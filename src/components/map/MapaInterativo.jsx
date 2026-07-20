import { useState } from 'react'
import { getBairro } from '../../data/derived.js'
import SaoVicenteMap from './SaoVicenteMap.jsx'
import MapLegend from './MapLegend.jsx'
import PainelBairro from './PainelBairro.jsx'
import PinPopup from './PinPopup.jsx'
import './MapaInterativo.css'

export default function MapaInterativo() {
  const [selectedBairroId, setSelectedBairroId] = useState(null)
  const [hoveredBairroId, setHoveredBairroId] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [selectedUnidade, setSelectedUnidade] = useState(null)

  const bairroSelecionado = selectedBairroId ? getBairro(selectedBairroId) : null

  function handleSelectBairro(id) {
    setSelectedBairroId(id)
    setSelectedUnidade(null)
    setFiltro('todas')
  }

  return (
    <section id="mapa" className="section mapa-interativo">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Mapa interativo</span>
          <h2 className="section-title">Bairros de São Vicente e suas unidades de saúde</h2>
          <p className="section-subtitle">
            Clique em um bairro para dar zoom e visualizar as unidades de saúde daquela
            região. Bairros em <strong>zona crítica</strong> enfrentam risco simultâneo de
            inundação e deslizamento.
          </p>
        </div>

        <div className="mapa-interativo__grid">
          <div className="mapa-interativo__map-col">
            <div className="mapa-interativo__map-wrap">
              <SaoVicenteMap
                selectedBairroId={selectedBairroId}
                onSelectBairro={handleSelectBairro}
                hoveredBairroId={hoveredBairroId}
                onHoverBairro={setHoveredBairroId}
                filtro={filtro}
                onSelectUnidade={setSelectedUnidade}
              />
              {selectedBairroId && (
                <button className="mapa-interativo__reset" onClick={() => handleSelectBairro(null)}>
                  ← Ver mapa completo
                </button>
              )}
              {selectedUnidade && (
                <PinPopup unidade={selectedUnidade} onClose={() => setSelectedUnidade(null)} />
              )}
            </div>
            <MapLegend />
            <p className="mapa-interativo__note">
              Mapa renderizado com Leaflet a partir do contorno oficial do município (malha do
              IBGE) e das coordenadas reais das unidades de saúde (CNES 2019) — sem tiles de
              rua ou cidades vizinhas, apenas o litoral e o limite administrativo real de São
              Vicente. As fronteiras entre bairros são um diagrama de Voronoi a partir do
              centro real de cada bairro, recortado ao contorno oficial — uma aproximação
              cartográfica, já que não há polígono oficial de bairro nos dados disponíveis.
            </p>
          </div>

          <PainelBairro
            bairro={bairroSelecionado}
            filtro={filtro}
            onFiltroChange={setFiltro}
          />
        </div>
      </div>
    </section>
  )
}
