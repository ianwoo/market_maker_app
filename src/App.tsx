import { useState } from "react";
import AlgoControl from "./components/AlgoControl";
import HomePanel from "./components/HomePanel";
import Intervention from "./components/Intervention";
import "./global.scss";

type AccountUpdate = {
  account: string;
  coin: string;
  exchange: string;
  total: string;
  free: string;
  locked: string;
  price: number;
};

export type OrderBookUpdate = {
  exchange?: string;
  obtype: string;
  account?: string;
  bid: [number, number][]; //tuple: [price, supply]
  ask: [number, number][]; //tuple: [price, supply]
};

const tabs = ["Home Panel", "Algos Control", "Intervention Control"];

const websocket = new WebSocket("ws://192.168.1.102:8055");

function App() {
  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(0);
  const [accountUpdate, setAccountUpdate] = useState<AccountUpdate[]>([]);
  const [orderBookUpdate, setOrderBookUpdate] = useState<OrderBookUpdate[]>([]);

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    message.type === "ACCOUNT_UPDATE" && setAccountUpdate(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE" && setOrderBookUpdate(JSON.parse(message.content));
  };

  const components = [
    <HomePanel accountUpdate={accountUpdate} />,
    // note: taking upper price (first price above spot) and lower price (first price below spot) from EXTERNAL orderbook which is always index 0
    <AlgoControl
      websocket={websocket}
      spotPrice={accountUpdate[0].price}
      upperPrice={[...orderBookUpdate[0].ask].sort((a, b) => a[0] - b[0])[0][0]}
      lowerPrice={[...orderBookUpdate[0].bid].sort((a, b) => b[0] - a[0])[0][0]}
    />,
    accountUpdate.length > 0 ? (
      <Intervention orderBookUpdate={orderBookUpdate} spotPrice={accountUpdate[0].price} websocket={websocket} />
    ) : (
      <div>Loading...</div>
    ),
  ];

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
