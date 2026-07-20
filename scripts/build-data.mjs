// ETL único: lê as planilhas reais em src/planilhas/ e gera src/data/saoVicenteData.js
// Rodar com: node scripts/build-data.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PLAN = path.join(ROOT, 'src/planilhas')

function readCsv(name) {
  const raw = readFileSync(path.join(PLAN, name), 'utf-8')
  return parse(raw, { columns: true, skip_empty_lines: false, relax_column_count: true, bom: true })
}

// ---------------------------------------------------------------------------
// 1) Mapeamento oficial CNES (tp_unidade) -> tipo legível
// ---------------------------------------------------------------------------
const TIPO_POR_CODIGO = {
  1: 'Posto de Saúde',
  2: 'UBS',
  4: 'Policlínica',
  5: 'Hospital Geral',
  7: 'Hospital Especializado',
  20: 'Pronto Socorro',
  22: 'Consultório Isolado',
  36: 'Clínica Especializada',
  39: 'Apoio Diagnóstico e Terapia',
  40: 'Unidade Móvel Terrestre',
  42: 'Unidade Móvel de Urgência',
  43: 'Farmácia',
  50: 'Vigilância em Saúde',
  62: 'Hospital-Dia',
  68: 'Secretaria de Saúde',
  70: 'CAPS',
  73: 'Pronto Atendimento',
  74: 'Polo Academia da Saúde',
  76: 'Central de Regulação de Urgências',
  81: 'Central de Regulação do Acesso',
  84: 'Central de Abastecimento Farmacêutico',
  85: 'Centro de Imunização',
}

const TURNO_POR_DESCRICAO = {
  'ATENDIMENTOS NOS TURNOS DA MANHA E A TARDE': 'Manhã e tarde',
  'ATENDIMENTO CONTINUO DE 24 HORAS/DIA (PLANTAO:INCLUI SABADOS, DOMINGOS E FERIADOS)': '24 horas (plantão)',
  'ATENDIMENTO NOS TURNOS DA MANHA, TARDE E NOITE': 'Manhã, tarde e noite',
  'ATENDIMENTO SOMENTE A TARDE': 'Somente à tarde',
  'ATENDIMENTO SOMENTE PELA MANHA': 'Somente pela manhã',
  'ATENDIMENTO COM TURNOS INTERMITENTES': 'Turnos intermitentes',
}

const FALLBACK_SERVICO_POR_CODIGO = {
  22: 'Atendimento em consultório especializado',
  43: 'Dispensação de medicamentos',
  39: 'Exames de apoio diagnóstico',
  50: 'Vigilância epidemiológica e sanitária',
  68: 'Gestão e administração da rede de saúde',
  74: 'Práticas corporais e atividade física',
  84: 'Abastecimento e logística farmacêutica',
  81: 'Regulação de acesso a serviços de saúde',
  76: 'Regulação médica de urgências',
}

// ---------------------------------------------------------------------------
// 2) Canonicalização de nomes de bairro (validada manualmente contra
//    "Top 5 bairros.csv" - soma de cada grupo bate com a coluna corrigida)
// ---------------------------------------------------------------------------
const RAW_TO_CORRIGIDO = {
  'CENTRO': 'CENTRO',
  'ITARARE': 'ITARARE',
  'VILA VALENCA': 'VILA VALENCA',
  'VL VALENCA': 'VILA VALENCA',
  'JD RIO BRANCO': 'JARDIM RIO BRANCO',
  'JARDIM RIO BRANCO': 'JARDIM RIO BRANCO',
  'VILA SAO JORGE': 'VILA SAO JORGE',
  'CIDADE NAUTICA': 'CIDADE NAUTICA',
  'VILA MARGARIDA': 'VILA MARGARIDA',
  'VILA CASCATINHA': 'VILA CASCATINHA',
  'VL CASCATINHA': 'VILA CASCATINHA',
  'SAMARITA': 'SAMARITA',
  'PARQUE SAO VICENTE': 'PARQUE SAO VICENTE',
  'JD INDEPENDENCIA': 'JARDIM INDEPENDENCIA',
  'JARDIM INDEPENDENCIA': 'JARDIM INDEPENDENCIA',
  'HUMAITA': 'HUMAITA',
  'GONZAGUINHA': 'GONZAGUINHA',
  'CATIAPOA': 'CATIAPOA',
  'VILA VOTURUA': 'VILA VOTURUA',
  'BOA VISTA': 'BOA VISTA',
  'PARQUE BITARU': 'PARQUE BITARU',
  'JOQUEI CLUBE': 'JOQUEI CLUBE',
  'JD GUASSU': 'JARDIM GUASSU',
  'JARDIM GUASSU': 'JARDIM GUASSU',
  'ESPLANADA DOS BARREI': 'ESPLANADA DOS BARREI',
  'VL NOSSA SRA DE FATI': 'VL NOSSA SRA DE FATI',
  'VILA SAO JOSE': 'VILA SAO JOSE',
  'VILA NOSSA DO AMPARO': 'VILA NOSSA DO AMPARO',
  'VILA MELO': 'VILA MELO',
  'VILA EMA': 'VILA EMA',
  'PRQ DAS BANDEIRAS': 'PARQUE DAS BANDEIRAS',
  'PQ DAS BANDEIRAS': 'PARQUE DAS BANDEIRAS',
  'PARQUE DAS BANDEIRAS': 'PARQUE DAS BANDEIRAS',
  'PQ CONTINENTAL': 'PQ CONTINENTAL',
  'PQ BITARU': 'PQ BITARU',
  'PONTE NOVA': 'PONTE NOVA',
  'POMPEBA': 'POMPEBA',
  'NAUTICA III': 'CIDADE NAUTICA III',
  'CIDADE NAUTICA III': 'CIDADE NAUTICA III',
  'JD PARAISO': 'JARDIM PARAISO',
  'JARDIM PARAISO': 'JARDIM PARAISO',
  'JD IRMA DOLORES': 'JARDIM IRMA DOLORES',
  'JARDIM IRMA DOLORES': 'JARDIM IRMA DOLORES',
  'JARDIM RIO NEGRO': 'JARDIM RIO NEGRO',
  'JAPUI': 'JAPUI',
  'CONJUNTO RESIDENCIAL': 'CONJUNTO RESIDENCIAL',
  'CJTO HUMAITA': 'CJTO HUMAITA',
  'BEIRA MAR': 'BEIRA MAR',
}

// Consolidação final: funde variantes/sub-localidades sem dado populacional
// próprio no bairro correspondente que TEM dado censitário.
const OUTROS = 'OUTRAS LOCALIDADES'
const MERGE_FINAL = {
  'CIDADE NAUTICA III': 'CIDADE NAUTICA',
  'PQ BITARU': 'PARQUE BITARU',
  'CJTO HUMAITA': 'HUMAITA',
  'VL NOSSA SRA DE FATI': 'VILA NOSSA SENHORA DE FATIMA',
  'PQ CONTINENTAL': 'PARQUE CONTINENTAL',
  'JOQUEI CLUBE': 'JOCKEY CLUB',
  'ESPLANADA DOS BARREI': 'ESPLANADA DOS BARREIROS',
  'JARDIM PARAISO': OUTROS,
  'VILA SAO JOSE': OUTROS,
  'VILA NOSSA DO AMPARO': OUTROS,
  'PONTE NOVA': OUTROS,
  'POMPEBA': OUTROS,
  'JARDIM RIO NEGRO': OUTROS,
  'CONJUNTO RESIDENCIAL': OUTROS,
}

function normalizaAcentos(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .trim()
}

function canonicalizaBairro(rawNome) {
  const raw = rawNome.trim().toUpperCase()
  const corrigido = RAW_TO_CORRIGIDO[raw] ?? raw
  return MERGE_FINAL[corrigido] ?? corrigido
}

// ---------------------------------------------------------------------------
// 3) Nomes de exibição (Title Case com acentos) + população por bairro,
//    transcrita e validada de "População x Bairro.csv" (soma bate com a
//    linha "Total geral": 151830 / 175161 / 897 / 239 = 328.127 habitantes).
// ---------------------------------------------------------------------------
const POPULACAO_POR_BAIRRO = {
  'BEIRA MAR': { nome: 'Beira Mar', branca: 3662, negra: 3833, amarela: 30, indigena: 0 },
  'BOA VISTA': { nome: 'Boa Vista', branca: 7294, negra: 2579, amarela: 94, indigena: 6 },
  'CATIAPOA': { nome: 'Catiapoã', branca: 7277, negra: 7530, amarela: 63, indigena: 13 },
  'CENTRO': { nome: 'Centro', branca: 5675, negra: 3062, amarela: 100, indigena: 9 },
  'CIDADE NAUTICA': { nome: 'Cidade Náutica', branca: 14407, negra: 17080, amarela: 60, indigena: 7 },
  'ESPLANADA DOS BARREIROS': { nome: 'Esplanada dos Barreiros', branca: 4218, negra: 4399, amarela: 13, indigena: 0 },
  'GONZAGUINHA': { nome: 'Gonzaguinha', branca: 7408, negra: 3824, amarela: 93, indigena: 5 },
  'HUMAITA': { nome: 'Humaitá', branca: 4688, negra: 6975, amarela: 5, indigena: 0 },
  'ITARARE': { nome: 'Itararé', branca: 6012, negra: 2688, amarela: 61, indigena: 3 },
  'JAPUI': { nome: 'Japuí', branca: 2937, negra: 2543, amarela: 8, indigena: 51 },
  'JARDIM GUASSU': { nome: 'Jardim Guassu', branca: 1877, negra: 1565, amarela: 8, indigena: 3 },
  'JARDIM INDEPENDENCIA': { nome: 'Jardim Independência', branca: 2085, negra: 1241, amarela: 36, indigena: 0 },
  'JARDIM IRMA DOLORES': { nome: 'Jardim Irmã Dolores', branca: 8550, negra: 16306, amarela: 16, indigena: 10 },
  'JARDIM RIO BRANCO': { nome: 'Jardim Rio Branco', branca: 7425, negra: 13002, amarela: 9, indigena: 19 },
  'JOCKEY CLUB': { nome: 'Jóckey Club', branca: 10530, negra: 17682, amarela: 10, indigena: 10 },
  'NOVA SAO VICENTE': { nome: 'Nova São Vicente', branca: 1618, negra: 2451, amarela: 0, indigena: 3 },
  'PARQUE BITARU': { nome: 'Parque Bitaru', branca: 6771, negra: 7453, amarela: 88, indigena: 19 },
  'PARQUE CONTINENTAL': { nome: 'Parque Continental', branca: 4962, negra: 8172, amarela: 21, indigena: 4 },
  'PARQUE DAS BANDEIRAS': { nome: 'Parque das Bandeiras', branca: 4880, negra: 7052, amarela: 13, indigena: 24 },
  'PARQUE SAO VICENTE': { nome: 'Parque São Vicente', branca: 5355, negra: 4975, amarela: 21, indigena: 7 },
  'SAMARITA': { nome: 'Samaritá', branca: 3916, negra: 7209, amarela: 7, indigena: 0 },
  'VILA EMA': { nome: 'Vila Ema', branca: 2223, negra: 3077, amarela: 0, indigena: 0 },
  'VILA MARGARIDA': { nome: 'Vila Margarida', branca: 9008, negra: 16294, amarela: 3, indigena: 11 },
  'VILA MELO': { nome: 'Vila Melo', branca: 3439, negra: 2069, amarela: 50, indigena: 4 },
  'VILA NOSSA SENHORA DE FATIMA': { nome: 'Vila Nossa Senhora de Fátima', branca: 4406, negra: 4940, amarela: 3, indigena: 0 },
  'VILA NOVA MARIANA': { nome: 'Vila Nova Mariana', branca: 535, negra: 1142, amarela: 0, indigena: 0 },
  'VILA SAO JORGE': { nome: 'Vila São Jorge', branca: 4641, negra: 2707, amarela: 47, indigena: 22 },
  'VILA VALENCA': { nome: 'Vila Valença', branca: 4044, negra: 1584, amarela: 27, indigena: 5 },
  'VILA VOTURUA': { nome: 'Vila Voturuá', branca: 1817, negra: 1362, amarela: 11, indigena: 4 },
}

// Bairros com unidades de saúde mas sem registro próprio no recorte
// populacional (localidades pequenas) - centróide calculado a partir das
// coordenadas reais das próprias unidades.
const NOME_EXIBICAO_EXTRA = {
  'VILA CASCATINHA': 'Vila Cascatinha',
  [OUTROS]: 'Outras localidades (agregado)',
}

// Bairros com dado populacional mas ZERO unidades de saúde no CNES 2019 -
// achado real relevante para o painel. Sem unidade para ancorar um
// centróide, usamos geocodificação pública (Nominatim/OpenStreetMap) do
// nome do bairro em São Vicente-SP.
const CENTROIDE_MANUAL = {
  'NOVA SAO VICENTE': { lat: -23.9893111, lon: -46.4925520 },
  'VILA NOVA MARIANA': { lat: -23.9545578, lon: -46.4489186 },
}

// ---------------------------------------------------------------------------
// 4) Leitura das planilhas
// ---------------------------------------------------------------------------
const dados = readCsv('Análise - Estabelecimentos de saúde 2019.xlsx - Dados.csv')
const cnes = readCsv('Análise - Estabelecimentos de saúde 2019.xlsx - Correção - Nomes bairro.csv')

if (dados.length !== cnes.length) {
  console.error(`ALERTA: contagem de linhas diferente! Dados.csv=${dados.length} Correção=${cnes.length}`)
}

// As duas planilhas NÃO estão na mesma ordem de linhas - o join correto é
// pelo nome do estabelecimento (Nome da Unidade == NO_FANTASIA), que bate
// 1:1 em 426 dos 427 registros. O único nome duplicado ("CLINICA TOTAL
// SAUDE SAO VICENTE") é resolvido por ordem de fila (ambos têm o mesmo
// bairro/tipo, então a ambiguidade não afeta o resultado).
const cnesPorNome = new Map()
cnes.forEach((row) => {
  const key = normalizaAcentos(row['NO_FANTASIA'] || '')
  if (!cnesPorNome.has(key)) cnesPorNome.set(key, [])
  cnesPorNome.get(key).push(row)
})

let semCorrespondencia = 0
const unidades = dados.map((row, i) => {
  const nomeKey = normalizaAcentos(row['Nome da Unidade'] || '')
  const fila = cnesPorNome.get(nomeKey)
  const cnesRowRaw = fila && fila.length ? fila.shift() : null
  if (!cnesRowRaw) semCorrespondencia++
  const cnesRow = cnesRowRaw || {}

  const lat = parseFloat(row['Latitude'])
  const lon = parseFloat(row['Longitude'])
  const temCoordenadas = Number.isFinite(lat) && Number.isFinite(lon)

  const inundacaoTxt = (row['Em área de inundação?'] || '').trim()
  const deslizamentoTxt = (row['Próxima a deslizamento (≤300m)?'] || '').trim()
  const semAvaliacaoRisco = !temCoordenadas || inundacaoTxt === ''

  const riscoInundacao = inundacaoTxt === 'Sim'
  const riscoDeslizamento = deslizamentoTxt === 'Sim'
  const classe = (row['Classe de suscetibilidade'] || '').trim()

  let nivelRisco = null
  if (!semAvaliacaoRisco) {
    if (riscoDeslizamento) nivelRisco = 'Alto'
    else if (riscoInundacao) {
      if (classe === 'Alta') nivelRisco = 'Alto'
      else if (classe === 'Média') nivelRisco = 'Médio'
      else if (classe === 'Baixa') nivelRisco = 'Baixo'
      else nivelRisco = 'Médio'
    } else {
      nivelRisco = 'Baixo'
    }
  }

  const tpUnidade = parseInt(cnesRow['TP_UNIDADE'], 10)
  const tipo = TIPO_POR_CODIGO[tpUnidade] || 'Outro estabelecimento'

  const servicosFlags = [
    [cnesRow['ST_CENTRO_CIRURGICO'], 'Centro Cirúrgico'],
    [cnesRow['ST_CENTRO_OBSTETRICO'], 'Centro Obstétrico'],
    [cnesRow['ST_CENTRO_NEONATAL'], 'Centro Neonatal'],
    [cnesRow['ST_ATEND_HOSPITALAR'], 'Atendimento Hospitalar'],
    [cnesRow['ST_SERVICO_APOIO'], 'Serviço de Apoio (SADT)'],
    [cnesRow['ST_ATEND_AMBULATORIAL'], 'Atendimento Ambulatorial'],
  ]
    .filter(([flag]) => flag === '1')
    .map(([, label]) => label)

  const servicos = servicosFlags.length
    ? servicosFlags.join(', ')
    : (FALLBACK_SERVICO_POR_CODIGO[tpUnidade] || 'Atendimento geral')

  const horario = TURNO_POR_DESCRICAO[(cnesRow['DS_TURNO_ATENDIMENTO'] || '').trim()] || 'Não informado'

  const bairroId = canonicalizaBairro(row['Bairro'] || 'OUTRAS LOCALIDADES')

  return {
    id: `u${String(i + 1).padStart(3, '0')}`,
    nome: row['Nome da Unidade'],
    bairroId,
    tipo,
    endereco: row['Endereço'],
    cep: row['CEP'],
    lat: temCoordenadas ? lat : null,
    lon: temCoordenadas ? lon : null,
    riscos: semAvaliacaoRisco ? [] : [...(riscoInundacao ? ['Inundação'] : []), ...(riscoDeslizamento ? ['Deslizamento'] : [])],
    nivelRisco,
    semAvaliacaoRisco,
    classeSuscetibilidade: classe || null,
    distanciaDeslizamento: row['Distância até deslizamento mais próximo (m)'] ? parseFloat(row['Distância até deslizamento mais próximo (m)']) : null,
    pontoDeslizamento: row['Ponto de deslizamento mais próximo'] || null,
    servicos,
    horario,
  }
})

console.log(`Unidades processadas: ${unidades.length} (sem correspondência por nome no arquivo CNES: ${semCorrespondencia})`)

// ---------------------------------------------------------------------------
// 5) Agregação por bairro
// ---------------------------------------------------------------------------
const bairroIds = new Set(unidades.map((u) => u.bairroId))
Object.keys(POPULACAO_POR_BAIRRO).forEach((id) => bairroIds.add(id))

const bairros = [...bairroIds].map((id) => {
  const unidadesBairro = unidades.filter((u) => u.bairroId === id)
  const comCoord = unidadesBairro.filter((u) => u.lat != null)
  const comAvaliacao = unidadesBairro.filter((u) => !u.semAvaliacaoRisco)

  const pop = POPULACAO_POR_BAIRRO[id]
  const nome = pop?.nome || NOME_EXIBICAO_EXTRA[id] || id

  let lat, lon
  if (CENTROIDE_MANUAL[id]) {
    ;({ lat, lon } = CENTROIDE_MANUAL[id])
  } else if (comCoord.length) {
    lat = comCoord.reduce((s, u) => s + u.lat, 0) / comCoord.length
    lon = comCoord.reduce((s, u) => s + u.lon, 0) / comCoord.length
  } else {
    lat = null
    lon = null
  }

  const qtdInundacao = comAvaliacao.filter((u) => u.riscos.includes('Inundação')).length
  const qtdDeslizamento = comAvaliacao.filter((u) => u.riscos.includes('Deslizamento')).length

  return {
    id: id.toLowerCase().replace(/\s+/g, '-'),
    nome,
    populacao: pop ? pop.branca + pop.negra + pop.amarela + pop.indigena : null,
    populacaoCor: pop ? { branca: pop.branca, negra: pop.negra, amarela: pop.amarela, indigena: pop.indigena } : null,
    qtdUnidades: unidadesBairro.length,
    riscoInundacao: comAvaliacao.length ? qtdInundacao / comAvaliacao.length >= 0.5 : null,
    riscoDeslizamento: comAvaliacao.length ? qtdDeslizamento > 0 : null,
    lat,
    lon,
  }
})

// remapeia bairroId das unidades para o slug final
const slugPorRawId = Object.fromEntries([...bairroIds].map((id) => [id, id.toLowerCase().replace(/\s+/g, '-')]))
unidades.forEach((u) => { u.bairroId = slugPorRawId[u.bairroId] })

bairros.sort((a, b) => (b.populacao || 0) - (a.populacao || 0))

console.log(`Bairros finais: ${bairros.length}`)
bairros.forEach((b) => console.log(`  ${b.nome.padEnd(32)} pop=${String(b.populacao ?? '—').padStart(7)}  unidades=${b.qtdUnidades}  inund=${b.riscoInundacao}  desliz=${b.riscoDeslizamento}`))

const semCoordCount = unidades.filter((u) => u.lat == null).length
const inundacaoCount = unidades.filter((u) => u.riscos.includes('Inundação')).length
const deslizamentoCount = unidades.filter((u) => u.riscos.includes('Deslizamento')).length
console.log(`\nValidação contra "Resumo - Riscos.csv": inundação Sim=${inundacaoCount} (esperado 326), deslizamento Sim=${deslizamentoCount} (esperado 11), sem coordenadas=${semCoordCount} (esperado ~97)`)

// ---------------------------------------------------------------------------
// 6) Escreve o módulo final
// ---------------------------------------------------------------------------
const banner = `// Gerado por scripts/build-data.mjs a partir dos dados reais em src/planilhas/
// (CNES - Estabelecimentos de Saúde 2019 + IBGE - Censo Demográfico 2022).
// Não editar manualmente - rode "node scripts/build-data.mjs" para regenerar.
`

const out = `${banner}
export const bairros = ${JSON.stringify(bairros, null, 2)}

export const unidades = ${JSON.stringify(unidades, null, 2)}
`

writeFileSync(path.join(ROOT, 'src/data/saoVicenteData.js'), out)
console.log('\nEscrito em src/data/saoVicenteData.js')
