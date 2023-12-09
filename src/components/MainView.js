import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import MempoolView from "./MempoolView";
import json_data from "../data/data.json";

const Mainplot = () => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [nodeSelectionMode, setNodeSelectionMode] = useState(0);
  const buttonData = [
    { text: "Show All", id: "showAllBtn" },
    { text: "Show Abnormal", id: "showAbnormalBtn" }
  ];
  function createButtons() {
    const container = d3.select("#buttonContainer");
    container.selectAll("button")
      .data(buttonData)
      .enter()
      .append("button")
      .style("font-family", "카카오 Regular")
      .style("font-size", "12px")
      .style("margin-top", "4px")
      .style("margin-left", "8px")
      .style("margin-right", "4px")
      .attr("id", d => d.id)
      .text(d => d.text);
  }
  /*
  async function getFile() {
    let fileHandle;
    const pickerOpts = {
      types: [{
        description: "CSV",
        accept: {
          "image/*": [".csv"]
        },
      },],
      excludeAcceptAllOption: true,
      multiple: false,
    };
    [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  }
  */

  const handleQuestionMarkHover = (event) => {
      setShowExplanation(true);
  };

  const handleQuestionMarkLeave = () => {
      setShowExplanation(false);
  };

  const handleButtons = (event) => {
      if (event.target.id === "showAllBtn") {
          setNodeSelectionMode(1);
      } else if (event.target.id === "showAbnormalBtn") {
          setNodeSelectionMode(2);
      }
  };
  useEffect(() => {
    createButtons();
    // File Drag and Drop Event Processing
    var dropArea = document.getElementById('drop_area');
    dropArea.addEventListener('click', async () => {
      const loading = document.getElementById('loading');
      loading.style.display = 'block';
      setTimeout(function () {
        loading.style.display = 'none';
        document.querySelector('#intro_view').style.display = "none";
      }, 1000);
        // const fileHandle = await window.showOpenFilePicker();
        // const file = await fileHandle.getFile();
        // console.log('선택한 파일:', file.name);
    });
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.border = '2px dashed #333';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.border = '2px dashed #ccc';
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.border = '2px dashed #ccc';
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
        setTimeout(function () {
          loading.style.display = 'none';
          document.querySelector('#intro_view').style.display = "none";
        }, 1000);
        // getFile()
        // dropArea.style.border = '2px dashed #ccc';
        // var file = e.dataTransfer.files[0];
        // d3.csv(file, (data) => {
        //   // 'data' has a row in the CSV file        
        // });
    setNodeSelectionMode(0);
    });
  }, [nodeSelectionMode]);
  return (
    <div style={{display: "flex"}}>
      <div id="intro_view" style={{zIndex: 9999, display: "block", position: "absolute", left: 0, top: 0, width: "100%", height: "1300px", margin: 0, background: "#FFF", overflow: "hidden"}}> 
        <h3 style={{textAlign: "center", fontSize: 30}}>Mempoolizer</h3>
        <div id="drop_area" style={{width: 1100, height: 320, cursor: "pointer", background: "#FFDB88", border: "1px solid #DDD", textAlign: "center", padding: 20, margin: "auto"}}>
          <div id="drop_image"><img src="http://t1.snu.ac.kr/vis/csv.png" alt="drop icon" style={{width: 1000}}/></div>
        </div>
        <div style={{textAlign: "center"}}>
          <div style={{color: "rgb(242, 139, 48)", marginTop: 30, marginBottom: 15, fontSize: 30}}>Sample Datasets</div>
          <img src="http://t1.snu.ac.kr/vis/mempool_icon.png" style={{width: 120}} alt="mempool icon"/>
          <div style={{color: "rgb(100, 100, 100)", marginTop: 10, marginBottom: 10, fontSize: 20}}>Tendermint Mempool Datasets</div>
          <a href="http://t1.snu.ac.kr/vis/data.csv"><img id="download_btn" src="http://t1.snu.ac.kr/vis/b1.png" alt="download button"/></a>
        </div>
      </div>
      <div id="loading">
        <div class="spinner"></div>
      </div>
      <div id="profile_view" style={{width: 200, height: 1248, marginRight: 10, paddingLeft: 10, border: "6px solid #EEE"}}>
        <div class="view_label" style={{marginTop: -1}}>Profile View</div>
        <div style={{fontSize: 12, fontFamily: "카카오 Regular, Calibri", lineHeight: "18px", color: "#555", marginTop: 8}}>
          <b>DataSet</b>:<br /><img src="http://t1.snu.ac.kr/vis/file.png" style={{width: 12, height: 12, marginLeft: 4, marginRight: 2, marginBottom: -2}} alt="file icon"/><div style={{display: "inline-block", marginBottom: 6}}>cosmos_231209.csv (1.25MB)</div><br />
          <b>Blockchain System</b>:<br /><div style={{display: "inline-block", marginBottom: 6}}>Reapchain</div>&nbsp;(<a href="https://reapchain.com/">https://reapchain.com)</a><br />
          <b>Num of Nodes</b>:<br /><div style={{display: "inline-block", marginBottom: 6}}>29 (Standing 14, Steering 15)</div> <br />
          <div id="buttonContainer" onClick={handleButtons}></div>
        </div>
        <div
            onMouseOver={handleQuestionMarkHover}
            onMouseLeave={handleQuestionMarkLeave}
            style={{
                position: 'absolute',
                top: '56px',
                left: '148px',
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
          <img style={{width: 20, zIndex: 1}} src="http://t1.snu.ac.kr/vis/q.png" alt="question tooltip" />
          {showExplanation && (
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
                      fontFamily: "카카오 Regular",
                      fontSize: '14px',
                      zIndex: 2,
                  }}
              >
                  <p>Profile View는 본 시각화 도구의 기본적인 환경정보 및 활성화된 노드 리스트를 보여줍니다.</p>
                  <p>Show All 버튼은 29개 모든 노드를 보여주며, Show Abnormal 버튼은 장애가 의심되는 노드를 보여줍니다.</p>
                  <p>각 노드는 우측 X 버튼을 통해 삭제 및 펼침 버튼을 통해 자유롭게 추가할 수 있습니다.</p>
              </div>
          )}
        </div>
      </div>
      <div style={{width: 1000}}>
        <MempoolView
          data={json_data}
          btnValue={nodeSelectionMode}
        />
      </div>
    </div>
	)
};

export default Mainplot;
