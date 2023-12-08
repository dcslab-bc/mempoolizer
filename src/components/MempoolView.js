import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Mainplot from "./Mainplot2.js";
import GossipView from "./GossipView";
import Select from 'react-select';
import SankeyChart from './SankeyDiagram.js';

const MempoolView = ({ data }) => {
    const svgRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedNodes, setSelectedNodes] = useState(Array.from({ length: 30 }, (_, index) => index));
    const [timestampScaleMin, setTimestampScaleMin] = useState(0);
    const [timestampScaleMax, setTimestampScaleMax] = useState(0);
    const [uniqueNodeIds, setUniqueNodeIds] = useState([]);
    const [selectedTimestamp, setSelectedTimestamp] = useState(0);
    const [selectedTxs, setSelectedTxs] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleQuestionMarkHover = (event) => {
        setShowExplanation(true);
    };

    const handleQuestionMarkLeave = () => {
        setShowExplanation(false);
    };

    const handleTickClick = (nodeId, timestamp) => {
        setSelectedNode(`${nodeId}`);
        setSelectedTimestamp(timestamp);
    };

    const nodeOptions = uniqueNodeIds.map((nodeId) => ({
        value: nodeId,
        label: `Node ${nodeId}`,
    }));

    const handleNodeSelectChange = (selectedOptions) => {
        setSelectedNodes(selectedOptions.map((option) => option.value));
        const infoDisplay = d3.selectAll('info-display');
        infoDisplay.style('display', 'none');
    };

    useEffect(() => {
        if (!data || data.length === 0) return;

        const uniqueIds = Array.from(new Set(data.map((d) => d.node_id)));
        setUniqueNodeIds(uniqueIds);

        const timestamps = Array.from(new Set(data.map((d) => parseInt(d.timestamp))));
        const minTimestamp = d3.min(timestamps);
        const maxTimestamp = d3.max(timestamps);
        setTimestampScaleMin(minTimestamp);
        setTimestampScaleMax(maxTimestamp);

        d3.select(svgRef.current).selectAll('*').remove();

        const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        const width = 685 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const filteredData = data.filter(
            (d) => selectedNodes.includes(d.node_id) && parseInt(d.timestamp) >= timestampScaleMin && parseInt(d.timestamp) <= timestampScaleMax
        );

        const xScale = d3.scaleBand()
            .domain(timestamps)
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleBand()
            .domain(filteredData.map(d => parseInt(d.node_id)))
            .range([0, height])
            .padding(0.1);

        const colorScale = d3.scaleSequential(d3.interpolateHcl("#FFFFFF", "#333333"))
            .domain([0, d3.max(filteredData, d => parseInt(d.remaining_tx))]);
        const infoDisplay = d3.select('body')
            .append('div')
            .attr('class', 'info-display')
            .style('display', 'none')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('padding', '10px')
            .style('background-color', '#fff')
            .style('border', '1px solid #ccc')
            .style('font-family', 'Orbitron, sans-serif')
            .style('font-size', '10px');

        const infoDisplayUpdate = d3.selectAll('.info-display');
        infoDisplayUpdate.style('display', 'none');


        svg.selectAll('.bar')
            .data(filteredData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .on('click', (event, d) => {
                handleTickClick(d.node_id, d.timestamp);
            })
            .attr('x', d => xScale(parseInt(d.timestamp)) - 1)
            .attr('y', d => yScale(parseInt(d.node_id)) - 1)
            .attr('width', xScale.bandwidth() + 2)
            .attr('height', yScale.bandwidth() + 2)
            .attr('fill', d => colorScale(parseInt(d.remaining_tx)))
            .on('mouseover', function (event, d) {
                d3.select(this).attr('stroke', 'red').attr('stroke-width', 2);
                const infoHtml = `
                    <div>Remaining TX: ${d.remaining_tx} TX</div>
                    <div>Missing TX: ${d.missing_tx} TX</div>
                    <div>TX from Client: ${d.tx_from_client} TX</div>
                    <div>TX from Node: ${d.tx_from_node} TX</div>
                `;
                infoDisplay.html(infoHtml)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`)
                    .style('display', 'block')
            })
            .on('mouseout', function () {
                infoDisplay.style('display', 'none');
                d3.select(this).attr('stroke', 'none').attr('stroke-width', 2);
            });

        svg.selectAll('.x-axis').remove();
        svg.selectAll('.y-axis').remove();
        svg.append('g').attr('class', 'x-axis')
            .style('font-family', 'Orbitron, sans-serif')
            .style('font-size', '10px')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickValues(xScale.domain().filter((_, i) => i % 5 === 0))
                .tickFormat((d) => `${d}s`)
            ).selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append('g').attr('class', 'y-axis')
            .style('font-family', 'Orbitron, sans-serif')
            .style('font-size', '8px')
            .call(d3.axisLeft(yScale).tickFormat((d, i) => `Node ${d}`));
        var groupedTx = [];
        data.forEach((d) => {
            let timestamp = parseInt(d.timestamp);
            if(groupedTx.length === timestamp)
                groupedTx.push([JSON.parse(d.tx_from_node_detail)]);
            else
                groupedTx[timestamp].push(JSON.parse(d.tx_from_node_detail));
        });
        setSelectedTxs(groupedTx);
        

    }, [data, selectedNodes, timestampScaleMin, timestampScaleMax]);

    return (
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '10px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ margin: '8px' }}>Nodes</label>
                <Select
                    options={nodeOptions}
                    isMulti
                    onChange={handleNodeSelectChange}
                    value={nodeOptions.filter((option) => selectedNodes.includes(option.value))}
                />
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <svg ref={svgRef} style={{ position: 'relative', display: 'inline-block', marginTop:'2%' }}></svg>
                    <div
                        onMouseOver={handleQuestionMarkHover}
                        onMouseLeave={handleQuestionMarkLeave}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '-7px',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: '#ffffffcc',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            zIndex: '999',
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>?</span>
                    </div>
                    {showExplanation && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '50px',
                                right: '20px',
                                background: '#ffffff',
                                border: '1px solid #000',
                                padding: '10px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                zIndex: '999',
                                fontSize: '12px',
                            }}
                        >
                            Explanation of the graph...
                        </div>
                    )}
                </div>
                <SankeyChart
                    style={{ position: 'relative', display: 'inline-block', marginLeft: '20px' }}
                    data={data}
                    selectedNodeId={selectedNode}
                    selectedTimestamp={selectedTimestamp}
                />
            </div>
          <div style={{ display: 'flex' }}>
            {selectedNode && <Mainplot data={data} selectedNode={selectedNode} />}
            <GossipView
                // size={860}
                size={530}
                margin={70}
                data={selectedTxs}
                selectedTimestamp={selectedTimestamp}
              />
          </div>
        </div>
      );
  };
  

export default MempoolView;
