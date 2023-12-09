import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Mainplot = ({ data, selectedNode }) => {
	selectedNode = parseInt(selectedNode);
	const chartRef = useRef();

	useEffect(() => {
		if (data && chartRef.current && selectedNode !== null && selectedNode !== undefined) {
			const filteredData = data.filter(d => parseInt(d.node_id) === selectedNode);

			const groupedData = [];
			let i = 0;
			for (i = 0; i < filteredData.length - 2; i++) {
				const averageClient = parseInt((filteredData[i].tx_from_client + filteredData[i+1].tx_from_client + filteredData[i+2].tx_from_client) / 3);
				const averageNode = parseInt((filteredData[i].tx_from_node + filteredData[i+1].tx_from_node + filteredData[i+2].tx_from_node) / 3);
				groupedData.push({ timestamp: i, node_id: filteredData[i].node_id, incoming_tx: filteredData[i].incoming_tx, tx_from_client: averageClient, tx_from_node: averageNode});
			}
			groupedData.push({ timestamp: i, node_id: filteredData[i].node_id, incoming_tx: filteredData[i].incoming_tx, tx_from_client: filteredData[i].tx_from_client, tx_from_node: filteredData[i].tx_from_node});
			groupedData.push({ timestamp: ++i, node_id: filteredData[i].node_id, incoming_tx: filteredData[i].incoming_tx, tx_from_client: filteredData[i].tx_from_client, tx_from_node: filteredData[i].tx_from_node});
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

			const x = d3.scaleLinear().domain([1, groupedData.length]).range([0, width]);

			const maxYValue = d3.max(groupedData, d => parseInt(d.incoming_tx));
			const y = d3.scaleLinear().domain([0, maxYValue]).nice().range([height, 0]);

			const line = d3.line()
			.x((d, i) => x(i + 1))
			.y(d => y(d.value))
			.curve(d3.curveCatmullRom.alpha(0.5));

			keys.forEach((key, index) => {
				svg.append('path')
				  .datum(groupedData.map((d, i) => ({ index: i, value: parseInt(d[key]) })))
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
				.append('div').style('display', 'flex')
				.style('margin-top', '-530px')
				.style('margin-left', '400px');

			keys.forEach((key) => {
				const legendItem = legend.append('div').style('display', 'flex').style('align-items', 'center');
				legendItem.append('div')
					.style('width', '18px')
					.style('height', '18px')
					.style('background-color', color(key))
					.style('margin-left', '15px')
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
					  x.domain([1, groupedData.length]);
					} else {
					  const [x0, x1] = event.selection.map(x.invert);
					  const start = Math.max(0, Math.ceil(x0));
					  const end = Math.min(groupedData.length, Math.floor(x1));
				  
					  x.domain([start, end]);
				  
					  keys.forEach((key) => {
						const newData = groupedData.slice(start - 1, end);
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
	return <div ref={chartRef} style={{marginTop: 50, marginLeft: -10}}></div>;
};

export default Mainplot;
