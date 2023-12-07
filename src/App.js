import React from "react";
import MainView from "./components/MainView";
import "./App.css";

function App() {
  return (
    <div class="App">
      <div style={{padding: 20, background: "#555", color: "white", fontFamily: "'Roboto', san-serif", fontSize: 30, fontVariant: "small-caps"}}>
        Mempoolizer
      </div>
      <div>
        <MainView />
      </div>
    </div>
  );
}

export default App;
