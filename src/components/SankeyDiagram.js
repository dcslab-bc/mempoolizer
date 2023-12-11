import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey } from 'd3-sankey';
import { sankeyLinkHorizontal } from 'd3-sankey';
import GoogleFontLoader from 'react-google-font-loader';
const SankeyChart = ({ data, selectedNodeId, selectedTimestamp }) => {
    const svgRef = useRef();
    const [selectedTargetNode, setSelectedTargetNode] = useState(0);
    const [timestamp, setTimestamp] = useState(0);
    const [localTimestamp, setLocalTimestamp] = useState('0');
    const infoDisplayRef = useRef(null);

    useEffect(() => {
        if (data.length > 0) {
            if (selectedNodeId == null && selectedTimestamp == null) {
                setLocalTimestamp('0');
                setTimestamp(0);
                setSelectedTargetNode(0);
            }

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
                    id: parseInt(index),
                    name: `Node ${index}`
                }));
                const links = uniqueNodes.map((value, index) => {
                    let linkValue = 0;
                    if (parseInt(index) === parseInt(selectedTargetNode)) {
                        linkValue = 0;
                    } else if (parseInt(index) === 0) {
                        linkValue = txFromNodeDetail[parseInt(selectedTargetNode)] || 0;
                    } else {
                        linkValue = txFromNodeDetail[parseInt(index)] || 0;
                    }
                    return {
                        source: parseInt(index),
                        target: selectedTargetNode,
                        value: linkValue,
                    };
                }).filter(link => link.value !== 0);
                
                const sankeyData = {
                    nodes,
                    links,
                };

                const width = 510;
                const height = 540;

                const sankey = d3Sankey()
                    .nodeWidth(30)
                    .nodePadding(10)
                    .size([width, height]);

                const { nodes: sankeyNodes, links: sankeyLinks } = sankey(sankeyData);

                const customColors = [
                    '#C9DAF8', '#AABEEA', '#8CCED1', '#B5EAD7', '#94D6A9',
                    '#F3C4E5', '#E2A9D7', '#D58BCB', '#E8D3C3', '#D1BFA3',
                    '#FDE5C2', '#FFD8A8', '#FFC28D', '#E1D888', '#C7C072',
                    '#FFB3B3', '#FF9999', '#FF7F7F', '#E3A29B', '#C78B84',
                    '#F9CB9C', '#FFD082', '#FFDD69', '#bdbcbc', '#aaabaa',
                    '#766f7a', '#55778a', '#67cdff', '#c3e7c2'
                ];
                

                const colorScale = d3.scaleOrdinal()
                                    .range(customColors);
                const svg = d3.select(svgRef.current);

                svg.selectAll('*').remove();

                const nodeGroup = svg
                    .append('g')
                    .selectAll('.node')
                    .data(sankeyNodes)
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

                nodeGroup
                    .append('rect')
                    .attr('height', (d) => d.y1 - d.y0)
                    .attr('width', sankey.nodeWidth())
                    .attr('transform', (d) => `translate(22,5)`)
                    .style('fill', (d, i) => d3.color(colorScale(i)).darker());

                nodeGroup
                    .filter((d) => d.sourceLinks.length || d.targetLinks.length)
                    .append('text')
                    .attr('x', -6)
                    .attr('y', (d) => (d.y1 - d.y0) / 2)
                    .attr('dy', '0.35em')
                    .attr('text-anchor', 'end')
                    .attr('transform', (d) => `translate(25,5)`)
                    .text((d) => `${d.id}`)
                    .on('mouseover', function (event, d) {
                        const infoHtml = `<div>${d.name}</div>`;
                        infoDisplay
                            .html(infoHtml)
                            .style('left', `${event.pageX + 10}px`)
                            .style('top', `${event.pageY + 10}px`)
                            .style('display', 'block');
                    })
                    .on('mouseout', function () {
                        infoDisplay.style('display', 'none');
                    });

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

                svg.selectAll('.link')
                    .data(sankeyLinks)
                    .enter()
                    .append('path')
                    .attr('class', 'link')
                    .attr('transform', d => `translate(22,5)`)
                    .attr('d', sankeyLinkHorizontal())
                    .attr('stroke-width', d => Math.max(1, d.width))
                    .style('fill', 'none')
                    .style('cursor', 'pointer')
                    .style('stroke', d => d3.color(colorScale(d.source.index)))
                    .on('mouseenter', (event, d) => {
                        const [x, y] = d3.pointer(event);
                        infoDisplay
                            .style('display', 'block')
                            .style('left', `${x * 2 + width}px`)
                            .style('top', `${y + 30}px`)
                            .html(`
                                <p>From: <span style="font-size: 14px; font-weight: bold">Node ${d.source.id}</span></p>
                                <p>To: <span style="font-size: 14px; font-weight: bold">Node ${d.target.id}</span></p>
                                <p>Value: <span style="font-size: 14px; font-weight: bold">${d.value}</span></p>
                            `);
                    })
                    .on('mouseleave', () => {
                        infoDisplay.style('display', 'none');
                    });
            }
        }
    }, [data, selectedTargetNode, selectedNodeId, selectedTimestamp, timestamp]);


    return (
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '10px', display: 'flex', alignItems: 'center' }}>
            <svg
                ref={svgRef}
                width={600}
                height={620}
                style={{ flex: '1', margin: '0 auto', marginTop: '5%', marginLeft: 20 }}
            />
            <GoogleFontLoader fonts={[{ font: 'Orbitron', weights: [400, 700] }]} />
            <div ref={infoDisplayRef} className="info-display" style={{ display: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '-198px', marginRight: '10px', marginTop: '-530px', lineHeight: 2 }}>
                <label style={{fontSize: 20}}>Target: <span style={{fontSize: 20, fontWeight: 'bold'}}>Node {selectedTargetNode}</span></label>
                <label style={{fontSize: 20}}>Timestamp: <span style={{fontSize: 20, fontWeight: 'bold'}}>{localTimestamp}</span></label>
            </div>
            <label style={{position: 'absolute', left: 554, top: 648, fontSize: 16}}>Node <span style={{fontWeight: 'bold'}}>{selectedTargetNode}</span></label>
            <label style={{position: 'absolute', left: 906, top: 640, width: 200, fontSize: 16}}>Timestamp: <span style={{fontWeight: 'bold'}}>{localTimestamp}</span></label>
            <label style={{position: 'absolute', width: 500, left: 970, top: -22, fontFamily: '카카오 Regular', fontSize: 14}}><b>Thickness of edges</b>: Num of incoming Txs from source nodes</label>
        </div>
    );

};

export default SankeyChart;