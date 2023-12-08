import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Mainplot = ({ data, selectedNode }) => {
	selectedNode = parseInt(selectedNode);
	const chartRef = useRef();

	useEffect(() => {
		if (data && chartRef.current && selectedNode !== null && selectedNode !== undefined) {
			const filteredData = data.filter(d => parseInt(d.node_id) === selectedNode);
			const margin = { top: 20, right: 50, bottom: 60, left: 50 };
			const width = 710 - margin.left - margin.right;
			const height = 500 - margin.top - margin.bottom;

			d3.select(chartRef.current).selectAll('*').remove();

			const svg = d3
				.select(chartRef.current)
				.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`);

			const keys = ['tx_from_client', 'tx_from_node'];
			const color = d3.scaleOrdinal().domain(keys).range([ '#044c7c', '#45b6c2']);

			const x = d3.scaleLinear().domain([1, filteredData.length]).range([0, width]);

			const maxYValue = d3.max(filteredData, d => parseInt(d.incoming_tx));
			const y = d3.scaleLinear().domain([0, maxYValue]).nice().range([height, 0]);

			const line = d3
			.line()
			.x((d, i) => x(i + 1))
			.y(d => y(d.value));

			keys.forEach((key, index) => {
				svg.append('path')
				  .datum(filteredData.map((d, i) => ({ index: i, value: parseInt(d[key]) })))
				  .attr('fill', 'none')
				  .attr('stroke', color(key))
				  .attr('stroke-width', 2) 
				  .attr('d', line)
				  .attr('opacity', index === keys.length - 1 ? 0.8 : 1)
				  .attr('class', `line-${key}`);
			  });

			svg.append('g')
				.attr('class', 'x-axis')
			  	.attr('transform', `translate(0,${height})`)
			  	.style('font-family', 'Orbitron, sans-serif')
			  	.call(d3.axisBottom(x));

		  	svg.append('g')
			  	.attr('class', 'y-axis')
			  	.style('font-family', 'Orbitron, sans-serif')
			  	.call(d3.axisLeft(y));

			const legend = d3.select(chartRef.current)
				.append('div');

			keys.forEach((key) => {
				const legendItem = legend.append('div').style('display', 'flex').style('align-items', 'center');
				legendItem.append('div')
					.style('width', '18px')
					.style('height', '18px')
					.style('background-color', color(key))
					.style('margin-right', '5px')
					.style('font-family', 'Orbitron, sans-serif')


				legendItem.append('div').text(key);
			});

			svg.attr('opacity', 0)
				.transition()
				.duration(1500)
				.attr('opacity', 1);

			const brush = d3.brushX()
				.extent([[0, 0], [width, height]])
				.on('end', brushed);

			const brushGroup = svg.append('g')
				.attr('class', 'brush')
				.call(brush);

				function brushed(event) {
					if (!event.selection) {
					  x.domain([1, filteredData.length]);
					} else {
					  const [x0, x1] = event.selection.map(x.invert);
					  const start = Math.max(0, Math.ceil(x0));
					  const end = Math.min(filteredData.length, Math.floor(x1));
				  
					  x.domain([start, end]);
				  
					  keys.forEach((key) => {
						const newData = filteredData.slice(start - 1, end);
						const updatedLine = d3.line()
						  .x((d, i) => x(i + start))
						  .y(d => y(d[key]));
				  
						svg.select(`.line-${key}`)
						  .attr('d', updatedLine(newData));
					  });
				  
					  svg.select('.x-axis')
						.call(d3.axisBottom(x));
				  
					  brushGroup.call(brush.move, null);
					}
				  }
				  
				
				
				
				
			brushGroup.select('.overlay')
				.attr('fill', 'none')
				.attr('pointer-events', 'all');

			brushGroup.selectAll('.handle')
				.attr('fill', '#666')
				.attr('fill-opacity', 0.8);
		}
	}, [data, selectedNode]);
	return <div ref={chartRef}></div>;
};

export default Mainplot;
