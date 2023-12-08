import React, { useState, useRef, useEffect} from "react";
import * as d3 from "d3";

const GossipView = (props) => {
	const svgSize = props.margin * 2 + props.size;
	const gossipSvg = useRef(null);


	useEffect(() => {

		if (!props.data || !props.selectedTimestamp || props.data.length === 0) return;
		
		const data = props.data;
		const timestamp = parseInt(props.selectedTimestamp);
		
		const allTxDetailsFlat = data[timestamp].flatMap(d => d);
		const min = d3.min(allTxDetailsFlat);
		const max = d3.max(allTxDetailsFlat);
		console.log(min, max);
		const colorScale = d3.scaleLinear()
			 .domain([min, max])
			 .range(['#333333','#FFFFFF']);
		
		var labels = [[],[]];	
		for (var i = 0; i < data[timestamp].length; i++) {
			labels[0].push(i.toString());
			labels[1].push(i.toString());
		}

		const cellSize = props.size / data[timestamp].length;

		const svg = d3.select(gossipSvg.current);
		svg.selectAll('*').remove(); 
	
		const plotGroup = svg.append('g').attr('transform', `translate(${props.margin}, ${props.margin})`);
	
		plotGroup.selectAll('.row-label')
				.data(labels[0])
				.enter()
				.append('text')
				.attr('class', 'row-label')
				.attr('x', 0)
				.attr('y', (d, i) => i * cellSize + cellSize / 2)
				.attr('dy', '.35em')
				.style('text-anchor', 'end')
				.text(d => d);

		plotGroup.selectAll('.col-label')
				.data(labels[1])
				.enter()
				.append('text')
				.attr('class', 'col-label')
				.attr('x', (d, i) => i * cellSize + cellSize / 2)
				.attr('y', 0)
				.style('text-anchor', 'middle')
				.text(d => d);
				const tooltip = plotGroup.append('g')
				.style('display', 'none');

		tooltip.append('rect')
				.attr('width', 150) 
				.attr('height', 40) 
				.attr('fill', 'white')
				.attr('stroke', 'black');
		tooltip.append('text')
				.attr('x', 10)
				.attr('y', 20)

		var selected;
		data[timestamp].forEach((row, i) => {
			row.forEach((cell, j) => {
				plotGroup.append('rect')
						.attr('x', j * cellSize)
						.attr('y', i * cellSize)
						.attr('width', cellSize)
						.attr('height', cellSize)
						.attr('fill', colorScale(cell))
						.on('mouseover', (event) => {
							selected = d3.select(event.target).attr('stroke', 'red');
							const [x, y] = d3.pointer(event, svg.node());
							tooltip.select('text').text(`(${i}, ${j}) Value: ${cell}`);
							tooltip.attr('transform', `translate(${x -140}, ${y - 110})`);
							tooltip.style('display', 'block');
							tooltip.raise();
						})
						.on('mouseout', () => {
							selected.attr('stroke', 'none');
							tooltip.style('display', 'none');
						});
			});
		});
	}, [props.data, props.selectedTimestamp]); 
	return (
    <div style={{display: "flex", width: 1400, height: 400, marginTop: -80, marginLeft: -30, boxSizing: "border-box"}}>
		  <svg ref={gossipSvg} width={svgSize} height={svgSize}> </svg>
		</div>
    // <div style={{width: 400, height: 400, border: "1px solid #999"}}>GossipView Main</div>
    // <div style={{width: 1000, height: 400, border: "1px solid #999"}}>GossipView Detail</div>
	)
};

export default GossipView;