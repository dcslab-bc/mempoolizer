import React, { useState, useRef, useEffect} from "react";
import * as d3 from "d3";

const GossipView = (props) => {
	const svgSize = props.margin * 2 + props.size;
	const gossipSvg = useRef(null);


	useEffect(() => {
		console.log(props.selectedNode);
		if (!props.data || !props.selectedTimestamp || props.data.length === 0) return;
		
		const data = props.data;
		const timestamp = parseInt(props.selectedTimestamp);
		
		const allTxDetailsFlat = data[timestamp].flatMap(d => d);
		const min = d3.min(allTxDetailsFlat);
		const max = d3.max(allTxDetailsFlat);

		const colorScale = d3.scaleLinear()
			 .domain([min, max])
			 .range(['#FFFFFF','#333333']);
		
		let labels = createCoordinateLabels(data[timestamp].length);
		const result = reorderMatrixWithValueAndLabels(data[timestamp], labels);
		var orderedData = result.reorderedValues;
		var orderedLabels = extractRowAndColumnLabels(result.reorderedLabels);
		

		const cellSize = props.size / data[timestamp].length;

		const svg = d3.select(gossipSvg.current);
		svg.selectAll('*').remove(); 
	
		const plotGroup = svg.append('g').attr('transform', `translate(${props.margin}, ${props.margin})`);
	
		plotGroup.selectAll('.row-label')
				.data(orderedLabels[0])
				.enter()
				.append('text')
				.style('fill', d => d === props.selectedNode ? 'red' : 'black')
				.attr('class', 'row-label')
				.attr('x', 0)
				.attr('y', (d, i) => i * cellSize + cellSize / 2)
				.attr('dy', '.35em')
				.style('text-anchor', 'end')
				.text(d => d);

		plotGroup.selectAll('.col-label')
				.data(orderedLabels[1])
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

		orderedData.forEach((row, i) => {
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
							tooltip.select('text').text(`(${orderedLabels[0][i]}, ${orderedLabels[1][j]}) Value: ${cell}`);
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
	}, [props.data, props.selectedTimestamp, props.selectedNode]); 
	function createCoordinateLabels(matrixSize) {
		let labels = new Array(matrixSize);
		for (let i = 0; i < matrixSize; i++) {
			labels[i] = new Array(matrixSize);
			for (let j = 0; j < matrixSize; j++) {
				labels[i][j] = `(${i},${j})`;
			}
		}
		return labels;
	}
	function reorderMatrixWithValueAndLabels(matrix, labels) {
		// Calculate the sum of each row
		let rowSums = matrix.map(row => row.reduce((a, b) => a + b, 0));
	
		// Create an array of row indices sorted by the computed sums in descending order
		let sortedRowIndices = rowSums
			.map((sum, index) => ({ sum, index }))
			.sort((a, b) => b.sum - a.sum)
			.map(pair => pair.index);
	
		// Reorder the rows of the matrix and labels based on the sorted indices
		let reorderedValues = sortedRowIndices.map(index => matrix[index]);
		let reorderedLabels = sortedRowIndices.map(index => labels[index]);
	
		return { reorderedValues, reorderedLabels };
	}
	function extractRowAndColumnLabels(reorderedLabels) {
		let rowLabels = reorderedLabels.map(row => row[0].match(/\((\d+),/)[1]);
		let columnLabels = reorderedLabels[0].map(label => label.match(/,(\d+)\)/)[1]);
		let labelsArray = [rowLabels, columnLabels];
		return labelsArray;
	}


	return (
		<div style={{display: "flex", width: 1400, height: 400, marginTop: -70, marginLeft: -75, boxSizing: "border-box"}}>
		  <svg ref={gossipSvg} width={svgSize} height={svgSize}> </svg>
		</div>
    // <div style={{width: 400, height: 400, border: "1px solid #999"}}>GossipView Main</div>
    // <div style={{width: 1000, height: 400, border: "1px solid #999"}}>GossipView Detail</div>
	)
};

export default GossipView;