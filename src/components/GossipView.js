import React, { useState, useRef, useEffect} from "react";
import * as d3 from "d3";

const GossipView = (props) => {
	const [grouped, setGrouped] = useState([]);
	const svgSize = props.margin * 2 + props.size;
	const gossipSvg = useRef(null);
	const [minMax, setMinMax] = useState({min : 10000, max : 0});
	var labels = [[],[]];	

	useEffect(() => {
		d3.csv(props.data, row => {
			const allTxDetails = JSON.parse(row.tx_from_node_detail);
			
			return {
				timestamp: parseInt(row.timestamp),
				txDetails: allTxDetails,
				min: Math.min(...allTxDetails),
				max: Math.max(...allTxDetails),
			} 
		}).then((loadedData) => {
			loadedData.forEach((d) => {
				if(grouped.length == d.timestamp)
					grouped.push([d.txDetails]);
				else if(grouped[d.timestamp].length != d.txDetails.length)
					grouped[d.timestamp].push(d.txDetails);
			});
			
		
			for (var i = 0; i < grouped[0].length; i++) {
				labels[0].push(i.toString());
				labels[1].push(i.toString());
			}
			setGrouped(grouped);
    	var selectedIdx = 25;
    	const allTxDetailsFlat = grouped[selectedIdx].flatMap(d => d);
    	drawPlot(grouped[selectedIdx], d3.min(allTxDetailsFlat), d3.max(allTxDetailsFlat));
		});
	}, [props.data]); 
	const drawPlot = (grouped, min, max) => {
		if (!grouped.length) return;

		const cellSize = props.size / grouped.length;

		const colorScale = d3.scaleLinear()
			 .domain([min, max])
			 .range(['#FFFFFF', '#98A83B']);
		
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
         grouped.forEach((row, i) => {
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
	};
	return (
    <div style={{display: "flex", width: 1400, height: 400, marginTop: -80, marginLeft: -30, boxSizing: "border-box"}}>
		  <svg ref={gossipSvg} width={svgSize} height={svgSize}> </svg>
		</div>
    // <div style={{width: 400, height: 400, border: "1px solid #999"}}>GossipView Main</div>
    // <div style={{width: 1000, height: 400, border: "1px solid #999"}}>GossipView Detail</div>
	)
};

export default GossipView;