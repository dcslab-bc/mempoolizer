import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey } from 'd3-sankey';
import { sankeyLinkHorizontal } from 'd3-sankey';

const SankeyChart = ({ data, selectedNodeId, selectedTimestamp }) => {
    const svgRef = useRef();
    const [selectedTargetNode, setSelectedTargetNode] = useState(0);
    const [timestamp, setTimestamp] = useState(0);
    const [localTimestamp, setLocalTimestamp] = useState('0');

    useEffect(() => {
        if (data.length > 0) {
            if (selectedNodeId !== null && selectedTimestamp !== null) {
                setLocalTimestamp(selectedTimestamp);
                setTimestamp(selectedTimestamp);
                setSelectedTargetNode(parseInt(selectedNodeId));
            }
            const timestampData = data.find(entry => entry.timestamp === timestamp);
            if (timestampData) {
                const txFromNodeDetail = JSON.parse(timestampData.tx_from_node_detail);
                const uniqueNodes = Array.from({ length: 29 });
                const nodes = uniqueNodes.map((_, index) => ({
                    id: index,
                    name: `Node ${index}`,
                }));
                const links = uniqueNodes.map((value, index) => ({
                    source: index,
                    target: selectedTargetNode,
                    value: index === selectedTargetNode || index === 0 ? 0 : txFromNodeDetail[index],
                })).filter(link => link.value !== 0);
                const sankeyData = {
                    nodes,
                    links,
                };

                const width = 660
                const height = 500;

                const sankey = d3Sankey()
                    .nodeWidth(30)
                    .nodePadding(10)
                    .size([width, height]);

                const { nodes: sankeyNodes, links: sankeyLinks } = sankey(sankeyData);


                const colorScale = d3.scaleOrdinal([`#ffd24d`, `#aa7f5e`, `#774c22`, `#fee998`, `#c1a03f`, `#5c641f`, `#bad1c5`, `#7cafd0`, `#98d3f1`, `#b7d6c7`, `#dfc768`, `#eeefba`, `#e9d760`, `#ffd24d`, `#c07e3c`, `#d0cd92`, `#766d0c`, `#e79343`, `#e2e1c5`]); const svg = d3.select(svgRef.current);

                svg.selectAll('*').remove();

                const nodeGroup = svg.append('g').selectAll('.node')
                    .data(sankeyNodes)
                    .enter().append('g')
                    .attr('class', 'node')
                    .attr('transform', d => `translate(${d.x0},${d.y0})`);

                const infoDisplay = d3.select('body')
                    .append('div')
                    .attr('class', 'info-display')
                    .style('display', 'none')
                    .style('position', 'absolute')
                    .style('pointer-events', 'none')
                    .style('padding', '10px')
                    .style('background-color', '#fff')
                    .style('border', '1px solid #ccc');

                const infoDisplayUpdate = d3.selectAll('.info-display');
                infoDisplayUpdate.style('display', 'none');

                nodeGroup.append('rect')
                    .attr('height', d => d.y1 - d.y0)
                    .attr('width', sankey.nodeWidth())
                    .style('fill', (d, i) => d3.color(colorScale(i)).darker())
                    .on('mouseover', function (event, d) {
                        const infoHtml = `
                            <div>${d.name}</div>
                        `;
                        infoDisplay.html(infoHtml)
                            .style('left', `${event.pageX + 10}px`)
                            .style('top', `${event.pageY + 10}px`)
                            .style('display', 'block');
                    })
                    .on('mouseout', function () {
                        infoDisplay.style('display', 'none');
                    });;

                svg.append('g').selectAll('.link')
                    .data(sankeyLinks)
                    .enter().append('path')
                    .attr('class', 'link')
                    .attr('d', sankeyLinkHorizontal())
                    .attr('stroke-width', d => Math.max(1, d.width))
                    .style('fill', 'none')
                    .style('stroke', d => d3.color(colorScale(d.source.index)));
            }

        }
    }, [data, selectedTargetNode, selectedNodeId, selectedTimestamp, timestamp]);


    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '-4%', marginBottom: '7%' }}>
                <label style={{ margin: "8px" }}>Target Node : Node {selectedTargetNode} </label>
                <label style={{ margin: "8px" }}>Timestamp : {localTimestamp}</label>
            </div>
            <svg
                ref={svgRef}
                width={660}
                height={600}
                style={{ display: 'block', margin: '0 auto' }} // Center the SVG
            />
        </div>
    );

};

export default SankeyChart;