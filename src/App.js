import React from "react";
import MainView from "./components/MainView";
import "./App.css";

function App() {
  return (
    <div class="App">
      <div onclick="location.href='http://t1.snu.ac.kr:3000'" style={{display: "flex", justifyContent: "space-between", width: 1562, height: 36, padding: 4, paddingLeft: 16, paddingRight: 16, background: "#555", color: "white", fontFamily: "'Roboto', san-serif", fontSize: 24, fontVariant: "small-caps"}}>
          <div style={{textAlign: "left", color: "#DDD"}}><img width="18" src="http://t1.snu.ac.kr/vis/mempool_icon.png" />&nbsp;<span style={{color: "#F7F7F7"}}>M</span>empoolizer</div>
          <div style={{textAlign: "right", paddingRight: 2}}>An interactive visual analyzer for the blockchain mempool system</div>
      </div>
      <div>
        <MainView />
      </div>
    </div>
  );
}

export default App;
