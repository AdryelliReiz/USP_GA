// Exporta a base de dados já processada (src/data/saoVicenteData.js) como
// CSVs reais para download em public/downloads/. Rodar com:
//   node scripts/export-csv.mjs
// (depois de rodar scripts/build-data.mjs, se as planilhas de origem mudarem)
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { bairros, unidades } from '../src/data/saoVicenteData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../public/downloads')
mkdirSync(OUT_DIR, { recursive: true })

function csvEscape(value) {
  if (value == null) return ''
  const s = String(value)
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(rows, columns) {
  const header = columns.map((c) => c.label).join(';')
  const lines = rows.map((row) => columns.map((c) => csvEscape(c.value(row))).join(';'))
  return [header, ...lines].join('\n')
}

const bairroPorId = Object.fromEntries(bairros.map((b) => [b.id, b]))

const unidadesCsv = toCsv(unidades, [
  { label: 'id', value: (u) => u.id },
  { label: 'nome', value: (u) => u.nome },
  { label: 'bairro', value: (u) => bairroPorId[u.bairroId]?.nome ?? u.bairroId },
  { label: 'tipo', value: (u) => u.tipo },
  { label: 'endereco', value: (u) => u.endereco },
  { label: 'cep', value: (u) => u.cep },
  { label: 'latitude', value: (u) => u.lat ?? '' },
  { label: 'longitude', value: (u) => u.lon ?? '' },
  { label: 'risco_inundacao', value: (u) => (u.semAvaliacaoRisco ? 'sem_dado' : u.riscos.includes('Inundação') ? 'sim' : 'nao') },
  { label: 'risco_deslizamento', value: (u) => (u.semAvaliacaoRisco ? 'sem_dado' : u.riscos.includes('Deslizamento') ? 'sim' : 'nao') },
  { label: 'classe_suscetibilidade_inundacao', value: (u) => u.classeSuscetibilidade ?? '' },
  { label: 'distancia_deslizamento_m', value: (u) => u.distanciaDeslizamento ?? '' },
  { label: 'nivel_risco', value: (u) => u.nivelRisco ?? '' },
  { label: 'servicos', value: (u) => u.servicos },
  { label: 'horario', value: (u) => u.horario },
])

const bairrosCsv = toCsv(bairros, [
  { label: 'id', value: (b) => b.id },
  { label: 'nome', value: (b) => b.nome },
  { label: 'populacao_total', value: (b) => b.populacao ?? '' },
  { label: 'populacao_branca', value: (b) => b.populacaoCor?.branca ?? '' },
  { label: 'populacao_negra', value: (b) => b.populacaoCor?.negra ?? '' },
  { label: 'populacao_amarela', value: (b) => b.populacaoCor?.amarela ?? '' },
  { label: 'populacao_indigena', value: (b) => b.populacaoCor?.indigena ?? '' },
  { label: 'qtd_unidades_saude', value: (b) => b.qtdUnidades },
  { label: 'risco_inundacao', value: (b) => (b.riscoInundacao == null ? 'sem_dado' : b.riscoInundacao ? 'sim' : 'nao') },
  { label: 'risco_deslizamento', value: (b) => (b.riscoDeslizamento == null ? 'sem_dado' : b.riscoDeslizamento ? 'sim' : 'nao') },
  { label: 'latitude_centro', value: (b) => b.lat ?? '' },
  { label: 'longitude_centro', value: (b) => b.lon ?? '' },
])

const BOM = '﻿' // para o Excel abrir acentos corretamente
writeFileSync(path.join(OUT_DIR, 'unidades-saude-sao-vicente.csv'), BOM + unidadesCsv)
writeFileSync(path.join(OUT_DIR, 'bairros-sao-vicente.csv'), BOM + bairrosCsv)

console.log(`Exportado: ${unidades.length} unidades, ${bairros.length} bairros -> public/downloads/`)
