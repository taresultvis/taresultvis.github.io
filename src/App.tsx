import { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { AboutView } from './about'
import {
  buildVenueCounts,
  buildYearCounts,
  countUniquePapers,
  FiltersPanel,
  filterFigures,
} from './filters'
import { loadAppData, type FigureRecord } from './data'
import { ReferenceView } from './reference'
import { FigureModal, SurveyView } from './survey'
import type { AppFilters, TabId } from './types'
import { TabButton } from './ui'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('survey')
  const [data, setData] = useState<Awaited<ReturnType<typeof loadAppData>> | null>(null)
  const [filters, setFilters] = useState<AppFilters | null>(null)
  const [selectedFigure, setSelectedFigure] = useState<FigureRecord | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const appData = await loadAppData()
        if (!isMounted) {
          return
        }

        setData(appData)
        setFilters({
          venues: appData.venues,
          years: [],
          dataTags: [],
          visualTags: [],
          taxonomyMode: 'and',
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'The dataset could not be loaded.',
        )
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  const deferredFilters = useDeferredValue(filters)

  const updateFilters = (recipe: (current: AppFilters) => AppFilters) => {
    startTransition(() => {
      setFilters((current) => {
        if (!current) {
          return current
        }

        return recipe(current)
      })
    })
  }

  if (errorMessage) {
    return (
      <main className="app-shell">
        <section className="error-card">
          <p className="eyebrow">Data load error</p>
          <h1 className="empty-state-title">The refactored site could not start.</h1>
          <p className="error-copy">{errorMessage}</p>
        </section>
      </main>
    )
  }

  if (!data || !deferredFilters) {
    return (
      <main className="app-shell">
        <section className="loading-card">
          <p className="eyebrow">Preparing survey</p>
          <h1 className="empty-state-title">Building the figure taxonomy view</h1>
          <p className="loading-copy">
            Loading figures, paper metadata, and taxonomy indexes from the
            public dataset.
          </p>
        </section>
      </main>
    )
  }

  const figuresForYearCounts = filterFigures(data.figures, {
    ...deferredFilters,
    years: [],
  })
  const visibleFigures = filterFigures(data.figures, deferredFilters)
  const yearCounts = buildYearCounts(figuresForYearCounts, data.years)
  const venueCounts = buildVenueCounts(
    filterFigures(data.figures, {
      ...deferredFilters,
      venues: data.venues,
    }),
    data.venues,
  )
  const visiblePaperCount = countUniquePapers(visibleFigures)
  const visiblePaperIds = new Set(visibleFigures.map((figure) => figure.paperIndex))
  const visiblePapers = data.papers.filter((paper) => visiblePaperIds.has(paper.id))
  const hiddenPapers = data.papers.filter((paper) => !visiblePaperIds.has(paper.id))

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-intro">
          <p className="eyebrow">Beyond the Wall of Text</p>
          <h1 className="hero-title">
            Practices in Visualizing Results of Thematic Analysis
          </h1>
          <p className="hero-copy"></p>
        </div>
        {/*
        <div className="hero-stats">
          <StatCard label="Venues" value={data.venues.length} />
          <StatCard label="Years" value={`${data.years[0]}-${data.years.at(-1)}`} wide />
          <StatCard label="Papers" value={data.totalPaperCount} />
          <StatCard label="Figures" value={data.figures.length} />
        </div>
        */}
      </section>

      <FiltersPanel
        data={data}
        figures={visibleFigures}
        filters={deferredFilters}
        venueCounts={venueCounts}
        yearCounts={yearCounts}
        visiblePaperCount={visiblePaperCount}
        isPending={isPending}
        onReset={() =>
          updateFilters((current) => ({
            venues: data.venues,
            years: [],
            dataTags: [],
            visualTags: [],
            taxonomyMode: current.taxonomyMode,
          }))
        }
        onResetVenue={() =>
          updateFilters((current) => ({
            ...current,
            venues: data.venues,
          }))
        }
        onResetYear={() =>
          updateFilters((current) => ({
            ...current,
            years: [],
          }))
        }
        onResetData={() =>
          updateFilters((current) => ({
            ...current,
            dataTags: [],
          }))
        }
        onResetVisual={() =>
          updateFilters((current) => ({
            ...current,
            visualTags: [],
          }))
        }
        onResetMatrix={() =>
          updateFilters((current) => ({
            ...current,
            dataTags: [],
            visualTags: [],
          }))
        }
        onToggleVenue={(venue) =>
          updateFilters((current) => ({
            ...current,
            venues: toggleValue(current.venues, venue),
          }))
        }
        onToggleYear={(year) =>
          updateFilters((current) => ({
            ...current,
            years: toggleValue(current.years, year),
          }))
        }
        onToggleDataTag={(tagKey) =>
          updateFilters((current) => ({
            ...current,
            dataTags: toggleValue(current.dataTags, tagKey),
          }))
        }
        onToggleDataGroup={(tagKeys) =>
          updateFilters((current) => ({
            ...current,
            dataTags: toggleGroupValues(current.dataTags, tagKeys),
          }))
        }
        onToggleVisualTag={(tagKey) =>
          updateFilters((current) => ({
            ...current,
            visualTags: toggleValue(current.visualTags, tagKey),
          }))
        }
        onToggleVisualGroup={(tagKeys) =>
          updateFilters((current) => ({
            ...current,
            visualTags: toggleGroupValues(current.visualTags, tagKeys),
          }))
        }
        onToggleMatrixCell={(dataTagKey, visualTagKey) =>
          updateFilters((current) => ({
            ...current,
            ...toggleMatrixValues(
              current.dataTags,
              current.visualTags,
              dataTagKey,
              visualTagKey,
            ),
          }))
        }
        onToggleTaxonomyMode={() =>
          updateFilters((current) => ({
            ...current,
            taxonomyMode: current.taxonomyMode === 'and' ? 'or' : 'and',
          }))
        }
      />

      <nav className="tab-row" aria-label="Main tabs">
        <TabButton
          active={activeTab === 'survey'}
          onClick={() => setActiveTab('survey')}
        >
          Survey
        </TabButton>
        <TabButton
          active={activeTab === 'reference'}
          onClick={() => setActiveTab('reference')}
        >
          Reference
        </TabButton>
        <TabButton
          active={activeTab === 'about'}
          onClick={() => setActiveTab('about')}
        >
          About
        </TabButton>
      </nav>

      <section className="content-panel">
        {activeTab === 'survey' ? (
          <SurveyView
            figures={visibleFigures}
            filters={deferredFilters}
            onToggleDataTag={(tagKey) =>
              updateFilters((current) => ({
                ...current,
                dataTags: toggleValue(current.dataTags, tagKey),
              }))
            }
            onToggleVisualTag={(tagKey) =>
              updateFilters((current) => ({
                ...current,
                visualTags: toggleValue(current.visualTags, tagKey),
              }))
            }
            onSelectFigure={setSelectedFigure}
          />
        ) : null}

        {activeTab === 'reference' ? (
          <ReferenceView
            includedPapers={visiblePapers}
            excludedPapers={hiddenPapers}
            totalPaperCount={data.totalPaperCount}
          />
        ) : null}
        {activeTab === 'about' ? (
          <AboutView
            dataGroups={data.dataGroups}
            visualGroups={data.visualGroups}
          />
        ) : null}
      </section>

      {selectedFigure ? (
        <FigureModal
          figure={selectedFigure}
          onClose={() => setSelectedFigure(null)}
        />
      ) : null}
    </main>
  )
}

function toggleValue<T>(list: T[], value: T) {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value]
}

function addMissingValues<T>(list: T[], values: T[]) {
  const next = [...list]

  for (const value of values) {
    if (!next.includes(value)) {
      next.push(value)
    }
  }

  return next
}

function toggleGroupValues<T>(list: T[], values: T[]) {
  if (values.length === 0) {
    return list
  }

  const allSelected = values.every((value) => list.includes(value))

  return allSelected
    ? list.filter((entry) => !values.includes(entry))
    : addMissingValues(list, values)
}

function toggleMatrixValues<T>(
  dataValues: T[],
  visualValues: T[],
  dataValue: T,
  visualValue: T,
) {
  const pairSelected =
    dataValues.includes(dataValue) && visualValues.includes(visualValue)

  return pairSelected
    ? {
        dataTags: dataValues.filter((entry) => entry !== dataValue),
        visualTags: visualValues.filter((entry) => entry !== visualValue),
      }
    : {
        dataTags: addMissingValues(dataValues, [dataValue]),
        visualTags: addMissingValues(visualValues, [visualValue]),
      }
}

export default App
