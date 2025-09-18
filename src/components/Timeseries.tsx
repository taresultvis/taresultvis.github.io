import React, { useEffect, useRef, useContext, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DataContext } from '../DataContext';

const Timeseries: React.FC = () => {
  const context = useContext(DataContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {

      console.log('resizeObserver called');
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

  const { figureInfo, selectedYears, setSelectedYears } = context ?? {};

  const data = useMemo(() => {
    if (!figureInfo) return [];
    const yearlyCounts = d3.rollup(figureInfo, (v: any) => v.length, (d: any) => d.Year);
    return Array.from(yearlyCounts, ([key, value]) => ({ year: key, count: value })).sort((a, b) => d3.ascending(a.year, b.year));
  }, [figureInfo]);

  useEffect(() => {
    if (data && svgRef.current && dimensions.width > 0 && selectedYears && setSelectedYears) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = dimensions.width - margin.left - margin.right;
      const height = dimensions.height - margin.top - margin.bottom;

      const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xDomain = d3.range(
        d3.min(data, d => +d.year) as number,
        (d3.max(data, d => +d.year) as number) + 1
      ).map(String);

      const x = d3.scaleBand()
        .domain(xDomain)
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) as number])
        .nice()
        .range([height, 0]);

      chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

      chart.append("g")
        .call(d3.axisLeft(y));

      const bars = chart.append("g")
        .attr("fill", d3.schemeTableau10[5])
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.year) as number)
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count))
        .attr("width", x.bandwidth())
        .attr("cursor", "pointer")
        .on("click", (_, d) => {
          const newSelectedYears = selectedYears.includes(d.year)
            ? selectedYears.filter(y => y !== d.year)
            : [...selectedYears, d.year];
          setSelectedYears(newSelectedYears);
        });

      if (selectedYears.length > 0) {
        bars.attr("opacity", d => selectedYears.includes(d.year) ? 1 : 0.3);
      } else {
        bars.attr("opacity", 1);
      }
    }
  }, [data, dimensions, selectedYears, setSelectedYears]);

  return (
    <div ref={containerRef} className="w-full h-full min-w-0 min-h-0">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
};

export default Timeseries;
