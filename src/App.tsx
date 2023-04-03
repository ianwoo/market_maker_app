import { useState } from "react";
import AlgoControl from "./components/AlgoControl";
import HomePanel from "./components/HomePanel";
import Intervention from "./components/Intervention";
import "./global.scss";

const tabs = ["Home Panel", "Algos Control", "Intervention Control"];

const components = [<HomePanel />, <AlgoControl />, <Intervention />];

const websocket = new WebSocket("ws://192.168.1.102:8055");

function App() {
  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(0);

  // websocket.onmessage = (event) => {
  //   console.log(event.data);
  // };

  return (
    <div className="App">
      <div className="tabs">
        {tabs.map((tab, i) => (
          <div
            key={i}
            className={"tab" + (selectedTabIdx === i ? " selected" : "")}
            onClick={() => setSelectedTabIdx(i)}
          >
            <span>{tab}</span>
          </div>
        ))}
      </div>
      <div className="component">{components[selectedTabIdx]}</div>
    </div>
  );
}

export default App;
