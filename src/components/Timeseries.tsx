import React, { useEffect, useRef, useContext } from 'react';
import * as d3 from 'd3';
import { DataContext } from '../DataContext';

const Timeseries: React.FC = () => {
  const context = useContext(DataContext);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (context && context.figureInfo && ref.current) {
      const { figureInfo, selectedYears, setSelectedYears } = context;
  const yearlyCounts = d3.rollup(figureInfo, v => v.length, (d: any) => d.Year);
      const data = Array.from(yearlyCounts, ([key, value]) => ({ year: key, count: value })).sort((a, b) => d3.ascending(a.year, b.year));

      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 400 - margin.left - margin.right;
      const height = 200 - margin.top - margin.bottom;

      const xDomain = d3.range(
        d3.min(data, d => +d.year) as number,
        (d3.max(data, d => +d.year) as number) + 1
      ).map(String);

      const x = d3.scaleBand()
        .domain(xDomain)
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) as number])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      const bars = svg.append("g")
        .attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.year) as number)
        .attr("y", d => y(d.count))
        .attr("height", d => y(0) - y(d.count))
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
  }, [context]);

  return (
    <svg ref={ref} width={400} height={200}></svg>
  );
};

export default Timeseries;
