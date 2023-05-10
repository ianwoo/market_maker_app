import { useState } from "react";
import AlgoControl from "./components/AlgoControl";
import HomePanel from "./components/HomePanel";
import Intervention from "./components/Intervention";
import "./global.scss";
import Login from "./components/Login";

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
  external_bid?: [number, number][]; //tuple: [price, supply]
  external_ask?: [number, number][]; //tuple: [price, supply]
};

const tabs = ["Home Panel", "Algos Control", "Intervention Control"];

const websocket = new WebSocket("ws://192.168.1.102:8055");

function App() {
  const [socketOpen, setSocketOpen] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [selectedTabIdx, setSelectedTabIdx] = useState<number>(0);
  const [accountUpdate, setAccountUpdate] = useState<AccountUpdate[]>([]);
  const [orderBookUpdate, setOrderBookUpdate] = useState<OrderBookUpdate[]>([]);

  websocket.addEventListener("open", () => {
    setSocketOpen(true);
  });

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    message.type === "ACCOUNT_UPDATE_REQ" && setAccountUpdate(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE_REQ" && setOrderBookUpdate(JSON.parse(message.content));
    message.type === "ACCOUNT_UPDATE" && setAccountUpdate(JSON.parse(message.content));
    message.type === "ORDER_BOOK_UPDATE" && setOrderBookUpdate(JSON.parse(message.content));
    if (message.action === "2FA" && message.result) {
      console.log("success!");
      setLoggedIn(true);
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
  };

  const components = [
    <HomePanel key="home" accountUpdate={accountUpdate} />,
    // note: taking upper price (first price above spot) and lower price (first price below spot) from EXTERNAL orderbook which is always index 0
    <AlgoControl
      key="control"
      websocket={websocket}
      orderBook={orderBookUpdate[1]} //this needs to change once we activate more than just one mm account
      accountUpdate={accountUpdate}
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
        {loggedIn &&
          tabs.map((tab, i) => (
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
      <div className="component">
        {!loggedIn && socketOpen && <Login websocket={websocket} />}
        {loggedIn && components[selectedTabIdx]}
      </div>
    </div>
  );
}

export default App;
