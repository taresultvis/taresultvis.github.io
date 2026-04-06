export type TaxonomyDomain = 'data' | 'visual'

export type TaxonomyTag = {
  key: string
  domain: TaxonomyDomain
  group: string
  label: string
  path: string[]
  definition: string
}

export type TaxonomyFilterOption = TaxonomyTag & {
  count: number
}

export type TaxonomyFilterGroup = {
  key: string
  label: string
  definition: string
  count: number
  options: TaxonomyFilterOption[]
}

export type FigureRecord = {
  id: number
  title: string
  venue: string
  item: string
  paperIndex: number
  year: number
  authors: string
  doi: string
  doiUrl: string
  thumbnailSrc: string
  dataTags: TaxonomyTag[]
  visualTags: TaxonomyTag[]
}

export type PaperRecord = {
  id: number
  title: string
  year: number
  authors: string
  doi: string
  doiUrl: string
  venue: string
  figureCount: number
}

export type AppData = {
  figures: FigureRecord[]
  papers: PaperRecord[]
  totalPaperCount: number
  venues: string[]
  years: number[]
  dataGroups: TaxonomyFilterGroup[]
  visualGroups: TaxonomyFilterGroup[]
}

type FigureRow = {
  index: string
  paper: string
  venue: string
  item: string
  paperIndex: string
}

type PaperRow = {
  index: string
  title: string
  year: string
  author: string
  DOI: string
  venue: string
}

type TaxonomyDefinitionRow = {
  Taxonomy: string
  Level: string
  Name: string
  Parent: string
  Definition: string
}

interface TaxonomyNode {
  [key: string]: TaxonomyNode | number[]
}

type TaxonomyIndexResult = {
  groups: TaxonomyFilterGroup[]
  tagsByFigureId: Map<number, TaxonomyTag[]>
}

type TaxonomyDefinitions = {
  groupDefinitions: Map<string, string>
  optionDefinitions: Map<string, string>
}

export async function loadAppData(): Promise<AppData> {
  const [
    figureText,
    paperText,
    taxonomyDefinitionText,
    dataTaxonomy,
    visualTaxonomy,
  ] =
    await Promise.all([
      fetchText('/figures.tsv'),
      fetchText('/papers.tsv'),
      fetchText('/taxonomy_definition.tsv'),
      fetchJson<TaxonomyNode>('/data_taxonomy_index_dict.json'),
      fetchJson<TaxonomyNode>('/visual_taxonomy_index_dict.json'),
    ])

  const figureRows = parseTSV(figureText) as FigureRow[]
  const paperRows = parseTSV(paperText) as PaperRow[]
  const taxonomyDefinitionRows = parseTSV(
    taxonomyDefinitionText,
  ) as TaxonomyDefinitionRow[]
  const taxonomyDefinitions = buildTaxonomyDefinitions(taxonomyDefinitionRows)

  const papers = paperRows
    .map((row) => {
      const id = Number.parseInt(row.index, 10)
      const year = Number.parseInt(row.year, 10)
      const doi = row.DOI.trim()

      return {
        id,
        title: row.title,
        year,
        authors: row.author,
        doi,
        doiUrl: buildDoiUrl(doi),
        venue: row.venue,
        figureCount: 0,
      } satisfies PaperRecord
    })
    .filter((paper) => Number.isFinite(paper.id) && Number.isFinite(paper.year))

  const papersByIndex = new Map(papers.map((paper) => [paper.id, paper]))

  const dataIndex = buildTaxonomyIndex(dataTaxonomy, 'data', taxonomyDefinitions)
  const visualIndex = buildTaxonomyIndex(
    visualTaxonomy,
    'visual',
    taxonomyDefinitions,
  )

  const figures = figureRows
    .map((row) => {
      const id = Number.parseInt(row.index, 10)
      const paperIndex = Number.parseInt(row.paperIndex, 10)
      const paper = papersByIndex.get(paperIndex)

      if (!Number.isFinite(id) || !Number.isFinite(paperIndex) || !paper) {
        return null
      }

      return {
        id,
        title: paper.title || row.paper,
        venue: row.venue,
        item: row.item,
        paperIndex,
        year: paper.year,
        authors: paper.authors,
        doi: paper.doi,
        doiUrl: paper.doiUrl,
        thumbnailSrc: `/thumbnails/${id}.jpg`,
        dataTags: sortTags(dataIndex.tagsByFigureId.get(id) ?? []),
        visualTags: sortTags(visualIndex.tagsByFigureId.get(id) ?? []),
      } satisfies FigureRecord
    })
    .filter((figure): figure is FigureRecord => figure !== null)
    .sort(compareFigures)

  const figureCountByPaper = new Map<number, number>()
  for (const figure of figures) {
    figureCountByPaper.set(
      figure.paperIndex,
      (figureCountByPaper.get(figure.paperIndex) ?? 0) + 1,
    )
  }

  const hydratedPapers = papers
    .map((paper) => ({
      ...paper,
      figureCount: figureCountByPaper.get(paper.id) ?? 0,
    }))
    .sort(comparePapers)

  const venues = unique(figures.map((figure) => figure.venue)).sort((left, right) =>
    left.localeCompare(right),
  )
  const years = unique(papers.map((paper) => paper.year)).sort((left, right) => left - right)

  return {
    figures,
    papers: hydratedPapers,
    totalPaperCount: paperRows.length,
    venues,
    years,
    dataGroups: dataIndex.groups,
    visualGroups: visualIndex.groups,
  }
}

async function fetchText(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`)
  }

  return response.text()
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`)
  }

  return (await response.json()) as T
}

function parseTSV(text: string) {
  const cleaned = text.replace(/^\uFEFF/, '')
  const rows = cleaned
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split('\t'))

  const nonEmptyRows = rows.filter((row) =>
    row.some((field) => field.trim().length > 0),
  )
  const [headers = [], ...body] = nonEmptyRows

  return body.map((values) =>
    Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex] ?? ''])),
  )
}

function buildTaxonomyIndex(
  taxonomy: TaxonomyNode,
  domain: TaxonomyDomain,
  definitions: TaxonomyDefinitions,
): TaxonomyIndexResult {
  const groups = new Map<string, TaxonomyFilterOption[]>()
  const groupFigureIds = new Map<string, Set<number>>()
  const order: string[] = []
  const tagsByFigureId = new Map<number, TaxonomyTag[]>()

  const visit = (node: TaxonomyNode, path: string[] = []) => {
    for (const [key, value] of Object.entries(node)) {
      if (Array.isArray(value)) {
        const groupLabel = path[0] ?? key
        const tagKey = [domain, ...path, key].join('::')
        const pathWithLeaf = [...path, key]
        const tag = {
          key: tagKey,
          domain,
          group: groupLabel,
          label: key,
          path: pathWithLeaf,
          definition: getOptionDefinition(definitions, domain, groupLabel, key),
        } satisfies TaxonomyTag

        if (!groups.has(groupLabel)) {
          groups.set(groupLabel, [])
          groupFigureIds.set(groupLabel, new Set())
          order.push(groupLabel)
        }

        groups.get(groupLabel)?.push({
          ...tag,
          count: value.length,
        })

        for (const rawFigureId of value) {
          const figureId = Number(rawFigureId)
          if (!Number.isFinite(figureId)) {
            continue
          }

          groupFigureIds.get(groupLabel)?.add(figureId)
          const tags = tagsByFigureId.get(figureId) ?? []
          tags.push(tag)
          tagsByFigureId.set(figureId, tags)
        }
      } else {
        visit(value, [...path, key])
      }
    }
  }

  visit(taxonomy)

  return {
    groups: order.map((groupLabel) => ({
      key: `${domain}::${groupLabel}`,
      label: groupLabel,
      definition: getGroupDefinition(definitions, domain, groupLabel),
      count: groupFigureIds.get(groupLabel)?.size ?? 0,
      options: groups.get(groupLabel) ?? [],
    })),
    tagsByFigureId: new Map(
      [...tagsByFigureId.entries()].map(([figureId, tags]) => [figureId, sortTags(tags)]),
    ),
  }
}

function buildTaxonomyDefinitions(rows: TaxonomyDefinitionRow[]): TaxonomyDefinitions {
  const groupDefinitions = new Map<string, string>()
  const optionDefinitions = new Map<string, string>()

  for (const row of rows) {
    const domain = mapTaxonomyDomain(row.Taxonomy)
    if (!domain) {
      continue
    }

    const level = row.Level.trim().toLowerCase()
    const nameKey = normalizeTaxonomyName(row.Name, domain)
    const definition = row.Definition.trim()

    if (!nameKey || !definition) {
      continue
    }

    if (level === 'main') {
      groupDefinitions.set(`${domain}::${nameKey}`, definition)
      continue
    }

    const parentKey = normalizeTaxonomyName(row.Parent, domain)
    if (!parentKey) {
      continue
    }

    optionDefinitions.set(`${domain}::${parentKey}::${nameKey}`, definition)
  }

  return {
    groupDefinitions,
    optionDefinitions,
  }
}

function getGroupDefinition(
  definitions: TaxonomyDefinitions,
  domain: TaxonomyDomain,
  groupLabel: string,
) {
  return (
    definitions.groupDefinitions.get(
      `${domain}::${normalizeTaxonomyName(groupLabel, domain)}`,
    ) ?? ''
  )
}

function getOptionDefinition(
  definitions: TaxonomyDefinitions,
  domain: TaxonomyDomain,
  groupLabel: string,
  optionLabel: string,
) {
  return (
    definitions.optionDefinitions.get(
      `${domain}::${normalizeTaxonomyName(groupLabel, domain)}::${normalizeTaxonomyName(optionLabel, domain)}`,
    ) ?? ''
  )
}

function mapTaxonomyDomain(value: string): TaxonomyDomain | null {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'data type') {
    return 'data'
  }

  if (normalized === 'visual encoding') {
    return 'visual'
  }

  return null
}

function normalizeTaxonomyName(value: string, domain: TaxonomyDomain) {
  const compact = value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[./]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')

  const aliasMap =
    domain === 'data'
      ? DATA_TAXONOMY_ALIASES
      : VISUAL_TAXONOMY_ALIASES

  return aliasMap[compact] ?? compact.replace(/\s+/g, '')
}

const DATA_TAXONOMY_ALIASES: Record<string, string> = {
  theme: 'theme',
  concept: 'concept',
  quantitative: 'quantitative',
  quantitatives: 'quantitative',
  taxonomy: 'taxonomy',
  definition: 'definition',
  example: 'example',
  source: 'source',
  'other theme': 'othertheme',
  'model fmk': 'modelframework',
  'model framework': 'modelframework',
  'design insight': 'designinsight',
  frequency: 'frequency',
  'self reported': 'selfreported',
  'objectively measured': 'objectivelymeasured',
  'obj measured': 'objectivelymeasured',
}

const VISUAL_TAXONOMY_ALIASES: Record<string, string> = {
  grid: 'grid',
  table: 'table',
  matrix: 'matrix',
  heatmap: 'heatmap',
  diagram: 'diagram',
  'block diagram': 'blockdiagram',
  'network diagram': 'networkdiagram',
  'euler diagram': 'eulerdiagram',
  'other diagram': 'otherdiagram',
  image: 'image',
  photo: 'photo',
  screenshot: 'screenshot',
  sketch: 'sketch',
  illustration: 'illustration',
  chart: 'chart',
  'bar chart': 'barchart',
  'grouped bar': 'groupedbar',
  'stacked bar': 'stackedbar',
  'range symbol': 'rangesymbol',
  'box plot': 'boxplot',
  'other chart': 'otherchart',
  'msc vis': 'mscvis',
  mscvis: 'mscvis',
}

function buildDoiUrl(doi: string) {
  return doi.startsWith('http://') || doi.startsWith('https://')
    ? doi
    : `https://doi.org/${doi}`
}

function compareFigures(left: FigureRecord, right: FigureRecord) {
  return (
    right.year - left.year ||
    left.title.localeCompare(right.title) ||
    left.item.localeCompare(right.item, undefined, { numeric: true }) ||
    left.id - right.id
  )
}

function comparePapers(left: PaperRecord, right: PaperRecord) {
  return (
    right.year - left.year ||
    left.title.localeCompare(right.title) ||
    left.id - right.id
  )
}

function unique<T>(values: T[]) {
  return [...new Set(values)]
}

function sortTags(tags: TaxonomyTag[]) {
  return dedupeTags(tags).sort(
    (left, right) =>
      left.group.localeCompare(right.group) || left.label.localeCompare(right.label),
  )
}

function dedupeTags(tags: TaxonomyTag[]) {
  const seen = new Set<string>()
  return tags.filter((tag) => {
    if (seen.has(tag.key)) {
      return false
    }

    seen.add(tag.key)
    return true
  })
}
