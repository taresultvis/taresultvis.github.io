import { useContext, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { DataContext } from '../DataContext';
import { vrKeyOrder, vrSubKeyOrder, arKeyOrder, arSubKeyOrder, arColorScale, vrIconScale } from '../constants';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Matrix = () => {
  const context = useContext(DataContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {

    console.log(containerRef.current);
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
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

  console.log(dimensions)

  if (context === undefined) {
    throw new Error('Matrix must be used within a DataProvider');
  }

  const { analysisResults, visualRepresentations, selectedArKeys, selectedVrKeys, setSelectedArKeys, setSelectedVrKeys, figureInfo, selectedYears } = context;

  useEffect(() => {
    if (!analysisResults || !visualRepresentations || !figureInfo || !svgRef.current || dimensions.width === 0) {
      return;
    }

    const { width, height } = dimensions;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const xAxisLabels = selectedArKeys.length === 0 ? arKeyOrder : selectedArKeys;
    const yAxisLabels = selectedVrKeys.length === 0 ? vrKeyOrder : selectedVrKeys;

    const getIdsForKeys = (data: { [key: string]: any }, keys: string[], subKeyOrder: any, keyOrder: string[]): number[] => {
      return keys.flatMap(key => {
        if (keyOrder.includes(key)) {
          const subKeys = subKeyOrder[key];
          if (subKeys && data[key]) {
            return subKeys.flatMap((subKey: string) =>
              data[key][subKey] && Array.isArray(data[key][subKey]) ? data[key][subKey] : []
            );
          }
        }
        const mainKey = Object.keys(subKeyOrder).find(mainKey => subKeyOrder[mainKey].includes(key));
        if (mainKey && data[mainKey] && data[mainKey][key] && Array.isArray(data[mainKey][key])) {
          return data[mainKey][key];
        }
        return [];
      });
    };

    const filteredIdSet = selectedYears.length > 0
      ? new Set((figureInfo as any[]).filter(d => selectedYears.includes(d.Year)).map(d => parseInt(d.id, 10)))
      : null;

    const data: any[] = [];
    let maxCount = 0;

    yAxisLabels.forEach(yLabel => {
      xAxisLabels.forEach(xLabel => {
        let xIds = getIdsForKeys(analysisResults, [xLabel], arSubKeyOrder, arKeyOrder);
        let yIds = getIdsForKeys(visualRepresentations, [yLabel], vrSubKeyOrder, vrKeyOrder);

        if (filteredIdSet) {
          xIds = xIds.filter(id => filteredIdSet.has(id));
          yIds = yIds.filter(id => filteredIdSet.has(id));
        }

        const intersection = xIds.filter(id => yIds.includes(id));
        const count = intersection.length;
        if (count > maxCount) maxCount = count;
        data.push({ x: xLabel, y: yLabel, count });
      });
    });

    const margin = { top: 100, right: 50, bottom: 50, left: 200 };
    const matrixWidth = width - margin.left - margin.right;
    const matrixHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(xAxisLabels).range([0, matrixWidth]).padding(0.05);
    const yScale = d3.scaleBand().domain(yAxisLabels).range([0, matrixHeight]).padding(0.05);

    const matrix = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    matrix.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x) as number)
      .attr('y', d => yScale(d.y) as number)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', d => arColorScale(d.x))
      .style('opacity', d => d.count / maxCount)
      .on('click', (_, d) => {
        setSelectedArKeys([d.x]);
        setSelectedVrKeys([d.y]);
      });

    const xAxis = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    xAxis.selectAll('text')
      .data(xAxisLabels)
      .enter()
      .append('text')
      .attr('x', d => (xScale(d) as number) + xScale.bandwidth() / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .text(d => d)
      .on('click', (_, d) => {
        setSelectedArKeys([d]);
      });

    xAxis.selectAll('foreignObject')
      .data(xAxisLabels)
      .enter()
      .append('foreignObject')
      .attr('x', d => (xScale(d) as number) + xScale.bandwidth() / 2 - 10)
      .attr('y', -20)
      .attr('width', 20)
      .attr('height', 20)
      .html(d => `<i class="fas ${vrIconScale(d)}"></i>`);

    const yAxis = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    yAxis.selectAll('text')
      .data(yAxisLabels)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', d => (yScale(d) as number) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .text(d => d)
      .on('click', (_, d) => {
        setSelectedVrKeys([d]);
      });

  }, [analysisResults, visualRepresentations, selectedArKeys, selectedVrKeys, figureInfo, selectedYears, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full">
        
        {selectedVrKeys.length > 0 && <button onClick={() => setSelectedVrKeys([])}>
            <XMarkIcon className="h-4 w-4" />
        </button>}
        {selectedArKeys.length > 0 && <button onClick={() => setSelectedArKeys([])}>
            <XMarkIcon className="h-4 w-4" />
        </button>}
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
      
    </div>
  );
};

export default Matrix;