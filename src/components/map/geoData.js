// Geoprocessamento do mapa com dados reais: usa o contorno OFICIAL do
// município de São Vicente (malha do IBGE) e calcula as fronteiras entre
// bairros via diagrama de Voronoi a partir do centro real de cada bairro,
// recortado ao contorno municipal com interseção geométrica real (turf) -
// que lida corretamente com o litoral côncavo (baías, canais). Não há
// polígono oficial de bairro nos dados fornecidos; a linha externa
// (litoral/limite municipal) é real, as linhas internas entre bairros são
// uma aproximação cartográfica.
import { Delaunay } from 'd3-delaunay'
import * as turf from '@turf/turf'
import { bairros, unidades } from '../../data/saoVicenteData'
import municipioGeoJsonRaw from '../../data/geo/municipio-sao-vicente.geojson?raw'

const municipioRing = JSON.parse(municipioGeoJsonRaw).features[0].geometry.coordinates[0]

export const municipioFeature = turf.polygon([municipioRing], { id: 'municipio' })

const [minLon, minLat, maxLon, maxLat] = turf.bbox(municipioFeature)
const COS_LAT = Math.cos(((minLat + maxLat) / 2 * Math.PI) / 180)

// Espaço planar localmente corrigido (equirretangular) só para calcular o
// Voronoi de forma proporcionalmente justa; tudo volta para lon/lat real
// (GeoJSON) antes de sair deste módulo.
const toPlanar = ([lon, lat]) => [lon * COS_LAT, lat]
const toLonLat = ([x, lat]) => [x / COS_LAT, lat]

const bairroPontosPlanar = bairros.map((b) => toPlanar([b.lon, b.lat]))

const margem = 0.3
const larguraPlanar = (maxLon - minLon) * COS_LAT
const alturaPlanar = maxLat - minLat
const delaunay = Delaunay.from(bairroPontosPlanar)
const voronoi = delaunay.voronoi([
  minLon * COS_LAT - larguraPlanar * margem,
  minLat - alturaPlanar * margem,
  maxLon * COS_LAT + larguraPlanar * margem,
  maxLat + alturaPlanar * margem,
])

function celulaParaPoligonoTurf(cellPlanar) {
  const anelLonLat = cellPlanar.map(toLonLat)
  anelLonLat.push(anelLonLat[0])
  return turf.polygon([anelLonLat])
}

export const bairroGeo = {}

bairros.forEach((b, i) => {
  const cellPlanar = voronoi.cellPolygon(i)
  let feature = null
  if (cellPlanar) {
    try {
      const celulaPoly = celulaParaPoligonoTurf(cellPlanar)
      feature = turf.intersect(turf.featureCollection([celulaPoly, municipioFeature]))
    } catch {
      feature = null
    }
  }
  if (!feature) {
    // Sem interseção válida (bairro isolado/erro numérico): usa um círculo
    // pequeno ao redor do centro real como fallback visível.
    feature = turf.circle([b.lon, b.lat], 0.15, { steps: 24, units: 'kilometers' })
  }
  feature.properties = { id: b.id, nome: b.nome }
  const area = turf.area(feature)
  const ponto = turf.pointOnFeature(feature).geometry.coordinates
  const bbox = turf.bbox(feature)
  bairroGeo[b.id] = {
    feature,
    area,
    centro: [ponto[1], ponto[0]], // [lat, lon] para Leaflet
    bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]], // [[south,west],[north,east]]
  }
})

export const bairroFeatureCollection = turf.featureCollection(
  bairros.map((b) => bairroGeo[b.id].feature)
)

export const municipioBounds = (() => {
  const bbox = turf.bbox(municipioFeature)
  return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]]
})()

export function unidadeLatLon(u) {
  return [u.lat, u.lon]
}

// Máscara "spotlight": tudo fora do bairro selecionado, para dar foco visual
// quando o usuário der zoom em um bairro.
export function maskForaDoBairro(bairroId) {
  const alvo = bairroGeo[bairroId]?.feature
  if (!alvo) return null
  const [minLonB, minLatB, maxLonB, maxLatB] = turf.bbox(municipioFeature)
  const folga = 2
  const retanguloGrande = turf.polygon([[
    [minLonB - folga, minLatB - folga],
    [maxLonB + folga, minLatB - folga],
    [maxLonB + folga, maxLatB + folga],
    [minLonB - folga, maxLatB + folga],
    [minLonB - folga, minLatB - folga],
  ]])
  try {
    return turf.difference(turf.featureCollection([retanguloGrande, alvo]))
  } catch {
    return null
  }
}

export const AREA_MEDIA = Object.values(bairroGeo).reduce((s, g) => s + g.area, 0) / bairros.length
