// Seletores derivados a partir dos dados reais (bairros / unidades), gerados
// por scripts/build-data.mjs a partir do CNES 2019 e do Censo IBGE 2022.
// Mantém a camada de dados "crua" separada da lógica de agregação usada pelas telas.

import { bairros, unidades } from './saoVicenteData'

const bairroPorId = Object.fromEntries(bairros.map((b) => [b.id, b]))

export function getBairro(id) {
  return bairroPorId[id]
}

export function unidadesDoBairro(bairroId) {
  return unidades.filter((u) => u.bairroId === bairroId)
}

// Bairros em "zona crítica": risco de inundação E de deslizamento simultâneos
// (ambos aferidos a partir de coordenadas reais de unidades de saúde).
export const bairrosCriticos = bairros
  .filter((b) => b.riscoInundacao === true && b.riscoDeslizamento === true)
  .map((b) => b.id)

export const totalUnidades = unidades.length

export const unidadesAvaliadas = unidades.filter((u) => !u.semAvaliacaoRisco)

export const unidadesEmRisco = unidades.filter((u) => u.riscos.length > 0)

export const totalUnidadesEmRisco = unidadesEmRisco.length

export function gravidadeMajoritaria() {
  const contagem = { Alto: 0, Médio: 0, Baixo: 0 }
  unidadesEmRisco.forEach((u) => { contagem[u.nivelRisco] = (contagem[u.nivelRisco] || 0) + 1 })
  return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0]
}

export const totalPopulacao = bairros.reduce((acc, b) => acc + (b.populacao || 0), 0)

export const populacaoEmRisco = bairros
  .filter((b) => bairrosCriticos.includes(b.id))
  .reduce((acc, b) => acc + (b.populacao || 0), 0)

export const razaoPopulacaoUnidade = Math.round(totalPopulacao / totalUnidades)

export function perfilPopulacaoMaisAfetada() {
  const criticos = bairros.filter((b) => bairrosCriticos.includes(b.id) && b.populacaoCor)
  const acc = { branca: 0, negra: 0, amarela: 0, indigena: 0 }
  criticos.forEach((b) => {
    Object.keys(acc).forEach((k) => { acc[k] += b.populacaoCor[k] })
  })
  const somaPop = Object.values(acc).reduce((s, v) => s + v, 0)
  return Object.fromEntries(
    Object.entries(acc).map(([k, v]) => [k, somaPop ? Math.round((v / somaPop) * 100) : 0])
  )
}

// Percentual de risco individual estimado a partir de sinais reais: classe
// de suscetibilidade a inundação (IPT/CPRM) e proximidade a ponto mapeado
// de deslizamento (quanto mais perto, maior o peso).
export function percentualRiscoUnidade(u) {
  if (u.semAvaliacaoRisco) return null
  const baseClasse = { Alta: 70, Média: 45, Baixa: 15 }[u.classeSuscetibilidade]
    ?? (u.riscos.includes('Inundação') ? 45 : 5)
  const bonusDeslizamento = u.riscos.includes('Deslizamento')
    ? Math.max(15, 35 - (u.distanciaDeslizamento ?? 300) / 15)
    : 0
  return Math.min(98, Math.round(baseClasse + bonusDeslizamento))
}

export function topUnidadesMaiorRisco(n = 3) {
  return unidadesAvaliadas
    .map((u) => ({ ...u, percentual: percentualRiscoUnidade(u) }))
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, n)
}

export function topUnidadesMenorRisco(n = 3) {
  return unidadesAvaliadas
    .map((u) => ({ ...u, percentual: percentualRiscoUnidade(u) }))
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, n)
}

export function top5BairrosRiscoAmbiental() {
  return bairros
    .map((b) => {
      const unidadesBairro = unidadesDoBairro(b.id)
      const inundacao = unidadesBairro.filter((u) => u.riscos.includes('Inundação')).length
      const deslizamento = unidadesBairro.filter((u) => u.riscos.includes('Deslizamento')).length
      return { bairro: b.nome, bairroId: b.id, inundacao, deslizamento, total: inundacao + deslizamento }
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

export function perfilRacialTop5Risco() {
  const top5 = top5BairrosRiscoAmbiental()
  return top5
    .map(({ bairroId, bairro }) => getBairro(bairroId))
    .filter((b) => b && b.populacaoCor)
    .map((b) => {
      const total = Object.values(b.populacaoCor).reduce((s, v) => s + v, 0)
      const percentuais = Object.fromEntries(
        Object.entries(b.populacaoCor).map(([k, v]) => [k, total ? Math.round((v / total) * 100) : 0])
      )
      const predominante = Object.entries(percentuais).sort((a, b2) => b2[1] - a[1])[0]
      return { bairro: b.nome, ...percentuais, predominante: predominante[0] }
    })
}

export function top5UnidadesMaiorPercentualRisco(n = 5) {
  return unidadesAvaliadas
    .map((u) => ({ ...u, percentual: percentualRiscoUnidade(u) }))
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, n)
}

// Bairros com população mas ZERO unidades de saúde entram no topo (razão
// "infinita") - achado real e relevante de sobrecarga/ausência de cobertura.
export function top5BairrosRazaoPopUnidade(n = 5) {
  return bairros
    .filter((b) => b.populacao)
    .map((b) => ({
      bairro: b.nome,
      bairroId: b.id,
      populacao: b.populacao,
      qtdUnidades: b.qtdUnidades,
      razao: b.qtdUnidades > 0 ? Math.round(b.populacao / b.qtdUnidades) : Infinity,
    }))
    .sort((a, b) => b.razao - a.razao)
    .slice(0, n)
}

export function problemaAmbientalPrevalenteEssenciais() {
  const bairrosBaixoVolume = bairros.filter((b) => b.qtdUnidades > 0 && b.qtdUnidades <= 3).map((b) => b.id)
  const essenciais = unidades.filter(
    (u) => bairrosBaixoVolume.includes(u.bairroId) && (u.tipo === 'UBS' || u.tipo.startsWith('Hospital'))
  )
  const contagem = { Inundação: 0, Deslizamento: 0, 'Sem risco': 0 }
  essenciais.forEach((u) => {
    if (u.semAvaliacaoRisco || u.riscos.length === 0) contagem['Sem risco'] += 1
    else u.riscos.forEach((r) => { contagem[r] += 1 })
  })
  return Object.entries(contagem)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
}

// Agrupa cauda longa de categorias em "Outros tipos" para manter os
// gráficos de pizza legíveis (o dataset real tem 22 tipos de estabelecimento).
function agruparTopN(contagem, n) {
  const ordenado = Object.entries(contagem).sort((a, b) => b[1] - a[1])
  const top = ordenado.slice(0, n)
  const resto = ordenado.slice(n).reduce((s, [, v]) => s + v, 0)
  const arr = top.map(([name, value]) => ({ name, value }))
  if (resto > 0) arr.push({ name: 'Outros tipos', value: resto })
  return arr
}

export function distribuicaoTiposUnidade(topN = 7) {
  const contagem = {}
  unidades.forEach((u) => { contagem[u.tipo] = (contagem[u.tipo] || 0) + 1 })
  return agruparTopN(contagem, topN)
}

export function tiposEmRiscoNoBairro(bairroId, topN = 5) {
  const unidadesRisco = unidadesDoBairro(bairroId).filter((u) => u.riscos.length > 0)
  const contagem = {}
  unidadesRisco.forEach((u) => { contagem[u.tipo] = (contagem[u.tipo] || 0) + 1 })
  const arr = agruparTopN(contagem, topN)
  return arr.length ? arr : [{ name: 'Nenhuma em risco', value: 1 }]
}
