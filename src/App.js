import React from "react";
import MainView from "./components/MainView";
import dataset from "./data/dataset.csv";
import "./App.css";

function App() {
  return (
    <div class="App">
      <div style={{padding: 20, background: "#555", color: "white", fontFamily: "'Roboto', san-serif", fontSize: 30, fontVariant: "small-caps"}}>
        Mempoolizer
      </div>
      <div>
        <MainView dataset={dataset} />
      </div>
    </div>
  );
}

export default App;
