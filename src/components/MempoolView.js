import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import TxDetailView from "./TxDetailView.js";
import GossipView from "./GossipView";
import Select from 'react-select';
import SankeyChart from './SankeyDiagram.js';

let prevSelectedNodesNum = 0;
const MempoolView = ({ data, btnValue }) => {
    const svgRef = useRef();
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedNodes, setSelectedNodes] = useState(Array.from({ length: 30 }, (_, index) => index));
    const [timestampScaleMin, setTimestampScaleMin] = useState(0);
    const [timestampScaleMax, setTimestampScaleMax] = useState(0);
    const [uniqueNodeIds, setUniqueNodeIds] = useState([]);
    const [selectedTimestamp, setSelectedTimestamp] = useState(0);
    const [selectedTxs, setSelectedTxs] = useState([]);
    const [showExplanation, setShowExplanation] = useState(0);

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

    const handleQuestionMarkHover = (event) => {
        let target = event.target.id;
        switch (target) {
            case "img1":
                setShowExplanation(1);
                break;
            case "img2":
                setShowExplanation(2);
                break;
            case "img3":
                setShowExplanation(3);
                break;
            case "img4":
                setShowExplanation(4);
                break;
        }
    };

    const handleQuestionMarkLeave = () => {
        setShowExplanation(0);
    };
    useEffect(() => {
        if (!data || data.length === 0) return;
        if (selectedNodes.length !== prevSelectedNodesNum) {
            prevSelectedNodesNum = selectedNodes.length;
        } else if (btnValue == 1 && selectedNodes.length != 29) {
            handleNodeSelectChange(nodeOptions);
            prevSelectedNodesNum = nodeOptions.length;
        } else if (btnValue == 2 && selectedNodes.length != 11) {
            handleNodeSelectChange([
                {value: 1, label: 'Node 1'},
                {value: 3, label: 'Node 3'},
                {value: 8, label: 'Node 8'},
                {value: 9, label: 'Node 9'},
                {value: 10, label: 'Node 10'},
                {value: 15, label: 'Node 15'},
                {value: 16, label: 'Node 16'},
                {value: 20, label: 'Node 20'},
                {value: 21, label: 'Node 21'},
                {value: 23, label: 'Node 23'},
                {value: 27, label: 'Node 27'},
            ]);
            prevSelectedNodesNum = nodeOptions.length;
        }
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

        const colorScale = d3.scaleSequential(d3.interpolateHcl("#FFF", "#444"))
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
                d3.select(this).style('outline', '2px solid #60bcd3').style("outline-offset", "-2px").style("cursor", "pointer");
                const infoHtml = `
                    <div>Remaining TX: <span style="font-size: 14px; font-weight: bold">${d.remaining_tx}</span> TX</div>
                    <div>Missing TX: <span style="font-size: 14px; font-weight: bold">${d.missing_tx}</span> TX</div>
                    <div>TX from Client: <span style="font-size: 14px; font-weight: bold">${d.tx_from_client}</span> TX</div>
                    <div>TX from Node: <span style="font-size: 14px; font-weight: bold">${d.tx_from_node}</span> TX</div>
                `;
                infoDisplay.html(infoHtml)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`)
                    .style('display', 'block')
            })
            .on('mouseout', function () {
                infoDisplay.style('display', 'none');
                d3.select(this).style('outline', '0px solid #60bcd3');
                // d3.select(this).style("outline-width", "0px").style("outline-offset", "0px");
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
        

    }, [data, selectedNodes, timestampScaleMin, timestampScaleMax, btnValue]);

    return (
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '10px', position: 'relative', paddingTop: 4}}>
            <div class="view_label" style={{width: 150}}>Mempool TX View</div>
            <div style={{display: "flex", position: 'absolute', left: 435, top: 10}}>
                <div style={{paddingTop: 3, fontWeight: 'bold'}}>Num of TXs:&nbsp;&nbsp;</div>
                <div style={{width: 150, height: 20, background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(68,68,68,1) 100%)'}}></div>
                <div style={{position: 'absolute', left: 70, top: 16, paddingTop: 3}}>0</div>
                <div style={{position: 'absolute', left: 182, top: 17, paddingTop: 3}}>10000</div>
            </div>
            <div
                onMouseOver={handleQuestionMarkHover}
                onMouseLeave={handleQuestionMarkLeave}
                style={{
                    position: 'absolute',
                    top: '12px',
                    left: '184px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#ffffffcc',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
            >
                <img id="img1" style={{width: 20, zIndex: 1}} src="http://t1.snu.ac.kr/vis/q.png" />
                {showExplanation === 1 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 30,
                            top: 12,
                            width: 300,
                            height: 160,
                            background: '#ffffff',
                            border: '1px solid #555',
                            padding: '10px',
                            boxShadow: '0 2px 4px rgba(55, 55, 55, 0.1)',
                            zIndex: '2',
                            fontFamily: "카카오 Regular",
                            fontSize: '14px',
                            zIndex: '2',
                        }}
                    >
                        <p>Mempool TX View는 테스트 수행 시간 동안 (120초) 각 노드의 Mempool 내 TX 개수를 시각화합니다.</p>
                        <p>0개에 가까울수록 흰색을, 10K개에 가까울수록 검정색으로 표시되며, 마우스를 갖다대면 세부 지표를 보여줍니다.</p>
                        <p>이를 통해 통신이 거의 일어나지 않는 노드 (흰색), 또는 MAX 10K를 초과하여 TX 손실이 발생하는 노드를 (검정) 한 눈에 파악할 수 있습니다.</p>
                    </div>
                )}
            </div>
            <div style={{ position: "absolute", display: 'flex', alignItems: 'center', width: 180, paddingTop: 10, marginLeft: -212, marginTop: 154 }}>
                <Select
                    options={nodeOptions}
                    isMulti
                    onChange={handleNodeSelectChange}
                    value={nodeOptions.filter((option) => selectedNodes.includes(option.value))}
                />
            </div>
            <div class="view_label" style={{width: 170, marginTop: -27, marginLeft: 686}}>Sankey TX Flow View</div>
            <div
                onMouseOver={handleQuestionMarkHover}
                onMouseLeave={handleQuestionMarkLeave}
                style={{
                    position: 'absolute',
                    top: '12px',
                    left: '890px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
            >
                <img id="img2" style={{width: 20, zIndex: 1}} src="http://t1.snu.ac.kr/vis/q.png" />
                {showExplanation === 2 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 30,
                            top: 12,
                            width: 300,
                            height: 140,
                            background: '#ffffff',
                            border: '1px solid #555',
                            padding: '10px',
                            boxShadow: '0 2px 4px rgba(55, 55, 55, 0.1)',
                            zIndex: '2',
                            fontFamily: "카카오 Regular",
                            fontSize: '14px',
                            zIndex: '2'
                        }}
                    >
                        <p>Sankey TX Flow View는 가장 우측에 표시된 특정 노드로 TX가 유입되는 흐름을 보여줍니다.</p>
                        <p>마우스를 갖다대면 세부 지표를 확인할 수 있으며 선의 두께는 TX의 양을 표현합니다.</p>
                        <p>이를 통해 문제가 있는 특정 노드의 TX 흐름을 보다 빠르고 편하게 이해할 수 있습니다.</p>
                    </div>
                )}
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ position: 'absolute', width: 680, height: 650, marginLeft: -16, marginTop: -33, border: "6px solid #EEE", zIndex: -1 }}></div>
                <div style={{ position: 'relative', display: 'inline-block'}}>
                    <svg ref={svgRef} style={{ position: 'relative', display: 'inline-block', marginTop:'2%' }}></svg>
                </div>
                <div style={{ position: 'absolute', width: 680, height: 650, marginLeft: 670, marginTop: -33, border: "6px solid #EEE", zIndex: -1 }}></div>
                <SankeyChart
                    data={data}
                    selectedNodeId={selectedNode}
                    selectedTimestamp={selectedTimestamp}
                />
            </div>
            <div class="view_label" style={{width: 120, marginTop: -17, marginLeft: 0}}>TX Detail View</div>
            <div
                onMouseOver={handleQuestionMarkHover}
                onMouseLeave={handleQuestionMarkLeave}
                style={{
                    position: 'absolute',
                    top: '668px',
                    left: '154px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
            >
                <img id="img3" style={{width: 20, zIndex: 1}} src="http://t1.snu.ac.kr/vis/q.png" />
                {showExplanation === 3 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 30,
                            top: 12,
                            width: 300,
                            height: 178,
                            background: '#ffffff',
                            border: '1px solid #555',
                            padding: '10px',
                            boxShadow: '0 2px 4px rgba(55, 55, 55, 0.1)',
                            zIndex: '2',
                            fontFamily: "카카오 Regular",
                            fontSize: '14px',
                            zIndex: '2'
                        }}
                    >
                        <p>TX Detail View는 선택된 특정 노드에 대한 각 TX 타입들에 대한 상세 정보를 시각화합니다.</p>
                        <p>tx_from_client는 지갑과 같은 특정 Client에서 송신한 TX를 의미하며, tx_from_node는 다른 노드로부터 broadcast된 TX를 의미합니다.</p>
                        <p>이를 통해 문제가 있는 특정 노드에서 어떤 타입의 TX가 장애를 유발하는지 파악할 수 있습니다. (보다 직관적인 경향 파악을 위해 3초 동안의 평균값으로 스무딩 처리)</p>
                    </div>
                )}
            </div>
            <div class="view_label" style={{width: 150, marginTop: -27, marginLeft: 686}}>Gossip Status View</div>
            <div
                onMouseOver={handleQuestionMarkHover}
                onMouseLeave={handleQuestionMarkLeave}
                style={{
                    position: 'absolute',
                    top: '668px',
                    left: '870px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
            >
                <img id="img4" style={{width: 20, zIndex: 1}} src="http://t1.snu.ac.kr/vis/q.png" />
                {showExplanation === 4 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 30,
                            top: 12,
                            width: 300,
                            height: 194,
                            background: '#ffffff',
                            border: '1px solid #555',
                            padding: '10px',
                            boxShadow: '0 2px 4px rgba(55, 55, 55, 0.1)',
                            zIndex: '2',
                            fontFamily: "카카오 Regular",
                            fontSize: '14px',
                            zIndex: '2'
                        }}
                    >
                        <p>Gossip Status View는 특정 시점 기준으로 Node 사이에 Gossip 프로토콜을 통해 주고 받는 TX의 양을 시각화합니다. (bi-directional between nodes)</p>
                        <p>왼편 y축은 TX 송신자 노드를 나타내고 상단 x축은 TX 수신자 노드를 나타내며, 마우스를 갖다대면 세부 지표를 확인할 수 있습니다.</p>
                        <p>이를 통해 TX를 제대로 보내지 못하는 문제 소지가 있는 노드를 한 눈에 식별할 수 있게 됩니다. (예시: 아래 쪽에 거의 흰색으로 채워져 있는 노드들)</p>
                    </div>
                )}
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ position: 'absolute', width: 680, height: 590, marginLeft: -16, marginTop: -33, border: "6px solid #EEE", zIndex: -1 }}></div>
                {selectedNode && <TxDetailView data={data} selectedNode={selectedNode} />}
                <div style={{ position: 'absolute', width: 680, height: 590, marginLeft: 670, marginTop: -33, border: "6px solid #EEE", zIndex: -1 }}></div>
                <GossipView
                    size={530}
                    margin={92}
                    data={selectedTxs}
                    selectedTimestamp={selectedTimestamp}
                    selectedNode={selectedNode}
                />
            </div>
        </div>
      );
  };
  

export default MempoolView;
