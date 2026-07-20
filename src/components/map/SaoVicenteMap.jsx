import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, GeoJSON, CircleMarker, Marker, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getBairro, unidadesDoBairro } from '../../data/derived.js'
import { bairros } from '../../data/saoVicenteData.js'
import { bairroGeo, bairroFeatureCollection, municipioFeature, municipioBounds, maskForaDoBairro } from './geoData.js'
import './SaoVicenteMap.css'

const FILL_BY_CATEGORIA = {
  critico: '#874a33',
  inundacao: '#00a3e0',
  deslizamento: '#e87722',
  semDados: '#b9c0c6',
  seguro: '#007a4a',
}

function riscoCategoria(bairro) {
  if (bairro.riscoInundacao === true && bairro.riscoDeslizamento === true) return 'critico'
  if (bairro.riscoInundacao === true) return 'inundacao'
  if (bairro.riscoDeslizamento === true) return 'deslizamento'
  if (bairro.riscoInundacao == null) return 'semDados'
  return 'seguro'
}

function unidadeEmRisco(u, filtro) {
  if (filtro === 'inundacao') return u.riscos.includes('Inundação')
  if (filtro === 'deslizamento') return u.riscos.includes('Deslizamento')
  return true
}

const PIN_COLOR = { Alto: '#e87722', Médio: '#c98f1f', Baixo: '#00a3e0' }

// Importância do rótulo por quantidade real de unidades (não pela área da
// célula de Voronoi, que reflete densidade geográfica e não relevância).
const MEDIA_QTD = bairros.reduce((s, b) => s + b.qtdUnidades, 0) / bairros.length
const LIMIAR_ROTULO_FIXO = 4

// Ajusta o mapa para o bairro selecionado (foco/zoom) ou para a cidade toda.
function FocoController({ selectedBairroId }) {
  const map = useMap()
  useEffect(() => {
    if (selectedBairroId && bairroGeo[selectedBairroId]) {
      map.flyToBounds(bairroGeo[selectedBairroId].bounds, {
        paddingTopLeft: [30, 30],
        paddingBottomRight: [30, 30],
        maxZoom: 17,
        duration: 0.85,
      })
    } else {
      map.flyToBounds(municipioBounds, { padding: [16, 16], duration: 0.85 })
    }
  }, [selectedBairroId, map])
  return null
}

// Escurece tudo fora do bairro selecionado, para dar destaque/foco visual.
function Spotlight({ bairroId }) {
  const mask = useMemo(() => maskForaDoBairro(bairroId), [bairroId])
  if (!mask) return null
  return <GeoJSON data={mask} style={{ fillColor: '#0b0f14', fillOpacity: 0.5, stroke: false }} interactive={false} />
}

function BairroShapes({ selectedBairroId, hoveredBairroId, onSelectBairro, onHoverBairro }) {
  const geoJsonRef = useRef(null)
  const selectedRef = useRef(selectedBairroId)
  useEffect(() => { selectedRef.current = selectedBairroId }, [selectedBairroId])

  function styleFeature(feature) {
    const b = getBairro(feature.properties.id)
    const categoria = riscoCategoria(b)
    const isSelected = feature.properties.id === selectedBairroId
    const isHovered = feature.properties.id === hoveredBairroId
    const isDimmed = Boolean(selectedBairroId) && !isSelected
    return {
      fillColor: FILL_BY_CATEGORIA[categoria],
      fillOpacity: isSelected ? 1 : isDimmed ? 0.22 : isHovered ? 0.96 : 0.86,
      color: isSelected || isHovered ? '#ffffff' : 'rgba(255,255,255,0.7)',
      weight: isSelected ? 4 : isHovered ? 3 : 1.3,
    }
  }

  useEffect(() => {
    const layer = geoJsonRef.current
    if (!layer) return
    layer.eachLayer((l) => l.setStyle(styleFeature(l.feature)))
  }, [selectedBairroId, hoveredBairroId])

  function onEachFeature(feature, layer) {
    const b = getBairro(feature.properties.id)
    layer.setStyle(styleFeature(feature))
    layer.bindTooltip(`${b.nome} — ${b.qtdUnidades} unidade${b.qtdUnidades === 1 ? '' : 's'} de saúde`, {
      sticky: true,
      className: 'svmap__tooltip',
    })
    layer.on({
      click: () => onSelectBairro(selectedRef.current === feature.properties.id ? null : feature.properties.id),
      mouseover: () => onHoverBairro(feature.properties.id),
      mouseout: () => onHoverBairro(null),
      add: (e) => {
        const el = e.target.getElement?.()
        if (el) {
          el.setAttribute('role', 'button')
          el.setAttribute('tabindex', '0')
          el.setAttribute('aria-label', `Bairro ${b.nome}, ${b.qtdUnidades} unidades de saúde`)
        }
      },
    })
  }

  return <GeoJSON ref={geoJsonRef} data={bairroFeatureCollection} style={styleFeature} onEachFeature={onEachFeature} />
}

// Rótulos persistentes (nome + qtd. de unidades). Quando nenhum bairro está
// selecionado, bairros muito pequenos não recebem rótulo fixo (ficaria
// ilegível na densa área central) - o nome aparece via tooltip ao passar o
// mouse, e o clique continua funcionando normalmente em toda a área do polígono.
function BairroLabels({ selectedBairroId, hoveredBairroId }) {
  return bairros.map((b) => {
    const geo = bairroGeo[b.id]
    if (!geo) return null
    const isSelected = b.id === selectedBairroId
    const isHovered = b.id === hoveredBairroId
    const destaque = isSelected || isHovered

    if (selectedBairroId && !isSelected) return null

    const sizeFactor = Math.min(1.5, Math.max(0.7, Math.sqrt((b.qtdUnidades + 1) / (MEDIA_QTD + 1))))
    if (!destaque && b.qtdUnidades < LIMIAR_ROTULO_FIXO) return null
    const mostrarSub = destaque || sizeFactor >= 0.95

    const html = `
      <div class="svmap-label${destaque ? ' is-destaque' : ''}" style="font-size:${(destaque ? 16 : 12 * sizeFactor).toFixed(1)}px">
        <span class="svmap-label__nome">${b.nome}</span>
        ${mostrarSub ? `<span class="svmap-label__sub" style="font-size:${(destaque ? 12 : 9.5 * sizeFactor).toFixed(1)}px">${b.qtdUnidades} unidade${b.qtdUnidades === 1 ? '' : 's'}</span>` : ''}
      </div>
    `
    const icon = L.divIcon({ className: 'svmap-label-icon', html, iconSize: null })
    return <Marker key={b.id} position={geo.centro} icon={icon} interactive={false} zIndexOffset={destaque ? 1000 : 0} />
  })
}

function Pins({ selectedBairroId, filtro, onSelectUnidade }) {
  const pins = useMemo(() => {
    if (!selectedBairroId) return []
    return unidadesDoBairro(selectedBairroId)
      .filter((u) => u.lat != null)
      .filter((u) => unidadeEmRisco(u, filtro))
  }, [selectedBairroId, filtro])

  return pins.map((p) => (
    <div key={p.id}>
      {p.nivelRisco === 'Alto' && (
        <CircleMarker
          center={[p.lat, p.lon]}
          radius={13}
          pathOptions={{ className: 'svmap__pin-pulse', fillColor: '#e87722', fillOpacity: 0.35, stroke: false }}
          interactive={false}
        />
      )}
      <CircleMarker
        center={[p.lat, p.lon]}
        radius={7}
        pathOptions={{ className: 'svmap__pin', fillColor: PIN_COLOR[p.nivelRisco] || '#9aa3ab', fillOpacity: 1, color: '#fff', weight: 2.2 }}
        eventHandlers={{ click: (e) => { e.originalEvent?.stopPropagation(); onSelectUnidade(p) } }}
      />
    </div>
  ))
}

export default function SaoVicenteMap({ selectedBairroId, onSelectBairro, filtro, onSelectUnidade, hoveredBairroId, onHoverBairro }) {
  return (
    <div className="svmap">
      <MapContainer
        bounds={municipioBounds}
        boundsOptions={{ padding: [16, 16] }}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
        className="svmap__leaflet"
        style={{ background: '#eaf3f6' }}
      >
        <ZoomControl position="topright" />
        <FocoController selectedBairroId={selectedBairroId} />
        <GeoJSON
          data={municipioFeature}
          style={{ fillColor: '#d7ece6', fillOpacity: 0.55, color: 'var(--cc-dark)', weight: 2, opacity: 0.5 }}
          interactive={false}
        />
        <BairroShapes
          selectedBairroId={selectedBairroId}
          hoveredBairroId={hoveredBairroId}
          onSelectBairro={onSelectBairro}
          onHoverBairro={onHoverBairro}
        />
        {selectedBairroId && <Spotlight bairroId={selectedBairroId} />}
        <BairroLabels selectedBairroId={selectedBairroId} hoveredBairroId={hoveredBairroId} />
        <Pins selectedBairroId={selectedBairroId} filtro={filtro} onSelectUnidade={onSelectUnidade} />
      </MapContainer>
    </div>
  )
}
