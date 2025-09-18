import { useContext, useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { DataContext } from "../DataContext";
import {
  vrKeyOrder,
  vrSubKeyOrder,
  vrSubkeyToKey,
  arKeyOrder,
  arSubKeyOrder,
  arSubkeyToKey,
  arColorScale,
  vrIconScale,
} from "../constants";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

const Matrix = () => {
  const context = useContext(DataContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries && entries.length > 0) {
          setDimensions({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height,
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  if (context === undefined) {
    throw new Error("Matrix must be used within a DataProvider");
  }

  const {
    analysisResults,
    visualRepresentations,
    selectedArKeys,
    selectedVrKeys,
    setSelectedArKeys,
    setSelectedVrKeys,
    figureInfo,
    selectedYears,
  } = context;

  const xAxisLabels = useMemo(() => {
    if (selectedArKeys.length === 0) {
      return arKeyOrder;
    }
    if (selectedArKeys.length === 1 && arSubKeyOrder[selectedArKeys[0]]) {
      return arSubKeyOrder[selectedArKeys[0]];
    }
    return selectedArKeys;
  }, [selectedArKeys]);

  const yAxisLabels = useMemo(() => {
    if (selectedVrKeys.length === 0) {
      return vrKeyOrder;
    }
    if (selectedVrKeys.length === 1 && vrSubKeyOrder[selectedVrKeys[0]]) {
      return vrSubKeyOrder[selectedVrKeys[0]];
    }
    return selectedVrKeys;
  }, [selectedVrKeys]);

  const { matrixData, maxCount } = useMemo(() => {
    if (!analysisResults || !visualRepresentations || !figureInfo) {
      return { matrixData: [], maxCount: 0 };
    }

    const getIdsForKeys = (
      data: { [key: string]: any },
      keys: string[],
      subKeyOrder: any,
      keyOrder: string[]
    ): number[] => {
      return keys.flatMap((key) => {
        if (keyOrder.includes(key)) {
          const subKeys = subKeyOrder[key];
          if (subKeys && data[key]) {
            return subKeys.flatMap((subKey: string) =>
              data[key][subKey] && Array.isArray(data[key][subKey])
                ? data[key][subKey]
                : []
            );
          }
        }
        const mainKey = Object.keys(subKeyOrder).find((mainKey) =>
          subKeyOrder[mainKey].includes(key)
        );
        if (
          mainKey &&
          data[mainKey] &&
          data[mainKey][key] &&
          Array.isArray(data[mainKey][key])
        ) {
          return data[mainKey][key];
        }
        return [];
      });
    };

    const filteredIdSet =
      selectedYears.length > 0
        ? new Set(
            (figureInfo as any[])
              .filter((d) => selectedYears.includes(d.Year))
              .map((d) => parseInt(d.id, 10))
          )
        : null;

    const matrixData: any[] = [];
    let maxCount = 0;

  yAxisLabels.forEach((yLabel: string) => {
  xAxisLabels.forEach((xLabel: string) => {
        let xIds = getIdsForKeys(
          analysisResults,
          [xLabel],
          arSubKeyOrder,
          arKeyOrder
        );
        let yIds = getIdsForKeys(
          visualRepresentations,
          [yLabel],
          vrSubKeyOrder,
          vrKeyOrder
        );

        if (filteredIdSet) {
          xIds = xIds.filter((id) => filteredIdSet.has(id));
          yIds = yIds.filter((id) => filteredIdSet.has(id));
        }

        const intersection = xIds.filter((id) => yIds.includes(id));
        const count = intersection.length;
        if (count > maxCount) maxCount = count;
        matrixData.push({ x: xLabel, y: yLabel, count });
      });
    });
    return { matrixData, maxCount };
  }, [
    analysisResults,
    visualRepresentations,
    figureInfo,
    selectedYears,
    xAxisLabels,
    yAxisLabels,
  ]);

  const { xScale, yScale, margin } = useMemo(() => {
    const margin = { top: 100, right: 80, bottom: 20, left: 100 };
    if (dimensions.width === 0) {
      return {
        xScale: null,
        yScale: null,
        margin,
      };
    }
    const matrixWidth = dimensions.width - margin.left - margin.right;
    const matrixHeight = dimensions.height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(xAxisLabels)
      .range([0, matrixWidth])
      .padding(0.05);
    const yScale = d3
      .scaleBand()
      .domain(yAxisLabels)
      .range([0, matrixHeight])
      .padding(0.05);
    return { xScale, yScale, margin };
  }, [dimensions, xAxisLabels, yAxisLabels]);

  if (
    !analysisResults ||
    !visualRepresentations ||
    !figureInfo ||
    dimensions.width === 0 ||
    !xScale ||
    !yScale
  ) {
    return <div ref={containerRef} className="w-full h-full min-w-0 min-h-0"></div>;
  }

  return (
    <div ref={containerRef} className="w-full h-full min-w-0 min-h-0">
      {selectedVrKeys.length > 0 && (
        <button
          onClick={() => setSelectedVrKeys([])}
          className="absolute bottom-0 left-0 m-2"
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
      )}
      {selectedArKeys.length > 0 && (
        <button
          onClick={() => setSelectedArKeys([])}
          className="absolute top-0 right-0 m-2"
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
      )}
      <svg width={dimensions.width} height={dimensions.height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {matrixData.map((d, i) => (
            <g key={i}>
              <rect
                x={xScale(d.x)}
                y={yScale(d.y)}
                width={xScale.bandwidth()}
              height={yScale.bandwidth()}
              style={{
                fill: arColorScale(arSubkeyToKey[d.x] || d.x),
                
                opacity: maxCount > 0 ? d.count / maxCount : 0,
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedArKeys([d.x]);
                setSelectedVrKeys([d.y]);
              }}
            />
            <text 
              x={(xScale(d.x) ?? 0) + xScale.bandwidth() / 2}
              y={(yScale(d.y) ?? 0) + yScale.bandwidth() / 2}
              textAnchor="middle"
              alignmentBaseline="middle"
              style={{ pointerEvents: "none", fill: d.count > maxCount / 2 ? "white" : "black", fontSize: '12px', fontWeight: 'bold' }}
            >
              {d.count > 0 ? d.count : ""}
            </text>
          </g>
          ))}

          {/* X-Axis */}
          <g>
            {xAxisLabels.map((label: string, i: number) => (
              <g
                key={i}
                onClick={() => setSelectedArKeys([label])}
                style={{ cursor: "pointer" }}
              >
                <text
                  x={(xScale(label) ?? 0) + xScale.bandwidth() / 2}
                  y={-10}
                  textAnchor="start"
                  transform={`rotate(-45, ${
                    (xScale(label) ?? 0) + xScale.bandwidth() / 2
                  }, -10)`}
                  alignmentBaseline="middle"
                >
                  {label}
                </text>
              </g>
            ))}
          </g>

          {/* Y-Axis */}
          <g>
            {yAxisLabels.map((label: string, i: number) => (
              <g key={i} onClick={() => setSelectedVrKeys([label])} style={{ cursor: "pointer" }}>
              <text
                x={-10}
                y={(yScale(label) ?? 0) + yScale.bandwidth() / 2 - 10}
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {label}
              </text>
              <foreignObject
                  x={-35}
                  y={(yScale(label) ?? 0) + yScale.bandwidth() / 2}
                  width={30}
                  height={30}
                >
                  <i
                    className={`fa ${vrIconScale(vrSubkeyToKey[label] || label)}`}
                    style={{ fontSize: '24px' }}
                  ></i>
                </foreignObject>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Matrix;
