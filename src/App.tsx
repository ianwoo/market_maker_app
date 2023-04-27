import { useEffect, useState } from "react";
import AlgoControl from "./components/AlgoControl";
import HomePanel from "./components/HomePanel";
import Intervention from "./components/Intervention";
import "./global.scss";

export type AccountUpdate = {
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

  useEffect(() => {
    if (websocket.readyState === 1) {
      websocket.send(
        JSON.stringify({
          action: "ORDER_BOOK_UPDATE_REQ",
        })
      );
      websocket.send(
        JSON.stringify({
          action: "ACCOUNT_UPDATE_REQ",
        })
      );
    }
  }, []);

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    message.type === "ACCOUNT_UPDATE_REQ" && setAccountUpdate(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE_REQ" && setOrderBookUpdate(JSON.parse(message.content));
    message.type === "ACCOUNT_UPDATE" && setAccountUpdate(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE" && setOrderBookUpdate(JSON.parse(message.content));
  };

  const components = [
    <HomePanel key="home" accountUpdate={accountUpdate} />,
    // note: taking upper price (first price above spot) and lower price (first price below spot) from EXTERNAL orderbook which is always index 0
    <AlgoControl
      key="control"
      websocket={websocket}
      spotPrice={accountUpdate.length > 0 ? accountUpdate[0].price : 0}
      orderBook={orderBookUpdate[0]}
    />,
    accountUpdate.length > 0 ? (
      <Intervention
        key="intervention"
        orderBookUpdate={orderBookUpdate}
        accountUpdate={accountUpdate}
        websocket={websocket}
      />
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
            // conditions are to ensure websocket packages are received before switching component
            onClick={() => accountUpdate.length > 0 && orderBookUpdate.length > 0 && setSelectedTabIdx(i)}
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
