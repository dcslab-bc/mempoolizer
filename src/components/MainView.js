import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import MempoolView from "./MempoolView";
import json_data from "../data/data.json";

const Mainplot = (props) => {
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
  function showNodeList() {
    document.querySelector("#profile_view").appendChild("div");
  }
  useEffect(() => {
    // File Drag and Drop Event Processing
    var dropArea = document.getElementById('drop_area');
    dropArea.addEventListener('click', async () => {
      alert("Awesome! data.csv has been handled. Let's go into the data.")
      document.querySelector('#intro_view').style.display = "none";
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
        alert("Awesome! data.csv has been handled. Let's go into the data.")
        document.querySelector('#intro_view').style.display = "none";
        // getFile()
        // dropArea.style.border = '2px dashed #ccc';
        // var file = e.dataTransfer.files[0];
        // d3.csv(file, (data) => {
        //   // 'data' has a row in the CSV file        
        // });
    });
  });
  return (
    <div style={{display: "flex"}}>
      <div id="intro_view" style={{zIndex: 9, display: "block", position: "absolute", left: 0, top: 0, width: "100%", height: "1300px", margin: 0, background: "#FFF", overflow: "hidden"}}> 
        <h3 style={{textAlign: "center", fontSize: 30}}>Mempoolizer</h3>
        <div id="drop_area" style={{width: 1100, height: 320, cursor: "pointer", background: "#FFDB88", border: "1px solid #DDD", textAlign: "center", padding: 20, margin: "auto"}}>
          <div id="drop_image"><img src="http://t1.snu.ac.kr/vis/csv.png" style={{width: 1000}}/></div>
        </div>
        <div style={{textAlign: "center"}}>
          <div style={{color: "rgb(242, 139, 48)", marginTop: 30, marginBottom: 15, fontSize: 30}}>Sample Datasets</div>
          <img src="http://t1.snu.ac.kr/vis/mempool_icon.png" style={{width: 120}} />
          <div style={{color: "rgb(100, 100, 100)", marginTop: 10, marginBottom: 10, fontSize: 20}}>Tendermint Mempool Datasets</div>
          <a href="http://t1.snu.ac.kr/vis/data.csv"><img id="download_btn" src="http://t1.snu.ac.kr/vis/b1.png" /></a>
        </div>
      </div>
      <div id="profile_view" style={{width: 240, height: 1200, marginRight: 10, border: "1px solid #999"}}>
        <h2>&nbsp;Node List (29)</h2>
      </div>
      <div style={{width: 1000}}>
        <MempoolView
          data={json_data}
        />
      </div>
    </div>
	)
};

export default Mainplot;
